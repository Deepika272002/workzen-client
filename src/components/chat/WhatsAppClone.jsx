import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  TextField, 
  IconButton, 
  Paper,
  Avatar,
  CircularProgress,
  Button,
  ListItemAvatar,
  Badge,
  Fab, 
  Dialog, 
  DialogTitle,
  DialogContent,
  InputAdornment
} from '@mui/material';
import { 
  Send as SendIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Done as CheckIcon,
  DoneAll as DoubleCheckIcon,
  Stop as StopIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  Mic as MicIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { chats as chatApi, users } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { initializeSocket, emitTyping, emitStopTyping } from '../../utils/socket';
import EmojiPicker from 'emoji-picker-react';
import ChatMessage from './ChatMessage';
import {
  getChatParticipants,
  loadChatMessages,
  markMessagesAsRead,
  sendMessage,
  updateMessageDisplay,
  updateChatListWithMessage
} from '../../utils/chatUtils';

/**
 * WhatsApp-style Chat Application Component
 * 
 * This component provides a complete chat interface with features including:
 * - Real-time messaging with socket.io
 * - Chat list with unread message indicators
 * - Message delivery and read receipts
 * - File attachments and voice messages
 * - Emoji reactions
 * - Typing indicators
 * - User online status
 */
const ChatApp = () => {
  // State for managing team members and user selection
  const [teamMembers, setTeamMembers] = useState([]); // List of team members
  const [selectedChat, setSelectedChat] = useState(null); // Currently selected chat
  const [messages, setMessages] = useState([]); // Messages in the current chat
  const [newMessage, setNewMessage] = useState(''); // Message being composed
  const { user } = useAuth(); // Current authenticated user
  const [socket, setSocket] = useState(null); // Socket.io connection
  const [selectedMember, setSelectedMember] = useState(null); // Selected chat participant
  
  // UI state management
  const [loading, setLoading] = useState(false); // Loading indicator
  const [page, setPage] = useState(1); // Current page for message pagination
  const [hasMore, setHasMore] = useState(true); // Whether more messages can be loaded
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Toggle emoji picker
  const [typingTimeout, setTypingTimeout] = useState(null); // Timeout for typing indicator
  const [typingUsers, setTypingUsers] = useState(new Set()); // Users currently typing
  const messagesEndRef = useRef(null); // Reference to scroll to bottom of messages
  const fileInputRef = useRef(null); // Reference to hidden file input
  const [chatList, setChatList] = useState([]); // List of all user's chats
  const [openUserList, setOpenUserList] = useState(false); // Toggle user selection dialog
  const [companyUsers, setCompanyUsers] = useState([]); // All users in the company
  
  // Message interaction states
  const [selectedMessageId, setSelectedMessageId] = useState(null); // For reactions/context menu
  const [showReactionPicker, setShowReactionPicker] = useState(false); // Toggle reaction picker
  
  // Voice message recording states
  const [isRecording, setIsRecording] = useState(false); // Whether currently recording
  const [recordingTime, setRecordingTime] = useState(0); // Recording duration in seconds
  const [recordingInterval, setRecordingInterval] = useState(null); // Timer interval
  const [audioBlob, setAudioBlob] = useState(null); // Recorded audio data
  const [uploadProgress, setUploadProgress] = useState(0); // File upload progress
  const mediaRecorderRef = useRef(null); // Reference to MediaRecorder instance
  const audioChunksRef = useRef([]); // Chunks of recorded audio
  const [filteredUsers, setFilteredUsers] = useState(null); // Filtered users in search

  /**
   * Scrolls to the bottom of the message list
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Fetch team members when component mounts
   */
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await users.getMyTeam();
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user && user.id) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        query: {
          userId: user.id
        }
      });
      
      setSocket(newSocket);
      
      // Clean up on unmount
      return () => {
        if (newSocket) newSocket.disconnect();
      };
    }
  }, [user]);

  // Handle socket events
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('joinChat', selectedChat._id);
      
      const handleNewMessage = (data) => {
        if (data.chatId === selectedChat._id) {
          const chat = chatList.find(c => c._id === data.chatId);
          const updatedMessages = updateMessageDisplay([data.message], chat);
          setMessages(prev => [...prev, updatedMessages[0]]);
          scrollToBottom();
          markMessagesAsRead(data.chatId);
        }
        
        setChatList(prev => 
          updateChatListWithMessage(prev, data.message, data.chatId, selectedChat?._id)
        );
      };
      
      socket.on('newMessage', handleNewMessage);
      socket.on('messageRead', (data) => {
        if (data.chatId === selectedChat._id) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === data.messageId 
                ? { 
                    ...msg, 
                    readBy: [...(msg.readBy || []), { 
                      user: data.userId, 
                      readAt: new Date() 
                    }] 
                  } 
                : msg
            )
          );
        }
      });

      // Message delivery status updates
      socket.on('messageDelivered', ({ messageId, chatId, deliveredTo }) => {
        if (selectedChat?._id === chatId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === messageId 
                ? { 
                    ...msg, 
                    deliveredTo: [...(msg.deliveredTo || []), ...deliveredTo.map(id => ({
                      userId: id,
                      deliveredAt: new Date()
                    }))] 
                  } 
                : msg
            )
          );
        }
      });

      // Typing indicator events
      socket.on('userTyping', ({ userId, chatId }) => {
        if (selectedChat?._id === chatId) {
          setTypingUsers(prev => new Set([...prev, userId]));
        }
      });

      socket.on('userStoppedTyping', ({ userId, chatId }) => {
        if (selectedChat?._id === chatId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      });

      // Message reactions
      socket.on('messageReaction', ({ chatId, messageId, reaction }) => {
        if (selectedChat?._id === chatId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === messageId 
                ? { 
                    ...msg, 
                    reactions: [
                      ...(msg.reactions || []).filter(r => r.user !== reaction.user),
                      reaction
                    ] 
                  } 
                : msg
            )
          );
        }
      });

      socket.on('reactionRemoved', ({ chatId, messageId, userId }) => {
        if (selectedChat?._id === chatId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === messageId 
                ? { 
                    ...msg, 
                    reactions: (msg.reactions || []).filter(r => r.user !== userId)
                  } 
                : msg
            )
          );
        }
      });

      // Message deletion
      socket.on('messageDeleted', ({ chatId, messageId, forEveryone }) => {
        if (selectedChat?._id === chatId) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg._id === messageId 
                ? { ...msg, isDeleted: true } 
                : msg
            )
          );
        }
      });

      // User online status changes
      socket.on('userStatusChange', ({ userId, status }) => {
        setChatList(prevChats => {
          return prevChats.map(chat => {
            const updatedParticipants = chat.participants.map(p => {
              if (p._id === userId) {
                return { ...p, onlineStatus: status };
              }
              return p;
            });
            return { ...chat, participants: updatedParticipants };
          });
        });
      });

      // Notifications for messages in other chats
      socket.on('messageNotification', ({ chatId, message }) => {
        // Only handle if not in the current chat
        if (selectedChat?._id !== chatId) {
          // Update chat list with the new message and increment unread count
          setChatList(prev => 
            updateChatListWithMessage(prev, message, chatId, selectedChat?._id)
          );
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            const sender = message.sender._id;
            const senderName = getChatParticipantName(chatId, sender);
            
            new Notification('New Message', {
              body: `${senderName}: ${message.content}`,
              icon: '/path/to/notification-icon.png'
            });
          }
        }
      });

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageRead');
        // ... remove other event handlers ...
      };
    }
  }, [socket, selectedChat, chatList]);

  /**
   * Gets the name of a chat participant by their ID
   * @param {string} chatId - The ID of the chat
   * @param {string} participantId - The ID of the participant
   * @returns {string} The participant's name or "Unknown User"
   */
  const getChatParticipantName = (chatId, participantId) => {
    const chat = chatList.find(c => c._id === chatId);
    if (chat) {
      // First try to get from participantDetails
      if (chat.participantDetails && chat.participantDetails.length > 0) {
        const participantDetail = chat.participantDetails.find(p => 
          p.user?._id === participantId || p.user === participantId
        );
        if (participantDetail?.name) {
          return participantDetail.name;
        }
      }
      
      // Fall back to participants array
      const participant = chat.participants.find(p => {
        if (typeof p === 'string') {
          return p !== participantId;
        }
        return p._id !== participantId;
      });
      
      if (participant && typeof participant !== 'string') {
        return participant.name;
      }
    }
    return 'Unknown User';
  };

  /**
   * Gets detailed information about chat participants
   * @param {Object} chat - The chat object
   * @param {string} currentUserId - The current user's ID
   * @param {string} [specificParticipantId] - Optional specific participant ID to retrieve
   * @returns {Object} Object containing participant details
   */
  const getParticipantDetails = (chat, currentUserId, specificParticipantId = null) => {
    if (!chat) return { sender: null, receiver: null, otherParticipant: null };
    
    let senderDetails = null;
    let receiverDetails = null;
    
    // First try to get from participantDetails
    if (chat.participantDetails && chat.participantDetails.length > 0) {
      // For the current user's profile (sender)
      senderDetails = chat.participantDetails.find(p => {
        const participantId = p.user?._id || p.user;
        return participantId === currentUserId;
      });
      
      // For the other user's profile (receiver) or specific participant
      receiverDetails = chat.participantDetails.find(p => {
        const participantId = p.user?._id || p.user;
        if (specificParticipantId) {
          return participantId === specificParticipantId;
        }
        return participantId !== currentUserId;
      });
    }
    
    // If not found in participantDetails, try participants array
    if (!senderDetails || !receiverDetails) {
      const participants = chat.participants || [];
      
      if (!senderDetails) {
        const sender = participants.find(p => {
          if (typeof p === 'string') {
            return p === currentUserId;
          }
          return p._id === currentUserId;
        });
        
        if (sender && typeof sender !== 'string') {
          senderDetails = {
            user: sender._id,
            name: sender.name,
            avatar: sender.avatar,
            onlineStatus: sender.isOnline ? 'online' : 'offline'
          };
        }
      }
      
      if (!receiverDetails) {
        const receiver = participants.find(p => {
          if (typeof p === 'string') {
            if (specificParticipantId) {
              return p === specificParticipantId;
            }
            return p !== currentUserId;
          }
          if (specificParticipantId) {
            return p._id === specificParticipantId;
          }
          return p._id !== currentUserId;
        });
        
        if (receiver && typeof receiver !== 'string') {
          receiverDetails = {
            user: receiver._id,
            name: receiver.name,
            avatar: receiver.avatar,
            onlineStatus: receiver.isOnline ? 'online' : 'offline'
          };
        }
      }
    }
    
    // If we have a display name from the backend, use it for the receiver
    if (chat.displayName && receiverDetails) {
      receiverDetails.name = chat.displayName;
    }
    
    // Format the return object
    const formattedSender = senderDetails ? {
      id: senderDetails.user?._id || senderDetails.user,
      name: senderDetails.name || 'Unknown User',
      avatar: senderDetails.avatar || '',
      onlineStatus: senderDetails.onlineStatus || 'offline'
    } : null;
    
    const formattedReceiver = receiverDetails ? {
      id: receiverDetails.user?._id || receiverDetails.user,
      name: receiverDetails.name || 'Unknown User',
      avatar: receiverDetails.avatar || '',
      onlineStatus: receiverDetails.onlineStatus || 'offline'
    } : null;
    
    return {
      sender: formattedSender,
      receiver: formattedReceiver,
      otherParticipant: formattedReceiver // For backward compatibility
    };
  };

  /**
   * Handles selecting a chat from the chat list
   * @param {Object} chat - The chat object to select
   */
  const handleSelectChat = async (chat) => {
    try {
      setLoading(true);
      
      // Get the other participant's details using our unified function
      const { otherParticipant } = getParticipantDetails(chat, user.id);
      
      // Log to verify we're getting the correct data
      console.log("Other participant:", otherParticipant);
      
      // Set the selected member to the OTHER participant (not the current user)
      setSelectedMember({
        _id: otherParticipant?.id,
        name: otherParticipant?.name || 'Unknown User',
        avatar: otherParticipant?.avatar || '',
        onlineStatus: otherParticipant?.onlineStatus || 'offline'
      });
      
      setSelectedChat(chat);
      setMessages([]);
      setPage(1);
      setHasMore(true);
      
      const { messages: newMessages, hasMore } = await loadChatMessages(chat._id, 1, true);
      const updatedMessages = updateMessageDisplay(newMessages, chat);
      setMessages(updatedMessages);
      setHasMore(hasMore);
      
      await markMessagesAsRead(chat._id);
      
      // Update unread count in chat list
      setChatList(prevList => 
        prevList.map(c => 
          c._id === chat._id 
            ? {...c, unreadCounts: c.unreadCounts.map(uc => 
                uc.user === user.id ? {...uc, count: 0} : uc
              )} 
            : c
        )
      );
      
      if (socket) {
        socket.emit('markAsRead', { chatId: chat._id, userId: user.id });
      }
      
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Error selecting chat:', error);
      alert('Failed to load chat messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads all messages for a selected chat
   * @param {string} chatId - The ID of the chat to load messages for
   * @param {number} pageNum - Page number for pagination
   * @param {boolean} isInitial - Whether this is the initial load
   */
  const loadMessages = async (chatId, pageNum = 1, isInitial = false) => {
    if (loading && !isInitial) return;
    
    setLoading(true);
    try {
      const { messages: newMessages, hasMore } = await loadChatMessages(chatId, pageNum);
      const updatedMessages = updateMessageDisplay(newMessages, selectedChat);
      
      setMessages(prev => isInitial ? updatedMessages : [...updatedMessages, ...prev]);
      setHasMore(hasMore);
      setPage(pageNum);

      if (isInitial) {
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles changes to the message input field
   * Also manages typing indicators
   * @param {Event} e - The input change event
   */
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedChat) {
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Emit typing indicator
      emitTyping(selectedChat._id, user.id);
      
      // Set timeout to stop typing indicator after 1 second of inactivity
      const timeout = setTimeout(() => {
        emitStopTyping(selectedChat._id, user.id);
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  /**
   * Handles emoji selection from the emoji picker
   * @param {Object} emojiData - The selected emoji data
   */
  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  /**
   * Sends a text message to the current chat
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const { receiver } = getParticipantDetails(selectedChat, user.id);
    
    const messageData = {
      content: newMessage.trim(),
      chatId: selectedChat._id,
      receiverId: receiver?.id || selectedMember?._id
    };
    
    try {
      setNewMessage('');
      
      const sentMessage = await sendMessage(selectedChat._id, messageData);
      const updatedMessages = updateMessageDisplay([sentMessage], selectedChat);
      setMessages(prev => [...prev, updatedMessages[0]]);
      scrollToBottom();
      
      setChatList(prev => 
        updateChatListWithMessage(prev, sentMessage, selectedChat._id, selectedChat._id)
      );
      
      if (socket) {
        socket.emit('sendMessage', {
          chatId: selectedChat._id,
          message: sentMessage
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageData.content);
      alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  };

  /**
   * Loads all chats for the current user
   */
  const loadChats = async () => {
    try {
      const response = await chatApi.getUserChats();
      setChatList(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Load chat list when component mounts and set up periodic refresh
  useEffect(() => {
    loadChats();
    
    // Register a global function to reload chats that can be called from ChatDialog
    window.refreshWhatsAppChats = loadChats;
    
    // Set up a periodic refresh of the chat list
    const intervalId = setInterval(() => {
      loadChats();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(intervalId);
      // Clean up the global function when component unmounts
      delete window.refreshWhatsAppChats;
    };
  }, []);

  /**
   * Handles selecting a user to start a new chat with
   * @param {Object} selectedUser - The user to chat with
   */
  const handleUserSelect = async (selectedUser) => {
    try {
      setLoading(true);
      
      // Create or get direct chat with selected user
      const response = await chatApi.createDirectChat(selectedUser._id);
      
      // Close the user selection dialog
      setOpenUserList(false);
      
      // Set the selected chat and member
      setSelectedChat(response.data);
      setSelectedMember(selectedUser);
      
      // Fetch messages for the chat
      const messagesResponse = await chatApi.getMessages(response.data._id);
      setMessages(messagesResponse.data.messages || []);
      
      // Mark messages as read
      await chatApi.markMessagesAsRead(response.data._id);
      
      // Join the socket room for this chat
      if (socket) {
        socket.emit('joinChat', response.data._id);
      }
      
      // Update chat list to reflect changes in unread count
      await loadChats();
      
      // Clear any existing message and scroll to bottom
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      console.error('Error starting chat with user:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches all users in the company for the new chat dialog
   */
  const fetchCompanyUsers = async () => {
    try {
      setLoading(true);
      const response = await users.getCompanyUsers();
      
      // Filter out current user from the list
      const filteredUsers = response.data.filter(u => u._id !== user.id);
      setCompanyUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching company users:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a reaction emoji to a message
   * @param {string} messageId - The ID of the message
   * @param {string} emoji - The emoji to add
   */
  const handleReaction = async (messageId, emoji) => {
    try {
      // Update the message locally first for immediate feedback
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { 
                ...msg, 
                reactions: [...(msg.reactions || []).filter(r => r.user !== user.id), { 
                  user: user.id, 
                  emoji,
                  createdAt: new Date()
                }] 
              } 
            : msg
        )
      );

      // Send the reaction to the server
      await chatApi.addReaction(selectedChat._id, messageId, emoji);

      // Emit the reaction through socket
      if (socket) {
        socket.emit('messageReaction', {
          chatId: selectedChat._id,
          messageId,
          emoji
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      // Revert the local update if the server request fails
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { 
                ...msg, 
                reactions: (msg.reactions || []).filter(r => r.user !== user.id)
              } 
            : msg
        )
      );
    }
  };

  /**
   * Removes a user's reaction from a message
   * @param {string} messageId - The ID of the message
   */
  const handleRemoveReaction = async (messageId) => {
    try {
      // Update the message locally first for immediate feedback
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { 
                ...msg, 
                reactions: (msg.reactions || []).filter(r => r.user !== user.id)
              } 
            : msg
        )
      );

      // Send the remove reaction request to the server
      await chatApi.removeReaction(selectedChat._id, messageId);

      // Emit the remove reaction through socket
      if (socket) {
        socket.emit('reactionRemoved', {
          chatId: selectedChat._id,
          messageId,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      // If the server request fails, revert the local change
      loadMessages(selectedChat._id, 1, true);
    }
  };

  /**
   * Handles long press on a message to show reaction options
   * @param {string} messageId - The ID of the message
   */
  const handleLongPress = (messageId) => {
    if (messageId) {
      setSelectedMessageId(messageId);
      setShowReactionPicker(true);
    }
  };

  /**
   * Starts recording a voice message
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data as it becomes available
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // When recording stops, create the audio blob
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer to show recording duration
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Store interval ID to clear it later
      setRecordingInterval(interval);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  /**
   * Stops recording a voice message
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingInterval);
      setRecordingTime(0);
    }
  };

  /**
   * Sends a recorded voice message
   */
  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedChat) return;
    
    try {
      const formData = new FormData();
      formData.append('files', audioBlob, 'voice-message.webm');
      formData.append('content', '🎤 Voice message');
      
      formData.onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      const response = await chatApi.sendMessageWithFiles(selectedChat._id, formData);
      setMessages(prev => [...prev, response.data]);
      setAudioBlob(null);
      setUploadProgress(0);
      
      if (socket) {
        socket.emit('sendMessage', {
          ...response.data,
          receiverId: selectedMember.id
        });
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };

  /**
   * Downloads an attachment file
   * @param {string} fileUrl - The URL of the file
   * @param {string} fileName - The name to save the file as
   */
  const handleDownloadAttachment = async (fileUrl, fileName) => {
    try {
      const response = await chatApi.downloadAttachment(fileUrl);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  /**
   * Handles file selection for attachments
   * @param {Event} e - The file input change event
   */
  const handleFileSelect = async (e) => {
    if (!e.target.files.length || !selectedChat) return;
    
    try {
      const formData = new FormData();
      
      // Add all selected files
      Array.from(e.target.files).forEach(file => {
        formData.append('files', file);
      });
      
      // Add a default message text
      formData.append('content', 'Attachment');
      
      // Add progress tracking
      formData.onProgress = (progress) => {
        setUploadProgress(progress);
      };
      
      // Send the files
      const response = await chatApi.sendMessageWithFiles(selectedChat._id, formData);
      
      // Add the new message to the messages list
      setMessages(prev => [...prev, response.data]);
      scrollToBottom();
      
      // Update the chat list
      setChatList(prev => 
        updateChatListWithMessage(prev, response.data, selectedChat._id, selectedChat._id)
      );
      
      // Reset the file input
      e.target.value = '';
      setUploadProgress(0);
      
      // Emit the message through socket
      if (socket) {
        socket.emit('sendMessage', {
          chatId: selectedChat._id,
          message: response.data
        });
      }
    } catch (error) {
      console.error('Error sending files:', error);
    }
  };

  /**
   * Gets the names of both the sender and receiver for a message
   * @param {string} chatId - The ID of the chat
   * @param {Object|string} sender - The sender ID or object
   * @returns {Object} Object containing sender and receiver names
   */
  const getMessageParticipantNames = (chatId, sender) => {
    const chat = chatList.find(c => c._id === chatId);
    
    if (!chat || !chat.participantDetails || chat.participantDetails.length < 2) {
      return { 
        senderName: 'Unknown Sender', 
        receiverName: 'Unknown Receiver' 
      };
    }
    
    // Extract sender ID from sender object or string
    const senderId = typeof sender === 'object' ? (sender._id || sender.id) : sender;
    
    // Find sender detail in participantDetails
    const senderDetail = chat.participantDetails.find(p => {
      const id = p.user?._id || p.user;
      return id === senderId;
    });
    
    // Find receiver detail (the other participant)
    const receiverDetail = chat.participantDetails.find(p => {
      const id = p.user?._id || p.user;
      return id !== senderId;
    });
    
    return {
      senderName: senderDetail?.name || 'Unknown Sender',
      receiverName: receiverDetail?.name || 'Unknown Receiver'
    };
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      height: '100%',
      backgroundColor: '#f0f2f5'
    }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileSelect}
      />
      
      <Box 
        display="flex" 
        sx={{
          height: 'calc(100vh - 80px)',
          width: '100%',
          mt: 10,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: 2
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            width: '30%', 
            overflow: 'auto',
            borderRight: '1px solid #e0e0e0',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c7c7c7',
              borderRadius: '4px'
            }
          }}
        >
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f0f2f5', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">Chats</Typography>
            <Fab 
              color="primary" 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16 
              }}
              onClick={() => {
                setFilteredUsers(null);  // Reset filtered users
                setOpenUserList(true);   // Open dialog
                fetchCompanyUsers();     // Fetch users
              }}
            >
              <AddIcon />
            </Fab>
          </Box>
          
          <Box sx={{ p: 1, backgroundColor: '#fff' }}>
            <TextField
              fullWidth
              placeholder="Search or start new chat"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <List sx={{ p: 0 }}>
            {chatList.length > 0 ? (
              chatList.map((chat) => {
                // Get the other participant using our unified function
                const { otherParticipant } = getParticipantDetails(chat, user.id);
                
                return (
                  <ListItem 
                    button 
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    selected={selectedChat?._id === chat._id}
                    sx={{ 
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                      backgroundColor: selectedChat?._id === chat._id ? '#e8f4fd' : 'inherit'
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: otherParticipant?.onlineStatus === 'online' ? '#44b700' : '#bdbdbd'
                          },
                        }}
                      >
                        <Avatar src={otherParticipant?.avatar}>
                          {otherParticipant?.name ? otherParticipant.name.charAt(0) : '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography noWrap sx={{ fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal' }}>
                            {otherParticipant?.name || 'Unknown User'}
                          </Typography>
                          {chat.lastMessageAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {new Date(chat.lastMessageAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {chat.type === 'task' && chat.taskId?.title && (
                            <Typography variant="caption" display="block" color="text.secondary" noWrap>
                              <b>Task:</b> {chat.taskId.title}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              noWrap 
                              sx={{ 
                                maxWidth: '85%',
                                fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {chat.lastMessage ? (
                                chat.lastMessage.content
                              ) : (
                                'No messages yet'
                              )}
                            </Typography>
                            {chat.unreadCount > 0 && (
                              <Badge 
                                badgeContent={chat.unreadCount} 
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                );
              })
            ) : (
              <Box p={2} textAlign="center">
                <Typography color="text.secondary">No chats available</Typography>
                <Typography variant="caption" color="text.secondary">
                  Click the + button to start a new chat
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        <Box 
          flexGrow={1} 
          display="flex" 
          flexDirection="column"
          sx={{
            backgroundColor: '#efeae2',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d7d3cd\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '30px 30px',
            position: 'relative'
          }}
        >
          {selectedMember ? (
            <>
              <Box 
                p={2} 
                sx={{ 
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Avatar src={selectedMember?.avatar} sx={{ mr: 2 }}>
                  {selectedMember?.name ? selectedMember.name.charAt(0) : <PersonIcon />}
                </Avatar>
                <Typography variant="h6">
                  {selectedMember?.name || 'Unknown User'}
                </Typography>
              </Box>

              <Box 
                flexGrow={1} 
                p={2}
                sx={{
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px'
                  }
                }}
              >
                {loading && (
                  <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress size={20} />
                  </Box>
                )}

                {hasMore && (
                  <Button 
                    onClick={() => loadMessages(selectedChat._id, page + 1)}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Load More
                  </Button>
                )}

                {messages.map((message, index) => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isUserMessage={message.sender === user.id || message.sender?._id === user.id}
                    chat={selectedChat}
                    onLongPress={handleLongPress}
                    showActions={true}
                    onReply={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {typingUsers.size > 0 && (
                <Typography variant="caption" sx={{ ml: 2, mb: 1 }}>
                  {Array.from(typingUsers).join(', ')} typing...
                </Typography>
              )}

              {showEmojiPicker && (
                <Box position="absolute" bottom="80px" right="20px" zIndex={1}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Box>
              )}

              <Box 
                display="flex" 
                p={2} 
                sx={{ 
                  backgroundColor: '#fff',
                  gap: 1
                }}
              >
                {isRecording ? (
                  <>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexGrow: 1,
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 4
                      }}
                    >
                      <Typography variant="body2" color="error">
                        Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton onClick={stopRecording} color="error">
                        <StopIcon />
                      </IconButton>
                    </Box>
                  </>
                ) : audioBlob ? (
                  <>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flexGrow: 1,
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 4
                      }}
                    >
                      <IconButton size="small" onClick={() => {
                        const url = URL.createObjectURL(audioBlob);
                        const audio = new Audio(url);
                        audio.play();
                      }}>
                        <PlayArrowIcon />
                      </IconButton>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton onClick={() => setAudioBlob(null)} size="small">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton onClick={sendVoiceMessage} color="primary">
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <IconButton 
                      size="small"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <AttachFileIcon />
                    </IconButton>

                    <IconButton 
                      size="small"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <EmojiIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onMouseDown={startRecording}
                      sx={{ color: isRecording ? 'error.main' : 'inherit' }}
                    >
                      <MicIcon />
                    </IconButton>

                    <TextField
                      fullWidth
                      value={newMessage}
                      onChange={handleMessageChange}
                      placeholder="Type a message..."
                      variant="outlined"
                      size="small"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <IconButton 
                      onClick={handleSendMessage} 
                      color="primary"
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </>
          ) : (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              height="100%"
            >
              <Typography variant="h6" color="textSecondary">
                Select a team member to start chatting
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* User List Dialog */}
      <Dialog 
        open={openUserList} 
        onClose={() => setOpenUserList(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Start New Chat</Typography>
            <IconButton onClick={() => setOpenUserList(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Users"
            fullWidth
            variant="outlined"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filtered = companyUsers.filter(u => 
                u.name.toLowerCase().includes(searchTerm) || 
                (u.email && u.email.toLowerCase().includes(searchTerm))
              );
              setFilteredUsers(filtered);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {(filteredUsers || companyUsers).map((user) => (
                <ListItem 
                  button 
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.name}
                    secondary={user.email || user.role || ''}
                  />
                </ListItem>
              ))}
              
              {(filteredUsers || companyUsers).length === 0 && (
                <Box textAlign="center" py={2}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Reaction Picker */}
      <Dialog
        open={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Typography variant="subtitle1">Add Reaction</Typography>
          <IconButton size="small" onClick={() => setShowReactionPicker(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {['👍', '❤️', '😂', '😮', '😢', '👏'].map(emoji => (
            <Box
              key={emoji}
              sx={{
                fontSize: '1.5rem',
                p: 1,
                cursor: 'pointer',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  transform: 'scale(1.2)'
                }
              }}
              onClick={() => {
                handleReaction(selectedMessageId, emoji);
                setShowReactionPicker(false);
              }}
            >
              {emoji}
            </Box>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
};

export default ChatApp;
