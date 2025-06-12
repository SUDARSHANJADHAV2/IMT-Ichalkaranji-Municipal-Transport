const mongoose = require('mongoose');

const PassSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passApplication: { // Link to the application that resulted in this pass
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PassApplication',
    required: true
  },
  passType: { // Type of pass (e.g., student, senior_citizen), copied from application
    type: String,
    required: true
  },
  duration: { // Duration of the pass (e.g., monthly, quarterly), copied from application
    type: String,
    required: true
  },
  validFrom: { // Date when the pass becomes valid
    type: Date,
    required: true
  },
  validUntil: { // Date when the pass expires
    type: Date,
    required: true
  },
  qrCodeData: { // Unique string data for QR code (e.g., based on this pass's _id)
    type: String,
    required: true,
    unique: true // Ensure QR code data is unique
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'], // 'cancelled' can be used if revoked by admin
    default: 'active'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Pre-save hook to generate qrCodeData from the _id if not provided
// This ensures qrCodeData is set after _id is available but before final save.
PassSchema.pre('save', function(next) {
  if (this.isNew && !this.qrCodeData) {
    this.qrCodeData = `IBBPS-PASS-${this._id.toString()}`;
  }
  next();
});


module.exports = mongoose.model('Pass', PassSchema);
