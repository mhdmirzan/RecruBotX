# MongoDB Atlas Collections - CV Screening System

## 📊 Database Schema

### Collection: `screening_results` (CV SCREENING TABLE)

This is the main collection that stores AI-powered CV screening results.

#### Schema Structure:

```json
{
  "_id": ObjectId("..."),
  "job_description_id": ObjectId("..."),        // Reference to job_descriptions
  "cv_id": ObjectId("..."),                     // Reference to cvs collection
  "candidate_name": "John Doe",                 // Extracted from CV
  "file_name": "john_doe_resume.pdf",
  "overall_score": 85.5,                        // 0-100
  "skills_match": 90.0,                         // 0-100
  "experience_match": 82.0,                     // 0-100
  "education_match": 84.0,                      // 0-100
  "strengths": [
    "Strong Python skills",
    "FastAPI experience",
    "MongoDB expertise"
  ],
  "weaknesses": [
    "Limited AWS experience",
    "No DevOps background"
  ],
  "recommendation": "Strongly Recommend",       // Enum: Strongly Recommend, Recommend, Consider, Not Recommended, Error
  "summary": "Excellent candidate with strong technical background...",
  "created_at": ISODate("2025-12-23T...")
}
```

#### Indexes:

1. **Single Field Indexes:**
   - `job_description_id` (ascending)
   - `cv_id` (ascending)
   - `overall_score` (descending)
   - `created_at` (ascending)

2. **Compound Indexes:**
   - `(job_description_id, overall_score)` - Optimized for "top candidates" queries
   - Name: `top_candidates_idx`

#### Validation Rules:

- **Required Fields:** All fields except `_id`
- **Score Ranges:** `overall_score`, `skills_match`, `experience_match`, `education_match` must be between 0-100
- **Recommendation Values:** Must be one of: "Strongly Recommend", "Recommend", "Consider", "Not Recommended", "Error"
- **Arrays:** `strengths` and `weaknesses` must contain strings
- **ObjectIds:** `job_description_id` and `cv_id` must be valid ObjectIds

---

## 🗂️ All Collections

### 1. **job_postings**
Stores job postings created by recruiters.

**Key Fields:**
- `recruiter_id` (string): ID of the recruiter
- `interview_field` (string): Job domain
- `position_level` (string): Seniority level
- `work_model` (string): Remote/Hybrid/Onsite
- `status` (string): Employment type
- `cv_file_ids` (array of ObjectIds): Linked CV files
- `is_active` (boolean): Status flag
- `created_at` (date)

**Indexes:**
- `recruiter_id`
- `created_at`
- `is_active`

---

### 2. **job_descriptions**
Stores job postings and requirements.

**Key Fields:**
- `title` (string): Job title
- `content` (string): Full job description
- `is_active` (boolean): Currently active flag
- `created_at`, `updated_at` (date)

**Indexes:**
- `created_at`
- `is_active`
- `(is_active, created_at)` compound

---

### 2. **cvs**
Stores uploaded resume documents.

**Key Fields:**
- `file_name` (string): Original filename
- `content` (string): Parsed CV text
- `file_size` (int): File size in bytes
- `uploaded_at` (date)

**Indexes:**
- `uploaded_at`
- `file_name`

---

### 3. **screening_results** ⭐ (MAIN CV SCREENING TABLE)
Stores AI screening analysis results.

See detailed schema above.

---

### 4. **screening_batches**
Tracks batch screening sessions.

---

### 5. **interview_cvs**
Stores extracted CV information for voice interview sessions.

**Key Fields:**
- `session_id` (string): Unique interview session identifier
- `candidate_name` (string): Full name of candidate
- `phone_number` (string): Contact phone number
- `email_address` (string): Email address
- `education` (array): List of educational qualifications
- `projects` (array): List of projects with descriptions
- `skills` (array): List of technical and professional skills
- `experience` (string): Years of experience or description
- `certifications` (array): List of professional certifications
- `summary` (string): Professional summary
- `cv_file_name` (string): Original CV filename
- `cv_file_path` (string): Path where CV is stored
- `interview_field` (string): Field of interview
- `position_level` (string): Position level (Junior/Intermediate/Senior)
- `created_at` (date): Timestamp of creation

**Indexes:**
- `session_id` (unique)
- `created_at`
- `interview_field`

**Purpose:**
Stores detailed candidate information extracted from CV PDFs during voice interview setup. Links to interview sessions and provides candidate profile data for analysis.

---

**Key Fields:**
- `job_description_id` (ObjectId)
- `cv_ids` (array of ObjectIds)
- `result_ids` (array of ObjectIds)
- `total_candidates` (int)
- `created_at`, `completed_at` (date)

**Indexes:**
- `job_description_id`
- `created_at`

---

## 🚀 Setup Instructions

### Option 1: Automatic Setup (Recommended)

Run the initialization script:

```bash
cd Backend
python database/init_collections.py
```

This will:
- Create all collections
- Set up indexes
- Apply schema validation
- Display collection summary

### Option 2: Manual Setup via MongoDB Atlas UI

1. Go to MongoDB Atlas Dashboard
2. Click on your cluster → **Browse Collections**
3. Create these collections:
   - `job_descriptions`
   - `cvs`
   - `screening_results`
   - `screening_batches`

4. For each collection, go to **Indexes** tab and create the indexes listed above.

---

## 📝 Example Queries

### Get Top 10 Candidates for a Job

```python
from bson import ObjectId

results = await db.screening_results.find(
    {"job_description_id": ObjectId("your_jd_id")}
).sort("overall_score", -1).limit(10).to_list(10)
```

### Get All Candidates with Score > 80

```python
results = await db.screening_results.find({
    "job_description_id": ObjectId("your_jd_id"),
    "overall_score": {"$gt": 80}
}).sort("overall_score", -1).to_list(None)
```

### Get Screening Statistics

```python
pipeline = [
    {
        "$group": {
            "_id": "$job_description_id",
            "avg_score": {"$avg": "$overall_score"},
            "total_candidates": {"$sum": 1},
            "top_score": {"$max": "$overall_score"}
        }
    }
]
results = await db.screening_results.aggregate(pipeline).to_list(None)
```

### Get Strongly Recommended Candidates

```python
results = await db.screening_results.find({
    "job_description_id": ObjectId("your_jd_id"),
    "recommendation": "Strongly Recommend"
}).sort("overall_score", -1).to_list(None)
```

---

## 🔍 Monitoring & Performance

### Check Collection Stats

```python
stats = await db.command("collStats", "screening_results")
print(f"Documents: {stats['count']}")
print(f"Size: {stats['size']} bytes")
print(f"Indexes: {stats['nindexes']}")
```

### View Index Usage

In MongoDB Atlas:
1. Go to **Performance Advisor**
2. Check recommended indexes
3. View slow queries

### Best Practices for Atlas:

1. **Use Compound Indexes:** The `(job_description_id, overall_score)` index is optimized for the most common query pattern
2. **Background Index Creation:** All indexes are created with `background=True` to avoid blocking
3. **Schema Validation:** Moderate level validation catches most errors without strict enforcement
4. **Connection Pooling:** Already configured in `connection.py` (max 50, min 10)
5. **Retry Writes:** Enabled automatically for Atlas reliability

---

## 🛠️ Maintenance

### Clear All Screening Results

```python
await db.screening_results.delete_many({})
```

### Delete Results for Specific Job

```python
await db.screening_results.delete_many({
    "job_description_id": ObjectId("your_jd_id")
})
```

### Archive Old Results (older than 30 days)

```python
from datetime import datetime, timedelta

cutoff = datetime.utcnow() - timedelta(days=30)
await db.screening_results.delete_many({
    "created_at": {"$lt": cutoff}
})
```

---

## 📞 Support

For issues or questions:
1. Check `DATABASE.md` for connection troubleshooting
2. Verify `.env` has correct `MONGODB_URL`
3. Ensure IP is whitelisted in Atlas (or use 0.0.0.0/0 for testing)
4. Check Atlas cluster status

---

**Last Updated:** December 23, 2025  
**MongoDB Version:** 6.0+  
**Driver:** Motor 3.3.0+ (Async)
