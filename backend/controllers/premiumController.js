/**
 * Premium Calculation Controller
 * Handles all premium calculation operations and Firestore interactions
 */

const { db, admin } = require('../firebase.config');
const { DatabaseModels } = require('../models');
const { logActivity } = require('./activityController');

class PremiumController {
  /**
   * Create a new premium calculation
   * Saves calculation results to Firestore
   */
  static async createPremiumCalculation(req, res) {
    try {
      const {
        userId,
        clientName,
        division,
        crop,
        acreage,
        coverage,
        irrigation,
        premiumDetails,
        manualOverride
      } = req.body;

      // Validate required fields
      if (!userId || !clientName || !division || !crop) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Generate unique calculation ID
      const calculationId = `CALC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const calculationData = {
        calculationId,
        userId,
        clientName,
        division,
        crop,
        acreage: parseFloat(acreage),
        coverage: parseFloat(coverage),
        irrigation,
        premiumDetails: {
          ...premiumDetails,
          manualOverride: parseFloat(manualOverride) || 1.0
        },
        status: 'calculated',
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        )
      };

      // Save to Firestore
      const result = await DatabaseModels.createDocument(
        'premiumCalculations',
        calculationData,
        calculationId
      );

      // Log activity
      await logActivity({
        userId,
        action: 'calculate_premium',
        resourceType: 'premium',
        resourceId: calculationId,
        status: 'success',
        details: { crop, division, acreage }
      });

      res.status(201).json({
        success: true,
        calculationId,
        data: calculationData
      });
    } catch (error) {
      console.error('Error creating premium calculation:', error);

      await logActivity({
        userId: req.body.userId,
        action: 'calculate_premium',
        resourceType: 'premium',
        status: 'failure',
        errorMessage: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to create premium calculation',
        details: error.message
      });
    }
  }

  /**
   * Get all calculations for a user
   */
  static async getUserCalculations(req, res) {
    try {
      const { userId } = req.params;
      const { status, division, limit } = req.query;

      const conditions = [
        { field: 'userId', operator: '==', value: userId }
      ];

      if (status) {
        conditions.push({ field: 'status', operator: '==', value: status });
      }
      if (division) {
        conditions.push({ field: 'division', operator: '==', value: division });
      }

      const calculations = await DatabaseModels.getDocuments(
        'premiumCalculations',
        conditions,
        limit ? parseInt(limit) : null
      );

      res.status(200).json({
        success: true,
        count: calculations.length,
        calculations
      });
    } catch (error) {
      console.error('Error fetching user calculations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calculations'
      });
    }
  }

  /**
   * Get calculation by ID
   */
  static async getCalculationById(req, res) {
    try {
      const { calculationId } = req.params;

      const calculation = await DatabaseModels.getDocument(
        'premiumCalculations',
        calculationId
      );

      if (!calculation) {
        return res.status(404).json({
          success: false,
          error: 'Calculation not found'
        });
      }

      res.status(200).json({
        success: true,
        data: calculation
      });
    } catch (error) {
      console.error('Error fetching calculation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calculation'
      });
    }
  }

  /**
   * Update calculation status (e.g., accept, reject)
   */
  static async updateCalculationStatus(req, res) {
    try {
      const { calculationId } = req.params;
      const { status, approvedBy, notes } = req.body;

      const validStatuses = ['calculated', 'accepted', 'rejected', 'expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const updateData = {
        status,
        approvedBy,
        ...(notes && { notes })
      };

      if (status === 'accepted') {
        updateData.approvedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await DatabaseModels.updateDocument(
        'premiumCalculations',
        calculationId,
        updateData
      );

      // Log activity
      await logActivity({
        userId: approvedBy,
        action: `${status}_premium`,
        resourceType: 'premium',
        resourceId: calculationId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: `Calculation ${status} successfully`,
        calculationId
      });
    } catch (error) {
      console.error('Error updating calculation status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update calculation'
      });
    }
  }

  /**
   * Get premium statistics for a division
   */
  static async getDivisionStats(req, res) {
    try {
      const { division, startDate, endDate } = req.query;

      const conditions = [
        { field: 'division', operator: '==', value: division }
      ];

      if (startDate) {
        conditions.push({
          field: 'createdAt',
          operator: '>=',
          value: admin.firestore.Timestamp.fromDate(new Date(startDate))
        });
      }
      if (endDate) {
        conditions.push({
          field: 'createdAt',
          operator: '<=',
          value: admin.firestore.Timestamp.fromDate(new Date(endDate))
        });
      }

      const calculations = await DatabaseModels.getDocuments(
        'premiumCalculations',
        conditions
      );

      // Calculate statistics
      const stats = {
        totalCalculations: calculations.length,
        totalPremiums: 0,
        totalGrossPremiums: 0,
        totalSubsidies: 0,
        averagePremium: 0,
        byStatus: {},
        byCrop: {}
      };

      calculations.forEach(calc => {
        stats.totalGrossPremiums += calc.premiumDetails.grossPremium || 0;
        stats.totalSubsidies += calc.premiumDetails.subsidyAmount || 0;
        stats.totalPremiums += calc.premiumDetails.netPremium || 0;

        stats.byStatus[calc.status] = (stats.byStatus[calc.status] || 0) + 1;
        stats.byCrop[calc.crop] = (stats.byCrop[calc.crop] || 0) + 1;
      });

      stats.averagePremium = stats.totalCalculations > 0 
        ? stats.totalPremiums / stats.totalCalculations 
        : 0;

      res.status(200).json({
        success: true,
        division,
        stats
      });
    } catch (error) {
      console.error('Error fetching division stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }

  /**
   * Export calculations to CSV format
   */
  static async exportCalculations(req, res) {
    try {
      const { division, status } = req.query;

      const conditions = [];
      if (division) conditions.push({ field: 'division', operator: '==', value: division });
      if (status) conditions.push({ field: 'status', operator: '==', value: status });

      const calculations = await DatabaseModels.getDocuments(
        'premiumCalculations',
        conditions
      );

      // Generate CSV format
      const csv = [
        ['Calculation ID', 'Client Name', 'Division', 'Crop', 'Acreage', 'Coverage', 'Irrigation', 'Net Premium', 'Status', 'Created At'],
        ...calculations.map(c => [
          c.calculationId,
          c.clientName,
          c.division,
          c.crop,
          c.acreage,
          c.coverage,
          c.irrigation,
          c.premiumDetails.netPremium,
          c.status,
          c.createdAt?.toDate?.().toISOString() || 'N/A'
        ])
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=calculations.csv');
      res.send(csv.map(row => row.join(',')).join('\n'));
    } catch (error) {
      console.error('Error exporting calculations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export calculations'
      });
    }
  }
}

module.exports = PremiumController;
