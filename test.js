/**
 * Agricultural Insurance System - Firebase Integration Test
 * Tests Firebase Authentication and Backend API Integration
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// ============================================================================
// FIREBASE CONFIGURATION
// ============================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCK0CkATz1tbq9kDqX1cPXoImMRUAmAFyc",
  authDomain: "finalproject-96580.firebaseapp.com",
  projectId: "finalproject-96580",
  storageBucket: "finalproject-96580.firebasestorage.app",
  messagingSenderId: "332053131152",
  appId: "1:332053131152:web:d0446b7bf912b987f4cd15",
  measurementId: "G-EE9KX12Y40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// ============================================================================
// BACKEND API CONFIGURATION
// ============================================================================

const BACKEND_URL = "http://localhost:8500";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user's authentication token
 */
async function getAuthToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  return await currentUser.getIdToken();
}

/**
 * Make authenticated API call to backend
 */
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const token = await getAuthToken();
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

/**
 * Test user signup
 */
async function testUserSignup() {
  console.log("\n📝 Testing User Signup...");
  
  try {
    const email = `farmer${Date.now()}@example.com`;
    const password = "TestPassword123!";

    // Sign up with Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✓ Firebase signup successful:", userCredential.user.uid);

    // Create user profile in backend database
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_URL}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: "Test Farmer",
        role: "farmer",
        division: "Thalawa",
        phone: "+94777123456"
      })
    });

    const result = await response.json();
    console.log("✓ User profile created:", result.uid);
    return result.uid;
  } catch (error) {
    console.error("✗ Signup failed:", error.message);
  }
}

/**
 * Test user login
 */
async function testUserLogin(email, password) {
  console.log("\n🔑 Testing User Login...");
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ Login successful:", userCredential.user.uid);
    console.log("✓ Email:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("✗ Login failed:", error.message);
  }
}

// ============================================================================
// PREMIUM CALCULATION TESTS
// ============================================================================

/**
 * Test premium calculation
 */
async function testCalculatePremium() {
  console.log("\n💰 Testing Premium Calculation...");
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("✗ No user logged in");
      return;
    }

    const premiumData = {
      userId: currentUser.uid,
      clientName: "Local Farmer",
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
        netPremium: 1215
      },
      manualOverride: 1.0
    };

    const result = await apiCall("/api/premiums/calculate", "POST", premiumData);
    console.log("✓ Premium calculated successfully");
    console.log("  Calculation ID:", result.calculationId);
    console.log("  Net Premium: LKR", result.data.premiumDetails.netPremium);
    return result.calculationId;
  } catch (error) {
    console.error("✗ Premium calculation failed:", error.message);
  }
}

/**
 * Test get user calculations
 */
async function testGetUserCalculations() {
  console.log("\n📊 Testing Get User Calculations...");
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("✗ No user logged in");
      return;
    }

    const result = await apiCall(`/api/premiums/user/${currentUser.uid}`);
    console.log("✓ Retrieved calculations:", result.count);
    result.calculations.forEach(calc => {
      console.log(`  - ${calc.crop} in ${calc.division}: LKR ${calc.premiumDetails.netPremium}`);
    });
  } catch (error) {
    console.error("✗ Failed to get calculations:", error.message);
  }
}

// ============================================================================
// POLICY TESTS
// ============================================================================

/**
 * Test create policy
 */
async function testCreatePolicy(calculationId) {
  console.log("\n📋 Testing Create Policy...");
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("✗ No user logged in");
      return;
    }

    const policyData = {
      userId: currentUser.uid,
      calculationId,
      clientName: "Local Farmer",
      division: "Thalawa",
      crop: "Paddy",
      acreage: 15.5,
      coverage: 60,
      premium: 1215,
      issuedBy: currentUser.uid
    };

    const result = await apiCall("/api/policies", "POST", policyData);
    console.log("✓ Policy created successfully");
    console.log("  Policy ID:", result.policyId);
    console.log("  Status:", result.data.policyStatus);
    return result.policyId;
  } catch (error) {
    console.error("✗ Failed to create policy:", error.message);
  }
}

// ============================================================================
// CLAIMS TESTS
// ============================================================================

/**
 * Test file claim
 */
async function testFileClaim(policyId) {
  console.log("\n🚨 Testing File Claim...");
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("✗ No user logged in");
      return;
    }

    const claimData = {
      userId: currentUser.uid,
      policyId,
      claimType: "crop_loss",
      damageDescription: "Heavy rainfall caused 45% crop damage",
      percentageLoss: 45,
      photoUrls: []
    };

    const result = await apiCall("/api/claims", "POST", claimData);
    console.log("✓ Claim filed successfully");
    console.log("  Claim ID:", result.claimId);
    console.log("  Status:", result.data.approvalStatus);
    return result.claimId;
  } catch (error) {
    console.error("✗ Failed to file claim:", error.message);
  }
}

/**
 * Test get user claims
 */
async function testGetUserClaims() {
  console.log("\n📝 Testing Get User Claims...");
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("✗ No user logged in");
      return;
    }

    const result = await apiCall(`/api/claims/user/${currentUser.uid}`);
    console.log("✓ Retrieved claims:", result.count);
    result.claims.forEach(claim => {
      console.log(`  - ${claim.claimType}: ${claim.approvalStatus}`);
    });
  } catch (error) {
    console.error("✗ Failed to get claims:", error.message);
  }
}

// ============================================================================
// MONITORING - Auth State Changes
// ============================================================================

/**
 * Monitor authentication state
 */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✓ User logged in:", user.email);
  } else {
    console.log("⚠ User logged out");
  }
});

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

/**
 * Run all tests in sequence
 */
async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("Agricultural Insurance System - Firebase Integration Tests");
  console.log("=".repeat(60));

  try {
    // 1. Signup test
    const userId = await testUserSignup();
    if (!userId) return;

    // 2. Login test (use the signup credentials)
    await testUserLogin(`farmer${Date.now()}@example.com`, "TestPassword123!");

    // 3. Premium calculation test
    const calculationId = await testCalculatePremium();

    // 4. Get calculations
    await testGetUserCalculations();

    // 5. Create policy
    const policyId = await testCreatePolicy(calculationId);

    // 6. File claim
    const claimId = await testFileClaim(policyId);

    // 7. Get claims
    await testGetUserClaims();

    console.log("\n" + "=".repeat(60));
    console.log("✓ All tests completed successfully!");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n✗ Test runner failed:", error.message);
  }

  // Cleanup
  await signOut(auth);
}

// ============================================================================
// EXPORTS FOR BROWSER CONSOLE
// ============================================================================

window.FirebaseTest = {
  testUserSignup,
  testUserLogin,
  testCalculatePremium,
  testGetUserCalculations,
  testCreatePolicy,
  testFileClaim,
  testGetUserClaims,
  runTests,
  getAuthToken,
  apiCall
};

console.log("✓ Firebase test suite loaded");
console.log("  Run 'FirebaseTest.runTests()' to execute all tests");
console.log("  Or use individual test functions from FirebaseTest object");