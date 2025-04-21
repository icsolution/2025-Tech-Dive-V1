import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, IconButton } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCurrentUser, dummyBoards } from '../data/dummyData';

const CreatePinScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boardId: initialBoardId, pinId } = route.params || {};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    boardId: initialBoardId || '',
  });
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(true);
  const [selectBoardModalVisible, setSelectBoardModalVisible] = useState(false);

  useEffect(() => {
    fetchBoards();
    if (initialBoardId) {
      console.log('Initial board ID from params:', initialBoardId);
    }
  }, [initialBoardId]);

  const fetchBoards = async () => {
    try {
      const currentUser = getCurrentUser();
      // Filter boards to only show those created by the current user
      const userBoards = dummyBoards.filter(board => board.author._id === currentUser._id);
      console.log('Fetched boards:', userBoards);
      
      if (!userBoards || userBoards.length === 0) {
        console.log('No boards found. User needs to create a board first.');
        setError('Please create a board first before creating a pin');
      } else {
        setBoards(userBoards);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to load boards. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleBoardSelect = (boardId) => {
    console.log('Selected board:', boardId);
    setFormData(prevData => {
      console.log('Updating formData with new boardId:', boardId);
      return { ...prevData, boardId };
    });
    setSelectBoardModalVisible(false);
  };

  const renderBoard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleBoardSelect(item._id)}
      style={[
        styles.boardCard,
        formData.boardId === item._id && styles.selectedBoard,
      ]}
    >
      <View style={styles.boardContent}>
        <View style={styles.imageContainer}>
          {item.coverImage ? (
            <Image
              source={{ uri: item.coverImage }}
              style={styles.boardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Cover</Text>
            </View>
          )}
        </View>
        <View style={styles.boardInfo}>
          <Text style={styles.boardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.pinCount}>
            {item.pins?.length || 0} pins
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleSubmit = async () => {
    console.log('Submitting form data:', formData);
    if (!formData.title || !formData.imageUrl || !formData.boardId) {
      console.log('Missing fields:', {
        title: !formData.title,
        imageUrl: !formData.imageUrl,
        boardId: !formData.boardId
      });
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create new pin with dummy data
      const currentUser = getCurrentUser();
      const selectedBoard = dummyBoards.find(board => board._id === formData.boardId);
      
      if (!selectedBoard) {
        throw new Error('Selected board not found');
      }

      const newPin = {
        _id: `pin_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        author: currentUser,
        board: selectedBoard,
        likes: [],
        saves: [],
        comments: [],
        createdAt: new Date().toISOString(),
        isLiked: false,
        isSaved: false,
      };

      console.log('Created dummy pin:', newPin);
      
      // Add the new pin to the board's pins array
      selectedBoard.pins.push(newPin);
      
      // Navigate back to the previous screen with a refresh parameter
      navigation.navigate('Home', { refresh: true });
      navigation.navigate('Profile', { refresh: true });

      // Close the modal
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating pin:', error);
      setError(error.message || 'Failed to create pin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.title}>
                {pinId ? 'Edit Pin' : 'Create Pin'}
              </Text>
              <IconButton
                icon={() => <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />}
                size={24}
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              />
            </View>

            <ScrollView style={styles.scrollContent}>
              {error ? <HelperText type="error">{error}</HelperText> : null}

              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {formData.imageUrl ? (
                  <Image
                    source={{ uri: formData.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#666666" />
                    <Text style={styles.placeholderText}>Tap to select an image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput
                mode="outlined"
                label="Title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#666666' } }}
                outlineColor="#333333"
                activeOutlineColor="#FFFFFF"
              />

              <TextInput
                mode="outlined"
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                style={styles.input}
                theme={{ colors: { text: '#FFFFFF', placeholder: '#666666' } }}
                outlineColor="#333333"
                activeOutlineColor="#FFFFFF"
              />

              <TouchableOpacity
                onPress={() => {
                  if (boards.length === 0) {
                    navigation.navigate('CreateBoard');
                    return;
                  }
                  setSelectBoardModalVisible(true);
                }}
                style={styles.boardSelector}
              >
                <Text style={styles.boardSelectorLabel}>Board</Text>
                <Text style={styles.boardSelectorValue}>
                  {boards.find(b => b._id === formData.boardId)?.name || 'Select a board'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
                buttonColor="#E60023"
                textColor="#FFFFFF"
              >
                {pinId ? 'Update Pin' : 'Create Pin'}
              </Button>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Board Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectBoardModalVisible}
          onRequestClose={() => setSelectBoardModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.overlay} 
              activeOpacity={1} 
              onPress={() => setSelectBoardModalVisible(false)}
            >
              <View 
                style={styles.boardSelectionModal}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.modalHeader}>
                  <Text variant="headlineSmall" style={styles.title}>
                    Select Board
                  </Text>
                  <IconButton
                    icon={() => <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />}
                    size={24}
                    onPress={() => setSelectBoardModalVisible(false)}
                    style={styles.closeButton}
                  />
                </View>
                <FlatList
                  data={boards}
                  renderItem={renderBoard}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  contentContainerStyle={styles.boardList}
                  showsVerticalScrollIndicator={false}
                />
                {boards.length === 0 && (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="folder-plus" size={48} color="#666666" />
                    <Text style={styles.emptyStateText}>No boards yet</Text>
                    <Button
                      mode="contained"
                      onPress={() => {
                        setSelectBoardModalVisible(false);
                        navigation.navigate('CreateBoard');
                      }}
                      style={styles.createBoardButton}
                      buttonColor="#E60023"
                      textColor="#FFFFFF"
                    >
                      Create Board
                    </Button>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  closeButton: {
    margin: 0,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666666',
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  boardSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  boardSelectorLabel: {
    color: '#666666',
    marginRight: 8,
    fontSize: 16,
  },
  boardSelectorValue: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  boardList: {
    padding: 8,
    paddingBottom: 24,
  },
  boardCard: {
    width: (Dimensions.get('window').width - 32) / 2,
    margin: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedBoard: {
    borderColor: '#E60023',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  boardContent: {
    flex: 1,
  },
  boardImage: {
    width: '100%',
    height: (Dimensions.get('window').width - 32) / 2,
    borderRadius: 16,
  },
  boardInfo: {
    padding: 12,
    backgroundColor: '#1A1A1A',
  },
  boardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  pinCount: {
    fontSize: 14,
    color: '#666666',
  },
  boardSelectionModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    marginTop: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createBoardButton: {
    width: '100%',
    marginTop: 8,
  },
});

export default CreatePinScreen; 