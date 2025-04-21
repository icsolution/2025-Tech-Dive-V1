import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, Surface, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const UserPinsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  const fetchPins = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${userId}/pins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pins');
      }
      setPins(data);
    } catch (error) {
      console.error('Error fetching pins:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchPins();
    fetchUser();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPins();
  };

  const renderPin = ({ item }) => (
    <Surface
      style={styles.pinCard}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Surface.Cover
        source={{ uri: item.imageUrl }}
        style={styles.pinImage}
      />
      <Surface.Title
        title={item.title}
        subtitle={item.board?.name}
        titleNumberOfLines={2}
        style={styles.pinTitle}
      />
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
          {user?.username}'s Pins
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {pins.length} {pins.length === 1 ? 'pin' : 'pins'}
        </Text>
      </View>

      <FlatList
        data={pins}
        renderItem={renderPin}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pins found</Text>
        }
      />

      {userId === user?._id && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreatePin')}
        />
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  list: {
    padding: 8,
  },
  pinCard: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  pinImage: {
    height: itemWidth,
  },
  pinTitle: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserPinsScreen; 