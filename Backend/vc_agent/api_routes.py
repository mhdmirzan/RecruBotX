"""
Voice Interview API Routes
Provides REST API endpoints for voice-based interview system
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import tempfile
import json
from pathlib import Path
import asyncio
import shutil
from datetime import datetime
from bson import ObjectId

# Import from parent directory
import sys
sys.path.append(str(Path(__file__).parent.parent))
from vc_agent.voice_agent import VoiceAgent
from cv_screener.cv_parser import parse_cv_file
from cv_screener.cv_extractor import extract_cv_information
from database.connection import get_database
from database.crud import create_interview_cv

router = APIRouter(prefix="/voice-interview", tags=["Voice Interview"])

# Store active interview sessions (in production, use Redis or database)
active_sessions: Dict[str, VoiceAgent] = {}


class InterviewConfig(BaseModel):
    interview_field: str
    position_level: str
    num_questions: int = 5
    session_id: Optional[str] = None


class AnswerSubmission(BaseModel):
    session_id: str
    audio_data: Optional[str] = None  # base64 encoded audio
    text_answer: Optional[str] = None  # for testing without audio


class InterviewStatus(BaseModel):
    session_id: str
    current_question: int
    total_questions: int
    questions_asked: List[str]
    avg_score: float


from database.job_posting_crud import get_job_posting_by_id, create_job_cv_file, add_cv_to_job

@router.post("/initiate")
async def initiate_interview(
    job_id: str = Form(...),
    cv_file: UploadFile = File(...),
    candidate_name: str = Form(...),
    email_address: str = Form(...),
    phone_number: str = Form(...),
    linkedin_profile: Optional[str] = Form(None),
    db=Depends(get_database)
):
    """
    Initiate a context-aware voice interview for a specific job application.
    
    1. Fetches Job Description from Job ID.
    2. Parses uploaded CV.
    3. Initializes VoiceAgent with CV + JD context.
    4. Returns session_id.
    """
    try:
        # 1. Fetch Job Description
        job = await get_job_posting_by_id(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job posting not found")
        
        job_description = job.get("job_description", "")
        interview_field = job.get("interview_field", "General")
        position_level = job.get("position_level", "Intermediate")
        
        # 2. Save and Parse CV
        import uuid
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
            
        print(f"[INFO] CV file saved: {file_path}")
        
        # Parse text from CV for Context
        try:
            cv_text = parse_cv_file(str(file_path))
        except Exception as e:
            print(f"⚠️ Failed to parse CV text: {e}")
            cv_text = ""

        # Parse CV using Gemini Flash 2.5 for structured extraction with timeout
        parsed_cv = None
        if cv_text:
            try:
                print(f"[INFO] Parsing CV with Gemini Flash 2.5 (with timeout)...")
                loop = asyncio.get_running_loop()
                parsed_cv = await asyncio.wait_for(
                    loop.run_in_executor(None, extract_cv_information, cv_text),
                    timeout=15.0,
                )
                print(f"[INFO] CV parsed successfully: {len(parsed_cv.get('skills', []))} skills, {len(parsed_cv.get('education', []))} education entries")
            except asyncio.TimeoutError:
                print("⚠️ CV parsing with Gemini Flash 2.5 timed out; continuing without structured CV data.")
                parsed_cv = None
            except Exception as e:
                print(f"⚠️ Failed to parse CV with AI: {e}")
                parsed_cv = None

        # Store CV in Database (job_cv_files) and Link to Job
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
            print(f"[INFO] CV stored in DB ({cv_file_id}) and linked to Job ({job_id})")
            
        except Exception as e:
            print(f"⚠️ Failed to store CV in database: {e}")
            cv_file_id = None

        # 3. Store Candidate/Application Data with parsed CV
        cv_data = {
            "candidate_name": candidate_name,
            "email_address": email_address,
            "phone_number": phone_number,
            "linkedin": linkedin_profile,
            "cv_file_path": str(file_path),
            "job_id": job_id,
            "cv_text": cv_text[:2000],  # Store snippet
            "parsed_cv": parsed_cv  # Structured CV data from Gemini
        }
        
        cv_id = await create_interview_cv(db, session_id, cv_data)
        
        # 4. Initialize Context-Aware Voice Agent
        # Get question count preference or default
        num_questions = 5 # Default
        
        agent = VoiceAgent(
            interview_field=interview_field,
            position_level=position_level,
            num_questions=num_questions,
            job_description=job_description,
            cv_text=cv_text
        )
        
        active_sessions[session_id] = agent
        
        # Generate first question immediately
        agent.question_count = 1
        first_question = agent.generate_question()
        
        return {
            "success": True,
            "session_id": session_id,
            "job_title": job.get("interview_field"), # Using field as title if title missing
            "candidate_name": candidate_name,
            "total_questions": num_questions,
            "current_question": 1,
            "question": first_question,
            "message": "Context-aware interview started successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to initiate interview: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to initiate interview: {str(e)}")


@router.post("/start-session-with-cv")
async def start_interview_with_cv(
    cv_file: UploadFile = File(...),
    interview_field: str = Form(...),
    position_level: str = Form(...),
    num_questions: int = Form(5),
    candidate_name: str = Form(...),
    phone_number: str = Form(...),
    email_address: str = Form(...),
    education: str = Form(...),
    projects: str = Form(...),
    skills: str = Form(...),
    experience: str = Form(...)
):
    """
    Initialize a new voice interview session with CV upload and candidate details.
    Saves CV file and all candidate information to database.
    Returns session_id and first question.
    """
    try:
        # Generate unique session ID
        import uuid
        session_id = str(uuid.uuid4())
        
        # Validate CV file is PDF
        if not cv_file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")
        
        # Create upload directory if it doesn't exist
        upload_dir = Path("uploads/interview_cvs")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Save CV file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{session_id}_{timestamp}_{cv_file.filename}"
        file_path = upload_dir / safe_filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
        
        print(f"[INFO] CV file saved: {file_path}")
        
        # Prepare candidate data for database (using manual input from form)
        cv_data = {
            "candidate_name": candidate_name,
            "phone_number": phone_number,
            "email_address": email_address,
            "education": [e.strip() for e in education.split('\n') if e.strip()],
            "projects": [p.strip() for p in projects.split('\n') if p.strip()],
            "skills": [s.strip() for s in skills.split(',') if s.strip()],
            "experience": experience,
            "cv_file_name": cv_file.filename,
            "cv_file_path": str(file_path),
            "interview_field": interview_field,
            "position_level": position_level
        }
        
        # Store in database
        print("[INFO] Storing candidate data and CV in database...")
        db = await get_database()
        cv_id = await create_interview_cv(db, session_id, cv_data)
        print(f"[INFO] Stored candidate data with CV ID: {cv_id}")
        
        # Initialize voice agent
        agent = VoiceAgent(
            interview_field=interview_field,
            position_level=position_level,
            num_questions=num_questions
        )
        
        # Store session
        active_sessions[session_id] = agent
        
        # Generate first question
        agent.question_count = 1
        first_question = agent.generate_question()
        
        return {
            "success": True,
            "session_id": session_id,
            "cv_id": cv_id,
            "interview_field": interview_field,
            "position_level": position_level,
            "total_questions": num_questions,
            "current_question": 1,
            "question": first_question,
            "candidate_details": {
                "name": candidate_name,
                "email": email_address,
                "phone": phone_number,
                "cv_filename": cv_file.filename
            },
            "message": "Interview session started successfully with candidate details and CV saved"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to start session: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")


@router.post("/start-session")
async def start_interview_session(config: InterviewConfig):
    """
    Initialize a new voice interview session
    Returns session_id and first question
    """
    try:
        # Generate unique session ID
        import uuid
        session_id = config.session_id or str(uuid.uuid4())
        
        # Initialize voice agent
        agent = VoiceAgent(
            interview_field=config.interview_field,
            position_level=config.position_level,
            num_questions=config.num_questions
        )
        
        # Store session
        active_sessions[session_id] = agent
        
        # Generate first question
        agent.question_count = 1
        first_question = agent.generate_question()
        
        return {
            "success": True,
            "session_id": session_id,
            "interview_field": config.interview_field,
            "position_level": config.position_level,
            "total_questions": config.num_questions,
            "current_question": 1,
            "question": first_question,
            "message": "Interview session started successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")


@router.post("/next-question")
async def get_next_question(session_id: str):
    """
    Get the next question in the interview
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = active_sessions[session_id]
    
    # Check if interview is complete
    if agent.question_count >= agent.max_questions:
        return {
            "success": True,
            "complete": True,
            "message": "Interview completed",
            "current_question": agent.question_count,
            "total_questions": agent.max_questions
        }
    
    try:
        # Increment and generate next question
        agent.question_count += 1
        next_question = agent.generate_question()
        
        return {
            "success": True,
            "complete": False,
            "session_id": session_id,
            "current_question": agent.question_count,
            "total_questions": agent.max_questions,
            "question": next_question
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate question: {str(e)}")


@router.post("/submit-answer")
async def submit_answer(
    session_id: str = Form(...),
    audio_file: Optional[UploadFile] = File(None),
    text_answer: Optional[str] = Form(None)
):
    """
    Submit an answer (either audio or text) and get feedback
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = active_sessions[session_id]
    
    # Get current question
    if not agent.interview_data["questions"]:
        raise HTTPException(status_code=400, detail="No question has been asked yet")
    
    current_question = agent.interview_data["questions"][-1] if agent.interview_data["questions"] else ""
    
    try:
        answer_text = None
        
        # Process audio file if provided
        if audio_file:
            # Save temporary audio file
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio.close()
            
            try:
                # Use Deepgram to transcribe audio
                from deepgram import DeepgramClient, PrerecordedOptions
                import os
                
                deepgram_key = os.getenv('DEEPGRAM_API_KEY')
                if not deepgram_key:
                    raise HTTPException(status_code=500, detail="Deepgram API key not configured")
                
                deepgram = DeepgramClient(deepgram_key)
                
                with open(temp_audio.name, 'rb') as audio:
                    source = {'buffer': audio.read(), 'mimetype': 'audio/webm'}
                    
                    options = PrerecordedOptions(
                        model="nova-2",
                        smart_format=True,
                        punctuate=True
                    )
                    
                    response = deepgram.listen.rest.v('1').transcribe_file(source, options)
                    
                    # Extract transcription
                    if response.results and response.results.channels:
                        transcript = response.results.channels[0].alternatives[0].transcript
                        answer_text = transcript.strip() if transcript else None
                    
                    if not answer_text or len(answer_text) < 3:
                        answer_text = text_answer or "I couldn't understand that."
                        
            except Exception as e:
                print(f"⚠️ Deepgram transcription error: {e}")
                # Fallback to text answer if provided
                answer_text = text_answer or "Audio transcription failed. Please try again or type your answer."
            finally:
                # Clean up temp file
                try:
                    os.unlink(temp_audio.name)
                except:
                    pass
        
        # Use text answer if no audio
        if not answer_text:
            answer_text = text_answer
        
        if not answer_text:
            raise HTTPException(status_code=400, detail="No answer provided")
        
        # Store answer
        agent.interview_data["answers"].append(answer_text)
        
        # Analyze answer
        feedback = agent.analyze_answer(current_question, answer_text)
        agent.interview_data["feedback"].append(feedback)
        
        # Extract score
        score = agent.interview_data["scores"][-1] if agent.interview_data["scores"] else 0
        
        return {
            "success": True,
            "feedback": feedback,
            "score": score,
            "current_question": agent.question_count,
            "total_questions": agent.max_questions,
            "is_complete": agent.question_count >= agent.max_questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process answer: {str(e)}")


@router.get("/session-status/{session_id}")
async def get_session_status(session_id: str):
    """
    Get current status of an interview session
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = active_sessions[session_id]
    
    avg_score = sum(agent.interview_data["scores"]) / len(agent.interview_data["scores"]) \
        if agent.interview_data["scores"] else 0
    
    return {
        "success": True,
        "session_id": session_id,
        "interview_field": agent.interview_type,
        "position_level": agent.position_level,
        "current_question": agent.question_count,
        "total_questions": agent.max_questions,
        "questions_asked": agent.interview_data["questions"],
        "answers_given": agent.interview_data["answers"],
        "scores": agent.interview_data["scores"],
        "avg_score": round(avg_score, 1),
        "is_complete": agent.question_count >= agent.max_questions
    }


@router.post("/generate-report/{session_id}")
async def generate_report(session_id: str, db=Depends(get_database)):
    """
    Generate final interview report and save to database
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = active_sessions[session_id]
    
    try:
        # Generate report
        report_path = agent.generate_report()
        
        # Calculate final metrics
        avg_score = sum(agent.interview_data["scores"]) / len(agent.interview_data["scores"]) \
            if agent.interview_data["scores"] else 0
        
        # Get performance level
        performance_level = agent._get_performance_level(avg_score)
        
        # Get strengths and improvements
        strengths, improvements = agent._analyze_performance()
        
        # Prepare data for database
        report_data = {
            "report_path": str(report_path),
            "avg_score": round(avg_score, 1),
            "performance_level": performance_level,
            "strengths": strengths,
            "improvements": improvements,
            "questions": agent.interview_data["questions"],
            "answers": agent.interview_data["answers"],
            "scores": agent.interview_data["scores"],
            "feedback": agent.interview_data["feedback"],
            "completed_at": datetime.utcnow(),
            "status": "Completed"
        }
        
        # Find the interview_cv record for this session
        interview_cv = await db.interview_cvs.find_one({"session_id": session_id})
        
        if interview_cv:
            # Update existing record
            await db.interview_cvs.update_one(
                {"session_id": session_id},
                {"$set": report_data}
            )
            print(f"[INFO] Saved interview report for session {session_id} to database.")
        else:
            print(f"[WARNING] No interview_cv record found for session {session_id}. Report linking failed.")

        return {
            "success": True,
            "session_id": session_id,
            "report_path": report_path,
            "summary": {
                "interview_field": agent.interview_type,
                "position_level": agent.position_level,
                "total_questions": len(agent.interview_data["questions"]),
                "avg_score": round(avg_score, 1),
                "performance_level": performance_level,
                "strengths": strengths,
                "improvements": improvements,
                "questions": agent.interview_data["questions"],
                "answers": agent.interview_data["answers"],
                "scores": agent.interview_data["scores"],
                "feedback": agent.interview_data["feedback"]
            }
        }
        
    except Exception as e:
        print(f"[ERROR] Failed to generate/save report: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@router.delete("/end-session/{session_id}")
async def end_session(session_id: str):
    """
    End and cleanup an interview session
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Remove session
    del active_sessions[session_id]
    
    return {
        "success": True,
        "message": "Session ended successfully"
    }


@router.get("/reports/{job_id}")
async def get_reports_by_job(job_id: str, db=Depends(get_database)):
    """
    Get all interview reports for a specific job
    """
    try:
        # Find all interview CVs for this job that have a report
        cursor = db.interview_cvs.find({"job_id": job_id, "status": "Completed"}).sort("avg_score", -1)
        reports = await cursor.to_list(length=100)
        
        # Convert ObjectIds to strings
        for report in reports:
            report["_id"] = str(report["_id"])
            
        return {
            "success": True,
            "reports": reports
        }
    except Exception as e:
        print(f"[ERROR] Failed to fetch reports: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {str(e)}")

@router.get("/report/{report_id}")
async def get_interview_report(report_id: str, db=Depends(get_database)):
    """
    Get a single interview report by ID
    """
    try:
        report = await db.interview_cvs.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        report["_id"] = str(report["_id"])
        return report
    except Exception as e:
        print(f"[ERROR] Failed to fetch report: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")

@router.get("/available-fields")
async def get_available_fields():
    """
    Get list of available interview fields
    """
    return {
        "success": True,
        "fields": VoiceAgent.FIELDS,
        "levels": VoiceAgent.LEVELS
    }
