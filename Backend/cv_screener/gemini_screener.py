"""
Gemini CV Screener
==================

AI-powered CV screening using Google Gemini model.

This module provides intelligent CV analysis by comparing candidate resumes
against job descriptions and generating detailed scoring and recommendations.

Key Features:
- Automated CV analysis and scoring
- Skills, experience, and education matching
- Strength and weakness identification
- Hiring recommendations
- Multi-candidate comparison and ranking

Author: RecruBotX Team
Version: 2.0.0
"""

import os
import json
import re
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class GeminiCVScreener:
    """
    AI-Powered CV Screening System
    
    This class uses Google's Gemini model to analyze and score
    candidate CVs against job descriptions.
    """
    
    # Gemini model identifier - using stable model
    MODEL_NAME = "gemini-2.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the CV screener with Gemini API.
        
        Args:
            api_key: Optional API key. If not provided, reads from environment.
        """
        # Get API key from parameter or environment
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not found. Please set it in .env file or pass as parameter."
            )
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Create the model
        self.model = genai.GenerativeModel(
            model_name=self.MODEL_NAME,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
        )
        
        self.screening_prompt = """
You are an elite HR recruiter, talent acquisition specialist, and career strategist with 20+ years of experience. Your task is to perform a comprehensive CV/resume analysis against a job description and provide professional, actionable feedback.

## JOB DESCRIPTION TO MATCH AGAINST:
{job_description}

## CANDIDATE'S CV/RESUME:
{cv_content}

## YOUR MISSION:
Conduct a thorough analysis comparing the candidate's qualifications against the job requirements. Evaluate skills alignment, experience relevance, and overall fit. Provide specific, actionable insights.

## REQUIRED OUTPUT FORMAT (Return ONLY valid JSON - no markdown, no code blocks, no extra text):
{{
    "candidate_name": "Extract the candidate's full name from CV",
    "overall_score": <integer 0-100>,
    "skills_match": <integer 0-100>,
    "experience_match": <integer 0-100>,
    "education_match": <integer 0-100>,
    "strengths": [
        "Specific strength 1 that directly matches a JD requirement",
        "Specific strength 2 highlighting a key skill or achievement",
        "Specific strength 3 showing unique value proposition",
        "Specific strength 4 demonstrating relevant experience",
        "Specific strength 5 highlighting a competitive advantage"
    ],
    "weaknesses": [
        "Specific gap 1 with actionable details - e.g., 'Missing Java Spring Boot experience (3+ years required) - consider taking online courses or certifications'",
        "Specific gap 2 with improvement path - e.g., 'No cloud deployment experience mentioned - suggest learning AWS/Azure fundamentals and deploying sample projects'",
        "Specific gap 3 with precise requirements - e.g., 'PMP certification not present but required for the role - recommend pursuing this credential'",
        "Specific gap 4 with development plan - e.g., 'Limited team leadership experience (managed 2 people vs 5+ required) - seek opportunities to lead larger teams or cross-functional projects'"
    ],
    "recommendation": "Strongly Recommend OR Recommend OR Consider OR Not Recommended",
    "summary": "2-3 sentence executive summary explaining the overall fit and key recommendation."
}}

## SCORING RUBRIC:
- 90-100: Exceptional match - exceeds all major requirements
- 75-89: Strong match - meets most key requirements
- 60-74: Moderate match - meets core requirements but has gaps
- 40-59: Below average - missing several key requirements
- 0-39: Poor fit - fundamental misalignment with role

Be SPECIFIC, OBJECTIVE, and CONSTRUCTIVE. Reference actual skills from the CV.
"""

    async def screen_cv(
        self,
        job_description: str,
        cv_content: str,
        file_name: str
    ) -> Dict[str, Any]:
        """
        Analyze a single CV against a job description.
        """
        prompt = self.screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        
        try:
            # Run the synchronous API call in a thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            result_text = (response.text or "").strip()
            
            # Clean up the response - remove markdown code blocks if present
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\s*\n?', '', result_text)
                result_text = re.sub(r'\n?```\s*$', '', result_text)
            
            # Parse JSON response
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                # Try to extract JSON from the response
                json_match = re.search(r'\{[\s\S]*\}', result_text)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError(f"Could not parse JSON from response: {result_text[:200]}")
            
            # Add file name to result
            result["file_name"] = file_name
            
            # Ensure all required fields exist with defaults
            result.setdefault("candidate_name", "Unknown")
            result.setdefault("overall_score", 0)
            result.setdefault("skills_match", 0)
            result.setdefault("experience_match", 0)
            result.setdefault("education_match", 0)
            result.setdefault("strengths", [])
            result.setdefault("weaknesses", [])
            result.setdefault("recommendation", "Not Evaluated")
            result.setdefault("summary", "Unable to generate summary")
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error analyzing CV: {error_msg}")
            return {
                "candidate_name": "Unknown",
                "file_name": file_name,
                "overall_score": 0,
                "skills_match": 0,
                "experience_match": 0,
                "education_match": 0,
                "strengths": [],
                "weaknesses": [f"Error during analysis: {error_msg}"],
                "recommendation": "Unable to Evaluate",
                "summary": f"An error occurred during CV analysis: {error_msg}. Please try again or contact support if the issue persists."
            }

    async def compare_candidates(
        self,
        job_description: str,
        candidates: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare and rank multiple candidates.
        """
        if not candidates:
            return {"error": "No candidates to compare"}
        
        # Sort by overall score
        ranked = sorted(candidates, key=lambda x: x.get("overall_score", 0), reverse=True)
        
        comparison_prompt = f"""
You are an expert HR recruiter. Based on the following candidate assessments for a job position, provide a brief comparison summary.

Job Description Summary:
{job_description[:500]}

Top Candidates (ranked by score):
{json.dumps([{"name": c.get("candidate_name"), "score": c.get("overall_score"), "recommendation": c.get("recommendation")} for c in ranked[:5]], indent=2)}

Provide a 3-4 sentence summary comparing the top candidates and your hiring recommendation.
"""
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(comparison_prompt)
            )
            
            return {
                "ranked_candidates": ranked,
                "comparison_summary": (response.text or "").strip(),
                "top_recommendation": ranked[0] if ranked else None
            }
        except Exception as e:
            return {
                "ranked_candidates": ranked,
                "comparison_summary": f"Error generating comparison: {str(e)}",
                "top_recommendation": ranked[0] if ranked else None
            }
