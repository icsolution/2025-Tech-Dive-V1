import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
  Switch,
  Chip,
  Portal,
  Dialog,
  useTheme,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  getBoardById,
  getCurrentUser,
  getUserById,
} from '../data/dummyData';

const { width } = Dimensions.get('window');

const EditBoardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId } = route.params;
  const currentUser = getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [searchDialogVisible, setSearchDialogVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0, width: 0 });
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchBoardDetails();
  }, [boardId]);

  const fetchBoardDetails = async () => {
    try {
      setLoading(true);
      const foundBoard = getBoardById(boardId);
      if (!foundBoard) {
        throw new Error('Board not found');
      }

      setBoard(foundBoard);
      setName(foundBoard.name);
      setDescription(foundBoard.description);
      setIsPrivate(foundBoard.isPrivate);
      setCoverImage(foundBoard.coverImage);
      setCollaborators(foundBoard.collaborators);
    } catch (error) {
      console.error('Error fetching board details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!coverImage) {
      newErrors.coverImage = 'Cover image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      // Simulate API call
      const updatedBoard = {
        ...board,
        name,
        description,
        isPrivate,
        coverImage,
        collaborators,
        updatedAt: new Date().toISOString(),
      };
      
      // In a real app, we would make an API call here
      console.log('Saving board:', updatedBoard);
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving board:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSearchUsers = (query) => {
    // Simulate API call to search users
    // In a real app, we would make an API call here
    setSearchResults([
      // Filter out current user and existing collaborators
      ...board.author._id === currentUser._id ? [] : [board.author],
      ...collaborators,
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) &&
      !collaborators.some(c => c._id === user._id)
    ));
  };

  const handleAddCollaborator = (user) => {
    setCollaborators(prev => [...prev, user]);
    setSearchDialogVisible(false);
    setSearchQuery('');
  };

  const handleRemoveCollaborator = (userId) => {
    setCollaborators(prev => prev.filter(c => c._id !== userId));
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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

  return (
    <View style={[styles.container, { backgroundColor: '#121212' }]}>
      <ScrollView>
        <Surface style={[styles.content, { backgroundColor: '#1E1E1E' }]}>
          {/* Cover Image Section */}
          <TouchableOpacity onPress={handlePickImage} style={styles.coverImageContainer}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: '#333333' }]}>
                <MaterialCommunityIcons name="image-plus" size={48} color="#666666" />
              </View>
            )}
            <View style={styles.editOverlay}>
              <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF' }}>Change Cover</Text>
            </View>
          </TouchableOpacity>
          {errors.coverImage && (
            <Text style={styles.errorText}>{errors.coverImage}</Text>
          )}

          {/* Board Details Form */}
          <View style={styles.form}>
            <TextInput
              label="Board Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              theme={{
                colors: {
                  background: '#333333',
                  text: '#FFFFFF',
                  placeholder: '#666666',
                }
              }}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              error={!!errors.description}
              theme={{
                colors: {
                  background: '#333333',
                  text: '#FFFFFF',
                  placeholder: '#666666',
                }
              }}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}

            <View style={styles.privacySection}>
              <View style={styles.privacyHeader}>
                <MaterialCommunityIcons 
                  name={isPrivate ? "lock" : "lock-open-variant"} 
                  size={24} 
                  color="#FFFFFF" 
                />
                <View style={styles.privacyText}>
                  <Text style={{ color: '#FFFFFF' }}>Private Board</Text>
                  <Text style={{ color: '#B0B0B0', fontSize: 12 }}>
                    Only you and your collaborators can see this board
                  </Text>
                </View>
                <Switch
                  value={isPrivate}
                  onValueChange={setIsPrivate}
                  color="#9C27B0"
                />
              </View>
            </View>

            <View style={styles.collaboratorsSection}>
              <View style={styles.sectionHeader}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                  Collaborators
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setSearchDialogVisible(true)}
                  style={{ borderColor: '#9C27B0' }}
                  textColor="#9C27B0"
                >
                  Add
                </Button>
              </View>
              <View style={styles.collaboratorsList}>
                {collaborators.map(collaborator => (
                  <Chip
                    key={collaborator._id}
                    avatar={<Image source={{ uri: collaborator.avatar }} style={styles.avatar} />}
                    onClose={() => handleRemoveCollaborator(collaborator._id)}
                    style={[styles.collaboratorChip, { backgroundColor: '#333333' }]}
                    textStyle={{ color: '#FFFFFF' }}
                  >
                    {collaborator.username}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Surface>
      </ScrollView>

      {/* Action Buttons */}
      <Surface style={[styles.actions, { backgroundColor: '#1E1E1E' }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.actionButton, { borderColor: '#9C27B0' }]}
          textColor="#9C27B0"
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          loading={saving}
          disabled={saving}
        >
          Save
        </Button>
      </Surface>

      {/* Search Collaborators Dialog */}
      <Portal>
        <Dialog
          visible={searchDialogVisible}
          onDismiss={() => setSearchDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Add Collaborators</Dialog.Title>
          <Dialog.Content>
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                handleSearchUsers(text);
              }}
              mode="outlined"
              style={styles.searchInput}
              theme={{
                colors: {
                  background: '#333333',
                  text: '#FFFFFF',
                  placeholder: '#666666',
                }
              }}
            />
            <ScrollView style={styles.searchResults}>
              {searchResults.map(user => (
                <TouchableOpacity
                  key={user._id}
                  style={styles.searchResultItem}
                  onPress={() => handleAddCollaborator(user)}
                >
                  <Image source={{ uri: user.avatar }} style={styles.searchResultAvatar} />
                  <View style={styles.searchResultInfo}>
                    <Text style={{ color: '#FFFFFF' }}>{user.username}</Text>
                    <Text style={{ color: '#B0B0B0', fontSize: 12 }}>{user.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSearchDialogVisible(false)} textColor="#9C27B0">
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Menu */}
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
      </Menu>
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
  content: {
    flex: 1,
  },
  coverImageContainer: {
    width: width,
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#FF4081',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 8,
  },
  privacySection: {
    marginBottom: 24,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyText: {
    flex: 1,
  },
  collaboratorsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  collaboratorChip: {
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 16,
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 12,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchResultInfo: {
    flex: 1,
  },
});

export default EditBoardScreen; 