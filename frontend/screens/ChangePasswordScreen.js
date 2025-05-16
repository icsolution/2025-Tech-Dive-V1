import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      setSuccess('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Surface style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Change Password</Text>
        <TextInput
          label="Current Password"
          secureTextEntry
          value={formData.currentPassword}
          onChangeText={text => setFormData({ ...formData, currentPassword: text })}
          style={styles.input}
        />
        <TextInput
          label="New Password"
          secureTextEntry
          value={formData.newPassword}
          onChangeText={text => setFormData({ ...formData, newPassword: text })}
          style={styles.input}
        />
        <TextInput
          label="Confirm New Password"
          secureTextEntry
          value={formData.confirmNewPassword}
          onChangeText={text => setFormData({ ...formData, confirmNewPassword: text })}
          style={styles.input}
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}
        {success ? <HelperText type="info">{success}</HelperText> : null}
        <Button
          mode="contained"
          onPress={handleChangePassword}
          loading={loading}
          style={styles.button}
        >
          Change Password
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ChangePasswordScreen;
