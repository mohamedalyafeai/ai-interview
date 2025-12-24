from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from server import db
from routes.auth import get_current_user

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(request: Request):
    """Get user statistics for dashboard"""
    user = await get_current_user(request)
    
    try:
        # Get user stats
        user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
        
        # Get recent interviews
        interviews = await db.interviews.find(
            {"user_id": user.user_id, "status": "completed"},
            {"_id": 0, "interview_id": 1, "position": 1, "started_at": 1, "feedback.overall_score": 1, "duration_minutes": 1}
        ).sort("started_at", -1).to_list(5)
        
        # Calculate average score
        total_score = 0
        count = 0
        for interview in interviews:
            score = interview.get("feedback", {}).get("overall_score", 0)
            if score > 0:
                total_score += score
                count += 1
        
        average_score = round(total_score / count, 1) if count > 0 else 0
        
        # Calculate improvement (mock for now)
        improvement_percentage = 23 if count > 2 else 0
        
        # Format recent interviews
        recent_interviews = []
        for interview in interviews:
            started_at = interview.get("started_at")
            if isinstance(started_at, str):
                started_at = datetime.fromisoformat(started_at)
            
            recent_interviews.append({
                "id": interview["interview_id"],
                "position": interview["position"],
                "date": started_at.strftime("%Y-%m-%d") if started_at else "N/A",
                "score": interview.get("feedback", {}).get("overall_score", 0),
                "duration": f"{interview.get('duration_minutes', 0)} min"
            })
        
        return {
            "total_interviews": user_doc.get("interview_count", 0),
            "average_score": f"{average_score}/10",
            "total_time_minutes": user_doc.get("total_practice_time", 0),
            "total_time": f"{round(user_doc.get('total_practice_time', 0) / 60, 1)}h",
            "improvement_percentage": improvement_percentage,
            "recent_interviews": recent_interviews
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")
