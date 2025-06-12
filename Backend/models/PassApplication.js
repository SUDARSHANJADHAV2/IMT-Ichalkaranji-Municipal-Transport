const mongoose = require('mongoose');

const PassApplicationSchema = new mongoose.Schema({
  user: { // User applying for the pass
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passType: { // Type of pass
    type: String,
    required: [true, 'Pass type is required'],
    enum: ['student', 'senior_citizen', 'general', 'disabled']
  },
  duration: { // Duration of the pass
    type: String,
    required: [true, 'Pass duration is required'],
    enum: ['monthly', 'quarterly', 'half_yearly', 'yearly']
  },
  firstName: { // Applicant's first name
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: { // Applicant's last name
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [5, 'Age must be at least 5'], // Example validation
    max: [120, 'Age must be reasonable'] // Example validation
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  email: { // Applicant's email (can be pre-filled from User)
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: { // Applicant's phone number for OTP and contact
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
    // Add regex validation for phone if needed, e.g., /^\d{10}$/ for Indian numbers
  },
  aadhaarCardUrl: { // URL of the uploaded Aadhaar card (from Cloudinary/local storage)
    type: String,
    required: [true, 'Aadhaar card URL is required']
  },
  status: {
    type: String,
    enum: ['pending_otp', 'pending_approval', 'approved', 'rejected'],
    default: 'pending_otp'
  },
  otp: { // Store HASHED OTP
    type: String
  },
  otpExpires: { // Expiry date/time for the OTP
    type: Date
  },
  rejectionReason: { // Reason if the application is rejected by an admin
    type: String,
    trim: true
  },
  // appliedOn is handled by timestamps.createdAt
  approvedBy: { // Admin user who approved the application
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  passId: { // Link to the actual Pass document once created
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pass'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('PassApplication', PassApplicationSchema);
