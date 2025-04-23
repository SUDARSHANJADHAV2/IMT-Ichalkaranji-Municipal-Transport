// models/Pass.js
const mongoose = require('mongoose');

const PassSchema = new mongoose.Schema({
  passId: {
    type: String,
    unique: true,
    required: true
  },
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
  validFrom: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  validUntil: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  aadhaarDocument: {
    type: String,
    required: [true, 'Please upload Aadhaar document']
  },
  photo: {
    type: String
  },
  amount: {
    type: Number,
    required: [true, 'Please provide pass amount']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  qrCode: {
    type: String
  },
  pdfPass: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique pass ID before saving
PassSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  // Generate a pass ID with format PASS-YYYYMM-XXXX
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                 (date.getMonth() + 1).toString().padStart(2, '0');
  
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  this.passId = `PASS-${dateStr}-${randomPart}`;
  
  next();
});

module.exports = mongoose.model('Pass', PassSchema);
