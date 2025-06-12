const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  name: { // e.g., "City Center Loop", "University Express"
    type: String,
    required: [true, 'Route name is required.'],
    trim: true,
    unique: true
  },
  stops: [{ // Array of Stop ObjectIds, defining the sequence of stops
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  }],
  distance: { // Optional: Total distance of the route in kilometers
    type: Number,
    min: [0, 'Distance cannot be negative.']
  },
  estimatedDuration: { // Optional: Estimated duration of the route in minutes
    type: Number,
    min: [0, 'Duration cannot be negative.']
  },
  operationalStartTime: { // e.g., "06:00 AM"
    type: String,
    required: [true, 'Please specify the operational start time for the route (e.g., HH:MM AM/PM)'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/i, 'Invalid time format. Use HH:MM AM/PM.']
  },
  operationalEndTime: { // e.g., "10:00 PM"
    type: String,
    required: [true, 'Please specify the operational end time for the route (e.g., HH:MM AM/PM)'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/i, 'Invalid time format. Use HH:MM AM/PM.']
  },
  isActive: {
    type: Boolean,
    default: true
  }
  // averageStopTime can be added later if needed for more precise calculations in busController
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Validate that there are at least two stops in the route
RouteSchema.path('stops').validate(function (value) {
  return value && value.length >= 2;
}, 'A route must have at least two stops.');


module.exports = mongoose.model('Route', RouteSchema);
