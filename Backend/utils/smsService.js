// Backend/utils/smsService.js
exports.sendOtp = async (phoneNumber, otp) => {
  console.log(`Mock SMS: Sending OTP ${otp} to ${phoneNumber}`);
  // In a real app, you would integrate with a real SMS provider like Twilio, Vonage, etc.
  // This function simulates sending by just logging to the console.
  // It returns a Promise to mimic asynchronous behavior of actual SMS APIs.
  return Promise.resolve({ success: true, messageId: 'mock_sms_id_' + Date.now() });
};

// If you need a verifyOtp mock for other parts of the system (not strictly required by this subtask's controller description)
// exports.verifyOtp = async (phoneNumber, otpToVerify) => {
//   console.log(`Mock SMS: Verifying OTP ${otpToVerify} for ${phoneNumber} - This mock always returns true for demo.`);
//   return Promise.resolve(true);
// };
