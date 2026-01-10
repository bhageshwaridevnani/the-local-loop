import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Validation schema for creating order
const createOrderSchema = Joi.object({
  vendorId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required(),
  deliveryAddress: Joi.string().required(),
  paymentMethod: Joi.string().valid('COD', 'ONLINE').default('COD')
});

// Create order (Customer only)
export const createOrder = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    // Check if user is a customer
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({
        error: 'Only customers can create orders'
      });
    }

    const { vendorId, items, deliveryAddress, paymentMethod } = value;

    // Verify vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor not found'
      });
    }

    // Verify all products exist and have sufficient stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId: vendorId
      }
    });

    if (products.length !== items.length) {
      return res.status(400).json({
        error: 'Some products not found or do not belong to this vendor'
      });
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          error: `Product ${item.productId} not found`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Only ${product.stock} available`
        });
      }
      if (!product.isAvailable) {
        return res.status(400).json({
          error: `Product ${product.name} is currently unavailable`
        });
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 10.0;

    // Check for available delivery partners
    const availableDeliveryPartners = await prisma.deliveryProfile.findMany({
      where: {
        isAvailable: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    // If no delivery partner available, return error
    if (availableDeliveryPartners.length === 0) {
      return res.status(400).json({
        error: 'NO_DELIVERY_PARTNER',
        message: 'No delivery partner is currently available. Please try again later or contact the vendor directly.'
      });
    }

    // Create order with transaction to ensure atomicity
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user.id,
          vendorId: vendorId,
          totalAmount: totalAmount,
          deliveryFee: deliveryFee,
          deliveryAddress: deliveryAddress,
          paymentMethod: paymentMethod,
          status: 'PENDING',
          paymentStatus: 'pending',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          vendor: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          }
        }
      });

      // Reduce stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Create delivery request immediately
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING'
        }
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order'
    });
  }
};

// Get all orders (filtered by user role)
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let where = {};

    // Filter based on user role
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: req.user.id }
      });
      if (!vendor) {
        return res.status(404).json({
          error: 'Vendor profile not found'
        });
      }
      where.vendorId = vendor.id;
    } else if (req.user.role === 'DELIVERY') {
      // Delivery partner sees orders assigned to them
      const deliveries = await prisma.delivery.findMany({
        where: { deliveryPartnerId: req.user.id },
        select: { orderId: true }
      });
      where.id = { in: deliveries.map(d => d.orderId) };
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        delivery: {
          include: {
            deliveryPartner: {
              select: {
                name: true,
                phone: true
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
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        delivery: {
          include: {
            deliveryPartner: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Check authorization
    const isAuthorized = 
      order.customerId === req.user.id ||
      (req.user.role === 'VENDOR' && order.vendor.userId === req.user.id) ||
      (req.user.role === 'DELIVERY' && order.delivery?.deliveryPartnerId === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Not authorized to view this order'
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Failed to fetch order'
    });
  }
};

// Update order status (Vendor only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status'
      });
    }

    // Check if user is a vendor
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({
        error: 'Only vendors can update order status'
      });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendor) {
      return res.status(404).json({
        error: 'Vendor profile not found'
      });
    }

    // Check if order belongs to vendor
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (order.vendorId !== vendor.id) {
      return res.status(403).json({
        error: 'Not authorized to update this order'
      });
    }

    // Update order and create delivery request if status is READY
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // When vendor marks order as READY, create a delivery request
      if (status === 'READY') {
        // Check if delivery request already exists
        const existingDelivery = await tx.delivery.findUnique({
          where: { orderId: id }
        });

        if (!existingDelivery) {
          await tx.delivery.create({
            data: {
              orderId: id,
              status: 'PENDING'
            }
          });
        }
      }

      return updated;
    });

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status'
    });
  }
};

// Cancel order (Customer only, before accepted)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    // Check if customer owns the order
    if (order.customerId !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel if order is still pending
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Order cannot be cancelled at this stage'
      });
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    });

    res.json({
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order'
    });
  }
};

