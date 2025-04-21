# Pinterest Clone

A full-stack Pinterest clone built with the MERN stack (MongoDB, Express.js, React.js, Node.js). 

## Features (existing, to improve, and implement)

- User authentication and authorization
- Create, edit, and delete pins
- Organize pins into boards
- Follow/unfollow users
- Comment on pins
- Search functionality
- Responsive design
- Modern UI with Material-UI components

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Project Structure

```
pinterest-clone/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pinterest-clone.git (make sure it is private)
cd pinterest-clone
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pinterest-clone
JWT_SECRET=your_jwt_secret_here
```

4. Start MongoDB:
```bash
# On macOS/Linux
mongod

# On Windows (if installed as a service)
net start MongoDB
```

5. Seed the database:
```bash
node scripts/seedDatabase.js
```

6. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend application will run on `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- GET `/api/users/:id/followers` - Get user followers
- GET `/api/users/:id/following` - Get user following
- POST `/api/users/:id/follow` - Follow user
- POST `/api/users/:id/unfollow` - Unfollow user

### Pins
- GET `/api/pins` - Get all pins
- GET `/api/pins/:id` - Get pin by ID
- POST `/api/pins` - Create new pin
- PUT `/api/pins/:id` - Update pin
- DELETE `/api/pins/:id` - Delete pin
- GET `/api/pins/search` - Search pins

### Boards
- GET `/api/boards` - Get all boards
- GET `/api/boards/:id` - Get board by ID
- POST `/api/boards` - Create new board
- PUT `/api/boards/:id` - Update board
- DELETE `/api/boards/:id` - Delete board

### Comments
- GET `/api/pins/:pinId/comments` - Get pin comments
- POST `/api/pins/:pinId/comments` - Add comment to pin
- DELETE `/api/pins/:pinId/comments/:commentId` - Delete comment

## Test Accounts

The database comes pre-seeded with test accounts. You can use any of these accounts to test the application:

1. john_doe@example.com / password123
2. sarah_smith@example.com / password123
3. mike_wilson@example.com / password123
4. emma_brown@example.com / password123
5. david_lee@example.com / password123
6. lisa_chen@example.com / password123
7. alex_wright@example.com / password123
8. sophia_rodriguez@example.com / password123
9. james_miller@example.com / password123
10. olivia_park@example.com / password123
11. ryan_kim@example.com / password123
12. mia_zhang@example.com / password123
13. lucas_silva@example.com / password123
14. ava_patel@example.com / password123
15. noah_anderson@example.com / password123


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the component library
- Unsplash for the image API
- MongoDB for the database
- Express.js for the backend framework
- React.js for the frontend framework 
