// Backend/utils/fileStorage.js
const cloudinary = require('cloudinary').v2;
const config = require('../config/config'); // To access .env variables
const streamifier = require('streamifier');

// Configure Cloudinary
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true, // Ensure HTTPS URLs
  });
} else {
  console.warn('Cloudinary credentials not found in .env. File upload service will not work.');
}

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer The file buffer to upload.
 * @param {string} folderName The name of the folder in Cloudinary to store the file.
 * @param {string} [publicIdPrefix='doc'] Optional prefix for the public_id.
 * @returns {Promise<object>} Promise resolving with Cloudinary upload result (secure_url, public_id, etc.).
 * @throws {Error} If upload fails.
 */
const uploadToCloud = (fileBuffer, folderName, publicIdPrefix = 'doc') => {
  return new Promise((resolve, reject) => {
    if (!cloudinary.config().cloud_name) {
      // Simulate success in dev if Cloudinary is not configured to avoid blocking flow
      if (config.NODE_ENV === 'development') {
          console.log(`DEV MODE: Simulating file upload for folder ${folderName}.`);
          resolve({
              secure_url: `https://res.cloudinary.com/demo/image/upload/v1580298900/samples/${publicIdPrefix}_simulated_${Date.now()}.jpg`,
              public_id: `${folderName}/${publicIdPrefix}_simulated_${Date.now()}`
          });
          return;
      }
      return reject(new Error('Cloudinary not configured. Check .env variables.'));
    }

    // Generate a unique public_id to prevent overwrites and make it easier to manage
    const uniquePublicId = `${folderName}/${publicIdPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        public_id: uniquePublicId,
        resource_type: 'auto', // Automatically detect resource type (image, pdf, raw)
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve(result);
      }
    );

    // Use streamifier to pipe the buffer to Cloudinary's upload stream
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary using its public_id.
 * @param {string} publicId The public_id of the file to delete.
 * @returns {Promise<object>} Promise resolving with Cloudinary deletion result.
 * @throws {Error} If deletion fails.
 */
const deleteFromCloud = (publicId) => {
  return new Promise((resolve, reject) => {
    if (!cloudinary.config().cloud_name) {
       // Simulate success in dev if Cloudinary is not configured
      if (config.NODE_ENV === 'development') {
          console.log(`DEV MODE: Simulating deletion for public_id ${publicId}.`);
          resolve({ result: 'ok (simulated)' });
          return;
      }
      return reject(new Error('Cloudinary not configured. Check .env variables.'));
    }
    
    // publicId might contain folder structure, which is fine for deletion.
    // resource_type needs to be correctly identified or Cloudinary might not find it.
    // For simplicity, 'image' is often default, use 'raw' for PDFs/non-image files if not auto-detected.
    // 'auto' for resource_type in deletion is not standard. We might need to infer it or store it.
    // For now, trying with 'image' and 'raw' as common types. A more robust solution might store resource_type.
    cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error, result) => {
      if (error) {
        // Try with 'raw' if 'image' failed (e.g., for PDFs)
        cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }, (errorRaw, resultRaw) => {
             if (errorRaw) {
                console.error(`Cloudinary deletion error for ${publicId} (tried image and raw):`, errorRaw);
                return reject(new Error(`Cloudinary deletion failed: ${errorRaw.message}`));
             }
             resolve(resultRaw);
        });
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  uploadToCloud,
  deleteFromCloud,
};
