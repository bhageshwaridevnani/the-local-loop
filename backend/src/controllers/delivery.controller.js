import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== PUBLIC ENDPOINTS ====================

// Check if delivery partners are available (public endpoint for customers)
export const checkAvailability = async (req, res) => {
  try {
    const availablePartners = await prisma.deliveryProfile.findMany({
      where: {
        isAvailable: true
      },
      include: {
        user: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    const count = availablePartners.length;
    
    res.json({
      available: count > 0,
      count,
      message: count > 0
        ? `${count} delivery partner${count > 1 ? 's' : ''} available in your area`
        : 'No delivery partners available at the moment',
      partners: availablePartners.map(p => ({
        id: p.user.id,
        name: p.user.name,
        vehicleType: p.vehicleType,
        rating: p.rating
      }))
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      error: 'Failed to check delivery partner availability',
      available: false,
      count: 0
    });
  }
};

// ==================== DELIVERY PROFILE MANAGEMENT ====================

// Get or create delivery profile
export const getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can access this endpoint'
      });
    }

    let profile = await prisma.deliveryProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Create profile if doesn't exist
    if (!profile) {
      profile = await prisma.deliveryProfile.create({
        data: {
          userId: req.user.id
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
};

// Update delivery profile
export const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can update profile'
      });
    }

    const { vehicleType, vehicleNumber, availableFrom, availableTo } = req.body;

    const profile = await prisma.deliveryProfile.upsert({
      where: { userId: req.user.id },
      update: {
        vehicleType,
        vehicleNumber,
        availableFrom,
        availableTo
      },
      create: {
        userId: req.user.id,
        vehicleType,
        vehicleNumber,
        availableFrom,
        availableTo
      }
    });

    res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
};

// Toggle availability
export const toggleAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can toggle availability'
      });
    }

    const { isAvailable } = req.body;

    const profile = await prisma.deliveryProfile.upsert({
      where: { userId: req.user.id },
      update: { isAvailable },
      create: {
        userId: req.user.id,
        isAvailable
      }
    });

    res.json({
      message: `Availability ${isAvailable ? 'enabled' : 'disabled'}`,
      profile
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      error: 'Failed to toggle availability'
    });
  }
};

// ==================== DELIVERY REQUEST MANAGEMENT ====================

// Get pending delivery requests (orders waiting for delivery partner)
export const getPendingRequests = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can access this endpoint'
      });
    }

    // Check if delivery partner is available
    const profile = await prisma.deliveryProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile || !profile.isAvailable) {
      return res.json({
        message: 'You are currently unavailable. Enable availability to see requests.',
        requests: [],
        count: 0
      });
    }

    // Get orders that are PENDING (newly created) and have PENDING delivery status
    const pendingRequests = await prisma.delivery.findMany({
      where: {
        status: 'PENDING',
        deliveryPartnerId: null,
        order: {
          status: 'PENDING'
        }
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true
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
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    brand: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    res.json({
      requests: pendingRequests,
      count: pendingRequests.length
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending requests'
    });
  }
};

// Accept delivery request
export const acceptDeliveryRequest = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can accept deliveries'
      });
    }

    // Check if delivery partner is available
    const profile = await prisma.deliveryProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile || !profile.isAvailable) {
      return res.status(400).json({
        error: 'You must be available to accept deliveries'
      });
    }

    // Check if delivery request exists and is still pending
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: true
      }
    });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery request not found'
      });
    }

    if (delivery.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Delivery request is no longer available'
      });
    }

    if (delivery.deliveryPartnerId) {
      return res.status(400).json({
        error: 'Delivery already accepted by another partner'
      });
    }

    // Accept delivery and update order status
    const updatedDelivery = await prisma.$transaction(async (tx) => {
      // Update delivery
      const accepted = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          deliveryPartnerId: req.user.id,
          status: 'ACCEPTED',
          acceptedAt: new Date()
        },
        include: {
          order: {
            include: {
              customer: {
                select: {
                  name: true,
                  phone: true
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
              items: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      // Update order status to show delivery partner assigned
      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: 'ACCEPTED_BY_DELIVERY' }
      });

      return accepted;
    });

    res.json({
      message: 'Delivery request accepted successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      error: 'Failed to accept delivery'
    });
  }
};

// Reject delivery request
export const rejectDeliveryRequest = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { reason } = req.body;

    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can reject deliveries'
      });
    }

    // Check if delivery request exists
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId }
    });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery request not found'
      });
    }

    if (delivery.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Can only reject pending delivery requests'
      });
    }

    // Update delivery status to rejected
    const rejectedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      }
    });

    res.json({
      message: 'Delivery request rejected',
      delivery: rejectedDelivery
    });
  } catch (error) {
    console.error('Reject delivery error:', error);
    res.status(500).json({
      error: 'Failed to reject delivery'
    });
  }
};

// ==================== ACTIVE DELIVERY MANAGEMENT ====================

// Get my active deliveries
export const getMyActiveDeliveries = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can access this endpoint'
      });
    }

    const activeDeliveries = await prisma.delivery.findMany({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          in: ['ACCEPTED', 'PICKED_UP']
        }
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true
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
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    brand: true,
                    price: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        acceptedAt: 'desc'
      }
    });

    res.json({
      deliveries: activeDeliveries,
      count: activeDeliveries.length
    });
  } catch (error) {
    console.error('Get active deliveries error:', error);
    res.status(500).json({
      error: 'Failed to fetch active deliveries'
    });
  }
};

// Mark as picked up from vendor
export const markAsPickedUp = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can update delivery status'
      });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId }
    });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery not found'
      });
    }

    if (delivery.deliveryPartnerId !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to update this delivery'
      });
    }

    if (delivery.status !== 'ACCEPTED') {
      return res.status(400).json({
        error: 'Delivery must be in ACCEPTED status'
      });
    }

    // Update delivery and order status
    const updatedDelivery = await prisma.$transaction(async (tx) => {
      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'PICKED_UP',
          pickupTime: new Date()
        }
      });

      await tx.order.update({
        where: { id: delivery.orderId },
        data: { status: 'OUT_FOR_DELIVERY' }
      });

      return updated;
    });

    res.json({
      message: 'Marked as picked up successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Mark as picked up error:', error);
    res.status(500).json({
      error: 'Failed to update delivery status'
    });
  }
};

// Complete delivery (customer receives and pays)
export const completeDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { paymentReceived } = req.body; // true if COD payment received

    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can complete deliveries'
      });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: true
      }
    });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery not found'
      });
    }

    if (delivery.deliveryPartnerId !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to complete this delivery'
      });
    }

    if (delivery.status !== 'PICKED_UP') {
      return res.status(400).json({
        error: 'Delivery must be picked up first'
      });
    }

    // Complete delivery and update order
    const completedDelivery = await prisma.$transaction(async (tx) => {
      const updated = await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'DELIVERED',
          deliveryTime: new Date()
        }
      });

      // Update order status and payment status
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: 'DELIVERED',
          paymentStatus: paymentReceived ? 'completed' : 'pending'
        }
      });

      // Update delivery partner's total deliveries
      await tx.deliveryProfile.update({
        where: { userId: req.user.id },
        data: {
          totalDeliveries: {
            increment: 1
          }
        }
      });

      return updated;
    });

    res.json({
      message: 'Delivery completed successfully',
      delivery: completedDelivery
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      error: 'Failed to complete delivery'
    });
  }
};

// ==================== DELIVERY HISTORY & EARNINGS ====================

// Get delivery history
export const getDeliveryHistory = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can access this endpoint'
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where: {
          deliveryPartnerId: req.user.id,
          status: 'DELIVERED'
        },
        include: {
          order: {
            select: {
              id: true,
              totalAmount: true,
              deliveryFee: true,
              deliveryAddress: true,
              createdAt: true,
              vendor: {
                select: {
                  shopName: true
                }
              }
            }
          }
        },
        orderBy: {
          deliveryTime: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.delivery.count({
        where: {
          deliveryPartnerId: req.user.id,
          status: 'DELIVERED'
        }
      })
    ]);

    res.json({
      deliveries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({
      error: 'Failed to fetch delivery history'
    });
  }
};

// Get earnings summary
export const getEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'DELIVERY') {
      return res.status(403).json({
        error: 'Only delivery partners can access earnings'
      });
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        deliveryPartnerId: req.user.id,
        status: 'DELIVERED'
      },
      include: {
        order: {
          select: {
            deliveryFee: true
          }
        }
      }
    });

    const totalEarnings = deliveries.reduce((sum, delivery) => {
      return sum + delivery.order.deliveryFee;
    }, 0);

    // Today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.deliveryTime);
      return deliveryDate >= today;
    });

    const todayEarnings = todayDeliveries.reduce((sum, delivery) => {
      return sum + delivery.order.deliveryFee;
    }, 0);

    // Get profile for total deliveries count
    const profile = await prisma.deliveryProfile.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      totalEarnings,
      totalDeliveries: deliveries.length,
      todayEarnings,
      todayDeliveries: todayDeliveries.length,
      deliveryFeePerOrder: 10.0,
      rating: profile?.rating || 4.5
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      error: 'Failed to fetch earnings'
    });
  }
};

// ==================== RATING SYSTEM ====================

// Submit rating for delivery (called by customer or vendor)
export const rateDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { rating, ratedBy } = req.body; // ratedBy: 'customer' or 'vendor'

    if (!['CUSTOMER', 'VENDOR'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only customers and vendors can rate deliveries'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: true
      }
    });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery not found'
      });
    }

    if (delivery.status !== 'DELIVERED') {
      return res.status(400).json({
        error: 'Can only rate completed deliveries'
      });
    }

    // Update rating
    const updateData = ratedBy === 'customer' 
      ? { customerRating: rating }
      : { vendorRating: rating };

    const updatedDelivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData
    });

    // Recalculate delivery partner's average rating
    const allDeliveries = await prisma.delivery.findMany({
      where: {
        deliveryPartnerId: delivery.deliveryPartnerId,
        status: 'DELIVERED',
        OR: [
          { customerRating: { not: null } },
          { vendorRating: { not: null } }
        ]
      }
    });

    let totalRating = 0;
    let ratingCount = 0;

    allDeliveries.forEach(d => {
      if (d.customerRating) {
        totalRating += d.customerRating;
        ratingCount++;
      }
      if (d.vendorRating) {
        totalRating += d.vendorRating;
        ratingCount++;
      }
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 4.5;

    // Update delivery partner's profile rating
    await prisma.deliveryProfile.update({
      where: { userId: delivery.deliveryPartnerId },
      data: { rating: averageRating }
    });

    res.json({
      message: 'Rating submitted successfully',
      delivery: updatedDelivery,
      newAverageRating: averageRating
    });
  } catch (error) {
    console.error('Rate delivery error:', error);
    res.status(500).json({
      error: 'Failed to submit rating'
    });
  }
};

