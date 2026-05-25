/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin SDK with service account credentials
 * Handles database, authentication, and storage connections
 */

const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin SDK with service account
const serviceAccount = require('./finalproject-96580-firebase-adminsdk-fbsvc-69fb366cb7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
  storageBucket: 'finalproject-96580.firebasestorage.app'
});

// Get references to services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const bucket = storage.bucket();

// Set Firestore settings
db.settings({ 
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true 
});

module.exports = {
  admin,
  db,
  auth,
  storage,
  bucket,
  serviceAccount
};
