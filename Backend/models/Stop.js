// models/Stop.js
const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide stop name'],
    unique: true,
    trim: true
  },
  location: {
    lat: Number,
    lng: Number
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stop', StopSchema);