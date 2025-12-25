# MongoDB User Authentication - Setup Guide

## ✅ What Was Implemented

### Backend (Python/FastAPI)
1. **Database Model** - Added `CandidateUserModel` in `database/models.py`
2. **CRUD Operations** - Added user functions in `database/crud.py`:
   - `create_candidate_user()`
   - `get_user_by_email()`
   - `get_user_by_id()`
   - `get_all_users()`
   - `update_user()`

3. **API Endpoints** - Added in `api/routes.py`:
   - `POST /api/auth/register` - Register new user
   - `POST /api/auth/login` - Login user
   - `GET /api/auth/users` - Get all users (admin)

4. **Dummy Users Script** - `database/init_dummy_users.py` to populate test data

### Frontend (React)
1. **Updated** `utils/userDatabase.js` - Now calls backend API instead of localStorage
2. **Updated** `CandidatePage.js` - Async signup with loading states and error handling
3. **Updated** `CandidateLoginPage.js` - Async login with loading states and error handling

## 🚀 Quick Start

### Step 1: Start Backend Server

```bash
cd Backend
python -m uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Step 2: (Optional) Create Dummy Users

```bash
cd Backend
python -m database.init_dummy_users
```

This creates 5 test users in MongoDB.

### Step 3: Start Frontend

```bash
cd Frontend
npm start
```

Frontend will run on `http://localhost:3000`

## 📝 Testing the Flow

### Test Signup
1. Go to `http://localhost:3000/candidate`
2. Fill in the signup form
3. Click "Create Account"
4. User will be saved to MongoDB
5. Redirected to dashboard

### Test Login
1. Go to `http://localhost:3000/signin/candidate`
2. Enter email and password
3. Click "Sign In"
4. If credentials match MongoDB, login successful

### Verify in MongoDB
You can check the `candidate_users` collection in your MongoDB database to see the registered users.

## 🔍 API Testing (Optional)

You can test the API directly:

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get All Users
```bash
curl http://localhost:8000/api/auth/users
```

## 📊 MongoDB Structure

### Collection: `candidate_users`

```javascript
{
  "_id": ObjectId("..."),
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",  // TODO: Hash this!
  "created_at": ISODate("2025-12-25T..."),
  "updated_at": ISODate("2025-12-25T..."),
  "is_active": true
}
```

## 🔐 Security TODO (Important!)

Current implementation stores passwords in **plain text**. For production:

1. **Hash passwords** using bcrypt:
   ```python
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   hashed_password = pwd_context.hash(password)
   ```

2. **Add JWT tokens** for authentication
3. **Add rate limiting** to prevent brute force
4. **Enable HTTPS** in production
5. **Add input validation** and sanitization

## 🎯 Key Files Modified

### Backend
- `database/models.py` - Added CandidateUserModel
- `database/crud.py` - Added user CRUD operations
- `api/routes.py` - Added /auth endpoints
- `database/init_dummy_users.py` - New script for test data

### Frontend
- `src/utils/userDatabase.js` - Now calls backend API
- `src/CandidatePage.js` - Async signup flow
- `src/CandidateLoginPage.js` - Async login flow

## ✨ Features

✅ User registration with MongoDB storage  
✅ User login with MongoDB validation  
✅ Email uniqueness validation  
✅ Error handling and loading states  
✅ Session persistence in localStorage  
✅ Dummy users script for testing  
✅ API endpoints for all operations  

## 🐛 Troubleshooting

**"Network error" on signup/login**
- Make sure backend is running on port 8000
- Check MongoDB connection in backend logs

**"User already exists"**
- Email is already registered in MongoDB
- Use a different email or clear the collection

**MongoDB connection failed**
- Check `MONGODB_URL` in Backend `.env` file
- Ensure MongoDB service is running

**CORS errors**
- Backend CORS is configured for localhost:3000
- Check `main.py` CORSMiddleware settings

## 🎉 Success!

Your RecruBotX app now has a fully functional user authentication system with MongoDB persistence! 🚀
