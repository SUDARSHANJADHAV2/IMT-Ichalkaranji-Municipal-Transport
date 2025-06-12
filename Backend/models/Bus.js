const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide a bus number'],
    unique: true,
    trim: true
  },
  busName: { // Optional descriptive name for the bus
    type: String,
    trim: true
  },
  busType: {
    type: String,
    required: [true, 'Please specify the bus type'],
    enum: ['Ordinary', 'Express', 'AC', 'Sleeper', 'Semi-Sleeper'], // Added more types from admin UI
    default: 'Ordinary'
  },
  capacity: { // Total seating capacity
    type: Number,
    required: [true, 'Please provide the bus capacity'],
    min: [10, 'Capacity seems too low'] // Example minimum
  },
  route: { // The primary route this bus usually serves
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Please assign a route to this bus']
  },
  fare: { // This is the crucial field for fare calculation.
          // Interpretation: Base fare per stop-segment on its assigned route.
    type: Number,
    required: [true, 'Please add a base fare for the bus (per stop-segment)'],
    min: [0, 'Fare cannot be negative']
  },
  features: [{ // Array of strings describing features, e.g., "WiFi", "GPS", "Charging Port"
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Bus', BusSchema);
