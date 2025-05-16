import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text, Card, ActivityIndicator, FAB, Searchbar, IconButton, Menu } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { pinsAPI } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dummyPins } from '../data/dummyData';

const { width } = Dimensions.get('window');
const numColumns = 2;
const pinWidth = (width - 48) / numColumns; // 48 = padding (16) * 2 + gap (16)

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchPins = async () => {
    try {
      setLoading(true);
      // Use dummy data directly for now
      console.log('Loading dummy pins data');

      // Create a fixed set of pins with complete image URLs
      const fixedPins = [
        {
          _id: 'pin1',
          title: 'Mountain Adventure',
          description: 'Hiking in the Swiss Alps',
          imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Sarah Wilson' },
        },
        {
          _id: 'pin2',
          title: 'Beautiful Sunset',
          description: 'Captured this amazing sunset at the beach',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Alex Chen' },
        },
        {
          _id: 'pin3',
          title: 'Minimalist Living Room',
          description: 'Clean and serene living space with natural light',
          imageUrl: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Maya Patel' },
        },
        {
          _id: 'pin4',
          title: 'Urban Photography',
          description: 'City lights and architecture',
          imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Alex Chen' },
        },
        {
          _id: 'pin5',
          title: 'Healthy Breakfast',
          description: 'Start your day with nutritious food',
          imageUrl: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Sarah Wilson' },
        },
        {
          _id: 'pin6',
          title: 'Travel Inspiration',
          description: 'Exploring ancient ruins',
          imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
          author: { username: 'Maya Patel' },
        }
      ];

      setPins(fixedPins);
      setError(null);
    } catch (err) {
      console.error('Error setting up pins:', err);
      setError('Failed to load pins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
    const unsubscribe = navigation.addListener('refreshHome', () => {
      fetchPins();
    });
    return unsubscribe;
  }, [navigation]);

  const filteredPins = pins.filter(pin =>
    pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPin = ({ item }) => (
    <Card
      style={styles.pinCard}
      onPress={() => navigation.navigate('PinDetail', { pinId: item._id })}
    >
      <Card.Cover
        source={{ uri: item.imageUrl }}
        style={styles.pinImage}
        resizeMode="cover"
        onError={(e) => {
          console.error('Image loading error:', e.nativeEvent.error);
          console.log('Failed URL:', item.imageUrl);
        }}
      />
      <Card.Title
        title={item.title}
        subtitle={item.description}
        titleNumberOfLines={2}
        subtitleNumberOfLines={2}
        style={styles.pinTitle}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
 
        <View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="pinterest" size={size} color={color} />
                )}
                size={28}
                onPress={() => {
                  console.log("Account IconButton pressed!");
                  setMenuVisible(true);
                }}
                iconColor="#E60023"
                accessibilityLabel="Open account menu"
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile');
              }}
              title="Profile"
              leadingIcon={({ size, color }) => (
                <MaterialCommunityIcons name="account" size={size} color={color} />
              )}
            />
            {/* IC setting button */}
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Settings');
              }}
              title="Settings"
              leadingIcon={({ size, color }) => (
                <MaterialCommunityIcons name="cog" size={size} color={color} />
              )}
            />
            <Menu.Item
              onPress={async () => {
                setMenuVisible(false);
                await logout();
                navigation.replace('Login');
              }}
              title="Logout"
              leadingIcon={({ size, color }) => (
                <MaterialCommunityIcons name="logout" size={size} color={color} />
              )}
            />
          </Menu>
        </View>
        <Searchbar
          placeholder="Search pins"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { flex: 1 }]}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          )}
          iconColor="#E60023"
        />
      </View>

      <FlatList
        data={filteredPins}
        renderItem={renderPin}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.pinGrid}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="plus" size={size} color={color} />
        )}
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePin')}
        color="#fff"
        backgroundColor="#E60023"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, 
    paddingHorizontal: 8, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
    zIndex: 10, 
    elevation: 4, 
  },
  menu: {
    elevation: 10,
  },
  searchBar: {
    minWidth: 0, 
    backgroundColor: '#f5f5f5',
    elevation: 0,
    borderRadius: 24,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pinGrid: {
    padding: 16,
  },
  pinCard: {
    width: pinWidth,
    marginBottom: 16,
    marginRight: 16,
    elevation: 2,
  },
  pinImage: {
    height: pinWidth,
    backgroundColor: '#f0f0f0',  
  },
  pinTitle: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 