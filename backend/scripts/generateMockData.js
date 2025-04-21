const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Import models
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');

// Categories for pins
const categories = [
  'Photography',
  'Travel',
  'Food',
  'Technology',
  'Design',
  'Nature',
  'Art',
  'Fashion',
  'DIY',
  'Architecture'
];

// Tags for pins
const tags = [
  'inspiration',
  'photography',
  'travel',
  'food',
  'tech',
  'design',
  'nature',
  'art',
  'fashion',
  'diy',
  'architecture',
  'lifestyle',
  'creativity',
  'beauty',
  'innovation'
];

// Generate random tags
const generateTags = () => {
  const numTags = Math.floor(Math.random() * 4) + 2; // 2-5 tags
  const shuffled = [...tags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

// Generate random comments
const generateComments = (users) => {
  const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments
  const comments = [];
  
  for (let i = 0; i < numComments; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    comments.push({
      user: randomUser._id,
      text: `This is a great ${Math.random() > 0.5 ? 'pin' : 'idea'}! ${Math.random() > 0.5 ? 'Love the details.' : 'Would love to try this.'}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
  }
  
  return comments;
};

// Generate mock data
const generateMockData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Pin.deleteMany({});
    await Board.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await Promise.all([
      User.create({
        email: 'john.smith@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'John Smith',
        username: 'johnsmith',
        title: 'Professional Photographer',
        bio: 'Capturing moments through my lens. Nature and street photography enthusiast.',
        followers: [],
        following: []
      }),
      User.create({
        email: 'sarah.j@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Sarah Johnson',
        username: 'sarahj',
        title: 'Interior Designer',
        bio: 'Creating beautiful spaces that inspire. Home decor and DIY projects.',
        followers: [],
        following: []
      }),
      User.create({
        email: 'michael.chen@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Michael Chen',
        username: 'michaelchen',
        title: 'Tech Entrepreneur',
        bio: 'Building the future of technology. AI and innovation enthusiast.',
        followers: [],
        following: []
      }),
      User.create({
        email: 'emma.w@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'Emma Wilson',
        username: 'emmaw',
        title: 'Food Blogger',
        bio: 'Sharing my culinary adventures. Food photography and recipe development.',
        followers: [],
        following: []
      }),
      User.create({
        email: 'david.brown@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'David Brown',
        username: 'davidbrown',
        title: 'Travel Writer',
        bio: 'Exploring the world one destination at a time. Travel photography and stories.',
        followers: [],
        following: []
      })
    ]);
    console.log('Created users');

    // Set up following relationships
    const followingRelationships = [
      [0, 1, 2], // John follows Sarah, Michael
      [1, 0, 3], // Sarah follows John, Emma
      [2, 3, 4], // Michael follows Emma, David
      [3, 0, 4], // Emma follows John, David
      [4, 1, 2]  // David follows Sarah, Michael
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const following = followingRelationships[i].map(index => users[index]._id);
      user.following = following;
      await user.save();

      // Update followers for followed users
      for (const followedId of following) {
        await User.findByIdAndUpdate(followedId, {
          $addToSet: { followers: user._id }
        });
      }
    }
    console.log('Set up following relationships');

    // Create boards
    const boards = await Promise.all([
      Board.create({
        name: 'Travel Photography',
        description: 'Capturing the world\'s most beautiful moments and places through my lens.',
        user: users[0]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Interior Design Inspiration',
        description: 'Collection of stunning interior design ideas and home decor inspiration.',
        user: users[1]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Tech Innovation',
        description: 'Exploring the latest in technology, AI, and digital transformation.',
        user: users[2]._id,
        isPrivate: true,
        pins: []
      }),
      Board.create({
        name: 'Culinary Adventures',
        description: 'Food photography and recipes from around the world.',
        user: users[3]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Travel Destinations',
        description: 'Exploring hidden gems and popular destinations worldwide.',
        user: users[4]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Street Photography',
        description: 'Capturing life in the city through candid moments.',
        user: users[0]._id,
        isPrivate: true,
        pins: []
      }),
      Board.create({
        name: 'DIY Projects',
        description: 'Creative DIY ideas and home improvement projects.',
        user: users[1]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Future Tech',
        description: 'Speculations and developments in future technology.',
        user: users[2]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Food Styling',
        description: 'Art of food photography and styling techniques.',
        user: users[3]._id,
        isPrivate: true,
        pins: []
      }),
      Board.create({
        name: 'Nature Photography',
        description: 'Stunning landscapes and wildlife photography.',
        user: users[4]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Portrait Photography',
        description: 'Professional portrait photography techniques and inspiration.',
        user: users[0]._id,
        isPrivate: false,
        pins: []
      }),
      Board.create({
        name: 'Minimalist Design',
        description: 'Clean, minimalist design inspiration and ideas.',
        user: users[1]._id,
        isPrivate: true,
        pins: []
      })
    ]);
    console.log('Created boards');

    // Create pins
    const pins = [];
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomBoard = boards[Math.floor(Math.random() * boards.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Generate random saves (1-5 random users who saved this pin)
      const numSaves = Math.floor(Math.random() * 5) + 1;
      const randomSaves = [];
      for (let j = 0; j < numSaves; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        randomSaves.push(randomUser._id);
      }
      
      const pin = await Pin.create({
        title: `Amazing ${randomCategory} ${i + 1}`,
        description: `This is a detailed description for an amazing ${randomCategory.toLowerCase()} pin. It includes various aspects and details about the subject matter, making it informative and engaging for viewers.`,
        imageUrl: `https://source.unsplash.com/random/800x600?${randomCategory.toLowerCase()}`,
        category: randomCategory,
        tags: generateTags(),
        user: randomUser._id,
        board: randomBoard._id,
        comments: generateComments(users),
        likes: Math.floor(Math.random() * 100),
        saves: randomSaves // Now this is an array of user IDs
      });

      pins.push(pin);

      // Add pin to board
      await Board.findByIdAndUpdate(randomBoard._id, {
        $push: { pins: pin._id }
      });
    }
    console.log('Created pins');

    console.log('Mock data generation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error generating mock data:', error);
    process.exit(1);
  }
};

generateMockData(); 