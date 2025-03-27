import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Divider, Grid, 
         Paper, Tabs, Tab, Button, TextField, MenuItem, InputAdornment,
         Slider, Switch, FormControlLabel, Alert, useTheme } from '@mui/material';
import { 
  PlayArrow as StartIcon, 
  Stop as StopIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  CompareArrows as ArbitrageIcon
} from '@mui/icons-material';

// Import components
import ProfitChart from '../components/ProfitChart';

// Mock data for demonstration
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

const mockTokenPairs = [
  { base: 'SOL', quote: 'USDC', active: true },
  { base: 'ETH', quote: 'USDC', active: true },
  { base: 'BTC', quote: 'USDC', active: false },
  { base: 'RAY', quote: 'USDC', active: false },
  { base: 'ORCA', quote: 'USDC', active: false },
];

const mockDexes = [
  { name: 'Jupiter', active: true },
  { name: 'Raydium', active: true },
  { name: 'Orca', active: true },
];

const Trading = ({ isConnected, addNotification }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPair, setSelectedPair] = useState('SOL/USDC');
  const [priceData, setPriceData] = useState(generateMockPriceData());
  const [isTrading, setIsTrading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    minProfitPercentage: 0.5,
    maxPositionSize: 1000,
    slippageTolerance: 0.5,
    useFlashLoans: true,
    riskLevel: 'moderate',
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle start/stop trading
  const handleToggleTrading = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsTrading(!isTrading);
      setIsLoading(false);
      addNotification(`Trading ${!isTrading ? 'started' : 'stopped'} for ${selectedPair}`, !isTrading ? 'success' : 'info');
    }, 1500);
  };

  // Handle settings change
  const handleSettingsChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  // Handle pair selection
  const handlePairChange = (event) => {
    setSelectedPair(event.target.value);
    // Simulate new price data
    setPriceData(generateMockPriceData());
  };

  // Refresh price data
  const handleRefreshPrices = () => {
    setPriceData(generateMockPriceData());
    addNotification('Price data refreshed', 'info');
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
              Trading Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor prices and execute arbitrage trades
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <TextField
              select
              label="Token Pair"
              value={selectedPair}
              onChange={handlePairChange}
              variant="outlined"
              size="small"
              sx={{ width: 150, mr: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="SOL/USDC">SOL/USDC</MenuItem>
              <MenuItem value="ETH/USDC">ETH/USDC</MenuItem>
              <MenuItem value="BTC/USDC">BTC/USDC</MenuItem>
              <MenuItem value="RAY/USDC">RAY/USDC</MenuItem>
              <MenuItem value="ORCA/USDC">ORCA/USDC</MenuItem>
            </TextField>
            
            {isConnected ? (
              <Button
                variant={isTrading ? "contained" : "outlined"}
                color={isTrading ? "error" : "primary"}
                startIcon={isTrading ? <StopIcon /> : <StartIcon />}
                onClick={handleToggleTrading}
                disabled={isLoading}
              >
                {isTrading ? "Stop Trading" : "Start Trading"}
              </Button>
            ) : (
              <Button
                variant="outlined"
                disabled
              >
                Connect Wallet to Trade
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please connect your wallet to start trading.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Tab icon={<TrendingUpIcon />} label="Price Monitor" iconPosition="start" />
          <Tab icon={<ArbitrageIcon />} label="Arbitrage" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mb: 3 }}>
        {/* Price Monitor Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardHeader 
                  title={`${selectedPair} Price Chart`}
                  action={
                    <Button 
                      size="small" 
                      onClick={handleRefreshPrices}
                    >
                      Refresh
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <ProfitChart data={priceData} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 3 }}>
                <CardHeader title="Market Overview" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Price
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      $23.45
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      24h Change
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight="medium">
                      +2.34%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      24h Volume
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      $1,234,567
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Liquidity
                    </Typography>
                    <Typography variant="h6" fontWeight="medium">
                      $5,678,901
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader title="DEX Prices" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Jupiter:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight="medium">
                          $23.47
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Raydium:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight="medium">
                          $23.42
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Orca:
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight="medium">
                          $23.45
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Best Arbitrage Opportunity
                    </Typography>
                    <Typography variant="body1" color="success.main" fontWeight="medium">
                      Buy on Raydium, Sell on Jupiter: 0.21% profit
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Arbitrage Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardHeader title="Arbitrage Opportunities" />
                <Divider />
                <CardContent>
                  <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      {isTrading 
                        ? "Actively monitoring for arbitrage opportunities..." 
                        : "Start trading to monitor arbitrage opportunities"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardHeader title="Trading Status" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Status
                    </Typography>
                    <Typography variant="h6" color={isTrading ? "success.main" : "text.secondary"} fontWeight="medium">
                      {isTrading ? "Trading Active" : "Trading Inactive"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Active Token Pairs
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mockTokenPairs
                        .filter(pair => pair.active)
                        .map(pair => (
                          <Typography key={`${pair.base}-${pair.quote}`} variant="body2" fontWeight="medium">
                            {pair.base}/{pair.quote}
                          </Typography>
                        ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Active DEXs
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mockDexes
                        .filter(dex => dex.active)
                        .map(dex => (
                          <Typography key={dex.name} variant="body2" fontWeight="medium">
                            {dex.name}
                          </Typography>
                        ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Settings Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Trading Parameters" />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Minimum Profit Percentage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Slider
                        value={settings.minProfitPercentage}
                        onChange={(e, value) => handleSettingsChange('minProfitPercentage', value)}
                        min={0.1}
                        max={2}
                        step={0.1}
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `${value}%`}
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {settings.minProfitPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Maximum Position Size
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Slider
                        value={settings.maxPositionSize}
                        onChange={(e, value) => handleSettingsChange('maxPositionSize', value)}
                        min={100}
                        max={10000}
                        step={100}
                        valueLabelDisplay="auto"
                        valueLabelFormat={value => `$${value}`}
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        ${settings.maxPositionSize}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Slippage Tolerance
                    </Typography>
      <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>