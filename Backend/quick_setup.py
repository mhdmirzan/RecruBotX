#!/usr/bin/env python3
"""
Quick Setup Script for Voice Interview CV Feature
==================================================

This script performs all necessary setup steps:
1. Creates the interview_cvs collection
2. Sets up indexes
3. Verifies the setup

Usage:
    python quick_setup.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from database.init_interview_cvs_collection import init_interview_cvs_collection


async def main():
    """Run all setup tasks."""
    
    print("=" * 70)
    print("Voice Interview CV Feature - Quick Setup")
    print("=" * 70)
    print()
    
    # Check environment variables
    print("🔍 Checking environment variables...")
    required_vars = ["MONGODB_URI", "GOOGLE_API_KEY", "DATABASE_NAME"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
            print(f"  ❌ {var}: Not set")
        else:
            print(f"  ✅ {var}: Set")
    
    if missing_vars:
        print()
        print("⚠️  Warning: Some environment variables are missing!")
        print("   Please set them in your .env file before proceeding.")
        print(f"   Missing: {', '.join(missing_vars)}")
        print()
    
    # Create uploads directory
    print()
    print("📁 Creating uploads directory...")
    uploads_dir = Path("uploads/interview_cvs")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    print(f"  ✅ Created: {uploads_dir.absolute()}")
    
    # Initialize database collection
    print()
    try:
        await init_interview_cvs_collection()
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False
    
    print()
    print("=" * 70)
    print("✨ Setup Complete!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Start the backend: uvicorn main:app --reload")
    print("2. Start the frontend: npm start")
    print("3. Navigate to Voice Interview page")
    print("4. Upload a CV and start an interview!")
    print()
    
    return True


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
