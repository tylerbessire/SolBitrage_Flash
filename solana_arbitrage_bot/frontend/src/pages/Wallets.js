import React, { useState } from 'react';
import { Box, Button, Typography, Card, CardContent, CardHeader, Divider, 
         Grid, TextField, Alert, Paper, Chip, Stack, Switch, FormControlLabel,
         Tooltip, IconButton, useTheme } from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Mock wallet data
const mockWallets = [
  { id: 1, name: 'Main Trading Wallet', address: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CerVnZgX37D', balance: 1250.75, type: 'trading' },
  { id: 2, name: 'Operational Expenses', address: '6dNUBMFqbLnVCZNEUTKVMxXJxJdgbLPCEKHWiQrAMJ1P', balance: 325.50, type: 'operational' },
  { id: 3, name: 'Profit Storage', address: '7kLxEVAYrfBKqYD4xRYhQT1KJWjiYYzYu7Cv6JjX5Xs1', balance: 875.25, type: 'profit' },
];

const Wallets = ({ isConnected, addNotification }) => {
  const theme = useTheme();
  const [wallets, setWallets] = useState(mockWallets);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', address: '', type: 'trading' });
  const [showPrivateKey, setShowPrivateKey] = useState({});
  const [copied, setCopied] = useState(null);

  // Handle copy address to clipboard
  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
    addNotification('Address copied to clipboard', 'success');
  };

  // Handle add new wallet
  const handleAddWallet = () => {
    if (!newWallet.name || !newWallet.address) {
      addNotification('Please fill in all fields', 'error');
      return;
    }
    
    const newId = Math.max(...wallets.map(w => w.id)) + 1;
    const wallet = {
      ...newWallet,
      id: newId,
      balance: 0
    };
    
    setWallets([...wallets, wallet]);
    setNewWallet({ name: '', address: '', type: 'trading' });
    setShowAddWallet(false);
    addNotification('Wallet added successfully', 'success');
  };

  // Handle delete wallet
  const handleDeleteWallet = (id) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
    addNotification('Wallet removed', 'info');
  };

  // Toggle private key visibility
  const togglePrivateKeyVisibility = (id) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get wallet type label
  const getWalletTypeLabel = (type) => {
    switch (type) {
      case 'trading':
        return { label: 'Trading', color: theme.palette.primary.main };
      case 'operational':
        return { label: 'Operational', color: theme.palette.warning.main };
      case 'profit':
        return { label: 'Profit', color: theme.palette.success.main };
      default:
        return { label: 'Other', color: theme.palette.grey[500] };
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Wallet Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your wallets for trading, operations, and profit storage
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddWallet(true)}
              disabled={!isConnected}
            >
              Add Wallet
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your wallet to manage your wallets and view balances.
        </Alert>
      )}

      {/* Add Wallet Form */}
      {showAddWallet && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Add New Wallet" />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Name"
                  variant="outlined"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  variant="outlined"
                  value={newWallet.address}
                  onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newWallet.type === 'trading'}
                        onChange={() => setNewWallet({ ...newWallet, type: 'trading' })}
                        color="primary"
                      />
                    }
                    label="Trading"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newWallet.type === 'operational'}
                        onChange={() => setNewWallet({ ...newWallet, type: 'operational' })}
                        color="warning"
                      />
                    }
                    label="Operational"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newWallet.type === 'profit'}
                        onChange={() => setNewWallet({ ...newWallet, type: 'profit' })}
                        color="success"
                      />
                    }
                    label="Profit"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => setShowAddWallet(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleAddWallet}>
                  Add Wallet
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Wallets List */}
      <Grid container spacing={3}>
        {wallets.map((wallet) => {
          const typeInfo = getWalletTypeLabel(wallet.type);
          return (
            <Grid item xs={12} md={6} lg={4} key={wallet.id}>
              <Card sx={{ 
                height: '100%',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: `linear-gradient(90deg, ${typeInfo.color} 0%, ${typeInfo.color}80 100%)`,
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WalletIcon sx={{ color: typeInfo.color, mr: 1 }} />
                      <Typography variant="h6" fontWeight="medium">
                        {wallet.name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={typeInfo.label} 
                      size="small"
                      sx={{ 
                        bgcolor: `${typeInfo.color}20`,
                        color: typeInfo.color,
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {wallet.address}
                      </Typography>
                      <Tooltip title={copied === wallet.address ? "Copied!" : "Copy address"}>
                        <IconButton size="small" onClick={() => handleCopyAddress(wallet.address)}>
                          {copied === wallet.address ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Private Key
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.1)', p: 1, borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        {showPrivateKey[wallet.id] ? '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP8c7gV3yS' : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
                      </Typography>
                      <Tooltip title={showPrivateKey[wallet.id] ? "Hide private key" : "Show private key"}>
                        <IconButton size="small" onClick={() => togglePrivateKeyVisibility(wallet.id)}>
                          {showPrivateKey[wallet.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Balance
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {wallet.balance.toLocaleString()} SOL
                      </Typography>
                    </Box>
                    <Tooltip title="Remove wallet">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteWallet(wallet.id)}
                        sx={{ 
                          bgcolor: 'rgba(255,82,82,0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(255,82,82,0.2)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Wallets;
