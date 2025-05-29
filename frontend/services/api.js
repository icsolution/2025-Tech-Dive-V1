import config from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = config.API_URL;

// Helper function to get auth token
export const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('token');
  console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
  return token;
};

// Helper function to handle API responses
export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log('API Success Response:', data);
  return data;
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('Making login request to:', `${API_URL}/auth/login`);
      console.log('Login credentials:', JSON.stringify(credentials, null, 2));
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful response:', data);
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Making getCurrentUser request with token');
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('getCurrentUser error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || 'Failed to get user data');
      }
      
      const data = await response.json();
      console.log('getCurrentUser successful response:', data);
      return data;
    } catch (error) {
      console.error('getCurrentUser API error (raw):', error);
      console.error('getCurrentUser API error (message):', error.message);
      console.error('getCurrentUser API error (stack):', error.stack);
      console.error('getCurrentUser API error (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('=== getUserById API Call ===');
      console.log('Making request to:', `${API_URL}/auth/user/${userId}`);
      console.log('With token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_URL}/auth/user/${userId}`, {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('getUserById error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || 'Failed to get user data');
      }
      
      const data = await response.json();
      console.log('getUserById successful response:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('getUserById API error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  },
};

// Pins API
export const pinsAPI = {
  getAllPins: async (page = 1, limit = 20) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(
      `${API_URL}/pins?page=${page}&limit=${limit}`,
      {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      }
    );
    return handleResponse(response);
  },

  getPinById: async (pinId) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/pins/${pinId}`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },

  createPin: async (pinData) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('Creating pin with data:', JSON.stringify(pinData, null, 2));
    console.log('User ID type:', typeof pinData.user);
    console.log('User ID value:', pinData.user);
    
    const response = await fetch(`${API_URL}/pins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Accept': 'application/json'
      },
      body: JSON.stringify(pinData),
    });
    return handleResponse(response);
  },
};

// Boards API
export const boardsAPI = {
  getAllBoards: async (page = 1, limit = 20) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(
      `${API_URL}/boards?page=${page}&limit=${limit}`,
      {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      }
    );
    return handleResponse(response);
  },

  getBoardById: async (boardId) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },

  createBoard: async (boardData) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Accept': 'application/json'
      },
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  updateBoard: async (boardId, boardData) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Accept': 'application/json'
      },
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  deleteBoard: async (boardId) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },

  getBoardsByUserId: async (userId) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_URL}/boards/user/${userId}`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Feed API
export const feedAPI = {
  getFeed: async (page = 1, limit = 10) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(
      `${API_URL}/feed?page=${page}&limit=${limit}`,
      {
        headers: {
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      }
    );
    return handleResponse(response);
  },
};

// Search API
export const searchAPI = {
  search: async (query) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/search?q=${query}`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Comments API
export const commentsAPI = {
  addComment: async (pinId, text) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/pins/${pinId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },
};

// User API
export const userAPI = {
  getUserProfile: async (userId) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async () => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/analytics`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Settings API
export const settingsAPI = {
  getSettings: async () => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/settings`, {
      headers: {
        'x-auth-token': token,
        'Accept': 'application/json'
      },
    });
    return handleResponse(response);
  },
};

// Export all APIs as a single object
export default {
  getAuthToken,
  handleResponse,
  authAPI,
  pinsAPI,
  boardsAPI,
  feedAPI,
  searchAPI,
  commentsAPI,
  userAPI,
  notificationsAPI,
  analyticsAPI,
  settingsAPI,
};