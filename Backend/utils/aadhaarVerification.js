// utils/aadhaarVerification.js

// Simulated Aadhaar verification function
function verifyAadhaar(aadhaarNumber) {
    // Simple check: 12-digit number and ends with an even number = valid
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return {
        isValid: false,
        message: 'Invalid Aadhaar number format.'
      };
    }
  
    const isEven = parseInt(aadhaarNumber[aadhaarNumber.length - 1]) % 2 === 0;
    return {
      isValid: isEven,
      message: isEven ? 'Aadhaar verified successfully.' : 'Aadhaar verification failed.'
    };
  }
  
  module.exports = {
    verifyAadhaar
  };
  