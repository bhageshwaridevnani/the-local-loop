import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// All order routes require authentication
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, updateOrderStatus);
router.delete('/:id', authenticate, cancelOrder);

export default router;

