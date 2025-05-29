import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import ImageWithLoading from '../components/ImageWithLoading';
import {
  Text,
  Button,
  Surface,
  Divider,
  List,
  useTheme,
  ActivityIndicator,
  IconButton,
  Menu,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dummyPins } from '../data/dummyData';
import config from '../config';
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');
const numColumns = 3;
const pinSize = width / numColumns - 8;

const ProfileScreen = () => {
  console.log('ProfileScreen component rendered');
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [selectedView, setSelectedView] = useState('pins'); // 'pins' or 'boards'
  const [userPins, setUserPins] = useState([]);
  const [userBoards, setUserBoards] = useState([]);
  const { settings } = useSettings();
  const { darkMode } = settings;
  console.log('darkMode:', darkMode); // Added console log

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const userData = await response.json();
      setUser(userData);
      console.log('User state updated:', userData); // Added console log
      // If your backend returns pins/boards, set them here. Otherwise, fetch separately if needed.
      // setUserPins(userData.pins || []);
      // setUserBoards(userData.boards || []);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserBoards = async (userId) => {
    console.log('Fetching boards for userId:', userId);
    console.log('fetchUserBoards called with userId:', userId); // Log function call
    if (!userId) {
      console.log('userId is undefined or null, returning.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot fetch boards.');
        return;
      }
      const apiUrl = `${config.API_URL}/boards/user/${userId}`;
      console.log('API URL:', apiUrl); // Log API URL
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      console.log('Response Status:', response.status); // Log response status

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch user boards. Response:', errorText); // Log full error response
        throw new Error(`Failed to fetch user boards: ${response.status} ${response.statusText}`);
      }
      const userBoardsData = await response.json();
      console.log('Fetched boards data:', userBoardsData); // Log fetched data
      setUserBoards(userBoardsData);
    } catch (error) {
      console.error('Error in fetchUserBoards:', error); // More specific error log
    }
  };

  const fetchUserSavedPins = async (userId) => {
    if (!userId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/pins/saved/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch saved pins');
      }
      const savedPins = await response.json();
      setUserPins(savedPins);
    } catch (error) {
      console.error('Error fetching saved pins:', error);
    }
  };

  useEffect(() => {
    // Initial fetch when component mounts or route params change
    fetchUserProfile();
  }, [navigation, route.params]);

  useEffect(() => {
    console.log('Current selectedView:', selectedView);
    console.log('Current userBoards state:', userBoards);
    if (user && user._id) {
      if (selectedView === 'pins') {
        fetchUserSavedPins(user._id);
      } else if (selectedView === 'boards') {
        fetchUserBoards(user._id);
      }
    }
  }, [user, selectedView]);

  useEffect(() => {
    if (route.params?.refresh) {
      console.log('Refreshing ProfileScreen due to navigation parameter.');
      fetchUserProfile();
      // Assuming user and selectedView are already set, these will trigger the other useEffect
      // to fetch pins/boards based on the current selectedView.
    }
  }, [route.params?.refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
    if (user) {
      fetchUserSavedPins(user._id);
      fetchUserBoards(user._id);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderPin = (pin) => (
    <TouchableOpacity
      key={pin._id}
      style={styles.pinContainer}
      onPress={() => navigation.navigate('PinDetail', { pinId: pin._id })}
    >
      <ImageWithLoading
        source={pin.imageUrl}
        style={styles.pinImage}
        width={pinSize}
        quality={70}
      />
    </TouchableOpacity>
  );

  const renderBoard = (board) => (
    <TouchableOpacity
      key={board._id}
      style={styles.boardContainer}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board._id })}
    >
      <ImageWithLoading
        source={board.coverImage}
        style={styles.boardCover}
        width={width / 2 - 16}
        quality={80}
      />
      <View style={styles.boardInfo}>
        <Text>
          <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
            {board.name}
          </Text>
        </Text>
        <Text>
          <Text variant="bodySmall" style={{ color: '#B0B0B0' }}>
            {board.pins.length} pins
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#333' : '#F7F7F7' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={styles.header}>
          <View style={styles.headerActions}>
            <IconButton
              icon={() => <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />}
              onPress={() => {}}
            />
            <IconButton
              icon={() => <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />}
              onPress={() => setMenuVisible(true)}
            />
          </View>

          <ImageWithLoading
            source={user.avatar}
            style={styles.avatar}
            width={120}
            quality={80}
          />
          <Text variant="headlineSmall" style={styles.username}>
            {user?.username}
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email}
          </Text>
          {user?.bio && (
            <Text variant="bodyMedium" style={styles.bio}>
              {user.bio}
            </Text>
          )}

          <View style={styles.stats}>
            <TouchableOpacity style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {user?.pins?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pins
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {user?.followers?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <Text variant="titleLarge" style={styles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditProfile')}
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
              labelStyle={{ color: '#FFFFFF' }}
            >
              Edit Profile
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CreateBoard')}
              style={[styles.actionButton, { borderColor: '#9C27B0' }]}
              textColor="#9C27B0"
            >
              Create Board
            </Button>
          </View>
        </Surface>

        <View style={styles.contentSelector}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedView === 'pins' && styles.selectedButton,
            ]}
            onPress={() => setSelectedView('pins')}
          >
            <MaterialCommunityIcons
              name="pin"
              size={24}
              color={selectedView === 'pins' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.selectorText,
              selectedView === 'pins' && styles.selectedText,
            ]}>
              Pins
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedView === 'boards' && styles.selectedButton,
            ]}
            onPress={() => setSelectedView('boards')}
          >
            <MaterialCommunityIcons
              name="grid"
              size={24}
              color={selectedView === 'boards' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.selectorText,
              selectedView === 'boards' && styles.selectedText,
            ]}>
              Boards
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedView === 'pins' ? (
            <View style={styles.pinsGrid}>
              {userPins.map(renderPin)}
            </View>
          ) : (
            <View style={styles.boardsGrid}>
              {userBoards.map(renderBoard)}
            </View>
          )}
        </View>
      </ScrollView>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<View />}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Settings');
          }}
          title="Settings"
          leadingIcon={() => <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setLogoutDialogVisible(true);
          }}
          title="Logout"
          leadingIcon={() => <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </Menu>

      <Portal>
        <Dialog
          visible={logoutDialogVisible}
          onDismiss={() => setLogoutDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: '#B0B0B0' }}>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)} textColor="#B0B0B0">
              Cancel
            </Button>
            <Button onPress={handleLogout} textColor="#9C27B0">
              Logout
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
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  email: {
    color: '#B0B0B0',
    marginBottom: 8,
  },
  bio: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    color: '#B0B0B0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    maxWidth: 160,
  },
  contentSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    marginTop: 1,
    padding: 12,
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  selectedButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedText: {
    color: '#9C27B0',
  },
  content: {
    flex: 1,
    padding: 4,
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pinContainer: {
    width: pinSize,
    height: pinSize * 1.3,
    margin: 4,
  },
  pinImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  boardsGrid: {
    padding: 8,
  },
  boardContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  boardCover: {
    width: 100,
    height: 100,
  },
  boardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
});

export default ProfileScreen;