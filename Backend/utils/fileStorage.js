// utils/fileStorage.js
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Handle file storage operations for uploads
 */
class FileStorage {
  /**
   * Save a file to the specified directory
   * @param {Object} file - The uploaded file object from multer
   * @param {string} directory - The subdirectory to save the file in
   * @returns {Promise<string>} - The relative file path for database storage
   */
  static async saveFile(file, directory = 'documents') {
    try {
      // Create upload directory if it doesn't exist
      const uploadPath = path.join(__dirname, '..', 'uploads', directory);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      // Generate a unique filename to prevent conflicts
      const fileExtension = path.extname(file.originalname);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
      
      // Create file path
      const filePath = path.join(uploadPath, fileName);
      
      // Save the file
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, file.buffer, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Return the relative path for storage in the database
          resolve(`/uploads/${directory}/${fileName}`);
        });
      });
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from storage
   * @param {string} filePath - The relative file path
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteFile(filePath) {
    try {
      if (!filePath) return true;
      
      // Get absolute path by removing the leading slash and prepending the app root
      const absolutePath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
      
      // Check if file exists
      if (fs.existsSync(absolutePath)) {
        // Delete the file
        fs.unlinkSync(absolutePath);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
  
  /**
   * Get a file's MIME type
   * @param {string} filePath - Path to the file
   * @returns {string} - MIME type of the file
   */
  static getFileMimeType(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    // Map of common extensions to MIME types
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

module.exports = FileStorage;