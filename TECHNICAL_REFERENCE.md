# Technical Architecture Reference

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                   │
│  Dashboard → JobCard → CoverLetterPanel → AIInsightsPanel   │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │   API Client     │
        │  (services/api)  │
        └────────┬─────────┘
                 │ REST/JSON
                 │ Bearer Token Auth
┌────────────────▼────────────────────────────────────────────┐
│              Express.js Backend (Node.js)                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                    │  │
│  │  (Validates Bearer Token, Extracts User ID)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                  │
│                          │                                  │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │              API Routes (/api/*)                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ /applications    (CRUD + Stats + PDF Export)      │   │
│  │ /resumes         (CRUD + AI Analysis + PDF)       │   │
│  │ /jobs            (Job Management)                 │   │
│  │ /auth            (Authentication)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                          ▲                                  │
│                          │                                  │
│  ┌──────────────────────┴─────────────────────────────┐   │
│  │           Controllers & Services                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ applicationController                             │   │
│  │ resumeOptimizationController                      │   │
│  │ pdfExportController                               │   │
│  │ aiService (OpenAI)                                │   │
│  │ pdfGenerationService (PDFKit)                      │   │
│  │ playwrightService                                 │   │
│  └──────────────────────────────────────────────────┘   │
│                          ▲                                  │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
        ┌────────▼────────┐  ┌───────▼──────┐
        │   MongoDB       │  │  OpenAI API  │
        │  (Persistence)  │  │  (AI Prompts)│
        └─────────────────┘  └──────────────┘
```

## Feature 1: Database Persistence

### Data Flow
```
User Action (Save Application)
    ↓
Frontend (CoverLetterPanel) → POST /api/applications
    ↓
Middleware: authenticateToken (Extract user from JWT)
    ↓
Controller: createApplication
    ↓
Model: Application.save() → MongoDB
    ↓
Response: { success: true, application: {...} }
    ↓
Frontend: Update state, show confirmation
```

### Application Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  jobId: ObjectId,            // Reference to Job
  jobTitle: String,
  company: String,
  jobUrl: String,
  status: Enum[submitted|viewing|screening|interview|rejected|offer|accepted],
  coverLetter: {
    text: String,
    generatedAt: Date,
    model: String
  },
  statusHistory: [
    { status: String, date: Date, notes: String }
  ],
  autoApplied: Boolean,
  applicationMethod: Enum[manual|auto|quick-apply],
  interviews: [
    { date: Date, time: String, type: String, result: String }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### GET /api/applications
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `status`: Filter by status (optional)

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved",
  "applications": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### POST /api/applications
**Request:**
```json
{
  "jobId": "job123",
  "resumeId": "resume123",
  "coverLetter": "Dear...",
  "autoApplied": false
}
```

#### PUT /api/applications/:id
**Request:**
```json
{
  "status": "interview",
  "notes": "First round interview scheduled"
}
```

#### DELETE /api/applications/:id
Removes application and resets job status to "open"

#### GET /api/applications/stats/overview
**Response:**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "stats": {
    "total": 48,
    "submitted": 35,
    "screening": 8,
    "interview": 4,
    "offer": 1,
    "rejected": 2
  }
}
```

---

## Feature 2: Resume Optimizer

### Data Flow
```
User Uploads Resume
    ↓
Resume saved to MongoDB with extracted data
    ↓
User clicks "Get Insights" in AIInsightsPanel
    ↓
Frontend: GET /api/resumes/:resumeId/insights
    ↓
Backend Controller:
  1. Fetch resume from MongoDB
  2. Format resume data to text
  3. Call aiService.suggestResumeImprovements(text)
  4. Send prompt to OpenAI GPT-4
  5. Parse JSON response
  6. Store insights in resume.aiAnalysis
  7. Return insights to frontend
    ↓
Frontend: AIInsightsPanel displays insights with color-coded priorities
```

### Resume Model Extension
```javascript
resume.aiAnalysis = {
  extractedAt: Date,
  extractionQuality: Number,
  insights: [
    {
      'Current issue': String,
      'Recommended change': String,
      'Why it improves the resume': String,
      'Priority': Enum[high|medium|low]
    }
  ],
  insightsGeneratedAt: Date,
  critique: [
    {
      'Formatting issue or strength': String,
      'Visual impact on recruiter': String,
      'Specific recommendation to improve': String,
      'Severity': Enum[critical|high|medium|low]
    }
  ],
  critiqueGeneratedAt: Date,
  score: {
    'Content Quality': Number,
    'Formatting Quality': Number,
    'ATS Compatibility': Number,
    'Impact Potential': Number,
    'Overall resume score': Number,
    'Executive summary': String,
    'Top 3 priorities for improvement': [String]
  }
}
```

### API Endpoints

#### GET /api/resumes/:resumeId/insights
OpenAI Prompt Template:
```
Analyze this resume and suggest 5-10 specific improvements...
For each suggestion, provide:
1. Current issue
2. Recommended change
3. Why it improves the resume
4. Priority (high/medium/low)

Format as JSON array.
```

**Response:**
```json
{
  "success": true,
  "message": "Resume insights generated",
  "insights": [
    {
      "Current issue": "...",
      "Recommended change": "...",
      "Why it improves the resume": "...",
      "Priority": "high"
    }
  ]
}
```

#### GET /api/resumes/:resumeId/critique
Analyzes formatting, ATS compatibility, visual hierarchy, etc.

#### GET /api/resumes/:resumeId/score
Comprehensive quality analysis with scoring breakdown

### AIService Methods
```javascript
async suggestResumeImprovements(resumeText)
  → Returns: [{ issue, change, rationale, priority }]

async critiqueResumeFormatting(resumeText)
  → Returns: [{ issue, impact, recommendation, severity }]

async analyzeResumeQuality(resumeText)
  → Returns: { contentQuality, formatting, ats, impact, overall, summary }
```

### Frontend Integration
```jsx
<AIInsightsPanel 
  resumeId={resume._id}
  token={authToken}
/>
// Auto-loads insights on mount
// Color-codes by priority
// Shows refresh button
// Handles loading/error states
```

---

## Feature 3: PDF Export Service

### PDF Generation Architecture
```
CoverLetterPanel (User clicks Download)
    ↓
Frontend: blob = downloadCoverLetterPDF(appId, token)
    ↓
GET /api/applications/:applicationId/download-cover-letter
    ↓
Controller: pdfExportController.downloadCoverLetterPDF
    ↓
Query MongoDB for Application (auth check)
    ↓
Call pdfGenerationService.generateCoverLetterPDF({
  text,
  candidateName,
  email,
  phone,
  jobTitle,
  company
})
    ↓
PDFKit:
  1. Create new PDFDocument (A4, margins)
  2. Add header: candidate name (16pt bold)
  3. Add contact info: email | phone (10pt)
  4. Add date (10pt)
  5. Add salutation
  6. Add body text (11pt justified)
  7. Add closing
  8. Write to buffer
    ↓
Response: Set Headers
  - Content-Type: application/pdf
  - Content-Disposition: attachment; filename="Company_CoverLetter_Date.pdf"
  - Send buffer
    ↓
Browser: Download file to user's device
```

### PDF Generation Service

#### Cover Letter PDF Structure
```
┌─────────────────────────────────────┐
│ John Doe                            │
│ john@example.com | 555-0123        │
│ May 19, 2024                        │
│                                     │
│ Dear Hiring Manager,                │
│                                     │
│ I am writing to express my strong  │
│ interest in the AI Product Manager │
│ position at Nimbus Labs...          │
│                                     │
│ [Body paragraphs with justified     │
│ alignment, 7pt line spacing]        │
│                                     │
│ Sincerely,                          │
│                                     │
│ [Blank space for signature]         │
│                                     │
│ John Doe                            │
└─────────────────────────────────────┘
```

#### Resume PDF Structure
```
┌─────────────────────────────────────┐
│          JOHN DOE                   │
│  john@example.com | 555-0123       │
│  San Francisco, CA | LinkedIn | Git │
├─────────────────────────────────────┤
│ PROFESSIONAL SUMMARY                │
│ [2-3 sentence overview]             │
│                                     │
│ EXPERIENCE                          │
│ • Senior Engineer at TechCorp       │
│   2021 - Present                    │
│   Led team of 5 engineers...        │
│                                     │
│ EDUCATION                           │
│ • B.S. Computer Science             │
│   University of California          │
│                                     │
│ SKILLS                              │
│ React, Node.js, MongoDB, AWS        │
└─────────────────────────────────────┘
```

### API Endpoints

#### GET /api/applications/:applicationId/download-cover-letter
**Headers Required:**
- `Authorization: Bearer TOKEN`

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="Company_CoverLetter_2024-05-19.pdf"
- Body: PDF binary data

#### POST /api/applications/export-cover-letter-pdf
**Request:**
```json
{
  "applicationId": "app123",
  "format": "pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF generated successfully",
  "pdf": "base64-encoded-pdf-string",
  "filename": "Company_CoverLetter.pdf",
  "mimeType": "application/pdf"
}
```

#### GET /api/resumes/:resumeId/download
**Headers Required:**
- `Authorization: Bearer TOKEN`

**Response:**
- Resume PDF file

### PDFKit Configuration
```javascript
const doc = new PDFDocument({
  size: 'A4',           // 210 x 297 mm
  margins: {
    top: 50,            // 0.5 inch
    bottom: 50,
    left: 50,
    right: 50
  }
});

// Text styling
doc.fontSize(11)
   .font('Helvetica')
   .text(content, { align: 'justify', lineGap: 5 });
```

### Frontend Integration
```jsx
<CoverLetterPanel
  coverLetter={coverLetter}
  onRegenerate={handleRegenerate}
  applicationId={appId}
  token={authToken}
  isLoading={loading}
/>

// Inside: 
const handleDownloadPDF = async () => {
  const blob = await downloadCoverLetterPDF(applicationId, token);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cover-letter-${date}.pdf`;
  link.click();
}
```

---

## Authentication Flow

```
User Logs In
    ↓
Backend: Generates JWT with userId payload
    ↓
Frontend: Stores JWT in localStorage
    ↓
Every API Call:
  Headers: { Authorization: `Bearer ${token}` }
    ↓
Backend Middleware (authenticateToken):
  1. Extract token from Authorization header
  2. Verify JWT signature
  3. Extract userId from payload
  4. Attach to req.user
    ↓
Controller: Uses req.user.userId for data filtering
```

## Error Handling

### Standardized Response Format
```javascript
// Success
{
  success: true,
  message: "Operation completed",
  data: { /* response data */ },
  pagination: { /* if applicable */ }
}

// Error
{
  success: false,
  message: "Error description",
  error: "Detailed error info"
}
```

### HTTP Status Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## Performance Considerations

1. **Pagination:** Applications endpoint supports pagination (default 10/page)
2. **Caching:** Resume insights cached in database to avoid re-prompting OpenAI
3. **PDF Generation:** Happens server-side, no heavy processing on client
4. **Indexing:** MongoDB indexes on userId for fast user-scoped queries
5. **Token Expiration:** JWT tokens should have 24-hour expiry

---

## Security Best Practices Implemented

✅ User isolation via userId filtering
✅ Token validation on all protected routes
✅ No sensitive data in error messages
✅ Server-side PDF generation (no user input injection)
✅ Password hashing with bcryptjs
✅ CORS configured with frontend origin
✅ Environment variables for secrets
