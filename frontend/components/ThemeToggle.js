import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

const ThemeToggle = ({ style, position = 'header' }) => {
  // For web hover effect
  const [hovered, setHovered] = React.useState(false);
  const theme = useTheme();
  const { settings, updateSetting } = useSettings();

  const toggleTheme = () => {
    updateSetting('darkMode', !settings.darkMode);
  };

  // Determine icon and colors based on theme and position
  const icon = settings.darkMode ? 'weather-night' : 'white-balance-sunny';
const iconColor = settings.darkMode ? '#FFD700' : '#1A237E'; // Bright yellow sun, deep blue moon
const backgroundColor = 'transparent';
  
  // For header position, use a different style
  if (position === 'header') {
    return (
      <View style={styles.headerButtonContainer}>
        <IconButton
          icon={({ size }) => (
            <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
          )}
          size={28}
          onPress={toggleTheme}
          style={[
            styles.headerButton,
            style,
            { 
              backgroundColor,
              borderWidth: 0,
              outline: 'none',
              boxShadow: 'none',
              transition: 'background 0.2s, transform 0.15s',
              transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
            }
          ]}
          mode="contained"
          containerColor={backgroundColor}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          accessibilityLabel={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        />
      </View>
    );
  }

  // Default floating button style
  return (
    <View style={[styles.container, style]}>
      <IconButton
        icon={({ size }) => (
          <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
        )}
        size={28}
        onPress={toggleTheme}
        style={[
          styles.button,
          {
            backgroundColor,
            borderWidth: 0,
            outline: 'none',
            boxShadow: 'none',
            transition: 'background 0.2s, transform 0.15s',
            transform: hovered ? 'scale(1.08)' : 'scale(1.0)',
          }
        ]}
        mode="contained"
        containerColor={backgroundColor}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        accessibilityLabel={settings.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  button: {
    margin: 0,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerButton: {
    margin: 0,
  }
});

export default ThemeToggle;
