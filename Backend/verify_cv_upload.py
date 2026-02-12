
import requests
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pymongo.uri_parser import parse_uri
from dotenv import load_dotenv

# Load env for DB connection
load_dotenv()

BASE_URL = "http://localhost:8000/api"
MONGODB_URI = os.getenv("MONGODB_URI", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))

# Logic from connection.py to determine DB name
db_name = os.getenv("MONGODB_DB_NAME")
if not db_name:
    try:
        parsed = parse_uri(MONGODB_URI)
        db_name = parsed.get("database")
    except Exception:
        db_name = None
DATABASE_NAME = db_name or "recrubotx"

async def verify_db(job_id, cv_filename):
    print(f"\nConnected to DB: {MONGODB_URI}")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # Check Job Posting
    job = await db.job_postings.find_one({"_id": ObjectId(job_id)})
    if not job:
        print("❌ Job not found in DB!")
        return False

    print(f"✅ Job found. CV IDs: {job.get('cv_file_ids', [])}")
    
    cv_ids = job.get('cv_file_ids', [])
    if not cv_ids:
        print("❌ No CV IDs linked to job!")
        return False
        
    cv_id = cv_ids[-1] # Get latest
    
    # Check CV File
    cv_file = await db.job_cv_files.find_one({"_id": ObjectId(cv_id)})
    if not cv_file:
        print(f"❌ CV File {cv_id} not found in job_cv_files collection!")
        return False
        
    print(f"✅ CV File found: {cv_file.get('file_name')} (Size: {cv_file.get('file_size')})")
    
    if cv_file.get('file_name') == cv_filename:
        print("✅ Filename matches!")
    else:
        print(f"❌ Filename mismatch: {cv_file.get('file_name')} != {cv_filename}")
        
    return True

def run_test():
    # 1. Create Job
    print("Creating Test Job...")
    job_data = {
        "recruiterId": "test_recruiter_verify",
        "interviewField": "Verification Eng",
        "positionLevel": "Senior",
        "workModel": "Remote",
        "status": "Contract",
        "location": "Verif City",
        "salaryRange": "$100k",
        "experienceRange": "5+ years",
        "industryDomain": "Tech",
        "jobDescription": "Verification job description.",
        "questions": [],
        "specificInstruction": "None"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/jobs/create", json=job_data)
        if resp.status_code != 200:
            print(f"Failed to create job: {resp.text}")
            return
        
        job_id = resp.json()["job"]["id"]
        print(f"Created Job ID: {job_id}")
        
        # 2. Upload CV
        cv_filename = "test_upload_cv.pdf"
        with open(cv_filename, "wb") as f:
            f.write(b"%PDF-1.4\n%Test PDF Content")
            
        print("\nInitiating Interview with CV...")
        files = {
            'cv_file': (cv_filename, open(cv_filename, 'rb'), 'application/pdf')
        }
        
        data = {
            'job_id': job_id,
            'candidate_name': "Verifier Guy",
            'email_address': "verify@example.com",
            'phone_number': "555-0199",
            'linkedin_profile': ""
        }
        
        # FIX: The route is /voice-interview/initiate, NOT /api/voice-interview/initiate if BASE_URL has /api
        print("\nInitiating Interview with CV...")
        
        # Open file in a context manager or close explicitly
        files_obj = open(cv_filename, 'rb')
        files = {
            'cv_file': (cv_filename, files_obj, 'application/pdf')
        }
        
        try:
            resp = requests.post(f"{BASE_URL}/voice-interview/initiate", data=data, files=files)
        finally:
            files_obj.close()
        
        if resp.status_code != 200:
            print(f"❌ Failed to initiate interview: {resp.status_code} - {resp.text}")
            return
            
        print("✅ Interview Initiated.")
        # Print session info
        try:
            res_json = resp.json()
            print(f"Session ID: {res_json.get('session_id')}")
        except:
            pass
        
        # 3. Verify DB
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success = loop.run_until_complete(verify_db(job_id, cv_filename))
        
        if success:
            print("\n🎉 VERIFICATION SUCCESSFUL!")
        else:
            print("\nFAILED verification.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists("test_upload_cv.pdf"):
            os.remove("test_upload_cv.pdf")

if __name__ == "__main__":
    run_test()
