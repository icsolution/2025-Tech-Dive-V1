import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import {
  Text,
  List,
  Divider,
  useTheme,
  IconButton,
  Button,
  Portal,
  Dialog,
  Menu,
  RadioButton,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../context/SettingsContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { settings, updateSetting, updateNestedSetting, resetSettings } = useSettings();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showGridSizeMenu, setShowGridSizeMenu] = useState(false);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleResetSettings = async () => {
    await resetSettings();
    setShowResetDialog(false);
  };

  const renderSection = (title, children) => (
    <Surface style={styles.sectionContainer} elevation={1}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Surface>
  );

  const renderMenuItem = ({ title, description, icon, right, onPress }) => (
    <List.Item
      title={title}
      description={description}
      left={props => <List.Icon {...props} icon={icon} color={theme.colors.primary} />}
      right={right}
      onPress={onPress}
      style={styles.listItem}
      titleStyle={styles.listItemTitle}
      descriptionStyle={styles.listItemDescription}
    />
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          iconColor="#fff"
        />
        <Text style={styles.headerTitle}>Settings</Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection('Appearance', (
          <>
            {renderMenuItem({
              title: "Dark Mode",
              description: "Toggle dark/light theme",
              icon: "theme-light-dark",
              right: () => (
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => updateSetting('darkMode', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.darkMode ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
            {renderMenuItem({
              title: "Grid Size",
              description: "Adjust pin grid size",
              icon: "view-grid",
              right: props => (
                <Menu
                  visible={showGridSizeMenu}
                  onDismiss={() => setShowGridSizeMenu(false)}
                  anchor={
                    <IconButton
                      {...props}
                      icon="chevron-right"
                      onPress={() => setShowGridSizeMenu(true)}
                      iconColor={theme.colors.primary}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      updateSetting('gridSize', 'small');
                      setShowGridSizeMenu(false);
                    }}
                    title="Small"
                    leadingIcon="grid"
                    disabled={settings.gridSize === 'small'}
                  />
                  <Menu.Item
                    onPress={() => {
                      updateSetting('gridSize', 'medium');
                      setShowGridSizeMenu(false);
                    }}
                    title="Medium"
                    leadingIcon="grid"
                    disabled={settings.gridSize === 'medium'}
                  />
                  <Menu.Item
                    onPress={() => {
                      updateSetting('gridSize', 'large');
                      setShowGridSizeMenu(false);
                    }}
                    title="Large"
                    leadingIcon="grid"
                    disabled={settings.gridSize === 'large'}
                  />
                </Menu>
              ),
            })}
          </>
        ))}

        {renderSection('Notifications', (
          <>
            {renderMenuItem({
              title: "Push Notifications",
              description: "Receive push notifications",
              icon: "bell-ring-outline",
              right: () => (
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => updateSetting('notifications', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.notifications ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
            {renderMenuItem({
              title: "Email Notifications",
              description: "Receive email updates",
              icon: "email-outline",
              right: () => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSetting('emailNotifications', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.emailNotifications ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
          </>
        ))}

        {renderSection('Account', (
          <>
            {renderMenuItem({
              title: "Edit Profile",
              description: "Change your profile information",
              icon: "account-edit-outline",
              right: props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />,
              onPress: () => navigation.navigate('EditProfile'),
            })}
            {renderMenuItem({
              title: "Change Password",
              description: "Update your password",
              icon: "lock-reset",
              right: props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />,
              onPress: () => {},
            })}
          </>
        ))}

        {renderSection('Privacy', (
          <>
            {renderMenuItem({
              title: "Profile Visibility",
              description: "Control who can see your profile",
              icon: "eye-outline",
              right: props => (
                <Menu
                  visible={showPrivacyMenu}
                  onDismiss={() => setShowPrivacyMenu(false)}
                  anchor={
                    <IconButton
                      {...props}
                      icon="chevron-right"
                      onPress={() => setShowPrivacyMenu(true)}
                      iconColor={theme.colors.primary}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      updateNestedSetting('privacy', 'profileVisibility', 'public');
                      setShowPrivacyMenu(false);
                    }}
                    title="Public"
                    leadingIcon="earth"
                    disabled={settings.privacy.profileVisibility === 'public'}
                  />
                  <Menu.Item
                    onPress={() => {
                      updateNestedSetting('privacy', 'profileVisibility', 'private');
                      setShowPrivacyMenu(false);
                    }}
                    title="Private"
                    leadingIcon="lock"
                    disabled={settings.privacy.profileVisibility === 'private'}
                  />
                </Menu>
              ),
            })}
            {renderMenuItem({
              title: "Show Email",
              description: "Display email on profile",
              icon: "email-check-outline",
              right: () => (
                <Switch
                  value={settings.privacy.showEmail}
                  onValueChange={(value) => updateNestedSetting('privacy', 'showEmail', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.privacy.showEmail ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
            {renderMenuItem({
              title: "Show Location",
              description: "Display location on profile",
              icon: "map-marker-outline",
              right: () => (
                <Switch
                  value={settings.privacy.showLocation}
                  onValueChange={(value) => updateNestedSetting('privacy', 'showLocation', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.privacy.showLocation ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
          </>
        ))}

        {renderSection('Data & Storage', (
          <>
            {renderMenuItem({
              title: "Auto Save",
              description: "Automatically save pins to gallery",
              icon: "content-save-all-outline",
              right: () => (
                <Switch
                  value={settings.data.autoSave}
                  onValueChange={(value) => updateNestedSetting('data', 'autoSave', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.data.autoSave ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
            {renderMenuItem({
              title: "Save to Gallery",
              description: "Save pins to device gallery",
              icon: "image-multiple-outline",
              right: () => (
                <Switch
                  value={settings.data.saveToGallery}
                  onValueChange={(value) => updateNestedSetting('data', 'saveToGallery', value)}
                  color={theme.colors.primary}
                  trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                  thumbColor={settings.data.saveToGallery ? theme.colors.primary : '#f4f3f4'}
                />
              ),
            })}
            {renderMenuItem({
              title: "Cache Size",
              description: "Manage app cache size",
              icon: "database-cog-outline",
              right: props => (
                <Menu
                  visible={showDataMenu}
                  onDismiss={() => setShowDataMenu(false)}
                  anchor={
                    <IconButton
                      {...props}
                      icon="chevron-right"
                      onPress={() => setShowDataMenu(true)}
                      iconColor={theme.colors.primary}
                    />
                  }
                >
                  <Menu.Item
                    onPress={() => {
                      updateNestedSetting('data', 'cacheSize', 'small');
                      setShowDataMenu(false);
                    }}
                    title="Small"
                    leadingIcon="database"
                    disabled={settings.data.cacheSize === 'small'}
                  />
                  <Menu.Item
                    onPress={() => {
                      updateNestedSetting('data', 'cacheSize', 'medium');
                      setShowDataMenu(false);
                    }}
                    title="Medium"
                    leadingIcon="database"
                    disabled={settings.data.cacheSize === 'medium'}
                  />
                  <Menu.Item
                    onPress={() => {
                      updateNestedSetting('data', 'cacheSize', 'large');
                      setShowDataMenu(false);
                    }}
                    title="Large"
                    leadingIcon="database"
                    disabled={settings.data.cacheSize === 'large'}
                  />
                </Menu>
              ),
            })}
          </>
        ))}

        {renderSection('About', (
          <>
            {renderMenuItem({
              title: "Help Center",
              description: "Get help and support",
              icon: "help-circle-outline",
              right: props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />,
              onPress: () => {},
            })}
            {renderMenuItem({
              title: "Terms of Service",
              description: "Read our terms of service",
              icon: "file-document-outline",
              right: props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />,
              onPress: () => {},
            })}
            {renderMenuItem({
              title: "Reset Settings",
              description: "Reset all settings to default",
              icon: "refresh",
              right: props => <List.Icon {...props} icon="chevron-right" color={theme.colors.primary} />,
              onPress: () => setShowResetDialog(true),
            })}
          </>
        ))}

        <Button
          mode="outlined"
          onPress={() => setShowLogoutDialog(true)}
          style={styles.logoutButton}
          textColor={theme.colors.error}
          labelStyle={styles.logoutButtonLabel}
        >
          Log Out
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Log Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Log Out
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
          <Dialog.Title>Reset Settings</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to reset all settings to default?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResetDialog(false)}>Cancel</Button>
            <Button onPress={handleResetSettings} textColor={theme.colors.error}>
              Reset
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#2F2F3E',
    elevation: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    padding: 16,
    paddingBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 8,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen; 