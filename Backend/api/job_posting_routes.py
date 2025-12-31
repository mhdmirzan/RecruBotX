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
    delete_job_posting
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
    """Create a new job posting and process CVs for ranking."""
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Import ranking services
    from services.cv_ranking_service import CVRankingService
    from database.ranking_crud import create_candidate_ranking, create_evaluation_report
    
    # Create new job posting
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
        job_data.cvFiles,
        job_data.jobDescription
    )
    
    # Process CVs if provided
    rankings_created = []
    evaluations_created = []
    
    if job_data.cvFiles and len(job_data.cvFiles) > 0:
        try:
            # Initialize CV ranking service
            ranking_service = CVRankingService()
            
            # Screen and rank CVs
            ranked_candidates = await ranking_service.screen_and_rank_cvs(
                cv_files=job_data.cvFiles,
                job_description=job_data.jobDescription or f"Position: {job_data.interviewField} - {job_data.positionLevel}",
                interview_field=job_data.interviewField,
                position_level=job_data.positionLevel,
                number_of_questions=job_data.numberOfQuestions,
                top_n=job_data.topNCvs
            )
            
            # Save rankings and create evaluation reports
            for candidate in ranked_candidates:
                # Create ranking entry
                ranking_id = await create_candidate_ranking(
                    db=db,
                    job_posting_id=job_id,
                    recruiter_id=job_data.recruiterId,
                    candidate_name=candidate["candidate_name"],
                    rank=candidate["rank"],
                    score=candidate["score"],
                    cv_score=candidate.get("cv_score", 0),
                    interview_score=candidate.get("interview_score", 0),
                    facial_recognition_score=candidate.get("facial_recognition_score", 0),
                    completion=candidate["completion"],
                    interview_status=candidate["interview_status"],
                    cv_data=candidate.get("cv_data"),
                    evaluation_details=candidate.get("evaluation_details")
                )
                rankings_created.append(ranking_id)
                
                # Create evaluation report
                evaluation_id = await create_evaluation_report(
                    db=db,
                    job_posting_id=job_id,
                    recruiter_id=job_data.recruiterId,
                    candidate_ranking_id=ranking_id,
                    candidate_name=candidate["candidate_name"],
                    position=f"{job_data.interviewField} - {job_data.positionLevel}",
                    overall_score=candidate["score"],
                    skill_scores=candidate.get("skill_scores", {}),
                    detailed_analysis=str(candidate.get("evaluation_details", {})),
                    recommendations=f"Rank: {candidate['rank']}, Status: {candidate['interview_status']}"
                )
                evaluations_created.append(evaluation_id)
                
        except Exception as e:
            print(f"Error processing CVs: {str(e)}")
            # Continue even if CV processing fails
    
    # Get created job
    job = await get_job_posting_by_id(db, job_id)
    
    return {
        "success": True,
        "message": "Job posting created successfully",
        "job": {
            "id": job["_id"],
            "recruiterId": job["recruiter_id"],
            "interviewField": job["interview_field"],
            "positionLevel": job["position_level"],
            "numberOfQuestions": job["number_of_questions"],
            "topNCvs": job["top_n_cvs"],
            "cvFiles": job.get("cv_files", []),
            "jobDescription": job.get("job_description"),
            "createdAt": job["created_at"].isoformat(),
            "isActive": job["is_active"]
        },
        "rankings_created": len(rankings_created),
        "evaluations_created": len(evaluations_created)
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
            "cvFiles": job.get("cv_files", []),
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
            "cvFiles": job.get("cv_files", []),
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
        "cvFiles": job.get("cv_files", []),
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
            "cvFiles": updated_job.get("cv_files", []),
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
