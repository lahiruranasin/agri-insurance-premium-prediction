/**
 * Express Server Setup
 * Main entry point for Firebase-integrated backend
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Import middleware
const {
  requestLogger,
  errorHandler,
  rateLimit
} = require('./middlewares/auth');

// Import routes
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();
const PORT = process.env.FIREBASE_API_PORT || 8500;

/**
 * ============================================================================
 * MIDDLEWARE SETUP
 * ============================================================================
 */

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting (100 requests per minute per user)
app.use(rateLimit(100, 60000));

/**
 * ============================================================================
 * ROUTES
 * ============================================================================
 */

// Health check routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Firebase Backend API',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/', apiRoutes);

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
app.use(errorHandler);

/**
 * ============================================================================
 * SERVER STARTUP
 * ============================================================================
 */

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n='.repeat(60));
  console.log('Agricultural Insurance System - Firebase Backend API');
  console.log('='.repeat(60));
  console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'finalproject-96580'}`);
  console.log('='.repeat(60));
  console.log('\nAvailable endpoints:');
  console.log('  GET  /health                    - Server status');
  console.log('  GET  /info                      - System information');
  console.log('\n  Users:');
  console.log('    POST   /api/users/signup                    - Create account');
  console.log('    GET    /api/users/:userId/profile           - Get profile');
  console.log('    PUT    /api/users/:userId/profile           - Update profile');
  console.log('    GET    /api/users                           - List all users (admin)');
  console.log('\n  Premiums:');
  console.log('    POST   /api/premiums/calculate              - Calculate premium');
  console.log('    GET    /api/premiums/user/:userId           - Get user calculations');
  console.log('    GET    /api/premiums/:calculationId         - Get calculation');
  console.log('    PUT    /api/premiums/:calculationId/status  - Update status');
  console.log('\n  Policies:');
  console.log('    POST   /api/policies                        - Create policy');
  console.log('    GET    /api/policies/user/:userId           - Get user policies');
  console.log('    GET    /api/policies/:policyId              - Get policy');
  console.log('    PUT    /api/policies/:policyId/status       - Update status');
  console.log('\n  Claims:');
  console.log('    POST   /api/claims                          - File claim');
  console.log('    GET    /api/claims/user/:userId             - Get user claims');
  console.log('    GET    /api/claims/:claimId                 - Get claim');
  console.log('    POST   /api/claims/:claimId/assess          - Assess damage');
  console.log('    POST   /api/claims/:claimId/review          - Review claim');
  console.log('\n  Activity:');
  console.log('    GET    /api/activity/user/:userId           - User activity (admin)');
  console.log('    GET    /api/activity/summary/system         - System summary (admin)');
  console.log('\n='.repeat(60) + '\n');
});

module.exports = app;
