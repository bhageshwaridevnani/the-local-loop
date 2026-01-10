const { query } = require('../config/database');
const { calculateDistance } = require('../utils/distance');
require('dotenv').config();

const DEFAULT_RADIUS = parseFloat(process.env.DEFAULT_RADIUS) || 5;

/**
 * Get available orders within delivery partner's radius
 */
const getAvailableOrders = async (req, res) => {
  try {
    const deliveryLat = req.user.latitude;
    const deliveryLng = req.user.longitude;
    const radius = req.radius || DEFAULT_RADIUS;

    if (!deliveryLat || !deliveryLng) {
      return res.status(400).json({
        success: false,
        error: 'Delivery partner location not available. Please update your profile.'
      });
    }

    // Get orders that are ready for pickup and within radius
    const result = await query(
      `SELECT 
        o.order_id, o.order_number, o.status, o.total_amount,
        o.delivery_address, o.delivery_pincode, o.customer_phone,
        o.created_at,
        v.name as vendor_name, v.shop_name, v.address as vendor_address,
        v.phone as vendor_phone, v.latitude as vendor_lat, v.longitude as vendor_lng,
        c.name as customer_name, c.latitude as customer_lat, c.longitude as customer_lng
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      JOIN users c ON o.customer_id = c.user_id
      WHERE o.status IN ('ready', 'confirmed')
        AND o.delivery_id IS NULL
        AND v.latitude IS NOT NULL
        AND v.longitude IS NOT NULL
      ORDER BY o.created_at ASC`,
      []
    );

    // Filter by distance and calculate distances
    const orders = result.rows
      .map(order => {
        const distanceToVendor = calculateDistance(
          deliveryLat,
          deliveryLng,
          order.vendor_lat,
          order.vendor_lng
        );

        const distanceToCustomer = calculateDistance(
          order.vendor_lat,
          order.vendor_lng,
          order.customer_lat,
          order.customer_lng
        );

        return {
          orderId: order.order_id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: parseFloat(order.total_amount),
          vendor: {
            name: order.vendor_name,
            shopName: order.shop_name,
            address: order.vendor_address,
            phone: order.vendor_phone,
            distanceFromYou: distanceToVendor
          },
          customer: {
            name: order.customer_name,
            address: order.delivery_address,
            pincode: order.delivery_pincode,
            phone: order.customer_phone
          },
          deliveryDistance: distanceToCustomer,
          totalDistance: distanceToVendor + distanceToCustomer,
          createdAt: order.created_at
        };
      })
      .filter(order => order.vendor.distanceFromYou <= radius)
      .sort((a, b) => a.totalDistance - b.totalDistance);

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length,
        radius,
        yourLocation: {
          latitude: deliveryLat,
          longitude: deliveryLng
        }
      }
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available orders',
      details: error.message
    });
  }
};

/**
 * Accept an order
 */
const acceptOrder = async (req, res) => {
  try {
    const deliveryId = req.user.userId;
    const orderId = req.params.orderId;
    const deliveryLat = req.user.latitude;
    const deliveryLng = req.user.longitude;

    if (!deliveryLat || !deliveryLng) {
      return res.status(400).json({
        success: false,
        error: 'Delivery partner location not available'
      });
    }

    // Check if order exists and is available
    const orderResult = await query(
      `SELECT o.*, v.latitude as vendor_lat, v.longitude as vendor_lng
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      WHERE o.order_id = $1 AND o.delivery_id IS NULL AND o.status IN ('ready', 'confirmed')`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or already assigned'
      });
    }

    const order = orderResult.rows[0];

    // Validate distance (vendor should be within 5km)
    const distance = calculateDistance(
      deliveryLat,
      deliveryLng,
      order.vendor_lat,
      order.vendor_lng
    );

    if (distance > DEFAULT_RADIUS) {
      return res.status(403).json({
        success: false,
        error: 'Vendor too far',
        details: {
          distance: distance.toFixed(2),
          maxDistance: DEFAULT_RADIUS,
          message: `Vendor is ${distance.toFixed(2)} km away. Maximum allowed distance is ${DEFAULT_RADIUS} km.`
        }
      });
    }

    // Assign order to delivery partner
    const result = await query(
      `UPDATE orders 
      SET delivery_id = $1, status = 'ready'
      WHERE order_id = $2
      RETURNING order_id, order_number, status`,
      [deliveryId, orderId]
    );

    const updatedOrder = result.rows[0];

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: {
        orderId: updatedOrder.order_id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        distance: distance.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept order',
      details: error.message
    });
  }
};

/**
 * Get delivery partner's assigned orders
 */
const getMyOrders = async (req, res) => {
  try {
    const deliveryId = req.user.userId;
    const status = req.query.status;

    let queryText = `
      SELECT 
        o.order_id, o.order_number, o.status, o.total_amount,
        o.delivery_address, o.delivery_pincode, o.customer_phone,
        o.created_at, o.picked_up_at, o.delivered_at,
        v.name as vendor_name, v.shop_name, v.address as vendor_address, v.phone as vendor_phone,
        c.name as customer_name
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      JOIN users c ON o.customer_id = c.user_id
      WHERE o.delivery_id = $1
    `;

    const params = [deliveryId];

    if (status) {
      queryText += ' AND o.status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY o.created_at DESC';

    const result = await query(queryText, params);

    const orders = result.rows.map(order => ({
      orderId: order.order_id,
      orderNumber: order.order_number,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      vendor: {
        name: order.vendor_name,
        shopName: order.shop_name,
        address: order.vendor_address,
        phone: order.vendor_phone
      },
      customer: {
        name: order.customer_name,
        address: order.delivery_address,
        pincode: order.delivery_pincode,
        phone: order.customer_phone
      },
      createdAt: order.created_at,
      pickedUpAt: order.picked_up_at,
      deliveredAt: order.delivered_at
    }));

    res.json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
};

/**
 * Get order details
 */
const getOrderDetails = async (req, res) => {
  try {
    const deliveryId = req.user.userId;
    const orderId = req.params.orderId;

    // Get order details
    const orderResult = await query(
      `SELECT 
        o.*, 
        v.name as vendor_name, v.shop_name, v.address as vendor_address, 
        v.phone as vendor_phone, v.latitude as vendor_lat, v.longitude as vendor_lng,
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        c.latitude as customer_lat, c.longitude as customer_lng
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      JOIN users c ON o.customer_id = c.user_id
      WHERE o.order_id = $1 AND o.delivery_id = $2`,
      [orderId, deliveryId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Calculate delivery distance
    const deliveryDistance = calculateDistance(
      order.vendor_lat,
      order.vendor_lng,
      order.customer_lat,
      order.customer_lng
    );

    // Get order items
    const itemsResult = await query(
      `SELECT 
        oi.*, p.name as product_name, p.unit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1`,
      [orderId]
    );

    const items = itemsResult.rows.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal),
      unit: item.unit
    }));

    res.json({
      success: true,
      data: {
        order: {
          orderId: order.order_id,
          orderNumber: order.order_number,
          status: order.status,
          subtotal: parseFloat(order.subtotal),
          deliveryFee: parseFloat(order.delivery_fee),
          totalAmount: parseFloat(order.total_amount),
          deliveryDistance: deliveryDistance,
          vendor: {
            name: order.vendor_name,
            shopName: order.shop_name,
            address: order.vendor_address,
            phone: order.vendor_phone,
            latitude: order.vendor_lat,
            longitude: order.vendor_lng
          },
          customer: {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
            address: order.delivery_address,
            pincode: order.delivery_pincode,
            latitude: order.customer_lat,
            longitude: order.customer_lng
          },
          createdAt: order.created_at,
          confirmedAt: order.confirmed_at,
          pickedUpAt: order.picked_up_at,
          deliveredAt: order.delivered_at
        },
        items
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      details: error.message
    });
  }
};

/**
 * Update order status (pickup/delivered)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const deliveryId = req.user.userId;
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['picked_up', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if order belongs to delivery partner
    const checkResult = await query(
      'SELECT order_id, status FROM orders WHERE order_id = $1 AND delivery_id = $2',
      [orderId, deliveryId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order status
    let updateQuery = 'UPDATE orders SET status = $1';
    const params = [status, orderId, deliveryId];

    if (status === 'picked_up') {
      updateQuery += ', picked_up_at = CURRENT_TIMESTAMP';
    } else if (status === 'delivered') {
      updateQuery += ', delivered_at = CURRENT_TIMESTAMP';
    }

    updateQuery += ' WHERE order_id = $2 AND delivery_id = $3 RETURNING order_id, order_number, status';

    const result = await query(updateQuery, params);
    const order = result.rows[0];

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order.order_id,
        orderNumber: order.order_number,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      details: error.message
    });
  }
};

/**
 * Get delivery partner dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const deliveryId = req.user.userId;

    // Get delivery stats
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_deliveries,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_deliveries,
        SUM(CASE WHEN status IN ('ready', 'picked_up') THEN 1 ELSE 0 END) as active_deliveries,
        SUM(CASE WHEN status = 'delivered' THEN delivery_fee ELSE 0 END) as total_earnings
      FROM orders 
      WHERE delivery_id = $1`,
      [deliveryId]
    );

    // Get today's stats
    const todayResult = await query(
      `SELECT 
        COUNT(*) as today_deliveries,
        SUM(delivery_fee) as today_earnings
      FROM orders 
      WHERE delivery_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [deliveryId]
    );

    const stats = statsResult.rows[0];
    const today = todayResult.rows[0];

    res.json({
      success: true,
      data: {
        deliveries: {
          total: parseInt(stats.total_deliveries),
          completed: parseInt(stats.completed_deliveries),
          active: parseInt(stats.active_deliveries)
        },
        earnings: {
          total: parseFloat(stats.total_earnings) || 0,
          today: parseFloat(today.today_earnings) || 0
        },
        today: {
          deliveries: parseInt(today.today_deliveries)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
};

module.exports = {
  getAvailableOrders,
  acceptOrder,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  getDashboardStats
};

// Made with Bob
