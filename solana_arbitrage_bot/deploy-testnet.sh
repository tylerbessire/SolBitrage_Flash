#!/bin/bash

# This script deploys the Solana Arbitrage Bot to testnet

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Solana Arbitrage Bot Testnet Deployment ===${NC}"

# Check if test environment is set up
if [ ! -f "./test-wallet.json" ]; then
    echo -e "${RED}Test wallet not found. Please run setup-test-env.sh first.${NC}"
    exit 1
fi

# Check if Solana CLI is configured for testnet
NETWORK=$(solana config get | grep "RPC URL" | grep -c "testnet")
if [ $NETWORK -eq 0 ]; then
    echo -e "${YELLOW}Configuring Solana CLI for testnet...${NC}"
    solana config set --url https://api.testnet.solana.com
    echo -e "${GREEN}Solana CLI configured for testnet${NC}"
fi

# Get wallet address
WALLET_ADDRESS=$(solana-keygen pubkey ./test-wallet.json)
echo -e "${GREEN}Using wallet address: ${WALLET_ADDRESS}${NC}"

# Check wallet balance
BALANCE=$(solana balance $WALLET_ADDRESS)
echo -e "${GREEN}Current balance: ${BALANCE} SOL${NC}"

if (( $(echo "$BALANCE < 0.5" | bc -l) )); then
    echo -e "${YELLOW}Balance is low. Requesting SOL airdrop...${NC}"
    solana airdrop 1 $WALLET_ADDRESS
    echo -e "${GREEN}Airdrop requested. New balance: $(solana balance $WALLET_ADDRESS) SOL${NC}"
fi

# Build the project for testnet
echo -e "${YELLOW}Building project for testnet deployment...${NC}"

# Create testnet configuration
echo -e "${YELLOW}Creating testnet configuration...${NC}"
mkdir -p ./config
cat > ./config/testnet-config.json << EOL
{
  "network": "testnet",
  "rpcUrl": "https://api.testnet.solana.com",
  "walletPath": "./test-wallet.json",
  "walletAddress": "${WALLET_ADDRESS}",
  "tokenPairs": [
    {
      "base": "SOL",
      "quote": "USDC",
      "active": true
    },
    {
      "base": "RAY",
      "quote": "USDC",
      "active": true
    }
  ],
  "settings": {
    "botName": "Solana Arbitrage Bot - Testnet",
    "autoStart": false,
    "notificationsEnabled": true,
    "minProfitPercentage": 0.5,
    "maxPositionSize": 100,
    "slippageTolerance": 0.5,
    "useFlashLoans": true,
    "maxConcurrentTrades": 2,
    "riskLevel": "moderate",
    "maxDailyLoss": 10,
    "useCircuitBreakers": true,
    "autoReinvest": true,
    "reinvestPercentage": 70,
    "gasMultiplier": 1.5,
    "rpcUrl": "https://api.testnet.solana.com",
    "updateIntervalMs": 1000
  }
}
EOL
echo -e "${GREEN}Testnet configuration created at ./config/testnet-config.json${NC}"

# Update server environment for testnet
echo -e "${YELLOW}Updating server environment for testnet...${NC}"
cat > ./server/.env << EOL
PORT=5000
NODE_ENV=testnet
CONFIG_PATH=../config/testnet-config.json
EOL
echo -e "${GREEN}Server environment updated for testnet${NC}"

# Run tests to verify testnet deployment
echo -e "${YELLOW}Running tests to verify testnet deployment...${NC}"
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Tests passed. Testnet deployment is ready.${NC}"
else
    echo -e "${RED}Tests failed. Please fix issues before proceeding.${NC}"
    exit 1
fi

echo -e "${GREEN}=== Solana Arbitrage Bot is deployed to testnet ===${NC}"
echo -e "${YELLOW}Start the bot with: npm run start:testnet${NC}"

# Add testnet start script to package.json if it doesn't exist
if ! grep -q "start:testnet" package.json; then
    echo -e "${YELLOW}Adding testnet start script to package.json...${NC}"
    sed -i 's/"scripts": {/"scripts": {\n    "start:testnet": "NODE_ENV=testnet bash .\/start.sh",/g' package.json
    echo -e "${GREEN}Testnet start script added to package.json${NC}"
fi

echo -e "${GREEN}Deployment complete!${NC}"
