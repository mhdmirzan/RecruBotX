from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Numeric
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CVSimilarity(Base):
    """Model for storing CV similarity scores against job descriptions"""
    __tablename__ = "cv_similarity"

    id = Column(Integer, primary_key=True, index=True)
    cv_filename = Column(String, index=True)
    job_description_id = Column(BigInteger, index=True)  # Changed from Integer to BigInteger
    score = Column(Numeric(10, 3))
    missing_skills = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
