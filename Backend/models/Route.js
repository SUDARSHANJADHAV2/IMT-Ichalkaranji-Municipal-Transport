const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide stop name'],
    trim: true
  },
  arrivalTime: String,
  departureTime: String,
  distanceFromOrigin: {
    type: Number,
    default: 0
  },
  sequenceNumber: {
    type: Number,
    required: true
  },
  // Optional GPS coordinates for map display
  location: {
    lat: Number,
    lng: Number
  }
});

const RouteSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Please provide a route number'],
    unique: true,
    trim: true
  },
  routeName: {
    type: String,
    required: [true, 'Please provide a route name'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Please provide source location']
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination location']
  },
  distance: {
    type: Number,
    required: [true, 'Please provide route distance in km']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide route duration in minutes']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide base price']
  },
  stops: [StopSchema],
  buses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],
  schedules: [{
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus'
    },
    departureTime: String,
    arrivalTime: String,
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', RouteSchema);
