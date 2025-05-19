import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, FAB } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { PinsProvider } from './context/PinsContext';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import AppNavigator from './navigation/AppNavigator';


// Define custom themes
const CustomLightTheme = {
  ...DefaultTheme,
  ...MD3LightTheme,
  colors: {
    ...DefaultTheme.colors,
    ...MD3LightTheme.colors,
    primary: '#E60023',
    secondary: '#0076D3',
    background: '#FFFFFF',
    surface: '#F9F9F9',
    text: '#111111',
    error: '#B00020',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  ...MD3DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...MD3DarkTheme.colors,
    primary: '#E60023',
    secondary: '#0076D3',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    error: '#CF6679',
  },
};

// Main App component with theme wrapper
function MainApp() {
  const { settings } = useSettings();
  const theme = settings.darkMode ? CustomDarkTheme : CustomLightTheme;
  
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <StatusBar style={settings.darkMode ? 'light' : 'dark'} />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <AppNavigator />
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  console.log('App component initialized');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync(MaterialCommunityIcons.font);
      setFontsLoaded(true);
    }
    loadFont();
  }, []);

  if (!fontsLoaded) {
    // You can customize this fallback UI
    return null;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <PinsProvider>
          <MainApp />
        </PinsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});