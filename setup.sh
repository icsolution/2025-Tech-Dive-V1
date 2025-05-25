#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Pinterest Clone...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Please install MongoDB first."
    exit 1
fi

# Create backend .env file
echo -e "${BLUE}Creating backend environment file...${NC}"
cat > backend/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pinterest-clone
JWT_SECRET=your_jwt_secret_here
EOL

# Create frontend .env file
echo -e "${BLUE}Creating frontend environment file...${NC}"
cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:5000/api
EOL

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install

# Start MongoDB (if not already running)
echo -e "${BLUE}Starting MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    mongod --dbpath ./data/db &
    sleep 5
fi

# Seed the database
echo -e "${BLUE}Seeding the database...${NC}"
cd ../backend
node scripts/seedDatabase.js

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}To start the application:${NC}"
echo "1. Start the backend server: cd backend && npm start"
echo "2. In a new terminal, start the frontend: cd frontend && npm start"
echo -e "${BLUE}The application will be available at:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000" 