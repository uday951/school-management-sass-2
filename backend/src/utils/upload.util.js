const cloudinary = require('../../config/cloudinary');
const ApiError = require('../utils/apiError.util');
const fs = require('fs');

/**
 * Upload a single image file to Cloudinary.
 * Automatically applies quality optimization transforms.
 * Deletes the local temp file after successful upload.
 *
 * @param {string} filePath    - Local disk path to the file
 * @param {string} folder      - Cloudinary folder destination (e.g., 'students/photos')
 * @returns {Promise<Object>}  - Cloudinary upload result { url, publicId }
 */
const uploadImage = async (filePath, folder = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      resource_type: 'image'
    });

    // Clean up temp file
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw ApiError.internal(`Cloudinary image upload failed: ${err.message}`);
  }
};

/**
 * Upload a document file (PDF/image) to Cloudinary.
 * Deletes the local temp file after successful upload.
 *
 * @param {string} filePath    - Local disk path to the file
 * @param {string} folder      - Cloudinary folder destination
 * @returns {Promise<Object>}  - { url, publicId }
 */
const uploadDocument = async (filePath, folder = 'documents') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw ApiError.internal(`Cloudinary document upload failed: ${err.message}`);
  }
};

/**
 * Delete a file from Cloudinary by its public ID.
 *
 * @param {string} publicId - Cloudinary public_id of the file
 */
const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw ApiError.internal(`Cloudinary delete failed: ${err.message}`);
  }
};

module.exports = { uploadImage, uploadDocument, deleteFile };
