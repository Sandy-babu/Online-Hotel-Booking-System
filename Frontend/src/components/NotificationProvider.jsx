import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Snackbar,
  Alert,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close,
  Check,
  Info,
  Warning,
  Error as ErrorIcon,
  Delete,
  MarkEmailRead
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

// Create a context for notifications
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Count unread notifications
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 60 seconds
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!userEmail || !token) return;
      
      const response = await axios.get('/api/notifications', {
        params: { email: userEmail },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setNotifications(response.data);
        
        // If there are new unread notifications, show a snackbar for the most recent one
        const unreadNotifs = response.data.filter(notif => !notif.read);
        if (unreadNotifs.length > 0 && unreadCount < unreadNotifs.length) {
          const latestNotif = unreadNotifs.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          
          showSnackbar(latestNotif.message, latestNotif.type || 'info');
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addNotification = async (message, type = NOTIFICATION_TYPES.INFO, autoHide = true) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!userEmail || !token) return;
      
      // Add notification to backend
      const response = await axios.post('/api/notifications', 
        { 
          message, 
          type, 
          recipientEmail: userEmail 
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update local state
      setNotifications(prev => [response.data, ...prev]);
      
      // Show snackbar if autoHide is true
      if (autoHide) {
        showSnackbar(message, type);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      await axios.put('/api/notifications/mark-all-read', 
        { email: userEmail },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      
      setAnchorEl(null);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      await axios.delete('/api/notifications', {
        params: { email: userEmail },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications([]);
      setAnchorEl(null);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <Check color="success" />;
      case NOTIFICATION_TYPES.WARNING:
        return <Warning color="warning" />;
      case NOTIFICATION_TYPES.ERROR:
        return <ErrorIcon color="error" />;
      case NOTIFICATION_TYPES.INFO:
      default:
        return <Info color="info" />;
    }
  };

  // Value to be provided by the context
  const contextValue = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    showSnackbar
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Bell Icon */}
      <Box sx={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1200 }}>
        <Badge badgeContent={unreadCount} color="error">
          <IconButton 
            color="inherit"
            onClick={handleOpenMenu}
            size="large"
            sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
          >
            <NotificationsIcon />
          </IconButton>
        </Badge>
      </Box>
      
      {/* Notification Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: { 
            width: 320,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
          <Box>
            <Button 
              onClick={toggleDrawer} 
              size="small" 
              sx={{ fontSize: '0.75rem' }}
            >
              View All
            </Button>
          </Box>
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem sx={{ color: 'text.secondary', py: 2, justifyContent: 'center' }}>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          <>
            {/* Latest 5 notifications */}
            {notifications.slice(0, 5).map(notification => (
              <MenuItem 
                key={notification.id} 
                onClick={() => markAsRead(notification.id)}
                sx={{ 
                  py: 1,
                  px: 2,
                  bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)'
                }}
              >
                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                <ListItemText 
                  primary={notification.message}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondary={format(new Date(notification.createdAt), 'PPp')}
                  secondaryTypographyProps={{ variant: 'caption' }}
                  sx={{ m: 0 }}
                />
              </MenuItem>
            ))}
            
            <Divider />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
              <Button 
                startIcon={<MarkEmailRead />} 
                size="small" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
              <Button 
                startIcon={<Delete />} 
                size="small" 
                color="error" 
                onClick={clearAllNotifications}
              >
                Clear all
              </Button>
            </Box>
          </>
        )}
      </Menu>
      
      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { 
            width: { xs: '100%', sm: 400 },
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          <IconButton onClick={toggleDrawer}>
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined"
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </Box>
        )}
        
        {notifications.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Typography variant="body1" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {notifications.map(notification => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{ 
                    py: 2,
                    bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                    borderRadius: 1
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={format(new Date(notification.createdAt), 'PPp')}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    sx={{ cursor: !notification.read ? 'pointer' : 'default' }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<Delete />}
              onClick={clearAllNotifications}
            >
              Clear all notifications
            </Button>
          </Box>
        )}
      </Drawer>
      
      {/* Snackbar for new notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;