// routes/routeRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  addStopToRoute,
  removeStopFromRoute
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);

// Admin only routes
router.post('/', protect, authorize('admin'), createRoute);
router.put('/:id', protect, authorize('admin'), updateRoute);
router.delete('/:id', protect, authorize('admin'), deleteRoute);
router.post('/:id/stops', protect, authorize('admin'), addStopToRoute);
router.delete('/:id/stops/:stopId', protect, authorize('admin'), removeStopFromRoute);

module.exports = router;