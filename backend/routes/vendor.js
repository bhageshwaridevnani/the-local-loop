const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken, isVendor } = require('../middleware/auth');

/**
 * @route   GET /api/vendor/dashboard
 * @desc    Get vendor dashboard statistics
 * @access  Private (Vendor only)
 */
router.get('/dashboard', authenticateToken, isVendor, vendorController.getDashboardStats);

/**
 * @route   GET /api/vendor/products
 * @desc    Get vendor's products
 * @access  Private (Vendor only)
 */
router.get('/products', authenticateToken, isVendor, vendorController.getMyProducts);

/**
 * @route   POST /api/vendor/products
 * @desc    Add new product
 * @access  Private (Vendor only)
 */
router.post('/products', authenticateToken, isVendor, vendorController.addProduct);

/**
 * @route   PUT /api/vendor/products/:productId
 * @desc    Update product
 * @access  Private (Vendor only)
 */
router.put('/products/:productId', authenticateToken, isVendor, vendorController.updateProduct);

/**
 * @route   DELETE /api/vendor/products/:productId
 * @desc    Delete product
 * @access  Private (Vendor only)
 */
router.delete('/products/:productId', authenticateToken, isVendor, vendorController.deleteProduct);

/**
 * @route   GET /api/vendor/orders
 * @desc    Get vendor's orders
 * @access  Private (Vendor only)
 * @query   status - Filter by order status (optional)
 */
router.get('/orders', authenticateToken, isVendor, vendorController.getMyOrders);

/**
 * @route   GET /api/vendor/orders/:orderId
 * @desc    Get order details
 * @access  Private (Vendor only)
 */
router.get('/orders/:orderId', authenticateToken, isVendor, vendorController.getOrderDetails);

/**
 * @route   PUT /api/vendor/orders/:orderId/status
 * @desc    Update order status
 * @access  Private (Vendor only)
 */
router.put('/orders/:orderId/status', authenticateToken, isVendor, vendorController.updateOrderStatus);

module.exports = router;

// Made with Bob
