import io from 'socket.io-client';

// Socket instance that will be reused across the application
let socket = null;
// Counter to track reconnection attempts
let reconnectAttempts = 0;
// Maximum number of reconnection attempts before giving up
const MAX_RECONNECT_ATTEMPTS = 10;

// Callback registries for different socket events
// Using Maps to store callbacks with unique IDs for easy removal
const callbacks = {
  message: new Map(),    // For new messages
  typing: new Map(),     // For typing indicators
  status: new Map(),     // For user online/offline status
  notification: new Map(), // For message notifications
  reaction: new Map(),   // For message reactions
  delivery: new Map(),   // For message delivery status
  read: new Map(),       // For message read receipts
  deletion: new Map(),   // For message deletions
  webrtc: new Map(),     // For WebRTC signaling
  meeting: new Map(),     // For meeting events
};

/**
 * Initialize the socket connection with authentication token
 * @param {string} token - JWT authentication token
 * @returns {object} - The socket instance
 */
export const initializeSocket = (token) => {
  // Return existing socket if already connected
  if (socket && socket.connected) {
    return socket;
  }

  // Clean up existing socket if disconnected
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Get server URL from environment variables
  const serverUrl = import.meta.env.VITE_API_URL;
  
  // Create new socket connection with configuration
  socket = io(serverUrl, {
    auth: { token },                    // Authentication token
    transports: ['websocket', 'polling'], // Connection methods (websocket preferred)
    reconnection: true,                 // Enable automatic reconnection
    reconnectionDelay: 1000,            // Initial delay between reconnection attempts (1s)
    reconnectionDelayMax: 5000,         // Maximum delay between attempts (5s)
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS, // Max number of attempts
    timeout: 20000,                     // Connection timeout (20s)
    path: '/socket.io',                 // Socket.io path
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB max message size
    autoConnect: true                   // Connect automatically
  });

  // Connection successful event handler
  socket.on('connect', () => {
    console.log('Socket connected successfully');
    reconnectAttempts = 0; // Reset reconnection attempts counter
  });

  // Connection error event handler
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message || error);
    reconnectAttempts++;
    
    // Disconnect after maximum reconnection attempts
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Maximum reconnection attempts reached');
      socket.disconnect();
    }
  });

  // Disconnection event handler
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    
    // If server disconnected us, try to reconnect
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  // Message events - register handlers for different message-related events
  
  // New message received
  socket.on('newMessage', (message) => {
    notifyCallbacks('message', message, 'new');
  });

  // Message delivered to recipient
  socket.on('messageDelivered', (data) => {
    notifyCallbacks('delivery', data);
  });

  // Message read by recipient
  socket.on('messageReadBy', (data) => {
    notifyCallbacks('read', data);
  });

  // Message deleted
  socket.on('messageDeleted', (data) => {
    notifyCallbacks('deletion', data);
  });

  // Reaction events - for emoji reactions on messages
  
  // New reaction added to message
  socket.on('messageReaction', (data) => {
    notifyCallbacks('reaction', data, 'add');
  });

  // Reaction removed from message
  socket.on('reactionRemoved', (data) => {
    notifyCallbacks('reaction', data, 'remove');
  });

  // Typing events - for typing indicators
  
  // User started typing
  socket.on('userTyping', (data) => {
    notifyCallbacks('typing', data, true);
  });

  // User stopped typing
  socket.on('userStoppedTyping', (data) => {
    notifyCallbacks('typing', data, false);
  });

  // Status events - for user online/offline status
  
  // Single user status change
  socket.on('userStatusChange', (data) => {
    notifyCallbacks('status', data, 'change');
  });

  // Bulk presence information (multiple users)
  socket.on('presenceInfo', (data) => {
    notifyCallbacks('status', data, 'bulk');
  });

  // Notification events - for message notifications
  socket.on('messageNotification', (data) => {
    notifyCallbacks('notification', data);
  });

  // WebRTC signaling events
  socket.on('offer', (data) => {
    notifyCallbacks('webrtc', data, 'offer');
  });

  socket.on('answer', (data) => {
    notifyCallbacks('webrtc', data, 'answer');
  });

  socket.on('ice-candidate', (data) => {
    notifyCallbacks('webrtc', data, 'ice-candidate');
  });

  socket.on('user-joined', (data) => {
    notifyCallbacks('meeting', data, 'user-joined');
  });

  socket.on('user-left', (data) => {
    notifyCallbacks('meeting', data, 'user-left');
  });

  socket.on('existing-participants', (data) => {
    notifyCallbacks('meeting', data, 'existing-participants');
  });

  socket.on('meeting-ended', (data) => {
    notifyCallbacks('meeting', data, 'meeting-ended');
  });

  socket.on('user-media-toggle', (data) => {
    notifyCallbacks('meeting', data, 'media-toggle');
  });

  return socket;
};

/**
 * Helper function to notify all registered callbacks for a specific event type
 * @param {string} type - Event type (message, typing, etc.)
 * @param {object} data - Event data
 * @param {any} subType - Optional sub-type for more specific event handling
 */
const notifyCallbacks = (type, data, subType) => {
  if (callbacks[type]) {
    callbacks[type].forEach(callback => callback(data, subType));
  }
};

/**
 * Get the current socket instance
 * @returns {object|null} - Socket instance or null if not initialized
 */
export const getSocket = () => socket;

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Utility function to parse JWT token
 * @param {string} token - JWT token
 * @returns {object} - Parsed token payload
 */
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return {};
  }
};

// Message functions

/**
 * Send a message to a chat
 * @param {string} chatId - Chat ID
 * @param {object} message - Message content
 */
export const sendMessage = (chatId, message) => {
  if (socket && socket.connected) {
    socket.emit('sendMessage', { chatId, message });
  }
};

/**
 * Delete a message
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @param {boolean} forEveryone - Whether to delete for everyone or just the current user
 */
export const deleteMessage = (chatId, messageId, forEveryone = false) => {
  if (socket && socket.connected) {
    socket.emit('deleteMessage', { chatId, messageId, forEveryone });
  }
};

// Reaction functions

/**
 * Add a reaction to a message
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji reaction
 */
export const addMessageReaction = (chatId, messageId, emoji) => {
  if (socket && socket.connected) {
    socket.emit('addReaction', { chatId, messageId, emoji });
  }
};

/**
 * Remove a reaction from a message
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 */
export const removeMessageReaction = (chatId, messageId) => {
  if (socket && socket.connected) {
    socket.emit('removeReaction', { chatId, messageId });
  }
};

// Typing indicator functions

/**
 * Emit typing indicator
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
export const emitTyping = (chatId, userId) => {
  if (socket && socket.connected) {
    socket.emit('typing', { chatId, userId });
  }
};

/**
 * Emit stop typing indicator
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
export const emitStopTyping = (chatId, userId) => {
  if (socket && socket.connected) {
    socket.emit('stopTyping', { chatId, userId });
  }
};

/**
 * Emit message read receipt
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 */
export const emitMessageRead = (chatId, messageId, userId) => {
  if (socket && socket.connected) {
    socket.emit('messageRead', { chatId, messageId, userId });
  }
};

// Chat room functions

/**
 * Join a chat room
 * @param {string} chatId - Chat ID
 */
export const joinChatRoom = (chatId) => {
  if (socket && socket.connected) {
    socket.emit('joinChat', chatId);
  }
};

/**
 * Leave a chat room
 * @param {string} chatId - Chat ID
 */
export const leaveChatRoom = (chatId) => {
  if (socket && socket.connected) {
    socket.emit('leaveChat', chatId);
  }
};

/**
 * Get presence status for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 */
export const getPresenceStatus = (userIds) => {
  if (socket && socket.connected) {
    socket.emit('getPresence', userIds);
  }
};

// Event listener registration functions
// Each function returns a cleanup function to remove the listener

/**
 * Register a callback for new messages
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onMessage = (callback, id = 'default') => {
  callbacks.message.set(id, callback);
  return () => callbacks.message.delete(id);
};

/**
 * Register a callback for message delivery status
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onDeliveryStatus = (callback, id = 'default') => {
  callbacks.delivery.set(id, callback);
  return () => callbacks.delivery.delete(id);
};

/**
 * Register a callback for message read receipts
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onReadReceipt = (callback, id = 'default') => {
  callbacks.read.set(id, callback);
  return () => callbacks.read.delete(id);
};

/**
 * Register a callback for message deletions
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onMessageDeleted = (callback, id = 'default') => {
  callbacks.deletion.set(id, callback);
  return () => callbacks.deletion.delete(id);
};

/**
 * Register a callback for typing indicators
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onTyping = (callback, id = 'default') => {
  callbacks.typing.set(id, callback);
  return () => callbacks.typing.delete(id);
};

/**
 * Register a callback for user status changes
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onStatusChange = (callback, id = 'default') => {
  callbacks.status.set(id, callback);
  return () => callbacks.status.delete(id);
};

/**
 * Register a callback for message notifications
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onNotification = (callback, id = 'default') => {
  callbacks.notification.set(id, callback);
  return () => callbacks.notification.delete(id);
};

/**
 * Register a callback for message reactions
 * @param {Function} callback - Callback function
 * @param {string} id - Unique identifier for this callback
 * @returns {Function} - Cleanup function to remove the listener
 */
export const onReaction = (callback, id = 'default') => {
  callbacks.reaction.set(id, callback);
  return () => callbacks.reaction.delete(id);
};

// WebRTC signaling functions
export const joinMeeting = (meetingCode, userData) => {
  if (socket && socket.connected) {
    socket.emit('join-meeting', { meetingCode, userData });
  }
};

export const leaveMeeting = (meetingCode) => {
  if (socket && socket.connected) {
    socket.emit('leave-meeting', { meetingCode });
  }
};

export const sendOffer = (to, offer) => {
  if (socket && socket.connected) {
    socket.emit('offer', { to, offer });
  }
};

export const sendAnswer = (to, answer) => {
  if (socket && socket.connected) {
    socket.emit('answer', { to, answer });
  }
};

export const sendIceCandidate = (to, candidate) => {
  if (socket && socket.connected) {
    socket.emit('ice-candidate', { to, candidate });
  }
};

export const toggleMedia = (meetingCode, type, enabled) => {
  if (socket && socket.connected) {
    socket.emit('toggle-media', { meetingCode, type, enabled });
  }
};

// Register WebRTC event listeners
export const onWebRTCEvent = (callback, id = 'default') => {
  callbacks.webrtc.set(id, callback);
  return () => callbacks.webrtc.delete(id);
};

// Register meeting event listeners
export const onMeetingEvent = (callback, id = 'default') => {
  callbacks.meeting.set(id, callback);
  return () => callbacks.meeting.delete(id);
};


