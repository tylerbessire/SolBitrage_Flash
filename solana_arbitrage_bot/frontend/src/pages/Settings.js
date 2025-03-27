import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Divider, Grid, 
         Paper, TextField, MenuItem, Switch, FormControlLabel, Button,
         Accordion, AccordionSummary, AccordionDetails, Alert, useTheme } from '@mui/material';
import { 
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const Settings = ({ addNotification }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
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
  });
  
  // Handle settings change
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    // This would call an API to save settings
    console.log('Saving settings:', settings);
    addNotification('Settings saved successfully', 'success');
  };
  
  // Reset settings to defaults
  const handleResetSettings = () => {
    // This would reset settings to defaults
    addNotification('Settings reset to defaults', 'info');
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
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your arbitrage bot parameters and preferences
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetSettings}
            >
              Reset Defaults
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Settings Sections */}
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                background: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(30,30,30,0) 100%)',
              }}
            >
              <Typography variant="h6" fontWeight="medium">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bot Name"
                    value={settings.botName}
                    onChange={(e) => handleSettingChange('botName', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoStart}
                          onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Auto-start bot on system startup"
                    />
                  </Box>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notificationsEnabled}
                          onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enable notifications"
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Trading Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                background: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(30,30,30,0) 100%)',
              }}
            >
              <Typography variant="h6" fontWeight="medium">Trading Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minimum Profit Percentage"
                    type="number"
                    value={settings.minProfitPercentage}
                    onChange={(e) => handleSettingChange('minProfitPercentage', parseFloat(e.target.value))}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      endAdornment: '%',
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Maximum Position Size"
                    type="number"
                    value={settings.maxPositionSize}
                    onChange={(e) => handleSettingChange('maxPositionSize', parseInt(e.target.value))}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: '$',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Slippage Tolerance"
                    type="number"
                    value={settings.slippageTolerance}
                    onChange={(e) => handleSettingChange('slippageTolerance', parseFloat(e.target.value))}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      endAdornment: '%',
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Maximum Concurrent Trades"
                    type="number"
                    value={settings.maxConcurrentTrades}
                    onChange={(e) => handleSettingChange('maxConcurrentTrades', parseInt(e.target.value))}
                    variant="outlined"
                    margin="normal"
                  />
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.useFlashLoans}
                          onChange={(e) => handleSettingChange('useFlashLoans', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Use Flash Loans"
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Risk Management */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                background: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(30,30,30,0) 100%)',
              }}
            >
              <Typography variant="h6" fontWeight="medium">Risk Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Risk Level"
                    value={settings.riskLevel}
                    onChange={(e) => handleSettingChange('riskLevel', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  >
                    <MenuItem value="conservative">Conservative</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="aggressive">Aggressive</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </TextField>
                  <TextField
                    fullWidth
                    label="Maximum Daily Loss"
                    type="number"
                    value={settings.maxDailyLoss}
                    onChange={(e) => handleSettingChange('maxDailyLoss', parseFloat(e.target.value))}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      endAdornment: '%',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.useCircuitBreakers}
                          onChange={(e) => handleSettingChange('useCircuitBreakers', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Use Circuit Breakers"
                    />
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Circuit breakers automatically stop trading when losses exceed the maximum daily loss threshold.
                  </Alert>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Profit Management */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                background: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(30,30,30,0) 100%)',
              }}
            >
              <Typography variant="h6" fontWeight="medium">Profit Management</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoReinvest}
                          onChange={(e) => handleSettingChange('autoReinvest', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Automatically reinvest profits"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reinvestment Percentage"
                    type="number"
                    value={settings.reinvestPercentage}
                    onChange={(e) => handleSettingChange('reinvestPercentage', parseInt(e.target.value))}
                    variant="outlined"
                    margin="normal"
                    disabled={!settings.autoReinvest}
                    InputProps={{
                      endAdornment: '%',
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Advanced Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                background: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(30,30,30,0) 100%)',
              }}
            >
              <Typography variant="h6" fontWeight="medium">Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Gas Price Multiplier"
                    type="number"
                    value={settings.gasMultiplier}
                    onChange={(e) => handleSettingChange('gasMultiplier', parseFloat(e.target.value))}
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="RPC URL"
                    value={settings.rpcUrl}
                    onChange={(e) => handleSettingChange('rpcUrl', e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Update Interval (ms)"
                    type="number"
                    value={settings.updateIntervalMs}
                    onChange={(e) => handleSettingChange('updateIntervalMs', parseInt(e.target.value))}
                    variant="outlined"
                    margin="normal"
                  />
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Changing advanced settings may affect bot performance. Proceed with caution.
                  </Alert>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
