/**
 * Authentication Middleware
 * Verifies Firebase authentication tokens and user permissions
 */

const { auth, db } = require('../firebase.config');
const { DatabaseModels } = require('../models');

/**
 * Middleware to verify Firebase ID token
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to verify user has specific role
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid || req.params.userId;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(403).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'User account is deactivated'
        });
      }

      if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      req.userRole = user.role;
      req.userData = user;
      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify permissions'
      });
    }
  };
};

/**
 * Middleware to verify user has specific permission
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid || req.params.userId;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(403).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!user.permissions || !user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: `Permission denied: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify permissions'
      });
    }
  };
};

/**
 * Middleware to verify ownership or admin status
 */
const requireOwnershipOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.uid;
    const resourceUserId = req.params.userId || req.body.userId;

    const user = await DatabaseModels.getDocument('users', userId);

    // Allow if user is admin or owns the resource
    if (user.role === 'admin' || userId === resourceUserId) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource'
      });
    }
  } catch (error) {
    console.error('Error checking ownership:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify access'
    });
  }
};

/**
 * Middleware to check if user's division matches resource division
 */
const requireDivisionMatch = async (req, res, next) => {
  try {
    const userId = req.user?.uid;
    const resourceDivision = req.params.division || req.body.division;

    const user = await DatabaseModels.getDocument('users', userId);

    if (user.role === 'admin') {
      // Admins can access all divisions
      next();
    } else if (user.division === resourceDivision) {
      // Officers must match their assigned division
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'You do not have access to this division'
      });
    }
  } catch (error) {
    console.error('Error checking division match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify access'
    });
  }
};

/**
 * Middleware to rate limit requests per user
 */
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  const store = new Map();

  return (req, res, next) => {
    const userId = req.user?.uid || req.ip;
    const now = Date.now();

    if (!store.has(userId)) {
      store.set(userId, []);
    }

    const userRequests = store.get(userId);
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }

    recentRequests.push(now);
    store.set(userId, recentRequests);

    next();
  };
};

/**
 * Middleware for input validation
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { body } = req;
      const errors = [];

      for (const [field, rules] of Object.entries(schema)) {
        const value = body[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${field} is required`);
          continue;
        }

        if (value === undefined || value === null) continue;

        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
        if (rules.type === 'number' && typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        }
        if (rules.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean`);
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} has invalid format`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      next();
    } catch (error) {
      console.error('Error in input validation:', error);
      res.status(500).json({
        success: false,
        error: 'Validation error'
      });
    }
  };
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  requireDivisionMatch,
  rateLimit,
  validateInput,
  errorHandler,
  requestLogger
};
