const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticateToken, isDelivery } = require('../middleware/auth');
const { validateRadius, requireLocation } = require('../middleware/distanceValidation');

/**
 * @route   GET /api/delivery/dashboard
 * @desc    Get delivery partner dashboard statistics
 * @access  Private (Delivery only)
 */
router.get('/dashboard', authenticateToken, isDelivery, deliveryController.getDashboardStats);

/**
 * @route   GET /api/delivery/available-orders
 * @desc    Get available orders within radius
 * @access  Private (Delivery only)
 * @query   radius - Search radius in km (default: 5)
 */
router.get(
  '/available-orders',
  authenticateToken,
  isDelivery,
  requireLocation,
  validateRadius,
  deliveryController.getAvailableOrders
);

/**
 * @route   POST /api/delivery/orders/:orderId/accept
 * @desc    Accept an order
 * @access  Private (Delivery only)
 */
router.post(
  '/orders/:orderId/accept',
  authenticateToken,
  isDelivery,
  requireLocation,
  deliveryController.acceptOrder
);

/**
 * @route   GET /api/delivery/orders
 * @desc    Get delivery partner's assigned orders
 * @access  Private (Delivery only)
 * @query   status - Filter by order status (optional)
 */
router.get('/orders', authenticateToken, isDelivery, deliveryController.getMyOrders);

/**
 * @route   GET /api/delivery/orders/:orderId
 * @desc    Get order details
 * @access  Private (Delivery only)
 */
router.get('/orders/:orderId', authenticateToken, isDelivery, deliveryController.getOrderDetails);

/**
 * @route   PUT /api/delivery/orders/:orderId/status
 * @desc    Update order status (pickup/delivered)
 * @access  Private (Delivery only)
 */
router.put('/orders/:orderId/status', authenticateToken, isDelivery, deliveryController.updateOrderStatus);

module.exports = router;

// Made with Bob
