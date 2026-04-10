# Autonomous Job Application Agent

A beginner-friendly MERN project that:

- Takes a job application URL
- Opens it in a browser using Playwright
- Fills basic form fields with dummy data
- Uploads a sample resume
- Submits the application
- Tracks status in a dashboard

## Project structure

- `job-agent/backend/` — Express backend, MongoDB, Playwright automation
- `job-agent/frontend/` — React frontend with job submission and status view

## Setup

### 0. Optional .env file

Copy `.env.example` to `.env` if you want a local config file:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env` if needed.

### 1. Start MongoDB

Make sure MongoDB is running locally or update `backend/.env.example` with your connection string.

Example local MongoDB URL:

```bash
mongodb://localhost:27017/job-agent
```

### 2. Run the backend

```bash
cd job-agent/backend
npm install
npm start
```

The backend runs on `http://localhost:5000`.

### 3. Run the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, typically `http://localhost:5173`.

## Usage

1. Open the frontend in the browser.
2. Paste a job application URL.
3. Submit it.
4. The backend will save the job, start automation, and update status.
5. Refresh the dashboard or wait for auto-refresh.

## Notes

- The sample resume is stored at `backend/resume.pdf`.
- Browser automation uses Playwright with Chromium.
- Screenshots are saved to `backend/screenshots/` after form submission.
- The backend logs automation steps to the console.
