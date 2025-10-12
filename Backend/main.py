import os
import sys
from pathlib import Path

# Ensure the script directory is in the Python path
script_dir = Path(__file__).resolve().parent
sys.path.append(str(script_dir))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from models.cv_screener import Base
from api.cv_screener import router as cv_screener_router

# Delete database tables
Base.metadata.drop_all(bind=engine)

# Create database tables
Base.metadata.create_all(bind=engine)
   
app = FastAPI(
    title="CV Screening API",
    description="An API for screening CVs against job descriptions using AI-powered similarity matching",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(cv_screener_router, prefix="/api/v1", tags=["CV Screening"])

# Get the absolute path to the static directory using pathlib
static_dir = script_dir / 'static'

# Mount static files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to the CV Screening API"}

