// This file serves as the integration layer between the React frontend and Rust backend
// It provides API client functions for the frontend to communicate with the server

import axios from 'axios';
import io from 'socket.io-client';

// Base URL for API requests
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Socket.io connection
let socket = null;

// Initialize socket connection
const initializeSocket = (callbacks = {}) => {
  if (!socket) {
    socket = io(API_BASE_URL);
    
    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      if (callbacks.onConnect) callbacks.onConnect();
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (callbacks.onDisconnect) callbacks.onDisconnect();
    });
    
    socket.on('bot_status_update', (data) => {
      console.log('Bot status update:', data);
      if (callbacks.onBotStatusUpdate) callbacks.onBotStatusUpdate(data);
    });
    
    socket.on('bot_status_change', (data) => {
      console.log('Bot status change:', data);
      if (callbacks.onBotStatusChange) callbacks.onBotStatusChange(data);
    });
    
    socket.on('new_transaction', (data) => {
      console.log('New transaction:', data);
      if (callbacks.onNewTransaction) callbacks.onNewTransaction(data);
    });
  }
  
  return socket;
};

// Disconnect socket
const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Bot control API
const botApi = {
  getStatus: async () => {
    try {
      const response = await api.get('/api/status');
      return response.data;
    } catch (error) {
      console.error('Error getting bot status:', error);
      throw error;
    }
  },
  
  startBot: async () => {
    try {
      const response = await api.post('/api/bot/start');
      return response.data;
    } catch (error) {
      console.error('Error starting bot:', error);
      throw error;
    }
  },
  
  stopBot: async () => {
    try {
      const response = await api.post('/api/bot/stop');
      return response.data;
    } catch (error) {
      console.error('Error stopping bot:', error);
      throw error;
    }
  }
};

// Token pairs API
const tokenPairsApi = {
  getTokenPairs: async () => {
    try {
      const response = await api.get('/api/token-pairs');
      return response.data;
    } catch (error) {
      console.error('Error getting token pairs:', error);
      throw error;
    }
  },
  
  toggleTokenPair: async (index) => {
    try {
      const response = await api.post(`/api/token-pairs/${index}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling token pair:', error);
      throw error;
    }
  }
};

// Wallets API
const walletsApi = {
  getWallets: async () => {
    try {
      const response = await api.get('/api/wallets');
      return response.data;
    } catch (error) {
      console.error('Error getting wallets:', error);
      throw error;
    }
  },
  
  addWallet: async (wallet) => {
    try {
      const response = await api.post('/api/wallets', wallet);
      return response.data;
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
    }
  },
  
  deleteWallet: async (id) => {
    try {
      const response = await api.delete(`/api/wallets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }
};

// Transactions API
const transactionsApi = {
  getTransactions: async () => {
    try {
      const response = await api.get('/api/transactions');
      return response.data;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }
};

// Prices API
const pricesApi = {
  getPrices: async (pair) => {
    try {
      const response = await api.get(`/api/prices/${pair}`);
      return response.data;
    } catch (error) {
      console.error('Error getting prices:', error);
      throw error;
    }
  },
  
  getProfitHistory: async () => {
    try {
      const response = await api.get('/api/profit-history');
      return response.data;
    } catch (error) {
      console.error('Error getting profit history:', error);
      throw error;
    }
  }
};

// Settings API
const settingsApi = {
  getSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },
  
  updateSettings: async (settings) => {
    try {
      const response = await api.post('/api/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
};

// Export all APIs
export {
  initializeSocket,
  disconnectSocket,
  botApi,
  tokenPairsApi,
  walletsApi,
  transactionsApi,
  pricesApi,
  settingsApi
};
