from fastapi import FastAPI

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

# Include routers
app.include_router(cv_screener_router, prefix="/api/v1", tags=["CV Screening"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the CV Screening API"}

