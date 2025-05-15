// ChatMessage.jsx - A reusable component for rendering individual chat messages
// This component handles the display of messages from your MongoDB data structure
import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Avatar, Paper } from '@mui/material';
import { MoreVert, Reply, Edit, Delete, Done as CheckIcon, DoneAll as DoubleCheckIcon, Download as DownloadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { getMessageParticipantNames } from '../../utils/chatUtils';

/**
 * ChatMessage Component
 * 
 * Renders an individual message with appropriate styling, read receipts, and reactions
 * 
 * @param {Object} message - The message object from MongoDB (e.g., one item from the messages array)
 * @param {boolean} isUserMessage - Whether this message is from the current user
 * @param {boolean} showActions - Whether to show action buttons (reply, edit, delete)
 * @param {Function} onReply - Callback for reply action
 * @param {Function} onEdit - Callback for edit action
 * @param {Function} onDelete - Callback for delete action
 * @param {string} chatId - The ID of the chat
 * @param {Function} getMessageParticipantNames - Function to get participant names
 * @param {Function} onLongPress - Callback for long press (used for reactions)
 * @param {boolean} showReactions - Whether to show message reactions
 */
const ChatMessage = ({ 
  message, 
  isUserMessage, // true for current user's messages (right side)
  showActions, 
  onReply, 
  onEdit, 
  onDelete,
  chat,
  onLongPress,
  showReactions = true
}) => {
  // State for the message actions menu (three dots menu)
  const [anchorEl, setAnchorEl] = useState(null);
  const [senderName, setSenderName] = useState('');
  
  // Check if message is deleted based on isDeleted flag in MongoDB
  // In your data: "isDeleted": false for both messages
  const isDeleted = message.isDeleted;

  useEffect(() => {
    if (chat && message) {
      // Only get and set sender name for messages from other users (not current user)
      if (!isUserMessage) {
        const { senderName: name } = getMessageParticipantNames(chat, message.sender);
        setSenderName(name);
        console.log(`sender name: ${name}`);
      }
    }
  }, [chat, message, isUserMessage]);

  // Handlers for the message actions menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadAttachment = (fileUrl, fileName) => {
    window.open(`${import.meta.env.VITE_API_URL}/${fileUrl}`, '_blank');
  };

  const renderAttachmentPreview = (attachment) => {
    const isImage = attachment.fileType.startsWith('image/');
    const isVideo = attachment.fileType.startsWith('video/');
    const isAudio = attachment.fileType.startsWith('audio/');

    if (isImage) {
      return (
        <Box
          sx={{
            position: 'relative',
            maxWidth: 250,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9
            }
          }}
          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${attachment.fileUrl}`, '_blank')}
        >
          <img
            src={`${import.meta.env.VITE_API_URL}/${attachment.fileUrl}`}
            alt={attachment.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 8,
              objectFit: 'cover'
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {attachment.fileName}
          </Typography>
        </Box>
      );
    }

    if (isVideo) {
      return (
        <Box sx={{ maxWidth: 250 }}>
          <video
            controls
            style={{
              maxWidth: '100%',
              borderRadius: 8
            }}
          >
            <source src={`${import.meta.env.VITE_API_URL}/${attachment.fileUrl}`} type={attachment.fileType} />
            Your browser does not support the video tag.
          </video>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {attachment.fileName}
          </Typography>
        </Box>
      );
    }

    if (isAudio) {
      return (
        <Box sx={{ maxWidth: 250 }}>
          <audio
            controls
            style={{ width: '100%' }}
          >
            <source src={`${import.meta.env.VITE_API_URL}/${attachment.fileUrl}`} type={attachment.fileType} />
            Your browser does not support the audio tag.
          </audio>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            {attachment.fileName}
          </Typography>
        </Box>
      );
    }

    // Default file attachment preview
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: 1,
          maxWidth: 250,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.08)'
          }
        }}
        onClick={() => handleDownloadAttachment(attachment.fileUrl, attachment.fileName)}
      >
        <FileIcon sx={{ mr: 1 }} />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" noWrap>
            {attachment.fileName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatFileSize(attachment.fileSize)}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ ml: 'auto' }}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Box
      key={message._id} // Using MongoDB's _id as the key (e.g., "67cc7a2afa89a139f29be784")
      sx={{
        display: 'flex',
        // Position messages from current user on right, others on left
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          maxWidth: '70%',
          // Different background colors for user vs other messages
          // For your data: vivek's messages would be green, Deepika's white
          backgroundColor: isUserMessage ? '#dcf8c6' : '#fff',
          borderRadius: 2,
          position: 'relative',
          // Speech bubble arrow styling
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            [isUserMessage ? 'right' : 'left']: -10,
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '0px solid transparent',
            borderRight: isUserMessage ? 'none' : '10px solid #fff',
            borderLeft: isUserMessage ? '10px solid #dcf8c6' : 'none',
          }
        }}
        // Context menu (right-click) handler for reactions
        onContextMenu={(e) => {
          e.preventDefault();
          onLongPress(message._id); // Pass MongoDB _id to reaction handler
        }}
        // Long press handler for mobile devices
        onTouchStart={(e) => {
          const touchDuration = 500;
          const timer = setTimeout(() => {
            onLongPress(message._id); // Pass MongoDB _id to reaction handler
          }, touchDuration);
          
          e.currentTarget.addEventListener('touchend', () => {
            clearTimeout(timer);
          }, { once: true });
        }}
      >
        {/* Only show sender name for messages from others (not the current user) */}
        {!isUserMessage && senderName && (
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontWeight: 'bold', mb: 0.5 }}>
            {senderName}
          </Typography>
        )}
        
        {/* Handle deleted messages */}
        {/* In your data: No messages are deleted (isDeleted: false) */}
        {isDeleted ? (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            This message was deleted
          </Typography>
        ) : (
          <>
            {/* Display message content */}
            {/* For your data: "hello" and "hi" */}
            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
              {message.content}
            </Typography>
            
            {/* Render attachments */}
            {message.attachments?.length > 0 && (
              <Box sx={{ mt: message.content ? 2 : 0 }}>
                {message.attachments.map((attachment, index) => (
                  <Box key={index} sx={{ mb: index !== message.attachments.length - 1 ? 2 : 0 }}>
                    {renderAttachmentPreview(attachment)}
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
        
        {/* Display message reactions */}
        {/* For your data: Both messages have empty reactions arrays */}
        {showReactions && message.reactions && message.reactions.length > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 0.5,
              mt: 1,
              p: 0.5,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 1
            }}
          >
            {message.reactions.map((reaction, i) => (
              <Box 
                key={i}
                sx={{ 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  // Highlight the current user's reactions
                  backgroundColor: reaction.isUserReaction ? 'rgba(0,0,0,0.1)' : 'transparent',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                  }
                }}
              >
                {reaction.emoji}
              </Box>
            ))}
          </Box>
        )}
        
        {/* Message timestamp and read receipts */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            alignItems: 'center',
            mt: 0.5,
            opacity: 0.7
          }}
        >
          {/* Format and display message timestamp */}
          {/* For your data: Would show the time from createdAt (e.g., "12:34") */}
          <Typography 
            variant="caption" 
            sx={{ fontSize: '0.7rem', mr: 0.5 }}
          >
            {format(new Date(message.createdAt), 'HH:mm')}
          </Typography>
          
          {/* Show read receipts for user's messages */}
          {/* For your data: Both messages are from vivek and have been read by vivek */}
          {isUserMessage && (
            <>
              {/* Blue double check for read messages */}
              {message.readBy && message.readBy.length > 0 ? (
                <DoubleCheckIcon 
                  sx={{ 
                    fontSize: '0.8rem', 
                    color: '#4fc3f7' 
                  }} 
                />
              ) : message.deliveredTo && message.deliveredTo.length > 0 ? (
                <DoubleCheckIcon 
                  sx={{ 
                    fontSize: '0.8rem'
                  }} 
                />
              ) : (
                <CheckIcon 
                  sx={{ 
                    fontSize: '0.8rem'
                  }} 
                />
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default ChatMessage;