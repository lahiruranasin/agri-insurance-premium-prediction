/**
 * Claims Controller
 * Handles insurance claim filing, assessment, and approval
 */

const { db, admin } = require('../firebase.config');
const { DatabaseModels } = require('../models');
const { logActivity } = require('./activityController');

class ClaimController {
  /**
   * File a new claim
   */
  static async fileClaim(req, res) {
    try {
      const {
        userId,
        policyId,
        claimType,
        damageDescription,
        percentageLoss,
        photoUrls
      } = req.body;

      if (!userId || !policyId || !claimType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Verify policy exists and belongs to user
      const policy = await DatabaseModels.getDocument('policies', policyId);
      if (!policy || policy.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Policy not found or unauthorized'
        });
      }

      // Generate claim ID
      const claimId = `CLM-${policyId.substring(0, 3)}-${Date.now()}`;

      const claimData = {
        claimId,
        policyId,
        userId,
        claimType,
        damageAssessment: {
          percentageLoss: parseFloat(percentageLoss) || 0,
          description: damageDescription,
          photos: photoUrls || []
        },
        claimAmount: 0, // Will be calculated on assessment
        approvalStatus: 'pending',
        filedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Save claim
      await DatabaseModels.createDocument(
        'claims',
        claimData,
        claimId
      );

      // Update policy's claim history
      const updatedClaims = [...(policy.claimHistory || []), claimId];
      await DatabaseModels.updateDocument(
        'policies',
        policyId,
        { claimHistory: updatedClaims }
      );

      // Log activity
      await logActivity({
        userId,
        action: 'file_claim',
        resourceType: 'claim',
        resourceId: claimId,
        status: 'success',
        details: { policyId, claimType }
      });

      res.status(201).json({
        success: true,
        claimId,
        data: claimData
      });
    } catch (error) {
      console.error('Error filing claim:', error);

      await logActivity({
        userId: req.body.userId,
        action: 'file_claim',
        resourceType: 'claim',
        status: 'failure',
        errorMessage: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to file claim',
        details: error.message
      });
    }
  }

  /**
   * Get claims for a user
   */
  static async getUserClaims(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      const conditions = [
        { field: 'userId', operator: '==', value: userId }
      ];

      if (status) {
        conditions.push({ field: 'approvalStatus', operator: '==', value: status });
      }

      const claims = await DatabaseModels.getDocuments(
        'claims',
        conditions
      );

      res.status(200).json({
        success: true,
        count: claims.length,
        claims
      });
    } catch (error) {
      console.error('Error fetching user claims:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch claims'
      });
    }
  }

  /**
   * Get claims for a policy
   */
  static async getPolicyClaims(req, res) {
    try {
      const { policyId } = req.params;

      const claims = await DatabaseModels.getDocuments(
        'claims',
        [{ field: 'policyId', operator: '==', value: policyId }]
      );

      res.status(200).json({
        success: true,
        count: claims.length,
        claims
      });
    } catch (error) {
      console.error('Error fetching policy claims:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch claims'
      });
    }
  }

  /**
   * Get claim by ID
   */
  static async getClaimById(req, res) {
    try {
      const { claimId } = req.params;

      const claim = await DatabaseModels.getDocument('claims', claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found'
        });
      }

      res.status(200).json({
        success: true,
        data: claim
      });
    } catch (error) {
      console.error('Error fetching claim:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch claim'
      });
    }
  }

  /**
   * Assess damage and calculate claim amount
   */
  static async assessClaim(req, res) {
    try {
      const { claimId } = req.params;
      const {
        percentageLoss,
        assessmentNotes,
        assessedBy,
        assessmentPhotos
      } = req.body;

      const claim = await DatabaseModels.getDocument('claims', claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found'
        });
      }

      // Get policy for calculation
      const policy = await DatabaseModels.getDocument('policies', claim.policyId);
      
      // Calculate claim amount: (coverage * acreage * loss%) * premium rate
      const claimAmount = (policy.coverage / 100) * policy.acreage * (percentageLoss / 100) * policy.premium;

      const assessmentData = {
        'damageAssessment.percentageLoss': parseFloat(percentageLoss),
        'damageAssessment.assessedBy': assessedBy,
        'damageAssessment.assessmentDate': admin.firestore.FieldValue.serverTimestamp(),
        'damageAssessment.photos': assessmentPhotos || [],
        claimAmount
      };

      await DatabaseModels.updateDocument('claims', claimId, assessmentData);

      // Log activity
      await logActivity({
        userId: assessedBy,
        action: 'assess_claim',
        resourceType: 'claim',
        resourceId: claimId,
        status: 'success',
        details: { percentageLoss, claimAmount }
      });

      res.status(200).json({
        success: true,
        message: 'Claim assessed successfully',
        claimId,
        claimAmount
      });
    } catch (error) {
      console.error('Error assessing claim:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assess claim'
      });
    }
  }

  /**
   * Approve or reject a claim
   */
  static async reviewClaim(req, res) {
    try {
      const { claimId } = req.params;
      const { approvalStatus, approvedAmount, rejectionReason, reviewedBy, paymentReference } = req.body;

      const validStatuses = ['approved', 'rejected', 'pending'];
      if (!validStatuses.includes(approvalStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const claim = await DatabaseModels.getDocument('claims', claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found'
        });
      }

      const updateData = {
        approvalStatus,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy
      };

      if (approvalStatus === 'approved') {
        updateData.approvedAmount = parseFloat(approvedAmount) || claim.claimAmount;
        updateData.paymentReference = paymentReference;
      } else if (approvalStatus === 'rejected') {
        updateData.rejectionReason = rejectionReason;
        updateData.approvedAmount = 0;
      }

      await DatabaseModels.updateDocument('claims', claimId, updateData);

      // Update policy status if approved
      if (approvalStatus === 'approved') {
        const policy = await DatabaseModels.getDocument('policies', claim.policyId);
        if (policy.policyStatus !== 'claimed') {
          await DatabaseModels.updateDocument('policies', claim.policyId, { policyStatus: 'claimed' });
        }
      }

      // Log activity
      await logActivity({
        userId: reviewedBy,
        action: `${approvalStatus}_claim`,
        resourceType: 'claim',
        resourceId: claimId,
        status: 'success'
      });

      res.status(200).json({
        success: true,
        message: `Claim ${approvalStatus} successfully`,
        claimId,
        approvedAmount: updateData.approvedAmount
      });
    } catch (error) {
      console.error('Error reviewing claim:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to review claim'
      });
    }
  }

  /**
   * Mark claim as paid
   */
  static async markClaimAsPaid(req, res) {
    try {
      const { claimId } = req.params;
      const { paidBy, paymentMethod, reference } = req.body;

      const claim = await DatabaseModels.getDocument('claims', claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found'
        });
      }

      if (claim.approvalStatus !== 'approved') {
        return res.status(400).json({
          success: false,
          error: 'Only approved claims can be marked as paid'
        });
      }

      await DatabaseModels.updateDocument('claims', claimId, {
        approvalStatus: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentMethod,
        paymentReference: reference
      });

      // Log activity
      await logActivity({
        userId: paidBy,
        action: 'pay_claim',
        resourceType: 'claim',
        resourceId: claimId,
        status: 'success',
        details: { amount: claim.approvedAmount, method: paymentMethod }
      });

      res.status(200).json({
        success: true,
        message: 'Claim marked as paid',
        claimId
      });
    } catch (error) {
      console.error('Error marking claim as paid:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark claim as paid'
      });
    }
  }

  /**
   * Get claims statistics for a division
   */
  static async getDivisionClaimStats(req, res) {
    try {
      const { division, startDate, endDate } = req.query;

      // Get all policies in division
      const policies = await DatabaseModels.getDocuments(
        'policies',
        [{ field: 'division', operator: '==', value: division }]
      );

      const policyIds = policies.map(p => p.policyId);

      let claimsQuery = db.collection('claims');
      if (startDate) {
        claimsQuery = claimsQuery.where('filedAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)));
      }
      if (endDate) {
        claimsQuery = claimsQuery.where('filedAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)));
      }

      const claimsSnapshot = await claimsQuery.get();
      const claims = claimsSnapshot.docs
        .map(doc => doc.data())
        .filter(claim => policyIds.includes(claim.policyId));

      const stats = {
        totalClaims: claims.length,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        paidClaims: 0,
        totalClaimAmount: 0,
        totalApprovedAmount: 0,
        totalPaidAmount: 0,
        averageClaimAmount: 0,
        byType: {},
        byStatus: {}
      };

      claims.forEach(claim => {
        stats.totalClaimAmount += claim.claimAmount || 0;

        if (claim.approvalStatus === 'pending') stats.pendingClaims++;
        else if (claim.approvalStatus === 'approved') {
          stats.approvedClaims++;
          stats.totalApprovedAmount += claim.approvedAmount || 0;
        } else if (claim.approvalStatus === 'rejected') stats.rejectedClaims++;
        else if (claim.approvalStatus === 'paid') {
          stats.paidClaims++;
          stats.totalPaidAmount += claim.approvedAmount || 0;
        }

        stats.byType[claim.claimType] = (stats.byType[claim.claimType] || 0) + 1;
        stats.byStatus[claim.approvalStatus] = (stats.byStatus[claim.approvalStatus] || 0) + 1;
      });

      stats.averageClaimAmount = claims.length > 0 ? stats.totalClaimAmount / claims.length : 0;

      res.status(200).json({
        success: true,
        division,
        stats
      });
    } catch (error) {
      console.error('Error fetching claim stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  }
}

module.exports = ClaimController;
