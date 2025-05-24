// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');

/**
 * Configure storage for different file types
 */
const storageConfig = multer.memoryStorage();

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
   * Middleware for document uploads (Aadhaar, ID proofs)
   * @param {string} fieldName - Form field name
   */
  document: (fieldName) => 
    multer({
      storage: storageConfig,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: fileFilter(['.pdf', '.jpg', '.jpeg', '.png'])
    }).single(fieldName),
  
  /**
   * Middleware for profile pictures
   * @param {string} fieldName - Form field name
   */
  profilePicture: (fieldName) => 
    multer({
      storage: storageConfig,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max file size
      },
      fileFilter: fileFilter(['.jpg', '.jpeg', '.png'])
    }).single(fieldName),
  
  /**
   * Middleware for multiple document uploads
   * @param {string} fieldName - Form field name
   * @param {number} maxCount - Maximum number of files
   */
  multipleDocuments: (fieldName, maxCount = 3) => 
    multer({
      storage: storageConfig,
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