const { body, param } = require('express-validator');

// Asset Category Validators
const createCategoryRules = [
  body('categoryName').trim().notEmpty().withMessage('Category Name is required'),
  body('status').optional().isIn(['active', 'inactive'])
];

const updateCategoryRules = [
  param('id').isMongoId().withMessage('Invalid Category ID'),
  body('categoryName').optional().trim().notEmpty(),
  body('status').optional().isIn(['active', 'inactive'])
];

// Asset Validators
const createAssetRules = [
  body('assetName').trim().notEmpty().withMessage('Asset Name is required'),
  body('assetCode').trim().notEmpty().withMessage('Asset Code is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('purchaseDate').trim().notEmpty().withMessage('Purchase Date is required'),
  body('purchaseCost').notEmpty().isFloat({ min: 0 }).withMessage('Purchase Cost must be a positive number')
];

const updateAssetRules = [
  param('id').isMongoId().withMessage('Invalid Asset ID'),
  body('assetName').optional().trim().notEmpty(),
  body('assetCode').optional().trim().notEmpty(),
  body('purchaseCost').optional().isFloat({ min: 0 })
];

// Vendor Validators
const createVendorRules = [
  body('vendorName').trim().notEmpty().withMessage('Vendor Name is required'),
  body('email').optional().isEmail().withMessage('Valid email required')
];

const updateVendorRules = [
  param('id').isMongoId().withMessage('Invalid Vendor ID'),
  body('vendorName').optional().trim().notEmpty()
];

// Purchase Order Validators
const createPurchaseOrderRules = [
  body('poNumber').trim().notEmpty().withMessage('PO Number is required'),
  body('vendor').trim().notEmpty().withMessage('Vendor Name is required'),
  body('orderDate').trim().notEmpty().withMessage('Order Date is required'),
  body('totalAmount').notEmpty().isFloat({ min: 0 }).withMessage('Total Amount must be positive')
];

const updatePurchaseOrderRules = [
  param('id').isMongoId().withMessage('Invalid Purchase Order ID'),
  body('poNumber').optional().trim().notEmpty()
];

// Stock Validators
const createStockRules = [
  body('itemName').trim().notEmpty().withMessage('Item Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').notEmpty().isInt({ min: 0 }).withMessage('Quantity must be non-negative')
];

const updateStockRules = [
  param('id').isMongoId().withMessage('Invalid Stock ID'),
  body('itemName').optional().trim().notEmpty(),
  body('quantity').optional().isInt({ min: 0 })
];

// Asset Allocation Validators
const createAllocationRules = [
  body('assetCode').trim().notEmpty().withMessage('Asset Code is required'),
  body('allocatedTo').trim().notEmpty().withMessage('Allocated To is required'),
  body('allocationDate').trim().notEmpty().withMessage('Allocation Date is required')
];

const updateAllocationRules = [
  param('id').isMongoId().withMessage('Invalid Allocation ID')
];

// Maintenance Validators
const createMaintenanceRules = [
  body('assetCode').trim().notEmpty().withMessage('Asset Code is required'),
  body('scheduledDate').trim().notEmpty().withMessage('Scheduled Date is required')
];

const updateMaintenanceRules = [
  param('id').isMongoId().withMessage('Invalid Maintenance ID')
];

module.exports = {
  createCategoryRules,
  updateCategoryRules,
  createAssetRules,
  updateAssetRules,
  createVendorRules,
  updateVendorRules,
  createPurchaseOrderRules,
  updatePurchaseOrderRules,
  createStockRules,
  updateStockRules,
  createAllocationRules,
  updateAllocationRules,
  createMaintenanceRules,
  updateMaintenanceRules
};
