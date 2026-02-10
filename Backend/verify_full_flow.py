import requests
import json
import os

BASE_URL = "http://localhost:8000"

def create_mock_job():
    print("Creating mock job...")
    job_data = {
        "recruiterId": "test_recruiter_123", # Mock Recruiter ID
        "interviewField": "Software Engineering",
        "positionLevel": "Senior",
        "workModel": "Remote",
        "status": "Active",
        "location": "Remote",
        "salaryRange": "$120k - $150k",
        "experienceRange": "5-7 years",
        "industryDomain": "Tech",
        "specificInstruction": "None",
        "jobDescription": "We are looking for an expert Python developer with experience in FastAPI and AI integration.",
        "questions": [
            {"text": "Explain the GIL.", "type": "technical", "difficulty": "medium"},
            {"text": "How do you handle async operations?", "type": "technical", "difficulty": "hard"}
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/jobs/create", json=job_data)
        if response.status_code == 200:
            result = response.json()
            if result.get("success") and "job" in result:
                job_id = result["job"]["id"]
                print(f"Job created successfully: {job_id}")
                return job_id
            else:
                print(f"Failed to create job: {result}")
        else:
            print(f"Error creating job: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error creating job: {e}")
    
    return None

def verify_initiate_interview(job_id):
    print(f"Verifying interview initiation for Job ID: {job_id}")
    
    # Create a dummy CV file
    with open("dummy_cv.pdf", "wb") as f:
        f.write(b"%PDF-1.4 mock pdf content")

    files = {
        'cv_file': ('dummy_cv.pdf', open('dummy_cv.pdf', 'rb'), 'application/pdf')
    }
    
    data = {
        'job_id': job_id,
        'candidate_name': "Test Candidate",
        'email_address': "test@example.com",
        'phone_number': "1234567890"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/voice-interview/initiate", data=data, files=files)
        print(f"Initiate Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if 'session_id' in result:
                print("SUCCESS: Session ID returned.")
                return True
        else:
            print("FAILURE: Initiate failed.")
    except Exception as e:
        print(f"Error during initiate: {e}")
    finally:
        if os.path.exists("dummy_cv.pdf"):
            os.remove("dummy_cv.pdf")
            
    return False

if __name__ == "__main__":
    job_id = create_mock_job()
    if job_id:
        verify_initiate_interview(job_id)
    else:
        print("Could not get a job ID to test with.")
