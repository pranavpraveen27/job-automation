# AI Job Application Agent Backend

A FastAPI backend for resume upload, text extraction, skills extraction, job matching, and AI cover letter generation.

## Install

```bash
cd backend/fastapi_app
python -m pip install -r requirements.txt
```

## Run

From the `backend` directory:

```bash
python -m fastapi_app.main
```

Open `http://127.0.0.1:8000/docs` to inspect the API.

## API Endpoints

- `POST /resume/upload` - upload a PDF resume and return extracted text plus skills
- `POST /resume/extract` - extract text and skills from a PDF resume
- `POST /jobs/match` - match candidate skills against job postings
- `POST /cover-letter/generate` - generate an AI-style cover letter from candidate details

## Notes

- Uses CORS middleware with wildcard origin support by default
- Endpoints are implemented as async functions for compatibility with async workflows
- Resume extraction uses `pypdf` and a simple skill parser
