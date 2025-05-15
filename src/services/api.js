import axios from 'axios';
// import { getAssignedTasks } from '../../../backend/controllers/task.controller';

// Create two axios instances - one for API calls and one for file uploads
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/`,
  headers: {
    'Content-Type': 'application/json'
  }
});

const fileApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to both instances
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
fileApi.interceptors.request.use(addAuthToken);

// Response interceptor for handling errors (for both instances)
const handleError = (error) => {
  console.error('API Error:', error.response?.data || error.message || error);
  
  // Handle network errors
  if (!error.response) {
    return Promise.reject(new Error('Network error - please check your connection'));
  }

  // Handle specific error codes
  switch (error.response.status) {
    case 401:
      // Handle unauthorized - maybe redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      // Handle forbidden
      console.error('Forbidden access:', error.response.data);
      break;
    case 500:
      // Handle server errors
      console.error('Server error:', error.response.data);
      break;
    default:
      console.error('An error occurred:', error.response.status, error.response.data);
  }

  return Promise.reject(error);
};

api.interceptors.response.use(response => response, handleError);
fileApi.interceptors.response.use(response => response, handleError);

// Auth Routes
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// User Routes
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.patch('/users/profile/password', data),
  getEmployees: () => api.get('/users/employees'),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  uploadAvatar: (formData) => api.patch('/users/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformResponse: [(data) => {
      // Transform the response to ensure avatar URL is correct
      const parsed = JSON.parse(data);
      if (parsed.avatar) {
        parsed.avatar = parsed.avatar; // Keep the relative path
      }
      return parsed;
    }],
  }),
  deleteUser: (id) => api.delete(`/users/employees/${id}`),
  getUserById: (id) => api.get(`/users/${id}`),
  addEmployee: (data) => api.post('/users/add-employee', data),
  getEmployees: () => api.get('/users/employees'),
  updateEmployee: (id, data) => api.patch(`/users/employees/${id}`, data),
  getMyTeam: () => api.get('/users/my-team'),
  getMyStats: () => api.get('/users/my-stats'),
  getCompanyUsers: () => api.get('/users/company-users'),
};

// Company Routes
export const companies = {
  create: (data) => api.post('/companies', data),
  createWithAdmin: (data) => api.post('/companies/with-admin', data),
  getAll: () => api.get('/companies'),
  getOne: (id) => api.get(`/companies/${id}`),
  getStats: () => api.get('/companies/stats'),
  updateCompany: (id, data) => api.patch(`/companies/${id}`, data),
};

// Task Routes
export const tasks = {
  create: (formData) => fileApi.post('/tasks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getMyStats: () => api.get('/tasks/my-stats'),
  updateStatus: async (taskId, status) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },
  addComment: (id, content) => api.post(`/tasks/${id}/comments`, { content }),
  getByHierarchy: () => api.get('/tasks/hierarchy'),
  getTimeline: (params) => api.get('/tasks/timeline', { params }),
  getAnalytics: () => api.get('/tasks/analytics'),
  uploadAttachment: (taskId, formData) => fileApi.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getTasksByDepartment: (dept) => api.get(`/tasks/department/${dept}`),
  getAssignedTasks: () => api.get('/tasks/assigned-tasks'),
  getMyTasksCreatedBy: () => api.get('/tasks/my-tasks-createdby'),
  patchAddComment: (id, content) => api.patch(`/tasks/${id}/comments`, { content }),
};

// Hierarchy Routes
export const hierarchy = {
  create: (data) => api.post('/hierarchy', data),
  getAll: () => api.get('/hierarchy'),
  update: (id, data) => api.put(`/hierarchy/${id}`, data),
  addEmployee: (data) => api.post('/hierarchy/add-employee', data),
};

// Notification Routes
export const notifications = {
  getAll: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit, unread: false }
      });
      return {
        data: response.data.notifications || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  clearAllRead: async () => {
    try {
      await api.delete('/notifications/clear-all');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
};

// Chat Routes
export const chats = {
  // Create a new direct chat
  createDirectChat: (userId) => 
    api.post('/chats/direct', { userId }),
  
  // Create a new group chat
  createGroupChat: (name, participants, description) => 
    api.post('/chats/group', { name, participants, description }),
  
  // Get all user's chats
  getUserChats: () => 
    api.get('/chats/user/chats'),
  
  // Get a specific chat by ID
  getChatById: (chatId) => 
    api.get(`/chats/${chatId}`),
  
  // Get messages for a chat with pagination
  getMessages: (chatId, page = 1, limit = 50) => 
    api.get(`/chats/${chatId}/messages`, { 
      params: { page, limit }
    }).catch(error => {
      console.error('Error fetching messages:', error.response?.data || error);
      if (error.response?.status === 500) {
        throw new Error('Failed to load messages. Please try again.');
      }
      throw error;
    }),
  
  // Mark all messages in a chat as read
  markMessagesAsRead: (chatId) => 
    api.post(`/chats/${chatId}/read`),
  
  // Send a text message
  sendMessage: (chatId, messageData) => 
    api.post(`/chats/${chatId}/messages`, messageData)
      .catch(error => {
        console.error('API Error in sendMessage:', error.response?.data || error);
        if (error.response?.status === 403) {
          throw new Error('You cannot send messages to this chat');
        }
        if (error.response?.status === 500) {
          throw new Error('Failed to send message. Please try again.');
        }
        throw error;
      }),
  
  // Send a message with files
  sendMessageWithFiles: (chatId, formData) => 
    fileApi.post(`/chats/${chatId}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (formData.onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          formData.onProgress(percentCompleted);
        }
      }
    }),
  
  // Download attachment
  downloadAttachment: (fileUrl) => 
    fileApi.get(fileUrl, {
      responseType: 'blob'
    }),
  
  // Add reaction to a message
  addReaction: (chatId, messageId, emoji) => 
    api.post(`/chats/${chatId}/messages/${messageId}/reactions`, { emoji }),
  
  // Remove reaction from a message
  removeReaction: (chatId, messageId) => 
    api.delete(`/chats/${chatId}/messages/${messageId}/reactions`),
  
  // Delete a message (with option to delete for everyone)
  deleteMessage: (chatId, messageId, forEveryone = false) => 
    api.delete(`/chats/${chatId}/messages/${messageId}`, { 
      params: { forEveryone }
    }),
  
  // Forward a message to another chat
  forwardMessage: (sourceMessageId, targetChatId) => 
    api.post(`/chats/messages/${sourceMessageId}/forward`, { targetChatId }),
  
  // Search messages across all chats
  searchMessages: (query) => 
    api.get(`/chats/search/messages`, { params: { query } }),
  
  // Update group chat info (name, description)
  updateGroupChat: (chatId, data) => 
    api.patch(`/chats/${chatId}`, data),
  
  // Add participants to a group chat
  addParticipants: (chatId, participants) => 
    api.post(`/chats/${chatId}/participants`, { participants })
};

// Meeting Routes
export const meetings = {
  // Create a new meeting
  createMeeting: (data) => api.post('/meetings', data),
  
  // Get active meetings for the current user
  getUserMeetings: () => api.get('/meetings/user-meetings'),
  
  // Get company users for meeting invitation
  getCompanyUsers: () => api.get('/meetings/company-users'),
  
  // Join a meeting
  joinMeeting: (code) => api.post(`/meetings/${code}/join`),
  
  // Leave a meeting
  leaveMeeting: (code) => api.post(`/meetings/${code}/leave`),
  
  // End a meeting (only creator can end)
  endMeeting: (code) => api.post(`/meetings/${code}/end`),
  
  // Get meeting details
  getMeetingDetails: (code) => api.get(`/meetings/${code}`),
  
  // Check if a meeting exists and is active
  checkMeetingExists: async (code) => {
    try {
      const response = await api.get(`/meetings/${code}`);
      return response.data && response.data.active;
    } catch (error) {
      return false;
    }
  }
};

// Export all API functions
export default api;