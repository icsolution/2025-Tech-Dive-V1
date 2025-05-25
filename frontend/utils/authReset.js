import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility function to clear authentication token and force a new login
 * This is useful when the database has been reseeded and the old tokens are no longer valid
 */
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Authentication token cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear authentication token:', error);
    return false;
  }
};

/**
 * Utility function to check if a token exists
 */
export const hasAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('Failed to check authentication token:', error);
    return false;
  }
};
