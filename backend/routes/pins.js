const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
    console.error('Create pin error:', error.message, error.stack); // Log specific error message and stack
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

// Get all pins saved by a specific user
router.get('/saved/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const savedPins = await Pin.find({ saves: userId }).sort({ createdAt: -1 });
    res.json(savedPins);
  } catch (error) {
    console.error('Get saved pins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike pin - Enhanced version with comprehensive logging
router.put('/:id/like', async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 8);
  const log = (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] [${requestId}] ${message}`, JSON.stringify(data, null, 2));
  };

  log('=== LIKE ENDPOINT HIT ===', {
    path: req.path,
    method: req.method,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '***' : 'none'
    },
    body: req.body,
    params: req.params
  });
  
  try {
    const { userId, action } = req.body;
    const pinId = req.params.id;
    
    // Validate inputs
    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }
    
    if (!['like', 'unlike'].includes(action)) {
      const error = new Error('Invalid action. Must be "like" or "unlike"');
      error.status = 400;
      throw error;
    }
    
    log('Processing like action', { pinId, userId, action });
    
    // Find the pin without using transactions (for standalone MongoDB)
    const pin = await Pin.findById(pinId);
    if (!pin) {
      const error = new Error('Pin not found');
      error.status = 404;
      throw error;
    }

    log('Found pin', { 
      id: pin._id,
      title: pin.title,
      currentLikes: pin.likes || [],
      likesCount: Array.isArray(pin.likes) ? pin.likes.length : 0
    });

    // Ensure likes is an array
    if (!Array.isArray(pin.likes)) {
      log('Initializing likes array');
      pin.likes = [];
    }
    
    // Convert userId to string for safe comparison
    const userIdStr = userId.toString();
    
    // Check if user has already liked this pin
    const userHasLiked = pin.likes.some(id => {
      const idStr = id ? id.toString() : null;
      return idStr === userIdStr;
    });
    
    log('Current like status', { userHasLiked, action });
    
    // Update likes based on action
    if (action === 'like' && !userHasLiked) {
      log('Adding like from user', { userId });
      // Ensure we're using ObjectId for the user reference
      let userIdToAdd;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userIdToAdd = new mongoose.Types.ObjectId(userId);
      } else {
        // If userId is not a valid ObjectId format, log and throw an error
        log('Invalid userId format', { userId });
        const error = new Error('Invalid user ID format');
        error.status = 400;
        throw error;
      }
      pin.likes.push(userIdToAdd);
    } else if (action === 'unlike' && userHasLiked) {
      log('Removing like from user', { userId });
      // Remove user from likes array using ObjectId comparison
      pin.likes = pin.likes.filter(id => 
        id && id.toString() !== userIdStr
      );
    } else {
      log('No action needed - already in desired state');
      return res.json({
        success: true,
        message: 'No action needed - already in desired state',
        data: pin
      });
    }
    
    log('Saving pin with updated likes', { 
      likes: pin.likes,
      likesCount: pin.likes.length 
    });
    
    // Save the updated pin
    const updatedPin = await pin.save();
    
    log('Successfully updated pin', {
      id: updatedPin._id,
      updatedLikes: updatedPin.likes,
      likesCount: updatedPin.likes ? updatedPin.likes.length : 0
    });
    
    res.json({
      success: true,
      data: updatedPin
    });
  } catch (error) {
    log('!!! ERROR in like endpoint !!!', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    const statusCode = error.status || 500;
    const response = {
      success: false,
      message: error.message || 'Server error',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    };
    
    res.status(statusCode).json(response);
  } finally {
    log('=== LIKE ENDPOINT COMPLETE ===');
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