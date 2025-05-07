// utils/helpers.js
const config = require('../config/config');

/**
 * A collection of helper functions for various operations
 */
const helpers = {
  /**
   * Format date to a readable string
   * @param {Date|string} date - The date to format
   * @param {boolean} includeTime - Whether to include time in the output
   * @returns {string} - Formatted date string
   */
  formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = true;
    }
    
    return dateObj.toLocaleDateString('en-IN', options);
  },
  
  /**
   * Format time from 24-hour to 12-hour format
   * @param {string} time - Time in 24-hour format (HH:MM)
   * @returns {string} - Time in 12-hour format with AM/PM
   */
  formatTime(time) {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  },
  
  /**
   * Calculate duration between two time strings
   * @param {string} departureTime - Departure time (HH:MM)
   * @param {string} arrivalTime - Arrival time (HH:MM)
   * @returns {string} - Duration in hours and minutes
   */
  calculateDuration(departureTime, arrivalTime) {
    if (!departureTime || !arrivalTime) return '';
    
    const getMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    let departureMinutes = getMinutes(departureTime);
    let arrivalMinutes = getMinutes(arrivalTime);
    
    // Handle overnight trips
    if (arrivalMinutes < departureMinutes) {
      arrivalMinutes += 24 * 60; // Add a day
    }
    
    const durationMinutes = arrivalMinutes - departureMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} mins`;
    } else if (minutes === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} mins`;
    }
  },
  
  /**
   * Generate a random booking or pass ID
   * @param {string} prefix - Prefix for the ID (e.g., 'BK' for booking)
   * @returns {string} - Generated ID
   */
  generateId(prefix = 'BK') {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${randomChars}${timestamp}`;
  },
  
  /**
   * Calculate the fare based on route distance and bus type
   * @param {number} distance - Route distance in kilometers
   * @param {string} busType - Type of bus (ordinary, express, ac)
   * @returns {number} - Calculated fare
   */
  calculateFare(distance, busType = 'ordinary') {
    // Base rate per km for different bus types
    const ratePerKm = {
      ordinary: 1.5,
      express: 2.0,
      ac: 3.0
    };
    
    // Base fare for minimum distance
    const baseFare = {
      ordinary: 10,
      express: 15,
      ac: 20
    };
    
    // Calculate fare
    const rate = ratePerKm[busType.toLowerCase()] || ratePerKm.ordinary;
    const base = baseFare[busType.toLowerCase()] || baseFare.ordinary;
    
    return Math.max(Math.round(distance * rate), base);
  },
  
  /**
   * Calculate pass fare based on pass type and category
   * @param {string} passType - Type of pass (monthly, quarterly, etc.)
   * @param {string} category - User category (student, senior, regular)
   * @returns {number} - Pass fare
   */
  calculatePassFare(passType = 'monthly', category = 'regular') {
    // Base prices for different pass types
    const basePrices = {
      monthly: 500,
      quarterly: 1200,
      halfyearly: 2200,
      yearly: 4000
    };
    
    // Discount factors for different categories
    const discountFactor = {
      student: 0.5,  // 50% discount
      senior: 0.6,   // 40% discount
      differentlyAbled: 0.3, // 70% discount
      regular: 1.0   // No discount
    };
    
    const basePrice = basePrices[passType.toLowerCase()] || basePrices.monthly;
    const discount = discountFactor[category.toLowerCase()] || discountFactor.regular;
    
    return Math.round(basePrice * discount);
  },
  
  /**
   * Check if an object ID is valid
   * @param {string} id - The ID to check
   * @returns {boolean} - Whether the ID is valid
   */
  isValidObjectId(id) {
    // MongoDB ObjectId is a 24-character hex string
    return /^[0-9a-fA-F]{24}$/.test(id);
  },
  
  /**
   * Generate an expiry date based on the pass type
   * @param {string} passType - Type of pass (monthly, quarterly, etc.)
   * @param {Date} startDate - Starting date for the pass
   * @returns {Date} - Expiry date
   */
  calculatePassExpiryDate(passType = 'monthly', startDate = new Date()) {
    const date = new Date(startDate);
    
    switch (passType.toLowerCase()) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'halfyearly':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    // Set to the end of the day
    date.setHours(23, 59, 59, 999);
    
    return date;
  },
  
  /**
   * Paginate results
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} - Pagination parameters
   */
  getPaginationParams(page = 1, limit = 10) {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    return {
      page: isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 ? 10 : parsedLimit,
      skip: (isNaN(parsedPage) || parsedPage < 1 ? 0 : parsedPage - 1) * 
            (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100 ? 10 : parsedLimit)
    };
  }
};

module.exports = helpers;