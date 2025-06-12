// controllers/bookingController.js
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const User = require('../models/User');
const Route = require('../models/Route'); // Added Route
const Stop = require('../models/Stop');   // Added Stop
const { errorResponse, successResponse } = require('../utils/helpers');
// Removed: const { generateQRCode } = require('../utils/qrCodeGenerator');
// Removed: const { sendBookingConfirmation } = require('../utils/smsService');

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
      busId,
      sourceStopId,
      destinationStopId,
      numberOfSeats,
      journeyDate,
      // totalAmount: clientCalculatedAmount // We will recalculate this on backend
    } = req.body;

    const userId = req.user.id; // Assuming protect middleware adds user to req

    // Validate required fields
    if (!busId || !sourceStopId || !destinationStopId || !numberOfSeats || !journeyDate) {
      return errorResponse(res, 'Please provide all required booking details (busId, sourceStopId, destinationStopId, numberOfSeats, journeyDate)', 400);
    }

    if (isNaN(parseInt(numberOfSeats, 10)) || parseInt(numberOfSeats, 10) <= 0) {
        return errorResponse(res, 'Number of seats must be a positive integer.', 400);
    }
    const parsedNumberOfSeats = parseInt(numberOfSeats, 10);

    // Fetch Bus and related Route & Stops
    const bus = await Bus.findById(busId).populate({
      path: 'route',
      populate: { path: 'stops' }
    });

    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }
    if (!bus.route) {
        return errorResponse(res, 'Route details not found for this bus', 404);
    }
    if (!bus.isActive) {
        return errorResponse(res, 'This bus is currently not active.', 400);
    }

    const routeStops = bus.route.stops;
    const sourceStopIndex = routeStops.findIndex(stop => stop._id.toString() === sourceStopId);
    const destinationStopIndex = routeStops.findIndex(stop => stop._id.toString() === destinationStopId);

    if (sourceStopIndex === -1) {
      return errorResponse(res, 'Source stop not found on this bus route', 404);
    }
    if (destinationStopIndex === -1) {
      return errorResponse(res, 'Destination stop not found on this bus route', 404);
    }
    if (sourceStopIndex >= destinationStopIndex) {
      return errorResponse(res, 'Source stop must be before destination stop on the route', 400);
    }

    // Calculate fare (similar to busController.searchBuses logic)
    const stopsInBetween = destinationStopIndex - sourceStopIndex;
    const calculatedTotalAmount = (bus.fare || 0) * stopsInBetween * parsedNumberOfSeats;

    // TODO: Implement seat availability check in future enhancement if Bus model tracks it.
    // For now, we assume seats are available.

    const newBooking = new Booking({
      user: userId,
      bus: busId,
      route: bus.route._id,
      sourceStop: sourceStopId,
      destinationStop: destinationStopId,
      numberOfSeats: parsedNumberOfSeats,
      totalAmount: calculatedTotalAmount,
      journeyDate: new Date(journeyDate), // Ensure it's a Date object
      status: 'confirmed', // Default to 'confirmed' as per subtask
      // qrCodeData will be set after saving to use the booking's _id
    });

    await newBooking.save();

    // Set qrCodeData to the booking's _id and save again
    newBooking.qrCodeData = newBooking._id.toString();
    await newBooking.save();

    // Populate necessary fields for the response
    const populatedBooking = await Booking.findById(newBooking._id)
        .populate('user', 'firstName lastName email') // Updated to use firstName, lastName
        .populate({
            path: 'bus',
            select: 'busNumber busType fare route', // Select fields from bus
            populate: {
                path: 'route',
                select: 'name', // Select fields from route
                populate: {
                    path: 'stops',
                    select: 'name arrivalTime departureTime' // Select fields from stops
                }
            }
        })
        .populate('sourceStop', 'name') // Populate source stop name
        .populate('destinationStop', 'name'); // Populate destination stop name


    return successResponse(res, 'Booking created successfully and confirmed', populatedBooking, 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    return errorResponse(res, 'Error creating booking: ' + error.message, 500);
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

// @desc    Get all bookings (Admin - with pagination and specific population)
// @route   GET /api/bookings/all
// @access  Admin
exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 per page
    const skip = (page - 1) * limit;

    const totalItems = await Booking.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email') // Select specific fields from User
      .populate({
        path: 'bus',
        select: 'busNumber busType', // Select specific fields from Bus
        populate: {
          path: 'route', // Populate route within bus
          select: 'name' // Select specific fields from Route
        }
      })
      .populate('sourceStop', 'name') // Select name from source Stop
      .populate('destinationStop', 'name') // Select name from destination Stop
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit);

    if (!bookings) {
        // This case might not be hit if totalItems is 0, but good for robustness
        return successResponse(res, 'No bookings found.', { data: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, limit } });
    }

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      limit: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // Using structured response similar to searchBuses
    return res.status(200).json({
        success: true,
        message: 'All bookings fetched successfully.',
        data: bookings,
        pagination: pagination
    });

  } catch (error) {
    console.error('Error fetching all bookings for admin:', error);
    return errorResponse(res, 'Error fetching all bookings for admin', 500, error.message);
  }
};
