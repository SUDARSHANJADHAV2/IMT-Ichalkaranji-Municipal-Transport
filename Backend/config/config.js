const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ibbps',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'ibbps_secret_key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // SMS service configuration (for OTP)
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID,
  
  // File storage configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Admin default credentials
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@ibbps.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
};