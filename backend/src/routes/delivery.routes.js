import express from 'express';
import {
  // Public endpoints
  checkAvailability,
  
  // Profile management
  getMyProfile,
  updateProfile,
  toggleAvailability,
  
  // Delivery requests
  getPendingRequests,
  acceptDeliveryRequest,
  rejectDeliveryRequest,
  
  // Active deliveries
  getMyActiveDeliveries,
  markAsPickedUp,
  completeDelivery,
  
  // History & earnings
  getDeliveryHistory,
  getEarnings,
  
  // Rating
  rateDelivery
} from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (No authentication required) ====================
router.get('/check-availability', checkAvailability);

// All other routes require authentication
router.use(authenticate);

// ==================== PROFILE ROUTES ====================
router.get('/profile', getMyProfile);
router.put('/profile', updateProfile);
router.patch('/availability', toggleAvailability);

// ==================== DELIVERY REQUEST ROUTES ====================
router.get('/requests/pending', getPendingRequests);
router.post('/requests/:deliveryId/accept', acceptDeliveryRequest);
router.post('/requests/:deliveryId/reject', rejectDeliveryRequest);

// ==================== ACTIVE DELIVERY ROUTES ====================
router.get('/active', getMyActiveDeliveries);
router.patch('/:deliveryId/pickup', markAsPickedUp);
router.post('/:deliveryId/complete', completeDelivery);

// ==================== HISTORY & EARNINGS ROUTES ====================
router.get('/history', getDeliveryHistory);
router.get('/earnings', getEarnings);

// ==================== RATING ROUTES ====================
router.post('/:deliveryId/rate', rateDelivery);

export default router;

