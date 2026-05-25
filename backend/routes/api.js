/**
 * API Routes Configuration
 * Defines all endpoints for the agricultural insurance system
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Middleware imports
const {
  verifyToken,
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  validateInput
} = require('../middlewares/auth');

// Controller imports
const PremiumController = require('../controllers/premiumController');
const PolicyController = require('../controllers/policyController');
const ClaimController = require('../controllers/claimController');
const UserController = require('../controllers/userController');
const ActivityController = require('../controllers/activityController');

/**
 * ============================================================================
 * HEALTH & INFO ROUTES
 * ============================================================================
 */

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Agricultural Insurance System API',
    timestamp: new Date().toISOString()
  });
});

router.get('/info', (req, res) => {
  res.status(200).json({
    system: 'Agricultural Insurance Premium Prediction System',
    location: 'Anuradhapura District, Sri Lanka',
    version: '1.0.0',
    features: [
      'Premium Calculations',
      'Policy Management',
      'Claim Processing',
      'Risk Analysis',
      'User Management',
      'Activity Logging'
    ]
  });
});

router.get('/api/risk-scores', async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../ML_Risk_ALL_Y_PD.csv');
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ success: false, error: 'Risk score data file not found.' });
    }

    const raw = fs.readFileSync(csvPath, 'utf8').trim();
    const rows = raw.split(/\r?\n/).filter(Boolean);
    if (rows.length < 2) {
      return res.status(500).json({ success: false, error: 'Risk score file is empty or invalid.' });
    }

    const data = rows.slice(1).map((line) => {
      const [division, risk] = line.split(',');
      return {
        division: division?.trim() || 'Unknown',
        Risk_Score: parseFloat(risk?.trim() || '0')
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Risk score endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Unable to load risk score data.' });
  }
});

/**
 * ============================================================================
 * USER ROUTES
 * ============================================================================
 */

// Public - User signup
router.post('/api/users/signup', async (req, res) => {
  try {
    await UserController.createUser(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get user profile
router.get('/api/users/:userId/profile', verifyToken, async (req, res) => {
  try {
    await UserController.getUserProfile(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Update user profile
router.put('/api/users/:userId/profile', verifyToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    await UserController.updateUserProfile(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Record login
router.post('/api/users/:userId/login', verifyToken, async (req, res) => {
  try {
    await UserController.recordLogin(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Get all users
router.get('/api/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await UserController.getAllUsers(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Update user role
router.put('/api/users/:userId/role', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await UserController.updateUserRole(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Deactivate user
router.post('/api/users/:userId/deactivate', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await UserController.deactivateUser(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Reactivate user
router.post('/api/users/:userId/reactivate', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await UserController.reactivateUser(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Get user statistics
router.get('/api/users/stats/overview', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await UserController.getUserStats(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ============================================================================
 * PREMIUM CALCULATION ROUTES
 * ============================================================================
 */

// Protected - Create premium calculation
router.post('/api/premiums/calculate', verifyToken, requireRole(['officer', 'farmer']), async (req, res) => {
  try {
    await PremiumController.createPremiumCalculation(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get user calculations
router.get('/api/premiums/user/:userId', verifyToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    await PremiumController.getUserCalculations(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get specific calculation
router.get('/api/premiums/:calculationId', verifyToken, async (req, res) => {
  try {
    await PremiumController.getCalculationById(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Officer - Update calculation status
router.put('/api/premiums/:calculationId/status', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await PremiumController.updateCalculationStatus(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get division statistics
router.get('/api/premiums/division/:division/stats', verifyToken, async (req, res) => {
  try {
    req.params.division = req.query.division || req.params.division;
    await PremiumController.getDivisionStats(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Export calculations
router.get('/api/premiums/export/csv', verifyToken, requireRole(['admin', 'analyst']), async (req, res) => {
  try {
    await PremiumController.exportCalculations(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ============================================================================
 * POLICY ROUTES
 * ============================================================================
 */

// Officer - Create policy
router.post('/api/policies', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await PolicyController.createPolicy(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get user policies
router.get('/api/policies/user/:userId', verifyToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    await PolicyController.getUserPolicies(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get specific policy
router.get('/api/policies/:policyId', verifyToken, async (req, res) => {
  try {
    await PolicyController.getPolicyById(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Officer - Update policy status
router.put('/api/policies/:policyId/status', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await PolicyController.updatePolicyStatus(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get expiring policies
router.get('/api/policies/expiring/soon', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await PolicyController.getExpiringPolicies(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get division policy statistics
router.get('/api/policies/division/:division/stats', verifyToken, async (req, res) => {
  try {
    req.params.division = req.query.division || req.params.division;
    await PolicyController.getDivisionPolicyStats(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Officer - Renew policy
router.post('/api/policies/:policyId/renew', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await PolicyController.renewPolicy(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ============================================================================
 * CLAIM ROUTES
 * ============================================================================
 */

// Protected - File claim
router.post('/api/claims', verifyToken, requireRole(['farmer', 'officer']), async (req, res) => {
  try {
    await ClaimController.fileClaim(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get user claims
router.get('/api/claims/user/:userId', verifyToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    await ClaimController.getUserClaims(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get policy claims
router.get('/api/claims/policy/:policyId', verifyToken, async (req, res) => {
  try {
    await ClaimController.getPolicyClaims(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get specific claim
router.get('/api/claims/:claimId', verifyToken, async (req, res) => {
  try {
    await ClaimController.getClaimById(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Officer - Assess claim
router.post('/api/claims/:claimId/assess', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await ClaimController.assessClaim(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Officer - Review claim
router.post('/api/claims/:claimId/review', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await ClaimController.reviewClaim(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Officer - Mark claim as paid
router.post('/api/claims/:claimId/pay', verifyToken, requireRole(['admin', 'officer']), async (req, res) => {
  try {
    await ClaimController.markClaimAsPaid(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected - Get division claim statistics
router.get('/api/claims/division/:division/stats', verifyToken, async (req, res) => {
  try {
    req.params.division = req.query.division || req.params.division;
    await ClaimController.getDivisionClaimStats(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ============================================================================
 * ACTIVITY LOG ROUTES
 * ============================================================================
 */

// Admin - Get user activity log
router.get('/api/activity/user/:userId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityController.getUserActivityLog(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Get resource activity log
router.get('/api/activity/:resourceType/:resourceId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityController.getResourceActivityLog(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Get system activity summary
router.get('/api/activity/summary/system', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityController.getSystemActivitySummary(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Get activities by action
router.get('/api/activity/action/:action', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityController.getActivitiesByAction(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin - Cleanup old logs
router.post('/api/activity/cleanup', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await ActivityController.cleanupOldLogs(req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

module.exports = router;
