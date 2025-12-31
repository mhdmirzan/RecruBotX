"""
Job Posting CRUD Operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


async def create_job_posting(
    db: AsyncIOMotorDatabase,
    recruiter_id: str,
    interview_field: str,
    position_level: str,
    number_of_questions: int,
    top_n_cvs: int,
    work_model: str,
    status: str,
    location: str,
    salary_range: str,
    cv_files: Optional[List[str]] = None,
    job_description: Optional[str] = None
) -> str:
    """Create a new job posting."""
    job_posting = {
        "recruiter_id": recruiter_id,
        "interview_field": interview_field,
        "position_level": position_level,
        "number_of_questions": number_of_questions,
        "top_n_cvs": top_n_cvs,
        "work_model": work_model,
        "status": status,
        "location": location,
        "salary_range": salary_range,
        "cv_files": cv_files if cv_files else [],
        "job_description": job_description,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    result = await db.job_postings.insert_one(job_posting)
    return str(result.inserted_id)


async def get_job_posting_by_id(
    db: AsyncIOMotorDatabase,
    job_id: str
) -> Optional[Dict[str, Any]]:
    """Get a job posting by ID."""
    job = await db.job_postings.find_one({"_id": ObjectId(job_id)})
    if job:
        job["_id"] = str(job["_id"])
    return job


async def get_job_postings_by_recruiter(
    db: AsyncIOMotorDatabase,
    recruiter_id: str
) -> List[Dict[str, Any]]:
    """Get all job postings by a specific recruiter."""
    jobs = []
    cursor = db.job_postings.find({"recruiter_id": recruiter_id})
    async for job in cursor:
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs


async def get_all_job_postings(
    db: AsyncIOMotorDatabase
) -> List[Dict[str, Any]]:
    """Get all job postings."""
    jobs = []
    cursor = db.job_postings.find({})
    async for job in cursor:
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs


async def update_job_posting(
    db: AsyncIOMotorDatabase,
    job_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """Update job posting information."""
    update_data["updated_at"] = datetime.utcnow()
    result = await db.job_postings.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def delete_job_posting(
    db: AsyncIOMotorDatabase,
    job_id: str
) -> bool:
    """Delete a job posting and all associated data."""
    # Delete associated candidate rankings
    await db.candidate_rankings.delete_many({"job_posting_id": job_id})
    
    # Delete associated evaluation reports
    await db.evaluation_reports.delete_many({"job_posting_id": job_id})
    
    # Delete the job posting itself
    result = await db.job_postings.delete_one({"_id": ObjectId(job_id)})
    return result.deleted_count > 0
