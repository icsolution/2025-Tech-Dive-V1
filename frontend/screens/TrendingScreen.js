import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, Surface, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const TrendingScreen = () => {
  const navigation = useNavigation();
  const [trendingItems, setTrendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'

  const fetchTrendingItems = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/pins/trending?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch trending items');
      }
      setTrendingItems(data);
    } catch (error) {
      console.error('Error fetching trending items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingItems();
  }, [timeRange]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrendingItems();
  };

  const renderItem = ({ item }) => (
    <Surface
      style={styles.itemCard}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Surface.Cover
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
      />
      <Surface.Title
        title={item.title}
        subtitle={item.author.username}
        titleNumberOfLines={2}
        style={styles.itemTitle}
      />
      <View style={styles.stats}>
        <Text variant="bodySmall" style={styles.stat}>
          {item.likes?.length || 0} likes
        </Text>
        <Text variant="bodySmall" style={styles.stat}>
          {item.saves?.length || 0} saves
        </Text>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Trending
        </Text>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={trendingItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No trending items found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  list: {
    padding: 8,
  },
  itemCard: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  itemImage: {
    height: itemWidth,
  },
  itemTitle: {
    padding: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    paddingTop: 0,
  },
  stat: {
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
});

export default TrendingScreen; 