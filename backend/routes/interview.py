from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import json
import os
from server import db
from routes.auth import get_current_user
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class StartInterviewRequest(BaseModel):
    position: str
    level: str

class AnswerRequest(BaseModel):
    interview_id: str
    answer: str

class CompleteRequest(BaseModel):
    interview_id: str

@router.post("/start")
async def start_interview(request: Request, data: StartInterviewRequest):
    """Start a new interview session"""
    user = await get_current_user(request)
    
    try:
        # Create interview record
        interview_id = f"interview_{uuid.uuid4().hex[:12]}"
        chat_session_id = f"chat_{uuid.uuid4().hex[:12]}"
        
        # Initialize conversation
        conversation = []
        
        # Create interview record
        interview_doc = {
            "interview_id": interview_id,
            "user_id": user.user_id,
            "session_id": chat_session_id,
            "position": data.position,
            "level": data.level,
            "status": "in_progress",
            "started_at": datetime.now(timezone.utc),
            "conversation": conversation,
            "question_count": 0
        }
        await db.interviews.insert_one(interview_doc)
        
        # Initialize LLM chat with enhanced system prompt for real AI conversation
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        system_message = f"""You are Sarah, an experienced senior hiring manager and technical interviewer at a top tech company. You are conducting a real, professional interview for a {data.position} position at the {data.level} level.

CRITICAL - BE A REAL CONVERSATIONAL AI:
- Respond naturally like a real human interviewer would
- Show genuine curiosity and interest in the candidate's responses
- React to their answers with brief acknowledgments before asking the next question
- Use natural transitions like "That's interesting...", "I see...", "Great, let me ask you about..."
- Don't be robotic - be warm but professional

YOUR PERSONALITY:
- Professional but approachable
- Genuinely curious about the candidate
- Encouraging without being fake
- Direct and clear in your questions

INTERVIEW STRUCTURE (adapt based on responses):
1. Warm introduction and background question
2. Technical skills relevant to {data.position}
3. Problem-solving scenario
4. Behavioral/situational question
5. Team collaboration/communication
6. Closing question about their goals or questions for you

RULES:
- Ask ONE question at a time
- Keep questions concise and clear
- Listen and respond to what they actually say
- After 5-6 exchanges, conclude with: "INTERVIEW_COMPLETE: Thank you so much for your time today. It was great learning about your experience."
- NEVER repeat questions or ignore their answers

Start with a warm greeting and your first question about their background."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=chat_session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Get first question with natural opening
        user_message = UserMessage(text="Begin the interview now. Start with a warm, professional greeting and then ask about their background relevant to this role.")
        first_question = await chat.send_message(user_message)
        
        # Add to conversation
        conversation.append({
            "role": "ai",
            "content": first_question,
            "timestamp": datetime.now(timezone.utc)
        })
        
        # Update interview
        await db.interviews.update_one(
            {"interview_id": interview_id},
            {"$set": {"conversation": conversation, "question_count": 1}}
        )
        
        return {
            "interview_id": interview_id,
            "session_id": chat_session_id,
            "first_question": first_question
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")

@router.post("/answer")
async def submit_answer(request: Request, data: AnswerRequest):
    """Submit answer and get next question"""
    user = await get_current_user(request)
    
    try:
        # Get interview
        interview = await db.interviews.find_one(
            {"interview_id": data.interview_id, "user_id": user.user_id},
            {"_id": 0}
        )
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if interview["status"] != "in_progress":
            raise HTTPException(status_code=400, detail="Interview is not in progress")
        
        # Add user answer to conversation
        conversation = interview["conversation"]
        conversation.append({
            "role": "user",
            "content": data.answer,
            "timestamp": datetime.now(timezone.utc)
        })
        
        # Get next question from AI
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        question_count = interview["question_count"] + 1
        
        # Build conversation history for context
        conversation_history = ""
        for msg in conversation:
            speaker = "Sarah (You)" if msg["role"] == "ai" else "Candidate"
            conversation_history += f"{speaker}: {msg['content']}\n\n"
        
        # Enhanced system message for truly conversational AI
        system_message = f"""You are Sarah, an experienced senior hiring manager conducting a real interview for a {interview['position']} position at the {interview['level']} level.

CONVERSATION HISTORY:
{conversation_history}

THE CANDIDATE JUST SAID: "{data.answer}"

YOUR TASK:
1. First, briefly acknowledge what they said (1 sentence max) - show you actually listened
2. Then ask your next interview question

BE NATURAL AND HUMAN:
- React genuinely to their response
- If they gave a great answer, say something like "That's impressive..." or "Great experience..."
- If something was unclear, you can ask for clarification
- Reference specific things they mentioned
- Don't be generic - be specific to what they said

INTERVIEW PROGRESS: Question {question_count}/6

{"Ask a relevant follow-up question or move to a new topic. Make it feel like a real conversation." if question_count <= 5 else "Wrap up the interview warmly. Say: 'INTERVIEW_COMPLETE: Thank you so much for your time today. It was great learning about your experience and skills. We will be in touch soon!'"}

Remember: One response only. Be conversational, not robotic."""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=interview["session_id"],
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Send just the answer for context
        user_message = UserMessage(text=f"Candidate's answer: {data.answer}\n\nRespond naturally as Sarah the interviewer.")
        ai_response = await chat.send_message(user_message)
        
        # Check if interview is complete
        is_complete = "INTERVIEW_COMPLETE" in ai_response or question_count >= 6
        
        if is_complete:
            # Mark interview as complete
            await db.interviews.update_one(
                {"interview_id": data.interview_id},
                {"$set": {
                    "conversation": conversation,
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc),
                    "question_count": question_count
                }}
            )
            
            return {
                "next_question": "Interview completed. Generating your personalized feedback...",
                "is_complete": True
            }
        
        # Add AI response to conversation
        conversation.append({
            "role": "ai",
            "content": ai_response,
            "timestamp": datetime.now(timezone.utc)
        })
        
        # Update interview
        await db.interviews.update_one(
            {"interview_id": data.interview_id},
            {"$set": {
                "conversation": conversation,
                "question_count": question_count
            }}
        )
        
        return {
            "next_question": ai_response,
            "is_complete": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing answer: {str(e)}")

@router.post("/complete")
async def complete_interview(request: Request, data: CompleteRequest):
    """Generate feedback for completed interview"""
    user = await get_current_user(request)
    
    try:
        # Get interview
        interview = await db.interviews.find_one(
            {"interview_id": data.interview_id, "user_id": user.user_id},
            {"_id": 0}
        )
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Check if feedback already generated
        if "feedback" in interview and interview["feedback"]:
            return {"feedback": interview["feedback"]}
        
        # Generate feedback using AI
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Build detailed conversation history
        conversation_text = ""
        answer_count = 0
        for msg in interview["conversation"]:
            role = "Interviewer" if msg["role"] == "ai" else "Candidate"
            conversation_text += f"{role}: {msg['content']}\n\n"
            if msg["role"] == "user":
                answer_count += 1
        
        # Enhanced feedback prompt for accurate, personalized feedback
        feedback_prompt = f"""You are an expert interview coach analyzing a job interview. Provide detailed, ACCURATE feedback based ONLY on what the candidate actually said.

INTERVIEW DETAILS:
- Position: {interview['position']}
- Level: {interview['level']}
- Number of questions answered: {answer_count}

FULL INTERVIEW TRANSCRIPT:
{conversation_text}

IMPORTANT SCORING GUIDELINES:
- Score based on the ACTUAL responses given, not on what a good answer would be
- If the candidate gave short or vague answers, scores should reflect that (lower scores)
- If the candidate gave detailed, specific answers with examples, scores should be higher
- Be honest but constructive
- A score of 5-6 means average, 7-8 means good, 9-10 means excellent

ANALYZE EACH ASPECT:
1. Communication: Did they express ideas clearly? Were responses structured?
2. Technical Knowledge: Did they demonstrate relevant technical skills for {interview['position']}?
3. Problem Solving: Did they show analytical thinking?
4. Culture Fit: Did they show enthusiasm, teamwork, and alignment with typical company values?
5. Confidence: Did they answer with assurance? Did they handle questions well?

Provide feedback as a JSON object:
{{
  "overallScore": <number 1-10 based on actual performance>,
  "categories": {{
    "communication": <number 1-10>,
    "technicalKnowledge": <number 1-10>,
    "problemSolving": <number 1-10>,
    "cultureFit": <number 1-10>,
    "confidence": <number 1-10>
  }},
  "strengths": [
    "<specific strength based on what they actually said>",
    "<another specific strength>",
    "<another specific strength>"
  ],
  "improvements": [
    "<specific area for improvement based on gaps in their responses>",
    "<another improvement area>",
    "<another improvement area>"
  ],
  "overallFeedback": "<2-3 sentence personalized summary mentioning specific things from their interview>"
}}

Return ONLY valid JSON, no markdown or extra text."""
        
        feedback_chat = LlmChat(
            api_key=api_key,
            session_id=f"feedback_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert interview evaluator. Provide honest, accurate, and constructive feedback based only on what the candidate actually said in the interview. Return only valid JSON."
        ).with_model("openai", "gpt-4o")
        
        feedback_response = await feedback_chat.send_message(UserMessage(text=feedback_prompt))
        
        # Parse JSON response
        try:
            # Extract JSON if wrapped in markdown
            clean_response = feedback_response.strip()
            if "```json" in clean_response:
                clean_response = clean_response.split("```json")[1].split("```")[0]
            elif "```" in clean_response:
                clean_response = clean_response.split("```")[1].split("```")[0]
            
            feedback = json.loads(clean_response.strip())
            
            # Ensure proper field names (camelCase for frontend)
            if "overall_score" in feedback:
                feedback["overallScore"] = feedback.pop("overall_score")
            if "overall_feedback" in feedback:
                feedback["overallFeedback"] = feedback.pop("overall_feedback")
                
        except json.JSONDecodeError as e:
            # Fallback feedback based on answer count
            base_score = min(5 + answer_count, 8)
            feedback = {
                "overallScore": base_score,
                "categories": {
                    "communication": base_score,
                    "technicalKnowledge": base_score - 1,
                    "problemSolving": base_score - 1,
                    "cultureFit": base_score,
                    "confidence": base_score - 1
                },
                "strengths": [
                    "Completed the interview process",
                    "Showed willingness to engage",
                    "Responded to all questions asked"
                ],
                "improvements": [
                    "Provide more detailed and specific examples",
                    "Elaborate on technical experiences",
                    "Showcase problem-solving approach more clearly"
                ],
                "overallFeedback": f"You completed the interview for the {interview['position']} position. Practice providing more specific examples and details to strengthen your responses."
            }
        
        # Calculate duration
        started_at = interview["started_at"]
        completed_at = interview.get("completed_at", datetime.now(timezone.utc))
        if isinstance(started_at, str):
            started_at = datetime.fromisoformat(started_at)
        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at)
        
        # Ensure both datetimes have timezone info
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        if completed_at.tzinfo is None:
            completed_at = completed_at.replace(tzinfo=timezone.utc)
        
        duration_minutes = int((completed_at - started_at).total_seconds() / 60)
        
        # Update interview with feedback
        await db.interviews.update_one(
            {"interview_id": data.interview_id},
            {"$set": {
                "feedback": feedback,
                "duration_minutes": duration_minutes,
                "status": "completed",
                "completed_at": completed_at
            }}
        )
        
        # Update user statistics
        await db.users.update_one(
            {"user_id": user.user_id},
            {
                "$inc": {
                    "interview_count": 1,
                    "total_practice_time": duration_minutes
                }
            }
        )
        
        return {"feedback": feedback}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")

@router.get("/history")
async def get_interview_history(request: Request):
    """Get user's interview history"""
    user = await get_current_user(request)
    
    try:
        interviews = await db.interviews.find(
            {"user_id": user.user_id, "status": "completed"},
            {"_id": 0, "interview_id": 1, "position": 1, "started_at": 1, "feedback.overall_score": 1, "duration_minutes": 1}
        ).sort("started_at", -1).to_list(100)
        
        # Format for frontend
        history = []
        for interview in interviews:
            started_at = interview.get("started_at")
            if isinstance(started_at, str):
                started_at = datetime.fromisoformat(started_at)
            
            history.append({
                "id": interview["interview_id"],
                "position": interview["position"],
                "date": started_at.strftime("%Y-%m-%d") if started_at else "N/A",
                "score": interview.get("feedback", {}).get("overall_score", 0),
                "duration": f"{interview.get('duration_minutes', 0)} min"
            })
        
        return {"interviews": history}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")
