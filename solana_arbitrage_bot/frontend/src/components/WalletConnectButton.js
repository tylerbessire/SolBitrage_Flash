import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';

const WalletConnectButton = ({ onConnect, fullWidth = false }) => {
  // Mock wallet connection
  const handleConnect = () => {
    // Generate a mock Solana address
    const mockAddress = '5' + Array(43).fill(0).map(() => 
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');
    
    if (onConnect) {
      onConnect(mockAddress);
    }
  };
  
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<WalletIcon />}
      onClick={handleConnect}
      fullWidth={fullWidth}
      sx={{
        borderRadius: 2,
        py: 1,
        background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
        '&:hover': {
          background: 'linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)',
        },
      }}
    >
      <Typography variant="button" fontWeight="bold">
        Connect Wallet
      </Typography>
    </Button>
  );
};

export default WalletConnectButton;
