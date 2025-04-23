const mongoose = require('mongoose');

const PassApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Please provide age']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please provide gender']
  },
  category: {
    type: String,
    enum: ['student', 'senior', 'regular', 'disabled'],
    required: [true, 'Please provide category']
  },
  mobile: {
    type: String,
    required: [true, 'Please provide mobile number'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please provide address']
  },
  source: {
    type: String,
    required: [true, 'Please provide source location']
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination location']
  },
  validityPeriod: {
    type: Number,
    enum: [1, 3, 6, 12], // Number of months
    required: [true, 'Please provide validity period']
  },
  aadhaarDocument: {
    type: String,
    required: [true, 'Please upload Aadhaar document']
  },
  photo: {
    type: String
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'],
    default: 'pending'
  },
  verificationOTP: {
    type: String
  },
  verificationOTPExpire: {
    type: Date
  },
  isOTPVerified: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PassApplication', PassApplicationSchema);