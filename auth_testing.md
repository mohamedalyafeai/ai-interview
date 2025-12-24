# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('ai_interview_db');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date(),
  interview_count: 0,
  total_practice_time: 0
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "${REACT_APP_BACKEND_URL}/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test dashboard stats
curl -X GET "${REACT_APP_BACKEND_URL}/api/dashboard/stats" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Test Interview Flow
1. Start interview
2. Submit answers
3. Get feedback

## Step 4: Test Resume Analysis
1. Upload PDF resume
2. Get analysis results

## Checklist
- [ ] User document has user_id field
- [ ] Session user_id matches user's user_id
- [ ] All queries use `{"_id": 0}` projection
- [ ] API returns user data
- [ ] Dashboard loads
- [ ] CRUD operations work

## Success Indicators
✅ /api/auth/me returns user data
✅ Dashboard loads without redirect
✅ Stats display correctly
✅ Interview can be started
✅ Resume can be uploaded

## Failure Indicators
❌ "User not found" errors
❌ 401 Unauthorized responses
❌ Redirect to login page
