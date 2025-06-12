const express = require('express');
const router = express.Router();
const { 
  submitPassApplication,
  verifyOtpForPass,
  getPendingApplications, // Added
  approvePassApplication, // Added
  rejectPassApplication   // Added
  // Add other functions like getUserPassApplications, getPassApplicationById later if needed
} = require('../controllers/passApplicationController');
const { protect, authorize } = require('../middleware/auth'); // authorize is now needed
const { upload, handleMulterError } = require('../middleware/fileUpload'); // Keep handleMulterError

// --- User Routes ---

// Route to submit a new pass application
// Uses protect middleware for authentication
// Uses upload.aadhaarCardDisk middleware for handling 'aadhaarCard' file upload
// Uses handleMulterError to catch file upload specific errors
router.post(
  '/',
  protect,
  upload.aadhaarCardDisk('aadhaarCard'), // Use the new disk storage uploader for this specific field
  handleMulterError, // Important to handle errors from multer
  submitPassApplication
);

// Route to verify OTP for a pass application
router.post(
  '/verify-otp',
  protect,
  verifyOtpForPass
);

// Example for fetching user's own applications (can be added fully later)
// router.get('/me', protect, getUserPassApplications);

// Example for fetching a specific application by ID (can be added fully later)
// router.get('/:id', protect, getPassApplicationById);

// --- Admin Routes ---
router.get(
    '/pending',
    protect,
    authorize('admin'),
    getPendingApplications
);

router.put(
    '/:id/approve',
    protect,
    authorize('admin'),
    approvePassApplication
);

router.put(
    '/:id/reject',
    protect,
    authorize('admin'),
    rejectPassApplication
);

module.exports = router;
