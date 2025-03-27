const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const dotenv = require('dotenv');
const { spawn } = require('child_process');
const path = require('path');

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Bot state
let botState = {
  status: 'stopped', // 'running', 'stopped', 'paused'
  activeArbitrages: 0,
  totalExecuted: 0,
  successRate: 0,
  totalProfit: 0,
  todayProfit: 0,
  avgExecutionTime: 0,
  lastUpdated: new Date().toISOString()
};

// Mock data for demonstration
const mockTokenPairs = [
  { base: 'SOL', quote: 'USDC', active: true },
  { base: 'ETH', quote: 'USDC', active: true },
  { base: 'BTC', quote: 'USDC', active: false },
  { base: 'RAY', quote: 'USDC', active: false },
  { base: 'ORCA', quote: 'USDC', active: false },
];

const mockWallets = [
  { id: 1, name: 'Main Trading Wallet', address: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnZgX37D', balance: 1250.75, type: 'trading' },
  { id: 2, name: 'Operational Expenses', address: '6dNUBMFqbLnVCZNEUTKVMxXJxJdgbLPCEKHWiQrAMJ1P', balance: 325.50, type: 'operational' },
  { id: 3, name: 'Profit Storage', address: '7kLxEVAYrfBKqYD4xRYhQT1KJWjiYYzYu7Cv6JjX5Xs1', balance: 875.25, type: 'profit' },
];

// Mock settings
let botSettings = {
  // General settings
  botName: 'Solana Arbitrage Bot',
  autoStart: false,
  notificationsEnabled: true,
  
  // Trading settings
  minProfitPercentage: 0.5,
  maxPositionSize: 1000,
  slippageTolerance: 0.5,
  useFlashLoans: true,
  maxConcurrentTrades: 5,
  
  // Risk management
  riskLevel: 'moderate',
  maxDailyLoss: 10,
  useCircuitBreakers: true,
  
  // Wallet settings
  autoReinvest: true,
  reinvestPercentage: 70,
  
  // Advanced settings
  gasMultiplier: 1.5,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  updateIntervalMs: 1000,
};

// Mock transaction history
const generateMockTransactions = (count) => {
  const types = ['arbitrage', 'flash_loan', 'profit_distribution', 'system'];
  const statuses = ['success', 'failed', 'pending'];
  const tokenPairs = ['SOL/USDC', 'ETH/USDC', 'BTC/USDC', 'RAY/USDC', 'ORCA/USDC'];
  const transactions = [];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tokenPair = tokenPairs[Math.floor(Math.random() * tokenPairs.length)];
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - (i * 30));
    
    let profit = null;
    let amount = null;
    let fee = null;
    let error = null;
    
    if (type === 'arbitrage' && status === 'success') {
      profit = Math.random() * 50 + 5; // Random profit between 5 and 55
    } else if (type === 'flash_loan') {
      amount = Math.random() * 5000 + 500; // Random amount between 500 and 5500
      fee = amount * 0.003; // 0.3% fee
    } else if (status === 'failed') {
      error = 'Transaction failed due to slippage';
    }
    
    transactions.push({
      id: `tx-${i}`,
      type,
      status,
      tokenPair,
      timestamp: date.toISOString(),
      profit,
      amount,
      fee,
      error,
      hash: `${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 10)}`,
    });
  }
  
  return transactions;
};

const mockTransactions = generateMockTransactions(50);

// Generate mock price data
const generateMockPriceData = () => {
  const data = [];
  const now = new Date();
  for (let i = 60; i >= 0; i--) {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - i);
    data.push({
      x: date.getTime(),
      y: 22 + Math.random() * 2, // Random price between 22 and 24
    });
  }
  return data;
};

// Generate mock profit data
const generateMockProfitData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      x: date.getTime(),
      y: Math.floor(Math.random() * 50) + 10, // Random daily profit between 10 and 60
    });
  }
  return data;
};

// Mock DEX prices
const mockDexPrices = {
  'SOL/USDC': {
    Jupiter: 23.47,
    Raydium: 23.42,
    Orca: 23.45
  },
  'ETH/USDC': {
    Jupiter: 3245.12,
    Raydium: 3243.87,
    Orca: 3244.65
  },
  'BTC/USDC': {
    Jupiter: 63245.78,
    Raydium: 63240.15,
    Orca: 63242.33
  }
};

// API Routes
app.get('/api/status', (req, res) => {
  res.json(botState);
});

app.post('/api/bot/start', (req, res) => {
  // In a real implementation, this would start the Rust bot process
  botState.status = 'running';
  botState.lastUpdated = new Date().toISOString();
  
  // Notify all connected clients
  io.emit('bot_status_change', botState);
  
  res.json({ success: true, message: 'Bot started successfully', status: botState.status });
});

app.post('/api/bot/stop', (req, res) => {
  // In a real implementation, this would stop the Rust bot process
  botState.status = 'stopped';
  botState.lastUpdated = new Date().toISOString();
  
  // Notify all connected clients
  io.emit('bot_status_change', botState);
  
  res.json({ success: true, message: 'Bot stopped successfully', status: botState.status });
});

app.get('/api/token-pairs', (req, res) => {
  res.json(mockTokenPairs);
});

app.post('/api/token-pairs/:index/toggle', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < mockTokenPairs.length) {
    mockTokenPairs[index].active = !mockTokenPairs[index].active;
    res.json({ success: true, tokenPair: mockTokenPairs[index] });
  } else {
    res.status(404).json({ success: false, message: 'Token pair not found' });
  }
});

app.get('/api/wallets', (req, res) => {
  res.json(mockWallets);
});

app.post('/api/wallets', (req, res) => {
  const { name, address, type } = req.body;
  const newId = Math.max(...mockWallets.map(w => w.id)) + 1;
  const newWallet = {
    id: newId,
    name,
    address,
    balance: 0,
    type
  };
  mockWallets.push(newWallet);
  res.json({ success: true, wallet: newWallet });
});

app.delete('/api/wallets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockWallets.findIndex(w => w.id === id);
  if (index !== -1) {
    mockWallets.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Wallet not found' });
  }
});

app.get('/api/transactions', (req, res) => {
  res.json(mockTransactions);
});

app.get('/api/prices/:pair', (req, res) => {
  const pair = req.params.pair;
  if (mockDexPrices[pair]) {
    res.json({
      pair,
      prices: mockDexPrices[pair],
      priceHistory: generateMockPriceData()
    });
  } else {
    res.status(404).json({ success: false, message: 'Price data not found for pair' });
  }
});

app.get('/api/profit-history', (req, res) => {
  res.json(generateMockProfitData());
});

app.get('/api/settings', (req, res) => {
  res.json(botSettings);
});

app.post('/api/settings', (req, res) => {
  botSettings = { ...botSettings, ...req.body };
  res.json({ success: true, settings: botSettings });
});

// Catch-all handler for React router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Send initial state to the client
  socket.emit('bot_status', botState);
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Simulate bot activity for demonstration
const simulateBotActivity = () => {
  if (botState.status === 'running') {
    // Randomly update bot state
    botState.activeArbitrages = Math.floor(Math.random() * 5);
    botState.totalExecuted += Math.floor(Math.random() * 3);
    botState.successRate = 70 + Math.random() * 20;
    botState.totalProfit += Math.random() * 10;
    botState.todayProfit = Math.random() * 50 + 50;
    botState.avgExecutionTime = 2 + Math.random();
    botState.lastUpdated = new Date().toISOString();
    
    // Emit updated state to all clients
    io.emit('bot_status_update', botState);
    
    // Occasionally emit a new transaction
    if (Math.random() > 0.7) {
      const newTx = generateMockTransactions(1)[0];
      mockTransactions.unshift(newTx);
      io.emit('new_transaction', newTx);
    }
  }
};

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Start simulation interval
  setInterval(simulateBotActivity, 5000);
});

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;
