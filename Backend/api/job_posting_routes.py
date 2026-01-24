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


class JobPostingRequest(BaseModel):
    recruiterId: str
    interviewField: str
    positionLevel: str
    numberOfQuestions: int
    topNCvs: int
    workModel: str
    status: str
    location: str
    salaryRange: str
    cvFiles: Optional[List[str]] = []
    jobDescription: Optional[str] = None


class JobPostingUpdateRequest(BaseModel):
    interviewField: Optional[str] = None
    positionLevel: Optional[str] = None
    numberOfQuestions: Optional[int] = None
    topNCvs: Optional[int] = None
    workModel: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    salaryRange: Optional[str] = None
    cvFiles: Optional[List[str]] = None
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
    
    # Step 1: Store each CV file individually in job_cv_files collection (if any)
    cv_file_ids = []
    
    if job_data.cvFiles and len(job_data.cvFiles) > 0:
        print(f"[INFO] Storing {len(job_data.cvFiles)} CV files using Reference Pattern...")
        
        for idx, cv_base64 in enumerate(job_data.cvFiles):
            try:
                # Calculate approximate file size from base64
                file_size = int(len(cv_base64) * 0.75)
                
                # Store in separate collection (bypasses 16MB limit)
                cv_file_id = await create_job_cv_file(
                    db=db,
                    job_posting_id="pending",
                    file_name=f"CV_{idx + 1}.pdf",
                    file_content=cv_base64,
                    file_size=file_size
                )
                cv_file_ids.append(cv_file_id)
                
            except Exception as e:
                print(f"[ERROR] Failed to store CV {idx + 1}: {str(e)}")
                continue
    
    # Step 2: Create job posting with only the CV file IDs
    job_id = await create_job_posting(
        db,
        job_data.recruiterId,
        job_data.interviewField,
        job_data.positionLevel,
        job_data.numberOfQuestions,
        job_data.topNCvs,
        job_data.workModel,
        job_data.status,
        job_data.location,
        job_data.salaryRange,
        cv_file_ids,
        job_data.jobDescription
    )
    
    # Step 3: Update stored CV files with the job_posting_id
    if cv_file_ids:
        from bson import ObjectId
        await db.job_cv_files.update_many(
            {"_id": {"$in": [ObjectId(cid) for cid in cv_file_ids]}},
            {"$set": {"job_posting_id": job_id}}
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
            "numberOfQuestions": job["number_of_questions"],
            "topNCvs": job["top_n_cvs"],
            "cvFileIds": job.get("cv_file_ids", []),
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
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
    jobs = await get_job_postings_by_recruiter(db, recruiter_id)
    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfQuestions": job["number_of_questions"],
            "topNCvs": job["top_n_cvs"],
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": job.get("cv_file_ids", []),
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
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
    jobs = await get_all_job_postings(db)
    return [
        {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfQuestions": job["number_of_questions"],
            "topNCvs": job["top_n_cvs"],
            "workModel": job.get("work_model", "Remote"),
            "status": job.get("status", "Full-time"),
            "location": job.get("location", "Not specified"),
            "salaryRange": job.get("salary_range", "Not specified"),
            "cvFileIds": job.get("cv_file_ids", []),
            "cvFilesCount": len(job.get("cv_file_ids", [])),
            "jobDescription": job.get("job_description"),
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
        "numberOfQuestions": job["number_of_questions"],
        "topNCvs": job["top_n_cvs"],
        "cvFileIds": job.get("cv_file_ids", []),
        "cvFilesCount": len(job.get("cv_file_ids", [])),
        "jobDescription": job.get("job_description"),
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
    if update_data.numberOfQuestions is not None:
        update_fields["number_of_questions"] = update_data.numberOfQuestions
    if update_data.topNCvs is not None:
        update_fields["top_n_cvs"] = update_data.topNCvs
    
    # Map new fields
    if update_data.workModel is not None:
        update_fields["work_model"] = update_data.workModel
    if update_data.status is not None:
        update_fields["status"] = update_data.status
    if update_data.location is not None:
        update_fields["location"] = update_data.location
    if update_data.salaryRange is not None:
        update_fields["salary_range"] = update_data.salaryRange
        
    if update_data.cvFiles is not None:
        update_fields["cv_files"] = update_data.cvFiles
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
            "numberOfQuestions": updated_job["number_of_questions"],
            "topNCvs": updated_job["top_n_cvs"],
            "cvFileIds": updated_job.get("cv_file_ids", []),
            "cvFilesCount": len(updated_job.get("cv_file_ids", [])),
            "jobDescription": updated_job.get("job_description"),
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
