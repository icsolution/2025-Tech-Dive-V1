import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to clear the authentication token
const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Authentication token cleared successfully');
  } catch (error) {
    console.error('Failed to clear authentication token:', error);
  }
};

// Execute the function
clearAuthToken();
