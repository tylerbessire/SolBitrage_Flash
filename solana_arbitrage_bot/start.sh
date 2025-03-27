#!/bin/bash

# This script builds and starts the Solana Arbitrage Bot

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Solana Arbitrage Bot Startup Script ===${NC}"
echo -e "${YELLOW}Starting build and deployment process...${NC}"

# Create a .env file if it doesn't exist
if [ ! -f "./server/.env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cat > ./server/.env << EOL
PORT=5000
NODE_ENV=development
EOL
  echo -e "${GREEN}Created .env file${NC}"
fi

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd server
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install server dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}Server dependencies installed successfully${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to install frontend dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}Frontend dependencies installed successfully${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to build frontend${NC}"
  exit 1
fi
echo -e "${GREEN}Frontend built successfully${NC}"

# Start the server
echo -e "${YELLOW}Starting server...${NC}"
cd ../server
node server.js &
SERVER_PID=$!
echo -e "${GREEN}Server started with PID: ${SERVER_PID}${NC}"

# Wait for server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 5

echo -e "${GREEN}=== Solana Arbitrage Bot is now running ===${NC}"
echo -e "${YELLOW}Access the UI at: http://localhost:5000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the bot${NC}"

# Trap Ctrl+C and kill the server
trap "echo -e '${YELLOW}Stopping server...${NC}'; kill $SERVER_PID; echo -e '${GREEN}Server stopped${NC}'; exit 0" INT

# Keep script running
wait $SERVER_PID
