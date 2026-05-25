/**
 * Activity Controller
 * Handles activity logging and audit trail
 */

const { db, admin } = require('../firebase.config');
const { DatabaseModels } = require('../models');

class ActivityController {
  /**
   * Log an activity - called by other controllers
   */
  static async logActivity(activityData, ipAddress = null, userAgent = null) {
    try {
      const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const logEntry = {
        logId,
        userId: activityData.userId,
        action: activityData.action,
        resourceType: activityData.resourceType || 'system',
        resourceId: activityData.resourceId || null,
        details: activityData.details || {},
        status: activityData.status || 'success',
        errorMessage: activityData.errorMessage || null,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      await DatabaseModels.createDocument(
        'activityLog',
        logEntry,
        logId
      );

      return logEntry;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging failures shouldn't crash the app
    }
  }

  /**
   * Get activity logs for a user
   */
  static async getUserActivityLog(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, startDate, endDate } = req.query;

      const conditions = [
        { field: 'userId', operator: '==', value: userId }
      ];

      if (startDate) {
        conditions.push({
          field: 'timestamp',
          operator: '>=',
          value: admin.firestore.Timestamp.fromDate(new Date(startDate))
        });
      }
      if (endDate) {
        conditions.push({
          field: 'timestamp',
          operator: '<=',
          value: admin.firestore.Timestamp.fromDate(new Date(endDate))
        });
      }

      const logs = await DatabaseModels.getDocuments(
        'activityLog',
        conditions,
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        count: logs.length,
        logs: logs.reverse() // Most recent first
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity logs'
      });
    }
  }

  /**
   * Get activity logs by resource
   */
  static async getResourceActivityLog(req, res) {
    try {
      const { resourceType, resourceId } = req.params;
      const { limit = 100 } = req.query;

      const conditions = [
        { field: 'resourceType', operator: '==', value: resourceType }
      ];

      if (resourceId) {
        conditions.push({ field: 'resourceId', operator: '==', value: resourceId });
      }

      const logs = await DatabaseModels.getDocuments(
        'activityLog',
        conditions,
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        count: logs.length,
        logs: logs.reverse()
      });
    } catch (error) {
      console.error('Error fetching resource activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity logs'
      });
    }
  }

  /**
   * Get system-wide activity summary
   */
  static async getSystemActivitySummary(req, res) {
    try {
      const { days = 7 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const conditions = [
        {
          field: 'timestamp',
          operator: '>=',
          value: admin.firestore.Timestamp.fromDate(startDate)
        }
      ];

      const logs = await DatabaseModels.getDocuments('activityLog', conditions);

      const summary = {
        totalActivities: logs.length,
        byAction: {},
        byStatus: { success: 0, failure: 0 },
        byResourceType: {},
        activeUsers: new Set()
      };

      logs.forEach(log => {
        summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
        summary.byStatus[log.status] = (summary.byStatus[log.status] || 0) + 1;
        summary.byResourceType[log.resourceType] = (summary.byResourceType[log.resourceType] || 0) + 1;
        if (log.userId) summary.activeUsers.add(log.userId);
      });

      summary.uniqueUsers = summary.activeUsers.size;
      delete summary.activeUsers; // Don't expose the Set

      res.status(200).json({
        success: true,
        period: `Last ${days} days`,
        summary
      });
    } catch (error) {
      console.error('Error fetching system summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system summary'
      });
    }
  }

  /**
   * Get activities by action
   */
  static async getActivitiesByAction(req, res) {
    try {
      const { action, limit = 100 } = req.query;

      if (!action) {
        return res.status(400).json({
          success: false,
          error: 'Action parameter is required'
        });
      }

      const logs = await DatabaseModels.getDocuments(
        'activityLog',
        [{ field: 'action', operator: '==', value: action }],
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        action,
        count: logs.length,
        logs: logs.reverse()
      });
    } catch (error) {
      console.error('Error fetching activities by action:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activities'
      });
    }
  }

  /**
   * Delete old activity logs (for maintenance)
   */
  static async cleanupOldLogs(req, res) {
    try {
      const { daysOld = 90 } = req.query;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

      const oldLogs = await DatabaseModels.getDocuments(
        'activityLog',
        [{
          field: 'timestamp',
          operator: '<',
          value: admin.firestore.Timestamp.fromDate(cutoffDate)
        }]
      );

      const operations = oldLogs.map(log => ({
        collection: 'activityLog',
        docId: log.logId,
        type: 'delete'
      }));

      if (operations.length > 0) {
        await DatabaseModels.batchWrite(operations);
      }

      res.status(200).json({
        success: true,
        message: `Deleted ${operations.length} old activity logs`,
        deletedCount: operations.length
      });
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup logs'
      });
    }
  }
}

// Helper function to be called from other controllers
const logActivity = ActivityController.logActivity.bind(ActivityController);

module.exports = ActivityController;
module.exports.logActivity = logActivity;
