import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { Searchbar, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const SearchScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('pins'); // 'pins' or 'boards'

  const searchItems = async (text) => {
    if (!text.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = searchType === 'pins' ? 'pins' : 'boards';
      const response = await fetch(
        `http://localhost:3000/api/${endpoint}/search?q=${encodeURIComponent(text)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Surface
      style={styles.item}
      onPress={() => navigation.navigate(
        searchType === 'pins' ? 'PinDetail' : 'BoardDetail',
        { [searchType === 'pins' ? 'pinId' : 'boardId']: item._id }
      )}
    >
      <Surface.Cover
        source={{ uri: searchType === 'pins' ? item.imageUrl : item.coverImage }}
        style={styles.image}
      />
      <Surface.Title
        title={searchType === 'pins' ? item.title : item.name}
        subtitle={searchType === 'pins' ? item.author.username : `${item.pins?.length || 0} pins`}
        titleNumberOfLines={2}
        style={styles.title}
      />
    </Surface>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search..."
          onChangeText={setQuery}
          value={query}
          style={styles.searchBar}
          onSubmitEditing={() => searchItems(query)}
        />
        <View style={styles.searchTypeContainer}>
          <Text
            style={[
              styles.searchType,
              searchType === 'pins' && styles.searchTypeActive,
            ]}
            onPress={() => setSearchType('pins')}
          >
            Pins
          </Text>
          <Text
            style={[
              styles.searchType,
              searchType === 'boards' && styles.searchTypeActive,
            ]}
            onPress={() => setSearchType('boards')}
          >
            Boards
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : null
          }
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  searchBar: {
    marginBottom: 8,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  searchType: {
    fontSize: 16,
    color: '#666',
  },
  searchTypeActive: {
    color: '#E60023',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  item: {
    width: itemWidth,
    margin: 8,
    elevation: 4,
  },
  image: {
    height: itemWidth,
  },
  title: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
});

export default SearchScreen; 