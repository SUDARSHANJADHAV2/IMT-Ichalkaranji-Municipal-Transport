// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createBooking,
  getBookings, // This is now correctly matching the export
  getBookingById,
  getUserBookings,
  cancelBooking,
  verifyBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', protect, createBooking);
router.get('/me', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/verify', protect, verifyBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getBookings);

module.exports = router;
