#!/bin/bash

# This script runs a comprehensive test suite for the Solana Arbitrage Bot

# Set up colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Solana Arbitrage Bot Test Runner ===${NC}"

# Check if test environment is set up
if [ ! -d "./tests" ]; then
    echo -e "${RED}Test directory not found. Please ensure the project is set up correctly.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "./node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}Dependencies installed${NC}"
fi

# Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
npm run test:unit
UNIT_RESULT=$?

if [ $UNIT_RESULT -eq 0 ]; then
    echo -e "${GREEN}Unit tests passed successfully${NC}"
else
    echo -e "${RED}Unit tests failed${NC}"
    exit 1
fi

# Run integration tests
echo -e "${YELLOW}Running integration tests...${NC}"
npm run test:integration
INTEGRATION_RESULT=$?

if [ $INTEGRATION_RESULT -eq 0 ]; then
    echo -e "${GREEN}Integration tests passed successfully${NC}"
else
    echo -e "${RED}Integration tests failed${NC}"
    exit 1
fi

# Run performance tests if they exist
if [ -f "./tests/performance.test.js" ]; then
    echo -e "${YELLOW}Running performance tests...${NC}"
    mocha tests/performance.test.js
    PERFORMANCE_RESULT=$?
    
    if [ $PERFORMANCE_RESULT -eq 0 ]; then
        echo -e "${GREEN}Performance tests passed successfully${NC}"
    else
        echo -e "${RED}Performance tests failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}=== All tests passed successfully! ===${NC}"
echo -e "${YELLOW}The Solana Arbitrage Bot is ready for deployment.${NC}"
