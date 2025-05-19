import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, ActivityIndicator, FAB, Searchbar, IconButton, Menu } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { pinsAPI } from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

const { width } = Dimensions.get('window');

// Fixed configurations for different grid sizes
const GRID_CONFIGS = {
  small: {
    numColumns: 3,
    pinWidth: (width - 64) / 3, // 64 = padding (16) * 2 + gap (16) * 2
  },
  medium: {
    numColumns: 2,
    pinWidth: (width - 48) / 2, // 48 = padding (16) * 2 + gap (16)
  },
  large: {
    numColumns: 1,
    pinWidth: width - 32, // 32 = padding (16) * 2
  }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { settings } = useSettings();
  const { darkMode, gridSize } = settings;
  
  // Get grid configuration based on settings
  const { numColumns, pinWidth } = GRID_CONFIGS[gridSize] || GRID_CONFIGS.medium;

  const fetchPins = async () => {
    try {
      setLoading(true);
      console.log('Fetching pins from database');
      
      // Fetch pins from the API
      const fetchedPins = await pinsAPI.getAllPins();
      console.log('Fetched pins from database:', fetchedPins.length);
      
      // Process pins to ensure they have all required fields
      const processedPins = fetchedPins.map(pin => ({
        ...pin,
        author: pin.user ? { username: pin.user.username } : { username: 'Unknown' },
        likes: pin.likes || [],
        saves: pin.saves || [],
        comments: pin.comments || [],
        tags: pin.tags || []
      }));
      
      setPins(processedPins);
      setError(null);
    } catch (err) {
      console.error('Error fetching pins from database:', err);
      setError('Failed to load pins from database');
      
      // Fallback to empty pins array if fetch fails
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  // We don't need to force re-renders anymore since we're using conditional rendering

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
      style={[styles.pinCard, { width: pinWidth }]}
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
      <View style={styles.pinTitle}>
        <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
        <Text numberOfLines={2} style={{ fontSize: 14, color: '#666' }}>
          {item.description}
          {item.user && item.user.username && ` • ${item.user.username}`}
        </Text>
      </View>
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
    <View style={[styles.container,
      {
        backgroundColor: darkMode ? '#333' : '#fff',
      }]}>
      <View style={[styles.header, darkMode && styles.headerDarkMode]}>

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

      {/* Render different FlatList components based on grid size */}
      {gridSize === 'small' && (
        <FlatList
          data={filteredPins}
          renderItem={renderPin}
          keyExtractor={(item) => item._id}
          numColumns={GRID_CONFIGS.small.numColumns}
          contentContainerStyle={styles.pinGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
      {gridSize === 'medium' && (
        <FlatList
          data={filteredPins}
          renderItem={renderPin}
          keyExtractor={(item) => item._id}
          numColumns={GRID_CONFIGS.medium.numColumns}
          contentContainerStyle={styles.pinGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
      {gridSize === 'large' && (
        <FlatList
          data={filteredPins}
          renderItem={renderPin}
          keyExtractor={(item) => item._id}
          numColumns={GRID_CONFIGS.large.numColumns}
          contentContainerStyle={styles.pinGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8, 
    paddingHorizontal: 8, 
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
    zIndex: 10, 
    elevation: 4, 
  },
  headerDarkMode: {
    backgroundColor: '#333',
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
    marginBottom: 16,
    marginRight: 16,
    elevation: 2,
  },
  pinImage: {
    aspectRatio: 1, // This maintains the aspect ratio regardless of width
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