import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Validation schemas
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  brand: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  unit: Joi.string().valid('kg', 'g', 'l', 'ml', 'piece', 'dozen', 'packet').required(),
  description: Joi.string().max(1000).optional(),
  image: Joi.string().uri().optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  brand: Joi.string().min(2).max(100).optional(),
  category: Joi.string().min(2).max(100).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  unit: Joi.string().valid('kg', 'g', 'l', 'ml', 'piece', 'dozen', 'packet').optional(),
  description: Joi.string().max(1000).optional(),
  image: Joi.string().uri().optional(),
  isAvailable: Joi.boolean().optional()
});

// Create product (Vendor only)
export const createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can create products'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: value.name,
        brand: value.brand,
        category: value.category,
        price: value.price,
        stock: value.stock,
        unit: value.unit,
        description: value.description,
        imageUrl: value.image, // Map image to imageUrl
        vendorId: vendor.id
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product'
    });
  }
};

// Get all products (with filters)
export const getProducts = async (req, res) => {
  try {
    const { vendorId, category, brand, search, isAvailable } = req.query;

    const where = {};

    if (vendorId) where.vendorId = vendorId;
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product'
    });
  }
};

// Update product (Vendor only - own products)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can update products'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (existingProduct.vendorId !== vendor.id) {
      return res.status(403).json({
        error: 'You can only update your own products'
      });
    }

    // Update product
    const updateData = {
      name: value.name,
      brand: value.brand,
      category: value.category,
      price: value.price,
      stock: value.stock,
      unit: value.unit,
      description: value.description,
      isAvailable: value.isAvailable
    };
    
    // Only update imageUrl if image is provided
    if (value.image !== undefined) {
      updateData.imageUrl = value.image;
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Failed to update product'
    });
  }
};

// Delete product (Vendor only - own products)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can delete products'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (existingProduct.vendorId !== vendor.id) {
      return res.status(403).json({
        error: 'You can only delete your own products'
      });
    }

    // Delete product
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Failed to delete product'
    });
  }
};

// Get vendor's own products
export const getVendorProducts = async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can access this endpoint'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
};

// Toggle product availability
export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can toggle product availability'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Check if product belongs to vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (existingProduct.vendorId !== vendor.id) {
      return res.status(403).json({
        error: 'You can only toggle your own products'
      });
    }

    // Toggle availability
    const product = await prisma.product.update({
      where: { id },
      data: {
        isAvailable: !existingProduct.isAvailable
      }
    });

    res.json({
      message: `Product ${product.isAvailable ? 'enabled' : 'disabled'} successfully`,
      product
    });
  } catch (error) {
    console.error('Toggle product availability error:', error);
    res.status(500).json({
      error: 'Failed to toggle product availability'
    });
  }
};

