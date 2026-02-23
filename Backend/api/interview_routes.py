from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import Optional
import shutil
import uuid
import os
from pathlib import Path
from datetime import datetime

from database.connection import get_database
from database.job_posting_crud import get_job_posting_by_id, create_job_cv_file, add_cv_to_job
from cv_screener.cv_parser import parse_cv_file
from cv_screener.cv_extractor import extract_cv_information
from database.crud import create_interview_cv

# Import the new service
from services.interview_service import InterviewService, InterviewServiceContext

router = APIRouter(prefix="/interview", tags=["Interview"])

@router.post("/start-interview/{job_id}")
async def start_interview(
    job_id: str,
    cv_file: UploadFile = File(...),
    candidate_name: str = Form(...),
    email_address: str = Form(...),
    phone_number: str = Form(...),
    linkedin_profile: Optional[str] = Form(None),
    db=Depends(get_database)
):
    """
    Start a new interview by:
    1. Parsing the CV into structured JSON
    2. Fetching the Job Description
    3. Initializing the Interview Service state
    """
    try:
        # 1. Fetch Job Description
        job = await get_job_posting_by_id(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job posting not found")
            
        job_description = job.get("job_description", "")
        required_skills = job.get("skills", [])
        extra_instructions = job.get("extra_instructions", "Keep the interview conversational and focused on the job description.")

        # 2. Save and Parse CV
        session_id = str(uuid.uuid4())
        
        if not cv_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
            
        upload_dir = Path("uploads/interview_cvs")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{session_id}_{timestamp}_{cv_file.filename}"
        file_path = upload_dir / safe_filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
            
        # Parse text from CV
        try:
            cv_text = parse_cv_file(str(file_path))
        except Exception as e:
            print(f"Failed to parse CV text: {e}")
            cv_text = ""
            
        # Parse structured CV info required by the LLM
        cv_json = {}
        try:
            # We use an internal function or groq to structure the CV
            raw_json_str = extract_cv_information(cv_text) 
            import json
            if isinstance(raw_json_str, str):
                # Attempt to parse json structure out of the string
                import re
                json_match = re.search(r"\{.*\}", raw_json_str, re.DOTALL)
                if json_match:
                    cv_json = json.loads(json_match.group(0))
                else:
                    cv_json = {"summary": cv_text[:1000]}
            else:
                cv_json = raw_json_str
        except Exception as e:
            print(f"Failed structured extraction: {e}")
            cv_json = {"summary": cv_text[:1000]}

        # Store CV in Database
        try:
            with open(file_path, "rb") as f:
                file_content = f.read()
            
            cv_file_id = await create_job_cv_file(
                db, 
                job_id, 
                cv_file.filename, 
                file_content, 
                len(file_content)
            )
            await add_cv_to_job(db, job_id, cv_file_id)
        except Exception as e:
            print(f"Failed to store CV in database: {e}")
            cv_file_id = None

        # Store Candidate Info
        cv_data = {
            "candidate_name": candidate_name,
            "email_address": email_address,
            "phone_number": phone_number,
            "linkedin": linkedin_profile,
            "cv_file_path": str(file_path),
            "job_id": job_id,
            "cv_text": cv_text[:2000] 
        }
        
        # We reuse the create_interview_cv crud function for the candidate data
        candidate_obj_id = await create_interview_cv(db, session_id, cv_data)
        
        # 3. Create context and initialize session
        context = InterviewServiceContext(
            candidate_name=candidate_name,
            candidate_cv_json=cv_json,
            job_description=job_description,
            required_skills=required_skills,
            recruiter_extra_instructions=extra_instructions
        )
        
        # Instantiate service and create session
        # We need a global instance or pass it in. For FastAPI we might create it per request
        # but to keep state we need a singleton. So we import it from main.
        from main import get_interview_service
        service = get_interview_service()
        
        new_session_id = await service.initialize_session(context, job_id, str(candidate_obj_id))
        
        # Get the first question asynchronously
        # We process 'INIT' to trigger the greeting behavior
        full_response = ""
        async for chunk in service.process_input(new_session_id, "INIT"):
            full_response += chunk
            
        return {
            "success": True,
            "message": "Interview sequence initiated",
            "session_id": new_session_id,
            "candidate_name": candidate_name,
            "job_title": job.get("title", job.get("interview_field", "General Position")),
            "question": full_response,
            "total_questions": 5, # Can be dynamic later
            "current_question": 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/next-question")
async def next_question(
    session_id: str = Form(...),
    db=Depends(get_database)
):
    """Fallback if we want to explicitly advance the interview without an answer"""
    from main import get_interview_service
    service = get_interview_service()
    
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Process empty or continue prompt
    full_response = ""
    async for chunk in service.process_input(session_id, "Please continue with the next question."):
        full_response += chunk
        
    return {
         "success": True,
         "complete": session.stage.value == "finished",
         "session_id": session_id,
         "question": full_response
    }


@router.post("/submit-answer")
async def submit_answer(
    session_id: str = Form(...),
    audio_file: Optional[UploadFile] = File(None),
    text_answer: Optional[str] = Form(None),
    db=Depends(get_database)
):
    from main import get_interview_service
    service = get_interview_service()
    
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    answer_text = None
    
    if audio_file:
        content = await audio_file.read()
        try:
            answer_text = await service.transcribe_audio(content)
        except Exception as e:
            print(f"Transcription error: {e}")
            answer_text = text_answer or "I couldn't understand that."
            
    if not answer_text and text_answer:
         answer_text = text_answer
         
    if not answer_text:
        raise HTTPException(status_code=400, detail="No answer provided")
        
    # Process answer with LLM streaming back (we accumulate here for the REST response)
    full_response = ""
    async for chunk in service.process_input(session_id, answer_text):
        full_response += chunk
        
    # We maintain dummy feedback / score formats for compatibility with frontend,
    # or rely solely on conversational progression.
    is_complete = session.stage.value == "finished"
    
    return {
        "success": True,
        "feedback": "Processed.",
        "score": 0, # Could be evaluated in real-time or mocked
        "current_question": len([x for x in session.transcript if x["role"] == "interviewer"]),
        "total_questions": 5,
        "is_complete": is_complete,
        "next_question": full_response
    }


@router.post("/generate-report/{session_id}")
async def generate_report(session_id: str, db=Depends(get_database)):
    # This might already be done automatically in the service upon FINISHED state
    return {
        "success": True,
        "session_id": session_id,
        "report_path": "",
        "summary": {
            "eval_msg": "Evaluation saved directly to the database for recruiter view."
        }
    }
