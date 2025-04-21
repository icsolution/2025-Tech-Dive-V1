import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
  Share,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Menu,
  Portal,
  Dialog,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { 
  getPinById, 
  getCurrentUser, 
  isPinLikedByUser, 
  isPinSavedByUser,
  getUserById,
} from '../data/dummyData';

const { width } = Dimensions.get('window');

const PinDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { pinId } = route.params;
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const currentUser = getCurrentUser();

  const fetchPinDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching pin details for ID:', pinId);
      
      const foundPin = getPinById(pinId);
      if (!foundPin) {
        throw new Error('Pin not found');
      }

      console.log('Found pin:', foundPin);
      setPin(foundPin);
      setIsLiked(isPinLikedByUser(foundPin));
      setIsSaved(isPinSavedByUser(foundPin));
      setComments(foundPin.comments || []);
    } catch (error) {
      console.error('Error fetching pin details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPinDetails();
  };

  const handleLike = async () => {
    try {
      // Simulate API call
      setIsLiked(!isLiked);
      setPin(prev => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter(id => id !== currentUser._id)
          : [...prev.likes, currentUser._id],
      }));
    } catch (error) {
      console.error('Error liking pin:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      setIsSaved(!isSaved);
      setPin(prev => ({
        ...prev,
        saves: isSaved
          ? prev.saves.filter(id => id !== currentUser._id)
          : [...prev.saves, currentUser._id],
      }));
    } catch (error) {
      console.error('Error saving pin:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this pin: ${pin.title}\n${pin.imageUrl}`,
      });
    } catch (error) {
      console.error('Error sharing pin:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(pin.imageUrl);
      // Show toast or feedback
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    // Implement report functionality
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // Simulate API call
      const newCommentObj = {
        _id: `comment${Date.now()}`,
        text: newComment,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
      setCommentDialogVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!pin) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <Text style={{ color: '#FFFFFF' }}>No pin found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#121212' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Image
        source={{ uri: pin.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <Surface style={[styles.content, { backgroundColor: '#1E1E1E' }]}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <IconButton
            icon={() => <MaterialCommunityIcons name="dots-horizontal" size={24} color="#FFFFFF" />}
            onPress={() => setMenuVisible(true)}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={<View />}
            style={{ backgroundColor: '#1E1E1E' }}
          >
            <Menu.Item 
              onPress={handleShare} 
              title="Share" 
              leadingIcon={() => <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />}
              titleStyle={{ color: '#FFFFFF' }}
            />
            <Menu.Item 
              onPress={handleCopyLink} 
              title="Copy link" 
              leadingIcon={() => <MaterialCommunityIcons name="link" size={24} color="#FFFFFF" />}
              titleStyle={{ color: '#FFFFFF' }}
            />
            <Menu.Item 
              onPress={handleReport} 
              title="Report" 
              leadingIcon={() => <MaterialCommunityIcons name="flag" size={24} color="#FFFFFF" />}
              titleStyle={{ color: '#FFFFFF' }}
            />
          </Menu>
        </View>

        {/* Title and Description */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: '#FFFFFF' }]}>
            {pin.title}
          </Text>
          <Text variant="bodyLarge" style={[styles.description, { color: '#B0B0B0' }]}>
            {pin.description}
          </Text>
        </View>

        {/* Author Info */}
        <TouchableOpacity
          style={styles.authorSection}
          onPress={() => navigation.navigate('Profile', { userId: pin.author._id })}
        >
          <Avatar.Image
            source={{ uri: pin.author.avatar }}
            size={40}
          />
          <View style={styles.authorInfo}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.author.username}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              {pin.author.bio}
            </Text>
          </View>
        </TouchableOpacity>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Board Info */}
        <TouchableOpacity
          style={styles.boardSection}
          onPress={() => navigation.navigate('BoardDetail', { boardId: pin.board._id })}
        >
          <Image
            source={{ uri: pin.board.coverImage }}
            style={styles.boardThumbnail}
          />
          <View style={styles.boardInfo}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              {pin.board.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
              {pin.board.description}
            </Text>
          </View>
        </TouchableOpacity>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {pin.tags.map((tag, index) => (
            <Chip
              key={index}
              style={[styles.tag, { backgroundColor: '#333333' }]}
              textStyle={{ color: '#FFFFFF' }}
              onPress={() => navigation.navigate('Search', { query: tag })}
            >
              {tag}
            </Chip>
          ))}
        </View>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Stats and Actions */}
        <View style={styles.statsContainer}>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
              {pin.likes.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>likes</Text>
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
              {pin.saves.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>saves</Text>
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statCount, { color: '#FFFFFF' }]}>
              {comments.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#B0B0B0' }]}>comments</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode={isLiked ? "contained" : "outlined"}
            onPress={handleLike}
            style={[
              styles.actionButton,
              {
                backgroundColor: isLiked ? '#9C27B0' : 'transparent',
                borderColor: '#9C27B0'
              }
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FFFFFF" : "#9C27B0"}
              />
            )}
          >
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button
            mode={isSaved ? "contained" : "outlined"}
            onPress={handleSave}
            style={[
              styles.actionButton,
              {
                backgroundColor: isSaved ? '#9C27B0' : 'transparent',
                borderColor: '#9C27B0'
              }
            ]}
            icon={() => (
              <MaterialCommunityIcons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isSaved ? "#FFFFFF" : "#9C27B0"}
              />
            )}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </View>

        <Divider style={[styles.divider, { backgroundColor: '#333333' }]} />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentHeader}>
            <Text variant="titleMedium" style={{ color: '#FFFFFF' }}>
              Comments
            </Text>
            <Button
              mode="text"
              onPress={() => setCommentDialogVisible(true)}
              textColor="#9C27B0"
            >
              Add Comment
            </Button>
          </View>

          {comments.map((comment, index) => (
            <View key={comment._id} style={styles.commentItem}>
              <Avatar.Image
                source={{ uri: comment.author.avatar }}
                size={32}
              />
              <View style={styles.commentContent}>
                <Text variant="titleSmall" style={{ color: '#FFFFFF' }}>
                  {comment.author.username}
                </Text>
                <Text variant="bodyMedium" style={{ color: '#B0B0B0' }}>
                  {comment.text}
                </Text>
                <Text variant="bodySmall" style={{ color: '#666666' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Surface>

      {/* Comment Dialog */}
      <Portal>
        <Dialog
          visible={commentDialogVisible}
          onDismiss={() => setCommentDialogVisible(false)}
          style={{ backgroundColor: '#1E1E1E' }}
        >
          <Dialog.Title style={{ color: '#FFFFFF' }}>Add Comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Write your comment..."
              style={{ backgroundColor: '#333333' }}
              textColor="#FFFFFF"
              placeholderTextColor="#666666"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCommentDialogVisible(false)} textColor="#9C27B0">
              Cancel
            </Button>
            <Button onPress={handleAddComment} textColor="#9C27B0">
              Post
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
  image: {
    width: width,
    height: width,
  },
  content: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  boardSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  boardInfo: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  stats: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
});

export default PinDetailScreen; 