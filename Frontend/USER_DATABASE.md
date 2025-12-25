# User Database - RecruBotX

## Overview
This application uses **MongoDB** to store user data for authentication. User registration and login are handled through a FastAPI backend that connects to MongoDB Atlas.

## Architecture

- **Frontend**: React app (port 3000)
- **Backend**: FastAPI (port 8000)
- **Database**: MongoDB (Cloud Atlas or local)

## API Endpoints

### Base URL: `http://localhost:8000/api`

#### 1. Register User
- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### 2. Login User
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### 3. Get All Users (Admin)
- **Endpoint**: `GET /auth/users`

## Setup Instructions

### Backend Setup

1. Make sure MongoDB is configured in your `.env` file:
   ```
   MONGODB_URL=your_mongodb_connection_string
   MONGODB_DB_NAME=recrubotx
   ```

2. Install backend dependencies:
   ```bash
   cd Backend
   pip install -r requirements.txt
   ```

3. (Optional) Initialize with dummy users:
   ```bash
   python -m database.init_dummy_users
   ```

4. Start the backend server:
   ```bash
   python -m uvicorn main:app --reload
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```

2. Start the frontend:
   ```bash
   npm start
   ```

## Dummy Users (Optional)

You can create dummy users by running the initialization script in the Backend folder:

```bash
cd Backend
python -m database.init_dummy_users
```

This will create 5 test users:

| Name | Email | Password |
|------|-------|----------|
| John Doe | john.doe@example.com | password123 |
| Jane Smith | jane.smith@example.com | password123 |
| Mike Johnson | mike.johnson@example.com | password123 |
| Sarah Williams | sarah.williams@example.com | password123 |
| David Brown | david.brown@example.com | password123 |

## Features

### User Registration
- Users can sign up via the `/candidate` route
- Data is validated and stored in MongoDB
- Duplicate email validation is performed
- Returns success/error messages

### User Login
- Users can log in via the `/signin/candidate` route
- Email and password authentication via backend API
- Current user session is stored in localStorage
- JWT tokens can be added for enhanced security

### MongoDB Collections

#### candidate_users
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String (unique, indexed),
  password: String,  // Hash this in production!
  created_at: DateTime,
  updated_at: DateTime,
  is_active: Boolean
}
```

## Frontend Functions

The `src/utils/userDatabase.js` file provides:

- `registerUser(userData)` - Register via API
- `loginUser(email, password)` - Login via API
- `logoutUser()` - Clear current user session
- `getCurrentUser()` - Get currently logged in user from localStorage
- `isLoggedIn()` - Check if user is logged in
- `getAllUsers()` - Fetch all users from API (admin)

## Routes

- **Sign Up**: `/candidate` - CandidatePage component
- **Login**: `/signin/candidate` - CandidateLoginPage component
- **Dashboard**: `/candidate/dashboard` - Protected route

## Testing the Integration

1. Start both Backend (port 8000) and Frontend (port 3000)
2. Navigate to `http://localhost:3000/candidate`
3. Create a new account with your details
4. Check MongoDB to see the user is stored
5. Try logging in with the credentials
6. Check browser localStorage for the current user session

## Security Notes

⚠️ **Important for Production**:
- ✅ Backend API with MongoDB is implemented
- ⚠️ Passwords should be hashed using bcrypt
- ⚠️ Implement JWT tokens for API authentication
- ⚠️ Add rate limiting to prevent brute force attacks
- ⚠️ Use HTTPS in production
- ⚠️ Implement proper CORS policies
- ⚠️ Add input validation and sanitization
- ⚠️ Store sensitive config in environment variables

## Troubleshooting

### "Network error" on signup/login
- Make sure the backend server is running on port 8000
- Check MongoDB connection in backend logs
- Verify CORS settings allow localhost:3000

### MongoDB connection issues
- Check your MONGODB_URL in `.env` file
- Ensure MongoDB service is running (if local)
- Check firewall and network connectivity (if Atlas)

### User already exists error
- Check the MongoDB `candidate_users` collection
- Email addresses are unique - use a different email
- Or clear the collection to start fresh
