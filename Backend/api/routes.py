"""
API Routes for CV Screening with MongoDB Integration
"""

import os
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel

from cv_screener.gemini_screener import GeminiCVScreener
from cv_screener.cv_parser import parse_cv_file
from database.connection import get_database
from database import crud

router = APIRouter()

# Initialize the Gemini screener
screener = GeminiCVScreener()


class JobDescriptionRequest(BaseModel):
    title: str
    content: str


class JobDescriptionResponse(BaseModel):
    id: str
    title: str
    content: str
    is_active: bool
    created_at: str


class CVResponse(BaseModel):
    id: str
    file_name: str
    uploaded_at: str
    file_size: int


class ScreeningResultResponse(BaseModel):
    candidate_name: str
    file_name: str
    overall_score: float
    skills_match: float
    experience_match: float
    education_match: float
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str
    summary: str


# ==================== Job Description Endpoints ====================

@router.post("/upload-jd", response_model=dict)
async def upload_job_description(
    jd_file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
    jd_title: Optional[str] = Form("Untitled Position"),
    db=Depends(get_database)
):
    """
    Upload a Job Description either as a file or text.
    Stores in MongoDB and sets as active.
    """
    jd_content = None
    
    if jd_file:
        content = await jd_file.read()
        try:
            jd_content = content.decode("utf-8")
        except UnicodeDecodeError:
            temp_path = f"temp_{jd_file.filename}"
            with open(temp_path, "wb") as f:
                f.write(content)
            try:
                jd_content = parse_cv_file(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
    elif jd_text:
        jd_content = jd_text
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a file or text for the job description"
        )
    
    # Deactivate all previous JDs
    await crud.deactivate_all_job_descriptions(db)
    
    # Create new active JD
    jd_id = await crud.create_job_description(db, jd_title, jd_content)
    
    return {
        "message": "Job description uploaded successfully",
        "id": jd_id,
        "title": jd_title,
        "preview": jd_content[:500] + "..." if len(jd_content) > 500 else jd_content
    }


@router.get("/current-jd")
async def get_current_job_description(db=Depends(get_database)):
    """Get the currently active job description."""
    jd = await crud.get_active_job_description(db)
    
    if not jd:
        raise HTTPException(status_code=404, detail="No active job description found")
    
    return {
        "id": jd["_id"],
        "title": jd.get("title", "Untitled"),
        "content": jd["content"],
        "created_at": jd["created_at"].isoformat()
    }


@router.get("/job-descriptions/{jd_id}")
async def get_job_description(jd_id: str, db=Depends(get_database)):
    """Get a specific job description by ID."""
    jd = await crud.get_job_description(db, jd_id)
    
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    return jd


# ==================== CV Upload Endpoints ====================

@router.post("/upload-cvs")
async def upload_cvs(
    files: List[UploadFile] = File(...),
    db=Depends(get_database)
):
    """
    Upload multiple CV files (PDF, DOCX, or TXT).
    Stores them in MongoDB.
    """
    uploaded_cv_ids = []
    uploaded_files = []
    
    for file in files:
        content = await file.read()
        temp_path = f"temp_{file.filename}"
        
        try:
            with open(temp_path, "wb") as f:
                f.write(content)
            
            parsed_content = parse_cv_file(temp_path)
            
            # Store in database
            cv_id = await crud.create_cv(
                db,
                file_name=file.filename,
                content=parsed_content,
                file_size=len(content)
            )
            
            uploaded_cv_ids.append(cv_id)
            uploaded_files.append({
                "id": cv_id,
                "file_name": file.filename,
                "size": len(content)
            })
            
        except Exception as e:
            print(f"Error parsing {file.filename}: {str(e)}")
            continue
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    return {
        "message": f"Successfully uploaded {len(uploaded_cv_ids)} CVs",
        "files": uploaded_files,
        "cv_ids": uploaded_cv_ids
    }


@router.get("/cvs")
async def get_uploaded_cvs(
    limit: int = 50,
    db=Depends(get_database)
):
    """Get list of recently uploaded CVs."""
    cvs = await crud.get_recent_cvs(db, limit)
    
    return {
        "total": len(cvs),
        "cvs": [
            {
                "id": cv["_id"],
                "file_name": cv["file_name"],
                "uploaded_at": cv["uploaded_at"].isoformat(),
                "size": cv["file_size"]
            }
            for cv in cvs
        ]
    }


@router.delete("/cvs/{cv_id}")
async def delete_cv_endpoint(cv_id: str, db=Depends(get_database)):
    """Delete a specific CV."""
    deleted = await crud.delete_cv(db, cv_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="CV not found")
    
    return {"message": "CV deleted successfully"}


# ==================== Screening Endpoints ====================

@router.post("/screen-cvs")
async def screen_cvs(
    jd_id: Optional[str] = Form(None),
    cv_ids: Optional[List[str]] = Form(None),
    db=Depends(get_database)
):
    """
    Screen CVs against a job description.
    If no parameters provided, uses active JD and recent CVs.
    """
    # Get job description
    if jd_id:
        jd = await crud.get_job_description(db, jd_id)
    else:
        jd = await crud.get_active_job_description(db)
    
    if not jd:
        raise HTTPException(status_code=400, detail="No job description found")
    
    # Get CVs to screen
    if cv_ids:
        cvs_to_screen = []
        for cv_id in cv_ids:
            cv = await crud.get_cv(db, cv_id)
            if cv:
                cvs_to_screen.append(cv)
    else:
        cvs_to_screen = await crud.get_recent_cvs(db, limit=50)
    
    if not cvs_to_screen:
        raise HTTPException(status_code=400, detail="No CVs found to screen")
    
    # Create screening batch
    batch_id = await crud.create_screening_batch(
        db,
        jd["_id"],
        [cv["_id"] for cv in cvs_to_screen]
    )
    
    # Screen all CVs
    results = []
    result_ids = []
    
    for cv in cvs_to_screen:
        try:
            screening_result = await screener.screen_cv(
                job_description=jd["content"],
                cv_content=cv["content"],
                file_name=cv["file_name"]
            )
            
            # Store result in database
            result_id = await crud.create_screening_result(
                db,
                jd["_id"],
                cv["_id"],
                screening_result
            )
            result_ids.append(result_id)
            
            screening_result["id"] = result_id
            results.append(screening_result)
            
        except Exception as e:
            print(f"Error screening {cv['file_name']}: {str(e)}")
            results.append({
                "candidate_name": "Unknown",
                "file_name": cv["file_name"],
                "overall_score": 0,
                "skills_match": 0,
                "experience_match": 0,
                "education_match": 0,
                "strengths": [],
                "weaknesses": ["Error processing CV"],
                "recommendation": "Error",
                "summary": f"Error: {str(e)}"
            })
    
    # Update batch with results
    await crud.update_batch_results(db, batch_id, result_ids)
    
    # Sort by overall score
    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    
    return {
        "batch_id": batch_id,
        "job_description_id": jd["_id"],
        "job_title": jd.get("title", "Untitled"),
        "total_candidates": len(results),
        "results": results
    }


@router.get("/screening-results/{jd_id}")
async def get_screening_results(jd_id: str, db=Depends(get_database)):
    """Get all screening results for a job description."""
    results = await crud.get_screening_results_by_jd(db, jd_id)
    
    return {
        "job_description_id": jd_id,
        "total_results": len(results),
        "results": results
    }


@router.get("/top-candidates/{jd_id}")
async def get_top_candidates(
    jd_id: str,
    limit: int = 10,
    db=Depends(get_database)
):
    """Get top candidates for a job description."""
    candidates = await crud.get_top_candidates(db, jd_id, limit)
    
    return {
        "job_description_id": jd_id,
        "total": len(candidates),
        "top_candidates": candidates
    }


@router.post("/screen-single-cv")
async def screen_single_cv(
    cv_file: UploadFile = File(...),
    jd_id: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    db=Depends(get_database)
):
    """Screen a single CV against a job description."""
    
    # Get or create JD
    if jd_id:
        jd = await crud.get_job_description(db, jd_id)
        if not jd:
            raise HTTPException(status_code=404, detail="Job description not found")
        job_content = jd["content"]
    elif jd_text:
        job_content = jd_text
        # Create temporary JD
        jd_id = await crud.create_job_description(db, "Quick Screen", jd_text)
    else:
        jd = await crud.get_active_job_description(db)
        if not jd:
            raise HTTPException(status_code=400, detail="No job description provided")
        jd_id = jd["_id"]
        job_content = jd["content"]
    
    # Parse CV
    content = await cv_file.read()
    temp_path = f"temp_{cv_file.filename}"
    
    try:
        with open(temp_path, "wb") as f:
            f.write(content)
        
        parsed_content = parse_cv_file(temp_path)
        
        # Store CV
        cv_id = await crud.create_cv(
            db,
            file_name=cv_file.filename,
            content=parsed_content,
            file_size=len(content)
        )
        
        # Screen CV
        result = await screener.screen_cv(
            job_description=job_content,
            cv_content=parsed_content,
            file_name=cv_file.filename
        )
        
        # Store result
        result_id = await crud.create_screening_result(db, jd_id, cv_id, result)
        result["id"] = result_id
        result["cv_id"] = cv_id
        
        return result
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ==================== Statistics & Management ====================

@router.get("/statistics")
async def get_statistics(db=Depends(get_database)):
    """Get system statistics."""
    stats = await crud.get_statistics(db)
    return stats


@router.delete("/clear-all")
async def clear_all(db=Depends(get_database)):
    """Clear all data (use with caution!)."""
    await db.job_descriptions.delete_many({})
    await db.cvs.delete_many({})
    await db.screening_results.delete_many({})
    await db.screening_batches.delete_many({})
    
    return {"message": "All data cleared successfully"}


# ==================== User Authentication ====================

class UserRegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    createdAt: str
    isActive: bool


@router.post("/auth/register", response_model=dict)
async def register_user(
    user_data: UserRegisterRequest,
    db=Depends(get_database)
):
    """Register a new candidate user."""
    # Check database connection
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected. Please check DNS settings or use a standard connection string."
        )
    
    # Check if user already exists
    existing_user = await crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists with this email"
        )
    
    # Create new user
    user_id = await crud.create_candidate_user(
        db,
        user_data.firstName,
        user_data.lastName,
        user_data.email,
        user_data.password  # In production, hash this!
    )
    
    # Get created user
    user = await crud.get_user_by_id(db, user_id)
    
    return {
        "success": True,
        "message": "User registered successfully",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


@router.post("/auth/login", response_model=dict)
async def login_user(
    login_data: UserLoginRequest,
    db=Depends(get_database)
):
    """Login a candidate user."""
    # Check database connection
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Get user by email
    user = await crud.get_user_by_email(db, login_data.email)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check password (in production, use bcrypt to compare hashed passwords)
    if user["password"] != login_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )
    
    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


@router.get("/auth/users", response_model=List[dict])
async def get_all_users(db=Depends(get_database)):
    """Get all registered users (admin endpoint)."""
    users = await crud.get_all_users(db)
    return [
        {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
        for user in users
    ]
