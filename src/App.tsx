/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase-config';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RiskMap from './components/RiskMap';
import PremiumCalculator from './components/PremiumCalculator';
import StatCard from './components/StatCard';
import Login from './components/Login';
import DataUpload from './components/DataUpload';
import RiskAnalysis from './components/RiskAnalysis';
import ModelTraining from './components/ModelTraining';
import PremiumCalculatorPage from './components/PremiumCalculatorPage';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDivision, setSelectedDivision] = useState('Thalawa');

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a4d2e]">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => {
      // Auth state change is handled by Firebase listener
    }} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="ml-64 p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RiskMap selectedDivision={selectedDivision} onSelectDivision={setSelectedDivision} />
                </div>
                <div>
                  <PremiumCalculator selectedDivision={selectedDivision} onSelectDivision={setSelectedDivision} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <StatCard label="Avg. Risk Score" value="7.95" />
                <StatCard label="Total Insured Area" value="5.1T" unit="Acres" />
                <StatCard label="Active Policies" value="12%" />
              </div>
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DataUpload />
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RiskAnalysis />
            </motion.div>
          )}

          {activeTab === 'training' && (
            <motion.div 
              key="training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ModelTraining />
            </motion.div>
          )}

          {activeTab === 'calculator' && (
            <motion.div 
              key="calculator_page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PremiumCalculatorPage selectedDivision={selectedDivision} />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Reports />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

