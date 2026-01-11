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

// Optional authentication middleware - attaches user if token present, but doesn't require it
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    // If token exists, use authenticate middleware
    return authenticate(req, res, next);
  }
  // No token, continue without user
  next();
};

// Public routes (with optional auth for area filtering)
router.get('/', optionalAuth, getVendors);
router.get('/:id', getVendor);

// Protected routes (vendor only)
router.get('/vendor/stats', authenticate, getVendorStats);
router.put('/vendor/settings', authenticate, updateVendorSettings);
router.patch('/vendor/toggle-status', authenticate, toggleShopStatus);

export default router;

