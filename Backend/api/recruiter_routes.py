"""
Recruiter Authentication API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database.connection import get_database
from database.recruiter_crud import (
    create_recruiter_user,
    get_recruiter_by_email,
    get_recruiter_by_id,
    get_all_recruiters
)

router = APIRouter(prefix="/recruiter", tags=["Recruiter Auth"])


class RecruiterRegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    companyName: str = None
    companyWebsite: str = None
    phone: str = None


class RecruiterLoginRequest(BaseModel):
    email: str
    password: str


class RecruiterResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: str
    companyName: str = None
    companyWebsite: str = None
    phone: str = None
    createdAt: str
    isActive: bool


@router.post("/auth/register", response_model=dict)
async def register_recruiter(
    user_data: RecruiterRegisterRequest,
    db=Depends(get_database)
):
    """Register a new recruiter user."""
    # Check database connection
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Check if recruiter already exists
    existing_user = await get_recruiter_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Recruiter already exists with this email"
        )
    
    # Create new recruiter
    user_id = await create_recruiter_user(
        db,
        user_data.firstName,
        user_data.lastName,
        user_data.email,
        user_data.password,  # In production, hash this!
        user_data.companyName,
        user_data.companyWebsite,
        user_data.phone
    )
    
    # Get created user
    user = await get_recruiter_by_id(db, user_id)
    
    return {
        "success": True,
        "message": "Recruiter registered successfully",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "companyName": user.get("company_name"),
            "companyWebsite": user.get("company_website"),
            "phone": user.get("phone"),
            "profileImage": user.get("profile_image"),
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


@router.post("/auth/login", response_model=dict)
async def login_recruiter(
    login_data: RecruiterLoginRequest,
    db=Depends(get_database)
):
    """Login a recruiter user."""
    # Check database connection
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB is not connected."
        )
    
    # Get user by email
    user = await get_recruiter_by_email(db, login_data.email)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check password (in production, use bcrypt to compare hashed passwords)
    if user["password"] != login_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Recruiter account is inactive"
        )
    
    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "companyName": user.get("company_name"),
            "companyWebsite": user.get("company_website"),
            "phone": user.get("phone"),
            "profileImage": user.get("profile_image"),
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
    }


@router.get("/auth/users", response_model=list)
async def get_all_recruiter_users(db=Depends(get_database)):
    """Get all registered recruiters (admin endpoint)."""
    users = await get_all_recruiters(db)
    return [
        {
            "id": user["_id"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
            "email": user["email"],
            "companyName": user.get("company_name"),
            "companyWebsite": user.get("company_website"),
            "phone": user.get("phone"),
            "createdAt": user["created_at"].isoformat(),
            "isActive": user["is_active"]
        }
        for user in users
    ]


class RecruiterUpdateRequest(BaseModel):
    firstName: str = None
    lastName: str = None
    email: str = None
    companyName: str = None
    companyWebsite: str = None
    phone: str = None
    profileImage: str = None


@router.put("/profile/{user_id}", response_model=dict)
async def update_recruiter_profile(
    user_id: str,
    update_data: RecruiterUpdateRequest,
    db=Depends(get_database)
):
    """Update recruiter profile information."""
    from database.recruiter_crud import update_recruiter
    from bson import ObjectId
    from datetime import datetime
    
    # Check if user exists
    user = await get_recruiter_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    
    # Prepare update data - only include fields that are provided
    update_fields = {}
    
    if update_data.firstName is not None:
        update_fields["first_name"] = update_data.firstName
    if update_data.lastName is not None:
        update_fields["last_name"] = update_data.lastName
    if update_data.email is not None:
        update_fields["email"] = update_data.email
    if update_data.companyName is not None:
        update_fields["company_name"] = update_data.companyName
    if update_data.companyWebsite is not None:
        update_fields["company_website"] = update_data.companyWebsite
    if update_data.phone is not None:
        update_fields["phone"] = update_data.phone
    if update_data.profileImage is not None:
        update_fields["profile_image"] = update_data.profileImage
    
    # Always update the updated_at timestamp
    update_fields["updated_at"] = datetime.utcnow()
    
    # Update the user
    success = await update_recruiter(db, user_id, update_fields)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    
    # Get updated user
    updated_user = await get_recruiter_by_id(db, user_id)
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": updated_user["_id"],
            "firstName": updated_user["first_name"],
            "lastName": updated_user["last_name"],
            "email": updated_user["email"],
            "companyName": updated_user.get("company_name"),
            "companyWebsite": updated_user.get("company_website"),
            "phone": updated_user.get("phone"),
            "profileImage": updated_user.get("profile_image"),
            "createdAt": updated_user["created_at"].isoformat(),
            "isActive": updated_user["is_active"]
        }
    }
