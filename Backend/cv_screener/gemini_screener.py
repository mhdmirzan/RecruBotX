"""
Gemini CV Screener
==================

AI-powered CV screening using Google Gemini 2.5 Flash model.

This module provides intelligent CV analysis by comparing candidate resumes
against job descriptions and generating detailed scoring and recommendations.

Key Features:
- Automated CV analysis and scoring
- Skills, experience, and education matching
- Strength and weakness identification
- Hiring recommendations
- Multi-candidate comparison and ranking

Author: RecruBotX Team
Version: 1.0.0
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file
# Try to find .env in Backend directory or parent directories
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class GeminiCVScreener:
    """
    AI-Powered CV Screening System
    
    This class uses Google's Gemini 2.5 Flash model to analyze and score
    candidate CVs against job descriptions.
    
    Attributes:
        model: Gemini AI model instance
        screening_prompt: Template for CV analysis
    
    Raises:
        ValueError: If GEMINI_API_KEY is not found in environment variables
    
    Example:
        screener = GeminiCVScreener()
        result = await screener.screen_cv(job_desc, cv_content, "resume.pdf")
        print(f"Score: {result['overall_score']}")
    """
    
    # Gemini model identifier
    MODEL_NAME = "gemini-2.5-flash-preview-05-20"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the CV screener with Gemini API.
        
        Args:
            api_key: Optional API key. If not provided, reads from environment.
        
        Raises:
            ValueError: If API key is not found
        """
        # Get API key from parameter or environment
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not found. Please set it in .env file or pass as parameter."
            )
        
        # Create an async client (Google Gen AI SDK)
        # Docs: https://googleapis.github.io/python-genai/
        self.client = genai.Client(api_key=api_key).aio
        
        self.screening_prompt = """
You are an expert HR recruiter and talent acquisition specialist. Your task is to analyze a candidate's CV/resume against a job description and provide a detailed assessment.

## Job Description:
{job_description}

## Candidate's CV/Resume:
{cv_content}

## Instructions:
Analyze the CV against the job description and provide your assessment in the following JSON format. Be objective and thorough in your analysis.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just the JSON):
{{
    "candidate_name": "Extract the candidate's full name from the CV",
    "overall_score": <number between 0-100 representing overall match>,
    "skills_match": <number between 0-100>,
    "experience_match": <number between 0-100>,
    "education_match": <number between 0-100>,
    "strengths": [
        "List 3-5 key strengths that align with the job requirements"
    ],
    "weaknesses": [
        "List 2-4 gaps or areas where the candidate may not fully meet requirements"
    ],
    "recommendation": "<One of: 'Strongly Recommend', 'Recommend', 'Consider', 'Not Recommended'>",
    "summary": "A 2-3 sentence executive summary of the candidate's fit for the role"
}}

Scoring Guidelines:
- 90-100: Exceptional match, exceeds requirements
- 75-89: Strong match, meets most requirements
- 60-74: Moderate match, meets some requirements
- 40-59: Weak match, significant gaps
- 0-39: Poor match, does not meet basic requirements

Be fair, objective, and base your assessment solely on the information provided.
"""

    async def screen_cv(
        self,
        job_description: str,
        cv_content: str,
        file_name: str
    ) -> Dict[str, Any]:
        """
        Analyze a single CV against a job description.
        
        Performs comprehensive analysis including skills matching, experience
        evaluation, education assessment, and generates recommendations.
        
        Args:
            job_description: Job requirements and description text
            cv_content: Parsed text content from the CV
            file_name: Original CV filename (for tracking)
            
        Returns:
            Dictionary containing:
                - candidate_name: Extracted candidate name
                - overall_score: Overall match score (0-100)
                - skills_match: Skills alignment score (0-100)
                - experience_match: Experience relevance score (0-100)
                - education_match: Education fit score (0-100)
                - strengths: List of candidate strengths
                - weaknesses: List of areas for improvement
                - recommendation: Hiring recommendation
                - summary: Executive summary
                - file_name: Original filename
                
        Example:
            result = await screener.screen_cv(
                job_description="Software Engineer needed...",
                cv_content="John Doe\nSoftware Developer...",
                file_name="john_doe.pdf"
            )
        """
        prompt = self.screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        
        try:
            response = await self.client.models.generate_content(
                model=self.MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    response_mime_type="application/json",
                ),
            )
            result_text = (response.text or "").strip()
            
            # Clean up the response - remove markdown code blocks if present
            if result_text.startswith("```"):
                # Remove markdown code block
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
                    raise ValueError("Could not parse JSON from response")
            
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
            return {
                "candidate_name": "Unknown",
                "file_name": file_name,
                "overall_score": 0,
                "skills_match": 0,
                "experience_match": 0,
                "education_match": 0,
                "strengths": [],
                "weaknesses": ["Error processing CV"],
                "recommendation": "Error",
                "summary": f"Error during screening: {str(e)}"
            }

    async def compare_candidates(
        self,
        job_description: str,
        candidates: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Compare and rank multiple candidates.
        
        Analyzes all screened candidates and provides a comparative summary
        with rankings based on their overall scores.
        
        Args:
            job_description: Job requirements text
            candidates: List of screening result dictionaries from screen_cv()
            
        Returns:
            Dictionary containing:
                - ranked_candidates: List sorted by overall_score (highest first)
                - comparison_summary: AI-generated comparison text
                - top_recommendation: Best candidate's full result
                
        Example:
            comparison = await screener.compare_candidates(
                job_description,
                [result1, result2, result3]
            )
            print(comparison['ranked_candidates'][0]['candidate_name'])
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
            response = await self.client.models.generate_content(
                model=self.MODEL_NAME,
                contents=comparison_prompt,
                config=types.GenerateContentConfig(temperature=0),
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
