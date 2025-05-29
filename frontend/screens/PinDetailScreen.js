import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Share,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import ImageWithLoading from '../components/ImageWithLoading';
import {
  Text,
  Button,
  Surface,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Menu,
  Portal,
  Dialog,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
// Import auth context instead of dummy data
import { useAuth } from '../context/AuthContext';
import { usePins } from '../context/PinsContext';
import { useSettings } from '../context/SettingsContext';
import { isValidObjectId, formatObjectId } from '../utils/mongoUtils';
import config from '../config';

const { width } = Dimensions.get('window');

const PinDetailScreen = () => {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { pinId } = route.params;
  console.log('Pin ID from route params:', pinId);
  
  // Use the auth context to get the current user and auth state
  const { 
    user: currentUser, 
    loading: authLoading, 
    authInitialized,
    refreshAuth 
  } = useAuth();
  
  // Use the pins context
  const { 
    pins,
    getPinById, 
    toggleLike, 
    toggleSave, 
    isPinLikedByUser, 
    isPinSavedByUser, 
    addComment 
  } = usePins();
  
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const { settings } = useSettings();
  const { darkMode } = settings;

  // Check if currentUser and pin are available before accessing properties
  // Pin owner could be in either pin.user or pin.postedBy depending on API response format
  const isOwner = currentUser && pin && (
    (pin.user && currentUser._id === pin.user._id) || 
    (pin.user && typeof pin.user === 'string' && currentUser._id === pin.user) ||
    (pin.postedBy && currentUser._id === pin.postedBy._id)
  );
  
  // Log ownership status for debugging
  console.log('Pin ownership check:', { 
    currentUserId: currentUser?._id,
    pinUserId: pin?.user?._id || pin?.user,
    pinPostedById: pin?.postedBy?._id,
    isOwner
  });

  const handleDeletePin = () => {
    console.log('handleDeletePin function called');
    setDeleteConfirmationVisible(true);
    setMenuVisible(false);
  };

  const confirmDeletePin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Deleting pin with ID:', pinId);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${config.API_URL}/pins/${pinId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete pin' }));
        throw new Error(errorData.message);
      }

      // Show success message and close dialog
      Alert.alert('Success', 'Pin deleted successfully');
      setDeleteConfirmationVisible(false);
      
      // Navigate to Profile and set params to trigger a refresh
      navigation.navigate('Profile', { refresh: true });
    } catch (error) {
      console.error('Error deleting pin:', error);
      Alert.alert('Error', `Failed to delete pin: ${error.message}`);
      setDeleteConfirmationVisible(false);
    }
  };

  const fetchPinDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching pin details for ID:', pinId);
      
      // Validate pinId first
      if (!pinId || !isValidObjectId(pinId)) {
        console.error('Invalid pin ID format:', pinId);
        Alert.alert('Error', 'Invalid pin ID format');
        navigation.goBack();
        return;
      }
      
      // Find the pin in the context first if available
      const contextPin = pins.find(p => p._id === pinId);
      if (contextPin) {
        console.log('Found pin in context:', contextPin.title);
        // Ensure pin has all required properties with proper types
        const processedPin = {
          ...contextPin,
          likes: Array.isArray(contextPin.likes) ? contextPin.likes : [],
          saves: Array.isArray(contextPin.saves) ? contextPin.saves : [],
          comments: Array.isArray(contextPin.comments) ? contextPin.comments : [],
          tags: Array.isArray(contextPin.tags) ? contextPin.tags : []
        };
        
        setPin(processedPin);
        
        // Check if user is logged in before setting like/save status
        if (currentUser && currentUser._id) {
          const userId = formatObjectId(currentUser._id);
          if (userId) {
            setIsLiked(processedPin.likes.some(id => formatObjectId(id) === userId));
            setIsSaved(processedPin.saves.some(id => formatObjectId(id) === userId));
          }
        }
        
        setComments(contextPin.comments || []);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // If not in context, fetch from API
      console.log('Fetching pin from API:', pinId);
      
      try {
        // Get authentication token
        const token = await AsyncStorage.getItem('token');
        
        const response = await fetch(`${config.API_URL}/pins/${pinId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          
          throw new Error(`Failed to fetch pin: ${response.status}`);
        }
        
        const foundPin = await response.json();
        if (!foundPin) {
          throw new Error('Pin not found');
        }

        console.log('Found pin from API:', foundPin.title);
        
        // Ensure pin has all required properties with proper types
        const processedPin = {
          ...foundPin,
          likes: Array.isArray(foundPin.likes) ? foundPin.likes : [],
          saves: Array.isArray(foundPin.saves) ? foundPin.saves : [],
          comments: Array.isArray(foundPin.comments) ? foundPin.comments : [],
          tags: Array.isArray(foundPin.tags) ? foundPin.tags : []
        };
        
        setPin(processedPin);
        
        // Check if user is logged in before setting like/save status
        if (currentUser && currentUser._id) {
          const userId = formatObjectId(currentUser._id);
          if (userId) {
            setIsLiked(processedPin.likes.some(id => formatObjectId(id) === userId));
            setIsSaved(processedPin.saves.some(id => formatObjectId(id) === userId));
          }
        }
        
        setComments(foundPin.comments || []);
      } catch (apiError) {
        console.error('API fetch error:', apiError);
        throw apiError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error fetching pin details:', error);
      
      // Show appropriate error message based on the error
      let errorMessage = 'Failed to load pin details';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('Pin not found')) {
        errorMessage = 'This pin no longer exists.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Your session has expired. Please log in again.';
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId, currentUser, authInitialized]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Check if the action is going back
      if (e.data.action.type === 'GO_BACK') {
        // Dispatch the refreshProfile event to update ProfileScreen
        navigation.dispatch({
          type: 'NAVIGATE',
          payload: {
            name: 'refreshProfile',
          },
        });
        console.log('Dispatched refreshProfile event on navigation back');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPinDetails();
  };

  const handleLike = async () => {
    try {
      console.log('Starting handleLike with pinId:', pinId);
      
      // Validate pinId
      if (!pinId || !isValidObjectId(pinId)) {
        console.error('Invalid pinId format:', pinId);
        Alert.alert('Error', 'Cannot like: Invalid pin ID format');
        return;
      }
      
      // Check if user is authenticated
      if (authLoading) {
        console.log('Auth is still loading, waiting...');
        return; // Wait for auth to load
      }
      
      // Validate user is logged in
      if (!currentUser) {
        console.error('No current user found - not logged in');
        Alert.alert(
          'Authentication Required',
          'Please log in to like pins',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Log In', 
              onPress: () => navigation.navigate('Login') 
            }
          ]
        );
        return;
      }
      
      // Validate user ID exists
      if (!currentUser._id) {
        console.error('User is logged in but has no ID');
        Alert.alert('Error', 'User account is invalid. Please log out and log in again.');
        return;
      }
      
      // Format the user ID to ensure it's a valid ObjectId string
      const formattedUserId = formatObjectId(currentUser._id);
      if (!formattedUserId) {
        console.error('Invalid user ID format:', currentUser._id);
        Alert.alert(
          'Error',
          'Your user ID is in an invalid format. Please log out and log in again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Log Out', 
              onPress: async () => {
                try {
                  await AsyncStorage.removeItem('token');
                  navigation.navigate('Login');
                } catch (error) {
                  console.error('Failed to clear token:', error);
                }
              } 
            }
          ]
        );
        return;
      }
      
      // Get current like state before optimistic update
      const wasLiked = isLiked;
      console.log('Current like state:', wasLiked ? 'Liked' : 'Not liked');
      
      // Apply optimistic update for better UX
      setIsLiked(!wasLiked);
      
      try {
        console.log('Calling toggleLike with pinId:', pinId, 'and userId:', formattedUserId);
        
        // Use the context function to toggle like with the formatted user ID
        const updatedPin = await toggleLike(pinId, formattedUserId);
        
        if (updatedPin) {
          console.log('Pin updated successfully:', {
            id: updatedPin._id,
            likes: updatedPin.likes?.length || 0,
            isLiked: updatedPin.likes?.some(id => formatObjectId(id) === formattedUserId)
          });
          
          // Update the pin data with server response
          setPin(updatedPin);
          
          // Ensure the like state matches the server state
          const serverLikeState = updatedPin.likes?.some(id => 
            formatObjectId(id) === formattedUserId
          );
          
          if (serverLikeState !== !wasLiked) {
            console.log('Correcting like state to match server:', serverLikeState);
            setIsLiked(serverLikeState);
          }
        }
      } catch (error) {
        // Revert optimistic update on error
        console.error('Error toggling like:', error);
        setIsLiked(wasLiked);
        
        // Show appropriate error message based on error type
        if (error.message?.includes('User not found')) {
          Alert.alert(
            'Authentication Error',
            'Your session has expired. Please log in again.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Log In', 
                onPress: async () => {
                  await AsyncStorage.removeItem('token');
                  navigation.navigate('Login');
                }
              }
            ]
          );
        } else if (error.message?.includes('Pin not found')) {
          Alert.alert('Error', 'This pin no longer exists.');
          navigation.goBack();
        } else if (error.message?.includes('Invalid user ID format')) {
          Alert.alert(
            'Authentication Error',
            'Your user ID is invalid. Please log in again.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Log In', 
                onPress: async () => {
                  await AsyncStorage.removeItem('token');
                  navigation.navigate('Login');
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', `Failed to ${wasLiked ? 'unlike' : 'like'} pin. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleLike:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      console.log('Starting handleSave with pinId:', pinId);
      
      // Validate pinId
      if (!pinId || !isValidObjectId(pinId)) {
        console.error('Invalid pinId format:', pinId);
        Alert.alert('Error', 'Cannot save: Invalid pin ID format');
        return;
      }
      
      // Check if user is authenticated
      if (authLoading) {
        console.log('Auth is still loading, waiting...');
        return; // Wait for auth to load
      }
      
      // Validate user is logged in
      if (!currentUser) {
        console.error('No current user found - not logged in');
        Alert.alert(
          'Authentication Required',
          'Please log in to save pins',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Log In', 
              onPress: () => navigation.navigate('Login') 
            }
          ]
        );
        return;
      }
      
      // Validate user ID exists
      if (!currentUser._id) {
        console.error('User is logged in but has no ID');
        Alert.alert('Error', 'User account is invalid. Please log out and log in again.');
        return;
      }
      
      // Format the user ID to ensure it's a valid ObjectId string
      const formattedUserId = formatObjectId(currentUser._id);
      if (!formattedUserId) {
        console.error('Invalid user ID format:', currentUser._id);
        Alert.alert(
          'Error',
          'Your user ID is in an invalid format. Please log out and log in again.'
        );
        return;
      }
      
      // Get current save state before optimistic update
      const wasSaved = isSaved;
      console.log('Current save state:', wasSaved ? 'Saved' : 'Not saved');
      
      // Apply optimistic update for better UX
      setIsSaved(!wasSaved);
      
      try {
        console.log('Calling toggleSave with pinId:', pinId, 'and userId:', formattedUserId);
        
        // Use the context function to toggle save with the formatted user ID
        const updatedPin = await toggleSave(pinId, formattedUserId);
        
        if (updatedPin) {
          console.log('Pin updated successfully:', {
            id: updatedPin._id,
            saves: updatedPin.saves?.length || 0,
            isSaved: updatedPin.saves?.some(id => formatObjectId(id) === formattedUserId)
          });
          
          // Update the pin data with server response
          setPin(updatedPin);
          
          // Ensure the save state matches the server state
          const serverSaveState = updatedPin.saves?.some(id => 
            formatObjectId(id) === formattedUserId
          );
          
          if (serverSaveState !== !wasSaved) {
            console.log('Correcting save state to match server:', serverSaveState);
            setIsSaved(serverSaveState);
          }
          
          // Dispatch refreshProfile event to update ProfileScreen
          navigation.dispatch({
            type: 'NAVIGATE',
            payload: {
              name: 'refreshProfile',
            },
          });
          console.log('Dispatched refreshProfile event after save/unsave');
        }
      } catch (error) {
        // Revert optimistic update on error
        console.error('Error toggling save:', error);
        setIsSaved(wasSaved);
        
        // Show appropriate error message based on error type
        if (error.message?.includes('User not found')) {
          Alert.alert(
            'Authentication Error',
            'Your session has expired. Please log in again.'
          );
        } else if (error.message?.includes('Pin not found')) {
          Alert.alert('Error', 'This pin no longer exists.');
          navigation.goBack();
        } else {
          Alert.alert('Error', `Failed to ${wasSaved ? 'unsave' : 'save'} pin. Please try again.`);
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleSave:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };


  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this pin: ${pin.title}\n${pin.imageUrl}`,
      });
    } catch (error) {
      console.error('Error sharing pin:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(pin.imageUrl);
      // Show toast or feedback
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    // Implement report functionality
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // Simulate API call
      const newCommentObj = {
        _id: `comment${Date.now()}`,
        text: newComment,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      setCommentDialogVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
        <ActivityIndicator size="large" color="#E60023" />
      </View>
    );
  }

  if (!pin) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Pin not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16, backgroundColor: '#E60023' }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  // Wrap the entire render in a try-catch to prevent crashes
  try {
    return (
      <>
      <ScrollView
        style={[styles.container, { backgroundColor: darkMode ? '#333' : '#fff' }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E60023']}
            tintColor={darkMode ? '#fff' : '#E60023'}
          />
        }
      >
      <View style={styles.imageContainer}>
        <ImageWithLoading
          source={pin.imageUrl}
          style={styles.image}
          resizeMode="contain"
          onError={(error) => {
            console.error('Image loading error:', error);
            console.log('Failed URL:', pin.imageUrl);
          }}
        />
      </View>

      <Surface style={[styles.content, { backgroundColor: darkMode ? '#444' : '#fff' }]}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <View
            ref={anchorRef}
            onLayout={(event) => {
              // Store the position of this view when it's laid out
              if (anchorRef.current) {
                anchorRef.current.measure((x, y, width, height, pageX, pageY) => {
                  setMenuPosition({ x: pageX, y: pageY + height });
                });
              }
            }}
          >
            <IconButton
              icon={() => <MaterialCommunityIcons name="dots-horizontal" size={24} color={darkMode ? '#fff' : '#000'} />} 
              onPress={() => setMenuVisible(true)}
            />
          </View>
          
          {/* Use Portal for the menu to avoid layout issues */}
          {menuVisible && (
            <Portal>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => setMenuVisible(false)}
              >
                <View
                  style={[
                    styles.menuContainer,
                    {
                      position: 'absolute',
                      top: menuPosition.y,
                      left: menuPosition.x - 150, // Adjust based on menu width
                      backgroundColor: darkMode ? '#333' : '#fff',
                      borderRadius: 5,
                      padding: 5,
                      elevation: 5,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      width: 200,
                    },
                  ]}
                >
                  <TouchableOpacity style={styles.menuItem} onPress={() => {
                    handleShare();
                    setMenuVisible(false);
                  }}>
                    <MaterialCommunityIcons name="share" size={24} color={darkMode ? '#fff' : '#000'} />
                    <Text style={{ marginLeft: 10, color: darkMode ? '#fff' : '#000' }}>Share</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem} onPress={() => {
                    handleCopyLink();
                    setMenuVisible(false);
                  }}>
                    <MaterialCommunityIcons name="link" size={24} color={darkMode ? '#fff' : '#000'} />
                    <Text style={{ marginLeft: 10, color: darkMode ? '#fff' : '#000' }}>Copy link</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem} onPress={() => {
                    handleReport();
                    setMenuVisible(false);
                  }}>
                    <MaterialCommunityIcons name="flag" size={24} color={darkMode ? '#fff' : '#000'} />
                    <Text style={{ marginLeft: 10, color: darkMode ? '#fff' : '#000' }}>Report</Text>
                  </TouchableOpacity>
                  
                  {isOwner && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                      console.log('Delete menu item clicked');
                      handleDeletePin();
                      setMenuVisible(false);
                    }}>
                      <MaterialCommunityIcons name="delete" size={24} color={darkMode ? '#fff' : '#000'} />
                      <Text style={{ marginLeft: 10, color: darkMode ? '#fff' : '#000' }}>Delete Pin</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </Portal>
          )}
        </View>

        {/* Title and Description */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: darkMode ? '#fff' : '#000' }]}>
            {pin.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: darkMode ? '#ccc' : '#666' }]}>
            {pin.description}
          </Text>
        </View>

        {/* Author Info - Only show if author data exists */}
        {pin.author && (
          <TouchableOpacity
            style={styles.authorSection}
            onPress={() => pin.author._id && navigation.navigate('Profile', { userId: pin.author._id })}
          >
            <Avatar.Image
              source={{ uri: pin.author.avatar || 'https://via.placeholder.com/40' }}
              size={40}
            />
            <View style={styles.authorInfo}>
              <Text variant="titleMedium" style={{ color: darkMode ? '#fff' : '#000' }}>
                {pin.author.username || 'Unknown User'}
              </Text>
              <Text variant="bodyMedium" style={{ color: darkMode ? '#ccc' : '#666' }}>
                {pin.author.bio || 'No bio available'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Divider style={[styles.divider, { backgroundColor: darkMode ? '#555' : '#ddd' }]} />

        {/* Board Info - Only show if board data exists */}
        {pin.board && pin.board._id && (
          <>
            <TouchableOpacity
              style={styles.boardSection}
              onPress={() => navigation.navigate('BoardDetail', { boardId: pin.board._id })}
            >
              <Image
                source={{ uri: pin.board.coverImage || 'https://via.placeholder.com/50' }}
                style={styles.boardThumbnail}
              />
              <View style={styles.boardInfo}>
                <Text variant="titleMedium" style={{ color: darkMode ? '#fff' : '#000' }}>
                  {pin.board.name || 'Untitled Board'}
                </Text>
                <Text variant="bodyMedium" style={{ color: darkMode ? '#ccc' : '#666' }}>
                  {pin.board.description || 'No description'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <Divider style={[styles.divider, { backgroundColor: darkMode ? '#555' : '#ddd' }]} />

        {/* Tags - Only show if tags exist */}
        {pin.tags && pin.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {pin.tags.map((tag, index) => (
              <Chip
                key={index}
                style={[styles.tag, { backgroundColor: darkMode ? '#555' : '#ddd' }]}
                textStyle={{ color: darkMode ? '#fff' : '#000' }}
                onPress={() => navigation.navigate('Search', { query: tag })}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}

        <Divider style={[styles.divider, { backgroundColor: darkMode ? '#555' : '#ddd' }]} />

        {/* Stats and Actions */}
        <View style={styles.statsContainer}>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: darkMode ? '#fff' : '#000' }]}>
              {pin.likes.length}
            </Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#ccc' : '#666' }]}>likes</Text>
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: darkMode ? '#fff' : '#000' }]}>
              {pin.saves.length}
            </Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#ccc' : '#666' }]}>saves</Text>
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: darkMode ? '#fff' : '#000' }]}>
              {comments.length}
            </Text>
            <Text style={[styles.statLabel, { color: darkMode ? '#ccc' : '#666' }]}>comments</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode={isLiked ? "contained" : "outlined"}
            onPress={handleLike}
            style={[
              styles.actionButton,
              {
                backgroundColor: isLiked ? '#9C27B0' : darkMode ? '#333' : '#fff',
                borderColor: isLiked ? '#9C27B0' : darkMode ? '#555' : '#ddd'
              }
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FFFFFF" : darkMode ? '#fff' : '#000'}
              />
            )}
          >
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button
            mode={isSaved ? "contained" : "outlined"}
            onPress={handleSave}
            style={[
              styles.actionButton,
              {
                backgroundColor: isSaved ? '#9C27B0' : darkMode ? '#333' : '#fff',
                borderColor: isSaved ? '#9C27B0' : darkMode ? '#555' : '#ddd'
              }
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isSaved ? "#FFFFFF" : darkMode ? '#fff' : '#000'}
              />
            )}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </View>

        <Divider style={[styles.divider, { backgroundColor: darkMode ? '#555' : '#ddd' }]} />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentHeader}>
            <Text variant="titleMedium" style={{ color: darkMode ? '#fff' : '#000' }}>
              Comments
            </Text>
            <Button
              mode="text"
              onPress={() => setCommentDialogVisible(true)}
              textColor={darkMode ? '#fff' : '#000'}
            >
              Add Comment
            </Button>
          </View>

          {comments.map((comment, index) => (
            <View key={comment._id} style={styles.commentItem}>
              <Avatar.Image
                source={{ uri: comment.author.avatar }}
                size={32}
              />
              <View style={styles.commentContent}>
                <Text variant="titleSmall" style={{ color: darkMode ? '#fff' : '#000' }}>
                  {comment.author.username}
                </Text>
                <Text variant="bodyMedium" style={{ color: darkMode ? '#ccc' : '#666' }}>
                  {comment.text}
                </Text>
                <Text variant="bodySmall" style={{ color: darkMode ? '#666' : '#ccc' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Surface>

      {/* Comment Dialog */}
      <Portal>
        <Dialog
          visible={commentDialogVisible}
          onDismiss={() => setCommentDialogVisible(false)}
          style={{ backgroundColor: darkMode ? '#333' : '#fff' }}
        >
          <Dialog.Title style={{ color: darkMode ? '#fff' : '#000' }}>Add Comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Write your comment..."
              style={{ backgroundColor: darkMode ? '#444' : '#fff' }}
              textColor={darkMode ? '#fff' : '#000'}
              placeholderTextColor={darkMode ? '#666' : '#ccc'}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCommentDialogVisible(false)} textColor={darkMode ? '#fff' : '#000'}>
              Cancel
            </Button>
            <Button onPress={handleAddComment} textColor={darkMode ? '#fff' : '#000'}>
              Post
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteConfirmationVisible}
          onDismiss={() => setDeleteConfirmationVisible(false)}
          style={{ backgroundColor: darkMode ? '#333' : '#fff' }}
        >
          <Dialog.Title style={{ color: darkMode ? '#fff' : '#000' }}>Delete Pin</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: darkMode ? '#fff' : '#000' }}>
              Are you sure you want to delete this pin? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmationVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeletePin} color="#E60023">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </>
    );
  } catch (renderError) {
    console.error('Error rendering PinDetailScreen:', renderError);
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
        <Text style={{ color: darkMode ? '#fff' : '#000', marginBottom: 16, textAlign: 'center' }}>
          Something went wrong while displaying this pin.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#E60023' }}
        >
          Go Back
        </Button>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  menuContainer: {
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width,
    height: width,
  },
  content: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  boardInfo: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  stats: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
});

export default PinDetailScreen;