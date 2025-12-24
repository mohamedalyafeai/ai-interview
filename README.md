# AI Interview Pro - Graduation Project

## 🎓 Complete AI-Powered Interview Practice Platform

### Features:
- ✅ Mock Interviews with AI (GPT-4o)
- ✅ Two-Way Voice Conversation
- ✅ Resume Analysis with AI
- ✅ Manual & Google OAuth Authentication
- ✅ Dashboard Analytics
- ✅ Profile Management
- ✅ Subscription Plans

### Technology Stack:
- **Frontend**: React 19, TailwindCSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o
- **Authentication**: Dual (Manual + Google OAuth)
- **Voice**: Web Speech API

### How to Run:

#### Frontend:
```bash
cd frontend
yarn install
yarn start
# Opens at http://localhost:3000
```

#### Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8001
# API at http://localhost:8001
```

#### MongoDB:
Make sure MongoDB is running on localhost:27017

### Environment Variables:

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=ai_interview_db
EMERGENT_LLM_KEY=your_key_here
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Project Structure:
```
.
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/    # All pages (Landing, Dashboard, Interview, etc.)
│   │   ├── components/  # Reusable components
│   │   └── services/    # API integration
│   └── package.json
├── backend/          # FastAPI application
│   ├── server.py    # Main server
│   ├── routes/      # API routes
│   └── requirements.txt
└── Documentation/   # All guides

```

### Key Features:

1. **Authentication**
   - Manual signup/login (email + password)
   - Google OAuth integration
   - Secure session management

2. **Mock Interviews**
   - AI-powered questions
   - Voice conversation mode
   - Real-time feedback
   - Performance analytics

3. **Resume Analysis**
   - PDF upload
   - AI-powered analysis
   - ATS compatibility scoring
   - Improvement suggestions

4. **Profile Management**
   - Editable name and birthday
   - Interview history
   - Statistics tracking

### Contact:
Graduation Project 2025
AI Interview Pro Platform

---
Built with React, FastAPI, MongoDB, and OpenAI GPT-4o
