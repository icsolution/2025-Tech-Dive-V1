const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150',
  },
  location: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Analytics fields
  interests: [{
    type: String,
    trim: true
  }],
  ageRange: {
    type: String,
    enum: ['18-24', '25-34', '35-44', '45-54', '55+']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say']
  },
  // User segmentation
  segment: {
    type: String,
    enum: ['casual', 'power', 'creator', 'influencer'],
    default: 'casual'
  },
  activityScore: {
    type: Number,
    default: 0
  },
  // Engagement metrics
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet']
  },
  deviceTypes: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  locations: {
    type: Map,
    of: Number,
    default: {}
  },
  // Analytics
  sessionDuration: {
    type: Number,
    default: 0
  },
  totalPinsCreated: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  totalBoards: {
    type: Number,
    default: 0
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = new Date();
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update activity score before saving
UserSchema.pre('save', function(next) {
  this.activityScore = (this.totalPinsCreated * 0.3) + 
                      (this.totalComments * 0.2) + 
                      (this.totalBoards * 0.2) + 
                      (this.followers.length * 0.3);
  
  // Update user segment based on activity score
  if (this.activityScore > 80) this.segment = 'influencer';
  else if (this.activityScore > 50) this.segment = 'creator';
  else if (this.activityScore > 20) this.segment = 'power';
  else this.segment = 'casual';
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema); 