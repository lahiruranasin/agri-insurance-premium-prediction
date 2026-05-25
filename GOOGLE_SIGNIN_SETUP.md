# 🔐 Google Sign-In Setup Guide

## ✅ What's Now Available

Your login page now includes:
- ✅ **Email/Password login** - Traditional authentication
- ✅ **Google Sign-In** - One-click sign-in with Google
- ✅ **Account creation** - Sign up with email or Google
- ✅ **Automatic profile creation** - Backend creates user profile

---

## 🚀 How to Enable Google Sign-In

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com
2. Select your project: **"finalproject-96580"**
3. Click **"Authentication"** in left sidebar
4. Click **"Sign-in method"** tab
5. Look for **"Google"** in the list

### Step 2: Enable Google Provider

1. Click on **"Google"** (should see an OFF toggle)
2. Click the **OFF toggle** to turn it ON
3. A popup will appear asking for:
   - **Project name**: Keep as is
   - **Support email**: Select your email
4. Click **"Save"**

**Expected Result**: Green checkmark next to Google, status shows "Enabled"

---

## 🧪 Testing Google Sign-In

### Test 1: Sign In with Google
1. Open http://localhost:3000
2. Click **"Continue with Google"** button
3. Google pop-up appears
4. Select your Google account
5. Pop-up closes
6. **Expected**: Dashboard opens, user logged in

### Test 2: First-time Google User
1. Click **"Continue with Google"**
2. Select Google account that hasn't signed up
3. **Expected**: 
   - New account created automatically
   - User profile created in backend
   - Dashboard opens

### Test 3: Existing Google User
1. Click **"Continue with Google"**
2. Select same Google account again
3. **Expected**: Login happens, dashboard opens immediately

### Test 4: Cancel Sign-In
1. Click **"Continue with Google"**
2. Click "Cancel" in Google pop-up
3. **Expected**: Error message "Sign-in cancelled."

---

## 📋 Google Sign-In Features

### ✅ Automatic Features

1. **Profile Creation**
   - Email from Google account
   - Display name from Google
   - Profile picture (if available)
   - Default role: "farmer"

2. **User Recognition**
   - Checks if user exists in backend
   - If new: Creates user profile
   - If existing: Just logs in

3. **Activity Tracking**
   - Records login time
   - Tracks which method used (Google)
   - Updates last login

### 🔐 Security

- Google OAuth 2.0 tokens used
- Firebase validates all tokens
- Backend verifies tokens
- Passwords never stored for Google accounts

---

## 📁 Files Modified

### `src/components/Login.tsx`
```typescript
// Added imports
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Added function
const handleGoogleSignIn = async () => {
  // 1. Create Google provider
  const provider = new GoogleAuthProvider();
  
  // 2. Sign in with popup
  const result = await signInWithPopup(auth, provider);
  
  // 3. Get token
  const token = await user.getIdToken();
  
  // 4. Create profile if new user
  // Check if user exists, if not create profile
  
  // 5. Record login
  // Log activity in backend
}

// Added UI
<button onClick={handleGoogleSignIn}>
  Continue with Google
</button>
```

---

## 🔄 Sign-In Flow

### Email/Password Flow:
```
User enters email + password
         ↓
Click "Sign In"
         ↓
Firebase verifies credentials
         ↓
Backend records login
         ↓
Dashboard opens
```

### Google Sign-In Flow:
```
Click "Continue with Google"
         ↓
Google popup appears
         ↓
User selects account
         ↓
Firebase receives OAuth token
         ↓
Check if user exists in backend
         ↓
If new: Create profile
If existing: Just login
         ↓
Backend records login
         ↓
Dashboard opens
```

---

## 🎯 Use Cases

### Scenario 1: New User
```
1. User clicks "Continue with Google"
2. Selects Google account
3. System checks backend (doesn't exist)
4. Automatically creates:
   - Firebase Auth account (via Google)
   - Backend user profile with email, name
   - Sets default role: "farmer"
5. Logs user in
6. Dashboard opens
```

### Scenario 2: Existing User
```
1. User clicks "Continue with Google"
2. Selects same Google account
3. System checks backend (exists)
4. Skips profile creation
5. Records login activity
6. Dashboard opens immediately
```

### Scenario 3: Mixed Authentication
```
1. User signs up with Email/Password: admin@example.com
2. Later tries Google with same email
3. Both accounts can exist separately OR
4. Can be linked (Firebase allows account linking)
```

---

## 🔧 Configuration Details

### Firebase Google Provider Setup
```typescript
const provider = new GoogleAuthProvider();

// Optional: Request specific scopes
provider.addScope('profile');
provider.addScope('email');

// Optional: Force account selection
provider.setCustomParameters({
  'login_hint': 'user@example.com'
});

// Sign in
const result = await signInWithPopup(auth, provider);
```

### Backend Profile Creation
```typescript
// When new Google user signs in:
POST /api/users/signup
{
  uid: 'google_uid_from_firebase',
  email: 'user@gmail.com',
  displayName: 'John Doe',
  role: 'farmer',
  division: 'Thalawa',
  photoURL: 'https://...',  // From Google account
  phone: ''
}
```

---

## 🐛 Troubleshooting

### Issue: "Pop-up was blocked"
**Solution**: 
- Browser is blocking pop-ups
- Allow pop-ups for localhost:3000
- Chrome: Click shield icon → Allow

### Issue: "Google button not working"
**Solution**:
- Check Firebase Console
- Verify Google provider is "Enabled" (green)
- Clear browser cache
- Try incognito window

### Issue: "Invalid project ID"
**Solution**:
- Check firebase-config.ts has correct projectId
- Should be: "finalproject-96580"

### Issue: "User already exists"
**Solution**:
- Firebase won't allow duplicate accounts
- Same email can't have two accounts
- Google and Email accounts are separate

---

## 📊 Backend Integration

### User Creation from Google
```
Google Sign-In
     ↓
Firebase creates Auth user
     ↓
App gets user object with:
  - uid
  - email
  - displayName
  - photoURL
     ↓
Check backend: GET /api/users/:uid
     ↓
If 404 (doesn't exist):
  POST /api/users/signup
  - Creates user record
  - Sets default role: "farmer"
  - Stores Google metadata
     ↓
Record login: POST /api/users/:uid/login
     ↓
Dashboard opens
```

---

## 🎨 UI Changes

### Login Page Now Shows:
```
┌─────────────────────────────────┐
│  🦁 AAIB Portal Login           │
├─────────────────────────────────┤
│  Email: [              ]        │
│  Password: [           ]        │
│  [    Sign In    ]              │
├──────────  OR  ──────────────────┤
│  [🔵  Continue with Google ]    │
├─────────────────────────────────┤
│  Don't have an account? Sign Up │
└─────────────────────────────────┘
```

---

## 🔐 Security Considerations

1. **OAuth 2.0 Standard**
   - Uses Google's OAuth 2.0 flow
   - Never handles passwords
   - Tokens are secure

2. **CORS Protection**
   - Requests verified by Firebase
   - Backend validates tokens
   - Same-origin policy enforced

3. **Session Management**
   - Firebase tokens expire in 1 hour
   - Automatic refresh handled
   - Logout clears all credentials

4. **Data Privacy**
   - Only email and name stored
   - Profile picture optional
   - User can revoke access anytime

---

## 📊 Analytics

Track sign-in methods:
- How many users use Email/Password
- How many use Google Sign-In
- Which method is more popular
- User retention by auth method

---

## 🎯 Next Steps

1. ✅ Enable Google provider in Firebase Console
2. ✅ Test Google Sign-In at http://localhost:3000
3. ✅ Create test accounts with Google
4. ✅ Verify backend profiles created
5. 🔄 Update components to use backend APIs
6. 🔄 Add more sign-in methods (GitHub, Facebook, etc.)

---

## 💡 Tips

1. **Test with different Google accounts** to verify new user creation
2. **Check browser console (F12)** for error messages
3. **Monitor backend logs** to see user profile creation
4. **Use test emails** for testing (don't use personal accounts)
5. **Revoke access** to test in incognito window

---

## 🎉 You're All Set!

Your application now supports:
- ✅ Traditional Email/Password authentication
- ✅ One-click Google Sign-In
- ✅ Automatic account creation
- ✅ User profile management
- ✅ Activity tracking

Test the Google Sign-In button at: http://localhost:3000 🚀

---

## 📞 Support

If Google Sign-In doesn't work:

1. **Check Firebase Console**
   - Authentication → Sign-in method
   - Google should be "Enabled" (green checkmark)

2. **Check Browser Console (F12)**
   - Look for error messages
   - Common: "Cannot find module" = wrong import
   - Common: "CORS error" = backend issue

3. **Check Backend Logs**
   - Terminal where `npm start` runs
   - Should show POST requests from frontend

4. **Try Incognito Window**
   - Clears cache
   - Bypasses browser extensions
   - Fresh session

5. **Clear Cache**
   - Ctrl+Shift+Delete
   - Or F12 → Application → Clear Storage

---

**Google Sign-In is now active! 🎉**
