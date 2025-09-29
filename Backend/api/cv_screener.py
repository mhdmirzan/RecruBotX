from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import tempfile
import time
import hashlib

from database.db import SessionLocal
from models.cv_screener import CVSimilarity
from cv_screener.embedding import CVEmbedder
from cv_screener.matcher import Matcher
from cv_screener.pdf_parser import CVParser
from groq import Groq

# TODO: Add your Groq API key to your .env file and load it here
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

router = APIRouter()

def generate_batch_id() -> int:
    """Generate a unique integer ID for a batch of CVs"""
    # Use current timestamp in milliseconds and convert to integer
    # This will work with BIGINT column type
    timestamp_ms = int(time.time() * 1000)
    return timestamp_ms

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/screen_cvs/")
async def screen_cvs(
    cv_files: List[UploadFile] = File(...),
    job_description_file: Optional[UploadFile] = File(default=None),
    job_description_text: Optional[str] = Form(default=None),
    db: Session = Depends(get_db)
):
    if not cv_files:
        raise HTTPException(status_code=400, detail="At least one CV file must be uploaded.")
    
    # Check if job_description_file is actually provided (not empty or None)
    has_job_file = job_description_file is not None and hasattr(job_description_file, 'filename') and job_description_file.filename
    has_job_text = job_description_text is not None and job_description_text.strip()
    
    # Validate that either job description file or text is provided
    if not has_job_file and not has_job_text:
        raise HTTPException(status_code=400, detail="Either job_description_file or job_description_text must be provided.")
    
    if has_job_file and has_job_text:
        raise HTTPException(status_code=400, detail="Provide either job_description_file or job_description_text, not both.")
    
    # Validate file types for job description if file is provided
    if has_job_file and not (job_description_file.filename.endswith('.pdf') or job_description_file.filename.endswith('.txt')):
        raise HTTPException(status_code=400, detail="Job description file must be a PDF or TXT file.")
    
    # Validate CV files
    for cv_file in cv_files:
        if not cv_file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"CV file {cv_file.filename} must be a PDF file.")

    temp_files = []
    
    try:
        # Generate unique batch ID for this screening session
        batch_id = generate_batch_id()
        
        # Process job description
        if has_job_file:
            # Determine file type and process accordingly
            if job_description_file.filename.endswith('.pdf'):
                # Save the uploaded PDF job description to a temporary file
                jd_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                shutil.copyfileobj(job_description_file.file, jd_temp)
                jd_temp.close()
                temp_files.append(jd_temp.name)
                
                # Parse PDF to get text
                cv_parser = CVParser()
                jd_parsed = cv_parser.parse_pdf(jd_temp.name)
                jd_text = jd_parsed.full_text
            elif job_description_file.filename.endswith('.txt'):
                # Read text file directly
                jd_text = (await job_description_file.read()).decode('utf-8')
        else:
            # Use provided text directly
            jd_text = job_description_text

        # Save uploaded CV files to temporary files
        cv_temp_paths = {}
        for cv_file in cv_files:
            cv_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            shutil.copyfileobj(cv_file.file, cv_temp)
            cv_temp.close()
            cv_temp_paths[cv_file.filename] = cv_temp.name
            temp_files.append(cv_temp.name)

        # Initialize components
        cv_parser = CVParser()
        matcher = Matcher()

        # Process CVs
        parsed_cvs = cv_parser.batch_parse_pdf_files(list(cv_temp_paths.values()))
        
        # Prepare data for matcher
        cv_names = []
        cv_texts = []
        for original_filename, temp_path in cv_temp_paths.items():
            if temp_path in parsed_cvs:
                cv_names.append(original_filename)
                cv_texts.append(parsed_cvs[temp_path].full_text)

        # Use matcher to get results
        match_results = matcher.match(cv_names, cv_texts, jd_text)
        
        # Convert to the expected format and store in database
        results = {}
        for result in match_results:
            # Convert numpy.float32 to regular Python float
            score = float(result['score'])
            results[result['filename']] = score

            # Find the CV text corresponding to the current result
            cv_text_for_llm = ""
            try:
                cv_index = cv_names.index(result['filename'])
                cv_text_for_llm = cv_texts[cv_index]
            except ValueError:
                # Handle case where filename is not found, though it should be
                pass

            missing_skills_str = ""
            if cv_text_for_llm:
                # Use Groq to get missing skills
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert CV analyst. Your task is to identify the only skills mentioned in the job description that are missing from the CV. List ONLY the missing skills as a comma-separated string. Do not include any other text, explanations, or formatting. Example output: 'Python, SQL, Project Management'. If no skills are missing, return exactly this: '' (empty string)."
                        },
                        {
                            "role": "user",
                            "content": f"Analyze the following CV and Job Description.\n\nCV Content:\n{cv_text_for_llm}\n\nJob Description:\n{jd_text}",
                        }
                    ],
                    model="llama-3.1-8b-instant",
                )
                missing_skills_str = chat_completion.choices[0].message.content
            
            # Store in database
            db_entry = CVSimilarity(
                cv_filename=result['filename'],
                job_description_id=batch_id,
                score=score,
                missing_skills=missing_skills_str
            )
            db.add(db_entry)
        
        db.commit()

        # Sort results by score in descending order
        sorted_results = sorted(results.items(), key=lambda item: item[1], reverse=True)

        return {
            "message": "CVs screened successfully", 
            "total_cvs_processed": len(cv_files),
            "job_description_source": "file" if has_job_file else "text",
            "batch_id": batch_id,
            "top_matches": sorted_results
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")
    
    finally:
        # Clean up all temporary files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except OSError:
                pass  # File might already be deleted

@router.get("/cv_results/{batch_id}")
async def get_cv_results(batch_id: int, db: Session = Depends(get_db)):
    """Get stored CV screening results for a specific batch"""
    results = db.query(CVSimilarity).filter(
        CVSimilarity.job_description_id == batch_id
    ).order_by(CVSimilarity.score.desc()).all()
    
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this batch")
    
    return {
        "batch_id": batch_id,
        "total_results": len(results),
        "results": [
            {
                "cv_filename": result.cv_filename,
                "score": result.score,
                "created_at": result.created_at
            }
            for result in results
        ]
    }

@router.get("/cv_results/")
async def get_all_cv_results(db: Session = Depends(get_db)):
    """Get all stored CV screening results"""
    results = db.query(CVSimilarity).order_by(
        CVSimilarity.job_description_id,
        CVSimilarity.score.desc()
    ).all()
    
    return {
        "total_results": len(results),
        "results": [
            {
                "id": result.id,
                "cv_filename": result.cv_filename,
                "batch_id": result.job_description_id,
                "score": result.score,
                "created_at": result.created_at
            }
            for result in results
        ]
    }

@router.post("/cv/recommendations/")
async def get_cv_recommendations(
    cv_file: UploadFile = File(...),
    job_description_file: Optional[UploadFile] = File(default=None),
    job_description_text: Optional[str] = Form(default=None)
):
    if not cv_file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="CV file must be a PDF file.")

    temp_files = []
    try:
        # Save the uploaded CV to a temporary file
        cv_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        shutil.copyfileobj(cv_file.file, cv_temp)
        cv_temp.close()
        temp_files.append(cv_temp.name)

        # Parse the CV to get its text content
        cv_parser = CVParser()
        parsed_cv = cv_parser.parse_pdf(cv_temp.name)
        cv_text = parsed_cv.full_text

        # Process job description if provided
        jd_text = ""
        has_job_file = job_description_file is not None and hasattr(job_description_file, 'filename') and job_description_file.filename
        has_job_text = job_description_text is not None and job_description_text.strip()

        if has_job_file or has_job_text:
            if has_job_file and has_job_text:
                raise HTTPException(status_code=400, detail="Provide either job_description_file or job_description_text, not both.")
            
            if has_job_file:
                if not (job_description_file.filename.endswith('.pdf') or job_description_file.filename.endswith('.txt')):
                    raise HTTPException(status_code=400, detail="Job description file must be a PDF or TXT file.")
                
                if job_description_file.filename.endswith('.pdf'):
                    jd_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                    shutil.copyfileobj(job_description_file.file, jd_temp)
                    jd_temp.close()
                    temp_files.append(jd_temp.name)
                    
                    jd_parser = CVParser()
                    jd_parsed = jd_parser.parse_pdf(jd_temp.name)
                    jd_text = jd_parsed.full_text
                elif job_description_file.filename.endswith('.txt'):
                    jd_text = (await job_description_file.read()).decode('utf-8')
            else:
                jd_text = job_description_text

        # Build the prompt for Groq
        if jd_text:
            prompt = f"""Analyze the following CV in the context of the provided Job Description. Provide personalized recommendations for the candidate, highlighting how their skills and experience align with the job requirements. Identify any missing skills and suggest areas for improvement to better fit the role.\n\nCV Content:\n{cv_text}\n\nJob Description:\n{jd_text}"""
        else:
            prompt = f"""Analyze the following CV and provide personalized recommendations for career development, skills to acquire, and potential job roles that would be a good fit. Highlight the candidate's strengths and areas for improvement.\n\nCV Content:\n{cv_text}"""

        # Use Groq to get personalized recommendations
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
        )

        recommendations = chat_completion.choices[0].message.content

        return {
            "message": "CV recommendations generated successfully",
            "cv_filename": cv_file.filename,
            "recommendations": recommendations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    finally:
        # Clean up all temporary files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except OSError:
                pass  # File might already be deleted
