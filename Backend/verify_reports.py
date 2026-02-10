import requests
import json
import os
import time

BASE_URL = "http://localhost:8000/api"

def test_report_flow():
    print("Testing Report Flow...")
    
    # 1. Create a Job
    job_data = {
        "recruiterId": "test_recruiter_reports",
        "interviewField": "Report Test Engineer",
        "positionLevel": "Senior",
        "workModel": "Remote",
        "status": "Full-time",
        "location": "Boston",
        "salaryRange": "$120k",
        "experienceRange": "5+ years",
        "industryDomain": "Tech",
        "jobDescription": "Testing reports.",
        "questions": [],
        "specificInstruction": "None"
    }
    
    resp = requests.post(f"{BASE_URL}/jobs/create", json=job_data)
    if resp.status_code != 200:
        print(f"Failed to create job: {resp.text}")
        return
    job_id = resp.json()["job"]["id"]
    print(f"Created Job: {job_id}")
    
    # 2. Upload CV & Initiate Interview (Simulate Candidate)
    with open("report_cv.pdf", "wb") as f:
        f.write(b"%PDF-1.4\nCV Content")
        
    try:
        with open('report_cv.pdf', 'rb') as f:
            files = {'cv_file': ('report_cv.pdf', f, 'application/pdf')}
            data = {'job_id': job_id, 'candidate_name': "Report Candidate", 'email_address': "report@test.com", 'phone_number': "555-0199", 'linkedin_profile': "linkedin.com/in/report"}
            
            print("Initiating Interview...")
            resp = requests.post(f"{BASE_URL}/voice-interview/initiate", data=data, files=files)
            if resp.status_code != 200:
                print(f"Init failed: {resp.text}")
                return
            session_id = resp.json()["session_id"]
            print(f"Session Started: {session_id}")
            
        # 3. Simulate Interview Answers
        answer_data = {"text_answer": "I am a test answer."}
        print(f"Submitting answer for session {session_id}...")
        resp = requests.post(f"{BASE_URL}/voice-interview/submit-answer/{session_id}", data=answer_data)
        if resp.status_code == 200:
            print("✅ Answer submitted.")
        else:
            print(f"⚠️ Answer submit failed: {resp.text}")

        # 4. Generate Report
        print("Generating Report...")
        resp = requests.post(f"{BASE_URL}/voice-interview/generate-report/{session_id}")
        if resp.status_code == 200:
            print("✅ Report Generated!")
            report_path = resp.json().get("report_path")
            print(f"Report Path: {report_path}")
        else:
            print(f"❌ Report Generation Failed: {resp.text}")
            # Continue anyway to check if partial data exists
            
        # 5. Fetch Reports by Job
        print("Fetching Reports for Job...")
        # Give DB a moment to update
        time.sleep(1)
        resp = requests.get(f"{BASE_URL}/voice-interview/reports/{job_id}")
        if resp.status_code == 200:
            reports = resp.json().get("reports", [])
            print(f"Found {len(reports)} reports for job {job_id}")
            if len(reports) > 0:
                print("✅ Reports List Verified")
                report_id = reports[0]["_id"]
                
                # 6. Fetch Single Report Detail
                print(f"Fetching Detail for Report {report_id}...")
                resp = requests.get(f"{BASE_URL}/voice-interview/report/{report_id}")
                if resp.status_code == 200:
                    detail = resp.json()
                    print("✅ Report Detail Verified")
                    print(f"Candidate: {detail.get('candidate_name')}")
                    print(f"Score: {detail.get('avg_score')}")
                else:
                    print(f"❌ Report Detail Failed: {resp.text}")
            else:
                print("❌ No reports found in list")
        else:
            print(f"❌ Fetch Reports Failed: {resp.text}")
            
    except Exception as e:
        print(f"Exception during test: {e}")
        
    finally:
        # Cleanup
        try:
            if os.path.exists("report_cv.pdf"):
                os.remove("report_cv.pdf")
        except Exception as e:
            print(f"Cleanup failed: {e}")

if __name__ == "__main__":
    test_report_flow()
