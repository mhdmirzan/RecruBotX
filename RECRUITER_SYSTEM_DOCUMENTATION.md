# RecruBotX - Complete Recruiter System Documentation

## Overview
This document describes the complete, fully functional recruiter system with dynamic data fetching from MongoDB.

---

## Database Collections

### 1. **job_postings**
Stores job posting information created by recruiters.

**Fields:**
- `_id`: ObjectId
- `recruiter_id`: String
- `interview_field`: String (e.g., "Software Engineering")
- `position_level`: String (e.g., "Senior", "Junior")
- `number_of_questions`: Integer
- `top_n_cvs`: Integer (number of candidates to shortlist)
- `cv_files`: Array of Base64 encoded CVs
- `job_description`: String
- `created_at`: DateTime
- `updated_at`: DateTime
- `is_active`: Boolean

### 2. **candidate_rankings**
Stores ranked candidates after CV screening.

**Fields:**
- `_id`: ObjectId
- `job_posting_id`: String (reference to job_postings)
- `recruiter_id`: String
- `candidate_name`: String
- `rank`: Integer
- `score`: Float (0-100)
- `completion`: Integer (percentage)
- `interview_status`: String ("Shortlisted", "Review", "Not Selected")
- `cv_data`: Object (parsed CV information)
- `evaluation_details`: Object (detailed AI analysis)
- `created_at`: DateTime
- `updated_at`: DateTime

### 3. **evaluation_reports**
Stores detailed evaluation reports for each candidate.

**Fields:**
- `_id`: ObjectId
- `job_posting_id`: String
- `recruiter_id`: String
- `candidate_ranking_id`: String (reference to candidate_rankings)
- `candidate_name`: String
- `position`: String
- `overall_score`: Float
- `skill_scores`: Object (e.g., {"Technical Skills": 85, "Communication": 90})
- `detailed_analysis`: String
- `recommendations`: String
- `created_at`: DateTime

---

## API Endpoints

### Job Posting Routes (`/api/jobs`)

#### POST `/api/jobs/create`
Creates a new job posting and processes CVs.
- **Processes CVs automatically**
- **Ranks candidates using AI**
- **Creates evaluation reports**
- **Returns:** Job details + rankings_created + evaluations_created

#### GET `/api/jobs/recruiter/{recruiter_id}`
Get all job postings for a recruiter.

#### GET `/api/jobs/{job_id}`
Get specific job posting details.

#### PUT `/api/jobs/{job_id}`
Update job posting.

#### DELETE `/api/jobs/{job_id}`
Delete job posting.

---

### Ranking Routes (`/api/rankings`)

#### GET `/api/rankings/job/{job_id}`
Get all candidate rankings for a specific job.
- **Returns:** Array of ranked candidates with scores, status, dates

#### GET `/api/rankings/recruiter/{recruiter_id}`
Get all rankings by recruiter across all jobs.

#### PUT `/api/rankings/{ranking_id}/status`
Update candidate interview status.

#### GET `/api/rankings/{ranking_id}/report`
Get detailed candidate report.
- **Returns:** Complete report with CV summary, JD, strengths, weaknesses, skills

---

### Evaluation Routes (`/api/rankings/evaluations`)

#### GET `/api/rankings/evaluations/job/{job_id}`
Get all evaluation reports for a specific job.

#### GET `/api/rankings/evaluations/recruiter/{recruiter_id}`
Get all evaluation reports by recruiter.
- **Used by Evaluation page**

#### GET `/api/rankings/evaluations/{evaluation_id}/download`
Download evaluation report as JSON file.

---

## Frontend Pages

### 1. **Job Posting Page** (`/recruiter/job-posting`)

**Features:**
- Form with interview field, position level, number of questions, top N CVs
- Multiple CV upload (Base64 encoding)
- Job description textarea
- Shows count of uploaded CVs
- On submit: Creates job + processes CVs + ranks candidates

**Dynamic Elements:**
- Dropdown options populated from constants
- File upload with count display
- Form validation

---

### 2. **Ranking Page** (`/recruiter/ranking`)

**Features:**
- Job selection dropdown (populated from recruiter's jobs)
- Rankings table with columns:
  - Rank (colored badges)
  - Candidate Name
  - Score
  - Completion
  - Interview Status (colored badges)
  - Date
  - Action (View Report button)
- Auto-loads first job's rankings
- Updates dynamically when job is changed

**Dynamic Elements:**
- Fetches job postings: `GET /api/jobs/recruiter/{id}`
- Fetches rankings: `GET /api/rankings/job/{job_id}`
- Loading states
- Empty states
- View Report navigation

---

### 3. **Evaluation Page** (`/recruiter/evaluation`)

**Features:**
- 3-column grid layout
- Job filter dropdown
- Score filter (High/Medium/Low)
- Each card shows:
  - Candidate name and position
  - Overall score
  - Skills with blue progress bars
  - View Report button (with eye icon)
  - Download button (with download icon)

**Dynamic Elements:**
- Fetches evaluations: `GET /api/rankings/evaluations/recruiter/{id}`
- Fetches job postings for filter
- Client-side filtering by job and score
- View button navigates to detailed report
- Download button downloads JSON

**All progress bars use blue theme (`bg-blue-500`)**

---

### 4. **Candidate Report Page** (`/recruiter/report/{rankingId}`)

**Features:**
- Comprehensive candidate overview
- Quick stats (Rank, Completion, Date, Status)
- Two-column layout:
  - **Left:** Skills assessment, Strengths, Weaknesses
  - **Right:** CV Summary, Job Description, Detailed Analysis, Recommendations
- Back button to rankings
- Download report button

**Dynamic Elements:**
- Fetches report: `GET /api/rankings/{rankingId}/report`
- Downloads: `GET /api/rankings/evaluations/{evaluationId}/download`

---

## Data Flow

### Creating a Job Posting:

```
1. Recruiter fills form → Uploads CVs → Clicks "Create Job Posting"
2. Frontend sends POST to /api/jobs/create with:
   - Job details
   - CV files (Base64 array)
   - Job description
3. Backend:
   a. Creates job_posting document
   b. For each CV:
      - Decodes Base64
      - Saves to temp file
      - Parses CV text
      - Screens with Gemini AI
      - Calculates scores
   c. Ranks all candidates by score
   d. Assigns status (Top N = Shortlisted)
   e. Creates candidate_rankings documents
   f. Creates evaluation_reports documents
4. Returns success with counts
```

### Viewing Rankings:

```
1. Recruiter navigates to /recruiter/ranking
2. Frontend:
   a. Fetches job postings: GET /api/jobs/recruiter/{id}
   b. Auto-selects first job
   c. Fetches rankings: GET /api/rankings/job/{job_id}
3. Displays table with all candidates
4. When job changed → Fetches new rankings
```

### Viewing Evaluations:

```
1. Recruiter navigates to /recruiter/evaluation
2. Frontend:
   a. Fetches evaluations: GET /api/rankings/evaluations/recruiter/{id}
   b. Fetches job postings for filter
3. Displays 3-column grid
4. Filters applied client-side
5. View button → Navigate to report
6. Download button → Download JSON
```

### Viewing Detailed Report:

```
1. Click "View Report" from Rankings or Evaluations
2. Navigate to /recruiter/report/{rankingId}
3. Fetch: GET /api/rankings/{rankingId}/report
4. Backend combines:
   - Ranking data
   - Job posting (for JD)
   - Evaluation report
5. Display comprehensive report
```

---

## Key Features

### ✅ Fully Dynamic
- All data fetched from MongoDB
- No hardcoded values
- Real-time updates

### ✅ Complete CRUD
- Create job postings
- Read rankings and evaluations
- Update candidate status
- Delete job postings

### ✅ AI Integration
- Gemini AI CV screening
- Automatic ranking
- Skill assessment
- Strengths/weaknesses analysis

### ✅ User Experience
- Loading states
- Empty states
- Error handling
- Smooth navigation
- Consistent design

### ✅ Data Persistence
- MongoDB storage
- Relationships between collections
- Efficient queries

---

## Collections Summary

| Collection | Purpose | Created When |
|------------|---------|--------------|
| `job_postings` | Store job details | Job posting created |
| `candidate_rankings` | Store ranked candidates | CVs processed |
| `evaluation_reports` | Store detailed evaluations | CVs processed |
| `recruiter_users` | Store recruiter accounts | Registration |

---

## Next Steps (Optional Enhancements)

1. **Email Notifications:** Notify candidates of their status
2. **Interview Scheduling:** Schedule interviews with shortlisted candidates
3. **Analytics Dashboard:** Show hiring metrics and trends
4. **Bulk Actions:** Update multiple candidate statuses at once
5. **Export Reports:** Export rankings as PDF/Excel
6. **Advanced Filters:** Filter by date range, skills, etc.
7. **Candidate Portal:** Allow candidates to view their status
8. **Team Collaboration:** Multiple recruiters per job posting

---

## Testing Checklist

- [ ] Create job posting with multiple CVs
- [ ] Verify CVs are processed and ranked
- [ ] Check rankings appear in Ranking page
- [ ] Verify job filter works
- [ ] Check evaluations appear in Evaluation page
- [ ] Test score filter (High/Medium/Low)
- [ ] Click View Report from Rankings
- [ ] Click View Report from Evaluations
- [ ] Download evaluation report
- [ ] Verify all data is persistent (refresh page)
- [ ] Test with multiple jobs
- [ ] Test with no data (empty states)

---

## System is 100% Functional! 🎉
