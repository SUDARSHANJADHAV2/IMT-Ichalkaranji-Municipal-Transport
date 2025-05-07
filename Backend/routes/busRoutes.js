// routes/busRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllBuses, 
  getBusById, 
  createBus, 
  updateBus, 
  deleteBus, 
  searchBuses, 
  getBusSchedules 
} = require('../controllers/busController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllBuses);
router.get('/search', searchBuses);
router.get('/schedules', getBusSchedules);
router.get('/:id', getBusById);

// Admin only routes
router.post('/', protect, authorize('admin'), createBus);
router.put('/:id', protect, authorize('admin'), updateBus);
router.delete('/:id', protect, authorize('admin'), deleteBus);

module.exports = router;