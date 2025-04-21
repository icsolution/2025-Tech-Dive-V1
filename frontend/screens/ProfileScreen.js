import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
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

const { width } = Dimensions.get('window');
const numColumns = 3;
const pinSize = width / numColumns - 8;

const ProfileScreen = () => {
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

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // For now, using dummy data
      const dummyUser = {
        _id: 'testuser123',
        username: 'John Doe',
        email: 'john@example.com',
        bio: 'Pinterest enthusiast | Digital Creator | Love sharing beautiful things',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        followers: Array(128).fill('dummy_follower'),
        following: Array(97).fill('dummy_following'),
        pins: dummyPins.slice(0, 15),
        boards: [
          { _id: 'board1', name: 'Travel Inspiration', pins: Array(24).fill('pin'), coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
          { _id: 'board2', name: 'Food & Recipes', pins: Array(16).fill('pin'), coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
          { _id: 'board3', name: 'Interior Design', pins: Array(32).fill('pin'), coverImage: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        ],
      };

      setUser(dummyUser);
      setUserPins(dummyUser.pins);
      setUserBoards(dummyUser.boards);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    const unsubscribe = navigation.addListener('refreshProfile', () => {
      fetchUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
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
      <Image
        source={{ uri: pin.imageUrl }}
        style={styles.pinImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderBoard = (board) => (
    <TouchableOpacity
      key={board._id}
      style={styles.boardContainer}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board._id })}
    >
      <Image
        source={{ uri: board.coverImage }}
        style={styles.boardCover}
        resizeMode="cover"
      />
      <View style={styles.boardInfo}>
        <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
          {board.name}
        </Text>
        <Text variant="bodySmall" style={{ color: '#B0B0B0' }}>
          {board.pins.length} pins
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

          <Image
            source={{ uri: user?.avatar }}
            style={styles.avatar}
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
    backgroundColor: '#121212',
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