import React, { useState, useRef } from 'react';
import { 
  Box, IconButton, TextField, InputAdornment,
  CircularProgress 
} from '@mui/material';
import { 
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { sendMessageWithAttachments, chats } from '../../utils/chatUtils';

const ChatInput = ({ chatId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleSend = async () => {
    if ((!message.trim() && !files.length) || isUploading) return;

    try {
      setIsUploading(true);
      const response = await sendMessageWithAttachments(chatId, { content: message }, files);
      setMessage('');
      setFiles([]);
      onMessageSent(response);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event) => {
    try {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      const formData = new FormData();
      
      // Add content first
      formData.append('content', '');

      // Add files with the correct field name 'attachments'
      files.forEach(file => {
        // Validate file size
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
        }
        formData.append('attachments', file);
      });

      // Send the message with files
      const response = await chats.sendMessageWithFiles(chatId, formData);
      
      // Handle success
      if (response.data) {
        onMessageSent?.(response.data);
      }

      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error sending files:', error);
      // Add appropriate error notification here
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
      {files.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.200'
                  }}
                >
                  <AttachFileIcon />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <IconButton onClick={() => fileInputRef.current.click()}>
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ mx: 1 }}
        />
        <IconButton 
          onClick={handleSend}
          disabled={(!message.trim() && !files.length) || isUploading}
        >
          {isUploading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput; 