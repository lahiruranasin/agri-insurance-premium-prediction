# Firebase Backend - Quick Start Guide

## 🚀 Installation & Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `firebase-admin` - Firebase admin SDK
- `cors` - Cross-origin support
- `dotenv` - Environment variables

### 2. Start the Backend Server

```bash
npm start
```

Expected output:
```
============================================================
Agricultural Insurance System - Firebase Backend API
============================================================
✓ Server running on http://0.0.0.0:8500
✓ Environment: development
✓ Firebase Project: finalproject-96580
============================================================
```

### 3. Start Frontend (in separate terminal)

```bash
npm run dev
```

---

## 📡 API Usage Examples

### Example 1: Create and Calculate Premium

```bash
# 1. Signup (get auth token)
curl -X POST http://localhost:8500/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "displayName": "John Farmer",
    "role": "farmer",
    "division": "Thalawa",
    "phone": "+94777123456"
  }'

# Response will contain uid - use to get auth token from frontend

# 2. Calculate Premium (with auth token)
curl -X POST http://localhost:8500/api/premiums/calculate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "clientName": "John Farmer",
    "division": "Thalawa",
    "crop": "Paddy",
    "acreage": 15.5,
    "coverage": 60,
    "irrigation": "minor",
    "premiumDetails": {
      "baseRate": 2200,
      "riskScore": 78,
      "riskCategory": "High",
      "grossPremium": 2025,
      "subsidyAmount": 810,
      "netPremium": 1215
    },
    "manualOverride": 1.0
  }'
```

### Example 2: File a Claim

```bash
curl -X POST http://localhost:8500/api/claims \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "policyId": "POL-THA-1234567890",
    "claimType": "crop_loss",
    "damageDescription": "Heavy rainfall damaged 45% of crops",
    "percentageLoss": 45,
    "photoUrls": ["gs://bucket/photo1.jpg"]
  }'
```

---

## 🔐 Authentication Flow

### Step 1: Frontend - User Signup
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);
```

### Step 2: Frontend - Get Auth Token
```typescript
const token = await userCredential.user.getIdToken();
```

### Step 3: Frontend - Send to Backend
```typescript
const response = await fetch('http://localhost:8500/api/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### Step 4: Backend - Verify Token
```javascript
// Middleware automatically verifies token
const decodedToken = await auth.verifyIdToken(token);
const userId = decodedToken.uid;
```

---

## 📊 Database Collections Reference

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | User accounts & profiles | uid, email, role, division |
| `premiumCalculations` | Premium calculation records | calculationId, userId, crop, premium |
| `policies` | Insurance policies | policyId, userId, status, premium |
| `claims` | Insurance claims | claimId, policyId, status, amount |
| `activityLog` | Audit trail | userId, action, resourceType, timestamp |
| `divisions` | Geographic divisions | name, riskScore, coordinates |

---

## 🛣️ API Endpoints Summary

### Public Endpoints
```
POST   /api/users/signup                    - Create account
GET    /health                              - Server status
GET    /info                                - System info
```

### User Endpoints (require auth)
```
GET    /api/users/:userId/profile           - Get profile
PUT    /api/users/:userId/profile           - Update profile
POST   /api/users/:userId/login             - Record login
```

### Premium Endpoints
```
POST   /api/premiums/calculate              - Calculate premium
GET    /api/premiums/user/:userId           - Get user's calculations
GET    /api/premiums/:calculationId         - Get specific calculation
PUT    /api/premiums/:calculationId/status  - Update status
GET    /api/premiums/division/:division/stats - Get statistics
```

### Policy Endpoints
```
POST   /api/policies                        - Create policy
GET    /api/policies/user/:userId           - Get user's policies
GET    /api/policies/:policyId              - Get policy details
PUT    /api/policies/:policyId/status       - Update status
POST   /api/policies/:policyId/renew        - Renew policy
GET    /api/policies/expiring/soon          - Get expiring policies
```

### Claims Endpoints
```
POST   /api/claims                          - File claim
GET    /api/claims/user/:userId             - Get user's claims
GET    /api/claims/:claimId                 - Get claim details
POST   /api/claims/:claimId/assess          - Assess damage
POST   /api/claims/:claimId/review          - Review/approve claim
POST   /api/claims/:claimId/pay             - Mark as paid
```

---

## 🧪 Testing in Browser Console

The `test.js` file provides test functions accessible in browser console:

```javascript
// Available test functions:
FirebaseTest.testUserSignup()           // Test signup
FirebaseTest.testCalculatePremium()     // Test premium calculation
FirebaseTest.testCreatePolicy()         // Test policy creation
FirebaseTest.testFileClaim()            // Test claim filing
FirebaseTest.testGetUserCalculations()  // Test data retrieval
FirebaseTest.runTests()                 // Run all tests
```

---

## 📋 File Structure

```
backend/
├── firebase.config.js          # Firebase initialization
├── server.js                   # Express app
├── package.json                # Node dependencies
├── models/
│   └── index.js               # Database schemas
├── controllers/
│   ├── premiumController.js   # Premium operations
│   ├── policyController.js    # Policy operations
│   ├── claimController.js     # Claim operations
│   ├── userController.js      # User operations
│   └── activityController.js  # Activity logging
├── middlewares/
│   └── auth.js                # Auth & validation
└── routes/
    └── api.js                 # API endpoints
```

---

## 🐛 Common Issues & Solutions

### Issue: "Port 8500 already in use"
```bash
# Windows
netstat -ano | findstr :8500
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :8500
kill -9 [PID]
```

### Issue: "Firebase initialization error"
- Check `firebase.config.js` path to service account JSON
- Verify JSON file exists at `backend/finalproject-96580-firebase-adminsdk-fbsvc-69fb366cb7.json`

### Issue: "Token verification failed"
- Ensure token is not expired (tokens expire after 1 hour)
- Get fresh token: `await auth.currentUser.getIdToken(true)`

### Issue: "CORS errors"
- Frontend and backend must be accessible from each other
- Update `CORS_ORIGIN` in `.env.local`
- Default allows all origins

---

## 🔒 Security Checklist

- ✅ Firebase tokens verified on all protected endpoints
- ✅ Role-based access control implemented
- ✅ Rate limiting enabled (100 req/min)
- ✅ All operations logged to activity trail
- ✅ Input validation on all endpoints
- ✅ CORS protection configured

---

## 📈 Monitoring

View activity logs for specific resource:
```bash
curl -X GET "http://localhost:8500/api/activity/premium/CALC-123" \
  -H "Authorization: Bearer TOKEN"
```

Get system summary:
```bash
curl -X GET "http://localhost:8500/api/activity/summary/system" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔄 Data Flow Diagram

```
Frontend (React)
    ↓
    ├─ User Login
    ├─ Get Auth Token
    ↓
Backend (Express)
    ├─ Verify Token
    ├─ Check Role/Permissions
    ↓
Firestore Database
    ├─ Read/Write Operations
    ├─ Query Data
    ↓
Activity Log
    └─ Log All Actions
```

---

## ✨ Next Steps

1. ✅ Backend setup complete
2. 🔄 Test endpoints with provided examples
3. 🔄 Connect frontend React components
4. 🔄 Update `apiService.ts` with real API calls
5. 🔄 Deploy backend to Firebase Cloud Functions or hosting
6. 🔄 Set up Firestore security rules
7. 🔄 Monitor activity logs

---

## 📞 Support

For detailed information, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

Happy coding! 🎉
