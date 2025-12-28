"""
Test Script for Voice Interview CV Feature
===========================================

Tests the CV extraction and database storage functionality.

Usage:
    python test_cv_feature.py path/to/test.pdf
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from cv_screener.cv_parser import parse_cv_file
from cv_screener.cv_extractor import extract_cv_information, format_cv_summary
from database.connection import get_database
from database.crud import create_interview_cv, get_interview_cv_by_session
import uuid
from datetime import datetime


async def test_cv_extraction(cv_file_path: str):
    """Test CV extraction pipeline."""
    
    print("=" * 70)
    print("Testing Voice Interview CV Feature")
    print("=" * 70)
    print()
    
    # Step 1: Parse CV
    print("📄 Step 1: Parsing CV file...")
    try:
        cv_text = parse_cv_file(cv_file_path)
        print(f"  ✅ Successfully extracted {len(cv_text)} characters")
        print(f"  Preview: {cv_text[:200]}...")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False
    
    print()
    
    # Step 2: Extract Information
    print("🤖 Step 2: Extracting information using AI...")
    try:
        cv_info = extract_cv_information(cv_text)
        print("  ✅ Successfully extracted information")
        print()
        print("  Extracted Data:")
        print(f"    - Name: {cv_info.get('candidate_name')}")
        print(f"    - Email: {cv_info.get('email_address')}")
        print(f"    - Phone: {cv_info.get('phone_number')}")
        print(f"    - Education: {len(cv_info.get('education', []))} items")
        print(f"    - Projects: {len(cv_info.get('projects', []))} items")
        print(f"    - Skills: {len(cv_info.get('skills', []))} items")
        print(f"    - Experience: {cv_info.get('experience')}")
        print(f"    - Certifications: {len(cv_info.get('certifications', []))} items")
        
        if cv_info.get('error'):
            print(f"  ⚠️  Warning: {cv_info['error']}")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False
    
    print()
    
    # Step 3: Store in Database
    print("💾 Step 3: Storing in database...")
    try:
        db = await get_database()
        session_id = str(uuid.uuid4())
        
        cv_data = {
            **cv_info,
            "cv_file_name": Path(cv_file_path).name,
            "cv_file_path": cv_file_path,
            "interview_field": "Software Engineering",
            "position_level": "Intermediate"
        }
        
        cv_id = await create_interview_cv(db, session_id, cv_data)
        print(f"  ✅ Successfully stored with ID: {cv_id}")
        print(f"  Session ID: {session_id}")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False
    
    print()
    
    # Step 4: Retrieve from Database
    print("🔍 Step 4: Retrieving from database...")
    try:
        stored_cv = await get_interview_cv_by_session(db, session_id)
        if stored_cv:
            print("  ✅ Successfully retrieved")
            print()
            print("  Stored Data:")
            print(f"    - ID: {stored_cv['_id']}")
            print(f"    - Session: {stored_cv['session_id']}")
            print(f"    - Candidate: {stored_cv.get('candidate_name')}")
            print(f"    - Email: {stored_cv.get('email_address')}")
            print(f"    - Field: {stored_cv.get('interview_field')}")
            print(f"    - Level: {stored_cv.get('position_level')}")
            print(f"    - Created: {stored_cv.get('created_at')}")
        else:
            print("  ❌ Could not retrieve stored data")
            return False
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False
    
    print()
    
    # Step 5: Format Summary
    print("📋 Step 5: Formatted CV Summary:")
    print("-" * 70)
    summary = format_cv_summary(cv_info)
    print(summary)
    print("-" * 70)
    
    print()
    print("=" * 70)
    print("✅ All Tests Passed!")
    print("=" * 70)
    print()
    print("The CV feature is working correctly!")
    print(f"Test session ID: {session_id}")
    print()
    
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_cv_feature.py path/to/cv.pdf")
        print()
        print("Example: python test_cv_feature.py test_resume.pdf")
        sys.exit(1)
    
    cv_file = sys.argv[1]
    
    if not Path(cv_file).exists():
        print(f"Error: File not found: {cv_file}")
        sys.exit(1)
    
    if not cv_file.lower().endswith('.pdf'):
        print("Error: Only PDF files are supported")
        sys.exit(1)
    
    from dotenv import load_dotenv
    load_dotenv()
    
    success = asyncio.run(test_cv_extraction(cv_file))
    sys.exit(0 if success else 1)
