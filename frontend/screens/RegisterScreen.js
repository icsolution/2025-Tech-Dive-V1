import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, Surface, useTheme, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const theme = useTheme();
  const { register } = useAuth();
  
  // Navigate to login screen after successful registration
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [successMessage, navigation]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Use direct fetch for more control over the registration process
      const response = await fetch(`${config.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful

      // Show success message instead of immediately navigating
      setSuccessMessage('Registration successful! Redirecting to login...');
      setShowSnackbar(true);
      setError('');
      
      // Clear form data
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Make sure we're logged out after registration
      await AsyncStorage.removeItem('token');
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          </View>
        </TouchableWithoutFeedback>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            mode="outlined"
            label="Username"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          />

          <TextInput
            mode="outlined"
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          />

          <TextInput
            mode="outlined"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
            style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          />

          <View style={styles.buttonContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.button}
                >
                  Register
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkButton}
                >
                  Already have an account? Sign in
                </Button>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Surface>
        
        {/* Success message snackbar */}
        <Snackbar
          visible={showSnackbar && successMessage !== ''}
          onDismiss={() => setShowSnackbar(false)}
          duration={2000}
          style={{ backgroundColor: theme.colors.primary }}
        >
          {successMessage}
        </Snackbar>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginTop: 8,
    padding: 4,
  },
  linkButton: {
    marginTop: 16,
  },
  error: {
    color: '#B00020',
    marginBottom: 16,
  },
});

export default RegisterScreen; 