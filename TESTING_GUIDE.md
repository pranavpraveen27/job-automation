# Comprehensive Testing Guide

## Pre-Testing Setup

### 1. Ensure Services are Running

```bash
# Terminal 1: Start Backend
cd /home/pro/Documents/AIcruit/job-agent/backend
npm install
npm start
# Should see: "🚀 Backend server running on http://localhost:5000"

# Terminal 2: Start Frontend  
cd /home/pro/Documents/AIcruit/job-agent/frontend
npm install
npm run dev
# Should see: "➜  Local: http://localhost:5173"

# Terminal 3: Verify MongoDB (if local)
mongod  # or ensure cloud MongoDB is accessible
```

### 2. Get Required Credentials

- ✅ OpenAI API Key (set in `backend/.env`)
- ✅ JWT Secret (auto-generated or set)
- ✅ Google OAuth ID (optional, for social login)

---

## Feature 1: Database Persistence Testing

### Test 1.1: Create & Retrieve Application

**Steps:**
1. Open http://localhost:5173
2. Login with test credentials
3. Upload a resume file
4. Select a job card from "Recommended Opportunities"
5. Generate a cover letter
6. Click "Regenerate" button

**Expected Behavior:**
- Cover letter text appears in CoverLetterPanel
- No errors in console

**API Verification (curl):**
```bash
# Get auth token first (from browser localStorage or login)
TOKEN="your-jwt-token"

# Create application
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job123",
    "resumeId": "resume123",
    "coverLetter": "Dear Hiring Manager...",
    "autoApplied": false
  }'

# Response should include:
# { "success": true, "application": { "_id": "...", ... } }
```

### Test 1.2: List Applications

**Steps:**
1. Dashboard should show "Your Statistics"
2. Verify numbers are accurate:
   - Jobs Applied (should show count > 0 if you created one)
   - Resume Match (should show %)
   - Interviews (should show count)
   - Pending (should show count)

**API Verification:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/applications

# Response format:
# {
#   "success": true,
#   "applications": [...],
#   "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1 }
# }
```

### Test 1.3: Update Application Status

**Steps:**
1. Open browser DevTools → Application tab
2. In Console, run:
```javascript
// Get an application ID from the list
const appId = "your-app-id";
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/applications/' + appId, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'interview',
    notes: 'First round scheduled'
  })
}).then(r => r.json()).then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Application updated",
  "application": {
    "_id": "...",
    "status": "interview",
    "statusHistory": [
      {
        "status": "interview",
        "date": "2024-05-19T...",
        "notes": "First round scheduled"
      }
    ]
  }
}
```

### Test 1.4: Statistics Aggregation

**API Verification:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/applications/stats/overview

# Response:
# {
#   "success": true,
#   "stats": {
#     "total": 5,
#     "submitted": 3,
#     "screening": 1,
#     "interview": 1,
#     "offer": 0,
#     "rejected": 0
#   }
# }
```

---

## Feature 2: Resume Optimizer Testing

### Test 2.1: Generate Resume Insights

**Steps:**
1. Upload a resume (must be done first)
2. Scroll down on Dashboard
3. Look for "AI Insights" section with "Resume Insights" heading
4. Click "Refresh" button
5. Wait for insights to load (15-30 seconds, depends on OpenAI)

**Visual Verification:**
- Green checkmark (✓) appears
- 5-10 insight cards display
- Each card shows:
  - Icon (Alert, Warning, Zap, Check)
  - Title (the issue)
  - Description (recommendation)
  - Italicized rationale
  - Color coding: Red(High), Yellow(Medium), Blue(Low)

**Console Verification:**
```javascript
// In browser console
fetch('http://localhost:5000/api/resumes/RESUME_ID/insights', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(d => {
  console.log('Insights:', d.insights);
  console.log('Count:', d.insights.length);
})
```

### Test 2.2: Get Resume Critique (Formatting)

**API Testing:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/resumes/$RESUME_ID/critique

# Should return formatting-specific feedback with severity levels
```

**Expected Structure:**
```json
[
  {
    "Formatting issue or strength": "Summary is too long",
    "Visual impact on recruiter": "Reduces readability, gets skipped",
    "Specific recommendation to improve": "Reduce to 2-3 lines max",
    "Severity": "high"
  }
]
```

### Test 2.3: Get Resume Quality Score

**API Testing:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/resumes/$RESUME_ID/score

# Should return comprehensive breakdown
```

**Expected Structure:**
```json
{
  "Content Quality": 78,
  "Formatting Quality": 65,
  "ATS Compatibility": 82,
  "Impact Potential": 71,
  "Overall resume score": 74,
  "Executive summary": "Your resume is...",
  "Top 3 priorities for improvement": [
    "Add more action verbs",
    "Improve formatting consistency",
    "Add quantifiable metrics"
  ]
}
```

### Test 2.4: Error Handling

**Steps:**
1. Try to get insights with invalid resumeId:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/resumes/invalid-id/insights
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Resume not found"
}
```

2. Try to get insights without authentication:
```bash
curl http://localhost:5000/api/resumes/$RESUME_ID/insights
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

---

## Feature 3: PDF Export Testing

### Test 3.1: Download Cover Letter PDF

**Steps:**
1. Generate a cover letter (must exist first)
2. Look for blue "PDF" button in CoverLetterPanel
3. Verify button shows text "PDF"
4. Click button
5. Wait for download (2-5 seconds)
6. Check Downloads folder

**File Verification:**
```bash
# Check file was created
ls -lh ~/Downloads/*CoverLetter*.pdf

# Verify it's valid PDF
file ~/Downloads/*CoverLetter*.pdf
# Should output: "PDF document, version 1.4"

# Check file size (should be 5-50 KB)
du -h ~/Downloads/*CoverLetter*.pdf
```

**PDF Content Verification:**
1. Open the downloaded PDF
2. Verify it contains:
   - Your name at top
   - Your email and phone
   - Current date
   - "Dear Hiring Manager," salutation
   - Full cover letter text
   - "Sincerely," closing
   - Your name at bottom
   - Professional formatting with proper margins

### Test 3.2: PDF Filename Format

**Expected Format:**
```
{Company}_CoverLetter_{YYYY-MM-DD}.pdf

Example:
Nimbus Labs_CoverLetter_2024-05-19.pdf
```

### Test 3.3: Button States

**Test Disabled States:**
1. Load dashboard without uploading resume
2. Verify PDF button is not visible or disabled
3. Generate cover letter
4. Verify PDF button becomes enabled
5. Click PDF button
6. Verify button shows "Downloading..." during download

**Test Loading State:**
```javascript
// In console, watch button state
setInterval(() => {
  const btn = document.querySelector('[disabled]');
  console.log('Button disabled:', btn?.disabled);
}, 500);
```

### Test 3.4: PDF Generation Errors

**Simulate Error - Missing Cover Letter:**
1. Navigate to application without cover letter:
```bash
curl -X GET "http://localhost:5000/api/applications/app-id/download-cover-letter" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Cover letter not found"
}
```

**Simulate Error - Wrong User:**
1. Use JWT token from different user
2. Try to download application from first user
3. Should get 404 or permission error

### Test 3.5: PDF Quality Check

**Steps:**
1. Download PDF
2. Open in PDF viewer (Adobe, Preview, etc.)
3. Verify:
   - ✅ Text is readable
   - ✅ Formatting looks professional
   - ✅ Margins are balanced
   - ✅ No text cutoff
   - ✅ Fonts are consistent
   - ✅ Line spacing is appropriate
   - ✅ Page fits on single page

---

## Integration Testing

### Test I.1: Full Application Workflow

**Scenario:** Create an application from scratch to PDF download

**Steps:**
1. Login to dashboard
2. Upload resume
3. Wait for upload to complete
4. Verify resume data displays
5. See "Recommended Opportunities" job list
6. Click regenerate cover letter (or wait for auto-generation)
7. See cover letter text appear
8. Scroll down to see AIInsightsPanel
9. Click "Refresh" on insights
10. See insights load (5-10 items with colors)
11. Scroll back to cover letter
12. Click PDF button
13. Verify download completes
14. Open PDF to verify content

**Expected Outcome:**
- No errors in console
- All UI elements render properly
- Statistics update correctly
- PDF opens and looks professional

### Test I.2: Multi-Tab Consistency

**Steps:**
1. Open Dashboard in Tab 1
2. Open same in Tab 2
3. In Tab 1: Create new application
4. In Tab 2: Refresh page
5. New application should appear in Tab 2

**Expected Outcome:**
- Application visible in both tabs
- Statistics sync across tabs
- No data conflicts

### Test I.3: Error Recovery

**Steps:**
1. Create application successfully
2. Disconnect MongoDB (or kill backend)
3. Try to load applications
4. Verify error message displays
5. Restart backend
6. Try again
7. Verify data loads correctly

**Expected Outcome:**
- Graceful error handling
- No crashes
- Clear error messages to user

---

## Performance Testing

### Test P.1: Load Time - Generate Insights

**Scenario:** Measure time to generate resume insights

**Steps:**
```javascript
console.time('insights');
// Click refresh on AIInsightsPanel
// Open DevTools Network tab and observe
console.timeEnd('insights');
```

**Expected Performance:**
- API call: 15-30 seconds (depends on OpenAI)
- Frontend response: < 100ms
- Rendering: < 500ms

### Test P.2: Pagination Performance

**Scenario:** Load large application list

**Steps:**
```bash
# Create multiple applications
for i in {1..50}; do
  curl -X POST http://localhost:5000/api/applications \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{...}"
done

# Load page 1
curl "http://localhost:5000/api/applications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Load page 5
curl "http://localhost:5000/api/applications?page=5&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Performance:**
- Response time: < 500ms per page
- Data transfer: < 100KB per page
- No N+1 queries

---

## Security Testing

### Test S.1: Authentication Required

**Steps:**
1. Try to access `/api/applications` without token:
```bash
curl http://localhost:5000/api/applications
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Test S.2: User Isolation

**Steps:**
1. Create application as User A
2. Get token for User B
3. Try to access User A's application:
```bash
curl "http://localhost:5000/api/applications/user-a-app-id" \
  -H "Authorization: Bearer user-b-token"
```

**Expected Response:**
- 404 Not Found or
- { "success": false, "message": "Application not found" }

### Test S.3: Token Expiration

**Steps:**
1. Use expired/invalid token:
```bash
curl "http://localhost:5000/api/applications" \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Regression Testing

### Test R.1: Existing Features Still Work

**Verify:**
- ✅ Login/Signup still works
- ✅ Resume upload still works
- ✅ Job browsing still works
- ✅ Cover letter generation still works
- ✅ Navigation works properly
- ✅ Logout works

### Test R.2: UI Components Render

**Verify:**
- ✅ Dashboard loads
- ✅ Navbar displays correctly
- ✅ Sidebar works
- ✅ All cards render
- ✅ No console errors
- ✅ Responsive on mobile

---

## Browser Compatibility Testing

Test on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile (iOS Safari, Chrome Mobile)

**Verify:**
- PDF downloads work
- All buttons clickable
- No styling issues
- Responsive design works

---

## Test Report Template

```markdown
# Test Report - [Date]

## Tester Info
- Name: 
- Browser:
- OS:
- Backend URL:
- Frontend URL:

## Feature 1: Database Persistence
- [ ] Applications save to MongoDB
- [ ] Applications retrieve correctly
- [ ] Pagination works
- [ ] Status updates persist
- [ ] Statistics calculated correctly

Result: ✅ PASS / ❌ FAIL

## Feature 2: Resume Optimizer
- [ ] Insights load without errors
- [ ] Color-coding works
- [ ] Refresh button works
- [ ] Critique endpoint works
- [ ] Score endpoint works

Result: ✅ PASS / ❌ FAIL

## Feature 3: PDF Export
- [ ] PDF button visible
- [ ] PDF downloads
- [ ] Filename correct
- [ ] PDF opens
- [ ] Content correct

Result: ✅ PASS / ❌ FAIL

## Issues Found
- Issue 1: ...
- Issue 2: ...

## Notes
```

---

## Automated Testing Scripts

Save as `test-api.sh`:

```bash
#!/bin/bash

API="http://localhost:5000/api"
TOKEN="$1"

echo "Testing Database Persistence..."
curl -s "$API/applications" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "\nTesting Resume Insights..."
curl -s "$API/resumes/resume-id/insights" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "\nTesting PDF Export..."
curl -s "$API/applications/app-id/download-cover-letter" \
  -H "Authorization: Bearer $TOKEN" \
  -o test.pdf && echo "PDF created: $(file test.pdf)"
```

Run with:
```bash
bash test-api.sh "your-jwt-token"
```

---

## Checklist - Before Going Live

- [ ] All 3 features tested end-to-end
- [ ] No console errors on frontend
- [ ] No backend errors in logs
- [ ] PDF files generate successfully
- [ ] Resume insights provide helpful feedback
- [ ] Applications save and persist
- [ ] Authentication works correctly
- [ ] Error messages are clear
- [ ] Performance acceptable
- [ ] Security tested (token validation)
- [ ] Mobile responsive
- [ ] Cross-browser tested

---

**Total Test Cases:** 30+
**Estimated Test Time:** 2-3 hours
**Go-Live Ready When:** All tests PASS ✅
