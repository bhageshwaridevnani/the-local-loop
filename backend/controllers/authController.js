const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const axios = require('axios');
require('dotenv').config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      address,
      pincode,
      city,
      shopName,
      shopCategory,
      vehicleType,
      vehicleNumber
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role || !address || !pincode || !city) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate role
    if (!['customer', 'vendor', 'delivery'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be customer, vendor, or delivery'
      });
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Validate address with AI service
    let areaId = 1; // Default to Ahmedabad
    let latitude = null;
    let longitude = null;
    let locationVerified = false;

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/agents/area-validation`, {
        address,
        pincode,
        city
      });

      if (aiResponse.data.valid) {
        areaId = aiResponse.data.area_id || 1;
        latitude = aiResponse.data.latitude;
        longitude = aiResponse.data.longitude;
        locationVerified = true;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Address validation failed',
          details: aiResponse.data.message
        });
      }
    } catch (aiError) {
      console.error('AI validation error:', aiError.message);
      // Continue with registration but mark location as unverified
      console.log('Continuing registration without AI validation');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const insertQuery = `
      INSERT INTO users (
        area_id, name, email, password_hash, phone, role,
        address, pincode, city, latitude, longitude, location_verified,
        shop_name, shop_category, vehicle_type, vehicle_number,
        is_verified, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING user_id, name, email, role, area_id, latitude, longitude, is_verified, created_at
    `;

    const values = [
      areaId,
      name,
      email,
      passwordHash,
      phone || null,
      role,
      address,
      pincode,
      city,
      latitude,
      longitude,
      locationVerified,
      role === 'vendor' ? shopName : null,
      role === 'vendor' ? shopCategory : null,
      role === 'delivery' ? vehicleType : null,
      role === 'delivery' ? vehicleNumber : null,
      false, // is_verified
      true   // is_active
    ];

    const result = await query(insertQuery, values);
    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          areaId: user.area_id,
          latitude: user.latitude,
          longitude: user.longitude,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: error.message
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const result = await query(
      `SELECT 
        user_id, name, email, password_hash, role, area_id,
        latitude, longitude, is_verified, is_active,
        shop_name, shop_category, vehicle_type
      FROM users 
      WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          areaId: user.area_id,
          latitude: user.latitude,
          longitude: user.longitude,
          isVerified: user.is_verified,
          shopName: user.shop_name,
          shopCategory: user.shop_category,
          vehicleType: user.vehicle_type
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT 
        user_id, name, email, phone, role, area_id,
        address, pincode, city, latitude, longitude, location_verified,
        shop_name, shop_category, vehicle_type, vehicle_number,
        is_verified, is_active, created_at
      FROM users 
      WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        areaId: user.area_id,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        latitude: user.latitude,
        longitude: user.longitude,
        locationVerified: user.location_verified,
        shopName: user.shop_name,
        shopCategory: user.shop_category,
        vehicleType: user.vehicle_type,
        vehicleNumber: user.vehicle_number,
        isVerified: user.is_verified,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: error.message
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, shopName, shopCategory, vehicleType, vehicleNumber } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (shopName) {
      updates.push(`shop_name = $${paramCount++}`);
      values.push(shopName);
    }
    if (shopCategory) {
      updates.push(`shop_category = $${paramCount++}`);
      values.push(shopCategory);
    }
    if (vehicleType) {
      updates.push(`vehicle_type = $${paramCount++}`);
      values.push(vehicleType);
    }
    if (vehicleNumber) {
      updates.push(`vehicle_number = $${paramCount++}`);
      values.push(vehicleNumber);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING user_id, name, email, phone, role, address, shop_name, shop_category, vehicle_type, vehicle_number
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      details: error.message
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  logout
};

