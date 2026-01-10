const { query } = require('../config/database');
const { calculateDistance } = require('../utils/distance');
require('dotenv').config();

const DEFAULT_RADIUS = parseFloat(process.env.DEFAULT_RADIUS) || 5;

/**
 * Get vendor's own products
 */
const getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const result = await query(
      `SELECT 
        product_id, name, description, category, price, 
        stock_quantity, unit, image_url, is_available, 
        created_at, updated_at
      FROM products 
      WHERE vendor_id = $1
      ORDER BY created_at DESC`,
      [vendorId]
    );

    const products = result.rows.map(p => ({
      productId: p.product_id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: parseFloat(p.price),
      stock: parseInt(p.stock_quantity),
      unit: p.unit,
      imageUrl: p.image_url,
      isAvailable: p.is_available,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    res.json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
};

/**
 * Add new product
 */
const addProduct = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { name, description, category, price, stock, unit, imageUrl } = req.body;

    // Validate required fields
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, price, stock'
      });
    }

    // Get vendor's area_id
    const vendorResult = await query(
      'SELECT area_id FROM users WHERE user_id = $1',
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const areaId = vendorResult.rows[0].area_id;

    // Insert product
    const result = await query(
      `INSERT INTO products (
        vendor_id, area_id, name, description, category, 
        price, stock_quantity, unit, image_url, is_available
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING product_id, name, category, price, stock_quantity, created_at`,
      [
        vendorId,
        areaId,
        name,
        description || null,
        category,
        price,
        stock,
        unit || 'piece',
        imageUrl || null,
        true
      ]
    );

    const product = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: {
        productId: product.product_id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        stock: parseInt(product.stock_quantity),
        createdAt: product.created_at
      }
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add product',
      details: error.message
    });
  }
};

/**
 * Update product
 */
const updateProduct = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const productId = req.params.productId;
    const { name, description, category, price, stock, unit, imageUrl, isAvailable } = req.body;

    // Check if product belongs to vendor
    const checkResult = await query(
      'SELECT product_id FROM products WHERE product_id = $1 AND vendor_id = $2',
      [productId, vendorId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or does not belong to you'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (stock !== undefined) {
      updates.push(`stock_quantity = $${paramCount++}`);
      values.push(stock);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramCount++}`);
      values.push(unit);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }
    if (isAvailable !== undefined) {
      updates.push(`is_available = $${paramCount++}`);
      values.push(isAvailable);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(productId);

    const updateQuery = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE product_id = $${paramCount}
      RETURNING product_id, name, category, price, stock_quantity, is_available, updated_at
    `;

    const result = await query(updateQuery, values);
    const product = result.rows[0];

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        productId: product.product_id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        stock: parseInt(product.stock_quantity),
        isAvailable: product.is_available,
        updatedAt: product.updated_at
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: error.message
    });
  }
};

/**
 * Delete product
 */
const deleteProduct = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const productId = req.params.productId;

    const result = await query(
      'DELETE FROM products WHERE product_id = $1 AND vendor_id = $2 RETURNING product_id',
      [productId, vendorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or does not belong to you'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message
    });
  }
};

/**
 * Get vendor's orders
 */
const getMyOrders = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const status = req.query.status;

    let queryText = `
      SELECT 
        o.order_id, o.order_number, o.status, o.total_amount,
        o.customer_vendor_distance, o.created_at, o.confirmed_at,
        c.name as customer_name, c.phone as customer_phone,
        o.delivery_address, o.delivery_pincode,
        d.name as delivery_person
      FROM orders o
      JOIN users c ON o.customer_id = c.user_id
      LEFT JOIN users d ON o.delivery_id = d.user_id
      WHERE o.vendor_id = $1
    `;

    const params = [vendorId];

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
      distance: order.customer_vendor_distance ? parseFloat(order.customer_vendor_distance) : null,
      customer: {
        name: order.customer_name,
        phone: order.customer_phone
      },
      deliveryAddress: order.delivery_address,
      deliveryPincode: order.delivery_pincode,
      deliveryPerson: order.delivery_person,
      createdAt: order.created_at,
      confirmedAt: order.confirmed_at
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
    const vendorId = req.user.userId;
    const orderId = req.params.orderId;

    // Get order details
    const orderResult = await query(
      `SELECT 
        o.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        d.name as delivery_person, d.phone as delivery_phone
      FROM orders o
      JOIN users c ON o.customer_id = c.user_id
      LEFT JOIN users d ON o.delivery_id = d.user_id
      WHERE o.order_id = $1 AND o.vendor_id = $2`,
      [orderId, vendorId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

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
          platformFee: parseFloat(order.platform_fee),
          totalAmount: parseFloat(order.total_amount),
          distance: order.customer_vendor_distance ? parseFloat(order.customer_vendor_distance) : null,
          deliveryAddress: order.delivery_address,
          deliveryPincode: order.delivery_pincode,
          customer: {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email
          },
          deliveryPerson: order.delivery_person ? {
            name: order.delivery_person,
            phone: order.delivery_phone
          } : null,
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
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const orderId = req.params.orderId;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if order belongs to vendor
    const checkResult = await query(
      'SELECT order_id, status FROM orders WHERE order_id = $1 AND vendor_id = $2',
      [orderId, vendorId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order status
    let updateQuery = 'UPDATE orders SET status = $1';
    const params = [status, orderId, vendorId];

    if (status === 'confirmed') {
      updateQuery += ', confirmed_at = CURRENT_TIMESTAMP';
    }

    updateQuery += ' WHERE order_id = $2 AND vendor_id = $3 RETURNING order_id, order_number, status';

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
 * Get vendor dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    // Get total products
    const productsResult = await query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_available = true THEN 1 ELSE 0 END) as available FROM products WHERE vendor_id = $1',
      [vendorId]
    );

    // Get orders stats
    const ordersResult = await query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders 
      WHERE vendor_id = $1`,
      [vendorId]
    );

    // Get today's orders
    const todayResult = await query(
      `SELECT COUNT(*) as today_orders, SUM(total_amount) as today_revenue
      FROM orders 
      WHERE vendor_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [vendorId]
    );

    const products = productsResult.rows[0];
    const orders = ordersResult.rows[0];
    const today = todayResult.rows[0];

    res.json({
      success: true,
      data: {
        products: {
          total: parseInt(products.total),
          available: parseInt(products.available)
        },
        orders: {
          total: parseInt(orders.total_orders),
          pending: parseInt(orders.pending_orders),
          completed: parseInt(orders.completed_orders)
        },
        revenue: {
          total: parseFloat(orders.total_revenue) || 0,
          today: parseFloat(today.today_revenue) || 0
        },
        today: {
          orders: parseInt(today.today_orders)
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
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  getDashboardStats
};

// Made with Bob
