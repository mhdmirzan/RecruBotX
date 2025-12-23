"""
Database Models and Schemas
============================

Pydantic models for MongoDB documents.
"""

from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    GetCoreSchemaHandler,
    GetJsonSchemaHandler,
)
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    """Custom ObjectId type compatible with Pydantic v2."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        # Accept strings or ObjectId instances and normalize to ObjectId
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.union_schema(
                [core_schema.is_instance_schema(ObjectId), core_schema.str_schema()]
            ),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema_obj: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema_obj)
        json_schema.update(type="string", examples=["6568e2f0c1a5c1a5c1a5c1a5"])
        return json_schema

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(str(v)):
            raise ValueError("Invalid ObjectId")
        return ObjectId(str(v))


class JobDescriptionModel(BaseModel):
    """Job Description document model."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    content: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )


class CVModel(BaseModel):
    """CV document model."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    file_name: str
    content: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )


class ScreeningResultModel(BaseModel):
    """Screening result document model."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_description_id: PyObjectId
    cv_id: PyObjectId
    candidate_name: str
    file_name: str
    overall_score: float
    skills_match: float
    experience_match: float
    education_match: float
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )


class ScreeningBatchModel(BaseModel):
    """Batch screening session model."""
    
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_description_id: PyObjectId
    cv_ids: List[PyObjectId]
    result_ids: List[PyObjectId]
    total_candidates: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        populate_by_name=True,
    )
