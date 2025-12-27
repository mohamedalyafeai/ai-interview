from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import os
import asyncio
import logging
import resend
import random
import string
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from server import db

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

class SendVerificationRequest(BaseModel):
    email: EmailStr
    name: str

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/send-verification")
async def send_verification_email(request: SendVerificationRequest):
    """Send verification code to user's email"""
    try:
        # Generate verification code
        code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        # Store verification code in database
        await db.verification_codes.update_one(
            {"email": request.email},
            {
                "$set": {
                    "email": request.email,
                    "code": code,
                    "expires_at": expires_at,
                    "verified": False,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        
        # Create beautiful HTML email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">AI Interview Pro</h1>
                        <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">Professional Interview Platform</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 40px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Welcome, {request.name}!</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Thank you for signing up for AI Interview Pro. To complete your registration, please use the verification code below:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                            <h1 style="color: #7c3aed; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: bold;">{code}</h1>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                            This code will expire in <strong>15 minutes</strong>. If you didn't request this code, you can safely ignore this email.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2024 AI Interview Pro. All rights reserved.
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        # Send email using Resend
        params = {
            "from": SENDER_EMAIL,
            "to": [request.email],
            "subject": f"Your AI Interview Pro Verification Code: {code}",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email_result = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Verification email sent to {request.email}")
        
        return {
            "status": "success",
            "message": f"Verification code sent to {request.email}",
            "email_id": email_result.get("id") if email_result else None
        }
        
    except Exception as e:
        logger.error(f"Failed to send verification email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send verification email: {str(e)}")

@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    """Verify the email verification code"""
    try:
        # Find verification code
        verification = await db.verification_codes.find_one(
            {"email": request.email},
            {"_id": 0}
        )
        
        if not verification:
            raise HTTPException(status_code=404, detail="No verification code found for this email")
        
        # Check if already verified
        if verification.get("verified"):
            return {"status": "success", "message": "Email already verified"}
        
        # Check if expired
        expires_at = verification.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")
        
        # Check code
        if verification.get("code") != request.code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Mark as verified
        await db.verification_codes.update_one(
            {"email": request.email},
            {"$set": {"verified": True, "verified_at": datetime.now(timezone.utc)}}
        )
        
        # Update user's email verification status
        await db.users.update_one(
            {"email": request.email},
            {"$set": {"email_verified": True}}
        )
        
        return {"status": "success", "message": "Email verified successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify code: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to verify code: {str(e)}")

@router.post("/resend-verification")
async def resend_verification(request: SendVerificationRequest):
    """Resend verification code"""
    return await send_verification_email(request)
