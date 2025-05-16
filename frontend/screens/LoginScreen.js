import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Try direct API call first for more control
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token
      await AsyncStorage.setItem('token', data.token);
      
      // Navigate to home screen
      navigation.replace('Home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
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
        <View style={styles.content}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>Pinterest</Text>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={[styles.testCredentials, { color: theme.colors.text + '99' }]}>
            Note: Enter the password without any prefix
          </Text>
        </View>

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
          secureTextEntry={!showPassword}
          style={[styles.input, { backgroundColor: theme.colors.surfaceVariant }]}
          theme={{ colors: { primary: '#E60023' } }}
          right={
            formData.password.length > 0 ? (
              <TextInput.Icon
                icon={() => (
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#B0B0B0"
                  />
                )}
                onPress={() => setShowPassword(!showPassword)}
              />
            ) : null
          }
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          >
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            Don't have an account? Sign up
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginBottom: 8,
    borderRadius: 24,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  error: {
    color: '#E60023',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  testCredentials: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default LoginScreen; 