const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, isCustomer } = require('../middleware/auth');
const { validateRadius, requireLocation } = require('../middleware/distanceValidation');

/**
 * @route   GET /api/customer/vendors
 * @desc    Get nearby vendors within specified radius
 * @access  Private (Customer only)
 * @query   radius - Search radius in km (default: 5, max: 10)
 */
router.get(
  '/vendors',
  authenticateToken,
  isCustomer,
  requireLocation,
  validateRadius,
  customerController.getNearbyVendors
);

/**
 * @route   GET /api/customer/products
 * @desc    Get products from nearby vendors
 * @access  Private (Customer only)
 * @query   radius - Search radius in km (default: 5)
 * @query   category - Filter by product category (optional)
 */
router.get(
  '/products',
  authenticateToken,
  isCustomer,
  requireLocation,
  validateRadius,
  customerController.getNearbyProducts
);

/**
 * @route   GET /api/customer/vendors/:vendorId
 * @desc    Get vendor details with products
 * @access  Private (Customer only)
 */
router.get(
  '/vendors/:vendorId',
  authenticateToken,
  isCustomer,
  requireLocation,
  customerController.getVendorDetails
);

/**
 * @route   POST /api/customer/orders
 * @desc    Place a new order
 * @access  Private (Customer only)
 */
router.post(
  '/orders',
  authenticateToken,
  isCustomer,
  requireLocation,
  customerController.placeOrder
);

/**
 * @route   GET /api/customer/orders
 * @desc    Get customer's orders
 * @access  Private (Customer only)
 * @query   status - Filter by order status (optional)
 */
router.get(
  '/orders',
  authenticateToken,
  isCustomer,
  customerController.getMyOrders
);

/**
 * @route   GET /api/customer/orders/:orderId
 * @desc    Get order details
 * @access  Private (Customer only)
 */
router.get(
  '/orders/:orderId',
  authenticateToken,
  isCustomer,
  customerController.getOrderDetails
);

module.exports = router;

