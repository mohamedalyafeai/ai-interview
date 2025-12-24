from fastapi import APIRouter, HTTPException, Header, Response, Request
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import os
import uuid
import httpx
from server import db
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ManualSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class ManualLoginRequest(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: str
    created_at: datetime
    interview_count: int = 0
    total_practice_time: int = 0

class SessionResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: str
    session_token: str

# Helper function to hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Helper function to verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Helper function to get user from session token
async def get_current_user(request: Request) -> User:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split("Bearer ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session in database
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

@router.post("/callback", response_model=SessionResponse)
async def auth_callback(
    response: Response,
    x_session_id: str = Header(None, alias="X-Session-ID")
):
    """Exchange session_id for user data and create session"""
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header is required")
    
    try:
        # Call Emergent Auth API
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id},
                timeout=10.0
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            user_data = auth_response.json()
        
        # Create or update user
        existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
        
        if existing_user:
            # Update existing user
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data["picture"]
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            new_user = {
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data["picture"],
                "created_at": datetime.now(timezone.utc),
                "interview_count": 0,
                "total_practice_time": 0
            }
            await db.users.insert_one(new_user)
        
        # Create session token
        session_token = f"session_{uuid.uuid4().hex}"
        session_data = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session_data)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        return SessionResponse(
            user_id=user_id,
            email=user_data["email"],
            name=user_data["name"],
            picture=user_data["picture"],
            session_token=session_token
        )
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    return user.dict()

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user and delete session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}
