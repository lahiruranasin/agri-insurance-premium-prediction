import React, { useState } from "react";
import { Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../firebase-config.ts";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("admin@aaib.lk");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("farmer");

  // Firebase Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Record login in backend
      if (userCredential.user.uid) {
        try {
          await fetch("http://localhost:8500/api/users/" + userCredential.user.uid + "/login", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
        } catch (backendError) {
          console.warn("Backend login record failed:", backendError);
          // Continue anyway - Firebase auth succeeded
        }
      }

      // Trigger parent component to show dashboard
      onLogin();
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === "auth/user-not-found") {
        setError("Email not found. Please sign up first.");
      } else if (errorCode === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (errorCode === "auth/user-disabled") {
        setError("This account has been deactivated.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Signup Handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!displayName) {
      setError("Please enter your name");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      // Create user profile in backend database
      const signupResponse = await fetch("http://localhost:8500/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          role,
          division: "Thalawa",
          phone: ""
        })
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error || "Failed to create user profile");
      }

      // Signup successful - show login form
      setIsSignup(false);
      setPassword("");
      setError("");
      setEmail("");
      alert(`Account created! Please log in with your credentials.`);
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in.");
      } else if (errorCode === "auth/weak-password") {
        setError("Password is too weak. Use a stronger password.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = isSignup ? handleSignup : handleLogin;

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      // Check if user exists in backend, if not create profile
      try {
        const checkResponse = await fetch(`http://localhost:8500/api/users/${user.uid}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        // If user doesn't exist (404), create profile
        if (checkResponse.status === 404) {
          const signupResponse = await fetch("http://localhost:8500/api/users/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || "Google User",
              role: "farmer",
              division: "Thalawa",
              phone: user.phoneNumber || "",
              photoURL: user.photoURL || ""
            })
          });

          if (!signupResponse.ok) {
            console.warn("Failed to create user profile:", await signupResponse.json());
          }
        }
      } catch (profileError) {
        console.warn("Profile check failed:", profileError);
      }

      // Record login in backend
      try {
        await fetch("http://localhost:8500/api/users/" + user.uid + "/login", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (loginError) {
        console.warn("Backend login record failed:", loginError);
      }

      // Trigger parent component to show dashboard
      onLogin();
    } catch (err: any) {
      const errorCode = err.code;
      if (errorCode === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else if (errorCode === "auth/popup-blocked") {
        setError("Pop-up was blocked. Please allow pop-ups and try again.");
      } else {
        setError(err.message || "Google Sign-In failed. Please try again.");
      }
      console.error("Google Sign-In error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a4d2e] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            {/* Mock Sri Lanka Emblem */}
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-yellow-600 shadow-inner">
               <span className="text-2xl">🦁</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isSignup ? "Create Account" : "AAIB Portal Login"}
            </h1>
            <p className="text-xs text-gray-500 max-w-[250px] mx-auto uppercase tracking-wide leading-tight">
              Data-Driven Agricultural Insurance Premium Prediction System
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Display Name (Signup only) */}
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] outline-none transition-shadow"
                />
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignup ? "your@email.com" : "admin@aaib.lk"}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "At least 6 characters" : "Enter password"}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-blue-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Role Selection (Signup only) */}
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest px-1">Select Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a4d2e] outline-none transition-shadow"
                >
                  <option value="farmer">Farmer</option>
                  <option value="officer">Insurance Officer</option>
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                </select>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password (Login only) */}
          {!isSignup && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1a4d2e] focus:ring-[#1a4d2e]" />
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-[#1a4d2e] hover:underline">Forgot Password?</button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1a4d2e] hover:bg-[#2d7a46] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (isSignup ? "Creating Account..." : "Signing In...") : (isSignup ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Sign-In Button */}
        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl shadow-md border border-gray-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#1f2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#1f2937" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#1f2937" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#1f2937" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Toggle Between Login and Signup */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button 
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setPassword("");
              }}
              className="ml-2 font-bold text-[#1a4d2e] hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-400 font-medium">© 2026 Agricultural and Agrarian Insurance Board of Sri Lanka</p>
        </div>
      </div>
    </div>
  );
}
