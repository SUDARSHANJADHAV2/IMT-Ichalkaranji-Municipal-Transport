// routes/passRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createPassApplication,
  getPassApplications,
  getPassApplicationById,
  getUserPassApplications,
  updatePassApplicationStatus,
  uploadAadhaarDocument,
  downloadPassDocument,
  verifyPass
} = require('../controllers/passController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/fileUpload');

// Protected routes
router.post('/', protect, createPassApplication);
router.get('/me', protect, getUserPassApplications);
router.get('/:id', protect, getPassApplicationById);
router.post('/upload-aadhaar', protect, uploadMiddleware, uploadAadhaarDocument);
router.get('/:id/download', protect, downloadPassDocument);
router.get('/:id/verify', verifyPass);

// Admin routes
router.get('/', protect, authorize('admin'), getPassApplications);
router.put('/:id/status', protect, authorize('admin'), updatePassApplicationStatus);

module.exports = router;