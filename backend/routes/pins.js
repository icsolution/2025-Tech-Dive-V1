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
    const { title, description, imageUrl, userId, category } = req.body;
    const pin = new Pin({
      title,
      description,
      imageUrl,
      user: userId,
      category
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
      { title, description, updatedAt: new Date() },
      { new: true, runValidators: true }
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

// Save/Unsave pin
router.put('/:id/save', async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log('Save request:', { pinId: req.params.id, userId, action });
    
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Initialize saves as an array if it's not already
    if (!Array.isArray(pin.saves)) {
      pin.saves = [];
    }
    
    console.log('Pin saves before update:', pin.saves);
    
    // Convert userId to string for safe comparison
    const userIdStr = userId.toString();
    
    // Check if user has already saved this pin
    const userHasSaved = pin.saves.some(id => {
      // Handle case where id might be a string or ObjectId
      return id && id.toString() === userIdStr;
    });
    
    console.log('User has saved:', userHasSaved);
    
    if (action === 'save' && !userHasSaved) {
      // Add user to saves array - use mongoose ObjectId if possible
      try {
        const mongoose = require('mongoose');
        // Try to convert to ObjectId if it's not already one
        const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
          ? new mongoose.Types.ObjectId(userId) 
          : userId;
        pin.saves.push(userObjectId);
      } catch (err) {
        console.error('Error converting userId to ObjectId:', err);
        // Fallback to using the string value
        pin.saves.push(userId);
      }
    } else if (action === 'unsave' && userHasSaved) {
      // Remove user from saves array - filter by string comparison
      pin.saves = pin.saves.filter(id => {
        // Handle null or undefined values
        return !id || id.toString() !== userIdStr;
      });
    }
    
    console.log('Pin saves after update:', pin.saves);

    await pin.save();
    res.json(pin);
  } catch (error) {
    console.error('Save pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike pin
router.put('/:id/like', async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log('Like request:', { pinId: req.params.id, userId, action });
    
    const pin = await Pin.findById(req.params.id);
    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Initialize likes as an array if it's not already
    if (!Array.isArray(pin.likes)) {
      pin.likes = [];
    }
    
    console.log('Pin likes before update:', pin.likes);
    
    // Convert userId to string for safe comparison
    const userIdStr = userId.toString();
    
    // Check if user has already liked this pin
    const userHasLiked = pin.likes.some(id => {
      // Handle case where id might be a string or ObjectId
      return id && id.toString() === userIdStr;
    });
    
    console.log('User has liked:', userHasLiked);
    
    if (action === 'like' && !userHasLiked) {
      // Add user to likes array - use mongoose ObjectId if possible
      try {
        const mongoose = require('mongoose');
        // Try to convert to ObjectId if it's not already one
        const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
          ? new mongoose.Types.ObjectId(userId) 
          : userId;
        pin.likes.push(userObjectId);
      } catch (err) {
        console.error('Error converting userId to ObjectId:', err);
        // Fallback to using the string value
        pin.likes.push(userId);
      }
    } else if (action === 'unlike' && userHasLiked) {
      // Remove user from likes array - filter by string comparison
      pin.likes = pin.likes.filter(id => {
        // Handle null or undefined values
        return !id || id.toString() !== userIdStr;
      });
    }
    
    console.log('Pin likes after update:', pin.likes);

    await pin.save();
    res.json(pin);
  } catch (error) {
    console.error('Like pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete pin
router.delete('/:id', async (req, res) => {
  try {
    // Find pin and delete it
    const pin = await Pin.findByIdAndDelete(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    res.json({ message: 'Pin deleted successfully' });
  } catch (error) {
    console.error('Delete pin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 