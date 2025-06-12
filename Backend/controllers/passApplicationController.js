const PassApplication = require('../models/PassApplication');
const User = require('../models/User'); // Needed to pre-fill user details or validate user
const { errorResponse, successResponse } = require('../utils/helpers');
const bcrypt = require('bcryptjs'); // For hashing OTP
const { sendOtp } = require('../utils/smsService'); // Mock SMS service

// @desc    Submit a new pass application
// @route   POST /api/pass-applications
// @access  Private
exports.submitPassApplication = async (req, res) => {
  try {
    const { passType, duration, firstName, lastName, age, address, email, phone } = req.body;
    const userId = req.user.id; // From 'protect' middleware

    // --- Basic Validation ---
    if (!passType || !duration || !firstName || !lastName || !age || !address || !email || !phone) {
      return errorResponse(res, 'Please provide all required fields for the pass application.', 400);
    }
    if (!req.file) {
      return errorResponse(res, 'Aadhaar card upload is required.', 400);
    }

    // Validate age
    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge) || numericAge < 5 || numericAge > 120) {
        return errorResponse(res, 'Invalid age provided. Age must be between 5 and 120.', 400);
    }

    // --- File Path ---
    // The path where multer saves the file. Store relative path for serving.
    // Example: uploads/aadhaar/aadhaarCard-1629876543210-123456789.pdf
    // We need to make sure this path is accessible or transformed for client access.
    // For now, storing the path as provided by multer.
    const aadhaarCardUrl = req.file.path.replace(/\\/g, "/"); // Normalize path separators

    // --- OTP Generation ---
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    // --- Create Pass Application ---
    const application = new PassApplication({
      user: userId,
      passType,
      duration,
      firstName,
      lastName,
      age: numericAge,
      address,
      email,
      phone,
      aadhaarCardUrl,
      status: 'pending_otp',
      otp: hashedOtp,
      otpExpires,
    });

    await application.save();

    // --- Send OTP via Mock SMS Service ---
    try {
      await sendOtp(phone, otp);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Mock OTP ${otp} sent to ${phone} for application ${application._id}`);
      }
    } catch (smsError) {
      console.error(`Failed to send OTP for application ${application._id}:`, smsError);
      // Non-critical error for now, application is saved.
    }

    return successResponse(res, 'Pass application submitted. Please verify OTP.', { applicationId: application._id }, 201);

  } catch (error) {
    console.error('Error submitting pass application:', error);
    if (error.code === 11000) {
        return errorResponse(res, 'Error: Duplicate application or unique field violation.', 400);
    }
    // If it's a validation error from Mongoose
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return errorResponse(res, messages.join(', '), 400);
    }
    return errorResponse(res, 'Server error submitting pass application.', 500, error.message);
  }
};

// @desc    Verify OTP for pass application
// @route   POST /api/pass-applications/verify-otp
// @access  Private
exports.verifyOtpForPass = async (req, res) => {
  const { applicationId, otp } = req.body;

  if (!applicationId || !otp) {
    return errorResponse(res, 'Application ID and OTP are required.', 400);
  }

  try {
    const application = await PassApplication.findById(applicationId);

    if (!application) {
      return errorResponse(res, 'Pass application not found.', 404);
    }

    if (application.status !== 'pending_otp') {
      return errorResponse(res, 'This application is not awaiting OTP verification or has already been verified.', 400);
    }

    if (new Date() > application.otpExpires) {
      // Clear expired OTP
      application.otp = undefined;
      application.otpExpires = undefined;
      await application.save();
      return errorResponse(res, 'OTP has expired. Please request a new one if applicable.', 400);
    }

    const isOtpMatch = await bcrypt.compare(otp, application.otp);
    if (!isOtpMatch) {
      return errorResponse(res, 'Invalid OTP provided.', 400);
    }

    // OTP is valid
    application.status = 'pending_approval';
    application.otp = undefined; // Clear OTP fields after successful verification
    application.otpExpires = undefined;
    await application.save();

    return successResponse(res, 'OTP verified successfully. Application submitted for approval.');

  } catch (error) {
    console.error('Error verifying OTP for pass application:', error);
    return errorResponse(res, 'Server error verifying OTP.', 500, error.message);
  }
};

// --- Admin Functions ---

// @desc    Get all applications pending approval
// @route   GET /api/pass-applications/pending
// @access  Admin
exports.getPendingApplications = async (req, res) => {
  try {
    const pendingApplications = await PassApplication.find({ status: 'pending_approval' })
      .populate('user', 'firstName lastName email phone') // Populate relevant user details
      .sort({ createdAt: -1 }); // Show newest first

    return successResponse(res, 'Pending pass applications fetched successfully.', pendingApplications);
  } catch (error) {
    console.error('Error fetching pending pass applications:', error);
    return errorResponse(res, 'Server error fetching pending applications.', 500, error.message);
  }
};

// Helper function to calculate pass validity
function calculateValidUntil(validFrom, duration) {
  const date = new Date(validFrom);
  switch (duration.toLowerCase()) {
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'quarterly': date.setMonth(date.getMonth() + 3); break;
    case 'half_yearly': date.setMonth(date.getMonth() + 6); break;
    case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    default: throw new Error('Invalid pass duration specified: ' + duration);
  }
  return date;
}

// @desc    Approve a pass application
// @route   PUT /api/pass-applications/:id/approve
// @access  Admin
exports.approvePassApplication = async (req, res) => {
  const { id: applicationId } = req.params;
  const adminUserId = req.user.id; // Admin performing the action

  try {
    const application = await PassApplication.findById(applicationId);

    if (!application) {
      return errorResponse(res, 'Pass application not found.', 404);
    }
    if (application.status !== 'pending_approval') {
      return errorResponse(res, `Application status is '${application.status}', not 'pending_approval'. Cannot approve.`, 400);
    }

    // Create a new Pass
    const validFrom = new Date(); // Pass starts from today
    const validUntil = calculateValidUntil(validFrom, application.duration);

    const newPass = new Pass({
      user: application.user,
      passApplication: applicationId,
      passType: application.passType,
      duration: application.duration,
      validFrom,
      validUntil,
      // qrCodeData will be generated by Pass model pre-save hook
      status: 'active',
    });
    await newPass.save(); // This will also trigger the qrCodeData generation

    // Update the application
    application.status = 'approved';
    application.approvedBy = adminUserId;
    application.passId = newPass._id;
    await application.save();
    
    // TODO: Implement email/SMS notification to user about approval

    return successResponse(res, 'Pass application approved and pass created successfully.', {
      application,
      pass: newPass,
    });

  } catch (error) {
    console.error('Error approving pass application:', error);
    return errorResponse(res, 'Server error approving application.', 500, error.message);
  }
};

// @desc    Reject a pass application
// @route   PUT /api/pass-applications/:id/reject
// @access  Admin
exports.rejectPassApplication = async (req, res) => {
  const { id: applicationId } = req.params;
  const { rejectionReason } = req.body;
  const adminUserId = req.user.id;

  if (!rejectionReason || rejectionReason.trim() === '') {
    return errorResponse(res, 'Rejection reason is required.', 400);
  }

  try {
    const application = await PassApplication.findById(applicationId);

    if (!application) {
      return errorResponse(res, 'Pass application not found.', 404);
    }
    if (application.status !== 'pending_approval') {
      return errorResponse(res, `Application status is '${application.status}', not 'pending_approval'. Cannot reject.`, 400);
    }

    application.status = 'rejected';
    application.rejectionReason = rejectionReason.trim();
    application.approvedBy = adminUserId; // Record who rejected it
    application.passId = undefined; // Ensure no pass is linked
    await application.save();

    // TODO: Implement email/SMS notification to user about rejection

    return successResponse(res, 'Pass application rejected successfully.', application);

  } catch (error) {
    console.error('Error rejecting pass application:', error);
    return errorResponse(res, 'Server error rejecting application.', 500, error.message);
  }
};
