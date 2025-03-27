#!/bin/bash

# Deployment script for Solana Arbitrage Bot Website

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying Solana Arbitrage Bot Website ===${NC}"

# Create deployment directory
DEPLOY_DIR="/home/ubuntu/test_run/solana_arbitrage_bot_package/deployment"
cd $DEPLOY_DIR

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Installing Docker...${NC}"
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Build and start the containers
echo -e "${YELLOW}Building and starting containers...${NC}"
cd ..
docker-compose -f deployment/docker-compose.yml up -d --build

# Check if containers are running
echo -e "${YELLOW}Checking container status...${NC}"
docker-compose -f deployment/docker-compose.yml ps

# Get the public IP address
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${YELLOW}Your Solana Arbitrage Bot Website is now running at: http://$PUBLIC_IP${NC}"
echo -e "${YELLOW}Backend API is available at: http://$PUBLIC_IP:3001${NC}"
