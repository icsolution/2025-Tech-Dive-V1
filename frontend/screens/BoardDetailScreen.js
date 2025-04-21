import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, Button, Surface, IconButton, Divider, FAB, Menu, Portal, Dialog, useTheme, Chip, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  getBoardById,
  getCurrentUser,
  isBoardFollowedByUser,
  getPinById,
} from '../data/dummyData';

const { width } = Dimensions.get('window');
const numColumns = 3;
const pinSize = width / numColumns - 8;

const BoardDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId } = route.params;
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isPrivate, setIsPrivate] = useState(false);
  const [collaboratorDialogVisible, setCollaboratorDialogVisible] = useState(false);
  const [selectedPins, setSelectedPins] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pinScale] = useState(new Animated.Value(1));
  const currentUser = getCurrentUser();
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0, width: 0 });

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching board details for ID:', boardId);
      
      const foundBoard = getBoardById(boardId);
      if (!foundBoard) {
        throw new Error('Board not found');
      }

      console.log('Found board:', foundBoard);
      setBoard(foundBoard);
      setIsFollowing(isBoardFollowedByUser(foundBoard));
      setIsPrivate(foundBoard.isPrivate);
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

  const handleFollow = async () => {
    try {
      // Simulate API call
      setIsFollowing(!isFollowing);
      setBoard(prev => ({
        ...prev,
        followers: isFollowing
          ? prev.followers.filter(id => id !== currentUser._id)
          : [...prev.followers, currentUser._id],
      }));
    } catch (error) {
      console.error('Error following board:', error);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      // Simulate API call
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const toggleBoardPrivacy = async () => {
    try {
      // Simulate API call
      setIsPrivate(!isPrivate);
      setBoard(prev => ({
        ...prev,
        isPrivate: !prev.isPrivate,
      }));
    } catch (error) {
      console.error('Error updating board privacy:', error);
    }
  };

  const handlePinPress = (pinId) => {
    if (isSelectionMode) {
      setSelectedPins(prev => 
        prev.includes(pinId) 
          ? prev.filter(id => id !== pinId)
          : [...prev, pinId]
      );
    } else {
      navigation.navigate('PinDetail', { pinId });
    }
  };

  const handlePinLongPress = () => {
    setIsSelectionMode(true);
  };

  const handleDeleteSelectedPins = async () => {
    try {
      // Simulate API call
      setBoard(prev => ({
        ...prev,
        pins: prev.pins.filter(pin => !selectedPins.includes(pin._id))
      }));
      setSelectedPins([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error deleting pins:', error);
    }
  };

  const sortPins = (pins) => {
    if (!pins) return [];
    switch (sortBy) {
      case 'newest':
        return [...pins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...pins].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'popular':
        return [...pins].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      default:
        return pins;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <Text style={{ color: '#FFFFFF' }}>Loading board details...</Text>
      </View>
    );
  }

  if (!board) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <Text style={{ color: '#FFFFFF' }}>Board not found</Text>
      </View>
    );
  }

  const isOwner = board.author._id === currentUser._id;
  const isCollaborator = board.collaborators.some(collab => collab._id === currentUser._id);
  const canEdit = isOwner || isCollaborator;

  return (
    <View style={[styles.container, { backgroundColor: '#121212' }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Surface style={[styles.header, { backgroundColor: '#1E1E1E' }]}>
          <Image
            source={{ uri: board.coverImage }}
            style={styles.coverImage}
          />
          <View style={styles.headerContent}>
            <View style={styles.headerActions}>
              <IconButton
                icon={() => <MaterialCommunityIcons name="share-variant" size={24} color="#FFFFFF" />}
                onPress={() => {}}
              />
              {canEdit && (
                <>
                  <IconButton
                    icon={() => <MaterialCommunityIcons name={isPrivate ? "lock" : "lock-open-variant"} size={24} color="#FFFFFF" />}
                    onPress={toggleBoardPrivacy}
                  />
                  <IconButton
                    icon={() => <MaterialCommunityIcons name="account-multiple-plus" size={24} color="#FFFFFF" />}
                    onPress={() => setCollaboratorDialogVisible(true)}
                  />
                </>
              )}
              {isOwner && (
                <IconButton
                  icon={() => <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />}
                  onPress={() => setMenuVisible(true)}
                  ref={(ref) => {
                    if (ref) {
                      ref.measure((x, y, width, height, pageX, pageY) => {
                        setMenuAnchor({ x: pageX, y: pageY + height, width });
                      });
                    }
                  }}
                />
              )}
            </View>

            <Text variant="headlineSmall" style={[styles.title, { color: '#FFFFFF' }]}>
              {board.name}
            </Text>
            <Text variant="bodyLarge" style={[styles.description, { color: '#B0B0B0' }]}>
              {board.description}
            </Text>

            <View style={styles.metadataContainer}>
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons 
                  name={board.isPrivate ? "lock" : "lock-open-variant"} 
                  size={16} 
                  color="#B0B0B0" 
                />
                <Text style={[styles.metadataText, { color: '#B0B0B0' }]}>
                  {board.isPrivate ? "Private" : "Public"}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={16} 
                  color="#B0B0B0" 
                />
                <Text style={[styles.metadataText, { color: '#B0B0B0' }]}>
                  {board.collaborators.length} Collaborators
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={16} 
                  color="#B0B0B0" 
                />
                <Text style={[styles.metadataText, { color: '#B0B0B0' }]}>
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.authorSection}>
              <TouchableOpacity
                style={styles.authorInfo}
                onPress={() => navigation.navigate('Profile', { userId: board.author._id })}
              >
                <Image
                  source={{ uri: board.author.avatar }}
                  style={styles.authorAvatar}
                />
                <View style={styles.authorTextInfo}>
                  <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
                    {board.author.username}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
                    {board.pins.length} Pins • {board.followers.length} Followers
                  </Text>
                </View>
              </TouchableOpacity>
              {!isOwner && (
                <Button
                  mode={isFollowing ? "outlined" : "contained"}
                  onPress={handleFollow}
                  style={[
                    styles.followButton,
                    {
                      backgroundColor: isFollowing ? 'transparent' : '#9C27B0',
                      borderColor: '#9C27B0'
                    }
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </View>

            

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="pin" size={24} color="#9C27B0" />
                <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
                  {board.pins.length}
                </Text>
                <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>Pins</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#9C27B0" />
                <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
                  {board.followers.length}
                </Text>
                <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>Followers</Text>
              </View>
            </View>
          </View>
        </Surface>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        <View style={styles.sortingSection}>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'popular', label: 'Popular' },
            ]}
            style={{ backgroundColor: '#1E1E1E' }}
          />
        </View>

        <View style={styles.pinsGrid}>
          {sortPins(board.pins)?.map((pin) => (
            <TouchableOpacity
              key={pin._id}
              style={[
                styles.pinContainer,
                selectedPins.includes(pin._id) && styles.selectedPin
              ]}
              onPress={() => handlePinPress(pin._id)}
              onLongPress={handlePinLongPress}
              delayLongPress={300}
            >
              <Animated.Image
                source={{ uri: pin.imageUrl }}
                style={[
                  styles.pinImage,
                  { transform: [{ scale: pinScale }] }
                ]}
                resizeMode="cover"
              />
              <View style={[
                styles.pinOverlay,
                { opacity: selectedPins.includes(pin._id) ? 1 : 0 }
              ]}>
                <View style={styles.pinActions}>
                  <IconButton
                    icon={() => (
                      <MaterialCommunityIcons 
                        name={pin.isLiked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={pin.isLiked ? "#FF4081" : "#FFFFFF"} 
                      />
                    )}
                    onPress={() => {}}
                    style={styles.pinActionButton}
                  />
                  <IconButton
                    icon={() => (
                      <MaterialCommunityIcons 
                        name={pin.isSaved ? "bookmark" : "bookmark-outline"} 
                        size={24} 
                        color={pin.isSaved ? "#9C27B0" : "#FFFFFF"} 
                      />
                    )}
                    onPress={() => {}}
                    style={styles.pinActionButton}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {canEdit && (
        <FAB
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="plus" size={24} color={color} />
          )}
          style={[styles.fab, { backgroundColor: '#9C27B0' }]}
          onPress={() => navigation.navigate('CreatePin', { boardId })}
          color="#FFFFFF"
        />
      )}

      {isSelectionMode && (
        <View style={styles.selectionToolbar}>
          <Button 
            mode="contained" 
            onPress={() => setIsSelectionMode(false)}
            style={{ backgroundColor: '#9C27B0' }}
          >
            Cancel
          </Button>
          <Text style={{ color: '#FFFFFF' }}>
            {selectedPins.length} selected
          </Text>
          <Button 
            mode="contained" 
            onPress={handleDeleteSelectedPins}
            style={{ backgroundColor: '#FF4081' }}
          >
            Delete
          </Button>
        </View>
      )}

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        style={{ 
          backgroundColor: '#1E1E1E',
          marginTop: 8,
          borderRadius: 8,
          elevation: 4,
        }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('EditBoard', { boardId: board._id });
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
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Delete Board</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: '#B0B0B0' }}>Are you sure you want to delete this board?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} textColor="#9C27B0">Cancel</Button>
            <Button onPress={handleDeleteBoard} textColor="#FF4081">Delete</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={collaboratorDialogVisible}
          onDismiss={() => setCollaboratorDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Manage Collaborators</Dialog.Title>
          <Dialog.Content>
            <View style={styles.collaboratorsList}>
              {board.collaborators.map(collaborator => (
                <View key={collaborator._id} style={styles.collaboratorItem}>
                  <Image
                    source={{ uri: collaborator.avatar }}
                    style={styles.collaboratorAvatar}
                  />
                  <Text style={{ color: '#FFFFFF', flex: 1 }}>
                    {collaborator.username}
                  </Text>
                  <IconButton
                    icon="close"
                    size={20}
                    iconColor="#FF4081"
                    onPress={() => {}}
                  />
                </View>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCollaboratorDialogVisible(false)} textColor="#9C27B0">
              Done
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    elevation: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
  },
  coverImage: {
    width: width,
    height: 200,
  },
  headerContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A2A2A',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 14,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorTextInfo: {
    flex: 1,
  },
  followButton: {
    marginLeft: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  pinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
  },
  pinContainer: {
    width: pinSize,
    height: pinSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pinImage: {
    width: '100%',
    height: '100%',
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    opacity: 0,
  },
  pinActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
  pinActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: 'transparent',
    borderColor: '#9C27B0',
  },
  sortingSection: {
    padding: 16,
  },
  selectedPin: {
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  selectionToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  collaboratorsList: {
    gap: 12,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collaboratorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default BoardDetailScreen; 