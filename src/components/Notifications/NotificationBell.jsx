import { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../Context/NotificationContext';
import { format } from 'date-fns';
import { NotificationTypes } from '../../types/notification';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, fetchNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // Fetch notifications when component mounts and when the menu opens
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications();
    }
  }, [anchorEl, fetchNotifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Load more notifications when scrolling
  const handleScroll = useCallback((event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  // Enhanced notification click handler
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification._id);
      }

      // Handle navigation based on notification type
      switch (notification.type) {
        case NotificationTypes.TASK_ASSIGNED:
        case NotificationTypes.TASK_UPDATED:
        case NotificationTypes.TASK_COMPLETED:
          if (notification.task) {
            navigate(`/tasks/${notification.task}`);
          }
          break;
        // Add other notification type handlers
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NotificationTypes.TASK_ASSIGNED:
        return 'primary.main';
      case NotificationTypes.TASK_UPDATED:
        return 'info.main';
      case NotificationTypes.TASK_COMPLETED:
        return 'success.main';
      case NotificationTypes.DEADLINE_APPROACHING:
        return 'warning.main';
      case NotificationTypes.TASK_OVERDUE:
        return 'error.main';
      case NotificationTypes.COMMENT_ADDED:
        return 'secondary.main';
      case NotificationTypes.STATUS_CHANGED:
        return 'info.dark';
      case NotificationTypes.PRIORITY_CHANGED:
        return 'warning.dark';
      default:
        return 'text.primary';
    }
  };

  console.log('NotificationBell rendering with:', { 
    notificationsCount: notifications?.length, 
    unreadCount, 
    loading 
  });

  return (
    <>
      <IconButton color="inherit" onClick={handleClick} data-testid="notification-bell">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          onScroll: handleScroll,
          style: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={markAllAsRead}
              startIcon={<MarkReadIcon />}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        
        {notifications?.map((notification) => (
          <MenuItem
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              py: 1,
              px: 2,
              borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
              bgcolor: notification.read ? 'transparent' : 'action.hover',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {!notification.read && (
                <CircleIcon sx={{ fontSize: 8, mr: 1, color: 'primary.main' }} />
              )}
              <Typography variant="subtitle2">{notification.title}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </MenuItem>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 