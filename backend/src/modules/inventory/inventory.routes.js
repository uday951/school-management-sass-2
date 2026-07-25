const express = require('express');

const { optionalAuthenticate } = require('../../middlewares/auth.middleware');
const { authorizeRoles } = require('../../middlewares/role.middleware');
const { uploadImage, handleMulterError } = require('../../middlewares/upload.middleware');
const { validate } = require('../../middlewares/validation.middleware');
const ROLES = require('../../constants/roles');

const inventoryController = require('./inventory.controller');

const {
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
  createMaintenanceRules,
  updateMaintenanceRules
} = require('./inventory.validator');

const router = express.Router();

// ─── DASHBOARD ROUTE ─────────────────────────────────────────────────────────

router.get(
  '/inventory/dashboard',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getDashboardData
);

// ─── ASSET CATEGORY ROUTES ───────────────────────────────────────────────────

router.get(
  '/asset-categories',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getCategories
);

router.post(
  '/asset-categories',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createCategoryRules,
  validate,
  inventoryController.createCategory
);

router.put(
  '/asset-categories/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateCategoryRules,
  validate,
  inventoryController.updateCategory
);

router.delete(
  '/asset-categories/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deleteCategory
);

// ─── ASSET ROUTES ────────────────────────────────────────────────────────────

router.get(
  '/assets',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getAssets
);

router.post(
  '/assets',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  uploadImage.single('image'),
  handleMulterError,
  createAssetRules,
  validate,
  inventoryController.createAsset
);

router.put(
  '/assets/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateAssetRules,
  validate,
  inventoryController.updateAsset
);

router.delete(
  '/assets/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deleteAsset
);

// ─── VENDOR ROUTES ───────────────────────────────────────────────────────────

router.get(
  '/vendors',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getVendors
);

router.post(
  '/vendors',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createVendorRules,
  validate,
  inventoryController.createVendor
);

router.put(
  '/vendors/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateVendorRules,
  validate,
  inventoryController.updateVendor
);

router.delete(
  '/vendors/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deleteVendor
);

// ─── PURCHASE ORDER ROUTES ───────────────────────────────────────────────────

router.get(
  '/purchase-orders',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getPurchaseOrders
);

router.post(
  '/purchase-orders',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createPurchaseOrderRules,
  validate,
  inventoryController.createPurchaseOrder
);

router.put(
  '/purchase-orders/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updatePurchaseOrderRules,
  validate,
  inventoryController.updatePurchaseOrder
);

router.delete(
  '/purchase-orders/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deletePurchaseOrder
);

// ─── STOCK ROUTES ────────────────────────────────────────────────────────────

router.get(
  '/stock',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getStock
);

router.post(
  '/stock',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createStockRules,
  validate,
  inventoryController.createStock
);

router.put(
  '/stock/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateStockRules,
  validate,
  inventoryController.updateStock
);

router.delete(
  '/stock/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deleteStock
);

// ─── ASSET ALLOCATION ROUTES ─────────────────────────────────────────────────

router.get(
  '/asset-allocation',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getAssetAllocations
);

router.post(
  '/asset-allocation',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createAllocationRules,
  validate,
  inventoryController.createAssetAllocation
);

router.put(
  '/asset-allocation/:id/return',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.returnAssetAllocation
);

// ─── MAINTENANCE ROUTES ──────────────────────────────────────────────────────

router.get(
  '/maintenance',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getMaintenanceLogs
);

router.post(
  '/maintenance',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  createMaintenanceRules,
  validate,
  inventoryController.createMaintenance
);

router.put(
  '/maintenance/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  updateMaintenanceRules,
  validate,
  inventoryController.updateMaintenance
);

router.delete(
  '/maintenance/:id',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.deleteMaintenance
);

// ─── INVENTORY REPORTS ROUTE ─────────────────────────────────────────────────

router.get(
  '/inventory-reports',
  optionalAuthenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN),
  inventoryController.getInventoryReports
);

module.exports = router;
