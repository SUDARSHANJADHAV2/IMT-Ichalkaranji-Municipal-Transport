const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required.'],
    unique: true,
    trim: true
  },
  address: { // Optional descriptive address
    type: String,
    trim: true
  },
  location: { // GeoJSON Point for coordinates
    type: {
      type: String,
      enum: ['Point'], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number], // Array of numbers for longitude and latitude [lng, lat]
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Custom validator for coordinates based on type
StopSchema.path('location.coordinates').validate(function(value) {
  // If location.type is 'Point', then coordinates must be an array of 2 numbers.
  // Otherwise, this validation is not applicable (e.g. location is not set or type is different)
  if (this.location && this.location.type === 'Point') {
    return Array.isArray(value) && value.length === 2 &&
           typeof value[0] === 'number' && typeof value[1] === 'number';
  }
  return true; // Pass validation if location.type is not 'Point' or location is not set
}, 'If location type is "Point", coordinates must be an array of two numbers [longitude, latitude].');

// Pre-save middleware to ensure location.type is set if coordinates are provided,
// and to nullify location if coordinates are empty/invalid but type was Point.
StopSchema.pre('save', function(next) {
  if (this.location && this.location.coordinates && this.location.coordinates.length === 2) {
    if (!this.location.type) {
      this.location.type = 'Point'; // Default to 'Point' if coordinates exist but type doesn't
    }
  } else if (this.location && this.location.type === 'Point') {
    // If type is Point but coordinates are invalid/missing, this would fail validation.
    // If coordinates are intentionally empty, location itself should be undefined.
    this.location = undefined;
  } else if (this.location && (!this.location.coordinates || this.location.coordinates.length === 0)) {
    // If coordinates are empty or not an array, make the whole location field undefined
    this.location = undefined;
  }
  next();
});

// Optional: Add 2dsphere index for geospatial queries if you plan to use them frequently
// StopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', StopSchema);
