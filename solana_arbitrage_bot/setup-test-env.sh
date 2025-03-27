#!/bin/bash

# This script sets up the testing environment for the Solana Arbitrage Bot

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Solana Arbitrage Bot Testing Setup ===${NC}"

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${YELLOW}Solana CLI not found. Installing...${NC}"
    sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    echo -e "${GREEN}Solana CLI installed successfully${NC}"
else
    echo -e "${GREEN}Solana CLI already installed${NC}"
fi

# Configure Solana CLI for testnet
echo -e "${YELLOW}Configuring Solana CLI for testnet...${NC}"
solana config set --url https://api.testnet.solana.com
echo -e "${GREEN}Solana CLI configured for testnet${NC}"

# Create test wallet if it doesn't exist
if [ ! -f "./test-wallet.json" ]; then
    echo -e "${YELLOW}Creating test wallet...${NC}"
    solana-keygen new --no-passphrase -o ./test-wallet.json
    echo -e "${GREEN}Test wallet created at ./test-wallet.json${NC}"
else
    echo -e "${GREEN}Test wallet already exists at ./test-wallet.json${NC}"
fi

# Get wallet address
WALLET_ADDRESS=$(solana-keygen pubkey ./test-wallet.json)
echo -e "${GREEN}Test wallet address: ${WALLET_ADDRESS}${NC}"

# Request airdrop of SOL for testing
echo -e "${YELLOW}Requesting SOL airdrop for testing...${NC}"
solana airdrop 2 $WALLET_ADDRESS --url https://api.testnet.solana.com
echo -e "${GREEN}Airdrop requested. Check balance with: solana balance ${WALLET_ADDRESS} --url https://api.testnet.solana.com${NC}"

# Create test configuration
echo -e "${YELLOW}Creating test configuration...${NC}"
mkdir -p ./tests/config
cat > ./tests/config/test-config.json << EOL
{
  "network": "testnet",
  "rpcUrl": "https://api.testnet.solana.com",
  "walletPath": "./test-wallet.json",
  "walletAddress": "${WALLET_ADDRESS}",
  "testTokenPairs": [
    {
      "base": "SOL",
      "quote": "USDC"
    },
    {
      "base": "RAY",
      "quote": "USDC"
    }
  ],
  "testSettings": {
    "minProfitPercentage": 0.1,
    "maxPositionSize": 100,
    "slippageTolerance": 1.0,
    "useFlashLoans": true,
    "maxConcurrentTrades": 2
  }
}
EOL
echo -e "${GREEN}Test configuration created at ./tests/config/test-config.json${NC}"

echo -e "${GREEN}=== Testing environment setup complete ===${NC}"
echo -e "${YELLOW}Run tests with: npm test${NC}"
