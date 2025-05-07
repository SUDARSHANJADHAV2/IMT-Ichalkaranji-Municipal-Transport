// utils/qrCodeGenerator.js
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

/**
 * Service for generating QR codes for tickets and passes
 */
class QRCodeGenerator {
  /**
   * Generate QR code data URL from booking data
   * @param {Object} data - Booking or pass data to encode in QR code
   * @returns {Promise<string>} - QR code as data URL
   */
  static async generateQRCodeDataURL(data) {
    try {
      // Create the data string to encode
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1
      });
      
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Generate and save QR code image file
   * @param {Object} data - Booking or pass data to encode in QR code
   * @param {string} filename - Filename to save QR code as
   * @returns {Promise<string>} - Path to the saved QR code file
   */
  static async generateQRCodeFile(data, filename) {
    try {
      // Create the data string to encode
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Ensure the uploads directory exists
      const uploadDir = path.join(__dirname, '..', 'uploads', 'qrcodes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Create file path
      const filePath = path.join(uploadDir, `${filename}.png`);
      
      // Generate and save QR code image
      await QRCode.toFile(filePath, dataString, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1
      });
      
      // Return the relative path for storage in the database
      return `/uploads/qrcodes/${filename}.png`;
    } catch (error) {
      console.error('Error generating QR code file:', error);
      throw error;
    }
  }
  
  /**
   * Generate QR code for a ticket or booking
   * @param {Object} booking - Booking document
   * @returns {Promise<string>} - QR code as data URL
   */
  static async generateTicketQR(booking) {
    // The data to encode in the QR code - only include essential info for verification
    const ticketData = {
      bookingId: booking._id,
      userId: booking.userId,
      busId: booking.busId,
      seats: booking.seats,
      travelDate: booking.travelDate,
      verified: false,
      timestamp: Date.now()
    };
    
    return this.generateQRCodeDataURL(ticketData);
  }
  
  /**
   * Generate QR code for a monthly pass
   * @param {Object} pass - Pass document
   * @returns {Promise<string>} - QR code as data URL
   */
  static async generatePassQR(pass) {
    // The data to encode in the QR code - only include essential info for verification
    const passData = {
      passId: pass._id,
      userId: pass.userId,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil,
      category: pass.category,
      verified: false,
      timestamp: Date.now()
    };
    
    return this.generateQRCodeDataURL(passData);
  }
}

module.exports = QRCodeGenerator;