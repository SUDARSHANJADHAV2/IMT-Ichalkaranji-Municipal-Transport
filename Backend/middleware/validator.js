// middleware/validator.js
const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validate ObjectId format
 * @param {string} id - ObjectId to validate
 * @returns {boolean} - Whether the ID is valid
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Collection of validation rules for different endpoints
 */
const validationRules = {
  // User validation rules
  user: {
    create: [
      body('name').notEmpty().withMessage('Name is required').trim(),
      body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
      body('mobile').isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    login: [
      body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
      body('password').notEmpty().withMessage('Password is required')
    ],
    update: [
      body('name').optional().trim(),
      body('email').optional().isEmail().withMessage('Must be a valid email address').normalizeEmail(),
      body('mobile').optional().isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number')
    ],
    changePassword: [
      body('currentPassword').notEmpty().withMessage('Current password is required'),
      body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    ]
  },
  
  // Bus validation rules
  bus: {
    create: [
      body('busNumber').notEmpty().withMessage('Bus number is required').trim(),
      body('busType').isIn(['ordinary', 'express', 'ac']).withMessage('Invalid bus type'),
      body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
      body('amenities').optional().isArray().withMessage('Amenities must be an array')
    ],
    update: [
      body('busNumber').optional().trim(),
      body('busType').optional().isIn(['ordinary', 'express', 'ac']).withMessage('Invalid bus type'),
      body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
      body('amenities').optional().isArray().withMessage('Amenities must be an array')
    ],
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid bus ID format')
    ]
  },
  
  // Route validation rules
  route: {
    create: [
      body('routeNumber').notEmpty().withMessage('Route number is required').trim(),
      body('source').notEmpty().withMessage('Source is required').trim(),
      body('destination').notEmpty().withMessage('Destination is required').trim(),
      body('distance').isFloat({ min: 0.1 }).withMessage('Distance must be a positive number'),
      body('stops').isArray().withMessage('Stops must be an array'),
      body('stops.*.stopId').custom(isValidObjectId).withMessage('Invalid stop ID format'),
      body('stops.*.arrivalTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Arrival time must be in HH:MM format'),
      body('stops.*.departureTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Departure time must be in HH:MM format')
    ],
    update: [
      body('routeNumber').optional().trim(),
      body('source').optional().trim(),
      body('destination').optional().trim(),
      body('distance').optional().isFloat({ min: 0.1 }).withMessage('Distance must be a positive number'),
      body('stops').optional().isArray().withMessage('Stops must be an array'),
      body('stops.*.stopId').optional().custom(isValidObjectId).withMessage('Invalid stop ID format'),
      body('stops.*.arrivalTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Arrival time must be in HH:MM format'),
      body('stops.*.departureTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Departure time must be in HH:MM format')
    ],
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid route ID format')
    ],
    search: [
      query('source').notEmpty().withMessage('Source is required').trim(),
      query('destination').notEmpty().withMessage('Destination is required').trim(),
      query('date').optional().isDate().withMessage('Date must be in YYYY-MM-DD format')
    ]
  },
  
  // Stop validation rules
  stop: {
    create: [
      body('name').notEmpty().withMessage('Stop name is required').trim(),
      body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
      body('location.coordinates.0').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      body('location.coordinates.1').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      body('address').optional().trim()
    ],
    update: [
      body('name').optional().trim(),
      body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
      body('location.coordinates.0').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
      body('location.coordinates.1').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
      body('address').optional().trim()
    ],
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid stop ID format')
    ]
  },
  
  // Booking validation rules
  booking: {
    create: [
      body('busId').custom(isValidObjectId).withMessage('Invalid bus ID format'),
      body('routeId').custom(isValidObjectId).withMessage('Invalid route ID format'),
      body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
      body('travelDate').isDate().withMessage('Travel date must be in YYYY-MM-DD format'),
      body('sourceStop').custom(isValidObjectId).withMessage('Invalid source stop ID format'),
      body('destinationStop').custom(isValidObjectId).withMessage('Invalid destination stop ID format'),
      body('passengerDetails.*.name').notEmpty().withMessage('Passenger name is required').trim(),
      body('passengerDetails.*.age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
      body('passengerDetails.*.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender')
    ],
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid booking ID format')
    ],
    cancel: [
      param('id').custom(isValidObjectId).withMessage('Invalid booking ID format')
    ]
  },
  
  // Pass application validation rules
  passApplication: {
    create: [
      body('applicantName').notEmpty().withMessage('Applicant name is required').trim(),
      body('category').isIn(['student', 'senior', 'differentlyAbled', 'regular']).withMessage('Invalid category'),
      body('passType').isIn(['monthly', 'quarterly', 'halfyearly', 'yearly']).withMessage('Invalid pass type'),
      body('fromDate').isDate().withMessage('From date must be in YYYY-MM-DD format'),
      body('mobile').isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number')
    ],
    update: [
      param('id').custom(isValidObjectId).withMessage('Invalid application ID format'),
      body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
    ],
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid application ID format')
    ]
  },
  
  // Admin validation rules
  admin: {
    createUser: [
      body('name').notEmpty().withMessage('Name is required').trim(),
      body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
      body('mobile').isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
      body('role').isIn(['user', 'admin']).withMessage('Invalid role')
    ],
    updateUser: [
      param('id').custom(isValidObjectId).withMessage('Invalid user ID format'),
      body('name').optional().trim(),
      body('email').optional().isEmail().withMessage('Must be a valid email address').normalizeEmail(),
      body('mobile').optional().isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number'),
      body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
    ],
    deleteUser: [
      param('id').custom(isValidObjectId).withMessage('Invalid user ID format')
    ]
  },
  
  // Pass validation rules
  pass: {
    getById: [
      param('id').custom(isValidObjectId).withMessage('Invalid pass ID format')
    ],
    verify: [
      param('id').custom(isValidObjectId).withMessage('Invalid pass ID format')
    ]
  },
  
  // OTP validation rules
  otp: {
    send: [
      body('mobile').isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number')
    ],
    verify: [
      body('mobile').isMobilePhone('en-IN').withMessage('Must be a valid Indian mobile number'),
      body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits')
    ]
  }
};

/**
 * Middleware to validate requests
 * @param {string} method - Method to validate (e.g., 'user.create')
 * @returns {Array} - Array of validation middleware
 */
exports.validate = (method) => {
  const validationArray = method.split('.');
  if (validationArray.length !== 2) {
    throw new Error('Invalid validation method');
  }
  
  const [resource, action] = validationArray;
  
  if (!validationRules[resource] || !validationRules[resource][action]) {
    throw new Error(`Validation rules not found for ${method}`);
  }
  
  return [
    ...validationRules[resource][action],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: errors.array() 
        });
      }
      next();
    }
  ];
};

/**
 * Middleware to validate ObjectId format
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} - Middleware function
 */
exports.validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

/**
 * Export validation helper functions
 */
exports.isValidObjectId = isValidObjectId;