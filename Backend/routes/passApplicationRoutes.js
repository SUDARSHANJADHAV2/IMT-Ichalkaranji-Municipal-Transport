// routes/passApplicationRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createPassApplication,
  getAllPassApplications,
  getPassApplicationById,
  updatePassApplicationStatus,
  getUserPassApplications,
  approvePassApplication,
  rejectPassApplication
} = require('../controllers/passApplicationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/fileUpload');

// Protected routes
router.post('/', protect, uploadMiddleware, createPassApplication);
router.get('/me', protect, getUserPassApplications);
router.get('/:id', protect, getPassApplicationById);

// Admin routes
router.get('/', protect, authorize('admin'), getAllPassApplications);
router.put('/:id/status', protect, authorize('admin'), updatePassApplicationStatus);
router.put('/:id/approve', protect, authorize('admin'), approvePassApplication);
router.put('/:id/reject', protect, authorize('admin'), rejectPassApplication);

module.exports = router;