// routes/stopRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop
} = require('../controllers/stopController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllStops);
router.get('/:id', getStopById);

// Admin only routes
router.post('/', protect, authorize('admin'), createStop);
router.put('/:id', protect, authorize('admin'), updateStop);
router.delete('/:id', protect, authorize('admin'), deleteStop);

module.exports = router;