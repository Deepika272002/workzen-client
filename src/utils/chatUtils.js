import { chats } from '../services/api';

/**
 * Get participant details from a chat object
 * @param {Object} chat - The chat object
 * @param {string} userId - Current user's ID
 * @returns {Object} Object containing sender and receiver details
 */
export const getChatParticipants = (chat, userId) => {
  if (!chat?.participantDetails?.length) {
    return {
      sender: null,
      receiver: null,
      otherParticipant: null
    };
  }

  // Find current user's details (sender)
  const senderDetails = chat.participantDetails.find(p => 
    (p.user?._id || p.user) === userId
  );

  // Find other participant's details (receiver)
  const receiverDetails = chat.participantDetails.find(p => 
    (p.user?._id || p.user) !== userId
  );

  const otherParticipant = {
    id: receiverDetails?.user?._id || receiverDetails?.user,
    name: receiverDetails?.name || 'Unknown User',
    avatar: receiverDetails?.avatar || '',
    onlineStatus: receiverDetails?.onlineStatus || 'offline'
  };

  return {
    sender: senderDetails ? {
      id: senderDetails.user?._id || senderDetails.user,
      name: senderDetails.name || 'Unknown User',
      avatar: senderDetails.avatar || '',
      onlineStatus: senderDetails.onlineStatus || 'offline'
    } : null,
    receiver: receiverDetails ? {
      id: receiverDetails.user?._id || receiverDetails.user,
      name: receiverDetails.name || 'Unknown User',
      avatar: receiverDetails.avatar || '',
      onlineStatus: receiverDetails.onlineStatus || 'offline'
    } : null,
    otherParticipant
  };
};

/**
 * Get message participant names
 * @param {Object} chat - The chat object
 * @param {Object|string} sender - Message sender object or ID
 * @returns {Object} Object containing sender and receiver names
 */
export const getMessageParticipantNames = (chat, sender) => {
  if (!chat?.participantDetails?.length) {
    return {
      senderName: 'Unknown Sender',
      receiverName: 'Unknown Receiver'
    };
  }

  const senderId = typeof sender === 'object' ? (sender._id || sender.id) : sender;

  // Find the sender details from participantDetails by matching user._id
  const senderDetail = chat.participantDetails.find(p => 
    p.user._id === senderId
  );

  // Find the receiver details (the other participant)
  const receiverDetail = chat.participantDetails.find(p => 
    p.user._id !== senderId
  );

  return {
    senderName: senderDetail?.user?.name || 'Unknown Sender',
    receiverName: receiverDetail?.user?.name || 'Unknown Receiver'
  };
};

/**
 * Update message display with participant details
 * @param {Array} messages - Array of messages
 * @param {Object} chat - The chat object
 * @returns {Array} Updated messages with participant details
 * Get participant names for a chat message
 * @param {Object} chat - The chat object containing participants
 * @param {string} senderId - The ID of the message sender
 * @returns {Object} Object containing sender name and recipient name
 */
export const updateMessageDisplay = (messages, chat) => {
  if (!messages?.length || !chat?.participantDetails?.length) {
    return messages;
  }

  return messages.map(message => {
    const { senderName } = getMessageParticipantNames(chat, message.sender);
    const updatedMessage = { ...message };

    if (typeof updatedMessage.sender === 'object') {
      updatedMessage.sender = {
        ...updatedMessage.sender,
        name: senderName
      };
    } else {
      updatedMessage.senderName = senderName;
    }

    return updatedMessage;
  });
};

/**
 * Load chat messages with pagination
 * @param {string} chatId - The chat ID
 * @param {number} page - Page number
 * @param {boolean} isInitial - Whether this is initial load
 * @returns {Promise<Object>} Object containing messages, hasMore flag
 */
export const loadChatMessages = async (chatId, page = 1, isInitial = false) => {
  try {
    const response = await chats.getMessages(chatId, page);
    return {
      messages: response.data.messages || [],
      hasMore: response.data.hasMore || false
    };
  } catch (error) {
    console.error('Error loading messages:', error);
    return { messages: [], hasMore: false };
  }
};

/**
 * Mark messages as read
 * @param {string} chatId - The chat ID
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (chatId) => {
  try {
    await chats.markMessagesAsRead(chatId);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Send a new message
 * @param {string} chatId - The chat ID
 * @param {Object} messageData - Message data to send
 * @returns {Promise<Object>} The sent message
 */
export const sendMessage = async (chatId, messageData) => {
  try {
    const response = await chats.sendMessage(chatId, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Send a new message with attachments
 * @param {string} chatId - The chat ID
 * @param {Object} messageData - Message data to send
 * @param {File[]} files - Array of files to upload
 * @returns {Promise<Object>} The sent message
 */
export const sendMessageWithAttachments = async (chatId, messageData, files) => {
  try {
    const formData = new FormData();
    formData.append('content', messageData.content || '');
    
    files.forEach(file => {
      formData.append('attachments', file);
    });

    const response = await chats.sendMessageWithFiles(chatId, formData);
    return response.data;
  } catch (error) {
    console.error('Error sending message with attachments:', error);
    throw error;
  }
};

/**
 * Update chat list with new message
 * @param {Array} chatList - Current chat list
 * @param {Object} message - New message
 * @param {string} chatId - Chat ID
 * @param {string} selectedChatId - Currently selected chat ID
 * @param {boolean} isNotification - Whether this is a notification
 * @returns {Array} Updated chat list
 */
export const updateChatListWithMessage = (chatList, message, chatId, selectedChatId, isNotification = false) => {
  const updatedChats = [...chatList];
  const chatIndex = updatedChats.findIndex(c => c._id === chatId);

  if (chatIndex !== -1) {
    const chat = updatedChats[chatIndex];
    let updatedMessage = { ...message };

    if (updatedMessage.sender) {
      const { senderName } = getMessageParticipantNames(chat, updatedMessage.sender);
      if (typeof updatedMessage.sender === 'object') {
        updatedMessage.sender = {
          ...updatedMessage.sender,
          name: senderName
        };
      } else {
        updatedMessage.senderName = senderName;
      }
    }

    updatedChats[chatIndex] = {
      ...chat,
      lastMessage: updatedMessage,
      lastMessageAt: new Date().toISOString(),
      unreadCount: selectedChatId === chatId 
        ? 0 
        : (chat.unreadCount || 0) + (isNotification ? 1 : 0)
    };

    // Move updated chat to top
    const chatToMove = updatedChats.splice(chatIndex, 1)[0];
    updatedChats.unshift(chatToMove);
  }

  return updatedChats;
}; 