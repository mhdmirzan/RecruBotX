"""
Gemini CV Screener
==================

AI-powered CV screening using Google Gemini 1.5 Flash model.

This module provides intelligent CV analysis by comparing candidate resumes
against job descriptions and generating detailed scoring and recommendations.
"""

import os
import json
import re
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class GeminiCVScreener:
    """
    AI-Powered CV Screening System
    """
    
    # Primary model name
    MODEL_NAME = "gemini-1.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the CV screener."""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found.")
        
        self.client = genai.Client(api_key=self.api_key)
        
        # Configure generation settings
        self.generation_config = types.GenerateContentConfig(
            temperature=0.1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        )

        # Debug: List available models to help resolve 404 errors
        try:
            print("[DEBUG] Listing available Gemini models:")
            # Note: client.models.list() might fail if key is restricted
            models = self.client.models.list()
            for m in models:
                print(f"  - {m.name}")
        except Exception as e:
            print(f"[DEBUG] Could not list models: {e}")
        
        self.screening_prompt = """
You are an elite HR recruiter. Analyze the CV against the Job Description.
Return ONLY valid JSON.

## JOB DESCRIPTION:
{job_description}

## CV CONTENT:
{cv_content}

## OUTPUT FORMAT (Return ONLY valid JSON):
{{
    "candidate_name": "Full Name",
    "overall_score": 0-100,
    "skills_match": 0-100,
    "experience_match": 0-100,
    "education_match": 0-100,
    "strengths": ["list"],
    "weaknesses": ["list"],
    "recommendation": "String",
    "summary": "2-3 sentences"
}}
"""

    def _process_response(self, response: Any, file_name: str) -> Dict[str, Any]:
        """Parse and clean the AI response."""
        result_text = (response.text or "").strip()
        
        # Clean up markdown blocks
        if result_text.startswith("```"):
            result_text = re.sub(r'^```(?:json)?\s*\n?', '', result_text)
            result_text = re.sub(r'\n?```\s*$', '', result_text)
        
        try:
            result = json.loads(result_text)
        except json.JSONDecodeError:
            json_match = re.search(r'\{[\s\S]*\}', result_text)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError(f"Could not parse JSON: {result_text[:100]}")
        
        # Defaults
        result["file_name"] = file_name
        result.setdefault("candidate_name", "Unknown")
        result.setdefault("overall_score", 0)
        result.setdefault("skills_match", 0)
        result.setdefault("experience_match", 0)
        result.setdefault("education_match", 0)
        result.setdefault("strengths", [])
        result.setdefault("weaknesses", [])
        result.setdefault("recommendation", "Not Evaluated")
        result.setdefault("summary", "No summary generated")
        
        return result

    async def screen_cv(self, job_description: str, cv_content: str, file_name: str) -> Dict[str, Any]:
        """Screen a CV using Gemini."""
        prompt = self.screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        
        loop = asyncio.get_event_loop()
        try:
            # Try primary model
            try:
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.models.generate_content(
                        model=self.MODEL_NAME,
                        contents=prompt,
                        config=self.generation_config
                    )
                )
                return self._process_response(response, file_name)
            except Exception as e:
                if "404" in str(e):
                    print(f"[WARNING] 404 for {self.MODEL_NAME}. Trying fallbacks...")
                    for fallback in ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro"]:
                        if fallback == self.MODEL_NAME: continue
                        try:
                            response = await loop.run_in_executor(
                                None,
                                lambda: self.client.models.generate_content(
                                    model=fallback,
                                    contents=prompt,
                                    config=self.generation_config
                                )
                            )
                            return self._process_response(response, file_name)
                        except:
                            continue
                raise e
        except Exception as e:
            print(f"Error in screen_cv: {e}")
            return {
                "candidate_name": "Unknown",
                "file_name": file_name,
                "overall_score": 0,
                "strengths": [],
                "weaknesses": [f"Error: {str(e)}"],
                "recommendation": "Error",
                "summary": f"Failed to analyze: {str(e)}"
            }

    async def compare_candidates(self, job_description: str, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compare multiple candidates."""
        if not candidates:
            return {"error": "No candidates to compare"}
        
        ranked = sorted(candidates, key=lambda x: x.get("overall_score", 0), reverse=True)
        prompt = f"Compare these candidates for the role: {job_description[:500]}\nCandidates: {json.dumps(ranked[:5])}"
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=prompt
                )
            )
            return {
                "ranked_candidates": ranked,
                "comparison_summary": response.text.strip(),
                "top_recommendation": ranked[0]
            }
        except Exception as e:
            return {"ranked_candidates": ranked, "comparison_summary": f"Error: {e}", "top_recommendation": ranked[0]}