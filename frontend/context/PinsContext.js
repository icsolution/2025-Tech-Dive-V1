import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

// Create the context
const PinsContext = createContext();

// Create a provider component
export const PinsProvider = ({ children }) => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pins from the backend API
  const fetchPins = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/pins`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pins');
      }
      
      const data = await response.json();
      console.log('Fetched pins from API:', data.length);
      
      // Process pins to ensure they have all required fields
      const processedPins = data.map(pin => ({
        ...pin,
        likes: pin.likes || [],
        saves: pin.saves || [],
        comments: pin.comments || [],
        tags: pin.tags || [],
        analytics: {
          views: pin.views || 0,
          saves: pin.saves?.length || 0,
          clicks: pin.clicks || 0,
          viewDuration: pin.viewDuration || 0
        }
      }));
      
      setPins(processedPins);
      setError(null);
    } catch (error) {
      console.error('Error fetching pins:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize pins from the API
  useEffect(() => {
    fetchPins();
  }, []);

  // Get a pin by ID
  const getPinById = async (pinId) => {
    try {
      // First check if we have it in local state
      const localPin = pins.find(pin => pin._id === pinId);
      if (localPin) return localPin;
      
      // If not, fetch from API
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/pins/${pinId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pin');
      }
      
      const pin = await response.json();
      return pin;
    } catch (error) {
      console.error('Error fetching pin by ID:', error);
      return null;
    }
  };

  // Update a pin locally and on the server
  const updatePin = async (updatedPin) => {
    try {
      // Update locally first for immediate UI feedback
      setPins(prevPins => 
        prevPins.map(pin => 
          pin._id === updatedPin._id ? updatedPin : pin
        )
      );
      
      // Then update on the server
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/pins/${updatedPin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updatedPin)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update pin');
      }
      
      const serverUpdatedPin = await response.json();
      return serverUpdatedPin;
    } catch (error) {
      console.error('Error updating pin:', error);
      return updatedPin; // Return the local version as fallback
    }
  };

  // Toggle like on a pin
  const toggleLike = async (pinId, userId) => {
    try {
      console.log('Toggling like for pin:', pinId, 'by user:', userId);
      
      // Validate inputs
      if (!pinId || !userId) {
        console.error('Invalid pinId or userId:', { pinId, userId });
        return null;
      }

      const pin = pins.find(pin => pin._id === pinId);
      if (!pin) {
        console.error('Pin not found with ID:', pinId);
        return null;
      }

      // Ensure likes is an array
      const pinLikes = Array.isArray(pin.likes) ? pin.likes : [];
      const isLiked = pinLikes.includes(userId);
      
      console.log('Current like status:', isLiked ? 'Liked' : 'Not liked');
      
      // Update locally first for immediate UI feedback
      const updatedLikes = isLiked
        ? pinLikes.filter(id => id !== userId)
        : [...pinLikes, userId];
      
      const updatedPin = {
        ...pin,
        likes: updatedLikes
      };
      
      setPins(prevPins => 
        prevPins.map(p => p._id === pinId ? updatedPin : p)
      );
      
      // Then update on the server
      const token = await AsyncStorage.getItem('token');
      
      // Connect to the updated backend API
      const response = await fetch(`${config.API_URL}/pins/${pinId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          userId, 
          action: isLiked ? 'unlike' : 'like' 
        })
      });
      
      if (!response.ok) {
        // Revert local state if server update fails
        setPins(prevPins => 
          prevPins.map(p => p._id === pinId ? pin : p)
        );
        throw new Error(`Failed to update like status: ${response.status}`);
      }
      
      const serverUpdatedPin = await response.json();
      return serverUpdatedPin;
    } catch (error) {
      console.error('Error toggling like:', error);
      // Return the locally updated pin as fallback if server update fails
      // Make sure updatedPin is defined before returning it
      return updatedPin || null;
    }
  };

  // Toggle save on a pin
  const toggleSave = async (pinId, userId) => {
    try {
      console.log('Toggling save for pin:', pinId, 'by user:', userId);
      
      // Validate inputs
      if (!pinId || !userId) {
        console.error('Invalid pinId or userId:', { pinId, userId });
        return null;
      }

      const pin = pins.find(pin => pin._id === pinId);
      if (!pin) {
        console.error('Pin not found with ID:', pinId);
        return null;
      }

      // Ensure saves is an array
      const pinSaves = Array.isArray(pin.saves) ? pin.saves : [];
      const isSaved = pinSaves.includes(userId);
      
      console.log('Current save status:', isSaved ? 'Saved' : 'Not saved');
      
      // Update locally first for immediate UI feedback
      const updatedSaves = isSaved
        ? pinSaves.filter(id => id !== userId)
        : [...pinSaves, userId];
      
      const updatedPin = {
        ...pin,
        saves: updatedSaves
      };
      
      setPins(prevPins => 
        prevPins.map(p => p._id === pinId ? updatedPin : p)
      );
      
      // Then update on the server
      const token = await AsyncStorage.getItem('token');
      
      // Connect to the updated backend API
      const response = await fetch(`${config.API_URL}/pins/${pinId}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          userId, 
          action: isSaved ? 'unsave' : 'save' 
        })
      });
      
      if (!response.ok) {
        // Revert local state if server update fails
        setPins(prevPins => 
          prevPins.map(p => p._id === pinId ? pin : p)
        );
        throw new Error(`Failed to update save status: ${response.status}`);
      }
      
      const serverUpdatedPin = await response.json();
      return serverUpdatedPin;
    } catch (error) {
      console.error('Error toggling save:', error);
      // Return the locally updated pin as fallback if server update fails
      // Make sure updatedPin is defined before returning it
      return updatedPin || null;
    }
  };

  // Add a comment to a pin
  const addComment = async (pinId, commentText, userId) => {
    try {
      const pin = pins.find(pin => pin._id === pinId);
      if (!pin) return null;
      
      // Create new comment object
      const newComment = {
        text: commentText,
        user: userId,
        createdAt: new Date().toISOString()
      };
      
      // Update locally first for immediate UI feedback
      const updatedComments = [...(pin.comments || []), newComment];
      const updatedPin = {
        ...pin,
        comments: updatedComments
      };
      
      setPins(prevPins => 
        prevPins.map(p => p._id === pinId ? updatedPin : p)
      );
      
      // Then update on the server
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/pins/${pinId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ text: commentText })
      });
      
      if (!response.ok) {
        // Revert local state if server update fails
        setPins(prevPins => 
          prevPins.map(p => p._id === pinId ? pin : p)
        );
        throw new Error('Failed to add comment');
      }
      
      const serverUpdatedPin = await response.json();
      return serverUpdatedPin;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  };

  // Check if a pin is liked by a user
  const isPinLikedByUser = (pinId, userId) => {
    const pin = pins.find(pin => pin._id === pinId);
    return pin ? pin.likes.includes(userId) : false;
  };

  // Check if a pin is saved by a user
  const isPinSavedByUser = (pinId, userId) => {
    const pin = pins.find(pin => pin._id === pinId);
    return pin ? pin.saves.includes(userId) : false;
  };

  // Value to be provided to consumers
  const value = {
    pins,
    loading,
    error,
    fetchPins,
    getPinById,
    updatePin,
    toggleLike,
    toggleSave,
    addComment,
    isPinLikedByUser,
    isPinSavedByUser
  };

  return (
    <PinsContext.Provider value={value}>
      {children}
    </PinsContext.Provider>
  );
};

// Custom hook to use the pins context
export const usePins = () => {
  const context = useContext(PinsContext);
  if (context === undefined) {
    throw new Error('usePins must be used within a PinsProvider');
  }
  return context;
};
