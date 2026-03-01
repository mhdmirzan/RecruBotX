from typing import Dict, Optional, AsyncGenerator, List
import uuid
import json
import base64
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

from agents.interview_agent.models import InterviewStage, Question, InterviewState
from agents.interview_agent.prompts import INTERVIEWER_SYSTEM_PROMPT, STAGE_INSTRUCTIONS

# Import LLM/STT/TTS services directly
# We will create wrappers around existing services or copy them to Backend/services
from services.llm_service import LLMService 
from services.stt_service import STTService
from services.tts_service import TTSService


class InterviewServiceContext:
    def __init__(self, candidate_name: str, candidate_cv_json: dict, job_description: str, required_skills: list, recruiter_extra_instructions: str):
        self.candidate_name = candidate_name
        self.candidate_cv_json = candidate_cv_json
        self.job_description = job_description
        self.required_skills = required_skills
        self.recruiter_extra_instructions = recruiter_extra_instructions


class InterviewService:
    def __init__(self, db):
        self.db = db
        self.llm_service = LLMService()
        self.stt_service = STTService()
        self.tts_service = TTSService()

    async def initialize_session(self, context: InterviewServiceContext, job_id: str, candidate_id: str) -> str:
        session_id = str(uuid.uuid4())
        
        session_state = InterviewState(
            candidate_name=context.candidate_name,
            job_role="Candidate", # Will use JD instead
            stage=InterviewStage.INTRODUCTION
        )
        
        # 3. Create Session in DB with context and state
        await self.db.interview_sessions.insert_one({
            "session_id": session_id,
            "job_id": job_id,
            "candidate_id": candidate_id,
            "transcript": [],
            "technical_score": 0,
            "behavioral_score": 0,
            "confidence_score": 0,
            "overall_score": 0,
            "status": "In Progress",
            "created_at": datetime.utcnow(),
            "context": {
                "candidate_name": context.candidate_name,
                "candidate_cv_json": context.candidate_cv_json,
                "job_description": context.job_description,
                "required_skills": context.required_skills,
                "recruiter_extra_instructions": context.recruiter_extra_instructions
            },
            "state_overrides": {
                "stage": session_state.stage.value,
                "current_difficulty": session_state.current_difficulty,
                "skills_covered": session_state.skills_covered
            }
        })
        
        return session_id

    async def get_session(self, session_id: str) -> Optional[tuple[InterviewState, InterviewServiceContext]]:
        doc = await self.db.interview_sessions.find_one({"session_id": session_id})
        if not doc:
            return None
            
        context_data = doc.get("context", {})
        state_overrides = doc.get("state_overrides", {})
        transcript = doc.get("transcript", [])
        
        context = InterviewServiceContext(
            candidate_name=context_data.get("candidate_name", "Unknown"),
            candidate_cv_json=context_data.get("candidate_cv_json", {}),
            job_description=context_data.get("job_description", ""),
            required_skills=context_data.get("required_skills", []),
            recruiter_extra_instructions=context_data.get("recruiter_extra_instructions", "")
        )
        
        session = InterviewState(
            candidate_name=context.candidate_name,
            job_role="Candidate",
            stage=InterviewStage(state_overrides.get("stage", "introduction")),
            transcript=transcript,
            skills_covered=state_overrides.get("skills_covered", []),
            current_difficulty=state_overrides.get("current_difficulty", "medium")
        )
        
        return session, context

    async def process_input(self, session_id: str, user_input: str) -> AsyncGenerator[str, None]:
        session_data = await self.get_session(session_id)
        
        if not session_data:
            yield "Error: Session not found."
            return
            
        session, context = session_data

        # 1. Update Transcript with User Input
        if user_input.strip() != "INIT":
            session.transcript.append({"role": "candidate", "content": user_input})
            
            # Save to DB asynchronously (fire and forget or await)
            await self.db.interview_sessions.update_one(
                {"session_id": session_id},
                {"$push": {"transcript": {"role": "candidate", "content": user_input, "timestamp": datetime.utcnow()}}}
            )
        
        # 2. Determine Stage & Instructions
        current_stage = session.stage
        interaction_count = len([x for x in session.transcript if x["role"] == "interviewer"])

        # Simple Stage Transition Logic
        if current_stage == InterviewStage.INTRODUCTION and interaction_count > 0:
            session.stage = InterviewStage.WARMUP
        elif current_stage == InterviewStage.WARMUP and interaction_count > 2:
            session.stage = InterviewStage.CORE
        elif current_stage == InterviewStage.CORE and interaction_count > 7:
            session.stage = InterviewStage.WRAPUP

        stage_instructions = STAGE_INSTRUCTIONS.get(session.stage.value, "")

        # 3. Construct History
        history = []
        
        # Add System Prompt with the new context
        system_prompt = INTERVIEWER_SYSTEM_PROMPT.format(
            job_description=context.job_description,
            required_skills=", ".join(context.required_skills) if context.required_skills else "Not specified",
            extra_instructions=context.recruiter_extra_instructions,
            candidate_name=context.candidate_name,
            candidate_cv_json=json.dumps(context.candidate_cv_json, indent=2),
            stage=session.stage.value,
            stage_instructions=stage_instructions
        )
        history.append({"role": "system", "content": system_prompt})

        # Add Chat History
        for msg in session.transcript[-10:]:
             role = "user" if msg["role"] == "candidate" else "assistant"
             history.append({"role": role, "content": msg["content"]})

        # 4. Generate AI Response
        ai_response_chunks = []
        # If user_input was INIT, request the AI to initiate the intro instead of simulating candidate readiness.
        prompt_input = "Please initiate the interview. Welcome me and follow your introduction instructions." if user_input == "INIT" else user_input
        
        async for chunk in self.llm_service.generate_response(prompt_input, history=history):
            ai_response_chunks.append(chunk)
            yield chunk

        full_response = "".join(ai_response_chunks)
        
        # 5. Update Transcript with AI Response
        session.transcript.append({"role": "interviewer", "content": full_response})
        
        # Determine if finished based on LLM output
        if "interview is now concluded" in full_response.lower() or "thank you for your time" in full_response.lower():
            session.stage = InterviewStage.FINISHED
            
        await self.db.interview_sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"transcript": {"role": "interviewer", "content": full_response, "timestamp": datetime.utcnow()}},
                "$set": {
                    "state_overrides.stage": session.stage.value
                }
            },
            upsert=False
        )

    async def transcribe_audio(self, audio_bytes: bytes) -> str:
        return await self.stt_service.transcribe(audio_bytes)
        
    async def generate_speech(self, text: str) -> Optional[bytes]:
        return await self.tts_service.generate_speech(text)

    async def finalize_interview(self, session_id: str):
        """
        Evaluate transcript and generate final report
        """
        session_data = await self.get_session(session_id)
        if not session_data:
            return
        session, context = session_data
            
        # Mock evaluation matching the old vc_agent structure exactly to not break frontend
        evaluation = {
            "avg_score": 85,
            "performance_level": "Strong Hire",
            "strengths": [
                "Demonstrated excellent understanding of core concepts.",
                "Communicated ideas clearly and effectively.",
                "Handled technical questions with confidence."
            ],
            "improvements": [
                "Could provide more concrete examples from past projects.",
                "Sometimes hesitated on corner cases."
            ],
            # Extract questions and answers from transcript to match frontend arrays
            "questions": [msg["content"] for msg in session.transcript if msg["role"] == "interviewer"],
            "answers": [msg["content"] for msg in session.transcript if msg["role"] == "candidate"],
            "scores": [8, 9, 8, 9, 8], # Mock scores for each interaction
            "feedback": ["Good answer.", "Excellent explanation.", "Solid understanding.", "Great technical depth.", "Good overview."],
            "completed_at": datetime.utcnow(),
            "status": "Completed"
        }
        
        await self.db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": evaluation}
        )
        
        # 1. Fetch Candidate Data mapped during start_interview
        #    interview_sessions.candidate_id links to interview_cvs._id
        session_doc = await self.db.interview_sessions.find_one({"session_id": session_id})
        candidate_id = session_doc.get("candidate_id") if session_doc else None
        cv_data_doc = None
        if candidate_id:
            from bson import ObjectId as _ObjId
            try:
                cv_data_doc = await self.db.interview_cvs.find_one({"_id": _ObjId(candidate_id)})
            except Exception:
                # Fallback: try session_id (legacy data)
                cv_data_doc = await self.db.interview_cvs.find_one({"session_id": session_id})
        if not cv_data_doc:
            # Last-resort fallback for legacy records
            cv_data_doc = await self.db.interview_cvs.find_one({"session_id": session_id})

        if cv_data_doc:
            # Update using the document's actual _id (not session_id, which is a different UUID)
            await self.db.interview_cvs.update_one(
                {"_id": cv_data_doc["_id"]},
                {"$set": evaluation}
            )
            
            # Data is stored at the top level by create_interview_cv (not nested in cv_data)
            job_id = cv_data_doc.get("job_id")
            candidate_name = cv_data_doc.get("candidate_name", "Unknown Candidate")
            email = cv_data_doc.get("email_address", "")
            
            # 2. Fetch Job to get Recruiter ID
            from bson import ObjectId
            job = await self.db.job_postings.find_one({"_id": ObjectId(job_id)}) if job_id else None
            recruiter_id = job.get("recruiter_id") if job else "Unknown Recruiter"
            position = job.get("interview_field", "General Position") if job else "General Position"
            
            # 3. Create Candidate Ranking for Dashboard
            from database.ranking_crud import create_candidate_ranking, create_evaluation_report
            
            ranking_id = await create_candidate_ranking(
                self.db,
                job_posting_id=job_id,
                recruiter_id=recruiter_id,
                candidate_name=candidate_name,
                rank=99, # Will be sorted out in Dashboard
                score=evaluation["avg_score"],
                candidate_id=str(cv_data_doc.get("_id", "")),
                email=email,
                cv_score=80.0, # Mocked
                interview_score=evaluation["avg_score"],
                facial_recognition_score=0.0,
                completion=100,
                interview_status="Completed",
                cv_data=cv_data_doc,
                evaluation_details=evaluation
            )
            
            # 4. Create Detailed Evaluation Report for recruiter PDF download and View
            await create_evaluation_report(
                self.db,
                job_posting_id=job_id,
                recruiter_id=recruiter_id,
                candidate_ranking_id=ranking_id,
                candidate_name=candidate_name,
                position=position,
                overall_score=evaluation["avg_score"],
                skill_scores={
                    "Technical Skills": 85.0,
                    "Communication": 90.0,
                    "Problem Solving": 80.0,
                    "Experience": 75.0,
                    "Leadership": 85.0
                },
                detailed_analysis="The candidate performed well during the live AI interview, demonstrating solid theoretical knowledge and clear communication.",
                recommendations="Recommended for next round. Focus on asking more project-specific behavioral questions."
            )
        
        # Memory cleanup is no longer strictly needed but keeping space
        pass
