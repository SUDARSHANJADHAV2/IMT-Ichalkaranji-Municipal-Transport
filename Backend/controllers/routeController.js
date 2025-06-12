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
    const { name, stops, distance, estimatedDuration, isActive, operationalStartTime, operationalEndTime } = req.body;
    
    if (!name) {
        return errorResponse(res, 'Route name is required.', 400);
    }
    if (!operationalStartTime || !operationalEndTime) {
        return errorResponse(res, 'Operational start and end times are required.', 400);
    }
    // Validate stops (Model also has this validation, but good to have here too)
    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return errorResponse(res, 'A route must have at least two stops.', 400);
    }
    
    // Verify all stops exist
    for (const stopId of stops) {
      const stopExists = await Stop.findById(stopId);
      if (!stopExists) {
        return errorResponse(res, `Stop with ID ${stopId} not found. Please ensure all stop IDs are valid.`, 404);
      }
    }
    
    const newRouteData = { name, stops, operationalStartTime, operationalEndTime };
    if (distance !== undefined) newRouteData.distance = parseFloat(distance);
    if (estimatedDuration !== undefined) newRouteData.estimatedDuration = parseInt(estimatedDuration, 10);
    if (isActive !== undefined) newRouteData.isActive = isActive;


    const newRoute = new Route(newRouteData);
    
    await newRoute.save();
    
    // Populate stops for response
    const populatedRoute = await Route.findById(newRoute._id).populate('stops', 'name location'); // Select specific fields from Stop
    
    return successResponse(res, 'Route created successfully', populatedRoute, 201);
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }
    if (error.code === 11000) { // Duplicate key error (e.g. for unique route name)
        return errorResponse(res, 'Route name already exists.', 400);
    }
    return errorResponse(res, 'Error creating route', 500, error.message);
  }
};

// Update a route
exports.updateRoute = async (req, res) => {
  try {
    const { name, stops, distance, estimatedDuration, isActive, operationalStartTime, operationalEndTime } = req.body;
    const routeId = req.params.id;

    // Check if route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return errorResponse(res, 'Route not found', 404);
    }
    
    // Validate stops if provided
    if (stops) {
      if (!Array.isArray(stops) || stops.length < 2) {
        return errorResponse(res, 'A route must have at least two stops.', 400);
      }
      // Verify all stops exist
      for (const stopId of stops) {
        const stopExists = await Stop.findById(stopId);
        if (!stopExists) {
          return errorResponse(res, `Stop with ID ${stopId} not found. Please ensure all stop IDs are valid.`, 404);
        }
      }
      route.stops = stops;
    }

    if (name) route.name = name;
    if (distance !== undefined) route.distance = parseFloat(distance);
    if (estimatedDuration !== undefined) route.estimatedDuration = parseInt(estimatedDuration, 10);
    if (isActive !== undefined) route.isActive = isActive;
    if (operationalStartTime) route.operationalStartTime = operationalStartTime;
    if (operationalEndTime) route.operationalEndTime = operationalEndTime;
    
    await route.save();
    
    const updatedPopulatedRoute = await Route.findById(routeId).populate('stops', 'name location');

    return successResponse(res, 'Route updated successfully', updatedPopulatedRoute);
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }
     if (error.code === 11000) { // Duplicate key error (e.g. for unique route name)
        return errorResponse(res, 'Route name already exists.', 400);
    }
    return errorResponse(res, 'Error updating route', 500, error.message);
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