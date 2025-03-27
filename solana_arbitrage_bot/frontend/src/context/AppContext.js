// This file provides a context provider for managing global application state
// It integrates with the API client to provide data and functionality to all components

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initializeSocket, 
  disconnectSocket,
  botApi, 
  tokenPairsApi, 
  walletsApi, 
  transactionsApi, 
  pricesApi, 
  settingsApi 
} from '../api';
import { useSnackbar } from 'notistack';

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [botStatus, setBotStatus] = useState({
    status: 'stopped',
    activeArbitrages: 0,
    totalExecuted: 0,
    successRate: 0,
    totalProfit: 0,
    todayProfit: 0,
    avgExecutionTime: 0,
    lastUpdated: new Date().toISOString()
  });
  const [tokenPairs, setTokenPairs] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [profitHistory, setProfitHistory] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Initialize socket connection
  useEffect(() => {
    const socket = initializeSocket({
      onConnect: () => {
        console.log('Socket connected');
      },
      onDisconnect: () => {
        console.log('Socket disconnected');
      },
      onBotStatusUpdate: (data) => {
        setBotStatus(data);
      },
      onBotStatusChange: (data) => {
        setBotStatus(data);
        addNotification(`Bot ${data.status}`, data.status === 'running' ? 'success' : 'info');
      },
      onNewTransaction: (data) => {
        setTransactions(prev => [data, ...prev]);
        
        if (data.type === 'arbitrage' && data.status === 'success') {
          addNotification(`Arbitrage executed: $${data.profit.toFixed(2)} profit`, 'success');
        } else if (data.type === 'flash_loan') {
          addNotification(`Flash loan executed: $${data.amount.toFixed(2)}`, 'info');
        }
      }
    });
    
    // Fetch initial data
    fetchInitialData();
    
    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);
  
  // Fetch initial data from API
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch bot status
      const status = await botApi.getStatus();
      setBotStatus(status);
      
      // Fetch token pairs
      const pairs = await tokenPairsApi.getTokenPairs();
      setTokenPairs(pairs);
      
      // Fetch wallets
      const walletsList = await walletsApi.getWallets();
      setWallets(walletsList);
      
      // Fetch transactions
      const txList = await transactionsApi.getTransactions();
      setTransactions(txList);
      
      // Fetch profit history
      const profits = await pricesApi.getProfitHistory();
      setProfitHistory(profits);
      
      // Fetch settings
      const settingsData = await settingsApi.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      addNotification('Error fetching data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Connect wallet
  const connectWallet = (address) => {
    setIsConnected(true);
    setWalletAddress(address);
    addNotification('Wallet connected successfully', 'success');
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    addNotification('Wallet disconnected', 'info');
  };
  
  // Start bot
  const startBot = async () => {
    setIsLoading(true);
    try {
      const response = await botApi.startBot();
      setBotStatus(prev => ({ ...prev, status: 'running' }));
      addNotification('Bot started successfully', 'success');
    } catch (error) {
      console.error('Error starting bot:', error);
      addNotification('Error starting bot', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stop bot
  const stopBot = async () => {
    setIsLoading(true);
    try {
      const response = await botApi.stopBot();
      setBotStatus(prev => ({ ...prev, status: 'stopped' }));
      addNotification('Bot stopped', 'info');
    } catch (error) {
      console.error('Error stopping bot:', error);
      addNotification('Error stopping bot', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle token pair
  const toggleTokenPair = async (index) => {
    try {
      const response = await tokenPairsApi.toggleTokenPair(index);
      setTokenPairs(prev => {
        const updated = [...prev];
        updated[index].active = !updated[index].active;
        return updated;
      });
      addNotification(`${tokenPairs[index].base}/${tokenPairs[index].quote} ${tokenPairs[index].active ? 'deactivated' : 'activated'}`, 'success');
    } catch (error) {
      console.error('Error toggling token pair:', error);
      addNotification('Error toggling token pair', 'error');
    }
  };
  
  // Add wallet
  const addWallet = async (wallet) => {
    try {
      const response = await walletsApi.addWallet(wallet);
      setWallets(prev => [...prev, response.wallet]);
      addNotification('Wallet added successfully', 'success');
      return response.wallet;
    } catch (error) {
      console.error('Error adding wallet:', error);
      addNotification('Error adding wallet', 'error');
      throw error;
    }
  };
  
  // Delete wallet
  const deleteWallet = async (id) => {
    try {
      await walletsApi.deleteWallet(id);
      setWallets(prev => prev.filter(wallet => wallet.id !== id));
      addNotification('Wallet removed', 'info');
    } catch (error) {
      console.error('Error deleting wallet:', error);
      addNotification('Error removing wallet', 'error');
    }
  };
  
  // Save settings
  const saveSettings = async (updatedSettings) => {
    try {
      const response = await settingsApi.updateSettings(updatedSettings);
      setSettings(response.settings);
      addNotification('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification('Error saving settings', 'error');
    }
  };
  
  // Add notification
  const addNotification = (message, severity = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      severity,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
    
    // Also show snackbar
    enqueueSnackbar(message, { variant: severity });
  };
  
  // Clear notification count
  const clearNotificationCount = () => {
    setNotificationCount(0);
  };
  
  // Context value
  const contextValue = {
    isConnected,
    walletAddress,
    botStatus,
    tokenPairs,
    wallets,
    transactions,
    profitHistory,
    settings,
    isLoading,
    notifications,
    notificationCount,
    connectWallet,
    disconnectWallet,
    startBot,
    stopBot,
    toggleTokenPair,
    addWallet,
    deleteWallet,
    saveSettings,
    addNotification,
    clearNotificationCount,
    refreshData: fetchInitialData
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
