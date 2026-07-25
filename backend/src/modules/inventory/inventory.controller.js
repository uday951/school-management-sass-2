const asyncHandler = require('../../utils/asyncHandler.util');
const { sendSuccess, sendCreated, sendPaginated } = require('../../utils/response.util');
const inventoryService = require('./inventory.service');

// ─── DASHBOARD CONTROLLER ─────────────────────────────────────────────────────

const getDashboardData = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const data = await inventoryService.getInventoryDashboardData(tenantId);
  return sendSuccess(res, 'Inventory dashboard metrics retrieved successfully', data);
});

// ─── CATEGORY CONTROLLERS ─────────────────────────────────────────────────────

const getCategories = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getCategories(req.query, tenantId);
  return sendPaginated(res, 'Asset categories retrieved successfully', data, pagination);
});

const createCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const category = await inventoryService.createCategory(req.body, tenantId);
  return sendCreated(res, 'Asset category created successfully', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const category = await inventoryService.updateCategory(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Asset category updated successfully', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deleteCategory(req.params.id, tenantId);
  return sendSuccess(res, 'Asset category deleted successfully');
});

// ─── ASSET CONTROLLERS ────────────────────────────────────────────────────────

const getAssets = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getAssets(req.query, tenantId);
  return sendPaginated(res, 'Assets retrieved successfully', data, pagination);
});

const createAsset = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const asset = await inventoryService.createAsset(req.body, req.file, tenantId);
  return sendCreated(res, 'Asset created successfully', asset);
});

const updateAsset = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const asset = await inventoryService.updateAsset(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Asset details updated successfully', asset);
});

const deleteAsset = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deleteAsset(req.params.id, tenantId);
  return sendSuccess(res, 'Asset deleted successfully');
});

// ─── VENDOR CONTROLLERS ───────────────────────────────────────────────────────

const getVendors = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getVendors(req.query, tenantId);
  return sendPaginated(res, 'Vendors retrieved successfully', data, pagination);
});

const createVendor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const vendor = await inventoryService.createVendor(req.body, tenantId);
  return sendCreated(res, 'Vendor created successfully', vendor);
});

const updateVendor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const vendor = await inventoryService.updateVendor(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Vendor details updated successfully', vendor);
});

const deleteVendor = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deleteVendor(req.params.id, tenantId);
  return sendSuccess(res, 'Vendor deleted successfully');
});

// ─── PURCHASE ORDER CONTROLLERS ───────────────────────────────────────────────

const getPurchaseOrders = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getPurchaseOrders(req.query, tenantId);
  return sendPaginated(res, 'Purchase orders retrieved successfully', data, pagination);
});

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const po = await inventoryService.createPurchaseOrder(req.body, tenantId);
  return sendCreated(res, 'Purchase order created successfully', po);
});

const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const po = await inventoryService.updatePurchaseOrder(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Purchase order updated successfully', po);
});

const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deletePurchaseOrder(req.params.id, tenantId);
  return sendSuccess(res, 'Purchase order deleted successfully');
});

// ─── STOCK CONTROLLERS ────────────────────────────────────────────────────────

const getStock = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getStock(req.query, tenantId);
  return sendPaginated(res, 'Stock items retrieved successfully', data, pagination);
});

const createStock = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const stockItem = await inventoryService.createStock(req.body, tenantId);
  return sendCreated(res, 'Stock item created successfully', stockItem);
});

const updateStock = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const stockItem = await inventoryService.updateStock(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Stock item updated successfully', stockItem);
});

const deleteStock = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deleteStock(req.params.id, tenantId);
  return sendSuccess(res, 'Stock item deleted successfully');
});

// ─── ASSET ALLOCATION CONTROLLERS ─────────────────────────────────────────────

const getAssetAllocations = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getAssetAllocations(req.query, tenantId);
  return sendPaginated(res, 'Asset allocations retrieved successfully', data, pagination);
});

const createAssetAllocation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const allocation = await inventoryService.createAssetAllocation(req.body, tenantId);
  return sendCreated(res, 'Asset allocated successfully', allocation);
});

const returnAssetAllocation = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const allocation = await inventoryService.returnAssetAllocation(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Asset return recorded successfully', allocation);
});

// ─── MAINTENANCE CONTROLLERS ─────────────────────────────────────────────────

const getMaintenanceLogs = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const { data, pagination } = await inventoryService.getMaintenanceLogs(req.query, tenantId);
  return sendPaginated(res, 'Maintenance logs retrieved successfully', data, pagination);
});

const createMaintenance = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const maintenance = await inventoryService.createMaintenance(req.body, tenantId);
  return sendCreated(res, 'Maintenance log created successfully', maintenance);
});

const updateMaintenance = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const maintenance = await inventoryService.updateMaintenance(req.params.id, req.body, tenantId);
  return sendSuccess(res, 'Maintenance log updated successfully', maintenance);
});

const deleteMaintenance = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  await inventoryService.deleteMaintenance(req.params.id, tenantId);
  return sendSuccess(res, 'Maintenance log deleted successfully');
});

// ─── REPORTS CONTROLLER ───────────────────────────────────────────────────────

const getInventoryReports = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || 'default_tenant';
  const reportData = await inventoryService.getInventoryReports(req.query, tenantId);
  return sendSuccess(res, 'Inventory report generated successfully', reportData);
});

module.exports = {
  getDashboardData,

  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,

  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,

  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,

  getStock,
  createStock,
  updateStock,
  deleteStock,

  getAssetAllocations,
  createAssetAllocation,
  returnAssetAllocation,

  getMaintenanceLogs,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,

  getInventoryReports
};
