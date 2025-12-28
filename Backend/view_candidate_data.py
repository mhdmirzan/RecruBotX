"""
View candidate data and CVs from interview_cvs collection
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def view_all_candidates():
    """Display all candidate data from the database."""
    
    # Connect to MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.recrubot_db
    
    print("\n" + "="*80)
    print("CANDIDATE DATA AND CV RECORDS")
    print("="*80 + "\n")
    
    # Fetch all interview CV records
    cursor = db.interview_cvs.find().sort("created_at", -1)
    records = await cursor.to_list(length=100)
    
    if not records:
        print("No candidate records found in database.")
        return
    
    print(f"Total Records: {len(records)}\n")
    
    for idx, record in enumerate(records, 1):
        print(f"\n{'─'*80}")
        print(f"RECORD #{idx}")
        print(f"{'─'*80}")
        
        print(f"\n📋 Session Details:")
        print(f"   Session ID:      {record.get('session_id', 'N/A')}")
        print(f"   Interview Field: {record.get('interview_field', 'N/A')}")
        print(f"   Position Level:  {record.get('position_level', 'N/A')}")
        print(f"   Created At:      {record.get('created_at', 'N/A')}")
        
        print(f"\n👤 Personal Information:")
        print(f"   Name:            {record.get('candidate_name', 'N/A')}")
        print(f"   Email:           {record.get('email_address', 'N/A')}")
        print(f"   Phone:           {record.get('phone_number', 'N/A')}")
        
        print(f"\n📄 CV Information:")
        print(f"   CV Filename:     {record.get('cv_file_name', 'N/A')}")
        print(f"   CV File Path:    {record.get('cv_file_path', 'N/A')}")
        cv_path = record.get('cv_file_path')
        if cv_path and os.path.exists(cv_path):
            file_size = os.path.getsize(cv_path)
            print(f"   File Size:       {file_size:,} bytes ({file_size/1024:.2f} KB)")
            print(f"   File Exists:     ✅ Yes")
        else:
            print(f"   File Exists:     ❌ No")
        
        print(f"\n🎓 Education ({len(record.get('education', []))} entries):")
        for edu in record.get('education', []):
            print(f"   • {edu}")
        
        print(f"\n💼 Projects ({len(record.get('projects', []))} entries):")
        for proj in record.get('projects', []):
            print(f"   • {proj}")
        
        print(f"\n🛠️ Skills ({len(record.get('skills', []))} entries):")
        skills = record.get('skills', [])
        if skills:
            print(f"   {', '.join(skills)}")
        
        print(f"\n📊 Experience:")
        experience = record.get('experience', 'N/A')
        if experience and experience != 'N/A':
            # Print experience with proper formatting
            exp_lines = experience.split('\n')
            for line in exp_lines:
                print(f"   {line}")
        else:
            print(f"   {experience}")
        
        if record.get('certifications'):
            print(f"\n🏆 Certifications ({len(record.get('certifications', []))} entries):")
            for cert in record.get('certifications', []):
                print(f"   • {cert}")
        
        if record.get('summary'):
            print(f"\n📝 Summary:")
            print(f"   {record.get('summary')}")
    
    print(f"\n{'='*80}\n")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(view_all_candidates())
