// Users data with their relationships
export const dummyUsers = [
  {
    _id: 'user1',
    username: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Digital artist & photography enthusiast 📸 | Creating and sharing beautiful moments',
    followers: ['user2', 'user3'],
    following: ['user2'],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'user2',
    username: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    bio: 'Travel photographer | Adventure seeker 🌎 | Based in San Francisco',
    followers: ['user1', 'user3'],
    following: ['user1'],
    createdAt: '2024-01-20T15:30:00Z',
  },
  {
    _id: 'user3',
    username: 'Maya Patel',
    email: 'maya.patel@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Interior designer 🏠 | Lover of minimalist aesthetics',
    followers: ['user2'],
    following: ['user1', 'user2'],
    createdAt: '2024-02-01T08:45:00Z',
  }
];

// Boards data with references to users and pins
export const dummyBoards = [
  {
    _id: 'board1',
    name: 'Travel Inspirations',
    description: 'Beautiful destinations and travel photography from around the world 🌎',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    author: dummyUsers[0], // Sarah Wilson
    collaborators: [dummyUsers[1]], // Alex Chen
    pins: [], // Will be populated with pin references
    followers: [dummyUsers[1]._id, dummyUsers[2]._id],
    isPrivate: false,
    category: 'Travel',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z',
  },
  {
    _id: 'board2',
    name: 'Minimalist Interior Design',
    description: 'Clean lines, neutral colors, and peaceful spaces ✨',
    coverImage: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103',
    author: dummyUsers[2], // Maya Patel
    collaborators: [],
    pins: [], // Will be populated with pin references
    followers: [dummyUsers[0]._id],
    isPrivate: false,
    category: 'Interior Design',
    createdAt: '2024-02-20T14:20:00Z',
    updatedAt: '2024-03-21T09:15:00Z',
  },
  {
    _id: 'board3',
    name: 'Photography Tips',
    description: 'Tips and tricks for better photography 📸',
    coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
    author: dummyUsers[1], // Alex Chen
    collaborators: [dummyUsers[0]], // Sarah Wilson
    pins: [], // Will be populated with pin references
    followers: [dummyUsers[2]._id],
    isPrivate: true,
    category: 'Photography',
    createdAt: '2024-03-01T11:30:00Z',
    updatedAt: '2024-03-22T16:45:00Z',
  }
];

// Pins data with references to users and boards
export const dummyPins = [
  {
    _id: 'pin1',
    title: 'Santorini Sunset',
    description: 'Beautiful sunset view from Oia, Santorini. The perfect blend of white architecture and natural beauty.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    author: dummyUsers[0], // Sarah Wilson
    board: dummyBoards[0], // Travel Inspirations
    likes: [dummyUsers[1]._id, dummyUsers[2]._id],
    saves: [dummyUsers[1]._id],
    comments: [
      {
        _id: 'comment1',
        text: 'Absolutely stunning! 😍',
        author: dummyUsers[1],
        createdAt: '2024-03-20T16:00:00Z',
      }
    ],
    tags: ['travel', 'greece', 'sunset', 'architecture'],
    createdAt: '2024-03-20T15:30:00Z',
    isLiked: false,
    isSaved: false,
  },
  {
    _id: 'pin2',
    title: 'Minimalist Living Room',
    description: 'Clean and serene living space with natural light and minimal decoration.',
    imageUrl: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103',
    author: dummyUsers[2], // Maya Patel
    board: dummyBoards[1], // Minimalist Interior Design
    likes: [dummyUsers[0]._id],
    saves: [dummyUsers[0]._id, dummyUsers[1]._id],
    comments: [
      {
        _id: 'comment2',
        text: 'Love the clean aesthetic!',
        author: dummyUsers[0],
        createdAt: '2024-03-21T10:15:00Z',
      }
    ],
    tags: ['interior', 'minimalist', 'design', 'living room'],
    createdAt: '2024-03-21T09:15:00Z',
    isLiked: false,
    isSaved: false,
  },
  {
    _id: 'pin3',
    title: 'Camera Settings Guide',
    description: 'Essential camera settings for perfect landscape photography.',
    imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
    author: dummyUsers[1], // Alex Chen
    board: dummyBoards[2], // Photography Tips
    likes: [dummyUsers[0]._id, dummyUsers[2]._id],
    saves: [dummyUsers[2]._id],
    comments: [
      {
        _id: 'comment3',
        text: 'This is super helpful! Thanks for sharing',
        author: dummyUsers[2],
        createdAt: '2024-03-22T17:00:00Z',
      }
    ],
    tags: ['photography', 'tutorial', 'camera', 'tips'],
    createdAt: '2024-03-22T16:45:00Z',
    isLiked: false,
    isSaved: false,
  }
];

// Add pin references to boards
dummyBoards[0].pins = [dummyPins[0]];
dummyBoards[1].pins = [dummyPins[1]];
dummyBoards[2].pins = [dummyPins[2]];

// Helper function to get current user (for testing)
export const getCurrentUser = () => dummyUsers[0]; // Sarah Wilson as default logged-in user

// Helper function to check if a pin is liked by the current user
export const isPinLikedByUser = (pin, userId = getCurrentUser()._id) => {
  return pin.likes.includes(userId);
};

// Helper function to check if a pin is saved by the current user
export const isPinSavedByUser = (pin, userId = getCurrentUser()._id) => {
  return pin.saves.includes(userId);
};

// Helper function to check if a board is followed by the current user
export const isBoardFollowedByUser = (board, userId = getCurrentUser()._id) => {
  return board.followers.includes(userId);
};

// Helper function to check if a user is followed by the current user
export const isUserFollowedByUser = (user, userId = getCurrentUser()._id) => {
  return user.followers.includes(userId);
};

// Helper function to get a user's boards
export const getUserBoards = (userId) => {
  return dummyBoards.filter(board => board.author._id === userId);
};

// Helper function to get a user's pins
export const getUserPins = (userId) => {
  return dummyPins.filter(pin => pin.author._id === userId);
};

// Helper function to get board by id
export const getBoardById = (boardId) => {
  return dummyBoards.find(board => board._id === boardId);
};

// Helper function to get pin by id
export const getPinById = (pinId) => {
  return dummyPins.find(pin => pin._id === pinId);
};

// Helper function to get user by id
export const getUserById = (userId) => {
  return dummyUsers.find(user => user._id === userId);
}; 