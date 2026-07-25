const AssetCategory = require('./asset-category.model');
const Asset = require('./asset.model');
const Vendor = require('./vendor.model');
const PurchaseOrder = require('./purchase-order.model');
const Stock = require('./stock.model');
const AssetAllocation = require('./asset-allocation.model');
const Maintenance = require('./maintenance.model');
const ApiError = require('../../utils/apiError.util');
const { paginate } = require('../../utils/pagination.util');
const { buildSearchQuery, buildSortQuery } = require('../../utils/search.util');
const { uploadImage, deleteFile } = require('../../utils/upload.util');

// ─── DASHBOARD SERVICE ────────────────────────────────────────────────────────

const getInventoryDashboardData = async (tenantId = 'default_tenant') => {
  const [totalAssets, assets, stockItems, pendingMaintenance, recentPOs] = await Promise.all([
    Asset.countDocuments({ tenantId }),
    Asset.find({ tenantId }).lean(),
    Stock.find({ tenantId }).lean(),
    Maintenance.countDocuments({ tenantId, status: 'scheduled' }),
    PurchaseOrder.find({ tenantId }).sort({ orderDate: -1 }).limit(5).lean()
  ]);

  const availableAssets = assets.filter(a => a.status === 'available').length;
  const allocatedAssets = assets.filter(a => a.status === 'allocated').length;
  const lowStockItems = stockItems.filter(s => s.availableQuantity <= s.minimumStock).length;

  return {
    summary: {
      totalAssets,
      availableAssets,
      allocatedAssets,
      lowStockItems,
      pendingMaintenance,
      recentOrders: recentPOs.length
    },
    recentPOs
  };
};

// ─── ASSET CATEGORY SERVICES ──────────────────────────────────────────────────

const getCategories = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'categoryName', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['categoryName', 'description']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await AssetCategory.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await AssetCategory.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createCategory = async (data, tenantId = 'default_tenant') => {
  const name = data.categoryName.trim();
  const existing = await AssetCategory.findOne({ tenantId, categoryName: name });
  if (existing) throw ApiError.conflict(`Asset Category '${name}' already exists.`);

  const category = await AssetCategory.create({ ...data, categoryName: name, tenantId });
  return category;
};

const updateCategory = async (id, data, tenantId = 'default_tenant') => {
  const category = await AssetCategory.findOne({ _id: id, tenantId });
  if (!category) throw ApiError.notFound('Category not found.');

  if (data.categoryName && data.categoryName.trim() !== category.categoryName) {
    const name = data.categoryName.trim();
    const existing = await AssetCategory.findOne({ tenantId, categoryName: name });
    if (existing) throw ApiError.conflict(`Asset Category '${name}' already exists.`);
  }

  Object.assign(category, data);
  if (data.categoryName) category.categoryName = data.categoryName.trim();
  await category.save();
  return category;
};

const deleteCategory = async (id, tenantId = 'default_tenant') => {
  const category = await AssetCategory.findOne({ _id: id, tenantId });
  if (!category) throw ApiError.notFound('Category not found.');
  await AssetCategory.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── ASSET SERVICES ───────────────────────────────────────────────────────────

const getAssets = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'assetName', category, status } = queryParams;
  const filter = { tenantId };

  if (category) filter.category = category;
  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['assetName', 'assetCode', 'category', 'serialNumber', 'vendor', 'location']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Asset.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Asset.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createAsset = async (data, file = null, tenantId = 'default_tenant') => {
  const code = data.assetCode.trim().toUpperCase();
  const existing = await Asset.findOne({ tenantId, assetCode: code });
  if (existing) throw ApiError.conflict(`Asset Code '${code}' already exists.`);

  const asset = await Asset.create({
    ...data,
    assetCode: code,
    currentValue: data.purchaseCost || 0,
    tenantId
  });

  return asset;
};

const updateAsset = async (id, data, tenantId = 'default_tenant') => {
  const asset = await Asset.findOne({ _id: id, tenantId });
  if (!asset) throw ApiError.notFound('Asset record not found.');

  if (data.assetCode && data.assetCode.trim().toUpperCase() !== asset.assetCode) {
    const code = data.assetCode.trim().toUpperCase();
    const existing = await Asset.findOne({ tenantId, assetCode: code });
    if (existing) throw ApiError.conflict(`Asset Code '${code}' already exists.`);
  }

  Object.assign(asset, data);
  if (data.assetCode) asset.assetCode = data.assetCode.trim().toUpperCase();
  await asset.save();
  return asset;
};

const deleteAsset = async (id, tenantId = 'default_tenant') => {
  const asset = await Asset.findOne({ _id: id, tenantId });
  if (!asset) throw ApiError.notFound('Asset record not found.');
  await Asset.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── VENDOR SERVICES ─────────────────────────────────────────────────────────

const getVendors = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'vendorName' } = queryParams;
  const filter = { tenantId };

  const searchQuery = buildSearchQuery(search, ['vendorName', 'contactPerson', 'phone', 'email', 'address', 'taxId']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Vendor.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Vendor.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createVendor = async (data, tenantId = 'default_tenant') => {
  const name = data.vendorName.trim();
  const existing = await Vendor.findOne({ tenantId, vendorName: name });
  if (existing) throw ApiError.conflict(`Vendor '${name}' already exists.`);

  const vendor = await Vendor.create({ ...data, vendorName: name, tenantId });
  return vendor;
};

const updateVendor = async (id, data, tenantId = 'default_tenant') => {
  const vendor = await Vendor.findOne({ _id: id, tenantId });
  if (!vendor) throw ApiError.notFound('Vendor record not found.');

  if (data.vendorName && data.vendorName.trim() !== vendor.vendorName) {
    const name = data.vendorName.trim();
    const existing = await Vendor.findOne({ tenantId, vendorName: name });
    if (existing) throw ApiError.conflict(`Vendor '${name}' already exists.`);
  }

  Object.assign(vendor, data);
  if (data.vendorName) vendor.vendorName = data.vendorName.trim();
  await vendor.save();
  return vendor;
};

const deleteVendor = async (id, tenantId = 'default_tenant') => {
  const vendor = await Vendor.findOne({ _id: id, tenantId });
  if (!vendor) throw ApiError.notFound('Vendor record not found.');
  await Vendor.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── PURCHASE ORDER SERVICES ─────────────────────────────────────────────────

const getPurchaseOrders = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-orderDate', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['poNumber', 'vendor', 'orderDate', 'deliveryDate']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await PurchaseOrder.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await PurchaseOrder.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createPurchaseOrder = async (data, tenantId = 'default_tenant') => {
  const poNum = data.poNumber.trim().toUpperCase();
  const existing = await PurchaseOrder.findOne({ tenantId, poNumber: poNum });
  if (existing) throw ApiError.conflict(`PO Number '${poNum}' already exists.`);

  const po = await PurchaseOrder.create({ ...data, poNumber: poNum, tenantId });
  return po;
};

const updatePurchaseOrder = async (id, data, tenantId = 'default_tenant') => {
  const po = await PurchaseOrder.findOne({ _id: id, tenantId });
  if (!po) throw ApiError.notFound('Purchase Order not found.');

  const oldStatus = po.status;
  Object.assign(po, data);
  await po.save();

  // If status changed to completed, automatically add items to stock
  if (oldStatus !== 'completed' && po.status === 'completed' && Array.isArray(po.items)) {
    for (const item of po.items) {
      let stockItem = await Stock.findOne({ tenantId, itemName: item.itemName.trim() });
      if (stockItem) {
        stockItem.quantity += item.quantity;
        stockItem.availableQuantity += item.quantity;
        await stockItem.save();
      } else {
        await Stock.create({
          tenantId,
          itemName: item.itemName.trim(),
          category: 'General Supplies',
          quantity: item.quantity,
          minimumStock: 5,
          availableQuantity: item.quantity,
          unit: 'pcs'
        });
      }
    }
  }

  return po;
};

const deletePurchaseOrder = async (id, tenantId = 'default_tenant') => {
  const po = await PurchaseOrder.findOne({ _id: id, tenantId });
  if (!po) throw ApiError.notFound('Purchase Order not found.');
  await PurchaseOrder.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── STOCK MANAGEMENT SERVICES ──────────────────────────────────────────────

const getStock = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = 'itemName', category } = queryParams;
  const filter = { tenantId };

  if (category) filter.category = category;

  const searchQuery = buildSearchQuery(search, ['itemName', 'category', 'unit']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Stock.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Stock.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createStock = async (data, tenantId = 'default_tenant') => {
  const name = data.itemName.trim();
  const existing = await Stock.findOne({ tenantId, itemName: name });
  if (existing) throw ApiError.conflict(`Stock Item '${name}' already exists.`);

  const qty = parseInt(data.quantity, 10) || 0;
  const avail = data.availableQuantity !== undefined ? parseInt(data.availableQuantity, 10) : qty;

  const stockItem = await Stock.create({
    ...data,
    itemName: name,
    quantity: qty,
    availableQuantity: avail,
    tenantId
  });

  return stockItem;
};

const updateStock = async (id, data, tenantId = 'default_tenant') => {
  const stockItem = await Stock.findOne({ _id: id, tenantId });
  if (!stockItem) throw ApiError.notFound('Stock item not found.');

  Object.assign(stockItem, data);
  await stockItem.save();
  return stockItem;
};

const deleteStock = async (id, tenantId = 'default_tenant') => {
  const stockItem = await Stock.findOne({ _id: id, tenantId });
  if (!stockItem) throw ApiError.notFound('Stock item not found.');
  await Stock.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── ASSET ALLOCATION SERVICES (AUTO STATUS UPDATE) ───────────────────────────

const getAssetAllocations = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-allocationDate', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['assetCode', 'assetName', 'allocatedTo', 'remarks']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await AssetAllocation.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await AssetAllocation.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createAssetAllocation = async (data, tenantId = 'default_tenant') => {
  const code = data.assetCode.trim().toUpperCase();
  let asset = await Asset.findOne({ tenantId, assetCode: code });

  if (!asset) {
    // Auto-create asset entry if not found
    asset = await Asset.create({
      tenantId,
      assetName: data.assetName || 'General Asset',
      assetCode: code,
      category: 'General',
      purchaseDate: data.allocationDate,
      purchaseCost: 100,
      status: 'allocated'
    });
  } else if (asset.status === 'allocated') {
    throw ApiError.conflict(`Asset '${asset.assetName}' (${code}) is currently allocated.`);
  }

  const allocation = await AssetAllocation.create({
    ...data,
    assetCode: code,
    assetName: asset.assetName,
    tenantId,
    status: 'active'
  });

  // Update asset status to allocated
  asset.status = 'allocated';
  await asset.save();

  return allocation;
};

const returnAssetAllocation = async (id, data = {}, tenantId = 'default_tenant') => {
  const allocation = await AssetAllocation.findOne({ _id: id, tenantId });
  if (!allocation) throw ApiError.notFound('Allocation record not found.');

  allocation.status = 'returned';
  allocation.actualReturnDate = data.actualReturnDate || new Date().toISOString().split('T')[0];
  await allocation.save();

  // Restore asset status to available
  const asset = await Asset.findOne({ tenantId, assetCode: allocation.assetCode });
  if (asset) {
    asset.status = 'available';
    await asset.save();
  }

  return allocation;
};

// ─── MAINTENANCE SERVICES ────────────────────────────────────────────────────

const getMaintenanceLogs = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { page = 1, limit = 20, search = '', sort = '-scheduledDate', status } = queryParams;
  const filter = { tenantId };

  if (status) filter.status = status;

  const searchQuery = buildSearchQuery(search, ['assetCode', 'assetName', 'maintenanceType', 'vendor', 'notes']);
  if (searchQuery) Object.assign(filter, searchQuery);

  const total = await Maintenance.countDocuments(filter);
  const pagination = paginate(page, limit, total);
  const sortOptions = buildSortQuery(sort);

  const data = await Maintenance.find(filter)
    .sort(sortOptions)
    .skip(pagination.skip)
    .limit(pagination.limit);

  return { data, pagination: pagination.meta };
};

const createMaintenance = async (data, tenantId = 'default_tenant') => {
  const code = data.assetCode.trim().toUpperCase();
  let asset = await Asset.findOne({ tenantId, assetCode: code });

  if (!asset) {
    asset = await Asset.create({
      tenantId,
      assetName: data.assetName || 'General Asset',
      assetCode: code,
      category: 'General',
      purchaseDate: data.scheduledDate,
      purchaseCost: 100,
      status: 'maintenance'
    });
  } else {
    asset.status = 'maintenance';
    await asset.save();
  }

  const maintenance = await Maintenance.create({
    ...data,
    assetCode: code,
    assetName: asset.assetName,
    tenantId,
    status: 'scheduled'
  });

  return maintenance;
};

const updateMaintenance = async (id, data, tenantId = 'default_tenant') => {
  const maintenance = await Maintenance.findOne({ _id: id, tenantId });
  if (!maintenance) throw ApiError.notFound('Maintenance log not found.');

  Object.assign(maintenance, data);
  await maintenance.save();

  if (data.status === 'completed') {
    const asset = await Asset.findOne({ tenantId, assetCode: maintenance.assetCode });
    if (asset) {
      asset.status = 'available';
      await asset.save();
    }
  }

  return maintenance;
};

const deleteMaintenance = async (id, tenantId = 'default_tenant') => {
  const maintenance = await Maintenance.findOne({ _id: id, tenantId });
  if (!maintenance) throw ApiError.notFound('Maintenance log not found.');
  await Maintenance.deleteOne({ _id: id, tenantId });
  return true;
};

// ─── REPORTS SERVICE ──────────────────────────────────────────────────────────

const getInventoryReports = async (queryParams = {}, tenantId = 'default_tenant') => {
  const { reportType = 'assets' } = queryParams;

  if (reportType === 'assets') {
    const data = await Asset.find({ tenantId }).sort({ assetName: 1 }).lean();
    return { reportType, data };
  }

  if (reportType === 'stock') {
    const data = await Stock.find({ tenantId }).sort({ itemName: 1 }).lean();
    return { reportType, data };
  }

  if (reportType === 'vendors') {
    const data = await Vendor.find({ tenantId }).sort({ vendorName: 1 }).lean();
    return { reportType, data };
  }

  if (reportType === 'allocations') {
    const data = await AssetAllocation.find({ tenantId }).sort({ allocationDate: -1 }).lean();
    return { reportType, data };
  }

  const data = await Maintenance.find({ tenantId }).sort({ scheduledDate: -1 }).lean();
  return { reportType, data };
};

module.exports = {
  getInventoryDashboardData,

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
