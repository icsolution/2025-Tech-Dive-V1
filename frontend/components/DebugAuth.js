import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { clearAuthToken } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleClearToken = async () => {
    const result = await clearAuthToken();
    if (result) {
      setMessage('Token cleared successfully. Please restart the app.');
    } else {
      setMessage('Failed to clear token. Check console for errors.');
    }
  };

  const handleTestLogin = async () => {
    try {
      setMessage('Attempting to log in with test credentials...');
      await login({
        email: 'john@example.com',
        password: 'password123'
      });
      setMessage('Login successful! You should now be authenticated.');
    } catch (error) {
      setMessage(`Login failed: ${error.message}`);
      console.error('Test login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Debug</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Clear Auth Token" onPress={handleClearToken} />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button title="Test Login (john@example.com)" onPress={handleTestLogin} />
      </View>
      
      {message ? <Text style={styles.message}>{message}</Text> : null}
      
      <Text style={styles.infoTitle}>Available Test Users:</Text>
      <Text style={styles.info}>Email: john@example.com / Password: password123</Text>
      <Text style={styles.info}>Email: sarah@example.com / Password: password123</Text>
      <Text style={styles.info}>Email: mike@example.com / Password: password123</Text>
      <Text style={styles.info}>Email: emma@example.com / Password: password123</Text>
      <Text style={styles.info}>Email: david@example.com / Password: password123</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 5,
  },
  message: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    textAlign: 'center',
  },
  infoTitle: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  info: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default DebugAuth;
