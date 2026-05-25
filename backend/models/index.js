/**
 * Firestore Database Models & Schemas
 * Defines all data structures and collections used in the agricultural insurance system
 */

const { db, admin } = require('./firebase.config');

/**
 * ============================================================================
 * DATABASE SCHEMA DEFINITION
 * ============================================================================
 * Collections and their structure for Agricultural Insurance System
 */

// Collection: users
// Stores user accounts with authentication and profile information
const UserModel = {
  collectionName: 'users',
  schema: {
    uid: 'string',                    // Firebase UID
    email: 'string',                  // Email address
    displayName: 'string',            // Full name
    role: 'string',                   // 'admin', 'officer', 'farmer', 'analyst'
    division: 'string',               // Assigned division (for officers/farmers)
    phone: 'string',                  // Contact number
    profileImageUrl: 'string',        // Profile picture URL in Storage
    isActive: 'boolean',              // Account status
    createdAt: 'timestamp',           // Account creation date
    lastLogin: 'timestamp',           // Last login timestamp
    permissions: ['string'],          // Array of permission strings
    metadata: {
      loginCount: 'number',
      totalCalculations: 'number',
      verificationStatus: 'string'    // 'pending', 'verified', 'rejected'
    }
  },
  indexes: ['email', 'role', 'division', 'isActive']
};

// Collection: divisions
// Geographical divisions with risk profiles and agricultural data
const DivisionModel = {
  collectionName: 'divisions',
  schema: {
    name: 'string',                   // Division name (e.g., "Thalawa")
    riskLevel: 'string',              // 'Low', 'Medium', 'High'
    riskScore: 'number',              // 0-100 risk score
    baseRate: 'number',               // Base premium rate (LKR)
    coordinates: {                    // Geographic location
      latitude: 'number',
      longitude: 'number'
    },
    area: 'number',                   // Area in sq km
    population: 'number',             // Farmer population
    majorCrops: ['string'],           // Primary crops grown
    irrigationTypes: ['string'],      // Available irrigation methods
    historicalClaims: 'number',       // Total claims filed
    claimSuccessRate: 'number',       // Percentage of approved claims
    weatherData: {                    // Historical weather
      avgRainfall: 'number',
      avgTemperature: 'number',
      droughtFrequency: 'number'
    },
    updatedAt: 'timestamp'
  },
  indexes: ['riskLevel', 'riskScore', 'name']
};

// Collection: premiumCalculations
// Records of all premium calculations performed
const PremiumCalculationModel = {
  collectionName: 'premiumCalculations',
  schema: {
    calculationId: 'string',          // Unique calculation ID
    userId: 'string',                 // User who performed calculation (FK)
    clientName: 'string',             // Farmer/client name
    division: 'string',               // Division name
    crop: 'string',                   // Crop type (e.g., "Paddy", "Maize")
    acreage: 'number',                // Land area in acres
    coverage: 'number',               // Coverage percentage (%)
    irrigation: 'string',             // Irrigation type
    premiumDetails: {
      baseRate: 'number',
      riskScore: 'number',
      riskCategory: 'string',
      grossPremium: 'number',
      subsidyAmount: 'number',
      netPremium: 'number',
      manualOverride: 'number'
    },
    status: 'string',                 // 'calculated', 'accepted', 'rejected', 'expired'
    expiresAt: 'timestamp',           // Quote expiration date
    createdAt: 'timestamp',
    approvedAt: 'timestamp',
    approvedBy: 'string'              // Officer who approved (FK to users)
  },
  indexes: ['userId', 'division', 'crop', 'status', 'createdAt']
};

// Collection: policies
// Active and historical insurance policies
const PolicyModel = {
  collectionName: 'policies',
  schema: {
    policyId: 'string',               // Policy number
    userId: 'string',                 // Policy holder (FK)
    calculationId: 'string',          // Related calculation (FK)
    clientName: 'string',
    division: 'string',
    crop: 'string',
    acreage: 'number',
    coverage: 'number',
    premium: 'number',
    policyStatus: 'string',           // 'active', 'expired', 'cancelled', 'claimed'
    startDate: 'timestamp',
    endDate: 'timestamp',
    createdAt: 'timestamp',
    issuedBy: 'string',               // Officer who issued (FK)
    documents: {
      policyDocument: 'string',       // Storage URL
      termsAndConditions: 'string'
    },
    claimHistory: ['string']          // Array of claim IDs
  },
  indexes: ['policyId', 'userId', 'policyStatus', 'division', 'startDate']
};

// Collection: claims
// Insurance claims filed by policyholders
const ClaimModel = {
  collectionName: 'claims',
  schema: {
    claimId: 'string',                // Unique claim ID
    policyId: 'string',               // Related policy (FK)
    userId: 'string',                 // Claimant (FK)
    claimType: 'string',              // 'crop_loss', 'weather_damage', 'pest_damage'
    damageAssessment: {
      percentageLoss: 'number',       // 0-100
      description: 'string',
      photos: ['string'],             // Storage URLs
      assessedBy: 'string',           // Officer who assessed (FK)
      assessmentDate: 'timestamp'
    },
    claimAmount: 'number',
    approvalStatus: 'string',         // 'pending', 'approved', 'rejected', 'paid'
    approvedAmount: 'number',
    rejectionReason: 'string',
    filedAt: 'timestamp',
    reviewedAt: 'timestamp',
    paidAt: 'timestamp',
    reviewedBy: 'string',             // Officer who reviewed (FK)
    paymentReference: 'string'        // Bank transfer reference
  },
  indexes: ['claimId', 'policyId', 'userId', 'approvalStatus', 'filedAt']
};

// Collection: activityLog
// Audit trail of all system activities
const ActivityLogModel = {
  collectionName: 'activityLog',
  schema: {
    logId: 'string',
    userId: 'string',                 // User who performed action
    action: 'string',                 // e.g., 'calculate_premium', 'approve_claim'
    resourceType: 'string',           // 'premium', 'policy', 'claim', 'user'
    resourceId: 'string',
    details: 'object',                // Action-specific details
    status: 'string',                 // 'success', 'failure'
    errorMessage: 'string',
    ipAddress: 'string',
    userAgent: 'string',
    timestamp: 'timestamp'
  },
  indexes: ['userId', 'action', 'resourceType', 'timestamp']
};

// Collection: reports
// Generated reports for analysis and decision making
const ReportModel = {
  collectionName: 'reports',
  schema: {
    reportId: 'string',
    reportType: 'string',             // 'risk_analysis', 'claims_summary', 'premium_trends'
    division: 'string',
    period: {
      startDate: 'timestamp',
      endDate: 'timestamp'
    },
    metrics: {
      totalPolicies: 'number',
      totalClaims: 'number',
      approvedClaims: 'number',
      totalClaimed: 'number',
      totalPaid: 'number',
      averagePremium: 'number',
      claimSuccessRate: 'number'
    },
    chartData: 'object',              // JSON for frontend charts
    generatedBy: 'string',            // User who generated (FK)
    createdAt: 'timestamp'
  },
  indexes: ['reportType', 'division', 'createdAt']
};

// Collection: systemSettings
// Configuration and settings for the application
const SettingsModel = {
  collectionName: 'systemSettings',
  schema: {
    key: 'string',                    // Setting key
    value: 'object/string/number',    // Setting value (flexible type)
    description: 'string',
    category: 'string',               // e.g., 'premium', 'policy', 'ui'
    isPublic: 'boolean',              // Accessible to frontend
    updatedBy: 'string',              // Admin who updated
    updatedAt: 'timestamp'
  }
};

/**
 * ============================================================================
 * MODEL METHODS - CRUD Operations
 * ============================================================================
 */

class DatabaseModels {
  /**
   * Generic method to create a new document
   */
  static async createDocument(collectionName, data, documentId = null) {
    try {
      const docRef = documentId 
        ? await db.collection(collectionName).doc(documentId).set({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        : await db.collection(collectionName).add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
      
      return { success: true, id: docRef.id || documentId, data };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Read a single document
   */
  static async getDocument(collectionName, documentId) {
    try {
      const doc = await db.collection(collectionName).doc(documentId).get();
      return doc.exists ? { ...doc.data(), id: doc.id } : null;
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Read all documents with optional filtering
   */
  static async getDocuments(collectionName, whereConditions = [], limit = null) {
    try {
      let query = db.collection(collectionName);

      for (const condition of whereConditions) {
        query = query.where(condition.field, condition.operator, condition.value);
      }

      if (limit) query = query.limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error(`Error reading documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  static async updateDocument(collectionName, documentId, data) {
    try {
      await db.collection(collectionName).doc(documentId).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: documentId };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(collectionName, documentId) {
    try {
      await db.collection(collectionName).doc(documentId).delete();
      return { success: true, id: documentId };
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Batch write operations
   */
  static async batchWrite(operations) {
    try {
      const batch = db.batch();

      for (const op of operations) {
        const ref = db.collection(op.collection).doc(op.docId);
        if (op.type === 'set') {
          batch.set(ref, { ...op.data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        } else if (op.type === 'update') {
          batch.update(ref, { ...op.data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        } else if (op.type === 'delete') {
          batch.delete(ref);
        }
      }

      await batch.commit();
      return { success: true, operationsCount: operations.length };
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }

  /**
   * Query with pagination
   */
  static async getPaginatedDocuments(collectionName, pageSize = 20, pageNumber = 1, whereConditions = [], orderBy = null) {
    try {
      let query = db.collection(collectionName);

      for (const condition of whereConditions) {
        query = query.where(condition.field, condition.operator, condition.value);
      }

      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      const startIndex = (pageNumber - 1) * pageSize;
      query = query.limit(pageSize).offset(startIndex);

      const snapshot = await query.get();
      const documents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      return {
        documents,
        total,
        pageSize,
        pageNumber,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error(`Error in paginated query for ${collectionName}:`, error);
      throw error;
    }
  }
}

module.exports = {
  DatabaseModels,
  UserModel,
  DivisionModel,
  PremiumCalculationModel,
  PolicyModel,
  ClaimModel,
  ActivityLogModel,
  ReportModel,
  SettingsModel
};
