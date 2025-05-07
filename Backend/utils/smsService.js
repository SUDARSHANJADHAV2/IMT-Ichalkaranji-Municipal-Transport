// utils/smsService.js
const config = require('../config/config');

/**
 * Service to handle SMS OTP functionality
 * This is a mock implementation. In production, you would use a service like Twilio.
 */
class SmsService {
  /**
   * Send OTP to the provided mobile number
   * @param {string} mobileNumber - The mobile number to send OTP to
   * @returns {Object} - Contains the OTP and success status
   */
  static async sendOTP(mobileNumber) {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In a real implementation, you would use Twilio or similar service:
      // const twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
      // await twilioClient.messages.create({
      //   body: `Your IBBPS verification code is: ${otp}`,
      //   from: config.twilio.phoneNumber,
      //   to: `+91${mobileNumber}`
      // });
      
      // For demo, we'll just log the OTP
      console.log(`OTP sent to ${mobileNumber}: ${otp}`);
      
      // In a real application, you would store this OTP in Redis or similar
      // with an expiration time, here we'll use an in-memory store
      global.otpStore = global.otpStore || {};
      global.otpStore[mobileNumber] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
      };
      
      return {
        success: true,
        message: 'OTP sent successfully',
        otp: config.isDevelopment ? otp : undefined // Only return OTP in development
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        error: error.message
      };
    }
  }
  
  /**
   * Verify the OTP sent to a mobile number
   * @param {string} mobileNumber - The mobile number to verify
   * @param {string} otp - The OTP to verify
   * @returns {boolean} - Whether the OTP is valid
   */
  static verifyOTP(mobileNumber, otp) {
    if (!global.otpStore || !global.otpStore[mobileNumber]) {
      return false; // No OTP was sent to this number
    }
    
    const storedData = global.otpStore[mobileNumber];
    
    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      delete global.otpStore[mobileNumber]; // Clean up expired OTP
      return false;
    }
    
    // Check if OTP matches
    const isValid = storedData.otp === otp;
    
    if (isValid) {
      // Remove the OTP after successful verification
      delete global.otpStore[mobileNumber];
    }
    
    return isValid;
  }
}

module.exports = SmsService;