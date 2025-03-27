#!/bin/bash

# This script packages the Solana Arbitrage Bot for delivery

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Packaging Solana Arbitrage Bot ===${NC}"

# Create package directory
PACKAGE_DIR="solana_arbitrage_bot_package"
mkdir -p $PACKAGE_DIR

# Copy source code
echo -e "${YELLOW}Copying source code...${NC}"
cp -r src $PACKAGE_DIR/
cp -r frontend $PACKAGE_DIR/
cp -r server $PACKAGE_DIR/
cp -r tests $PACKAGE_DIR/
cp -r docs $PACKAGE_DIR/
cp -r config $PACKAGE_DIR/

# Copy scripts
echo -e "${YELLOW}Copying scripts...${NC}"
cp start.sh $PACKAGE_DIR/
cp setup-test-env.sh $PACKAGE_DIR/
cp deploy-testnet.sh $PACKAGE_DIR/
cp run-tests.sh $PACKAGE_DIR/

# Copy documentation
echo -e "${YELLOW}Copying documentation...${NC}"
cp README.md $PACKAGE_DIR/
cp todo.md $PACKAGE_DIR/
cp package.json $PACKAGE_DIR/

# Create example configuration
echo -e "${YELLOW}Creating example configuration...${NC}"
mkdir -p $PACKAGE_DIR/config
cat > $PACKAGE_DIR/config/example-config.json << EOL
{
  "network": "mainnet",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "walletPath": "./wallet.json",
  "tokenPairs": [
    {
      "base": "SOL",
      "quote": "USDC",
      "active": true
    },
    {
      "base": "ETH",
      "quote": "USDC",
      "active": true
    },
    {
      "base": "BTC",
      "quote": "USDC",
      "active": false
    },
    {
      "base": "RAY",
      "quote": "USDC",
      "active": false
    },
    {
      "base": "ORCA",
      "quote": "USDC",
      "active": false
    }
  ],
  "settings": {
    "botName": "Solana Arbitrage Bot",
    "autoStart": false,
    "notificationsEnabled": true,
    "minProfitPercentage": 0.5,
    "maxPositionSize": 1000,
    "slippageTolerance": 0.5,
    "useFlashLoans": true,
    "maxConcurrentTrades": 5,
    "riskLevel": "moderate",
    "maxDailyLoss": 10,
    "useCircuitBreakers": true,
    "autoReinvest": true,
    "reinvestPercentage": 70,
    "gasMultiplier": 1.5,
    "rpcUrl": "https://api.mainnet-beta.solana.com",
    "updateIntervalMs": 1000
  }
}
EOL
echo -e "${GREEN}Example configuration created${NC}"

# Create example mainnet configuration
cat > $PACKAGE_DIR/config/example-mainnet-config.json << EOL
{
  "network": "mainnet",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "walletPath": "./mainnet-wallet.json",
  "tokenPairs": [
    {
      "base": "SOL",
      "quote": "USDC",
      "active": true
    },
    {
      "base": "ETH",
      "quote": "USDC",
      "active": true
    },
    {
      "base": "BTC",
      "quote": "USDC",
      "active": true
    }
  ],
  "settings": {
    "botName": "Solana Arbitrage Bot - Mainnet",
    "autoStart": false,
    "notificationsEnabled": true,
    "minProfitPercentage": 0.8,
    "maxPositionSize": 500,
    "slippageTolerance": 0.3,
    "useFlashLoans": true,
    "maxConcurrentTrades": 3,
    "riskLevel": "conservative",
    "maxDailyLoss": 5,
    "useCircuitBreakers": true,
    "autoReinvest": true,
    "reinvestPercentage": 70,
    "gasMultiplier": 1.2,
    "rpcUrl": "https://api.mainnet-beta.solana.com",
    "updateIntervalMs": 1000
  }
}
EOL
echo -e "${GREEN}Example mainnet configuration created${NC}"

# Create directory for logs
mkdir -p $PACKAGE_DIR/logs
touch $PACKAGE_DIR/logs/.gitkeep

# Create directory for wallet files
mkdir -p $PACKAGE_DIR/wallets
touch $PACKAGE_DIR/wallets/.gitkeep

# Add mainnet start script to package.json
echo -e "${YELLOW}Adding mainnet start script to package.json...${NC}"
cp package.json $PACKAGE_DIR/package.json
sed -i 's/"scripts": {/"scripts": {\n    "start:mainnet": "NODE_ENV=mainnet bash .\/start.sh",/g' $PACKAGE_DIR/package.json

# Create .gitignore file
cat > $PACKAGE_DIR/.gitignore << EOL
# Node modules
node_modules/

# Build files
frontend/build/
dist/

# Wallet files
*.json
!package.json
!package-lock.json
!config/example-*.json

# Logs
logs/*
!logs/.gitkeep

# Environment variables
.env
.env.*

# OS files
.DS_Store
Thumbs.db
EOL

# Create ZIP archive
echo -e "${YELLOW}Creating ZIP archive...${NC}"
zip -r solana_arbitrage_bot.zip $PACKAGE_DIR

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
rm -rf $PACKAGE_DIR

echo -e "${GREEN}=== Packaging complete! ===${NC}"
echo -e "${YELLOW}Package created: solana_arbitrage_bot.zip${NC}"
echo -e "${YELLOW}You can now distribute this package to users.${NC}"
