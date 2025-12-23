"""
CV Screener Backend - Main Application
Uses Gemini 2.5 Flash for CV screening against Job Descriptions
Integrated with MongoDB for data persistence
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.routes import router as api_router
from database.connection import db_manager

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="RecruBotX CV Screener API",
    description="API for screening CVs against Job Descriptions using Gemini 2.5 Flash and MongoDB",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    except Exception:
        if strict_startup:
            raise
        # Allow app to boot so /health can report the failure.
        print("! Continuing without MongoDB (MONGODB_STRICT_STARTUP=false)")


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
        await db_manager.client.admin.command('ping')
        db_status = "connected"
    except Exception:
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
