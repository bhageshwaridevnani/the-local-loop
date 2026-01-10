const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get all orders - To be implemented' });
});

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create order - To be implemented' });
});

module.exports = router;
