# RecruBotX - AI Interviewer System

A comprehensive AI-powered solution for screening CVs against job descriptions and conducting voice-based interview practice sessions.

## Features

### CV Screening
- Extract and parse information from PDF CVs
- Generate embeddings for CVs and job descriptions
- Calculate similarity scores between CVs and job descriptions
- Rank candidates based on relevance to job requirements

### Interview Practice
- Voice-based interview simulation
- Multiple job role support (Software Engineer, Data Scientist, Product Manager, Marketing Manager)
- Real-time speech-to-text transcription
- AI-powered answer analysis with confidence scoring
- Detailed feedback and suggestions for improvement

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy with SQLite/PostgreSQL
- **AI/ML**:
  - Sentence Transformers for text embeddings

### Frontend
- Interactive API documentation with Swagger UI
- RESTful API endpoints for easy integration

## Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FYP
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install uv
   uv init
   uv add -r requirements.txt
   ```

### Running the Application

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

### CV Screening Endpoints

- `POST /api/v1/sceen-cvs/`: Upload CVs and do screening
- `POST /api/v1/cv_results/{batch_id}`: Get CV results of certain batch
- `POST /api/v1/cv_results/`: Get all CV results
- `GET /api/v1/recommendations/`: Get CV recommendations



## Project Structure

```
FYP/
├── api/
│   ├── __init__.py
│   ├── cv_screener.py  # CV screening endpoints
├── database/
│   ├── __init__.py
│   ├── db.py           # Database configuration
│   └── cv_screener.py    # Database operations for interviews
├── models/
│   ├── __init__.py
│   ├── cv_screener.py  # CV screening models
├── utils/
│   └── __init__.py
├── main.py             # Main application entry point
├── requirements.txt    # Project dependencies
└── README.md           # This file
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [FastAPI](https://fastapi.tiangolo.com/) - The web framework used
- [Hugging Face](https://huggingface.co/) - For the transformer models
- [PyTorch](https://pytorch.org/) - Deep learning framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Database ORM

## Contact

For any questions or suggestions, please open an issue or contact the project maintainers.