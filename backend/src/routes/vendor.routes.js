import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  getVendors,
  getVendor,
  getVendorStats,
  updateVendorSettings,
  toggleShopStatus
} from '../controllers/vendor.controller.js';

const router = express.Router();

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendor);

// Protected routes (vendor only)
router.get('/vendor/stats', authenticate, getVendorStats);
router.put('/vendor/settings', authenticate, updateVendorSettings);
router.patch('/vendor/toggle-status', authenticate, toggleShopStatus);

export default router;

