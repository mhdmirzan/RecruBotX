# CV Screener Module

## Overview

The CV Screener is an AI-powered system for automated resume screening and candidate evaluation. It uses Google's Gemini 2.5 Flash model to intelligently analyze CVs against job descriptions and provide detailed assessments.

## Features

✨ **Automated CV Analysis**
- Extract text from PDF, DOCX, and TXT files
- AI-powered matching against job descriptions
- Comprehensive scoring system (0-100 scale)

📊 **Detailed Scoring**
- Overall match score
- Skills alignment
- Experience relevance  
- Education fit

🎯 **Smart Recommendations**
- Identify candidate strengths
- Highlight potential gaps
- Generate hiring recommendations
- Compare multiple candidates

## Module Structure

```
cv_screener/
├── __init__.py           # Package exports and metadata
├── gemini_screener.py    # Core AI screening logic
├── cv_parser.py          # File parsing utilities
└── README.md             # This file
```

## Quick Start

### 1. Installation

Ensure you have the required dependencies:

```bash
pip install google-generativeai PyPDF2 python-docx python-dotenv
```

### 2. Setup API Key

Create a `.env` file in the Backend directory:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Basic Usage

```python
from cv_screener import GeminiCVScreener, parse_cv_file

# Initialize screener
screener = GeminiCVScreener()

# Parse CV file
cv_text = parse_cv_file("path/to/resume.pdf")

# Analyze CV
job_description = """
Software Engineer position requiring:
- 3+ years Python experience
- React/Node.js knowledge
- Bachelor's in CS
"""

result = await screener.screen_cv(
    job_description=job_description,
    cv_content=cv_text,
    file_name="resume.pdf"
)

# View results
print(f"Candidate: {result['candidate_name']}")
print(f"Overall Score: {result['overall_score']}/100")
print(f"Recommendation: {result['recommendation']}")
```

## API Reference

### `GeminiCVScreener`

Main class for CV screening operations.

#### Methods

**`__init__(api_key: Optional[str] = None)`**

Initialize the screener with Gemini API credentials.

- **Parameters:**
  - `api_key`: Optional API key (reads from environment if not provided)

**`async screen_cv(job_description: str, cv_content: str, file_name: str) -> Dict`**

Analyze a single CV against a job description.

- **Parameters:**
  - `job_description`: Job requirements text
  - `cv_content`: Parsed CV text
  - `file_name`: Original filename
  
- **Returns:** Dictionary with:
  - `candidate_name`: Extracted name
  - `overall_score`: Match score (0-100)
  - `skills_match`: Skills score (0-100)
  - `experience_match`: Experience score (0-100)
  - `education_match`: Education score (0-100)
  - `strengths`: List of strengths
  - `weaknesses`: List of gaps
  - `recommendation`: Hiring recommendation
  - `summary`: Executive summary

**`async compare_candidates(job_description: str, candidates: List[Dict]) -> Dict`**

Compare and rank multiple candidates.

- **Parameters:**
  - `job_description`: Job requirements
  - `candidates`: List of screening results
  
- **Returns:** Dictionary with:
  - `ranked_candidates`: Sorted by score
  - `comparison_summary`: AI summary
  - `top_recommendation`: Best candidate

### `parse_cv_file(file_path: str) -> str`

Extract text content from CV files.

- **Parameters:**
  - `file_path`: Path to CV file
  
- **Returns:** Extracted text content

- **Supported Formats:**
  - PDF (.pdf)
  - Microsoft Word (.docx, .doc)
  - Plain Text (.txt)

## Scoring System

The AI evaluates candidates on a 0-100 scale:

| Score Range | Category | Description |
|-------------|----------|-------------|
| 90-100 | Exceptional | Exceeds all requirements |
| 75-89 | Strong | Meets most requirements |
| 60-74 | Moderate | Meets some requirements |
| 40-59 | Weak | Significant gaps |
| 0-39 | Poor | Doesn't meet basic requirements |

## Complete Example

```python
import asyncio
from cv_screener import GeminiCVScreener, parse_cv_file

async def screen_multiple_cvs():
    # Initialize
    screener = GeminiCVScreener()
    
    # Job description
    jd = """
    Senior Backend Developer needed.
    Requirements: 5+ years Python, FastAPI, PostgreSQL, AWS.
    """
    
    # CV files
    cv_files = ["candidate1.pdf", "candidate2.docx", "candidate3.pdf"]
    
    # Screen all candidates
    results = []
    for cv_file in cv_files:
        cv_text = parse_cv_file(cv_file)
        result = await screener.screen_cv(jd, cv_text, cv_file)
        results.append(result)
        
        print(f"\n{result['candidate_name']} - Score: {result['overall_score']}")
        print(f"Recommendation: {result['recommendation']}")
    
    # Compare candidates
    comparison = await screener.compare_candidates(jd, results)
    
    print("\n=== Top Candidates ===")
    for i, candidate in enumerate(comparison['ranked_candidates'][:3], 1):
        print(f"{i}. {candidate['candidate_name']} ({candidate['overall_score']})")
    
    print(f"\n{comparison['comparison_summary']}")

# Run
asyncio.run(screen_multiple_cvs())
```

## Error Handling

The module handles errors gracefully:

```python
try:
    cv_text = parse_cv_file("resume.pdf")
except FileNotFoundError:
    print("File not found")
except ValueError as e:
    print(f"Unsupported format: {e}")
except Exception as e:
    print(f"Parsing error: {e}")
```

## Best Practices

1. **API Key Security**
   - Never hardcode API keys
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **File Handling**
   - Validate file existence before parsing
   - Handle large files appropriately
   - Clean up temporary files

3. **Scoring Interpretation**
   - Consider all scoring dimensions
   - Review strengths/weaknesses
   - Use recommendations as guidance

4. **Performance**
   - Screen CVs asynchronously
   - Batch process when possible
   - Cache results if needed

## Troubleshooting

### Common Issues

**"GEMINI_API_KEY not found"**
- Ensure `.env` file exists in Backend directory
- Verify the key name is exactly `GEMINI_API_KEY`
- Check the `.env` file is loaded properly

**"Module not found" errors**
- Install missing packages: `pip install -r requirements.txt`
- Activate virtual environment if using one

**"Unsupported file format"**
- Verify file extension (.pdf, .docx, .txt)
- Check file is not corrupted
- Try converting to a supported format

**Low quality results**
- Ensure CVs and JDs have sufficient detail
- Check for text extraction issues
- Verify API key has proper permissions

## Contributing

When modifying this module:

1. Maintain comprehensive docstrings
2. Add type hints to all functions
3. Handle errors gracefully
4. Update this README for significant changes
5. Test with various CV formats

## License

Part of RecruBotX - See project root for license details.

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Maintainer:** RecruBotX Team
