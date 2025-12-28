# Voice Interview CV Analysis Feature

## Overview
This feature extracts structured information from candidate CVs during voice interview setup and stores it in the database for analysis and tracking.

## Components

### 1. Database Model (`database/models.py`)
- **InterviewCVModel**: Pydantic model for CV data storage
- Fields: contact info, education, projects, skills, experience, certifications, etc.

### 2. CV Extractor (`cv_screener/cv_extractor.py`)
- Uses Google Gemini AI to extract structured information from CV text
- Extracts: name, phone, email, education, projects, skills, experience, certifications, summary

### 3. Database Operations (`database/crud.py`)
- `create_interview_cv()`: Store extracted CV data
- `get_interview_cv_by_session()`: Retrieve CV data by session ID
- `get_interview_cv_by_id()`: Retrieve CV data by ID
- `get_all_interview_cvs()`: List all interview CVs
- `update_interview_cv()`: Update CV information

### 4. API Endpoint (`vc_agent/api_routes.py`)
- **POST** `/api/voice-interview/start-session-with-cv`
  - Accepts: PDF file, interview_field, position_level, num_questions
  - Returns: session_id, first question, extracted CV details

### 5. Frontend Integration (`Frontend/src/VoiceInterview.js`)
- CV upload field (PDF only, required)
- Sends FormData with CV file and interview configuration
- Displays extracted CV details in console

## Setup Instructions

### 1. Initialize Database Collection
```bash
cd Backend
python database/init_interview_cvs_collection.py
```

This creates the `interview_cvs` collection with appropriate indexes:
- Unique index on `session_id`
- Indexes on `created_at`, `interview_field`, `position_level`, `email_address`
- Compound index on `interview_field` + `position_level`

### 2. Environment Variables
Ensure your `.env` file has:
```env
GOOGLE_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=recrubotx_db
```

### 3. Required Python Packages
```bash
pip install google-generativeai PyPDF2 python-docx motor
```

## Usage Flow

1. **Candidate uploads CV** (PDF format)
2. **Selects interview field and position level**
3. **Clicks "Start Interview"**
4. **Backend processes:**
   - Saves CV file to `uploads/interview_cvs/`
   - Extracts text from PDF
   - Uses AI to extract structured information
   - Stores data in MongoDB `interview_cvs` collection
   - Returns interview session details
5. **Interview begins** with first question

## Data Structure

### Extracted CV Information
```json
{
  "session_id": "uuid",
  "candidate_name": "John Doe",
  "phone_number": "+1-234-567-8900",
  "email_address": "john@example.com",
  "education": [
    "B.Sc Computer Science, MIT, 2020",
    "M.Sc AI, Stanford, 2022"
  ],
  "projects": [
    "AI Chatbot using NLP",
    "E-commerce Platform with React"
  ],
  "skills": [
    "Python", "JavaScript", "React", "MongoDB", "FastAPI"
  ],
  "experience": "3 years",
  "certifications": [
    "AWS Certified Developer",
    "Google Cloud Professional"
  ],
  "summary": "Experienced software developer...",
  "cv_file_name": "john_doe_resume.pdf",
  "cv_file_path": "uploads/interview_cvs/uuid_timestamp_john_doe_resume.pdf",
  "interview_field": "Software Engineering",
  "position_level": "Intermediate",
  "created_at": "2025-12-28T..."
}
```

## Database Queries

### Get CV by Session ID
```python
from database.connection import get_database
from database.crud import get_interview_cv_by_session

db = await get_database()
cv_data = await get_interview_cv_by_session(db, session_id)
```

### Get All CVs for a Field
```python
db = await get_database()
cvs = await db.interview_cvs.find({
    "interview_field": "Software Engineering"
}).to_list(length=100)
```

### Get Recent CVs
```python
db = await get_database()
recent_cvs = await db.interview_cvs.find().sort("created_at", -1).limit(10).to_list(length=10)
```

## File Storage

CV files are stored in: `Backend/uploads/interview_cvs/`

Filename format: `{session_id}_{timestamp}_{original_filename}`

Example: `abc123-def456_20251228_153045_john_resume.pdf`

## Error Handling

- **Invalid file type**: Returns 400 error if non-PDF file uploaded
- **AI extraction failure**: Returns default structure with error field
- **Database error**: Returns 500 error with details
- **Missing fields**: Frontend validates all required fields before submission

## Future Enhancements

1. Support for DOCX format CVs
2. Enhanced AI extraction with more fields
3. CV quality scoring
4. Duplicate detection based on email/phone
5. CV comparison with job requirements
6. Analytics dashboard for CV data
7. Export CV data to Excel/CSV

## Testing

### Test the endpoint:
```bash
curl -X POST "http://localhost:8000/api/voice-interview/start-session-with-cv" \
  -F "cv_file=@path/to/resume.pdf" \
  -F "interview_field=Software Engineering" \
  -F "position_level=Intermediate" \
  -F "num_questions=5"
```

### Expected response:
```json
{
  "success": true,
  "session_id": "abc-123-def",
  "cv_id": "cv_mongo_id",
  "interview_field": "Software Engineering",
  "position_level": "Intermediate",
  "total_questions": 5,
  "current_question": 1,
  "question": "Tell me about your experience with...",
  "cv_details": {
    "candidate_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "skills_count": 15,
    "education_count": 2,
    "projects_count": 5
  },
  "message": "Interview session started successfully with CV analysis"
}
```

## Troubleshooting

### Issue: Collection not found
**Solution**: Run `init_interview_cvs_collection.py`

### Issue: AI extraction fails
**Solution**: Check GOOGLE_API_KEY in .env file

### Issue: File upload fails
**Solution**: Ensure `uploads/interview_cvs/` directory exists and has write permissions

### Issue: PDF parsing error
**Solution**: Verify PyPDF2 is installed and PDF is not corrupted
