const Pin = require('../models/Pin');
const User = require('../models/User');

const analyticsMiddleware = async (req, res, next) => {
  try {
    // Skip analytics for non-authenticated requests
    if (!req.user) {
      return next();
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    // Update user analytics
    if (user) {
      user.lastLogin = new Date();
      user.loginCount += 1;
      user.deviceType = req.headers['user-agent'].includes('Mobile') ? 'mobile' : 
                       req.headers['user-agent'].includes('Tablet') ? 'tablet' : 'desktop';
      await user.save();
    }

    // Track pin interactions
    if (req.params.pinId) {
      const pin = await Pin.findById(req.params.pinId);
      if (pin) {
        switch (req.method) {
          case 'GET':
            pin.views += 1;
            pin.viewDuration += req.query.viewDuration ? parseInt(req.query.viewDuration) : 0;
            break;
          case 'POST':
            if (req.path.includes('save')) {
              pin.saves += 1;
            } else if (req.path.includes('comment')) {
              pin.comments += 1;
            }
            break;
          case 'PUT':
            if (req.path.includes('click')) {
              pin.clicks += 1;
            }
            break;
        }

        // Update device types and locations
        if (req.headers['user-agent']) {
          const deviceType = req.headers['user-agent'].includes('Mobile') ? 'mobile' : 
                           req.headers['user-agent'].includes('Tablet') ? 'tablet' : 'desktop';
          pin.deviceTypes[deviceType] = (pin.deviceTypes[deviceType] || 0) + 1;
        }

        if (req.ip) {
          const location = req.ip; // In production, you might want to use a geolocation service
          pin.locations[location] = (pin.locations[location] || 0) + 1;
        }

        await pin.save();
      }
    }

    next();
  } catch (error) {
    console.error('Analytics middleware error:', error);
    next();
  }
};

module.exports = analyticsMiddleware; 