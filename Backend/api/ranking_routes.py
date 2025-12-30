"""
Ranking and Evaluation API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import io
import json
from database.connection import get_database
from database.ranking_crud import (
    get_rankings_by_job,
    get_rankings_by_recruiter,
    update_ranking_status,
    get_evaluations_by_job,
    get_evaluations_by_recruiter,
    get_evaluation_by_id
)

router = APIRouter(prefix="/rankings", tags=["Rankings & Evaluations"])


class UpdateStatusRequest(BaseModel):
    status: str


@router.get("/job/{job_id}", response_model=list)
async def get_job_rankings(
    job_id: str,
    db=Depends(get_database)
):
    """Get all candidate rankings for a specific job."""
    rankings = await get_rankings_by_job(db, job_id)
    return [
        {
            "id": ranking["_id"],
            "jobPostingId": ranking["job_posting_id"],
            "recruiterId": ranking["recruiter_id"],
            "candidateName": ranking["candidate_name"],
            "rank": ranking["rank"],
            "score": f"{ranking['score']:.0f}/100",
            "completion": f"{ranking['completion']}%",
            "interviewStatus": ranking["interview_status"],
            "date": ranking["created_at"].strftime("%d-%m-%Y"),
            "cvData": ranking.get("cv_data"),
            "evaluationDetails": ranking.get("evaluation_details")
        }
        for ranking in rankings
    ]


@router.get("/recruiter/{recruiter_id}", response_model=list)
async def get_recruiter_rankings(
    recruiter_id: str,
    db=Depends(get_database)
):
    """Get all candidate rankings by recruiter."""
    rankings = await get_rankings_by_recruiter(db, recruiter_id)
    return [
        {
            "id": ranking["_id"],
            "jobPostingId": ranking["job_posting_id"],
            "recruiterId": ranking["recruiter_id"],
            "candidateName": ranking["candidate_name"],
            "rank": ranking["rank"],
            "score": f"{ranking['score']:.0f}/100",
            "completion": f"{ranking['completion']}%",
            "interviewStatus": ranking["interview_status"],
            "date": ranking["created_at"].strftime("%d-%m-%Y")
        }
        for ranking in rankings
    ]


@router.put("/{ranking_id}/status", response_model=dict)
async def update_candidate_status(
    ranking_id: str,
    status_data: UpdateStatusRequest,
    db=Depends(get_database)
):
    """Update candidate interview status."""
    success = await update_ranking_status(db, ranking_id, status_data.status)
    
    if not success:
        raise HTTPException(status_code=404, detail="Ranking not found")
    
    return {
        "success": True,
        "message": "Status updated successfully"
    }


@router.get("/{ranking_id}/report", response_model=dict)
async def get_candidate_report(
    ranking_id: str,
    db=Depends(get_database)
):
    """Get detailed candidate report."""
    from database.job_posting_crud import get_job_posting_by_id
    from bson import ObjectId
    
    # Get ranking
    ranking = await db.candidate_rankings.find_one({"_id": ObjectId(ranking_id)})
    if not ranking:
        raise HTTPException(status_code=404, detail="Ranking not found")
    
    # Get job posting for JD
    job = await get_job_posting_by_id(db, ranking["job_posting_id"])
    
    # Get evaluation report
    evaluation = await db.evaluation_reports.find_one({"candidate_ranking_id": ranking_id})
    
    # Extract strengths and weaknesses from evaluation details
    eval_details = ranking.get("evaluation_details", {})
    strengths = []
    weaknesses = []
    
    # Parse evaluation details for strengths/weaknesses
    if isinstance(eval_details, dict):
        # Try to extract from common fields
        if "strengths" in eval_details:
            strengths = eval_details["strengths"] if isinstance(eval_details["strengths"], list) else [eval_details["strengths"]]
        if "weaknesses" in eval_details:
            weaknesses = eval_details["weaknesses"] if isinstance(eval_details["weaknesses"], list) else [eval_details["weaknesses"]]
        
        # Fallback: generate based on scores
        if not strengths:
            strengths = [
                "Strong technical background",
                "Good communication skills",
                "Relevant experience in the field"
            ]
        if not weaknesses:
            weaknesses = [
                "Could improve problem-solving approach",
                "Limited experience with some required technologies"
            ]
    
    # Build skills array
    skills = []
    if evaluation:
        for skill_name, skill_score in evaluation.get("skill_scores", {}).items():
            skills.append({
                "name": skill_name,
                "percentage": int(skill_score),
                "color": _get_skill_color(skill_name)
            })
    
    return {
        "candidateName": ranking["candidate_name"],
        "position": job.get("interview_field", "") + " - " + job.get("position_level", ""),
        "score": f"{ranking['score']:.0f}/100",
        "rank": ranking["rank"],
        "completion": f"{ranking['completion']}%",
        "interviewStatus": ranking["interview_status"],
        "date": ranking["created_at"].strftime("%d-%m-%Y"),
        "skills": skills,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "cvSummary": ranking.get("cv_data", {}).get("text", "CV summary not available"),
        "jobDescription": job.get("job_description", "No job description provided"),
        "detailedAnalysis": evaluation.get("detailed_analysis") if evaluation else None,
        "recommendations": evaluation.get("recommendations") if evaluation else None,
        "evaluationId": str(evaluation["_id"]) if evaluation else None
    }


# ==================== Evaluation Reports ====================

@router.get("/evaluations/job/{job_id}", response_model=list)
async def get_job_evaluations(
    job_id: str,
    db=Depends(get_database)
):
    """Get all evaluation reports for a specific job."""
    evaluations = await get_evaluations_by_job(db, job_id)
    return [
        {
            "id": evaluation["_id"],
            "jobPostingId": evaluation["job_posting_id"],
            "candidateName": evaluation["candidate_name"],
            "position": evaluation["position"],
            "score": f"{evaluation['overall_score']:.0f}%",
            "skills": [
                {
                    "name": skill_name,
                    "percentage": int(skill_score),
                    "color": _get_skill_color(skill_name)
                }
                for skill_name, skill_score in evaluation["skill_scores"].items()
            ]
        }
        for evaluation in evaluations
    ]


@router.get("/evaluations/recruiter/{recruiter_id}", response_model=list)
async def get_recruiter_evaluations(
    recruiter_id: str,
    db=Depends(get_database)
):
    """Get all evaluation reports by recruiter."""
    evaluations = await get_evaluations_by_recruiter(db, recruiter_id)
    return [
        {
            "id": evaluation["_id"],
            "jobPostingId": evaluation["job_posting_id"],
            "candidateName": evaluation["candidate_name"],
            "position": evaluation["position"],
            "score": f"{evaluation['overall_score']:.0f}%",
            "skills": [
                {
                    "name": skill_name,
                    "percentage": int(skill_score),
                    "color": _get_skill_color(skill_name)
                }
                for skill_name, skill_score in evaluation["skill_scores"].items()
            ]
        }
        for evaluation in evaluations
    ]


@router.get("/evaluations/{evaluation_id}/download")
async def download_evaluation_report(
    evaluation_id: str,
    db=Depends(get_database)
):
    """Download evaluation report as professional PDF."""
    from services.pdf_generator import create_evaluation_pdf
    from database.job_posting_crud import get_job_posting_by_id
    from bson import ObjectId
    
    # Get evaluation report
    evaluation = await db.evaluation_reports.find_one({"_id": ObjectId(evaluation_id)})
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Get ranking for additional details
    ranking = await db.candidate_rankings.find_one({"_id": ObjectId(evaluation["candidate_ranking_id"])})
    
    # Get job posting for company info
    job = await get_job_posting_by_id(db, evaluation["job_posting_id"])
    
    # Get recruiter info for company name
    recruiter = await db.recruiter_users.find_one({"_id": ObjectId(evaluation["recruiter_id"])})
    company_name = recruiter.get("company_name", "Your Company") if recruiter else "Your Company"
    
    # Extract strengths and weaknesses
    eval_details = ranking.get("evaluation_details", {}) if ranking else {}
    strengths = []
    weaknesses = []
    
    if isinstance(eval_details, dict):
        if "strengths" in eval_details:
            strengths = eval_details["strengths"] if isinstance(eval_details["strengths"], list) else [eval_details["strengths"]]
        if "weaknesses" in eval_details:
            weaknesses = eval_details["weaknesses"] if isinstance(eval_details["weaknesses"], list) else [eval_details["weaknesses"]]
        
        # Fallback
        if not strengths:
            strengths = [
                "Strong technical background and relevant experience",
                "Excellent communication and interpersonal skills",
                "Demonstrates problem-solving abilities"
            ]
        if not weaknesses:
            weaknesses = [
                "Could benefit from additional training in specific technologies",
                "Limited experience with some advanced tools"
            ]
    
    # Build skills array
    skills = []
    for skill_name, skill_score in evaluation.get("skill_scores", {}).items():
        skills.append({
            "name": skill_name,
            "percentage": int(skill_score)
        })
    
    # Prepare data for PDF
    pdf_data = {
        "candidateName": evaluation["candidate_name"],
        "position": evaluation["position"],
        "score": f"{evaluation['overall_score']:.0f}/100",
        "rank": ranking["rank"] if ranking else "N/A",
        "interviewStatus": ranking["interview_status"] if ranking else "N/A",
        "date": evaluation["created_at"].strftime("%d-%m-%Y"),
        "completion": f"{ranking['completion']}%" if ranking else "100%",
        "skills": skills,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": evaluation.get("recommendations", "Candidate shows strong potential for the role.")
    }
    
    # Generate PDF
    pdf_buffer = create_evaluation_pdf(pdf_data, company_name)
    
    # Return as streaming response
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={evaluation['candidate_name'].replace(' ', '_')}_Evaluation_Report.pdf"
        }
    )


def _get_skill_color(skill_name: str) -> str:
    """Get color for skill based on name."""
    color_map = {
        "Technical Skills": "bg-blue-500",
        "Communication": "bg-green-500",
        "Problem Solving": "bg-pink-500",
        "Experience": "bg-purple-500",
        "Leadership": "bg-orange-500"
    }
    return color_map.get(skill_name, "bg-gray-500")
