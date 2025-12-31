"""
CV Screener Backend - Main Application
Uses Gemini 2.5 Flash for CV screening against Job Descriptions
Integrated with MongoDB for data persistence
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.routes import router as api_router
from database.connection import db_manager

# Load environment variables
load_dotenv()

# Create upload directories
UPLOAD_DIRS = [
    Path("uploads/interview_cvs"),
    Path("uploads/screening_cvs")
]
for upload_dir in UPLOAD_DIRS:
    upload_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Upload directory ready: {upload_dir}")

# Create FastAPI app
app = FastAPI(
    title="RecruBotX CV Screener API",
    description="API for screening CVs against Job Descriptions using Gemini 2.5 Flash and MongoDB",
    version="2.0.0"
)

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup."""
    strict_startup = os.getenv("MONGODB_STRICT_STARTUP", "true").lower() in {
        "1",
        "true",
        "yes",
        "y",
        "on",
    }
    try:
        await db_manager.connect()
    except Exception as e:
        print(f"⚠ MongoDB connection failed: {e}")
        if strict_startup:
            print("❌ MONGODB_STRICT_STARTUP=true, shutting down...")
            raise
        # Allow app to boot so /health can report the failure.
        print("✓ Continuing without MongoDB (MONGODB_STRICT_STARTUP=false)")
        print("  → Authentication and database features will be unavailable")
        print("  → To fix: Start MongoDB or update MONGODB_URL in .env")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown."""
    await db_manager.disconnect()


@app.get("/")
async def root():
    return {
        "message": "RecruBotX CV Screener API",
        "version": "2.0.0",
        "status": "running",
        "database": "MongoDB"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check database connection
        if db_manager.client is None:
            db_status = "disconnected"
        else:
            await db_manager.client.admin.command('ping')
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "database": db_status
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run("main:app", host=host, port=port, reload=True)
