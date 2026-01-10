const { calculateDistance } = require('../utils/distance');
require('dotenv').config();

const DEFAULT_RADIUS = parseFloat(process.env.DEFAULT_RADIUS) || 5;
const MAX_RADIUS = parseFloat(process.env.MAX_RADIUS) || 10;

/**
 * Middleware to validate distance between user and target location
 */
const validateDistance = (maxDistance = DEFAULT_RADIUS) => {
  return (req, res, next) => {
    try {
      // Get user's location from JWT token
      const userLat = req.user?.latitude;
      const userLng = req.user?.longitude;

      if (!userLat || !userLng) {
        return res.status(400).json({
          success: false,
          error: 'User location not available. Please update your profile with location.'
        });
      }

      // Get target location from request body or query
      const targetLat = parseFloat(req.body.latitude || req.query.latitude);
      const targetLng = parseFloat(req.body.longitude || req.query.longitude);

      if (!targetLat || !targetLng) {
        return res.status(400).json({
          success: false,
          error: 'Target location coordinates required'
        });
      }

      // Calculate distance
      const distance = calculateDistance(userLat, userLng, targetLat, targetLng);

      if (distance === null) {
        return res.status(400).json({
          success: false,
          error: 'Unable to calculate distance'
        });
      }

      // Check if within allowed radius
      if (distance > maxDistance) {
        return res.status(403).json({
          success: false,
          error: 'Location too far',
          details: {
            distance: distance,
            maxDistance: maxDistance,
            message: `Target location is ${distance.toFixed(2)} km away. Maximum allowed distance is ${maxDistance} km.`
          }
        });
      }

      // Attach distance to request for use in route handlers
      req.distance = distance;
      next();
    } catch (error) {
      console.error('Distance validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Distance validation failed'
      });
    }
  };
};

/**
 * Middleware to validate radius parameter
 */
const validateRadius = (req, res, next) => {
  try {
    let radius = parseFloat(req.query.radius || req.body.radius || DEFAULT_RADIUS);

    // Ensure radius is within allowed limits
    if (isNaN(radius) || radius <= 0) {
      radius = DEFAULT_RADIUS;
    }

    if (radius > MAX_RADIUS) {
      return res.status(400).json({
        success: false,
        error: `Radius cannot exceed ${MAX_RADIUS} km`
      });
    }

    // Attach validated radius to request
    req.radius = radius;
    next();
  } catch (error) {
    console.error('Radius validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Radius validation failed'
    });
  }
};

/**
 * Middleware to ensure user has location coordinates
 */
const requireLocation = (req, res, next) => {
  try {
    const userLat = req.user?.latitude;
    const userLng = req.user?.longitude;

    if (!userLat || !userLng) {
      return res.status(400).json({
        success: false,
        error: 'Location not set',
        message: 'Please update your profile with your location coordinates to use this feature.'
      });
    }

    next();
  } catch (error) {
    console.error('Location requirement error:', error);
    return res.status(500).json({
      success: false,
      error: 'Location validation failed'
    });
  }
};

/**
 * Middleware to validate vendor is within customer's radius
 */
const validateVendorDistance = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    
    const customerLat = req.user?.latitude;
    const customerLng = req.user?.longitude;
    const vendorId = req.params.vendorId || req.body.vendorId;
    const radius = req.radius || DEFAULT_RADIUS;

    if (!customerLat || !customerLng) {
      return res.status(400).json({
        success: false,
        error: 'Customer location not available'
      });
    }

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID required'
      });
    }

    // Get vendor location
    const result = await query(
      'SELECT latitude, longitude, name, shop_name FROM users WHERE user_id = $1 AND role = $2 AND is_active = true',
      [vendorId, 'vendor']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found or inactive'
      });
    }

    const vendor = result.rows[0];

    if (!vendor.latitude || !vendor.longitude) {
      return res.status(400).json({
        success: false,
        error: 'Vendor location not available'
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      customerLat,
      customerLng,
      vendor.latitude,
      vendor.longitude
    );

    if (distance === null || distance > radius) {
      return res.status(403).json({
        success: false,
        error: 'Vendor too far',
        details: {
          vendorName: vendor.shop_name || vendor.name,
          distance: distance ? distance.toFixed(2) : 'N/A',
          maxDistance: radius,
          message: `This vendor is ${distance ? distance.toFixed(2) : 'too far'} km away. Maximum allowed distance is ${radius} km.`
        }
      });
    }

    // Attach vendor info and distance to request
    req.vendor = vendor;
    req.vendorDistance = distance;
    next();
  } catch (error) {
    console.error('Vendor distance validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Vendor distance validation failed'
    });
  }
};

module.exports = {
  validateDistance,
  validateRadius,
  requireLocation,
  validateVendorDistance,
  DEFAULT_RADIUS,
  MAX_RADIUS
};

