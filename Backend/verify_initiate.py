import requests
import json
import os

BASE_URL = "http://localhost:8000/api"

def test_initiate_interview():
    # 1. Create a Job Posting first (or get existing)
    # For simplicity, let's assume we can create one or there is one
    # But to be safe, let's create a dummy job
    
    print("Creating Dummy Job...")
    job_data = {
        "recruiterId": "test_recruiter",
        "interviewField": "Python Developer",
        "positionLevel": "Junior",
        "workModel": "Remote",
        "status": "Full-time",
        "location": "New York",
        "salaryRange": "$80k - $100k",
        "experienceRange": "0-2 years",
        "industryDomain": "Tech",
        "jobDescription": "We are looking for a Python Developer who knows FastAPI and AI integration. Must have experience with REST APIs.",
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
        
        # 2. Upload a dummy PDF CV
        # Create a dummy PDF file
        with open("dummy_cv.pdf", "wb") as f:
            f.write(b"%PDF-1.4\n%Dummy PDF Content to simulate CV")
            
        # 3. Call initiate_interview
        print("\nInitiating Interview...")
        
        files = {
            'cv_file': ('dummy_cv.pdf', open('dummy_cv.pdf', 'rb'), 'application/pdf')
        }
        
        data = {
            'job_id': job_id,
            'candidate_name': "Test Candidate",
            'email_address': "test@example.com",
            'phone_number': "1234567890",
            'linkedin_profile': "https://linkedin.com/in/test"
        }
        
        resp = requests.post(f"{BASE_URL}/voice-interview/initiate", data=data, files=files)
        
        if resp.status_code == 200:
            result = resp.json()
            print("✅ Interview Initiated Successfully!")
            print(f"Session ID: {result.get('session_id')}")
            print(f"First Question: {result.get('question')}")
            print(f"Context Message: {result.get('message')}")
        else:
            print(f"❌ Failed to initiate interview: {resp.status_code} - {resp.text}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Cleanup
        if os.path.exists("dummy_cv.pdf"):
            os.remove("dummy_cv.pdf")

if __name__ == "__main__":
    test_initiate_interview()
