// controllers/passApplicationController.js
const PassApplication = require('../models/PassApplication');
const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/helpers');
const { sendOTP, verifyOTP } = require('../utils/smsService');
const { uploadToCloud, deleteFromCloud } = require('../utils/fileStorage');

// Get all pass applications (admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await PassApplication.find()
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });
    
    return successResponse(res, 'Applications fetched successfully', applications);
  } catch (error) {
    return errorResponse(res, 'Error fetching applications', 500, error);
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applications = await PassApplication.find({ user: userId })
      .sort({ createdAt: -1 });
    
    return successResponse(res, 'User applications fetched successfully', applications);
  } catch (error) {
    return errorResponse(res, 'Error fetching user applications', 500, error);
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await PassApplication.findById(req.params.id)
      .populate('user', 'firstName lastName email phone');
    
    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    // Ensure only admin or application owner can view details
    if (application.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this application', 403);
    }
    
    return successResponse(res, 'Application fetched successfully', application);
  } catch (error) {
    return errorResponse(res, 'Error fetching application', 500, error);
  }
};

// Create new pass application
exports.createApplication = async (req, res) => {
  try {
    const { category, routeId, validityMonths } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (!category || !routeId) {
      return errorResponse(res, 'Please provide category and route', 400);
    }
    
    // Check if user already has a pending application
    const pendingApplication = await PassApplication.findOne({
      user: userId,
      status: { $in: ['pending', 'verification'] }
    });
    
    if (pendingApplication) {
      return errorResponse(res, 'You already have a pending application', 400);
    }
    
    // Handle Aadhaar document upload
    let aadhaarDocument = null;
    if (req.files && req.files.aadhaarDocument) {
      const file = req.files.aadhaarDocument;
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.mimetype)) {
        return errorResponse(res, 'Invalid file type. Please upload JPG, PNG or PDF', 400);
      }
      
      // Upload to cloud storage
      const uploadResult = await uploadToCloud(file.data, 'aadhaar_documents');
      aadhaarDocument = uploadResult.secure_url;
    } else {
      return errorResponse(res, 'Aadhaar document is required', 400);
    }
    
    // Create new application
    const newApplication = await PassApplication.create({
      user: userId,
      category,
      route: routeId,
      validityMonths: validityMonths || 1,
      aadhaarDocument,
      status: 'pending'
    });
    
    // Send OTP for mobile verification
    const user = await User.findById(userId);
    if (user && user.phone) {
      try {
        await sendOTP(user.phone);
        newApplication.otpSent = true;
        newApplication.otpSentAt = Date.now();
        await newApplication.save();
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError);
      }
    }
    
    return successResponse(res, 'Application submitted successfully', newApplication);
  } catch (error) {
    return errorResponse(res, 'Error creating application', 500, error);
  }
};

// Verify OTP for application
exports.verifyApplicationOTP = async (req, res) => {
  try {
    const { applicationId, otp } = req.body;
    
    if (!applicationId || !otp) {
      return errorResponse(res, 'Please provide application ID and OTP', 400);
    }
    
    const application = await PassApplication.findById(applicationId);
    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    // Ensure only application owner can verify OTP
    if (application.user.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to verify this application', 403);
    }
    
    // Verify OTP
    const user = await User.findById(req.user.id);
    if (!user || !user.phone) {
      return errorResponse(res, 'User phone number not found', 400);
    }
    
    const isValid = await verifyOTP(user.phone, otp);
    if (!isValid) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }
    
    // Update application status
    application.mobileVerified = true;
    application.status = 'verification';
    application.mobileVerifiedAt = Date.now();
    await application.save();
    
    return successResponse(res, 'Mobile verification successful', application);
  } catch (error) {
    return errorResponse(res, 'Error verifying OTP', 500, error);
  }
};

// Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, adminRemarks } = req.body;
    
    if (!applicationId || !status) {
      return errorResponse(res, 'Please provide application ID and status', 400);
    }
    
    // Validate status
    const validStatuses = ['pending', 'verification', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }
    
    const application = await PassApplication.findById(applicationId);
    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    // Update application
    application.status = status;
    if (adminRemarks) {
      application.adminRemarks = adminRemarks;
    }
    application.updatedAt = Date.now();
    
    await application.save();
    
    return successResponse(res, 'Application status updated successfully', application);
  } catch (error) {
    return errorResponse(res, 'Error updating application status', 500, error);
  }
};

// Cancel application (user)
exports.cancelApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    if (!applicationId) {
      return errorResponse(res, 'Application ID is required', 400);
    }
    
    const application = await PassApplication.findById(applicationId);
    if (!application) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    // Ensure only application owner can cancel
    if (application.user.toString() !== req.user.id) {
      return errorResponse(res, 'Not authorized to cancel this application', 403);
    }
    
    // Only allow cancellation of pending or verification applications
    if (!['pending', 'verification'].includes(application.status)) {
      return errorResponse(res, `Cannot cancel application in ${application.status} status`, 400);
    }
    
    // Update application
    application.status = 'cancelled';
    application.cancelledAt = Date.now();
    await application.save();
    
    // Attempt to delete Aadhaar document from cloud
    if (application.aadhaarDocument) {
      try {
        await deleteFromCloud(application.aadhaarDocument);
      } catch (deleteError) {
        console.error('Error deleting document from cloud:', deleteError);
      }
    }
    
    return successResponse(res, 'Application cancelled successfully', { applicationId });
  } catch (error) {
    return errorResponse(res, 'Error cancelling application', 500, error);
  }
};