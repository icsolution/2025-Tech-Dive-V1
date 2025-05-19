import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Searchbar, Chip, useTheme, IconButton, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePins } from '../context/PinsContext';

const MIN_COLUMN_WIDTH = 150; // Minimum width for each column
const GRID_PADDING = 8; // Padding around the grid
const CARD_MARGIN = 4; // Margin around each card

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'interior', label: 'Interior Design', icon: 'home-variant' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'tech', label: 'Technology', icon: 'laptop' },
  { id: 'architecture', label: 'Architecture', icon: 'office-building' },
  { id: 'nature', label: 'Nature', icon: 'tree' }
];

const DARK_PURPLE_GREY = '#2F2F3E';
const LIGHT_PURPLE_GREY = '#3A3A4C';

const HomeFeedScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { pins, loading } = usePins(); // Use pins and loading from context
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate number of columns based on screen width
  const numColumns = Math.max(2, Math.floor((screenWidth - (GRID_PADDING * 2)) / MIN_COLUMN_WIDTH));
  const columnWidth = (screenWidth - (GRID_PADDING * 2) - (CARD_MARGIN * 2 * numColumns)) / numColumns;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app, this would trigger a refetch from the API
    // For now, just simulate a delay and set refreshing to false
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filterPins = useCallback(() => {
    return pins.filter(pin => {
      const matchesSearch = searchQuery === '' ||
        pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const category = CATEGORIES.find(cat => cat.id === selectedCategory);
      const matchesCategory = selectedCategory === 'all' ||
        pin.title.includes(category.label) ||
        pin.description.includes(category.label);

      return matchesSearch && matchesCategory;
    });
  }, [pins, searchQuery, selectedCategory]);

  const renderPin = ({ item }) => (
    <Card
      style={[styles.card, { width: columnWidth }]}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Card.Cover 
        source={{ uri: item.imageUrl }} 
        style={[styles.image, { height: columnWidth * 1.3 }]} // 1.3 aspect ratio
      />
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          <Icon name="eye" size={12} /> {item.views || 0}
        </Text>
        <Text style={styles.statsText}>
          <Icon name="heart" size={12} /> {item.likes?.length || 0}
        </Text>
      </View>
      <Card.Title
        title={item.title}
        subtitle={item.category || 'Uncategorized'}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
      />
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
        </View>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const filteredPins = filterPins();

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: DARK_PURPLE_GREY }]}>
        <View style={styles.searchHeader}>
          <Searchbar
            placeholder="Search pins..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: LIGHT_PURPLE_GREY }]}
            iconColor="#fff"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            inputStyle={{ color: '#fff' }}
            icon={({ size }) => (
              <MaterialCommunityIcons name="magnify" size={size} color="#fff" />
            )}
            clearIcon={({ size }) => (
              <MaterialCommunityIcons name="close" size={size} color="#fff" />
            )}
          />
          <IconButton
            icon={({ size }) => (
              <MaterialCommunityIcons name="cog" size={size} color="#fff" />
            )}
            size={24}
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
          />
          <IconButton
            icon={({ size }) => (
              <MaterialCommunityIcons name="account-circle" size={size} color="#fff" />
            )}
            size={24}
            onPress={() => navigation.navigate('Profile')}
            style={styles.iconButton}
          />
        </View>
      </View>
      
      <View style={[styles.categoriesContainer, { backgroundColor: DARK_PURPLE_GREY }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: LIGHT_PURPLE_GREY },
                selectedCategory === item.id && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={{ 
                color: selectedCategory === item.id ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                fontSize: 12
              }}
              icon={({ size }) => (
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={size - 4} 
                  color={selectedCategory === item.id ? '#fff' : 'rgba(255, 255, 255, 0.9)'}
                />
              )}
            >
              {item.label}
            </Chip>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredPins}
        renderItem={renderPin}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        key={numColumns} // Force re-render when number of columns changes
        contentContainerStyle={[styles.list, { padding: GRID_PADDING }]}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>
            No pins found
          </Text>
        }
      />
      <FAB
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="plus" size={size} color={color} />
        )}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CreatePin')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 8,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchBar: {
    backgroundColor: LIGHT_PURPLE_GREY,
    borderRadius: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    alignItems: 'flex-start',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  card: {
    margin: CARD_MARGIN,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardSubtitle: {
    fontSize: 10,
    lineHeight: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 6,
    paddingBottom: 0,
    justifyContent: 'flex-end',
  },
  statsText: {
    fontSize: 10,
    marginLeft: 8,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
    paddingTop: 0,
  },
  tag: {
    height: 22,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  tagText: {
    fontSize: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  iconButton: {
    margin: 0,
    marginLeft: 4,
  },
});

export default HomeFeedScreen; 