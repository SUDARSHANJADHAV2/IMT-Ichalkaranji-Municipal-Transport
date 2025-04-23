const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passengerName: {
    type: String,
    required: [true, 'Please provide passenger name'],
    trim: true
  },
  passengerEmail: {
    type: String,
    required: [true, 'Please provide passenger email'],
    trim: true
  },
  passengerPhone: {
    type: String,
    required: [true, 'Please provide passenger phone'],
    trim: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  source: {
    type: String,
    required: [true, 'Please provide source location'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination location'],
    trim: true
  },
  journeyDate: {
    type: Date,
    required: [true, 'Please provide journey date']
  },
  departureTime: {
    type: String,
    required: [true, 'Please provide departure time']
  },
  arrivalTime: {
    type: String,
    required: [true, 'Please provide arrival time']
  },
  seats: {
    type: [String],
    required: [true, 'Please select at least one seat']
  },
  seatCount: {
    type: Number,
    required: true
  },
  totalFare: {
    type: Number,
    required: [true, 'Please provide total fare']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking'],
    default: 'cash'
  },
  transactionId: {
    type: String
  },
  qrCode: {
    type: String
  },
  pdfTicket: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique booking ID before saving
BookingSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  // Generate a booking ID with format BK-YYYYMMDD-XXXX
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
                 (date.getMonth() + 1).toString().padStart(2, '0') +
                 date.getDate().toString().padStart(2, '0');
  
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  this.bookingId = `BK-${dateStr}-${randomPart}`;
  
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
