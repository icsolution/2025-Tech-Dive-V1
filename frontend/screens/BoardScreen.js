import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Divider,
  useTheme,
  ActivityIndicator,
  IconButton,
  Menu,
  Portal,
  Dialog,
  TextInput,
  Chip,
  FAB,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dummyPins } from '../data/dummyData';

const { width } = Dimensions.get('window');
const numColumns = 3;
const pinSize = width / numColumns - 8;

const BoardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId } = route.params;
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [boardPins, setBoardPins] = useState([]);
  const [selectedView, setSelectedView] = useState('grid'); // 'grid' or 'list'
  const [scrollY] = useState(new Animated.Value(0));
  const [showFAB, setShowFAB] = useState(true);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      // For now, using dummy data
      const dummyBoard = {
        _id: boardId,
        name: 'Travel Inspiration',
        description: 'A collection of beautiful travel destinations and experiences from around the world.',
        coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        pinCount: 24,
        createdBy: {
          _id: 'user123',
          username: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        collaborators: [
          { _id: 'user456', username: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
          { _id: 'user789', username: 'Mike Johnson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        ],
        isSecret: false,
        category: 'Travel',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-20T15:30:00Z',
        tags: ['Travel', 'Nature', 'Adventure', 'Photography'],
      };

      setBoard(dummyBoard);
      setBoardName(dummyBoard.name);
      setBoardDescription(dummyBoard.description);
      setBoardPins(dummyPins.slice(0, dummyBoard.pinCount));
    } catch (error) {
      console.error('Error fetching board details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBoardDetails();
  };

  const handleEditBoard = () => {
    setIsEditing(true);
    setEditDialogVisible(true);
  };

  const handleSaveEdit = () => {
    setBoard(prev => ({
      ...prev,
      name: boardName,
      description: boardDescription,
    }));
    setIsEditing(false);
    setEditDialogVisible(false);
  };

  const handleDeleteBoard = () => {
    // Implement delete functionality
    navigation.goBack();
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
      <View style={styles.pinOverlay}>
        <View style={styles.pinActions}>
          <IconButton
            icon={() => <MaterialCommunityIcons name="heart-outline" size={24} color="#FFFFFF" />}
            onPress={() => {}}
            style={styles.pinActionButton}
          />
          <IconButton
            icon={() => <MaterialCommunityIcons name="bookmark-outline" size={24} color="#FFFFFF" />}
            onPress={() => {}}
            style={styles.pinActionButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPinList = (pin) => (
    <TouchableOpacity
      key={pin._id}
      style={styles.pinListItem}
      onPress={() => navigation.navigate('PinDetail', { pinId: pin._id })}
    >
      <Image
        source={{ uri: pin.imageUrl }}
        style={styles.pinListImage}
        resizeMode="cover"
      />
      <View style={styles.pinListInfo}>
        <Text variant="titleMedium" style={styles.pinListTitle}>
          {pin.title}
        </Text>
        <Text variant="bodyMedium" style={styles.pinListDescription} numberOfLines={2}>
          {pin.description}
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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Surface style={styles.header}>
          <Animated.Image
            source={{ uri: board?.coverImage }}
            style={[styles.coverImage, { height: headerHeight }]}
          />
          <View style={styles.headerContent}>
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

            <Text variant="headlineSmall" style={styles.boardName}>
              {board?.name}
            </Text>
            <Text variant="bodyLarge" style={styles.boardDescription}>
              {board?.description}
            </Text>
            
            <View style={styles.boardMeta}>
              <View style={styles.creatorInfo}>
                <Image
                  source={{ uri: board?.createdBy?.avatar }}
                  style={styles.creatorAvatar}
                />
                <View style={styles.creatorDetails}>
                  <Text variant="bodyMedium" style={styles.creatorName}>
                    {board?.createdBy?.username}
                  </Text>
                  <Text variant="bodySmall" style={styles.creatorSubtext}>
                    Created {new Date(board?.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.collaborators}>
                {board?.collaborators?.map((collaborator, index) => (
                  <Image
                    key={collaborator._id}
                    source={{ uri: collaborator.avatar }}
                    style={[
                      styles.collaboratorAvatar,
                      { marginLeft: index > 0 ? -12 : 0 }
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.boardStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="pin" size={24} color="#9C27B0" />
                <Text variant="titleMedium" style={styles.statNumber}>
                  {board?.pinCount}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Pins
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#9C27B0" />
                <Text variant="titleMedium" style={styles.statNumber}>
                  {board?.collaborators?.length + 1}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Collaborators
                </Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {board?.tags?.map((tag) => (
                <Chip
                  key={tag}
                  style={styles.tag}
                  textStyle={{ color: '#9C27B0' }}
                  mode="outlined"
                >
                  {tag}
                </Chip>
              ))}
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddPin', { boardId })}
                style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                labelStyle={{ color: '#FFFFFF' }}
              >
                Add Pin
              </Button>
              <Button
                mode="outlined"
                onPress={handleEditBoard}
                style={[styles.actionButton, { borderColor: '#9C27B0' }]}
                textColor="#9C27B0"
              >
                Edit Board
              </Button>
            </View>
          </View>
        </Surface>

        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              selectedView === 'grid' && styles.selectedViewButton,
            ]}
            onPress={() => setSelectedView('grid')}
          >
            <MaterialCommunityIcons
              name="grid"
              size={24}
              color={selectedView === 'grid' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.viewButtonText,
              selectedView === 'grid' && styles.selectedViewButtonText,
            ]}>
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              selectedView === 'list' && styles.selectedViewButton,
            ]}
            onPress={() => setSelectedView('list')}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={24}
              color={selectedView === 'list' ? '#9C27B0' : '#FFFFFF'}
            />
            <Text style={[
              styles.viewButtonText,
              selectedView === 'list' && styles.selectedViewButtonText,
            ]}>
              List
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedView === 'grid' ? (
            <View style={styles.pinsGrid}>
              {boardPins.map(renderPin)}
            </View>
          ) : (
            <View style={styles.pinsList}>
              {boardPins.map(renderPinList)}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#9C27B0' }]}
        onPress={() => navigation.navigate('AddPin', { boardId })}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<View />}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            handleEditBoard();
          }}
          title="Edit Board"
          leadingIcon={() => <MaterialCommunityIcons name="pencil" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setDeleteDialogVisible(true);
          }}
          title="Delete Board"
          leadingIcon={() => <MaterialCommunityIcons name="delete" size={24} color="#FFFFFF" />}
          titleStyle={{ color: '#FFFFFF' }}
        />
      </Menu>

      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>
            {isEditing ? 'Edit Board' : 'Create Board'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Board Name"
              value={boardName}
              onChangeText={setBoardName}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: '#9C27B0' } }}
            />
            <TextInput
              label="Description"
              value={boardDescription}
              onChangeText={setBoardDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              theme={{ colors: { primary: '#9C27B0' } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)} textColor="#B0B0B0">
              Cancel
            </Button>
            <Button onPress={handleSaveEdit} textColor="#9C27B0">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Delete Board</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: '#B0B0B0' }}>
              Are you sure you want to delete this board? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} textColor="#B0B0B0">
              Cancel
            </Button>
            <Button onPress={handleDeleteBoard} textColor="#9C27B0">
              Delete
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
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  headerContent: {
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  boardName: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  boardDescription: {
    color: '#B0B0B0',
    marginBottom: 16,
  },
  boardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  creatorSubtext: {
    color: '#B0B0B0',
  },
  collaborators: {
    flexDirection: 'row',
  },
  collaboratorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E1E1E',
  },
  boardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  statLabel: {
    color: '#B0B0B0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'transparent',
    borderColor: '#9C27B0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    maxWidth: 160,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    padding: 8,
    marginBottom: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  selectedViewButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedViewButtonText: {
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  pinImage: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  pinActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  pinActionButton: {
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  pinsList: {
    padding: 8,
  },
  pinListItem: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pinListImage: {
    width: 120,
    height: 120,
  },
  pinListInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  pinListTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pinListDescription: {
    color: '#B0B0B0',
  },
  input: {
    backgroundColor: '#2D2D2D',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BoardScreen; 