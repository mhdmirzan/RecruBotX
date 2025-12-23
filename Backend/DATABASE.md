# RecruBotX Backend - MongoDB Integration

## 🚀 Overview

The backend now uses **MongoDB** for persistent data storage, replacing the previous in-memory storage. This provides:

- ✅ Persistent data across server restarts
- ✅ Scalable storage for CVs and screening results
- ✅ Historical tracking of all screenings
- ✅ Advanced querying and analytics
- ✅ Production-ready data management

## 📋 Prerequisites

### 1. Install MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb

# Start MongoDB service:
net start MongoDB
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### 2. Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"
```

## 🛠️ Installation

### 1. Install Python Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

New dependencies added:
- `motor` - Async MongoDB driver for Python
- `pymongo` - MongoDB driver

### 2. Configure Environment Variables (Atlas-ready)

Update your `.env` file. If you are using MongoDB Atlas, use the SRV URL from the Atlas dashboard:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_actual_api_key_here

# MongoDB Configuration
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster-host>/<dbname>?retryWrites=true&w=majority
MONGODB_DB_NAME=recrubotx

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### 3. Start the Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

If you prefer a local MongoDB instance, you can still use:

```env
MONGODB_URL=mongodb://localhost:27017
```

## 📊 Database Structure

### Collections

#### 1. **job_descriptions**
Stores job postings and requirements.

```json
{
  "_id": ObjectId,
  "title": "Senior Python Developer",
  "content": "Full job description text...",
  "is_active": true,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes:** `created_at`, `is_active`

#### 2. **cvs**
Stores uploaded resumes and their content.

```json
{
  "_id": ObjectId,
  "file_name": "john_doe.pdf",
  "content": "Extracted text from CV...",
  "file_size": 102400,
  "uploaded_at": ISODate
}
```

**Indexes:** `uploaded_at`, `file_name`

#### 3. **screening_results**
Stores AI screening analysis for each CV.

```json
{
  "_id": ObjectId,
  "job_description_id": ObjectId,
  "cv_id": ObjectId,
  "candidate_name": "John Doe",
  "file_name": "john_doe.pdf",
  "overall_score": 85.5,
  "skills_match": 90.0,
  "experience_match": 82.0,
  "education_match": 84.0,
  "strengths": ["Python", "FastAPI", "MongoDB"],
  "weaknesses": ["Limited AWS experience"],
  "recommendation": "Strongly Recommend",
  "summary": "Excellent candidate with...",
  "created_at": ISODate
}
```

**Indexes:** `job_description_id`, `cv_id`, `overall_score`, `created_at`

#### 4. **screening_batches**
Tracks batch screening sessions.

```json
{
  "_id": ObjectId,
  "job_description_id": ObjectId,
  "cv_ids": [ObjectId, ...],
  "result_ids": [ObjectId, ...],
  "total_candidates": 10,
  "created_at": ISODate,
  "completed_at": ISODate
}
```

## 🔧 API Endpoints

### Job Description Management

```http
POST   /api/upload-jd          # Upload new job description
GET    /api/current-jd          # Get active job description
GET    /api/job-descriptions/:id # Get specific JD
```

### CV Management

```http
POST   /api/upload-cvs          # Upload multiple CVs
GET    /api/cvs                 # List uploaded CVs
DELETE /api/cvs/:id             # Delete a CV
```

### Screening Operations

```http
POST   /api/screen-cvs          # Screen all CVs against active JD
POST   /api/screen-single-cv    # Screen one CV
GET    /api/screening-results/:jd_id  # Get all results for a JD
GET    /api/top-candidates/:jd_id     # Get top N candidates
```

### System Management

```http
GET    /api/statistics          # Get system statistics
DELETE /api/clear-all           # Clear all data (use carefully!)
GET    /                        # API info
GET    /health                  # Health check with DB status
```

## 💡 Usage Examples

### 1. Upload Job Description

```bash
curl -X POST http://localhost:8000/api/upload-jd \
  -F "jd_title=Senior Developer" \
  -F "jd_text=Python expert needed..."
```

### 2. Upload CVs

```bash
curl -X POST http://localhost:8000/api/upload-cvs \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.pdf" \
  -F "files=@resume3.pdf"
```

### 3. Screen All CVs

```bash
curl -X POST http://localhost:8000/api/screen-cvs
```

### 4. Get Top Candidates

```bash
curl http://localhost:8000/api/top-candidates/JD_ID?limit=5
```

### 5. Get Statistics

```bash
curl http://localhost:8000/api/statistics
```

## 🔍 Database Queries

### Using MongoDB Shell

```bash
# Connect to database
mongosh recrubotx

# View collections
show collections

# Get all job descriptions
db.job_descriptions.find().pretty()

# Get top 5 candidates by score
db.screening_results.find().sort({overall_score: -1}).limit(5)

# Get statistics
db.screening_results.aggregate([
  {
    $group: {
      _id: "$job_description_id",
      avg_score: { $avg: "$overall_score" },
      count: { $sum: 1 }
    }
  }
])

# Delete all data
db.job_descriptions.deleteMany({})
db.cvs.deleteMany({})
db.screening_results.deleteMany({})
db.screening_batches.deleteMany({})
```

## 📈 Performance Tips

1. **Indexing:** Indexes are automatically created on startup
2. **Pagination:** Use `limit` parameter for large result sets
3. **Cleanup:** Regularly delete old screening results
4. **Backup:** Regular MongoDB backups recommended

## 🐛 Troubleshooting

### "Failed to connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Start MongoDB service
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### "The resolution lifetime expired" (Atlas SRV DNS timeout)

This usually means your machine can't resolve the Atlas SRV record (DNS issue), not that your username/password is wrong.

**Fix options:**

1. In MongoDB Atlas, copy the **Standard connection string** (starts with `mongodb://...`) instead of the SRV string (`mongodb+srv://...`) and set it as `MONGODB_URL`.
2. Switch your computer/network DNS to a reliable resolver (for example Google DNS `8.8.8.8` / `8.8.4.4` or Cloudflare `1.1.1.1`).
3. Ensure your corporate VPN/firewall is not blocking DNS queries.

Tip: if you want the API to start even when MongoDB is unreachable (so you can still hit `/health`), set:

```env
MONGODB_STRICT_STARTUP=false
```

### "Database health check failed"

Check your `.env` configuration:
```env
MONGODB_URL=mongodb://localhost:27017  # Correct
MONGODB_URL=mongodb://localhost:27018  # Wrong port
```

### "Collection not found"

Collections are created automatically on first use. Run:
```bash
curl -X POST http://localhost:8000/api/upload-jd \
  -F "jd_title=Test" \
  -F "jd_text=Test job"
```

## 🔐 Security Notes

### Production Deployment

1. **Use Authentication:**
```env
MONGODB_URL=mongodb://username:password@localhost:27017
```

2. **Enable SSL:**
```env
MONGODB_URL=mongodb://host:27017/?ssl=true
```

3. **Use MongoDB Atlas (Cloud):**
```env
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

4. **Firewall Rules:**
- Only allow connections from application server
- Default MongoDB port: 27017

## 📦 Backup & Restore

### Backup

```bash
# Backup entire database
mongodump --db recrubotx --out ./backup

# Backup specific collection
mongodump --db recrubotx --collection screening_results --out ./backup
```

### Restore

```bash
# Restore entire database
mongorestore --db recrubotx ./backup/recrubotx

# Restore specific collection
mongorestore --db recrubotx --collection screening_results ./backup/recrubotx/screening_results.bson
```

## 🔄 Migration from Old System

If migrating from the in-memory system:

1. Start the new MongoDB-integrated backend
2. Re-upload job descriptions
3. Re-upload CVs
4. Re-run screenings (results will be stored persistently)

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Motor (Async Driver)](https://motor.readthedocs.io/)
- [FastAPI + MongoDB Tutorial](https://www.mongodb.com/languages/python/pymongo-tutorial)

---

**Version:** 2.0.0  
**Last Updated:** December 2025  
**Database:** MongoDB 6.0+
