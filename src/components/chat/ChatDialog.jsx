import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Badge,
  LinearProgress,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Send as SendIcon, 
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Download as DownloadIcon,
  Person as PersonIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { chats } from '../../services/api';
import { useAuth } from '../../Context/AuthContext';
import { getSocket, initializeSocket, emitTyping, emitStopTyping } from '../../utils/socket';
import EmojiPicker from 'emoji-picker-react';
import {
  loadChatMessages,
  markMessagesAsRead,
  sendMessage,
  sendMessageWithAttachments,
  updateMessageDisplay,
  getChatParticipants
} from '../../utils/chatUtils';

const ChatDialog = ({ open, onClose, task }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (user?.token) {
      const socketInstance = initializeSocket(user.token);
      setSocket(socketInstance);
    }
  }, [user]);

  useEffect(() => {
    if (task) {
      const isAssignedTo = task.assignedTo === user.id;
      setRecipientName(isAssignedTo ? task.assignedByName : task.assignedToName);
    }
  }, [task, user.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (task && open && socket) {
      initializeChat();
    }
    return () => {
      if (chatId && socket) {
        socket.emit('leaveChat', chatId);
      }
    };
  }, [task, open, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', ({ message }) => {
        if (currentChat) {
          const updatedMessages = updateMessageDisplay([message], currentChat);
          setMessages(prev => [...prev, updatedMessages[0]]);
          scrollToBottom();
          markMessagesAsRead(chatId);
        }
      });

      socket.on('userTyping', ({ userId, chatId: activeChatId }) => {
        if (chatId === activeChatId) {
          setTypingUsers(prev => new Set([...prev, userId]));
        }
      });

      socket.on('userStoppedTyping', ({ userId, chatId: activeChatId }) => {
        if (chatId === activeChatId) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      });

      return () => {
        socket.off('newMessage');
        socket.off('userTyping');
        socket.off('userStoppedTyping');
      };
    }
  }, [socket, chatId, currentChat]);

  const initializeChat = async () => {
    try {
      if (!task?._id || !task?.assignedTo || !task?.assignedBy) {
        console.error('Missing required task data:', task);
        return;
      }

      const response = await chats.initializeChat(task._id, {
        assignedTo: task.assignedTo,
        assignedBy: task.assignedBy
      });

      if (response.data) {
        const chat = response.data;
        setChatId(chat._id);
        setCurrentChat(chat);
        
        const { receiver } = getChatParticipants(chat, user.id);
        if (receiver) {
          setRecipientName(receiver.name);
        }
        
        await loadInitialMessages(chat._id);
        if (socket) {
          socket.emit('joinChat', chat._id);
        }
        
        if (typeof window.refreshWhatsAppChats === 'function') {
          window.refreshWhatsAppChats();
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const loadInitialMessages = async (chatId) => {
    setLoading(true);
    try {
      const { messages: newMessages, hasMore } = await loadChatMessages(chatId, 1, true);
      const updatedMessages = updateMessageDisplay(newMessages, currentChat);
      setMessages(updatedMessages);
      setHasMore(hasMore);
      setPage(1);
      scrollToBottom();
      await markMessagesAsRead(chatId);
    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const { messages: newMessages, hasMore: moreAvailable } = await loadChatMessages(chatId, page + 1);
      const updatedMessages = updateMessageDisplay(newMessages, currentChat);
      setMessages(prev => [...updatedMessages, ...prev]);
      setHasMore(moreAvailable);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && chatId) {
      if (typingTimeout) clearTimeout(typingTimeout);
      
      emitTyping(chatId, user.id);
      
      const timeout = setTimeout(() => {
        emitStopTyping(chatId, user.id);
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const messageData = {
        content: newMessage.trim()
      };
      
      const sentMessage = await sendMessage(chatId, messageData);
      const updatedMessages = updateMessageDisplay([sentMessage], currentChat);
      setMessages(prev => [...prev, updatedMessages[0]]);
      setNewMessage('');
      scrollToBottom();
      
      if (socket) {
        socket.emit('sendMessage', {
          chatId,
          message: sentMessage
        });
      }
      
      if (typeof window.refreshWhatsAppChats === 'function') {
        window.refreshWhatsAppChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    if (newMessage.trim()) {
      formData.append('content', newMessage.trim());
    } else {
      formData.append('content', ''); // Send empty string if no message
    }

    try {
      setUploadProgress(0);
      const response = await chats.sendMessageWithFiles(chatId, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setUploadProgress(0);
      scrollToBottom();
      
      // Reload the chat list in WhatsAppClone
      if (typeof window.refreshWhatsAppChats === 'function') {
        window.refreshWhatsAppChats();
      }
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleDownloadAttachment = async (fileUrl, fileName) => {
    try {
      const response = await chats.downloadAttachment(fileUrl);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Add a global function to reload chats that can be called from WhatsAppClone
  useEffect(() => {
    // Define a global function to reload chats
    window.reloadChatList = () => {
      if (typeof window.refreshWhatsAppChats === 'function') {
        window.refreshWhatsAppChats();
      }
    };

    return () => {
      // Clean up the global function when component unmounts
      delete window.reloadChatList;
    };
  }, []);

  // Add a function to get sender name
  const getSenderName = (message) => {
    if (!message || !message.sender) return 'Unknown';
    
    // If sender is an object with name property
    if (typeof message.sender === 'object' && message.sender.name) {
      return message.sender.name;
    }
    
    // If message sender ID matches current user ID
    if (message.sender === user.id) {
      return user.name || 'You';
    }
    
    // Default to recipient name if we can't determine
    return recipientName || 'Unknown';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.dark' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {recipientName}
            </Typography>
            <Typography variant="caption">
              {task?.title}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          bgcolor: 'background.chat'
        }}
      >
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={20} />
          </Box>
        )}
        
        {hasMore && (
          <Button onClick={() => loadMoreMessages()}>Load More</Button>
        )}

        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 2
          }}
        >
          {messages.map((message, index) => {
            const isUserMessage = message.sender === user.id || 
                                  (typeof message.sender === 'object' && message.sender._id === user.id);
            const senderName = getSenderName(message);
            
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: isUserMessage ? 'primary.main' : 'background.paper',
                    color: isUserMessage ? 'white' : 'text.primary',
                    borderRadius: 2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 8,
                      [isUserMessage ? 'right' : 'left']: -6,
                      width: 0,
                      height: 0,
                      borderStyle: 'solid',
                      borderWidth: '6px 6px 6px 0',
                      borderColor: `transparent ${isUserMessage ? theme.palette.primary.main : theme.palette.background.paper} transparent transparent`,
                      transform: isUserMessage ? 'rotate(180deg)' : 'none'
                    }
                  }}
                >
                  {/* Show sender name for non-user messages */}
                  {!isUserMessage && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {senderName}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                  
                  {message.attachments?.map((attachment, i) => (
                    <Box key={i} mt={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadAttachment(attachment.fileUrl, attachment.fileName)}
                        sx={{ color: 'inherit' }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" component="span" ml={1}>
                        {attachment.fileName}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 0.5,
                      opacity: 0.8,
                      textAlign: isUserMessage ? 'right' : 'left'
                    }}
                  >
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {typingUsers.size > 0 && (
          <Typography variant="caption" sx={{ ml: 2, mb: 1 }}>
            {Array.from(typingUsers).join(', ')} typing...
          </Typography>
        )}

        {uploadProgress > 0 && (
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {showEmojiPicker && (
          <Box position="absolute" bottom="100px" right="20px" zIndex={1}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            mt: 'auto'
          }}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          
          <IconButton 
            size="small"
            className="chat-action"
            onClick={() => fileInputRef.current.click()}
          >
            <AttachFileIcon />
          </IconButton>

          <IconButton 
            size="small"
            className="chat-action"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <EmojiIcon />
          </IconButton>

          <TextField
            fullWidth
            size="small"
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            variant="outlined"
          />
          
          <IconButton 
            type="submit" 
            color="primary"
            className="chat-action"
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;