const express = require('express');
const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Get all vendors - To be implemented' });
});

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create vendor - To be implemented' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Get vendor by ID - To be implemented' });
});

module.exports = router;
