// controllers/passController.js
const Pass = require('../models/Pass');
const PassApplication = require('../models/PassApplication');
const User = require('../models/User');
const { errorResponse, successResponse } = require('../utils/helpers');
const { generateQRCode } = require('../utils/qrCodeGenerator');
const { verifyAadhaar } = require('../utils/aadhaarVerification');

// Get all passes (admin only)
exports.getAllPasses = async (req, res) => {
  try {
    const passes = await Pass.find()
      .populate('user', '-password')
      .populate('application');
    
    return successResponse(res, 'Passes fetched successfully', passes);
  } catch (error) {
    return errorResponse(res, 'Error fetching passes', 500, error);
  }
};

// Get passes for a user
exports.getUserPasses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const passes = await Pass.find({ user: userId })
      .populate('application')
      .sort({ createdAt: -1 });
    
    return successResponse(res, 'User passes fetched successfully', passes);
  } catch (error) {
    return errorResponse(res, 'Error fetching user passes', 500, error);
  }
};

// Get a single pass by ID
exports.getPassById = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('user', '-password')
      .populate('application');
    
    if (!pass) {
      return errorResponse(res, 'Pass not found', 404);
    }
    
    // Check if the user is the pass owner or an admin
    if (pass.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to access this pass', 403);
    }
    
    return successResponse(res, 'Pass fetched successfully', pass);
  } catch (error) {
    return errorResponse(res, 'Error fetching pass', 500, error);
  }
};

// Issue a new pass (admin only)
exports.issuePass = async (req, res) => {
  try {
    const { applicationId, validFrom, validUntil, category } = req.body;
    
    // Validate inputs
    if (!applicationId || !validFrom || !validUntil || !category) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }
    
    // Check if application exists and is approved
    const application = await PassApplication.findById(applicationId);
    if (!application) {
      return errorResponse(res, 'Pass application not found', 404);
    }
    
    if (application.status !== 'approved') {
      return errorResponse(res, 'Cannot issue pass for non-approved application', 400);
    }
    
    // Check if user exists
    const user = await User.findById(application.user);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Generate QR code
    const passData = {
      applicationId,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      category,
      validFrom,
      validUntil
    };
    
    const qrCode = await generateQRCode(JSON.stringify(passData));
    
    // Create new pass
    const newPass = await Pass.create({
      user: user._id,
      application: applicationId,
      category,
      passNumber: 'PASS-' + Math.floor(100000 + Math.random() * 900000),
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      qrCode,
      status: 'active'
    });
    
    // Update application with passId
    application.pass = newPass._id;
    application.status = 'issued';
    await application.save();
    
    return successResponse(res, 'Pass issued successfully', newPass);
  } catch (error) {
    return errorResponse(res, 'Error issuing pass', 500, error);
  }
};

// Renew a pass
exports.renewPass = async (req, res) => {
  try {
    const { passId, validUntil } = req.body;
    
    if (!passId || !validUntil) {
      return errorResponse(res, 'Please provide all required fields', 400);
    }
    
    const pass = await Pass.findById(passId);
    if (!pass) {
      return errorResponse(res, 'Pass not found', 404);
    }
    
    // Ensure only admin or pass owner can renew
    if (pass.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to renew this pass', 403);
    }
    
    // Update pass validity and status
    pass.validUntil = new Date(validUntil);
    pass.status = 'active';
    pass.renewalCount = (pass.renewalCount || 0) + 1;
    
    // Generate new QR code
    const passData = {
      passId: pass._id,
      userId: pass.user,
      validUntil: pass.validUntil,
      renewalCount: pass.renewalCount
    };
    
    pass.qrCode = await generateQRCode(JSON.stringify(passData));
    await pass.save();
    
    return successResponse(res, 'Pass renewed successfully', pass);
  } catch (error) {
    return errorResponse(res, 'Error renewing pass', 500, error);
  }
};

// Cancel/deactivate a pass
exports.cancelPass = async (req, res) => {
  try {
    const { passId, reason } = req.body;
    
    if (!passId) {
      return errorResponse(res, 'Pass ID is required', 400);
    }
    
    const pass = await Pass.findById(passId);
    if (!pass) {
      return errorResponse(res, 'Pass not found', 404);
    }
    
    // Ensure only admin or pass owner can cancel
    if (pass.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to cancel this pass', 403);
    }
    
    // Update pass status
    pass.status = 'cancelled';
    pass.cancellationReason = reason || 'User requested cancellation';
    pass.cancelledAt = Date.now();
    
    await pass.save();
    
    return successResponse(res, 'Pass cancelled successfully', pass);
  } catch (error) {
    return errorResponse(res, 'Error cancelling pass', 500, error);
  }
};

// Verify a pass (e.g., by bus conductor)
exports.verifyPass = async (req, res) => {
  try {
    const { passNumber } = req.body;
    
    if (!passNumber) {
      return errorResponse(res, 'Pass number is required', 400);
    }
    
    const pass = await Pass.findOne({ passNumber })
      .populate('user', 'firstName lastName email phone')
      .populate('application', 'category');
    
    if (!pass) {
      return errorResponse(res, 'Invalid pass', 404);
    }
    
    // Check if pass is valid
    const now = new Date();
    if (pass.status !== 'active') {
      return errorResponse(res, `Pass is ${pass.status}`, 400);
    }
    
    if (now < new Date(pass.validFrom) || now > new Date(pass.validUntil)) {
      return errorResponse(res, 'Pass has expired or is not yet valid', 400);
    }
    
    // Add verification record
    pass.verificationHistory = pass.verificationHistory || [];
    pass.verificationHistory.push({
      verifiedBy: req.user.id,
      verifiedAt: now,
      location: req.body.location || 'Unknown location'
    });
    
    await pass.save();
    
    return successResponse(res, 'Pass verified successfully', {
      isValid: true,
      pass: {
        passNumber: pass.passNumber,
        validFrom: pass.validFrom,
        validUntil: pass.validUntil,
        category: pass.category,
        user: pass.user,
        status: pass.status
      }
    });
  } catch (error) {
    return errorResponse(res, 'Error verifying pass', 500, error);
  }
};

// Get pass verification history
exports.getPassVerificationHistory = async (req, res) => {
  try {
    const { passId } = req.params;
    
    const pass = await Pass.findById(passId)
      .populate({
        path: 'verificationHistory.verifiedBy',
        select: 'firstName lastName'
      });
    
    if (!pass) {
      return errorResponse(res, 'Pass not found', 404);
    }
    
    // Ensure only admin or pass owner can view history
    if (pass.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this pass history', 403);
    }
    
    return successResponse(res, 'Pass verification history fetched', pass.verificationHistory || []);
  } catch (error) {
    return errorResponse(res, 'Error fetching pass verification history', 500, error);
  }
};