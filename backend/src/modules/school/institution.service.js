const Institution = require('./institution.model');
const ApiError = require('../../utils/apiError.util');
const { uploadImage, deleteFile } = require('../../utils/upload.util');

/**
 * Get Institution profile.
 *
 * @param {string} tenantId - Tenant identifier
 */
const getInstitution = async (tenantId = 'default_tenant') => {
  const institution = await Institution.findOne({ tenantId });
  if (!institution) {
    throw ApiError.notFound('Institution profile not found.');
  }
  return institution;
};

/**
 * Create Institution profile with optional branding upload.
 *
 * @param {Object} data - Form data
 * @param {Object} files - Express files object from Multer (logo, favicon, banner)
 * @param {string} tenantId - Tenant identifier
 */
const createInstitution = async (data, files = {}, tenantId = 'default_tenant') => {
  const existing = await Institution.findOne({ tenantId });
  if (existing) {
    throw ApiError.conflict('Institution profile already exists for this tenant. Use update endpoint instead.');
  }

  const logoData = { url: null, publicId: null };
  const faviconData = { url: null, publicId: null };
  const bannerData = { url: null, publicId: null };

  if (files.logo && files.logo[0]) {
    const uploaded = await uploadImage(files.logo[0].path, 'school/branding');
    logoData.url = uploaded.url;
    logoData.publicId = uploaded.publicId;
  }

  if (files.favicon && files.favicon[0]) {
    const uploaded = await uploadImage(files.favicon[0].path, 'school/branding');
    faviconData.url = uploaded.url;
    faviconData.publicId = uploaded.publicId;
  }

  if (files.banner && files.banner[0]) {
    const uploaded = await uploadImage(files.banner[0].path, 'school/branding');
    bannerData.url = uploaded.url;
    bannerData.publicId = uploaded.publicId;
  }

  const institution = await Institution.create({
    ...data,
    tenantId,
    logo: logoData,
    favicon: faviconData,
    banner: bannerData
  });

  return institution;
};

/**
 * Update Institution profile with image replacement support.
 *
 * @param {string} id - Institution Mongo ID
 * @param {Object} data - Updated fields
 * @param {Object} files - Express files object from Multer
 * @param {string} tenantId - Tenant identifier
 */
const updateInstitution = async (id, data, files = {}, tenantId = 'default_tenant') => {
  const institution = await Institution.findOne({ _id: id, tenantId });
  if (!institution) {
    throw ApiError.notFound('Institution profile not found.');
  }

  if (files.logo && files.logo[0]) {
    if (institution.logo && institution.logo.publicId) {
      await deleteFile(institution.logo.publicId).catch(() => {});
    }
    const uploaded = await uploadImage(files.logo[0].path, 'school/branding');
    institution.logo = { url: uploaded.url, publicId: uploaded.publicId };
  }

  if (files.favicon && files.favicon[0]) {
    if (institution.favicon && institution.favicon.publicId) {
      await deleteFile(institution.favicon.publicId).catch(() => {});
    }
    const uploaded = await uploadImage(files.favicon[0].path, 'school/branding');
    institution.favicon = { url: uploaded.url, publicId: uploaded.publicId };
  }

  if (files.banner && files.banner[0]) {
    if (institution.banner && institution.banner.publicId) {
      await deleteFile(institution.banner.publicId).catch(() => {});
    }
    const uploaded = await uploadImage(files.banner[0].path, 'school/branding');
    institution.banner = { url: uploaded.url, publicId: uploaded.publicId };
  }

  Object.assign(institution, data);
  await institution.save();

  return institution;
};

/**
 * Delete Institution profile and associated branding assets from Cloudinary.
 *
 * @param {string} id - Institution ID
 * @param {string} tenantId - Tenant identifier
 */
const deleteInstitution = async (id, tenantId = 'default_tenant') => {
  const institution = await Institution.findOne({ _id: id, tenantId });
  if (!institution) {
    throw ApiError.notFound('Institution profile not found.');
  }

  if (institution.logo && institution.logo.publicId) {
    await deleteFile(institution.logo.publicId).catch(() => {});
  }
  if (institution.favicon && institution.favicon.publicId) {
    await deleteFile(institution.favicon.publicId).catch(() => {});
  }
  if (institution.banner && institution.banner.publicId) {
    await deleteFile(institution.banner.publicId).catch(() => {});
  }

  await Institution.deleteOne({ _id: id, tenantId });
  return true;
};

module.exports = {
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution
};
