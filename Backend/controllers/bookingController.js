// controllers/bookingController.js
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/helpers');
const { generateQRCode } = require('../utils/qrCodeGenerator');
const { sendBookingConfirmation } = require('../utils/smsService');

// Get all bookings (admin only)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', '-password')
      .populate({
        path: 'bus',
        populate: {
          path: 'route',
          populate: {
            path: 'stops'
          }
        }
      });

    return successResponse(res, 'Bookings fetched successfully', bookings);
  } catch (error) {
    return errorResponse(res, 'Error fetching bookings', 500, error);
  }
};

// Get bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'bus',
        populate: {
          path: 'route',
          populate: {
            path: 'stops'
          }
        }
      })
      .sort({ bookingDate: -1 });

    return successResponse(res, 'User bookings fetched successfully', bookings);
  } catch (error) {
    return errorResponse(res, 'Error fetching user bookings', 500, error);
  }
};

// Get a single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', '-password')
      .populate({
        path: 'bus',
        populate: {
          path: 'route',
          populate: {
            path: 'stops'
          }
        }
      });

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to access this booking', 403);
    }

    return successResponse(res, 'Booking fetched successfully', booking);
  } catch (error) {
    return errorResponse(res, 'Error fetching booking', 500, error);
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { 
      busId, journeyDate, source, destination, seats, 
      passengers, contactEmail, contactPhone, fare 
    } = req.body;

    if (!busId || !journeyDate || !source || !destination || !seats || !passengers || !contactPhone) {
      return errorResponse(res, 'Please provide all required booking details', 400);
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    const bookingData = {
      user: req.user.id,
      bus: busId,
      journeyDate: new Date(journeyDate),
      source,
      destination,
      seats,
      passengers,
      contactEmail: contactEmail || req.user.email,
      contactPhone,
      fareAmount: fare,
      paymentStatus: 'pending',
      bookingDate: new Date()
    };

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    const qrCodeData = `IBBPS|BID:${newBooking._id}|JD:${journeyDate}|S:${seats.join(',')}`;
    const qrCode = await generateQRCode(qrCodeData);

    newBooking.qrCode = qrCode;
    await newBooking.save();

    try {
      await sendBookingConfirmation(contactPhone, newBooking._id, journeyDate, source, destination);
    } catch (smsError) {
      console.error('SMS notification failed:', smsError);
    }

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('user', '-password')
      .populate({
        path: 'bus',
        populate: {
          path: 'route',
          populate: {
            path: 'stops'
          }
        }
      });

    return successResponse(res, 'Booking created successfully', populatedBooking, 201);
  } catch (error) {
    return errorResponse(res, 'Error creating booking', 500, error);
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to cancel this booking', 403);
    }

    const journeyDate = new Date(booking.journeyDate);
    const now = new Date();
    if (journeyDate < now) {
      return errorResponse(res, 'Cannot cancel past bookings', 400);
    }

    booking.status = 'cancelled';
    await booking.save();

    return successResponse(res, 'Booking cancelled successfully', booking);
  } catch (error) {
    return errorResponse(res, 'Error cancelling booking', 500, error);
  }
};

// Verify booking (placeholder)
exports.verifyBooking = async (req, res) => {
  return successResponse(res, 'Booking verification not implemented yet');
};
