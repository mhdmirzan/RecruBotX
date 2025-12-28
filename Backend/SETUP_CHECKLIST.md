# Setup Checklist - Voice Interview CV Feature

## 📋 Pre-Setup Requirements

- [ ] MongoDB Atlas account and connection string
- [ ] Google Gemini API key
- [ ] Python 3.8+ installed
- [ ] Node.js and npm installed
- [ ] Backend and Frontend code pulled from repository

## 🔧 Backend Setup

### 1. Environment Variables
- [ ] Create/update `Backend/.env` file with:
  ```
  MONGODB_URI=your_mongodb_connection_string
  DATABASE_NAME=recrubotx_db
  GOOGLE_API_KEY=your_gemini_api_key
  ```

### 2. Install Dependencies
```bash
cd Backend
pip install google-generativeai PyPDF2 python-docx motor python-dotenv
```
- [ ] All dependencies installed successfully

### 3. Run Setup Script
```bash
python quick_setup.py
```
- [ ] Environment variables verified
- [ ] Uploads directory created
- [ ] Database collection initialized
- [ ] Indexes created successfully

### 4. Verify Installation
```bash
# Optional: Test with a sample CV
python test_cv_feature.py path/to/sample_resume.pdf
```
- [ ] CV parsing works
- [ ] AI extraction works
- [ ] Database storage works
- [ ] Data retrieval works

## 🎨 Frontend Setup

### 1. Install Dependencies (if needed)
```bash
cd Frontend
npm install
```
- [ ] Dependencies installed

### 2. Verify Changes
- [ ] `VoiceInterview.js` has CV upload field
- [ ] PDF-only validation in place
- [ ] FormData submission implemented

## 🚀 Running the Application

### 1. Start Backend
```bash
cd Backend
uvicorn main:app --reload
```
- [ ] Backend running on http://localhost:8000
- [ ] No startup errors
- [ ] API docs accessible at http://localhost:8000/docs

### 2. Start Frontend
```bash
cd Frontend
npm start
```
- [ ] Frontend running on http://localhost:3000
- [ ] No compilation errors

## ✅ Testing the Feature

### 1. Navigate to Voice Interview Page
- [ ] Login as candidate
- [ ] Navigate to Voice Interview page

### 2. Test CV Upload
- [ ] CV upload field visible
- [ ] Can select PDF file
- [ ] File name displays after selection
- [ ] Non-PDF files rejected with error

### 3. Test Interview Start
- [ ] Select Interview Field
- [ ] Select Position Level
- [ ] Upload CV (PDF)
- [ ] Click "Start Interview"
- [ ] Interview starts successfully
- [ ] First question is spoken
- [ ] Console shows CV details

### 4. Verify Database Storage
In MongoDB Atlas or Compass:
```javascript
use recrubotx_db;
db.interview_cvs.find().pretty();
```
- [ ] New document created
- [ ] All fields populated correctly
- [ ] Contact info extracted
- [ ] Education listed
- [ ] Projects listed
- [ ] Skills listed

### 5. Verify File Storage
```bash
ls Backend/uploads/interview_cvs/
```
- [ ] CV file saved with correct naming format
- [ ] File accessible and readable

## 🔍 API Testing (Optional)

### Test Endpoint Directly
```bash
curl -X POST "http://localhost:8000/api/voice-interview/start-session-with-cv" \
  -F "cv_file=@test_resume.pdf" \
  -F "interview_field=Software Engineering" \
  -F "position_level=Intermediate" \
  -F "num_questions=5"
```

Expected Response:
- [ ] `success: true`
- [ ] `session_id` returned
- [ ] `cv_id` returned
- [ ] `cv_details` populated
- [ ] `question` returned

## 📊 Database Verification

### Check Collection
- [ ] Collection `interview_cvs` exists
- [ ] Indexes created:
  - [ ] `session_id` (unique)
  - [ ] `created_at`
  - [ ] `interview_field`
  - [ ] `position_level`
  - [ ] `email_address`
  - [ ] Compound: `(interview_field, position_level)`

### Sample Queries
```javascript
// Count total CVs
db.interview_cvs.countDocuments()

// Get recent CVs
db.interview_cvs.find().sort({created_at: -1}).limit(5)

// Find by field
db.interview_cvs.find({interview_field: "Software Engineering"})

// Find by email
db.interview_cvs.find({email_address: "test@example.com"})
```
- [ ] All queries work correctly

## 🐛 Troubleshooting

### Issue: "Collection not found"
- [ ] Run `python database/init_interview_cvs_collection.py`

### Issue: "GOOGLE_API_KEY not set"
- [ ] Check `.env` file has GOOGLE_API_KEY
- [ ] Restart backend server

### Issue: "Failed to parse PDF"
- [ ] Verify PyPDF2 installed: `pip install PyPDF2`
- [ ] Check PDF file is not corrupted
- [ ] Try different PDF file

### Issue: "MongoDB connection failed"
- [ ] Check MONGODB_URI in `.env`
- [ ] Verify network access in MongoDB Atlas
- [ ] Check IP whitelist settings

### Issue: "File upload fails"
- [ ] Verify `uploads/interview_cvs/` directory exists
- [ ] Check directory write permissions
- [ ] Verify disk space available

### Issue: "AI extraction returns empty data"
- [ ] Check Gemini API key is valid
- [ ] Verify API quota not exceeded
- [ ] Check PDF contains extractable text
- [ ] Review error logs in backend terminal

## 📚 Documentation

- [ ] Read `VOICE_INTERVIEW_CV_FEATURE.md` for detailed information
- [ ] Review `IMPLEMENTATION_SUMMARY.md` for technical details
- [ ] Check `COLLECTIONS_SCHEMA.md` for database structure

## ✨ Final Verification

- [ ] Can upload CV successfully
- [ ] CV information extracted correctly
- [ ] Data stored in database
- [ ] Interview starts normally
- [ ] No errors in console
- [ ] Files saved correctly
- [ ] All 5 key fields extracted:
  1. [ ] Phone number
  2. [ ] Email address
  3. [ ] Education
  4. [ ] Projects
  5. [ ] Skills

## 🎉 Setup Complete!

If all items are checked, the Voice Interview CV feature is fully operational!

### Next Steps:
1. Test with multiple CV samples
2. Monitor API performance
3. Review extracted data accuracy
4. Set up backup for uploads directory
5. Configure log rotation
6. Set up monitoring alerts

### Support:
- Check backend logs for errors
- Review frontend console for issues
- Consult documentation files
- Test with provided test scripts
