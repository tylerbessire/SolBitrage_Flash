import React, { useState } from 'react';
import { Box, IconButton, Badge, Menu, MenuItem, Typography, List, ListItem, 
         ListItemText, ListItemIcon, Divider, useTheme } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const NotificationCenter = ({ notifications, count, onClearCount }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    onClearCount();
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const getIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <SuccessIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'info':
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        aria-label="show notifications"
        onClick={handleClick}
      >
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" fontWeight="medium">Notifications</Typography>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 5).map((notification) => (
              <MenuItem key={notification.id} onClick={handleClose}>
                <ListItemIcon>
                  {getIcon(notification.severity)}
                </ListItemIcon>
                <ListItemText 
                  primary={notification.message}
                  secondary={formatTime(notification.timestamp)}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 'medium',
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                />
              </MenuItem>
            ))}
            
            {notifications.length > 5 && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  + {notifications.length - 5} more notifications
                </Typography>
              </Box>
            )}
            
            <Divider />
            <MenuItem onClick={handleClose} sx={{ justifyContent: 'center' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Clear all notifications" />
            </MenuItem>
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
