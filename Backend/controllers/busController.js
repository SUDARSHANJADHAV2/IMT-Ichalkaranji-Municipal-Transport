// controllers/busController.js
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const { errorResponse, successResponse } = require('../utils/helpers');

// Get all buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate('route');
    return successResponse(res, 'Buses fetched successfully', buses);
  } catch (error) {
    return errorResponse(res, 'Error fetching buses', 500, error);
  }
};

// Get a single bus by ID
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate('route')
      .populate({
        path: 'route',
        populate: { path: 'stops' }
      });

    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    return successResponse(res, 'Bus fetched successfully', bus);
  } catch (error) {
    return errorResponse(res, 'Error fetching bus', 500, error);
  }
};

// Create a new bus
exports.createBus = async (req, res) => {
  try {
    const { busNumber, busType, capacity, route, fare, features } = req.body;

    // Verify route exists
    const routeExists = await Route.findById(route);
    if (!routeExists) {
      return errorResponse(res, 'Route not found', 404);
    }

    const newBus = new Bus({
      busNumber,
      busType,
      capacity,
      route,
      fare,
      features: features || []
    });

    await newBus.save();
    return successResponse(res, 'Bus created successfully', newBus, 201);
  } catch (error) {
    return errorResponse(res, 'Error creating bus', 500, error);
  }
};

// Update a bus
exports.updateBus = async (req, res) => {
  try {
    const { busNumber, busType, capacity, route, fare, features, isActive } = req.body;
    
    // Check if bus exists
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    // Verify route exists if provided
    if (route) {
      const routeExists = await Route.findById(route);
      if (!routeExists) {
        return errorResponse(res, 'Route not found', 404);
      }
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        busNumber: busNumber || bus.busNumber,
        busType: busType || bus.busType,
        capacity: capacity || bus.capacity,
        route: route || bus.route,
        fare: fare || bus.fare,
        features: features || bus.features,
        isActive: isActive !== undefined ? isActive : bus.isActive
      },
      { new: true }
    ).populate('route');

    return successResponse(res, 'Bus updated successfully', updatedBus);
  } catch (error) {
    return errorResponse(res, 'Error updating bus', 500, error);
  }
};

// Delete a bus
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return errorResponse(res, 'Bus not found', 404);
    }

    await Bus.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Bus deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Error deleting bus', 500, error);
  }
};

// Search buses by source and destination
exports.searchBuses = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    
    if (!source || !destination) {
      return errorResponse(res, 'Source and destination are required', 400);
    }

    // Find routes that contain both source and destination stops
    const routes = await Route.find().populate('stops');
    
    // Filter routes that have both source and destination
    const filteredRoutes = routes.filter(route => {
      const stopNames = route.stops.map(stop => stop.name.toLowerCase());
      return (
        stopNames.includes(source.toLowerCase()) && 
        stopNames.includes(destination.toLowerCase()) &&
        // Make sure source comes before destination in route order
        stopNames.indexOf(source.toLowerCase()) < stopNames.indexOf(destination.toLowerCase())
      );
    });

    const routeIds = filteredRoutes.map(route => route._id);
    
    // Find buses that serve these routes
    const buses = await Bus.find({
      route: { $in: routeIds },
      isActive: true
    }).populate({
      path: 'route',
      populate: { path: 'stops' }
    });

    // Calculate journey info for each bus
    const busesWithJourneyInfo = buses.map(bus => {
      const route = bus.route;
      const stops = route.stops;
      
      // Find indices of source and destination
      const sourceIndex = stops.findIndex(
        stop => stop.name.toLowerCase() === source.toLowerCase()
      );
      const destinationIndex = stops.findIndex(
        stop => stop.name.toLowerCase() === destination.toLowerCase()
      );
      
      // Calculate duration (for demo, using 10 minutes per stop as average)
      const stopsInBetween = destinationIndex - sourceIndex;
      const durationMinutes = stopsInBetween * 10;
      
      // Calculate fare based on distance
      const segmentFare = bus.fare * stopsInBetween;
      
      return {
        ...bus._doc,
        journeyInfo: {
          source: stops[sourceIndex],
          destination: stops[destinationIndex],
          departureTime: stops[sourceIndex].departureTime || '07:30 AM', // Default if not set
          arrivalTime: stops[destinationIndex].arrivalTime || '08:00 AM', // Default if not set
          duration: durationMinutes,
          fare: segmentFare,
          date: date || new Date().toISOString().split('T')[0]
        }
      };
    });

    return successResponse(res, 'Buses found successfully', busesWithJourneyInfo);
  } catch (error) {
    return errorResponse(res, 'Error searching buses', 500, error);
  }
};

// Get bus schedules (for specific route and date)
exports.getBusSchedules = async (req, res) => {
  try {
    const { routeId, date } = req.query;
    
    const query = {};
    if (routeId) {
      query.route = routeId;
    }
    
    const buses = await Bus.find(query)
      .populate('route')
      .populate({
        path: 'route',
        populate: { path: 'stops' }
      });
    
    // Format the schedule data
    const schedules = buses.map(bus => ({
      busId: bus._id,
      busNumber: bus.busNumber,
      busType: bus.busType,
      routeName: bus.route.name,
      departureTime: bus.route.stops[0].departureTime || '06:00 AM', // First stop
      arrivalTime: bus.route.stops[bus.route.stops.length - 1].arrivalTime || '07:00 AM', // Last stop
      date: date || new Date().toISOString().split('T')[0],
      availableSeats: bus.capacity,
      fare: bus.fare
    }));
    
    return successResponse(res, 'Schedules fetched successfully', schedules);
  } catch (error) {
    return errorResponse(res, 'Error fetching schedules', 500, error);
  }
};