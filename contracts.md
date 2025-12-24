# AI Interview Platform - Backend Integration Contracts

## Overview
Full-stack AI Interview platform with OpenAI GPT-4o for interviews/resume analysis and Google OAuth for authentication.

## Technology Stack
- **Frontend**: React with purple/violet theme
- **Backend**: FastAPI + Python
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via emergentintegrations
- **Auth**: Emergent Google OAuth

---

## 1. Authentication System

### API Endpoints

#### POST /api/auth/callback
**Purpose**: Exchange session_id for user data and create session
**Request Headers**: `X-Session-ID: {session_id}`
**Response**:
```json
{
  "user_id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "session_token": "token_xyz"
}
```
**Backend Actions**:
- Call Emergent API with session_id
- Create/update user in MongoDB
- Generate session_token (7 days expiry)
- Set httpOnly cookie
- Return user data

#### GET /api/auth/me
**Purpose**: Verify session and get current user
**Request**: Cookie with session_token
**Response**: User object or 401
**Backend Actions**:
- Check session_token from cookie/header
- Verify expiry
- Return user data

#### POST /api/auth/logout
**Purpose**: End user session
**Request**: Cookie with session_token
**Response**: `{"message": "Logged out successfully"}`
**Backend Actions**:
- Delete session from database
- Clear cookie

---

## 2. Interview System

### Database Collections

#### users
```json
{
  "user_id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "created_at": "2025-01-20T10:00:00Z",
  "interview_count": 12,
  "total_practice_time": 270
}
```

#### user_sessions
```json
{
  "user_id": "user_abc123",
  "session_token": "token_xyz",
  "expires_at": "2025-01-27T10:00:00Z",
  "created_at": "2025-01-20T10:00:00Z"
}
```

#### interviews
```json
{
  "interview_id": "interview_xyz",
  "user_id": "user_abc123",
  "session_id": "chat_session_123",
  "position": "Software Engineer",
  "level": "Mid Level",
  "status": "completed",
  "started_at": "2025-01-20T10:00:00Z",
  "completed_at": "2025-01-20T10:22:00Z",
  "duration_minutes": 22,
  "conversation": [
    {
      "role": "ai",
      "content": "Tell me about yourself...",
      "timestamp": "2025-01-20T10:00:00Z"
    },
    {
      "role": "user",
      "content": "I am a software engineer...",
      "timestamp": "2025-01-20T10:01:30Z"
    }
  ],
  "feedback": {
    "overall_score": 8.5,
    "categories": {
      "communication": 9,
      "technical_knowledge": 8,
      "problem_solving": 8.5,
      "culture_fit": 9,
      "confidence": 8
    },
    "strengths": ["Clear communication", "Good examples"],
    "improvements": ["Add more metrics", "Be more concise"],
    "overall_feedback": "Great performance overall..."
  }
}
```

### API Endpoints

#### POST /api/interview/start
**Purpose**: Start new interview session
**Request**:
```json
{
  "position": "Software Engineer",
  "level": "Mid Level"
}
```
**Response**:
```json
{
  "interview_id": "interview_xyz",
  "session_id": "chat_session_123",
  "first_question": "Tell me about yourself..."
}
```
**Backend Actions**:
- Create interview record
- Initialize LlmChat with system prompt
- Generate first question
- Return interview_id and question

#### POST /api/interview/answer
**Purpose**: Submit answer and get next question
**Request**:
```json
{
  "interview_id": "interview_xyz",
  "answer": "I am a software engineer with 5 years..."
}
```
**Response**:
```json
{
  "next_question": "What interests you about this role?",
  "is_complete": false
}
```
**Backend Actions**:
- Retrieve interview from database
- Send answer to LlmChat with session_id
- Get AI response (next question or completion signal)
- Update conversation in database
- Check if interview complete (5-6 questions)
- Return next question or completion flag

#### POST /api/interview/complete
**Purpose**: Generate final feedback for completed interview
**Request**:
```json
{
  "interview_id": "interview_xyz"
}
```
**Response**:
```json
{
  "feedback": {
    "overall_score": 8.5,
    "categories": {...},
    "strengths": [...],
    "improvements": [...],
    "overall_feedback": "..."
  }
}
```
**Backend Actions**:
- Retrieve full conversation
- Use GPT-4o to analyze performance
- Generate detailed feedback with scores
- Update interview record with feedback
- Mark as completed
- Update user stats

#### GET /api/interview/history
**Purpose**: Get user's interview history
**Response**:
```json
{
  "interviews": [
    {
      "interview_id": "interview_xyz",
      "position": "Software Engineer",
      "date": "2025-01-20",
      "score": 8.5,
      "duration": "22 min"
    }
  ]
}
```

---

## 3. Resume Analysis System

### Database Collections

#### resume_analyses
```json
{
  "analysis_id": "analysis_abc",
  "user_id": "user_abc123",
  "filename": "resume.pdf",
  "file_size": 45678,
  "analyzed_at": "2025-01-20T10:00:00Z",
  "extracted_text": "John Doe\nSoftware Engineer...",
  "analysis": {
    "overall_score": 78,
    "category_scores": {
      "ats_compatibility": 85,
      "content_quality": 75,
      "formatting": 72
    },
    "strengths": ["Clear job descriptions", "Strong skills"],
    "weaknesses": ["Missing metrics", "Inconsistent formatting"],
    "suggestions": ["Add quantifiable achievements", "Use keywords"]
  }
}
```

### API Endpoints

#### POST /api/resume/upload
**Purpose**: Upload resume for analysis
**Request**: multipart/form-data with PDF file
**Response**:
```json
{
  "analysis_id": "analysis_abc",
  "analysis": {
    "overall_score": 78,
    "category_scores": {...},
    "strengths": [...],
    "weaknesses": [...],
    "suggestions": [...]
  }
}
```
**Backend Actions**:
- Validate file (PDF only, size limit)
- Extract text from PDF using PyPDF2 or pdfplumber
- Send text to GPT-4o for analysis
- Parse AI response into structured format
- Save analysis to database
- Return analysis results

#### GET /api/resume/history
**Purpose**: Get user's resume analysis history
**Response**:
```json
{
  "analyses": [
    {
      "analysis_id": "analysis_abc",
      "filename": "resume.pdf",
      "date": "2025-01-20",
      "overall_score": 78
    }
  ]
}
```

---

## 4. Dashboard & Analytics

#### GET /api/dashboard/stats
**Purpose**: Get user statistics for dashboard
**Response**:
```json
{
  "total_interviews": 12,
  "average_score": 8.5,
  "total_time_minutes": 270,
  "improvement_percentage": 23,
  "recent_interviews": [...]
}
```
**Backend Actions**:
- Query user's interviews
- Calculate statistics
- Return aggregated data

---

## 5. Frontend Integration Changes

### Remove Mock Data
- Delete `/app/frontend/src/mock/mockData.js`
- Remove all imports of mock data

### API Service Layer
Create `/app/frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Auth
export const authService = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  callback: (sessionId) => api.post('/auth/callback', {}, {
    headers: { 'X-Session-ID': sessionId }
  })
};

// Interview
export const interviewService = {
  start: (data) => api.post('/interview/start', data),
  answer: (data) => api.post('/interview/answer', data),
  complete: (interviewId) => api.post('/interview/complete', { interview_id: interviewId }),
  getHistory: () => api.get('/interview/history')
};

// Resume
export const resumeService = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/resume/history')
};

// Dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};
```

### Update Components
1. **SignUp.jsx & Login.jsx**: Add OAuth redirect logic
2. **Dashboard.jsx**: Fetch real data from API
3. **Interview.jsx**: Integrate with interview API
4. **ResumeAnalysis.jsx**: Integrate with resume upload API
5. **Add AuthCallback.jsx**: Handle OAuth callback

---

## 6. AI System Prompts

### Interview Interviewer Prompt
```
You are an expert technical interviewer conducting a professional job interview for a {position} position at {level} level.

Your role:
- Ask relevant, challenging questions appropriate for the role and level
- Be professional and encouraging
- Ask 5-6 questions covering technical skills, experience, problem-solving, and cultural fit
- Keep questions clear and focused
- After 5-6 questions, politely end the interview

Current question count: {current_count}/6

Ask your next question now.
```

### Feedback Analysis Prompt
```
Analyze the following interview conversation and provide detailed feedback.

Position: {position}
Level: {level}

Conversation:
{conversation_history}

Provide feedback in the following JSON format:
{
  "overall_score": 8.5,
  "categories": {
    "communication": 9,
    "technical_knowledge": 8,
    "problem_solving": 8.5,
    "culture_fit": 9,
    "confidence": 8
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "overall_feedback": "Detailed paragraph of overall assessment"
}
```

### Resume Analysis Prompt
```
Analyze the following resume text and provide comprehensive feedback.

Resume Text:
{resume_text}

Provide analysis in the following JSON format:
{
  "overall_score": 78,
  "category_scores": {
    "ats_compatibility": 85,
    "content_quality": 75,
    "formatting": 72
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
}
```

---

## 7. Dependencies to Install

### Backend
```
pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
pip install PyPDF2
```

---

## Implementation Order

1. ✅ Frontend with mock data (DONE)
2. ⏳ Backend authentication system
3. ⏳ Backend interview system with GPT-4o
4. ⏳ Backend resume analysis
5. ⏳ Frontend-backend integration
6. ⏳ Testing

---

## Notes
- All timestamps use UTC timezone
- Session tokens valid for 7 days
- User IDs are custom UUIDs (not MongoDB _id)
- Always use `{"_id": 0}` projection in MongoDB queries
- CORS enabled for frontend origin
- File uploads limited to 10MB
