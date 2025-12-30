"""
Recruiter User CRUD Operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

# ==================== Recruiter Users ====================

async def create_recruiter_user(
    db: AsyncIOMotorDatabase,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    company_name: Optional[str] = None,
    company_website: Optional[str] = None,
    phone: Optional[str] = None
) -> str:
    """Create a new recruiter user."""
    user = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email.lower(),
        "password": password,  # In production, hash this with bcrypt
        "company_name": company_name,
        "company_website": company_website,
        "phone": phone,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_active": True
    }
    result = await db.recruiter_users.insert_one(user)
    return str(result.inserted_id)


async def get_recruiter_by_email(
    db: AsyncIOMotorDatabase,
    email: str
) -> Optional[Dict[str, Any]]:
    """Get a recruiter by email."""
    user = await db.recruiter_users.find_one({"email": email.lower()})
    if user:
        user["_id"] = str(user["_id"])
    return user


async def get_recruiter_by_id(
    db: AsyncIOMotorDatabase,
    user_id: str
) -> Optional[Dict[str, Any]]:
    """Get a recruiter by ID."""
    user = await db.recruiter_users.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = str(user["_id"])
    return user


async def get_all_recruiters(
    db: AsyncIOMotorDatabase
) -> List[Dict[str, Any]]:
    """Get all recruiter users."""
    users = []
    cursor = db.recruiter_users.find({})
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users


async def update_recruiter(
    db: AsyncIOMotorDatabase,
    user_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """Update recruiter information."""
    update_data["updated_at"] = datetime.utcnow()
    result = await db.recruiter_users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0
