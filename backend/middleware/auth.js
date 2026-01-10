const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    jwt.verify(token, jwtConfig.secret, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a customer
 */
const isCustomer = authorizeRole('customer');

/**
 * Middleware to check if user is a vendor
 */
const isVendor = authorizeRole('vendor');

/**
 * Middleware to check if user is a delivery partner
 */
const isDelivery = authorizeRole('delivery');

/**
 * Middleware to check if user is vendor or delivery
 */
const isVendorOrDelivery = authorizeRole('vendor', 'delivery');

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  const payload = {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    name: user.name,
    areaId: user.area_id,
    latitude: user.latitude,
    longitude: user.longitude
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.options.issuer,
    audience: jwtConfig.options.audience
  });
};

/**
 * Verify and decode token without middleware
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  isCustomer,
  isVendor,
  isDelivery,
  isVendorOrDelivery,
  generateToken,
  verifyToken
};

