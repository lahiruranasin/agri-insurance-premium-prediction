/**
 * Policy Controller
 * Handles policy creation, updates, and management
 */

const { db, admin } = require('../firebase.config');
const { DatabaseModels } = require('../models');
const { logActivity } = require('./activityController');

class PolicyController {
  /**
   * Create a new policy from an accepted calculation
   */
  static async createPolicy(req, res) {
    try {
      const {
        userId,
        calculationId,
        clientName,
        division,
        crop,
        acreage,
        coverage,
        premium,
        issuedBy,
        documents
      } = req.body;

      if (!calculationId || !userId || !issuedBy) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Generate policy ID
      const policyId = `POL-${division.substring(0, 3).toUpperCase()}-${Date.now()}`;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1-year policy

      const policyData = {
        policyId,
        userId,
        calculationId,
        clientName,
        division,
        crop,
        acreage: parseFloat(acreage),
        coverage: parseFloat(coverage),
        premium: parseFloat(premium),
        policyStatus: 'active',
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        issuedBy,
        documents: documents || {},
        claimHistory: []
      };

      // Save to Firestore
      await DatabaseModels.createDocument(
        'policies',
        policyData,
        policyId
      );

      // Update premium calculation status
      await DatabaseModels.updateDocument(
        'premiumCalculations',
        calculationId,
        { status: 'accepted' }
      );

      // Log activity
      await logActivity({
        userId: issuedBy,
        action: 'create_policy',
        resourceType: 'policy',
        resourceId: policyId,
        status: 'success',
        details: { clientName, division, crop }
      });

      res.status(201).json({
        success: true,
        policyId,
        data: policyData
      });
    } catch (error) {
      console.error('Error creating policy:', error);

      await logActivity({
        userId: req.body.issuedBy,
        action: 'create_policy',
        resourceType: 'policy',
        status: 'failure',
        errorMessage: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to create policy',
        details: error.message
      });
    }
  }

  /**
   * Get all policies for a user
   */
  static async getUserPolicies(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const conditions = [
        { field: 'userId', operator: '==', value: userId }
      ];

      if (status) {
        conditions.push({ field: 'policyStatus', operator: '==', value: status });
      }

      const policies = await DatabaseModels.getDocuments(
        'policies',
        conditions
      );

      res.status(200).json({
        success: true,
        count: policies.length,
        policies
      });
    } catch (error) {
      console.error('Error fetching user policies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policies'
      });
    }
  }

  /**
   * Get policy by ID
   */
  static async getPolicyById(req, res) {
    try {
      const { policyId } = req.params;

      const policy = await DatabaseModels.getDocument(
        'policies',
        policyId
      );

      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }

      res.status(200).json({
        success: true,
        data: policy
      });
    } catch (error) {
      console.error('Error fetching policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch policy'
      });
    }
  }

  /**
   * Update policy status
   */
  static async updatePolicyStatus(req, res) {
    try {
      const { policyId } = req.params;
      const { status, updatedBy } = req.body;

      const validStatuses = ['active', 'expired', 'cancelled', 'claimed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      await DatabaseModels.updateDocument(
        'policies',
        policyId,
        { policyStatus: status }
      );

      // Log activity
      await logActivity({
        userId: updatedBy,
        action: `${status}_policy`,
        resourceType: 'policy',
        resourceId: policyId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: `Policy status updated to ${status}`,
        policyId
      });
    } catch (error) {
      console.error('Error updating policy status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update policy'
      });
    }
  }

  /**
   * Get all active policies expiring within specified days
   */
  static async getExpiringPolicies(req, res) {
    try {
      const { daysUntilExpiry = 30 } = req.query;

      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(daysUntilExpiry));

      const conditions = [
        { field: 'policyStatus', operator: '==', value: 'active' },
        { field: 'endDate', operator: '<=', value: admin.firestore.Timestamp.fromDate(expiryDate) },
        { field: 'endDate', operator: '>=', value: admin.firestore.Timestamp.fromDate(now) }
      ];

      const expiringPolicies = await DatabaseModels.getDocuments(
        'policies',
        conditions
      );

      res.status(200).json({
        success: true,
        count: expiringPolicies.length,
        expiringPolicies
      });
    } catch (error) {
      console.error('Error fetching expiring policies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expiring policies'
      });
    }
  }

  /**
   * Get policy statistics for a division
   */
  static async getDivisionPolicyStats(req, res) {
    try {
      const { division } = req.query;

      const conditions = [
        { field: 'division', operator: '==', value: division }
      ];

      const policies = await DatabaseModels.getDocuments(
        'policies',
        conditions
      );

      const stats = {
        totalPolicies: policies.length,
        activePolicies: 0,
        expiredPolicies: 0,
        cancelledPolicies: 0,
        claimedPolicies: 0,
        totalCoverage: 0,
        totalPremiums: 0,
        byCrop: {},
        byStatus: {}
      };

      policies.forEach(policy => {
        stats.totalPremiums += policy.premium || 0;
        stats.totalCoverage += (policy.acreage * policy.coverage / 100) || 0;

        stats.byStatus[policy.policyStatus] = (stats.byStatus[policy.policyStatus] || 0) + 1;
        stats.byCrop[policy.crop] = (stats.byCrop[policy.crop] || 0) + 1;

        if (policy.policyStatus === 'active') stats.activePolicies++;
        else if (policy.policyStatus === 'expired') stats.expiredPolicies++;
        else if (policy.policyStatus === 'cancelled') stats.cancelledPolicies++;
        else if (policy.policyStatus === 'claimed') stats.claimedPolicies++;
      });

      res.status(200).json({
        success: true,
        division,
        stats
      });
    } catch (error) {
      console.error('Error fetching policy stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  /**
   * Renew an expiring policy
   */
  static async renewPolicy(req, res) {
    try {
      const { policyId } = req.params;
      const { renewalPremium, renewedBy } = req.body;

      const policy = await DatabaseModels.getDocument('policies', policyId);
      if (!policy) {
        return res.status(404).json({
          success: false,
          error: 'Policy not found'
        });
      }

      const newEndDate = new Date(policy.endDate.toDate());
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      await DatabaseModels.updateDocument(
        'policies',
        policyId,
        {
          endDate: admin.firestore.Timestamp.fromDate(newEndDate),
          premium: renewalPremium,
          policyStatus: 'active'
        }
      );

      // Log activity
      await logActivity({
        userId: renewedBy,
        action: 'renew_policy',
        resourceType: 'policy',
        resourceId: policyId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: 'Policy renewed successfully',
        policyId,
        newEndDate
      });
    } catch (error) {
      console.error('Error renewing policy:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to renew policy'
      });
    }
  }
}

module.exports = PolicyController;
