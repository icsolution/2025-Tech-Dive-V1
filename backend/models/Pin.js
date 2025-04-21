const mongoose = require('mongoose');

const pinSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Photography', 'Food', 'Travel', 'Tech', 'Fashion', 'Fitness', 'Gardening', 'Automotive', 'Digital Nomad', 'Coffee', 'Art', 'Music', 'Yoga', 'Architecture', 'Design', 'Lifestyle']
  },
  tags: [{
    type: String,
    trim: true
  }],
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Analytics fields
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  viewDuration: {
    type: Number,
    default: 0
  },
  deviceTypes: {
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 }
  },
  locations: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
pinSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Pin', pinSchema); 