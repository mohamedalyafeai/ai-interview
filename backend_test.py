#!/usr/bin/env python3
"""
AI Interview Platform Backend API Testing
Tests all backend endpoints with authentication
"""

import requests
import json
import os
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://mockinterview-7.preview.emergentagent.com"
SESSION_TOKEN = "test_session_1766610330250"
USER_ID = "test-user-1766610330250"

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, success, details=""):
    """Log test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")
    
    if success:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {details}")
    print()

def make_request(method, endpoint, headers=None, data=None, files=None):
    """Make HTTP request with error handling"""
    url = f"{BACKEND_URL}{endpoint}"
    
    # Default headers
    default_headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    if headers:
        default_headers.update(headers)
    
    # Remove Content-Type for file uploads
    if files:
        default_headers.pop("Content-Type", None)
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=default_headers, timeout=30)
        elif method.upper() == "POST":
            if files:
                response = requests.post(url, headers=default_headers, files=files, timeout=30)
            else:
                response = requests.post(url, headers=default_headers, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def test_api_health():
    """Test basic API health"""
    print("🔍 Testing API Health...")
    
    response = make_request("GET", "/api/", headers={"Authorization": ""})
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "message" in data:
                log_test("API Health Check", True, f"API is running: {data['message']}")
            else:
                log_test("API Health Check", False, "Unexpected response format")
        except json.JSONDecodeError:
            log_test("API Health Check", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("API Health Check", False, f"Status: {status}")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("🔐 Testing Authentication Endpoints...")
    
    # Test /api/auth/me
    response = make_request("GET", "/api/auth/me")
    if response and response.status_code == 200:
        try:
            user_data = response.json()
            required_fields = ["user_id", "email", "name", "picture"]
            missing_fields = [field for field in required_fields if field not in user_data]
            
            if not missing_fields and user_data["user_id"] == USER_ID:
                log_test("GET /api/auth/me", True, f"User authenticated: {user_data['name']}")
            else:
                log_test("GET /api/auth/me", False, f"Missing fields: {missing_fields}")
        except json.JSONDecodeError:
            log_test("GET /api/auth/me", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("GET /api/auth/me", False, f"Status: {status}")
    
    # Test /api/auth/logout
    response = make_request("POST", "/api/auth/logout")
    if response and response.status_code == 200:
        try:
            data = response.json()
            if "message" in data:
                log_test("POST /api/auth/logout", True, data["message"])
            else:
                log_test("POST /api/auth/logout", False, "Unexpected response format")
        except json.JSONDecodeError:
            log_test("POST /api/auth/logout", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("POST /api/auth/logout", False, f"Status: {status}")

def test_dashboard_endpoints():
    """Test dashboard endpoints"""
    print("📊 Testing Dashboard Endpoints...")
    
    response = make_request("GET", "/api/dashboard/stats")
    if response and response.status_code == 200:
        try:
            stats = response.json()
            required_fields = ["total_interviews", "average_score", "total_time", "recent_interviews"]
            missing_fields = [field for field in required_fields if field not in stats]
            
            if not missing_fields:
                log_test("GET /api/dashboard/stats", True, f"Stats loaded: {stats['total_interviews']} interviews")
            else:
                log_test("GET /api/dashboard/stats", False, f"Missing fields: {missing_fields}")
        except json.JSONDecodeError:
            log_test("GET /api/dashboard/stats", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("GET /api/dashboard/stats", False, f"Status: {status}")

def test_interview_flow():
    """Test complete interview flow"""
    print("🎤 Testing Interview Flow...")
    
    # Step 1: Start interview
    interview_data = {
        "position": "Software Engineer",
        "level": "Senior"
    }
    
    response = make_request("POST", "/api/interview/start", data=interview_data)
    if not response or response.status_code != 200:
        status = response.status_code if response else "No response"
        log_test("POST /api/interview/start", False, f"Status: {status}")
        return
    
    try:
        start_result = response.json()
        required_fields = ["interview_id", "session_id", "first_question"]
        missing_fields = [field for field in required_fields if field not in start_result]
        
        if missing_fields:
            log_test("POST /api/interview/start", False, f"Missing fields: {missing_fields}")
            return
        
        interview_id = start_result["interview_id"]
        log_test("POST /api/interview/start", True, f"Interview started: {interview_id}")
        
    except json.JSONDecodeError:
        log_test("POST /api/interview/start", False, "Invalid JSON response")
        return
    
    # Step 2: Submit answers (simulate 3 answers)
    answers = [
        "I have 5 years of experience in Python and JavaScript development.",
        "I approach problems by breaking them down into smaller components and analyzing each part.",
        "I'm passionate about creating scalable solutions and working in collaborative teams."
    ]
    
    for i, answer in enumerate(answers, 1):
        answer_data = {
            "interview_id": interview_id,
            "answer": answer
        }
        
        response = make_request("POST", "/api/interview/answer", data=answer_data)
        if response and response.status_code == 200:
            try:
                answer_result = response.json()
                if "next_question" in answer_result:
                    is_complete = answer_result.get("is_complete", False)
                    log_test(f"POST /api/interview/answer (Q{i})", True, 
                           f"Complete: {is_complete}")
                    
                    if is_complete:
                        break
                else:
                    log_test(f"POST /api/interview/answer (Q{i})", False, "Missing next_question")
            except json.JSONDecodeError:
                log_test(f"POST /api/interview/answer (Q{i})", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            log_test(f"POST /api/interview/answer (Q{i})", False, f"Status: {status}")
    
    # Step 3: Complete interview and get feedback
    complete_data = {"interview_id": interview_id}
    
    response = make_request("POST", "/api/interview/complete", data=complete_data)
    if response and response.status_code == 200:
        try:
            feedback_result = response.json()
            if "feedback" in feedback_result:
                feedback = feedback_result["feedback"]
                required_fields = ["overall_score", "categories", "strengths", "improvements"]
                missing_fields = [field for field in required_fields if field not in feedback]
                
                if not missing_fields:
                    score = feedback.get("overall_score", 0)
                    log_test("POST /api/interview/complete", True, f"Feedback generated, score: {score}")
                else:
                    log_test("POST /api/interview/complete", False, f"Missing feedback fields: {missing_fields}")
            else:
                log_test("POST /api/interview/complete", False, "Missing feedback")
        except json.JSONDecodeError:
            log_test("POST /api/interview/complete", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("POST /api/interview/complete", False, f"Status: {status}")
    
    # Step 4: Get interview history
    response = make_request("GET", "/api/interview/history")
    if response and response.status_code == 200:
        try:
            history = response.json()
            if "interviews" in history:
                interviews = history["interviews"]
                log_test("GET /api/interview/history", True, f"Found {len(interviews)} interviews")
            else:
                log_test("GET /api/interview/history", False, "Missing interviews field")
        except json.JSONDecodeError:
            log_test("GET /api/interview/history", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("GET /api/interview/history", False, f"Status: {status}")

def test_resume_endpoints():
    """Test resume upload and analysis"""
    print("📄 Testing Resume Endpoints...")
    
    # Create a simple test PDF content
    test_pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Resume Content) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF"""
    
    # Test resume upload
    files = {
        'file': ('test_resume.pdf', test_pdf_content, 'application/pdf')
    }
    
    response = make_request("POST", "/api/resume/upload", files=files)
    if response and response.status_code == 200:
        try:
            upload_result = response.json()
            required_fields = ["analysis_id", "analysis"]
            missing_fields = [field for field in required_fields if field not in upload_result]
            
            if not missing_fields:
                analysis = upload_result["analysis"]
                score = analysis.get("overall_score", 0)
                log_test("POST /api/resume/upload", True, f"Resume analyzed, score: {score}")
            else:
                log_test("POST /api/resume/upload", False, f"Missing fields: {missing_fields}")
        except json.JSONDecodeError:
            log_test("POST /api/resume/upload", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("POST /api/resume/upload", False, f"Status: {status}")
    
    # Test resume history
    response = make_request("GET", "/api/resume/history")
    if response and response.status_code == 200:
        try:
            history = response.json()
            if "analyses" in history:
                analyses = history["analyses"]
                log_test("GET /api/resume/history", True, f"Found {len(analyses)} analyses")
            else:
                log_test("GET /api/resume/history", False, "Missing analyses field")
        except json.JSONDecodeError:
            log_test("GET /api/resume/history", False, "Invalid JSON response")
    else:
        status = response.status_code if response else "No response"
        log_test("GET /api/resume/history", False, f"Status: {status}")

def main():
    """Run all tests"""
    print("🚀 Starting AI Interview Platform Backend Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Session Token: {SESSION_TOKEN}")
    print(f"User ID: {USER_ID}")
    print("=" * 60)
    
    # Run all test suites
    test_api_health()
    test_auth_endpoints()
    test_dashboard_endpoints()
    test_interview_flow()
    test_resume_endpoints()
    
    # Print summary
    print("=" * 60)
    print("📋 TEST SUMMARY")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"📊 Success Rate: {test_results['passed']/(test_results['passed']+test_results['failed'])*100:.1f}%")
    
    if test_results["errors"]:
        print("\n🚨 FAILED TESTS:")
        for error in test_results["errors"]:
            print(f"   • {error}")
    
    print("\n🎯 Test completed at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

if __name__ == "__main__":
    main()