import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_get_all_jobs():
    print("Testing GET /jobs/all...")
    try:
        resp = requests.get(f"{BASE_URL}/jobs/all")
        if resp.status_code == 200:
            jobs = resp.json()
            print(f"✅ Success: Retrieved {len(jobs)} jobs")
            if len(jobs) > 0:
                print(f"Sample Job: {jobs[0].get('company') or jobs[0].get('interviewField')} - {jobs[0].get('positionLevel')}")
        else:
            print(f"❌ Failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_get_all_jobs()
