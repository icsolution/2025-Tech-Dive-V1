const express = require('express');
const router = express.Router();
const Board = require('../models/Board');

// Get all boards for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const boards = await Board.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get board by ID
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('pins');
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create board
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const board = new Board({
      title,
      description,
      user: userId,
    });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update board
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete board
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findByIdAndDelete(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json({ message: 'Board deleted' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add pin to board
router.post('/:id/pins', async (req, res) => {
  try {
    const { pinId } = req.body;
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    if (!board.pins.includes(pinId)) {
      board.pins.push(pinId);
      await board.save();
    }
    res.json(board);
  } catch (error) {
    console.error('Add pin to board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove pin from board
router.delete('/:id/pins/:pinId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    board.pins = board.pins.filter(pin => pin.toString() !== req.params.pinId);
    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Remove pin from board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 