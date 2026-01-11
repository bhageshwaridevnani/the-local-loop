import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const prisma = new PrismaClient();

// Valid Ahmedabad pincodes
const VALID_AHMEDABAD_PINCODES = [
  '380001', '380002', '380004', '380005', '380006', '380007', '380008', '380009',
  '380013', '380014', '380015', '380016', '380018', '380019', '380021', '380022',
  '380023', '380024', '380025', '380026', '380027', '380028', '380050', '380051',
  '380052', '380054', '380055', '380058', '380059', '380060', '380061'
];

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  role: Joi.string().valid('CUSTOMER', 'VENDOR', 'DELIVERY').required(),
  areaId: Joi.string().optional(),
  
  // Address fields (required for all roles)
  address: Joi.string().min(10).required(),
  landmark: Joi.string().optional().allow(''),
  city: Joi.string().valid('Ahmedabad').required().messages({
    'any.only': 'Currently, we only operate in Ahmedabad city'
  }),
  pincode: Joi.string().valid(...VALID_AHMEDABAD_PINCODES).required().messages({
    'any.only': 'Please enter a valid Ahmedabad pincode (380001-380061)'
  }),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
  
  // Vendor specific fields
  shopName: Joi.string().when('role', {
    is: 'VENDOR',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  category: Joi.string().when('role', {
    is: 'VENDOR',
    then: Joi.optional(),
    otherwise: Joi.optional()
  }),
  
  // Delivery partner specific fields
  vehicleType: Joi.string().when('role', {
    is: 'DELIVERY',
    then: Joi.valid('bike', 'scooter', 'bicycle', 'car').optional(),
    otherwise: Joi.optional()
  }),
  vehicleNumber: Joi.string().when('role', {
    is: 'DELIVERY',
    then: Joi.optional(),
    otherwise: Joi.optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register user
export const register = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const {
      name, email, password, phone, role, areaId,
      address, landmark, city, pincode, latitude, longitude,
      shopName, category, vehicleType, vehicleNumber
    } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with address fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        address,
        landmark: landmark || null,
        city,
        pincode,
        latitude: latitude || null,
        longitude: longitude || null,
        areaId: areaId || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        landmark: true,
        city: true,
        pincode: true,
        latitude: true,
        longitude: true,
        areaId: true,
        createdAt: true
      }
    });

    // If vendor, create vendor profile
    if (role === 'VENDOR') {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          shopName: shopName,
          address: address,
          landmark: landmark || null,
          city: city,
          pincode: pincode,
          latitude: latitude || null,
          longitude: longitude || null,
          category: category || 'general',
          areaId: areaId || null
        }
      });
    }

    // If delivery partner, create delivery profile
    if (role === 'DELIVERY') {
      await prisma.deliveryProfile.create({
        data: {
          userId: user.id,
          vehicleType: vehicleType || null,
          vehicleNumber: vehicleNumber || null,
          isAvailable: false
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vendor: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vendor: true,
        area: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user information'
    });
  }
};

// Logout (client-side token removal, but we can log it)
export const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we just send a success response
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Failed to logout'
    });
  }
};

