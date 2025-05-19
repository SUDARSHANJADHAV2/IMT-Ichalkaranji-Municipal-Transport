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
    const { name, location, description, coordinates } = req.body;
    
    // Check if stop with same name already exists
    const existingStop = await Stop.findOne({ name });
    if (existingStop) {
      return errorResponse(res, 'Stop with this name already exists', 400);
    }
    
    const newStop = new Stop({
      name,
      location,
      description,
      coordinates
    });
    
    await newStop.save();
    return successResponse(res, 'Stop created successfully', newStop, 201);
  } catch (error) {
    return errorResponse(res, 'Error creating stop', 500, error);
  }
};

// Update a stop
exports.updateStop = async (req, res) => {
  try {
    const { name, location, description, coordinates } = req.body;
    
    // Check if stop exists
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return errorResponse(res, 'Stop not found', 404);
    }
    
    // Check if updated name already exists for another stop
    if (name && name !== stop.name) {
      const existingStop = await Stop.findOne({ name });
      if (existingStop) {
        return errorResponse(res, 'Stop with this name already exists', 400);
      }
    }
    
    const updatedStop = await Stop.findByIdAndUpdate(
      req.params.id,
      {
        name: name || stop.name,
        location: location || stop.location,
        description: description || stop.description,
        coordinates: coordinates || stop.coordinates
      },
      { new: true }
    );
    
    return successResponse(res, 'Stop updated successfully', updatedStop);
  } catch (error) {
    return errorResponse(res, 'Error updating stop', 500, error);
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