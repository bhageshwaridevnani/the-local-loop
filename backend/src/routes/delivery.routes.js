const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/available', (req, res) => {
  res.status(501).json({ message: 'Get available deliveries - To be implemented' });
});

router.post('/accept/:orderId', (req, res) => {
  res.status(501).json({ message: 'Accept delivery - To be implemented' });
});

module.exports = router;
