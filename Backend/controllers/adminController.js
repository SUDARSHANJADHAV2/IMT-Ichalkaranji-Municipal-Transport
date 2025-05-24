// controllers/adminController.js
const User = require('../models/User');
const Booking = require('../models/Booking');
const Pass = require('../models/Pass');
const PassApplication = require('../models/PassApplication');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const { errorResponse, successResponse } = require('../utils/helpers');

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for dashboard
    const userCount = await User.countDocuments();
    const activePassCount = await Pass.countDocuments({ status: 'active' });
    const pendingApplicationsCount = await PassApplication.countDocuments({ status: 'pending' });
    const todayBookings = await Booking.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });
    const busCount = await Bus.countDocuments({ status: 'active' });
    const routeCount = await Route.countDocuments();
    
    // Calculate monthly booking statistics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$totalFare" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calculate revenue statistics
    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalFare" }
        }
      }
    ]);
    
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalFare" }
        }
      }
    ]);
    
    // Top 5 most booked routes
    const topRoutes = await Booking.aggregate([
      {
        $lookup: {
          from: 'buses',
          localField: 'bus',
          foreignField: '_id',
          as: 'busInfo'
        }
      },
      { $unwind: '$busInfo' },
      {
        $lookup: {
          from: 'routes',
          localField: 'busInfo.route',
          foreignField: '_id',
          as: 'routeInfo'
        }
      },
      { $unwind: '$routeInfo' },
      {
        $group: {
          _id: '$routeInfo._id',
          routeName: { $first: '$routeInfo.name' },
          source: { $first: '$routeInfo.source' },
          destination: { $first: '$routeInfo.destination' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalFare' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Recent pass applications
    const recentApplications = await PassApplication.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Compile stats
    const stats = {
      counts: {
        users: userCount,
        activePasses: activePassCount,
        pendingApplications: pendingApplicationsCount,
        todayBookings,
        buses: busCount,
        routes: routeCount
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      charts: {
        monthlyBookings
      },
      topRoutes,
      recentApplications
    };
    
    return successResponse(res, 'Dashboard statistics fetched successfully', stats);
  } catch (error) {
    return errorResponse(res, 'Error fetching dashboard statistics', 500, error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return successResponse(res, 'Users fetched successfully', users);
  } catch (error) {
    return errorResponse(res, 'Error fetching users', 500, error);
  }
};

// Get user details (admin only)
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Get user's bookings
    const bookings = await Booking.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get user's passes
    const passes = await Pass.find({ user: req.params.id })
      .sort({ createdAt: -1 });
    
    // Get user's applications
    const applications = await PassApplication.find({ user: req.params.id })
      .sort({ createdAt: -1 });
    
    const userData = {
      user,
      bookings,
      passes,
      applications
    };
    
    return successResponse(res, 'User details fetched successfully', userData);
  } catch (error) {
    return errorResponse(res, 'Error fetching user details', 500, error);
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return errorResponse(res, 'User ID and status are required', 400);
    }
    
    // Validate status
    const validStatuses = ['active', 'suspended', 'blocked'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Cannot update admin status if you're not super admin
    if (user.role === 'admin' && req.user.role !== 'superadmin') {
      return errorResponse(res, 'Not authorized to update admin status', 403);
    }
    
    user.status = status;
    await user.save();
    
    return successResponse(res, 'User status updated successfully', {
      userId,
      status
    });
  } catch (error) {
    return errorResponse(res, 'Error updating user status', 500, error);
  }
};

// Generate reports
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    if (!reportType || !startDate || !endDate) {
      return errorResponse(res, 'Report type and date range are required', 400);
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    let reportData = null;
    
    switch (reportType) {
      case 'bookings':
        reportData = await Booking.find({
          createdAt: { $gte: start, $lte: end }
        })
        .populate('user', 'firstName lastName email')
        .populate('bus', 'busNumber')
        .sort({ createdAt: -1 });
        break;
        
      case 'passes':
        reportData = await Pass.find({
          createdAt: { $gte: start, $lte: end }
        })
        .populate('user', 'firstName lastName email')
        .populate('application', 'category')
        .sort({ createdAt: -1 });
        break;
        
      case 'revenue':
        reportData = await Booking.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              totalBookings: { $sum: 1 },
              totalRevenue: { $sum: '$totalFare' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;
        
      case 'routes':
        reportData = await Booking.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $lookup: {
              from: 'buses',
              localField: 'bus',
              foreignField: '_id',
              as: 'busInfo'
            }
          },
          { $unwind: '$busInfo' },
          {
            $lookup: {
              from: 'routes',
              localField: 'busInfo.route',
              foreignField: '_id',
              as: 'routeInfo'
            }
          },
          { $unwind: '$routeInfo' },
          {
            $group: {
              _id: '$routeInfo._id',
              routeName: { $first: '$routeInfo.name' },
              source: { $first: '$routeInfo.source' },
              destination: { $first: '$routeInfo.destination' },
              bookings: { $sum: 1 },
              revenue: { $sum: '$totalFare' }
            }
          },
          { $sort: { bookings: -1 } }
        ]);
        break;
        
      default:
        return errorResponse(res, 'Invalid report type', 400);
    }
    
    return successResponse(res, `${reportType} report generated successfully`, {
      reportType,
      startDate,
      endDate,
      generatedAt: new Date(),
      data: reportData
    });
  } catch (error) {
    return errorResponse(res, 'Error generating report', 500, error);
  }
};