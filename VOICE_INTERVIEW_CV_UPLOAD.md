# Voice Interview CV Upload - Testing Guide

## Changes Made

### Frontend (VoiceInterview.js)
1. ✅ Added CV upload field after the Experience field
2. ✅ CV file is required (PDF only, max 10MB)
3. ✅ Added `cvFile` state and `handleCvFileChange` handler
4. ✅ Updated form validation to require CV upload
5. ✅ Changed submission to use FormData for file upload
6. ✅ All candidate details (name, phone, email, education, projects, skills, experience) are sent with CV

### Backend (api_routes.py)
1. ✅ Updated `/start-session-with-cv` endpoint to accept all candidate details as Form parameters:
   - `candidate_name`
   - `phone_number`
   - `email_address`
   - `education` (text, split by newlines)
   - `projects` (text, split by newlines)
   - `skills` (text, split by commas)
   - `experience` (text)
2. ✅ CV file is saved to `Backend/uploads/interview_cvs/` directory
3. ✅ All candidate details and CV metadata are saved to MongoDB `interview_cvs` collection
4. ✅ No AI extraction - uses manual form input exactly as provided

### Database (models.py)
The `InterviewCVModel` already has all required fields:
- `session_id`, `candidate_name`, `phone_number`, `email_address`
- `education` (list), `projects` (list), `skills` (list), `experience` (string)
- `cv_file_name`, `cv_file_path`
- `interview_field`, `position_level`, `created_at`

## How to Test

### 1. Start the Backend
```bash
cd Backend
uvicorn main:app --reload
```

### 2. Start the Frontend
```bash
cd Frontend
npm start
```

### 3. Test the Form
1. Navigate to Voice Interview page
2. Fill in all required fields:
   - Full Name
   - Phone Number
   - Email Address
   - Interview Field (dropdown)
   - Position Level (Junior/Intermediate/Senior)
   - Education (one per line)
   - Projects (one per line)
   - Skills (comma separated)
   - Experience (paragraph)
   - **Upload CV (PDF only)** ⬅️ NEW
3. Click "Start Interview"

### 4. Verify Data Saved
Run the viewing script to see all saved data:
```bash
cd Backend
python view_candidate_data.py
```

This will display:
- Session details (session ID, interview field, position level)
- Personal information (name, email, phone)
- CV information (filename, file path, file size, exists?)
- Education entries
- Projects entries
- Skills list
- Experience text
- CV file status

## File Structure

```
Backend/
  ├── uploads/
  │   └── interview_cvs/           ← CV files saved here
  │       └── [session_id]_[timestamp]_[filename].pdf
  ├── vc_agent/
  │   └── api_routes.py            ← Updated endpoint
  ├── database/
  │   ├── models.py                ← InterviewCVModel
  │   └── crud.py                  ← create_interview_cv()
  ├── main.py                      ← Creates upload directories on startup
  └── view_candidate_data.py       ← NEW: View saved data

Frontend/
  └── src/
      └── VoiceInterview.js        ← Updated with CV upload
```

## API Endpoint Details

### POST `/api/voice-interview/start-session-with-cv`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `cv_file` (file, required) - PDF file
- `interview_field` (string, required)
- `position_level` (string, required)
- `num_questions` (integer, default: 5)
- `candidate_name` (string, required)
- `phone_number` (string, required)
- `email_address` (string, required)
- `education` (string, required) - newline separated
- `projects` (string, required) - newline separated
- `skills` (string, required) - comma separated
- `experience` (string, required)

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-here",
  "cv_id": "mongodb-id",
  "interview_field": "Software Engineering",
  "position_level": "Intermediate",
  "total_questions": 5,
  "current_question": 1,
  "question": "First interview question...",
  "candidate_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "cv_filename": "resume.pdf"
  },
  "message": "Interview session started successfully with candidate details and CV saved"
}
```

## Database Collection

**Collection Name:** `interview_cvs`

**Document Structure:**
```javascript
{
  _id: ObjectId("..."),
  session_id: "uuid",
  candidate_name: "John Doe",
  phone_number: "+1-234-567-8900",
  email_address: "john@example.com",
  education: ["Bachelor CS, MIT, 2020", "Master AI, Stanford, 2022"],
  projects: ["AI Chatbot", "E-commerce Platform"],
  skills: ["Python", "JavaScript", "React", "MongoDB"],
  experience: "3 years as Software Engineer...",
  cv_file_name: "resume.pdf",
  cv_file_path: "uploads/interview_cvs/uuid_timestamp_resume.pdf",
  interview_field: "Software Engineering",
  position_level: "Intermediate",
  created_at: ISODate("2025-12-28T...")
}
```

## Notes

- CV file is saved as: `[session_id]_[timestamp]_[original_filename].pdf`
- File validation: Only PDF files accepted
- All fields are required before submission
- Education and projects: one entry per line in the form
- Skills: comma-separated in the form
- CV file and all candidate details are permanently saved in the database
- The CV file itself is stored in the filesystem, with path saved in database
