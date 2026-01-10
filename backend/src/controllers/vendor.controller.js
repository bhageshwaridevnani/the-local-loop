import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all vendors
export const getVendors = async (req, res) => {
  try {
    const { search, category, isActive } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { shopName: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map to match frontend expectations
    const formattedVendors = vendors.map(vendor => ({
      id: vendor.id,
      shop_name: vendor.shopName,
      address: vendor.address,
      category: vendor.category,
      rating: vendor.rating,
      reviews: vendor.reviewCount,
      isActive: vendor.isActive,
      user: vendor.user,
      productCount: vendor._count.products,
      orderCount: vendor._count.orders
    }));

    res.json({
      vendors: formattedVendors,
      count: formattedVendors.length
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      error: 'Failed to fetch vendors'
    });
  }
};

// Get single vendor by ID
export const getVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found'
      });
    }

    // Map to match frontend expectations
    const formattedVendor = {
      id: vendor.id,
      shop_name: vendor.shopName,
      address: vendor.address,
      category: vendor.category,
      rating: vendor.rating,
      reviews: vendor.reviewCount,
      isActive: vendor.isActive,
      user: vendor.user,
      phone: vendor.user.phone,
      productCount: vendor._count.products,
      orderCount: vendor._count.orders
    };

    res.json({
      vendor: formattedVendor
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor'
    });
  }
};

// Get vendor statistics (for vendor dashboard)
export const getVendorStats = async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can access this endpoint'
      });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Get order statistics
    const orders = await prisma.order.findMany({
      where: { vendorId: vendor.id }
    });

    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const totalRevenue = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      stats: {
        totalProducts: vendor._count.products,
        totalOrders: vendor._count.orders,
        completedOrders,
        totalRevenue,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        isActive: vendor.isActive
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch vendor statistics'
    });
  }
};

// Update vendor shop settings
export const updateVendorSettings = async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can update shop settings'
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

    const { shopName, address, category, isActive } = req.body;

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        shopName: shopName || vendor.shopName,
        address: address || vendor.address,
        category: category || vendor.category,
        isActive: isActive !== undefined ? isActive : vendor.isActive
      }
    });

    res.json({
      message: 'Shop settings updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Update vendor settings error:', error);
    res.status(500).json({
      error: 'Failed to update shop settings'
    });
  }
};

// Toggle shop status (open/closed)
export const toggleShopStatus = async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can toggle shop status'
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

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        isActive: !vendor.isActive
      }
    });

    res.json({
      message: `Shop ${updatedVendor.isActive ? 'opened' : 'closed'} successfully`,
      isActive: updatedVendor.isActive
    });
  } catch (error) {
    console.error('Toggle shop status error:', error);
    res.status(500).json({
      error: 'Failed to toggle shop status'
    });
  }
};

