const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const Comment = require('../models/Comment');

const MONGODB_URI = 'mongodb://localhost:27017/pinterest-clone';

const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Digital artist and photographer. Love capturing moments and creating art.',
    location: 'New York, USA',
    website: 'https://johndoe.art',
  },
  {
    username: 'sarah_smith',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Interior designer and home decor enthusiast. Sharing my design journey.',
    location: 'Los Angeles, USA',
    website: 'https://sarahdesigns.com',
  },
  {
    username: 'mike_wilson',
    email: 'mike@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Food lover and amateur chef. Cooking and sharing recipes.',
    location: 'Chicago, USA',
    website: 'https://mikeskitchen.com',
  },
  {
    username: 'emma_brown',
    email: 'emma@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=4',
    bio: 'Travel blogger and adventure seeker. Exploring the world one destination at a time.',
    location: 'London, UK',
    website: 'https://emmastravels.com',
  },
  {
    username: 'david_lee',
    email: 'david@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Tech enthusiast and gadget reviewer. Sharing the latest in technology.',
    location: 'San Francisco, USA',
    website: 'https://davidtech.com',
  },
  {
    username: 'lisa_chen',
    email: 'lisa@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=6',
    bio: 'Fashion designer and style influencer. Creating sustainable fashion.',
    location: 'Paris, France',
    website: 'https://lisachen.fashion',
  },
  {
    username: 'alex_wright',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=7',
    bio: 'Fitness trainer and wellness coach. Helping others achieve their goals.',
    location: 'Sydney, Australia',
    website: 'https://alexfitness.com',
  },
  {
    username: 'sophia_rodriguez',
    email: 'sophia@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=8',
    bio: 'Garden designer and plant enthusiast. Creating beautiful outdoor spaces.',
    location: 'Barcelona, Spain',
    website: 'https://sophiagardens.com',
  },
  {
    username: 'james_miller',
    email: 'james@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'Car enthusiast and automotive photographer. Capturing automotive beauty.',
    location: 'Detroit, USA',
    website: 'https://jamescars.com',
  },
  {
    username: 'olivia_park',
    email: 'olivia@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=10',
    bio: 'Digital nomad and remote work advocate. Working and traveling the world.',
    location: 'Seoul, South Korea',
    website: 'https://oliviatravels.com',
  },
  {
    username: 'ryan_kim',
    email: 'ryan@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=11',
    bio: 'Coffee expert and barista. Sharing coffee culture and brewing techniques.',
    location: 'Seattle, USA',
    website: 'https://ryancoffee.com',
  },
  {
    username: 'mia_zhang',
    email: 'mia@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Art curator and gallery owner. Promoting contemporary artists.',
    location: 'Shanghai, China',
    website: 'https://miagallery.com',
  },
  {
    username: 'lucas_silva',
    email: 'lucas@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=13',
    bio: 'Music producer and DJ. Creating electronic music and soundscapes.',
    location: 'Berlin, Germany',
    website: 'https://lucasmusic.com',
  },
  {
    username: 'ava_patel',
    email: 'ava@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=14',
    bio: 'Yoga instructor and meditation guide. Promoting mindfulness and wellness.',
    location: 'Mumbai, India',
    website: 'https://avayoga.com',
  },
  {
    username: 'noah_anderson',
    email: 'noah@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=15',
    bio: 'Architect and sustainable design advocate. Creating eco-friendly spaces.',
    location: 'Copenhagen, Denmark',
    website: 'https://noaharchitect.com',
  }
];

const boards = [
  // John's boards
  {
    title: 'Urban Photography',
    description: 'Capturing city life and architecture',
    category: 'Photography',
    isPrivate: false,
    owner: 'john_doe',
  },
  {
    title: 'Digital Art Inspiration',
    description: 'Creative digital artwork and techniques',
    category: 'Art',
    isPrivate: false,
    owner: 'john_doe',
  },
  {
    title: 'Photography Tips',
    description: 'Tips and tricks for better photos',
    category: 'Photography',
    isPrivate: false,
    owner: 'john_doe',
  },

  // Sarah's boards
  {
    title: 'Modern Home Decor',
    description: 'Contemporary interior design ideas',
    category: 'Design',
    isPrivate: false,
    owner: 'sarah_smith',
  },
  {
    title: 'DIY Home Projects',
    description: 'Creative DIY ideas for home improvement',
    category: 'Design',
    isPrivate: false,
    owner: 'sarah_smith',
  },
  {
    title: 'Color Palettes',
    description: 'Beautiful color combinations for home design',
    category: 'Design',
    isPrivate: false,
    owner: 'sarah_smith',
  },

  // Mike's boards
  {
    title: 'Gourmet Recipes',
    description: 'Delicious and sophisticated dishes',
    category: 'Food',
    isPrivate: false,
    owner: 'mike_wilson',
  },
  {
    title: 'Kitchen Tips',
    description: 'Cooking techniques and kitchen hacks',
    category: 'Food',
    isPrivate: false,
    owner: 'mike_wilson',
  },
  {
    title: 'Food Photography',
    description: 'Tips for capturing beautiful food photos',
    category: 'Food',
    isPrivate: false,
    owner: 'mike_wilson',
  },

  // Emma's boards
  {
    title: 'Travel Destinations',
    description: 'Beautiful places around the world',
    category: 'Travel',
    isPrivate: false,
    owner: 'emma_brown',
  },
  {
    title: 'Travel Tips',
    description: 'Essential travel advice and hacks',
    category: 'Travel',
    isPrivate: false,
    owner: 'emma_brown',
  },
  {
    title: 'Adventure Photography',
    description: 'Capturing outdoor adventures',
    category: 'Photography',
    isPrivate: false,
    owner: 'emma_brown',
  },

  // David's boards
  {
    title: 'Tech Reviews',
    description: 'Latest gadget and tech reviews',
    category: 'Tech',
    isPrivate: false,
    owner: 'david_lee',
  },
  {
    title: 'Smart Home',
    description: 'Smart home automation and tips',
    category: 'Tech',
    isPrivate: false,
    owner: 'david_lee',
  },
];

const originalPins = [
  {
    title: 'Beautiful Sunset in Bali',
    description: 'Captured this amazing sunset during my trip to Bali. The colors were absolutely stunning!',
    imageUrl: 'https://source.unsplash.com/800x600/?sunset,bali',
    category: 'Travel',
    tags: ['travel', 'sunset', 'bali'],
    boardCategory: 'Travel',
  },
  {
    title: 'Modern Living Room Design',
    description: 'Clean and minimal living room design with neutral colors and natural elements.',
    imageUrl: 'https://source.unsplash.com/800x600/?living-room,modern',
    category: 'Design',
    tags: ['interior', 'modern', 'minimal'],
    boardCategory: 'Design',
  },
  // ... keep other original pins with added tags and boardCategory ...
];

// Additional 30 pins with more detailed information
const additionalPins = [
  // Photography pins
  {
    title: 'Long Exposure Night Photography',
    description: 'Learn how to capture stunning light trails and star trails with these long exposure techniques. Settings: f/2.8, 30sec, ISO 800.',
    imageUrl: 'https://source.unsplash.com/800x600/?night,photography',
    category: 'Photography',
    tags: ['night photography', 'long exposure', 'tutorial'],
    boardCategory: 'Photography',
  },
  {
    title: 'Urban Architecture Series',
    description: 'Geometric patterns in modern architecture. Shot in downtown Chicago using a wide-angle lens.',
    imageUrl: 'https://source.unsplash.com/800x600/?architecture,urban',
    category: 'Architecture',
    tags: ['architecture', 'urban', 'geometric'],
    boardCategory: 'Architecture',
  },

  // Interior Design pins
  {
    title: 'Scandinavian Living Room',
    description: 'Minimalist Scandinavian design featuring natural materials and neutral colors. Furniture from IKEA and local artisans.',
    imageUrl: 'https://source.unsplash.com/800x600/?scandinavian,interior',
    category: 'Design',
    tags: ['scandinavian', 'minimalist', 'interior design'],
    boardCategory: 'Design',
  },
  {
    title: 'DIY Floating Shelves',
    description: 'Step-by-step guide to creating custom floating shelves. Materials needed: wood planks, brackets, drill, level.',
    imageUrl: 'https://source.unsplash.com/800x600/?shelves,diy',
    category: 'Design',
    tags: ['DIY', 'home improvement', 'storage'],
    boardCategory: 'Design',
  },

  // Cooking pins
  {
    title: 'Homemade Sourdough Bread',
    description: 'Artisanal sourdough bread recipe. 75% hydration, 24-hour fermentation. Ingredients: flour, water, salt, starter.',
    imageUrl: 'https://source.unsplash.com/800x600/?sourdough,bread',
    category: 'Food',
    tags: ['baking', 'sourdough', 'bread'],
    boardCategory: 'Gourmet Recipes',
  },
  {
    title: 'Knife Skills 101',
    description: 'Essential knife techniques every home chef should know. Includes proper grip, basic cuts, and safety tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?knife,cooking',
    category: 'Food',
    tags: ['cooking', 'techniques', 'kitchen'],
    boardCategory: 'Kitchen Tips',
  },

  // Travel pins
  {
    title: 'Hidden Gems of Kyoto',
    description: 'Exploring lesser-known temples and gardens in Kyoto, Japan. Best visited during cherry blossom season.',
    imageUrl: 'https://source.unsplash.com/800x600/?kyoto,temple',
    category: 'Travel',
    tags: ['japan', 'kyoto', 'travel'],
    boardCategory: 'Travel Destinations',
  },
  {
    title: 'Backpacking Essentials',
    description: 'Complete packing list for long-term travel. Includes gear recommendations and space-saving tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?backpack,travel',
    category: 'Travel',
    tags: ['backpacking', 'travel tips', 'packing'],
    boardCategory: 'Travel Tips',
  },

  // Tech pins
  {
    title: 'Smart Home Automation Guide',
    description: 'Comprehensive guide to setting up a smart home system. Compatible with Alexa, Google Home, and HomeKit.',
    imageUrl: 'https://source.unsplash.com/800x600/?smarthome,technology',
    category: 'Tech',
    tags: ['smart home', 'automation', 'tech'],
    boardCategory: 'Tech',
  },
  {
    title: 'Latest Smartphone Camera Comparison',
    description: 'Detailed comparison of flagship smartphone cameras. Tests include low-light, portrait, and ultra-wide shots.',
    imageUrl: 'https://source.unsplash.com/800x600/?smartphone,camera',
    category: 'Tech',
    tags: ['smartphone', 'camera', 'review'],
    boardCategory: 'Tech',
  },
];

// Additional pins for new users
const additionalUserPins = [
  // Fashion pins
  {
    title: 'Sustainable Fashion Collection',
    description: 'Eco-friendly fashion pieces made from recycled materials. Each piece tells a story of sustainability.',
    imageUrl: 'https://source.unsplash.com/800x600/?fashion,sustainable',
    category: 'Fashion',
    tags: ['sustainable', 'fashion', 'eco-friendly'],
    boardCategory: 'Fashion',
  },
  {
    title: 'Street Style Photography',
    description: 'Capturing urban fashion trends and street style moments. Shot in Paris Fashion Week.',
    imageUrl: 'https://source.unsplash.com/800x600/?street-style,fashion',
    category: 'Fashion',
    tags: ['street style', 'fashion week', 'photography'],
    boardCategory: 'Fashion',
  },

  // Fitness pins
  {
    title: 'Home Workout Routine',
    description: 'Complete 30-minute home workout routine. No equipment needed. Perfect for beginners.',
    imageUrl: 'https://source.unsplash.com/800x600/?workout,fitness',
    category: 'Fitness',
    tags: ['workout', 'fitness', 'home exercise'],
    boardCategory: 'Fitness',
  },
  {
    title: 'Healthy Meal Prep Guide',
    description: 'Weekly meal prep guide with balanced nutrition. Includes shopping list and storage tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?meal-prep,healthy',
    category: 'Fitness',
    tags: ['meal prep', 'healthy eating', 'nutrition'],
    boardCategory: 'Fitness',
  },

  // Gardening pins
  {
    title: 'Vertical Garden Design',
    description: 'Create a stunning vertical garden with self-watering system. Perfect for small spaces.',
    imageUrl: 'https://source.unsplash.com/800x600/?garden,vertical',
    category: 'Gardening',
    tags: ['garden', 'vertical garden', 'plants'],
    boardCategory: 'Gardening',
  },
  {
    title: 'Succulent Arrangement Guide',
    description: 'Learn how to create beautiful succulent arrangements. Includes care instructions.',
    imageUrl: 'https://source.unsplash.com/800x600/?succulents,garden',
    category: 'Gardening',
    tags: ['succulents', 'garden', 'arrangement'],
    boardCategory: 'Gardening',
  },

  // Automotive pins
  {
    title: 'Classic Car Photography',
    description: 'Capturing the beauty of vintage automobiles. Tips for automotive photography.',
    imageUrl: 'https://source.unsplash.com/800x600/?classic-car,automotive',
    category: 'Automotive',
    tags: ['classic cars', 'photography', 'automotive'],
    boardCategory: 'Automotive',
  },
  {
    title: 'Car Detailing Guide',
    description: 'Professional car detailing techniques. From washing to waxing, step by step.',
    imageUrl: 'https://source.unsplash.com/800x600/?car-detailing,automotive',
    category: 'Automotive',
    tags: ['car care', 'detailing', 'automotive'],
    boardCategory: 'Automotive',
  },

  // Digital Nomad pins
  {
    title: 'Remote Work Setup Guide',
    description: 'Essential tools and setup for productive remote work. Includes ergonomic tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?remote-work,office',
    category: 'Digital Nomad',
    tags: ['remote work', 'productivity', 'setup'],
    boardCategory: 'Digital Nomad',
  },
  {
    title: 'Travel Workstation',
    description: 'Portable workstation setup for digital nomads. Lightweight and efficient.',
    imageUrl: 'https://source.unsplash.com/800x600/?travel,workstation',
    category: 'Digital Nomad',
    tags: ['digital nomad', 'travel', 'workstation'],
    boardCategory: 'Digital Nomad',
  },

  // Coffee pins
  {
    title: 'Latte Art Tutorial',
    description: 'Master the art of latte decoration. Basic to advanced patterns.',
    imageUrl: 'https://source.unsplash.com/800x600/?latte-art,coffee',
    category: 'Coffee',
    tags: ['coffee', 'latte art', 'tutorial'],
    boardCategory: 'Coffee',
  },
  {
    title: 'Coffee Brewing Methods',
    description: 'Comparison of different coffee brewing methods. Find your perfect cup.',
    imageUrl: 'https://source.unsplash.com/800x600/?coffee-brewing,coffee',
    category: 'Coffee',
    tags: ['coffee', 'brewing', 'methods'],
    boardCategory: 'Coffee',
  },

  // Art pins
  {
    title: 'Contemporary Art Gallery',
    description: 'Showcase of emerging contemporary artists. Each piece tells a unique story.',
    imageUrl: 'https://source.unsplash.com/800x600/?art-gallery,contemporary',
    category: 'Art',
    tags: ['art', 'gallery', 'contemporary'],
    boardCategory: 'Art',
  },
  {
    title: 'Art Installation Guide',
    description: 'How to create impactful art installations. From concept to execution.',
    imageUrl: 'https://source.unsplash.com/800x600/?art-installation,art',
    category: 'Art',
    tags: ['art', 'installation', 'guide'],
    boardCategory: 'Art',
  },

  // Music pins
  {
    title: 'Home Studio Setup',
    description: 'Professional home music studio setup guide. Equipment recommendations included.',
    imageUrl: 'https://source.unsplash.com/800x600/?music-studio,studio',
    category: 'Music',
    tags: ['music', 'studio', 'production'],
    boardCategory: 'Music',
  },
  {
    title: 'DJ Equipment Guide',
    description: 'Essential DJ equipment for beginners. From controllers to speakers.',
    imageUrl: 'https://source.unsplash.com/800x600/?dj-equipment,music',
    category: 'Music',
    tags: ['dj', 'equipment', 'music'],
    boardCategory: 'Music',
  },

  // Yoga pins
  {
    title: 'Morning Yoga Flow',
    description: 'Start your day with this energizing yoga sequence. Perfect for beginners.',
    imageUrl: 'https://source.unsplash.com/800x600/?yoga,morning',
    category: 'Yoga',
    tags: ['yoga', 'morning routine', 'fitness'],
    boardCategory: 'Yoga',
  },
  {
    title: 'Meditation Guide',
    description: 'Learn different meditation techniques. From mindfulness to transcendental.',
    imageUrl: 'https://source.unsplash.com/800x600/?meditation,yoga',
    category: 'Yoga',
    tags: ['meditation', 'mindfulness', 'wellness'],
    boardCategory: 'Yoga',
  },

  // Architecture pins
  {
    title: 'Sustainable Building Design',
    description: 'Eco-friendly architectural solutions. From materials to energy efficiency.',
    imageUrl: 'https://source.unsplash.com/800x600/?architecture,sustainable',
    category: 'Architecture',
    tags: ['architecture', 'sustainable', 'design'],
    boardCategory: 'Architecture',
  },
  {
    title: 'Modern Architecture Tour',
    description: 'Virtual tour of iconic modern buildings. Architectural analysis included.',
    imageUrl: 'https://source.unsplash.com/800x600/?modern-architecture,building',
    category: 'Architecture',
    tags: ['architecture', 'modern', 'buildings'],
    boardCategory: 'Architecture',
  }
];

// Additional 50 pins with detailed information
const morePins = [
  // Photography pins
  {
    title: 'Macro Photography Tips',
    description: 'Master the art of macro photography. Equipment: Canon 100mm f/2.8L macro lens, ring flash, tripod.',
    imageUrl: 'https://source.unsplash.com/800x600/?macro,photography',
    category: 'Photography',
    tags: ['macro', 'photography', 'tutorial'],
    boardCategory: 'Photography',
  },
  {
    title: 'Portrait Lighting Setup',
    description: 'Professional portrait lighting techniques using natural and artificial light. Includes diagram.',
    imageUrl: 'https://source.unsplash.com/800x600/?portrait,lighting',
    category: 'Photography',
    tags: ['portrait', 'lighting', 'photography'],
    boardCategory: 'Photography',
  },

  // Food pins
  {
    title: 'Artisanal Pizza Making',
    description: 'Authentic Neapolitan pizza recipe. Dough: 00 flour, water, salt, yeast. 72-hour fermentation.',
    imageUrl: 'https://source.unsplash.com/800x600/?pizza,homemade',
    category: 'Food',
    tags: ['pizza', 'baking', 'italian'],
    boardCategory: 'Gourmet Recipes',
  },
  {
    title: 'Sushi Rolling Guide',
    description: 'Step-by-step guide to making perfect sushi rolls. Includes rice preparation and rolling techniques.',
    imageUrl: 'https://source.unsplash.com/800x600/?sushi,rolling',
    category: 'Food',
    tags: ['sushi', 'japanese', 'cooking'],
    boardCategory: 'Gourmet Recipes',
  },

  // Travel pins
  {
    title: 'Northern Lights Guide',
    description: 'Complete guide to photographing the Northern Lights. Best locations, timing, and camera settings.',
    imageUrl: 'https://source.unsplash.com/800x600/?aurora,northern-lights',
    category: 'Travel',
    tags: ['aurora', 'photography', 'travel'],
    boardCategory: 'Travel Destinations',
  },
  {
    title: 'Hidden Beaches of Thailand',
    description: 'Discover secluded beaches and islands in Thailand. Includes local tips and best times to visit.',
    imageUrl: 'https://source.unsplash.com/800x600/?beach,thailand',
    category: 'Travel',
    tags: ['beach', 'thailand', 'travel'],
    boardCategory: 'Travel Destinations',
  },

  // Tech pins
  {
    title: 'Home Server Setup',
    description: 'Build your own home server for media streaming and file storage. Hardware and software guide.',
    imageUrl: 'https://source.unsplash.com/800x600/?server,technology',
    category: 'Tech',
    tags: ['server', 'tech', 'diy'],
    boardCategory: 'Tech',
  },
  {
    title: 'Smart Watch Comparison',
    description: 'Detailed comparison of latest smartwatches. Battery life, features, and compatibility analysis.',
    imageUrl: 'https://source.unsplash.com/800x600/?smartwatch,tech',
    category: 'Tech',
    tags: ['smartwatch', 'tech', 'review'],
    boardCategory: 'Tech',
  },

  // Fashion pins
  {
    title: 'Vintage Fashion Collection',
    description: 'Curated collection of vintage fashion pieces. Includes styling tips and care instructions.',
    imageUrl: 'https://source.unsplash.com/800x600/?vintage,fashion',
    category: 'Fashion',
    tags: ['vintage', 'fashion', 'style'],
    boardCategory: 'Fashion',
  },
  {
    title: 'Sustainable Fabric Guide',
    description: 'Guide to eco-friendly fabrics and materials. Impact on environment and care instructions.',
    imageUrl: 'https://source.unsplash.com/800x600/?fabric,sustainable',
    category: 'Fashion',
    tags: ['sustainable', 'fabric', 'fashion'],
    boardCategory: 'Fashion',
  },

  // Fitness pins
  {
    title: 'HIIT Workout Guide',
    description: 'High-intensity interval training routine. 30-minute workout with proper form demonstrations.',
    imageUrl: 'https://source.unsplash.com/800x600/?workout,hiit',
    category: 'Fitness',
    tags: ['hiit', 'workout', 'fitness'],
    boardCategory: 'Fitness',
  },
  {
    title: 'Protein Smoothie Recipes',
    description: 'Healthy protein smoothie recipes for post-workout recovery. Includes nutritional information.',
    imageUrl: 'https://source.unsplash.com/800x600/?smoothie,healthy',
    category: 'Fitness',
    tags: ['smoothie', 'protein', 'healthy'],
    boardCategory: 'Fitness',
  },

  // Gardening pins
  {
    title: 'Herb Garden Guide',
    description: 'Create and maintain a kitchen herb garden. Includes plant selection and care tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?herbs,garden',
    category: 'Gardening',
    tags: ['herbs', 'garden', 'cooking'],
    boardCategory: 'Gardening',
  },
  {
    title: 'Composting Guide',
    description: 'Learn how to create nutrient-rich compost. Step-by-step guide with troubleshooting tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?compost,garden',
    category: 'Gardening',
    tags: ['compost', 'garden', 'sustainable'],
    boardCategory: 'Gardening',
  },

  // Automotive pins
  {
    title: 'Electric Vehicle Guide',
    description: 'Complete guide to electric vehicles. Charging, maintenance, and cost comparison.',
    imageUrl: 'https://source.unsplash.com/800x600/?electric-car,automotive',
    category: 'Automotive',
    tags: ['ev', 'automotive', 'sustainable'],
    boardCategory: 'Automotive',
  },
  {
    title: 'Car Photography Tips',
    description: 'Professional car photography techniques. Lighting, angles, and post-processing guide.',
    imageUrl: 'https://source.unsplash.com/800x600/?car-photography,automotive',
    category: 'Automotive',
    tags: ['photography', 'cars', 'automotive'],
    boardCategory: 'Automotive',
  },

  // Digital Nomad pins
  {
    title: 'Digital Nomad Tools',
    description: 'Essential tools and apps for digital nomads. Productivity, communication, and travel apps.',
    imageUrl: 'https://source.unsplash.com/800x600/?digital-nomad,tools',
    category: 'Digital Nomad',
    tags: ['digital nomad', 'tools', 'productivity'],
    boardCategory: 'Digital Nomad',
  },
  {
    title: 'Remote Work Communication',
    description: 'Effective communication strategies for remote teams. Tools and best practices.',
    imageUrl: 'https://source.unsplash.com/800x600/?remote-work,communication',
    category: 'Digital Nomad',
    tags: ['remote work', 'communication', 'team'],
    boardCategory: 'Digital Nomad',
  },

  // Coffee pins
  {
    title: 'Coffee Bean Guide',
    description: 'Understanding different coffee beans and roasts. Origin, flavor profiles, and brewing tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?coffee-beans,coffee',
    category: 'Coffee',
    tags: ['coffee', 'beans', 'brewing'],
    boardCategory: 'Coffee',
  },
  {
    title: 'Coffee Shop Design',
    description: 'Design inspiration for coffee shops. Layout, lighting, and atmosphere tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?coffee-shop,design',
    category: 'Coffee',
    tags: ['coffee shop', 'design', 'interior'],
    boardCategory: 'Coffee',
  },

  // Art pins
  {
    title: 'Digital Art Tools',
    description: 'Essential tools and software for digital artists. Hardware and software recommendations.',
    imageUrl: 'https://source.unsplash.com/800x600/?digital-art,tools',
    category: 'Art',
    tags: ['digital art', 'tools', 'software'],
    boardCategory: 'Art',
  },
  {
    title: 'Color Theory Guide',
    description: 'Understanding color theory for artists. Color wheel, harmonies, and psychology.',
    imageUrl: 'https://source.unsplash.com/800x600/?color-theory,art',
    category: 'Art',
    tags: ['color theory', 'art', 'design'],
    boardCategory: 'Art',
  },

  // Music pins
  {
    title: 'Music Production Guide',
    description: 'Beginner\'s guide to music production. DAW setup, plugins, and basic techniques.',
    imageUrl: 'https://source.unsplash.com/800x600/?music-production,studio',
    category: 'Music',
    tags: ['music', 'production', 'studio'],
    boardCategory: 'Music',
  },
  {
    title: 'Live Sound Setup',
    description: 'Professional live sound setup guide. Equipment, mixing, and troubleshooting.',
    imageUrl: 'https://source.unsplash.com/800x600/?live-sound,music',
    category: 'Music',
    tags: ['live sound', 'music', 'audio'],
    boardCategory: 'Music',
  },

  // Yoga pins
  {
    title: 'Advanced Yoga Poses',
    description: 'Guide to advanced yoga poses. Safety tips and progression techniques.',
    imageUrl: 'https://source.unsplash.com/800x600/?yoga,advanced',
    category: 'Yoga',
    tags: ['yoga', 'poses', 'advanced'],
    boardCategory: 'Yoga',
  },
  {
    title: 'Yoga for Athletes',
    description: 'Yoga sequences designed for athletes. Focus on flexibility and recovery.',
    imageUrl: 'https://source.unsplash.com/800x600/?yoga,athletes',
    category: 'Yoga',
    tags: ['yoga', 'athletes', 'fitness'],
    boardCategory: 'Yoga',
  },

  // Architecture pins
  {
    title: 'Green Building Design',
    description: 'Sustainable building design principles. Materials, energy efficiency, and certifications.',
    imageUrl: 'https://source.unsplash.com/800x600/?green-building,architecture',
    category: 'Architecture',
    tags: ['green building', 'architecture', 'sustainable'],
    boardCategory: 'Architecture',
  },
  {
    title: 'Architectural Photography',
    description: 'Techniques for capturing architectural photography. Equipment and composition tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?architecture,photography',
    category: 'Architecture',
    tags: ['architecture', 'photography', 'design'],
    boardCategory: 'Architecture',
  },

  // Additional categories
  {
    title: 'Minimalist Design Guide',
    description: 'Principles of minimalist design. Space, light, and material selection.',
    imageUrl: 'https://source.unsplash.com/800x600/?minimalist,design',
    category: 'Design',
    tags: ['minimalist', 'design', 'interior'],
    boardCategory: 'Design',
  },
  {
    title: 'Sustainable Living Tips',
    description: 'Daily sustainable living practices. Reduce, reuse, and recycle guide.',
    imageUrl: 'https://source.unsplash.com/800x600/?sustainable,living',
    category: 'Lifestyle',
    tags: ['sustainable', 'lifestyle', 'eco'],
    boardCategory: 'Lifestyle',
  },
  {
    title: 'Urban Gardening Guide',
    description: 'Create a garden in small urban spaces. Container and vertical gardening tips.',
    imageUrl: 'https://source.unsplash.com/800x600/?urban-garden,gardening',
    category: 'Gardening',
    tags: ['urban garden', 'gardening', 'sustainable'],
    boardCategory: 'Gardening',
  },
  {
    title: 'Photography Composition',
    description: 'Master photography composition techniques. Rule of thirds, leading lines, and more.',
    imageUrl: 'https://source.unsplash.com/800x600/?photography,composition',
    category: 'Photography',
    tags: ['photography', 'composition', 'tutorial'],
    boardCategory: 'Photography',
  },
  {
    title: 'Smart Home Security',
    description: 'Modern home security systems. Cameras, sensors, and automation guide.',
    imageUrl: 'https://source.unsplash.com/800x600/?security,smarthome',
    category: 'Tech',
    tags: ['security', 'smart home', 'tech'],
    boardCategory: 'Tech',
  }
];

// Combine all pins
const allPins = [...originalPins, ...additionalPins, ...additionalUserPins, ...morePins];

const comments = [
  {
    text: 'This is absolutely stunning! The colors are incredible.',
    createdAt: new Date(),
  },
  {
    text: 'I love the minimalist design. Where did you get the furniture?',
    createdAt: new Date(),
  },
  {
    text: 'This looks delicious! Could you share the recipe?',
    createdAt: new Date(),
  },
  {
    text: 'The composition is perfect! What camera did you use?',
    createdAt: new Date(),
  },
  {
    text: 'I need this in my home! The lighting is perfect.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly what I was looking for! Thanks for sharing.',
    createdAt: new Date(),
  },
  {
    text: 'The attention to detail is amazing. Great work!',
    createdAt: new Date(),
  },
  {
    text: 'I tried this recipe and it turned out amazing!',
    createdAt: new Date(),
  },
  {
    text: 'The color palette is so inspiring. Love it!',
    createdAt: new Date(),
  },
  {
    text: 'This gives me so many ideas for my own space.',
    createdAt: new Date(),
  },
  {
    text: 'The lighting in this photo is perfect!',
    createdAt: new Date(),
  },
  {
    text: 'I would love to visit this place someday.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly the style I\'m going for!',
    createdAt: new Date(),
  },
  {
    text: 'The presentation is beautiful!',
    createdAt: new Date(),
  },
  {
    text: 'This is such a creative idea!',
    createdAt: new Date(),
  },
  {
    text: 'I\'m saving this for inspiration!',
    createdAt: new Date(),
  },
  {
    text: 'The details are incredible!',
    createdAt: new Date(),
  },
  {
    text: 'This is so helpful, thank you!',
    createdAt: new Date(),
  },
  {
    text: 'I love how you captured this moment.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly what I needed!',
    createdAt: new Date(),
  },
];

const getRandomDateWithinDays = (days) => {
  const now = new Date();
  return new Date(now.getTime() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000));
};

const getRandomDeviceType = () => {
  const types = ['mobile', 'desktop', 'tablet'];
  return types[Math.floor(Math.random() * types.length)];
};

const getRandomDeviceTypesCount = (total) => {
  // Distribute total randomly among device types
  let remaining = total;
  const mobile = Math.floor(Math.random() * (remaining + 1));
  remaining -= mobile;
  const desktop = Math.floor(Math.random() * (remaining + 1));
  remaining -= desktop;
  const tablet = remaining;
  return { mobile, desktop, tablet };
};

const getRandomLocations = (total) => {
  const locations = ['US', 'UK', 'FR', 'DE', 'IN', 'CN', 'AU', 'ES', 'DK', 'KR'];
  const locMap = {};
  let remaining = total;
  while (remaining > 0) {
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const count = Math.max(1, Math.floor(Math.random() * remaining));
    locMap[loc] = (locMap[loc] || 0) + count;
    remaining -= count;
  }
  return locMap;
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    await Pin.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        // Analytics fields
        const loginCount = Math.floor(Math.random() * 50) + 1;
        const deviceType = getRandomDeviceType();
        const deviceTypes = getRandomDeviceTypesCount(loginCount);
        const locations = getRandomLocations(loginCount);
        const lastLogin = getRandomDateWithinDays(30);
        const sessionDuration = Math.floor(Math.random() * 116) + 5; // 5-120 min
        const activityScore = Math.floor(Math.random() * 991) + 10; // 10-1000
        return User.create({
          ...user,
          password: hashedPassword,
          lastLogin,
          loginCount,
          deviceType,
          deviceTypes,
          locations,
          sessionDuration,
          activityScore
        });
      })
    );
    console.log('Created users');

    // Set up unidirectional followers (each user follows 2-5 random users)
    for (const user of createdUsers) {
      const numFollowing = Math.floor(Math.random() * 4) + 2; // 2-5 following
      const potentialUsersToFollow = createdUsers.filter(u => u._id.toString() !== user._id.toString());
      
      for (let i = 0; i < numFollowing; i++) {
        const randomUser = potentialUsersToFollow[Math.floor(Math.random() * potentialUsersToFollow.length)];
        user.following.push(randomUser._id);
        randomUser.followers.push(user._id);
      }
    }
    await Promise.all(createdUsers.map(user => user.save()));
    console.log('Set up followers');

    // Create boards
    const createdBoards = await Promise.all(
      boards.map(async (board) => {
        const user = createdUsers.find(u => u.username === board.owner);
        return Board.create({
          ...board,
          user: user._id,
        });
      })
    );
    console.log('Created boards');

    // Create pins and associate with boards
    for (const pin of allPins) {
      // Find appropriate board and user based on categories
      const board = createdBoards.find(b => 
        b.category === pin.boardCategory || b.category === pin.category
      );
      const user = board ? await User.findById(board.user) : createdUsers[Math.floor(Math.random() * createdUsers.length)];

      // Analytics fields for pins
      const views = Math.floor(Math.random() * 991) + 10; // 10-1000
      const saves = Math.floor(Math.random() * 200) + 1;
      const clicks = Math.floor(Math.random() * 301);
      const viewDuration = Math.floor(Math.random() * 4991) + 10; // 10-5000 sec
      const deviceTypes = getRandomDeviceTypesCount(views);
      const locations = getRandomLocations(views);

      const createdPin = await Pin.create({
        ...pin,
        user: user._id,
        board: board ? board._id : null,
        views,
        saves,
        clicks,
        viewDuration,
        deviceTypes,
        locations
      });

      // Add 1-4 random comments to each pin from different users
      const numComments = Math.floor(Math.random() * 4) + 1; // 1-4 comments
      const commenters = new Set(); // Track unique commenters

      for (let j = 0; j < numComments; j++) {
        // Get a random user who hasn't commented yet
        let randomCommenter;
        do {
          randomCommenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        } while (commenters.has(randomCommenter._id.toString()) && commenters.size < createdUsers.length - 1);
        
        commenters.add(randomCommenter._id.toString());
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        
        await Comment.create({
          text: randomComment.text,
          user: randomCommenter._id,
          pin: createdPin._id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within last week
        });
      }
    }
    console.log('Created pins and comments');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 