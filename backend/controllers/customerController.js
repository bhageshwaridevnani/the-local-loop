const { query } = require('../config/database');
const { calculateDistance } = require('../utils/distance');
require('dotenv').config();

const DEFAULT_RADIUS = parseFloat(process.env.DEFAULT_RADIUS) || 5;

/**
 * Get nearby vendors within specified radius
 */
const getNearbyVendors = async (req, res) => {
  try {
    const customerLat = req.user.latitude;
    const customerLng = req.user.longitude;
    const radius = req.radius || DEFAULT_RADIUS;

    if (!customerLat || !customerLng) {
      return res.status(400).json({
        success: false,
        error: 'Customer location not available. Please update your profile.'
      });
    }

    // Use PostgreSQL function to get nearby vendors
    const result = await query(
      'SELECT * FROM get_nearby_vendors($1, $2, $3)',
      [customerLat, customerLng, radius]
    );

    const vendors = result.rows.map(vendor => ({
      vendorId: vendor.vendor_id,
      name: vendor.vendor_name,
      email: vendor.vendor_email,
      phone: vendor.vendor_phone,
      address: vendor.vendor_address,
      shopName: vendor.shop_name,
      shopCategory: vendor.shop_category,
      distance: parseFloat(vendor.distance_km),
      productsCount: parseInt(vendor.products_count)
    }));

    res.json({
      success: true,
      data: {
        vendors,
        count: vendors.length,
        radius,
        customerLocation: {
          latitude: customerLat,
          longitude: customerLng
        }
      }
    });
  } catch (error) {
    console.error('Get nearby vendors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby vendors',
      details: error.message
    });
  }
};

/**
 * Get products from nearby vendors
 */
const getNearbyProducts = async (req, res) => {
  try {
    const customerLat = req.user.latitude;
    const customerLng = req.user.longitude;
    const radius = req.radius || DEFAULT_RADIUS;
    const category = req.query.category || null;

    if (!customerLat || !customerLng) {
      return res.status(400).json({
        success: false,
        error: 'Customer location not available. Please update your profile.'
      });
    }

    // Use PostgreSQL function to get nearby products
    const result = await query(
      'SELECT * FROM get_nearby_products($1, $2, $3, $4)',
      [customerLat, customerLng, radius, category]
    );

    const products = result.rows.map(product => ({
      productId: product.product_id,
      name: product.product_name,
      category: product.category,
      price: parseFloat(product.price),
      stock: parseInt(product.stock_quantity),
      vendor: {
        vendorId: product.vendor_id,
        name: product.vendor_name,
        shopName: product.shop_name
      },
      distance: parseFloat(product.distance_km)
    }));

    res.json({
      success: true,
      data: {
        products,
        count: products.length,
        radius,
        category: category || 'all'
      }
    });
  } catch (error) {
    console.error('Get nearby products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby products',
      details: error.message
    });
  }
};

/**
 * Get vendor details with distance
 */
const getVendorDetails = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const customerLat = req.user.latitude;
    const customerLng = req.user.longitude;

    if (!customerLat || !customerLng) {
      return res.status(400).json({
        success: false,
        error: 'Customer location not available'
      });
    }

    // Get vendor details
    const vendorResult = await query(
      `SELECT 
        user_id, name, email, phone, address, 
        shop_name, shop_category, latitude, longitude,
        is_active, is_verified
      FROM users 
      WHERE user_id = $1 AND role = 'vendor'`,
      [vendorId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    const vendor = vendorResult.rows[0];

    // Calculate distance
    const distance = calculateDistance(
      customerLat,
      customerLng,
      vendor.latitude,
      vendor.longitude
    );

    // Get vendor's products
    const productsResult = await query(
      `SELECT 
        product_id, name, description, category, 
        price, stock_quantity, unit, image_url, is_available
      FROM products 
      WHERE vendor_id = $1 AND is_available = true
      ORDER BY name`,
      [vendorId]
    );

    const products = productsResult.rows.map(p => ({
      productId: p.product_id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: parseFloat(p.price),
      stock: parseInt(p.stock_quantity),
      unit: p.unit,
      imageUrl: p.image_url,
      isAvailable: p.is_available
    }));

    res.json({
      success: true,
      data: {
        vendor: {
          vendorId: vendor.user_id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          address: vendor.address,
          shopName: vendor.shop_name,
          shopCategory: vendor.shop_category,
          isActive: vendor.is_active,
          isVerified: vendor.is_verified,
          distance: distance
        },
        products,
        productsCount: products.length
      }
    });
  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendor details',
      details: error.message
    });
  }
};

/**
 * Place an order
 */
const placeOrder = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { vendorId, items, deliveryAddress, deliveryPincode, customerPhone } = req.body;

    // Validate input
    if (!vendorId || !items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: vendorId, items, deliveryAddress'
      });
    }

    // Get customer and vendor locations
    const customerResult = await query(
      'SELECT latitude, longitude, area_id FROM users WHERE user_id = $1',
      [customerId]
    );

    const vendorResult = await query(
      'SELECT latitude, longitude, area_id, name, shop_name FROM users WHERE user_id = $1 AND role = $2',
      [vendorId, 'vendor']
    );

    if (customerResult.rows.length === 0 || vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer or vendor not found'
      });
    }

    const customer = customerResult.rows[0];
    const vendor = vendorResult.rows[0];

    // Calculate distance
    const distance = calculateDistance(
      customer.latitude,
      customer.longitude,
      vendor.latitude,
      vendor.longitude
    );

    // Validate distance (within 5km)
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

    // Calculate order total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await query(
        'SELECT product_id, name, price, stock_quantity FROM products WHERE product_id = $1 AND vendor_id = $2 AND is_available = true',
        [item.productId, vendorId]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.productId} not found or not available`
        });
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
        });
      }

      const itemSubtotal = parseFloat(product.price) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product.product_id,
        quantity: item.quantity,
        unitPrice: parseFloat(product.price),
        subtotal: itemSubtotal
      });
    }

    const deliveryFee = 10.00;
    const platformFee = 0.00;
    const totalAmount = subtotal + deliveryFee + platformFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${customerId}`;

    // Insert order
    const orderResult = await query(
      `INSERT INTO orders (
        area_id, customer_id, vendor_id, order_number, status,
        subtotal, delivery_fee, platform_fee, total_amount,
        delivery_address, delivery_pincode, customer_phone,
        customer_vendor_distance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING order_id, order_number, status, total_amount, created_at`,
      [
        customer.area_id,
        customerId,
        vendorId,
        orderNumber,
        'pending',
        subtotal,
        deliveryFee,
        platformFee,
        totalAmount,
        deliveryAddress,
        deliveryPincode || customer.pincode,
        customerPhone || req.user.phone,
        distance
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.order_id, item.productId, item.quantity, item.unitPrice, item.subtotal]
      );

      // Update product stock
      await query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.order_id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: parseFloat(order.total_amount),
        distance: distance.toFixed(2),
        vendor: {
          name: vendor.name,
          shopName: vendor.shop_name
        },
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order',
      details: error.message
    });
  }
};

/**
 * Get customer's orders
 */
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const status = req.query.status;

    let queryText = `
      SELECT 
        o.order_id, o.order_number, o.status, o.total_amount,
        o.customer_vendor_distance, o.created_at, o.delivered_at,
        v.name as vendor_name, v.shop_name,
        d.name as delivery_person
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      LEFT JOIN users d ON o.delivery_id = d.user_id
      WHERE o.customer_id = $1
    `;

    const params = [customerId];

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
      vendor: {
        name: order.vendor_name,
        shopName: order.shop_name
      },
      deliveryPerson: order.delivery_person,
      createdAt: order.created_at,
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
    const customerId = req.user.userId;
    const orderId = req.params.orderId;

    // Get order details
    const orderResult = await query(
      `SELECT 
        o.*, 
        v.name as vendor_name, v.shop_name, v.phone as vendor_phone,
        d.name as delivery_person, d.phone as delivery_phone
      FROM orders o
      JOIN users v ON o.vendor_id = v.user_id
      LEFT JOIN users d ON o.delivery_id = d.user_id
      WHERE o.order_id = $1 AND o.customer_id = $2`,
      [orderId, customerId]
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
          customerPhone: order.customer_phone,
          vendor: {
            name: order.vendor_name,
            shopName: order.shop_name,
            phone: order.vendor_phone
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

module.exports = {
  getNearbyVendors,
  getNearbyProducts,
  getVendorDetails,
  placeOrder,
  getMyOrders,
  getOrderDetails
};

