import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider, 
         IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, 
         Avatar, Chip, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  ShowChart as ChartIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

// Import pages
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Trading from './pages/Trading';
import History from './pages/History';
import Settings from './pages/Settings';

// Import components
import WalletConnectButton from './components/WalletConnectButton';
import NotificationCenter from './components/NotificationCenter';

// Import context
import { useAppContext } from './context/AppContext';

const drawerWidth = 260;

function App() {
  const [open, setOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data and functions from context
  const { 
    isConnected, 
    walletAddress, 
    notifications, 
    notificationCount, 
    clearNotificationCount,
    connectWallet,
    disconnectWallet,
    isLoading
  } = useAppContext();
  
  // Set drawer open state based on screen size
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Wallets', icon: <WalletIcon />, path: '/wallets' },
    { text: 'Trading', icon: <ChartIcon />, path: '/trading' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  // Drawer content
  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: [1],
        background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src="/logo.png" 
            alt="Logo"
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            Solana Arbitrage
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav">
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(58, 123, 213, 0.1)',
                  borderRight: '3px solid #3a7bd5',
                  '&:hover': {
                    backgroundColor: 'rgba(58, 123, 213, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ p: 2 }}>
        {isConnected ? (
          <Chip
            avatar={<Avatar sx={{ bgcolor: theme.palette.success.main }}>W</Avatar>}
            label={`${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`}
            variant="outlined"
            onDelete={disconnectWallet}
            deleteIcon={<WalletIcon />}
            sx={{ width: '100%', justifyContent: 'space-between' }}
          />
        ) : (
          <WalletConnectButton onConnect={connectWallet} fullWidth />
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          background: 'rgba(30, 30, 30, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: open ? 'none' : 'flex' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {navItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          {isLoading && (
            <CircularProgress size={24} sx={{ mr: 2 }} color="primary" />
          )}
          
          <NotificationCenter 
            notifications={notifications}
            count={notificationCount}
            onClearCount={clearNotificationCount}
          />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {!isConnected && (
              <WalletConnectButton onConnect={connectWallet} />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundImage: 'linear-gradient(rgba(30, 30, 30, 0.97), rgba(30, 30, 30, 0.97))',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
              backgroundImage: 'linear-gradient(rgba(30, 30, 30, 0.97), rgba(30, 30, 30, 0.97))',
              transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
              visibility: open ? 'visible' : 'hidden',
              transition: theme.transitions.create(['transform', 'visibility'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(58, 123, 213, 0.1), transparent 70%)',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
