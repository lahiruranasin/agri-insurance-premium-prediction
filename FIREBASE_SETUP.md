# Firebase Integration - Agricultural Insurance System

## Overview

This backend is fully integrated with Firebase to manage all database operations for the Agricultural Insurance Premium Prediction System. The system uses:

- **Firestore Database**: Primary NoSQL database for all data storage
- **Firebase Authentication**: User account management and token verification
- **Firebase Storage**: File uploads (claim photos, documents)
- **Firebase Admin SDK**: Server-side operations

---

## Project Structure

```
backend/
├── firebase.config.js          # Firebase initialization
├── server.js                   # Express app entry point
├── models/
│   └── index.js               # Database schemas & models
├── controllers/
│   ├── premiumController.js   # Premium calculation operations
│   ├── policyController.js    # Policy management
│   ├── claimController.js     # Claims processing
│   ├── userController.js      # User management
│   └── activityController.js  # Activity logging
├── middlewares/
│   └── auth.js                # Authentication & validation
└── routes/
    └── api.js                 # API endpoints
```

---

## Database Collections

### 1. **users**
Stores user accounts and profiles.

```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  displayName: "User Name",
  role: "admin|officer|farmer|analyst",
  division: "Thalawa",
  phone: "+94777123456",
  isActive: true,
  permissions: ["list", "of", "permissions"],
  metadata: {
    loginCount: 10,
    totalCalculations: 5,
    verificationStatus: "verified"
  },
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

### 2. **premiumCalculations**
Records of all premium calculations.

```javascript
{
  calculationId: "CALC-1234567890-abc123",
  userId: "user-uid",
  clientName: "Farmer Name",
  division: "Thalawa",
  crop: "Paddy",
  acreage: 15.5,
  coverage: 60,
  irrigation: "minor",
  premiumDetails: {
    baseRate: 2200,
    riskScore: 78,
    riskCategory: "High",
    grossPremium: 2025,
    subsidyAmount: 810,
    netPremium: 1215,
    manualOverride: 1.0
  },
  status: "calculated|accepted|rejected|expired",
  expiresAt: Timestamp,
  createdAt: Timestamp
}
```

### 3. **policies**
Active and historical insurance policies.

```javascript
{
  policyId: "POL-THA-1234567890",
  userId: "user-uid",
  calculationId: "CALC-...",
  clientName: "Farmer Name",
  division: "Thalawa",
  crop: "Paddy",
  acreage: 15.5,
  coverage: 60,
  premium: 1215,
  policyStatus: "active|expired|cancelled|claimed",
  startDate: Timestamp,
  endDate: Timestamp,
  issuedBy: "officer-uid",
  documents: {
    policyDocument: "gs://bucket/url",
    termsAndConditions: "gs://bucket/url"
  },
  claimHistory: ["CLM-THA-001", "CLM-THA-002"],
  createdAt: Timestamp
}
```

### 4. **claims**
Insurance claims filed by policyholders.

```javascript
{
  claimId: "CLM-THA-1234567890",
  policyId: "POL-THA-...",
  userId: "user-uid",
  claimType: "crop_loss|weather_damage|pest_damage",
  damageAssessment: {
    percentageLoss: 45,
    description: "Heavy rainfall damaged crops",
    photos: ["gs://bucket/url1", "gs://bucket/url2"],
    assessedBy: "officer-uid",
    assessmentDate: Timestamp
  },
  claimAmount: 546.75,
  approvalStatus: "pending|approved|rejected|paid",
  approvedAmount: 546.75,
  rejectionReason: null,
  filedAt: Timestamp,
  reviewedAt: Timestamp,
  paidAt: Timestamp,
  reviewedBy: "admin-uid",
  paymentReference: "BANK-TRN-12345"
}
```

### 5. **activityLog**
Audit trail of all system activities.

```javascript
{
  logId: "LOG-1234567890-abc123",
  userId: "user-uid",
  action: "calculate_premium|create_policy|file_claim|approve_claim",
  resourceType: "premium|policy|claim|user",
  resourceId: "...",
  details: { /* action-specific data */ },
  status: "success|failure",
  errorMessage: null,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  timestamp: Timestamp
}
```

### 6. **divisions**
Geographical divisions with risk profiles.

```javascript
{
  name: "Thalawa",
  riskLevel: "High",
  riskScore: 78,
  baseRate: 2200,
  coordinates: { latitude: 8.28, longitude: 80.77 },
  area: 450,
  population: 15000,
  majorCrops: ["Paddy", "Maize"],
  irrigationTypes: ["minor", "tank"],
  historicalClaims: 245,
  claimSuccessRate: 78.5,
  weatherData: {
    avgRainfall: 1450,
    avgTemperature: 28.5,
    droughtFrequency: 2
  }
}
```

---

## API Endpoints

### Authentication
All endpoints (except `/api/users/signup`) require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

### User Management

**POST /api/users/signup** - Create new account
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "displayName": "User Name",
  "role": "farmer",
  "division": "Thalawa",
  "phone": "+94777123456"
}
```

**GET /api/users/:userId/profile** - Get user profile
**PUT /api/users/:userId/profile** - Update profile
**GET /api/users** - Get all users (admin only)
**PUT /api/users/:userId/role** - Update user role (admin only)
**POST /api/users/:userId/deactivate** - Deactivate account (admin only)

### Premium Calculations

**POST /api/premiums/calculate** - Create premium calculation
```json
{
  "userId": "user-uid",
  "clientName": "Farmer Name",
  "division": "Thalawa",
  "crop": "Paddy",
  "acreage": 15.5,
  "coverage": 60,
  "irrigation": "minor",
  "premiumDetails": { /* from backend calculation */ },
  "manualOverride": 1.0
}
```

**GET /api/premiums/user/:userId** - Get user's calculations
**GET /api/premiums/:calculationId** - Get specific calculation
**PUT /api/premiums/:calculationId/status** - Update calculation status
**GET /api/premiums/division/:division/stats** - Get division statistics

### Policies

**POST /api/policies** - Create policy
```json
{
  "userId": "user-uid",
  "calculationId": "CALC-...",
  "clientName": "Farmer Name",
  "division": "Thalawa",
  "crop": "Paddy",
  "acreage": 15.5,
  "coverage": 60,
  "premium": 1215,
  "issuedBy": "officer-uid"
}
```

**GET /api/policies/user/:userId** - Get user's policies
**GET /api/policies/:policyId** - Get specific policy
**PUT /api/policies/:policyId/status** - Update policy status
**GET /api/policies/expiring/soon** - Get expiring policies
**POST /api/policies/:policyId/renew** - Renew policy

### Claims

**POST /api/claims** - File claim
```json
{
  "userId": "user-uid",
  "policyId": "POL-...",
  "claimType": "crop_loss",
  "damageDescription": "Damage details",
  "percentageLoss": 45,
  "photoUrls": ["gs://bucket/url1", "gs://bucket/url2"]
}
```

**GET /api/claims/user/:userId** - Get user's claims
**GET /api/claims/:claimId** - Get specific claim
**POST /api/claims/:claimId/assess** - Assess damage
**POST /api/claims/:claimId/review** - Approve/reject claim
**POST /api/claims/:claimId/pay** - Mark claim as paid

### Activity Logs

**GET /api/activity/user/:userId** - Get user activity (admin only)
**GET /api/activity/:resourceType/:resourceId** - Get resource activity
**GET /api/activity/summary/system** - Get system summary
**GET /api/activity/action/:action** - Get activities by type

---

## Setup Instructions

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

### 2. Install Firebase Package

```bash
npm install firebase-admin
```

### 3. Environment Variables

Create `.env.local` in the project root:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=finalproject-96580
FIREBASE_API_PORT=8500

# CORS Settings
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Start the Backend Server

```bash
# From backend directory
npm install firebase-admin cors dotenv express
node server.js
```

The server will start on `http://0.0.0.0:8500`

---

## Frontend Integration

### Update the API Service

Modify `src/lib/apiService.ts` to use Firebase authentication:

```typescript
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // Your Firebase config from test.js
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const BACKEND_URL = "http://localhost:8500";

export async function getAuthToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No user logged in');
  return await currentUser.getIdToken();
}

export async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();
  
  return fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}
```

### Use in Components

```typescript
// Example: Calculate Premium
async function calculatePremium(data) {
  const response = await fetchWithAuth('/api/premiums/calculate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to calculate');
  return await response.json();
}

// Example: File Claim
async function fileClaim(data) {
  const response = await fetchWithAuth('/api/claims', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to file claim');
  return await response.json();
}
```

---

## User Roles & Permissions

### Admin
- View all data
- Manage users
- Approve claims
- Create reports
- Manage settings

### Officer
- Create premium calculations
- Create policies
- Assess claims
- View division data
- View reports

### Farmer
- View own policies
- File claims
- View calculations

### Analyst
- View all data
- Create reports
- View activity logs

---

## Error Handling

All endpoints return consistent JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details if available"
}
```

---

## Security Features

1. **Firebase Authentication**: All users verified via Firebase Auth
2. **Role-Based Access Control**: Endpoints check user role/permissions
3. **Rate Limiting**: 100 requests per minute per user
4. **Input Validation**: All inputs validated before processing
5. **Activity Logging**: All operations logged to audit trail
6. **CORS Protection**: Configurable origin whitelist
7. **Token Verification**: All requests verified against Firebase

---

## Testing with cURL

```bash
# Signup
curl -X POST http://localhost:8500/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "displayName": "Local Farmer",
    "role": "farmer",
    "division": "Thalawa"
  }'

# Get health status
curl http://localhost:8500/health

# Calculate premium (requires auth token)
curl -X POST http://localhost:8500/api/premiums/calculate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid",
    "clientName": "Farmer Name",
    "division": "Thalawa",
    "crop": "Paddy",
    "acreage": 15.5,
    "coverage": 60,
    "irrigation": "minor",
    "manualOverride": 1.0
  }'
```

---

## Troubleshooting

### Firebase Initialization Error
Ensure `firebase.config.js` can access the service account JSON file with correct path.

### Authentication Failures
- Verify Firebase ID token is valid
- Check token expiration (tokens expire after 1 hour)
- Ensure user account is active (not deactivated)

### Firestore Permission Errors
Check Firestore security rules in Firebase Console:

```firebase-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Port Already in Use
Change `FIREBASE_API_PORT` in `.env.local` or kill process:

```bash
# Windows
netstat -ano | findstr :8500
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :8500
kill -9 [PID]
```

---

## Next Steps

1. ✅ Firebase configuration complete
2. ✅ Database models defined
3. ✅ API controllers implemented
4. 🔄 **Frontend integration** - Update React components
5. 🔄 **Testing** - Test all endpoints
6. 🔄 **Deployment** - Deploy backend to production
7. 🔄 **Monitoring** - Set up logging and alerts

---

## Support

For issues or questions:
1. Check Firestore rules in Firebase Console
2. Review activity logs in the database
3. Check console output on backend server
4. Verify network connectivity and CORS settings
