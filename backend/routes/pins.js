const express = require('express');
const router = express.Router();
const Pin = require('../models/Pin');

// Get all pins
router.get('/', async (req, res) => {
  try {
    const pins = await Pin.find().sort({ createdAt: -1 });
    res.json(pins);
  } catch (error) {
    console.error('Get pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pin by ID
router.get('/:id', async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.json(pin);
  } catch (error) {
    console.error('Get pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create pin
router.post('/', async (req, res) => {
  try {
    const { title, description, imageUrl, userId } = req.body;
    const pin = new Pin({
      title,
      description,
      imageUrl,
      user: userId,
    });
    await pin.save();
    res.status(201).json(pin);
  } catch (error) {
    console.error('Create pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update pin
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const pin = await Pin.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.json(pin);
  } catch (error) {
    console.error('Update pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pin
router.delete('/:id', async (req, res) => {
  try {
    const pin = await Pin.findByIdAndDelete(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }
    res.json({ message: 'Pin deleted' });
  } catch (error) {
    console.error('Delete pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 