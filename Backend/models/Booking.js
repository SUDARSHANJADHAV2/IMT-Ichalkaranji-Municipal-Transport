const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: { // Store the specific route taken, useful for historical data even if bus route changes
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  sourceStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  destinationStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  numberOfSeats: {
    type: Number,
    required: true,
    min: [1, 'Number of seats must be at least 1']
  },
  totalAmount: { // Calculated fare for the booking
    type: Number,
    required: true
  },
  journeyDate: { // The specific date of the journey
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  qrCodeData: { // String data to be encoded into QR code (e.g., booking ID)
    type: String
  },
  paymentDetails: { // Optional, for payment gateway info
    paymentId: String,
    orderId: String,
    status: String // Status from payment gateway e.g. 'captured', 'failed'
  }
  // bookingDate is handled by timestamps.createdAt
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Optional: If you still want a custom human-readable booking ID in addition to _id
// BookingSchema.pre('save', async function(next) {
//   if (this.isNew && !this.bookingIdCustom) { // Check for a custom ID field if you add one
//     const date = new Date();
//     const dateStr = date.getFullYear().toString() +
//                    (date.getMonth() + 1).toString().padStart(2, '0') +
//                    date.getDate().toString().padStart(2, '0');
//     const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase(); // More unique random part
//     this.bookingIdCustom = `BK-${dateStr}-${randomPart}`;
//   }
//   next();
// });

module.exports = mongoose.model('Booking', BookingSchema);
