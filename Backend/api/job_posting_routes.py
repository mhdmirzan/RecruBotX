"""
Job Posting API Routes
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from database.connection import get_database
from database.job_posting_crud import (
    create_job_posting,
    get_job_posting_by_id,
    get_job_postings_by_recruiter,
    get_all_job_postings,
    update_job_posting,
    delete_job_posting,
    create_job_cv_file,
    get_cv_files_by_ids,
    count_cv_files_for_job
)

router = APIRouter(prefix="/jobs", tags=["Job Postings"])


class JobQuestion(BaseModel):
    text: str
    type: str  # e.g., "behavioral", "technical"
    difficulty: str  # e.g., "easy", "medium", "hard"


class JobPostingRequest(BaseModel):
    recruiterId: str
    interviewField: str
    positionLevel: str
    workModel: str
    status: str  # Employment Status
    location: str
    salaryRange: str
    experienceRange: str
    industryDomain: str
    questions: Optional[List[JobQuestion]] = []
    specificInstruction: Optional[str] = None
    jobDescription: Optional[str] = None


class JobPostingUpdateRequest(BaseModel):
    interviewField: Optional[str] = None
    positionLevel: Optional[str] = None
    workModel: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    salaryRange: Optional[str] = None
    experienceRange: Optional[str] = None
    industryDomain: Optional[str] = None
    questions: Optional[List[JobQuestion]] = None
    specificInstruction: Optional[str] = None
    jobDescription: Optional[str] = None


@router.post("/create", response_model=dict)
async def create_job(
    job_data: JobPostingRequest,
    db=Depends(get_database)
):
    """
    Create a new job posting.
    
    NOTE: This endpoint ONLY creates a job posting. 
    To screen CVs and create rankings, use the CV Screening page (/api/screen-cvs-batch).
    
    Uses Reference Pattern: CVs are stored individually in job_cv_files collection,
    and only the IDs are stored in the job posting document.
    """
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Create job posting
    job_id = await create_job_posting(
        db,
        job_data.recruiterId,
        job_data.interviewField,
        job_data.positionLevel,
        job_data.workModel,
        job_data.status,
        job_data.location,
        job_data.salaryRange,
        job_data.experienceRange,
        job_data.industryDomain,
        [q.dict() for q in job_data.questions],
        job_data.specificInstruction,
        job_data.jobDescription
    )
    
    job = await get_job_posting_by_id(db, job_id)
    
    return {
        "success": True,
        "message": "Job posting created successfully. Use CV Screening to rank candidates.",
        "job": {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
    }


@router.get("/recruiter/{recruiter_id}", response_model=list)
async def get_recruiter_jobs(
    recruiter_id: str,
    db=Depends(get_database)
):
    """Get all job postings by a specific recruiter."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    jobs = await get_job_postings_by_recruiter(db, recruiter_id)
    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfQuestions": job.get("number_of_questions", 3),
            "topNCvs": job.get("top_n_cvs", 10),
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": [str(cid) for cid in job.get("cv_file_ids", [])],
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
        for job in jobs
    ]


@router.get("/all", response_model=list)
async def get_all_jobs(
    db=Depends(get_database)
):
    """Get all job postings from all recruiters."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    jobs = await get_all_job_postings(db)
    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfQuestions": job.get("number_of_questions", 3),
            "topNCvs": job.get("top_n_cvs", 10),
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": [str(cid) for cid in job.get("cv_file_ids", [])],
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
            "experienceRange": job.get("experience_range"),
            "industryDomain": job.get("industry_domain"),
            "questions": job.get("questions", []),
            "specificInstruction": job.get("specific_instruction"),
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        }
        for job in jobs
    ]


@router.get("/{job_id}", response_model=dict)
async def get_job(
    job_id: str,
    db=Depends(get_database)
):
    """Get a specific job posting by ID."""
    job = await get_job_posting_by_id(db, job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    return {
        "id": job["_id"],
        "recruiterId": job["recruiter_id"],
        "interviewField": job["interview_field"],
        "positionLevel": job["position_level"],
        "jobDescription": job.get("job_description"),
        "experienceRange": job.get("experience_range"),
        "industryDomain": job.get("industry_domain"),
        "questions": job.get("questions", []),
        "specificInstruction": job.get("specific_instruction"),
        "createdAt": job["created_at"].isoformat(),
        "isActive": job["is_active"]
    }


@router.put("/{job_id}", response_model=dict)
async def update_job(
    job_id: str,
    update_data: JobPostingUpdateRequest,
    db=Depends(get_database)
):
    """Update a job posting."""
    job = await get_job_posting_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    # Prepare update data
    update_fields = {}
    if update_data.interviewField is not None:
        update_fields["interview_field"] = update_data.interviewField
    if update_data.positionLevel is not None:
        update_fields["position_level"] = update_data.positionLevel
    
    # Map new fields
    if update_data.workModel is not None:
        update_fields["work_model"] = update_data.workModel
    if update_data.status is not None:
        update_fields["status"] = update_data.status
    if update_data.location is not None:
        update_fields["location"] = update_data.location
    if update_data.salaryRange is not None:
        update_fields["salary_range"] = update_data.salaryRange
    if update_data.experienceRange is not None:
        update_fields["experience_range"] = update_data.experienceRange
    if update_data.industryDomain is not None:
        update_fields["industry_domain"] = update_data.industryDomain
    if update_data.questions is not None:
        update_fields["questions"] = [q.dict() for q in update_data.questions]
    if update_data.specificInstruction is not None:
        update_fields["specific_instruction"] = update_data.specificInstruction
        
    if update_data.jobDescription is not None:
        update_fields["job_description"] = update_data.jobDescription
    
    success = await update_job_posting(db, job_id, update_fields)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update job posting")
    
    updated_job = await get_job_posting_by_id(db, job_id)
    
    return {
        "success": True,
        "message": "Job posting updated successfully",
        "job": {
            "id": updated_job["_id"],
            "recruiterId": updated_job["recruiter_id"],
            "interviewField": updated_job["interview_field"],
            "positionLevel": updated_job["position_level"],
            "jobDescription": updated_job.get("job_description"),
            "experienceRange": updated_job.get("experience_range"),
            "industryDomain": updated_job.get("industry_domain"),
            "questions": updated_job.get("questions", []),
            "specificInstruction": updated_job.get("specific_instruction"),
            "createdAt": updated_job["created_at"].isoformat(),
            "isActive": updated_job["is_active"]
        }
    }


@router.delete("/{job_id}", response_model=dict)
async def delete_job(
    job_id: str,
    db=Depends(get_database)
):
    """Delete a job posting."""
    job = await get_job_posting_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    success = await delete_job_posting(db, job_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete job posting")
    
    return {
        "success": True,
        "message": "Job posting deleted successfully"
    }
