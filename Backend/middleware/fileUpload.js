// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Storage Configurations ---

// Memory storage (remains for other potential uses)
const memoryStorage = multer.memoryStorage();

// Disk storage for Aadhaar cards
const aadhaarStoragePath = path.join(__dirname, '..', 'uploads', 'aadhaar');

// Ensure the directory exists
if (!fs.existsSync(aadhaarStoragePath)) {
  fs.mkdirSync(aadhaarStoragePath, { recursive: true });
}

const aadhaarDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, aadhaarStoragePath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


/**
 * Validate file type based on allowed extensions
 * @param {Object} file - The uploaded file object
 * @param {Array} allowedExtensions - Array of allowed file extensions
 * @param {Function} callback - Callback function
 */
const fileFilter = (allowedExtensions) => (req, file, callback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    return callback(null, true);
  }
  
  return callback(
    new Error(`Only ${allowedExtensions.join(', ')} files are allowed!`),
    false
  );
};

/**
 * Multer middleware factory for different file types
 */
const upload = {
  /**
   * Middleware for general document uploads (uses memory storage)
   * @param {string} fieldName - Form field name
   */
  documentMemory: (fieldName) =>
    multer({
      storage: memoryStorage, // Keep using memoryStorage for general docs if needed elsewhere
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png'])
    }).single(fieldName),

  /**
   * Middleware specifically for Aadhaar card uploads (uses disk storage)
   * @param {string} fieldName - Form field name (e.g., 'aadhaarCard')
   */
  aadhaarCardDisk: (fieldName) =>
    multer({
      storage: aadhaarDiskStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size for Aadhaar
      },
      fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png']) // Same filter for now
    }).single(fieldName),
  
  /**
   * Middleware for profile pictures
   * @param {string} fieldName - Form field name
   */
  profilePicture: (fieldName) => 
    multer({
      storage: memoryStorage, // Assuming profile pics might also use memory or a different disk storage
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max file size
      },
      fileFilter: fileFilter(['.jpg', '.jpeg', '.png'])
    }).single(fieldName),
  
  /**
   * Middleware for multiple document uploads (uses memory storage)
   * @param {string} fieldName - Form field name
   * @param {number} maxCount - Maximum number of files
   */
  multipleDocumentsMemory: (fieldName, maxCount = 3) =>
    multer({
      storage: memoryStorage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: maxCount
      },
      fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png'])
    }).array(fieldName, maxCount)
};

/**
 * Error handler for multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded. Please try again.'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // A non-Multer error occurred
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError
};