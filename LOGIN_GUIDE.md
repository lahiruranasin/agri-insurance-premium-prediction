# 🔐 Firebase Authentication Setup - Login Guide

## Overview

The login page is now fully connected to Firebase Authentication. Users can:
- ✅ Sign in with existing account
- ✅ Create new account (Sign up)
- ✅ Logout from dashboard
- ✅ See real-time authentication state

---

## 🚀 Getting Started

### 1. Make Sure Backend is Running

```bash
cd backend
npm start
```

Expected output:
```
✓ Server running on http://0.0.0.0:8500
```

### 2. Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📋 Test Credentials

### Option 1: Create New Account
1. Go to http://localhost:3000
2. Click "Don't have an account? Sign Up"
3. Fill in details:
   - **Email**: `farmer@example.com`
   - **Password**: `Password123` (min 6 characters)
   - **Name**: `Test Farmer`
   - **Role**: Select from dropdown (farmer, officer, admin, analyst)
4. Click "Create Account"

### Option 2: Use Test Account
After creating an account, login with those credentials.

---

## 🔄 Login Flow

```
User enters email & password
        ↓
Click "Sign In"
        ↓
Firebase authenticates user
        ↓
Backend records login activity
        ↓
Dashboard opens
        ↓
User is authenticated in browser
```

---

## 📁 Files Modified/Created

### New Files
1. **`src/firebase-config.ts`** - Firebase configuration
   ```typescript
   - Initializes Firebase App
   - Exports auth, db, storage
   - Contains API base URL
   ```

### Modified Files
1. **`src/components/Login.tsx`**
   - Added email/password state
   - Integrated Firebase authentication
   - Added signup functionality
   - Error handling & validation
   - Toggle between login/signup modes

2. **`src/App.tsx`**
   - Listening for Firebase auth state changes
   - Auto-redirect to login if not authenticated
   - Pass user data to components
   - Logout functionality

3. **`src/components/Header.tsx`**
   - Display user email/name
   - User dropdown menu
   - Logout button
   - User initials avatar

4. **`src/components/Sidebar.tsx`**
   - Logout button in sidebar
   - Pass logout handler

---

## 🧪 Testing the Login

### Test 1: Signup New Account
1. Open http://localhost:3000
2. Click "Don't have an account? Sign Up"
3. Fill in form with:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Name: `Test User`
   - Role: `farmer`
4. Click "Create Account"
5. See success message and return to login
6. Login with new credentials

**Expected**: New account created and user logged in

---

### Test 2: Login with Account
1. Open http://localhost:3000
2. Enter email and password from test account
3. Click "Sign In"
4. Dashboard should open

**Expected**: Logged in successfully, see user name in header

---

### Test 3: Logout
1. Click user profile in header
2. Click "Sign Out"
3. Return to login page

**Expected**: User is logged out, redirected to login

---

### Test 4: Invalid Credentials
1. Open http://localhost:3000
2. Enter wrong password
3. Click "Sign In"

**Expected**: Error message appears: "Incorrect password"

---

### Test 5: Non-existent Account
1. Open http://localhost:3000
2. Enter email that doesn't exist
3. Click "Sign In"

**Expected**: Error message: "Email not found. Please sign up first."

---

## 🔐 Authentication Features

### ✅ Features Implemented

1. **Firebase Authentication**
   - Email/password authentication
   - Token-based login
   - Automatic token refresh

2. **User Management**
   - Create accounts (signup)
   - Login with credentials
   - Logout functionality
   - User profile display

3. **Error Handling**
   - Invalid email format
   - Wrong password
   - Account doesn't exist
   - Email already registered
   - Weak password
   - Account deactivated

4. **Backend Integration**
   - Records login activity
   - Creates user profile
   - Tracks user statistics
   - Activity logging

5. **UI Features**
   - Toggle between login/signup
   - Error alerts
   - Loading states
   - User dropdown menu
   - User initials avatar
   - Responsive design

---

## 🔗 Integration Points

### Frontend → Firebase
```typescript
import { auth } from './firebase-config';

// Login
await signInWithEmailAndPassword(auth, email, password);

// Signup
await createUserWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Check auth state
onAuthStateChanged(auth, (user) => {
  if (user) setIsLoggedIn(true);
});
```

### Frontend → Backend
```typescript
// Get auth token
const token = await user.getIdToken();

// Record login
await fetch('http://localhost:8500/api/users/:uid/login', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📊 User Roles

Each role has different permissions:

| Role | Permissions |
|------|-------------|
| **Farmer** | View own policies, file claims, view calculations |
| **Officer** | Create calculations, create policies, assess claims |
| **Admin** | Full access, manage users, approve claims |
| **Analyst** | View all data, create reports, view logs |

---

## 🛡️ Security Features

1. **Token Verification**
   - All API calls verified with Firebase token
   - Tokens expire after 1 hour

2. **Password Requirements**
   - Minimum 6 characters
   - Firebase enforces strong passwords

3. **Account Management**
   - Accounts can be deactivated
   - Login tracking
   - Activity logging

4. **CORS Protection**
   - Backend accepts only authenticated requests
   - Rate limiting enabled

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'firebase-config'"
**Solution**: Ensure `src/firebase-config.ts` exists
```bash
ls src/firebase-config.ts
```

### Issue: "Firebase not initialized"
**Solution**: Check firebase-config.ts has all required settings
- firebaseConfig object has all properties
- Firebase app is initialized

### Issue: "Backend login failed"
**Solution**: 
- Ensure backend is running on port 8500
- Check network connectivity
- Backend should log the request

### Issue: "Token verification failed"
**Solution**:
- Token might be expired (try login again)
- Check backend is using correct Firebase config

### Issue: "CORS error"
**Solution**:
- Backend CORS_ORIGIN set to allow frontend
- Check .env.local has CORS_ORIGIN=*

---

## 📝 Example: Login Component Usage

```typescript
// In App.tsx
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  });
}, []);

// Pass to Login
<Login onLogin={() => {
  // Firebase listener handles this
}} />
```

---

## 🔄 Data Flow

```
Login Page (http://localhost:3000)
    ↓
User enters credentials
    ↓
Click "Sign In"
    ↓
Firebase Auth Service
    ├─ Verify email/password
    ├─ Generate ID token
    └─ Update auth state
    ↓
App.tsx (onAuthStateChanged)
    ├─ Receive user object
    ├─ Set isLoggedIn = true
    └─ Show dashboard
    ↓
Backend /api/users/:uid/login
    ├─ Verify Firebase token
    ├─ Update lastLogin timestamp
    ├─ Increment loginCount
    └─ Log activity
    ↓
Dashboard Loaded
```

---

## 🎯 Next Steps

1. ✅ Firebase authentication configured
2. ✅ Login page integrated
3. ✅ User management setup
4. 🔄 **Update React components to use Firebase token**
5. 🔄 Connect premium calculator to backend
6. 🔄 Connect policy management to backend
7. 🔄 Connect claims to backend

### Update Components to Use Backend

Example for PremiumCalculator.tsx:
```typescript
import { auth } from '../firebase-config';

async function handleCalculatePremium(data) {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch(
    'http://localhost:8500/api/premiums/calculate',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );
  
  const result = await response.json();
  return result;
}
```

---

## 📞 Support

For issues:
1. Check browser console for errors (F12)
2. Check backend terminal for logs
3. Check Firebase Console (https://console.firebase.google.com)
4. Review FIREBASE_SETUP.md for detailed docs

---

## 🎉 You're All Set!

Your login is now connected to Firebase! Users can:
- ✅ Create accounts
- ✅ Login securely
- ✅ Logout safely
- ✅ See their profile
- ✅ Access the dashboard

Next, connect your components to the backend APIs for premium calculations, policies, and claims!
