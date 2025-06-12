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

// Helper function to convert time string (e.g., "07:30 AM") to a sortable numeric value
function convertTimeToSortableValue(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr.toLowerCase() === 'n/a') {
    return Infinity; // Treat 'N/A' or invalid as "last"
  }
  const [time, period] = timeStr.split(' ');
  if (!time || !period) {
    return Infinity; // Invalid format
  }

  let [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return Infinity; // Invalid time components
  }

  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) { // Midnight case: 12 AM is 00:00
    hours = 0;
  }
  return hours * 60 + minutes;
}

// --- Helper Functions for searchBuses Refactoring ---

async function findMatchingRoutes(source, destination) {
  const routes = await Route.find().populate('stops');
  const lowerSource = source.toLowerCase();
  const lowerDestination = destination.toLowerCase();

  return routes.filter(route => {
    const stopNames = route.stops.map(stop => stop.name.toLowerCase());
    const sourceIndexInRoute = stopNames.indexOf(lowerSource);
    const destinationIndexInRoute = stopNames.indexOf(lowerDestination);
    return sourceIndexInRoute !== -1 && destinationIndexInRoute !== -1 && sourceIndexInRoute < destinationIndexInRoute;
  });
}

async function fetchBusesForRoutes(routeIds, busType) {
  let busQueryConditions = {
    route: { $in: routeIds },
    isActive: true
  };
  if (busType) {
    const busTypesArray = busType.split(',').map(bt => bt.trim()).filter(bt => bt);
    if (busTypesArray.length > 0) {
      busQueryConditions.busType = { $in: busTypesArray };
    }
  }
  return Bus.find(busQueryConditions).populate({
    path: 'route',
    populate: { path: 'stops' }
  });
}

function calculateJourneyDetails(buses, source, destination, date) {
  const lowerSource = source.toLowerCase();
  const lowerDestination = destination.toLowerCase();

  return buses.map(bus => {
    const route = bus.route;
    const stops = route.stops;
    const sourceIndex = stops.findIndex(stop => stop.name.toLowerCase() === lowerSource);
    const destinationIndex = stops.findIndex(stop => stop.name.toLowerCase() === lowerDestination);

    if (sourceIndex === -1 || destinationIndex === -1 || sourceIndex >= destinationIndex) {
      return null; // Should not happen if routes are pre-filtered correctly
    }

    const stopsInBetween = destinationIndex - sourceIndex;
    const durationMinutes = stopsInBetween * (bus.route.averageStopTime || 10); // Assuming averageStopTime might be added to Route model
    const segmentFare = (bus.fare || 0) * stopsInBetween;

    // Get route operational times as fallbacks or general info
    const routeOpStart = bus.route.operationalStartTime || 'N/A';
    const routeOpEnd = bus.route.operationalEndTime || 'N/A';

    // Since Stop model does not have route-specific departure/arrival times,
    // we use route operational start time as a general departure indicator for the first segment.
    // For subsequent segments or a more precise time, this model is insufficient.
    // Arrival time is also a rough estimate or general indicator.
    let estimatedSegmentDepartureTime = 'N/A';
    let estimatedSegmentArrivalTime = 'N/A';

    if (sourceIndex === 0) { // If it's the first stop of the route for this segment
        estimatedSegmentDepartureTime = routeOpStart;
    }
    // A very rough arrival estimation - this is not ideal without per-stop schedule data
    // For simplicity, we might just pass routeOpEnd or keep 'N/A'
    // if (destinationIndex === (stops.length -1)) { // If it's the last stop of the route for this segment
    //    estimatedSegmentArrivalTime = routeOpEnd;
    // }


    return {
      ...bus._doc, // Spread bus document properties. Ensure busId is available via _id.
      // busId: bus._id, // Explicitly ensure busId is present if needed by frontend from top level
      // route: { _id: bus.route._id, name: bus.route.name }, // Send essential route info
      journeyInfo: {
        sourceStop: { _id: stops[sourceIndex]._id, name: stops[sourceIndex].name },
        destinationStop: { _id: stops[destinationIndex]._id, name: stops[destinationIndex].name },
        departureTime: estimatedSegmentDepartureTime, // Approximation
        arrivalTime: estimatedSegmentArrivalTime,     // Approximation or 'N/A'
        duration: durationMinutes,
        fare: segmentFare,
        date: date, // The specific date of travel from search query
        routeOperationalStartTime: routeOpStart, // For frontend to display overall route timings
        routeOperationalEndTime: routeOpEnd
      }
    };
  }).filter(busInfo => busInfo !== null);
}

function applyPriceFilter(busesWithJourneyInfo, maxPrice) {
  if (maxPrice) {
    const numericMaxPrice = parseFloat(maxPrice);
    if (!isNaN(numericMaxPrice)) {
      return busesWithJourneyInfo.filter(
        busInfo => busInfo.journeyInfo.fare <= numericMaxPrice
      );
    }
  }
  return busesWithJourneyInfo;
}

function sortBuses(busesWithJourneyInfo, sortBy, sortOrder = 'asc') {
  if (sortBy && busesWithJourneyInfo.length > 0) {
    busesWithJourneyInfo.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'fare':
          valA = a.journeyInfo.fare;
          valB = b.journeyInfo.fare;
          break;
        case 'duration':
          valA = a.journeyInfo.duration;
          valB = b.journeyInfo.duration;
          break;
        case 'departure':
          valA = convertTimeToSortableValue(a.journeyInfo.departureTime);
          valB = convertTimeToSortableValue(b.journeyInfo.departureTime);
          break;
        default: return 0;
      }
      if (valA === undefined || valA === null) valA = Infinity;
      if (valB === undefined || valB === null) valB = Infinity;
      if (valA < valB) return sortOrder.toLowerCase() === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.toLowerCase() === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return busesWithJourneyInfo;
}

function paginateResults(busesWithJourneyInfo, page, limit) {
  const totalItems = busesWithJourneyInfo.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedItems = busesWithJourneyInfo.slice(startIndex, startIndex + limit);
  return {
    paginatedItems,
    paginationInfo: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      limit: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

// --- Refactored searchBuses ---
exports.searchBuses = async (req, res) => {
  try {
    // 1. Extract and validate parameters
    const { source, destination, date, busType, maxPrice: maxPriceStr,
            sortBy, sortOrder: querySortOrder,
            page: queryPage, limit: queryLimit } = req.query;

    if (!source || !destination) return errorResponse(res, 'Source and destination are required', 400);
    if (!date) return errorResponse(res, 'Date is required', 400);
    
    const numericMaxPrice = maxPriceStr ? parseFloat(maxPriceStr) : null;
    const page = parseInt(queryPage, 10) || 1;
    const limit = parseInt(queryLimit, 10) || 5; // Default to 5 to match frontend
    const sortOrder = querySortOrder || 'asc';

    // 2. Find matching routes
    const matchedRoutes = await findMatchingRoutes(source, destination);
    if (matchedRoutes.length === 0) {
      return res.status(200).json({
        success: true, message: 'No routes found for the given source and destination', data: [],
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, limit, hasNextPage: false, hasPrevPage: false }
      });
    }
    const routeIds = matchedRoutes.map(route => route._id);

    // 3. Fetch buses for these routes (initial filtering by busType)
    let buses = await fetchBusesForRoutes(routeIds, busType);

    // 4. Calculate journey details for each bus
    let busesWithJourneyInfo = calculateJourneyDetails(buses, source, destination, date);

    // 5. Apply post-fetch filters (maxPrice)
    if (numericMaxPrice !== null && !isNaN(numericMaxPrice)) {
        busesWithJourneyInfo = applyPriceFilter(busesWithJourneyInfo, numericMaxPrice);
    }
    
    // 6. Sort results
    busesWithJourneyInfo = sortBuses(busesWithJourneyInfo, sortBy, sortOrder);

    // 7. Paginate results
    const { paginatedItems, paginationInfo } = paginateResults(busesWithJourneyInfo, page, limit);

    // 8. Prepare and send response
    const message = paginationInfo.totalItems > 0
        ? (paginatedItems.length === 0 ? 'No buses found on this page.' : 'Buses found successfully')
        : 'No buses found matching your criteria.';

    return res.status(200).json({
      success: true,
      message,
      data: paginatedItems,
      pagination: paginationInfo
    });

  } catch (error) {
    console.error('Error searching buses:', error);
    return errorResponse(res, 'Error searching buses: ' + error.message, 500);
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