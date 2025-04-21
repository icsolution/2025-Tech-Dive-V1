import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    gridSize: 'medium', // 'small', 'medium', 'large'
    notifications: true,
    emailNotifications: true,
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: false,
    },
    data: {
      autoSave: true,
      saveToGallery: true,
      cacheSize: 'medium', // 'small', 'medium', 'large'
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const newSettings = {
        ...settings,
        [key]: value,
      };
      setSettings(newSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const updateNestedSetting = async (parentKey, childKey, value) => {
    try {
      const newSettings = {
        ...settings,
        [parentKey]: {
          ...settings[parentKey],
          [childKey]: value,
        },
      };
      setSettings(newSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving nested setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      const defaultSettings = {
        darkMode: false,
        gridSize: 'medium',
        notifications: true,
        emailNotifications: true,
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: false,
        },
        data: {
          autoSave: true,
          saveToGallery: true,
          cacheSize: 'medium',
        },
      };
      setSettings(defaultSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateNestedSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}; 