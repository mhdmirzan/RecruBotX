from sqlalchemy import Column, Integer, String, DateTime, Numeric
from sqlalchemy.sql import func
from .db import Base

class CVSimilarity(Base):
    __tablename__ = "cv_similarity"

    id = Column(Integer, primary_key=True, index=True)
    cv_filename = Column(String, index=True)
    job_description_id = Column(Integer, index=True)
    score = Column(Numeric(10, 3))
    missing_skills = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
