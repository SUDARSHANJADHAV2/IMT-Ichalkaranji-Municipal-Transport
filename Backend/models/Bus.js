const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide a bus number'],
    unique: true,
    trim: true
  },
  busName: {
    type: String,
    required: [true, 'Please provide a bus name'],
    trim: true
  },
  busType: {
    type: String,
    enum: ['ordinary', 'express', 'ac'],
    default: 'ordinary'
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please provide the total number of seats'],
    default: 40
  },
  seatLayout: {
    type: Object,
    default: {
      rows: 10,
      seatsPerRow: 4,
      hasAisle: true
    }
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

module.exports = mongoose.model('Bus', BusSchema);
