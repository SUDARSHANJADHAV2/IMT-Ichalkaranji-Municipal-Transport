// controllers/stopController.js
const Stop = require('../models/Stop');
const { errorResponse, successResponse } = require('../utils/helpers');

// Get all stops
exports.getAllStops = async (req, res) => {
  try {
    const stops = await Stop.find();
    return successResponse(res, 'Stops fetched successfully', stops);
  } catch (error) {
    return errorResponse(res, 'Error fetching stops', 500, error);
  }
};

// Get a single stop by ID
exports.getStopById = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    
    if (!stop) {
      return errorResponse(res, 'Stop not found', 404);
    }
    
    return successResponse(res, 'Stop fetched successfully', stop);
  } catch (error) {
    return errorResponse(res, 'Error fetching stop', 500, error);
  }
};

// Create a new stop
exports.createStop = async (req, res) => {
  try {
    const { name, address, longitude, latitude } = req.body;

    if (!name) {
      return errorResponse(res, 'Stop name is required.', 400);
    }

    let locationPayload;
    if (longitude !== undefined && latitude !== undefined) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      if (isNaN(lng) || isNaN(lat)) {
        return errorResponse(res, 'Invalid longitude or latitude values.', 400);
      }
      locationPayload = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    }

    const stopData = {
      name,
      address: address || undefined, // Store undefined if address is empty, so it's not set
      location: locationPayload,
    };

    const newStop = new Stop(stopData);
    await newStop.save();
    return successResponse(res, 'Stop created successfully', newStop, 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }
    if (error.code === 11000) { // Duplicate key error for 'name'
        return errorResponse(res, 'Stop with this name already exists.', 400);
    }
    console.error('Error creating stop:', error);
    return errorResponse(res, 'Error creating stop.', 500, error.message);
  }
};

// Update a stop
exports.updateStop = async (req, res) => {
  try {
    const { name, address, longitude, latitude } = req.body;
    const stopId = req.params.id;

    const stop = await Stop.findById(stopId);
    if (!stop) {
      return errorResponse(res, 'Stop not found', 404);
    }

    if (name) stop.name = name;
    if (address !== undefined) stop.address = address; // Allow setting address to empty string

    if (longitude !== undefined && latitude !== undefined) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      if (isNaN(lng) || isNaN(lat)) {
        return errorResponse(res, 'Invalid longitude or latitude values.', 400);
      }
      stop.location = {
        type: 'Point',
        coordinates: [lng, lat],
      };
    } else if (longitude === undefined && latitude === undefined && (typeof req.body.longitude !== 'undefined' || typeof req.body.latitude !== 'undefined')) {
      // If one is provided but not the other, or if they are explicitly set to null/empty to remove location
      stop.location = undefined;
    }


    await stop.save();
    return successResponse(res, 'Stop updated successfully', stop);
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }
    if (error.code === 11000) { // Duplicate key error for 'name'
        return errorResponse(res, 'Another stop with this name already exists.', 400);
    }
    console.error('Error updating stop:', error);
    return errorResponse(res, 'Error updating stop.', 500, error.message);
  }
};

// Delete a stop
exports.deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return errorResponse(res, 'Stop not found', 404);
    }
    
    await Stop.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Stop deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting stop', 500, error);
  }
};

// Search stops by name or location
exports.searchStops = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return errorResponse(res, 'Search query is required', 400);
    }
    
    const stops = await Stop.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    return successResponse(res, 'Stops found successfully', stops);
  } catch (error) {
    return errorResponse(res, 'Error searching stops', 500, error);
  }
};

// Get popular stops
exports.getPopularStops = async (req, res) => {
  try {
    // In a real application, this might be based on booking data
    // For now, just return all stops with a "popular" flag
    const popularStops = await Stop.find().limit(10);
    
    return successResponse(res, 'Popular stops fetched successfully', popularStops);
  } catch (error) {
    return errorResponse(res, 'Error fetching popular stops', 500, error);
  }
};