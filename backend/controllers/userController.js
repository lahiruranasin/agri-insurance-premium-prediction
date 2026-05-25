/**
 * User Controller
 * Handles user management, authentication, and profiles
 */

const { auth, db, admin } = require('../firebase.config');
const { DatabaseModels } = require('../models');
const { logActivity } = require('./activityController');

class UserController {
  /**
   * Create a new user and store in Firestore
   */
  static async createUser(req, res) {
    try {
      const {
        email,
        password,
        displayName,
        role,
        division,
        phone
      } = req.body;

      if (!email || !password || !displayName || !role) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName
      });

      // Create Firestore user profile
      const userData = {
        uid: userRecord.uid,
        email,
        displayName,
        role,
        division: division || null,
        phone: phone || null,
        profileImageUrl: null,
        isActive: true,
        permissions: getUserPermissions(role),
        metadata: {
          loginCount: 0,
          totalCalculations: 0,
          verificationStatus: 'pending'
        }
      };

      await DatabaseModels.createDocument(
        'users',
        userData,
        userRecord.uid
      );

      // Log activity
      await logActivity({
        userId: userRecord.uid,
        action: 'user_signup',
        resourceType: 'user',
        resourceId: userRecord.uid,
        status: 'success',
        details: { role, division }
      });

      res.status(201).json({
        success: true,
        uid: userRecord.uid,
        user: userData
      });
    } catch (error) {
      console.error('Error creating user:', error);

      let errorMessage = 'Failed to create user';
      if (error.code === 'auth/email-already-exists') {
        errorMessage = 'Email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Remove sensitive data
      delete user.permissions; // Can include in separate auth check if needed

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const {
        displayName,
        phone,
        profileImageUrl,
        division
      } = req.body;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const updateData = {};
      if (displayName) updateData.displayName = displayName;
      if (phone) updateData.phone = phone;
      if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;
      if (division) updateData.division = division;

      await DatabaseModels.updateDocument('users', userId, updateData);

      // Log activity
      await logActivity({
        userId,
        action: 'update_profile',
        resourceType: 'user',
        resourceId: userId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(req, res) {
    try {
      const { role, division, isActive } = req.query;

      const conditions = [];
      if (role) conditions.push({ field: 'role', operator: '==', value: role });
      if (division) conditions.push({ field: 'division', operator: '==', value: division });
      if (isActive !== undefined) conditions.push({ field: 'isActive', operator: '==', value: isActive === 'true' });

      const users = await DatabaseModels.getDocuments('users', conditions);

      // Remove sensitive data
      const sanitizedUsers = users.map(user => {
        const { permissions, ...safeUser } = user;
        return safeUser;
      });

      res.status(200).json({
        success: true,
        count: sanitizedUsers.length,
        users: sanitizedUsers
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { newRole, updatedBy } = req.body;

      const validRoles = ['admin', 'officer', 'farmer', 'analyst'];
      if (!validRoles.includes(newRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await DatabaseModels.updateDocument('users', userId, {
        role: newRole,
        permissions: getUserPermissions(newRole)
      });

      // Log activity
      await logActivity({
        userId: updatedBy,
        action: 'update_user_role',
        resourceType: 'user',
        resourceId: userId,
        status: 'success',
        details: { newRole, previousRole: user.role }
      });

      res.status(200).json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const { deactivatedBy } = req.body;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await DatabaseModels.updateDocument('users', userId, { isActive: false });

      // Also disable in Firebase Auth
      await auth.updateUser(userId, { disabled: true });

      // Log activity
      await logActivity({
        userId: deactivatedBy,
        action: 'deactivate_user',
        resourceType: 'user',
        resourceId: userId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate user'
      });
    }
  }

  /**
   * Reactivate user account
   */
  static async reactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const { reactivatedBy } = req.body;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await DatabaseModels.updateDocument('users', userId, { isActive: true });

      // Re-enable in Firebase Auth
      await auth.updateUser(userId, { disabled: false });

      // Log activity
      await logActivity({
        userId: reactivatedBy,
        action: 'reactivate_user',
        resourceType: 'user',
        resourceId: userId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'User reactivated successfully'
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reactivate user'
      });
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(req, res) {
    try {
      const users = await DatabaseModels.getDocuments('users', []);

      const stats = {
        totalUsers: users.length,
        activeUsers: 0,
        byRole: {},
        byDivision: {}
      };

      users.forEach(user => {
        if (user.isActive) stats.activeUsers++;
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
        if (user.division) {
          stats.byDivision[user.division] = (stats.byDivision[user.division] || 0) + 1;
        }
      });

      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  /**
   * Record user login
   */
  static async recordLogin(req, res) {
    try {
      const { userId } = req.params;

      const user = await DatabaseModels.getDocument('users', userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      await DatabaseModels.updateDocument('users', userId, {
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        'metadata.loginCount': (user.metadata?.loginCount || 0) + 1
      });

      // Log activity
      await logActivity({
        userId,
        action: 'user_login',
        resourceType: 'user',
        resourceId: userId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'Login recorded'
      });
    } catch (error) {
      console.error('Error recording login:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record login'
      });
    }
  }
}

/**
 * Helper function to determine user permissions based on role
 */
function getUserPermissions(role) {
  const permissions = {
    admin: [
      'view_all_data',
      'manage_users',
      'approve_claims',
      'create_reports',
      'manage_settings',
      'view_activity_logs'
    ],
    officer: [
      'create_calculations',
      'create_policies',
      'assess_claims',
      'view_division_data',
      'view_reports'
    ],
    farmer: [
      'view_own_policies',
      'file_claims',
      'view_calculations'
    ],
    analyst: [
      'view_all_data',
      'create_reports',
      'view_activity_logs'
    ]
  };

  return permissions[role] || [];
}

module.exports = UserController;
