import { createContext, useContext, useState, useEffect } from 'react';
import { users, tasks } from '../services/api';
import io from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          if (userData && userData.token) {
            // Only fetch profile if we have a token
            try {
              const response = await users.getProfile();
              const updatedUser = {
                ...response.data,
                token: userData.token,
                permissions: userData.permissions // Ensure permissions are preserved
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Only logout on 401 errors
              if (error.response?.status === 401) {
                handleLogout();
              } else {
                // For other errors, just use stored user data
                setUser(userData);
              }
            }
          } else {
            // If no token, clear storage
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user?.token) {
      try {
        // Use Vite's environment variable syntax
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        
        const newSocket = io(socketUrl, {
          auth: { token: user.token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
          console.log('Socket connected');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        newSocket.on('userOnline', (userId) => {
          setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('userOffline', (userId) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        setSocket(newSocket);

        return () => {
          if (newSocket) {
            newSocket.close();
          }
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const logout = () => {
    handleLogout();
    window.location.href = '/login';
  };

  const login = async (data) => {
    try {
      if (!data || !data.user || !data.token) {
        throw new Error('Invalid login data');
      }

      const userData = {
        ...data.user,
        token: data.token
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      setError(null);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const updateUser = (updatedUser) => {
    try {
      if (!user) return;

      const userData = {
        ...user,
        ...updatedUser,
        token: user.token // Preserve token
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user data');
    }
  };

  // Role-based permission checks with null safety
  const isCompanyAdmin = () => {
    return user?.role === 'company_admin';
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  const isEmployee = () => {
    return user?.role === 'employee';
  };

  // Task-related permissions with proper checks
  const canCreateTask = () => {
    if (!user) return false;
    return isEmployee() || isCompanyAdmin();
  };

  const canAssignTasks = () => {
    if (!user || !user.hierarchyLevel) return false;
    return isCompanyAdmin() || user.hierarchyLevel.canAssignTasks;
  };

  const canManageEmployees = () => {
    if (!user) return false;
    return isCompanyAdmin();
  };

  const canManageHierarchy = () => {
    if (!user) return false;
    return isCompanyAdmin();
  };

  const getPermissionLevel = () => {
    if (!user) return 0;
    if (isSuperAdmin()) return 3;
    if (isCompanyAdmin()) return 2;
    if (isEmployee()) return 1;
    return 0;
  };

  // Fetch tasks created by the logged-in user
  const getMyTasks = async () => {
    try {
      const response = await tasks.getMyTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching my tasks:', error);
      throw error;
    }
  };

  // Fetch tasks assigned to the logged-in user
  const getAssignedTasks = async () => {
    try {
      const response = await tasks.getAssignedTasks();
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    login,
    logout,
    updateUser,
    loading,
    error,
    // Role checks
    isCompanyAdmin,
    isSuperAdmin,
    isEmployee,
    // Permission checks
    canCreateTask,
    canAssignTasks,
    canManageEmployees,
    canManageHierarchy,
    getPermissionLevel,
    // Task fetching
    getMyTasks,
    getAssignedTasks,
    socket,
    onlineUsers,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;