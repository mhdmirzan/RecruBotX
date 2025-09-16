## RecruBotX Backend
This is the backend service for RecruBotX, built using FastAPI. It handles authentication, database operations, API endpoints, and includes rate limiting functionality. Testing is managed with pytest.

---

## 📂 Project Structure

```bash
Backend/
├── .gitignore
├── requirements-dev.txt
├── requirements.txt
├── src/
│   ├── auth/
│   ├── database/
│   ├── entities/
│   ├── users/
│   ├── __init__.py
│   ├── api.py
│   ├── exceptions.py
│   ├── logging.py
│   ├── main.py
│   ├── rate_limiter.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_auth_service.py
    └── test_users_service.py
exit
---

## 🛠️ Setup & Installation
### 1️⃣ Activate Virtual Environment
```bash
source venv/bin/activate  # Linux/macOS
venv\Scripts\Activate     # Windows
exit

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
exit

### 3️⃣ Environment Variables
Create a .env file in the Backend/ folder and configure as needed (e.g., database URL, secret keys).
### 4️⃣ Running the Backend
Start the FastAPI server with hot reload:
```bash
uvicorn src.main:app --reload
exit

Then visit:

API Base URL: http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
ReDoc UI: http://127.0.0.1:8000/redoc

### 5️⃣ Running Tests
```bash
pytest
exit

---

## 🚀 Features

FastAPI – High-performance Python web framework
JWT Authentication – Secure login and token management
SQLAlchemy ORM – Database modeling
pytest – Testing framework
Rate Limiting – Controlled API request handling
Modular Structure – Organized code with src/ and tests/ directories

---

## 🧪 Notes

The test.db file is used for local SQLite database storage.
Refer to requirements-dev.txt for development dependencies.
Customize .env based on your environment setup.
