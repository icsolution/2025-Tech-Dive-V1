import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Text, Surface, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = width / numColumns - 16;

const SelectBoardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { boards, selectedBoardId, onSelect } = route.params;

  console.log('SelectBoardScreen mounted with:', { 
    boards: boards.map(board => ({
      id: board._id,
      name: board.name,
      pinCount: board.pins?.length || 0,
      isSelected: board._id === selectedBoardId
    })),
    selectedBoardId,
    onSelect: !!onSelect 
  });

  const handleSelect = (boardId) => {
    console.log('Handling board selection:', {
      boardId,
      boardName: boards.find(b => b._id === boardId)?.name,
      wasPreviouslySelected: boardId === selectedBoardId
    });
    if (onSelect) {
      onSelect(boardId);
      navigation.goBack();
    } else {
      console.error('No onSelect handler provided');
    }
  };

  const renderBoard = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item._id)}
      style={[
        styles.boardCard,
        selectedBoardId === item._id && styles.selectedBoard,
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

  return (
    <View style={styles.container}>
      <FlatList
        data={boards}
        renderItem={renderBoard}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No boards found</Text>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBoard')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  list: {
    padding: 8,
  },
  boardCard: {
    width: itemWidth,
    margin: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedBoard: {
    borderColor: '#E60023',
    borderWidth: 2,
  },
  boardContent: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: itemWidth,
  },
  boardImage: {
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
  },
  boardInfo: {
    padding: 12,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#E60023',
  },
});

export default SelectBoardScreen; 