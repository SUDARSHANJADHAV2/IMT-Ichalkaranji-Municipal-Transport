// controllers/routeController.js
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const { errorResponse, successResponse } = require('../utils/helpers');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('stops');
    return successResponse(res, 'Routes fetched successfully', routes);
  } catch (error) {
    return errorResponse(res, 'Error fetching routes', 500, error);
  }
};

// Get a single route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('stops');
    
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    return successResponse(res, 'Route fetched successfully', route);
  } catch (error) {
    return errorResponse(res, 'Error fetching route', 500, error);
  }
};

// Create a new route
exports.createRoute = async (req, res) => {
  try {
    const { name, description, stops } = req.body;
    
    // Validate stops
    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return errorResponse(res, 'At least two stops are required', 400);
    }
    
    // Verify all stops exist
    for (const stopId of stops) {
      const stopExists = await Stop.findById(stopId);
      if (!stopExists) {
        return errorResponse(res, `Stop with ID ${stopId} not found`, 404);
      }
    }
    
    const newRoute = new Route({
      name,
      description,
      stops
    });
    
    await newRoute.save();
    
    // Populate stops for response
    const populatedRoute = await Route.findById(newRoute._id).populate('stops');
    
    return successResponse(res, 'Route created successfully', populatedRoute, 201);
  } catch (error) {
    return errorResponse(res, 'Error creating route', 500, error);
  }
};

// Update a route
exports.updateRoute = async (req, res) => {
  try {
    const { name, description, stops } = req.body;
    
    // Check if route exists
    const route = await Route.findById(req.params.id);
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    // Validate stops if provided
    if (stops) {
      if (!Array.isArray(stops) || stops.length < 2) {
        return errorResponse(res, 'At least two stops are required', 400);
      }
      
      // Verify all stops exist
      for (const stopId of stops) {
        const stopExists = await Stop.findById(stopId);
        if (!stopExists) {
          return errorResponse(res, `Stop with ID ${stopId} not found`, 404);
        }
      }
    }
    
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      {
        name: name || route.name,
        description: description || route.description,
        stops: stops || route.stops
      },
      { new: true }
    ).populate('stops');
    
    return successResponse(res, 'Route updated successfully', updatedRoute);
  } catch (error) {
    return errorResponse(res, 'Error updating route', 500, error);
  }
};

// Delete a route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    await Route.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Route deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting route', 500, error);
  }
};

// Add a stop to a route
exports.addStopToRoute = async (req, res) => {
  try {
    const { stopId, position } = req.body;
    
    // Check if route exists
    const route = await Route.findById(req.params.id);
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    // Check if stop exists
    const stop = await Stop.findById(stopId);
    if (!stop) {
      return errorResponse(res, 'Stop not found', 404);
    }
    
    // Check if stop already exists in route
    if (route.stops.includes(stopId)) {
      return errorResponse(res, 'Stop already exists in route', 400);
    }
    
    // Add stop at specified position or at the end
    const stops = [...route.stops];
    if (position !== undefined && position >= 0 && position <= stops.length) {
      stops.splice(position, 0, stopId);
    } else {
      stops.push(stopId);
    }
    
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { stops },
      { new: true }
    ).populate('stops');
    
    return successResponse(res, 'Stop added to route successfully', updatedRoute);
  } catch (error) {
    return errorResponse(res, 'Error adding stop to route', 500, error);
  }
};

// Remove a stop from a route
exports.removeStopFromRoute = async (req, res) => {
  try {
    const { stopId } = req.params;
    
    // Check if route exists
    const route = await Route.findById(req.params.id);
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    // Check if stop exists in route
    if (!route.stops.includes(stopId)) {
      return errorResponse(res, 'Stop not found in route', 404);
    }
    
    // Remove stop
    const stops = route.stops.filter(stop => stop.toString() !== stopId);
    
    // Ensure route still has at least 2 stops
    if (stops.length < 2) {
      return errorResponse(res, 'Route must have at least two stops', 400);
    }
    
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { stops },
      { new: true }
    ).populate('stops');
    
    return successResponse(res, 'Stop removed from route successfully', updatedRoute);
  } catch (error) {
    return errorResponse(res, 'Error removing stop from route', 500, error);
  }
};