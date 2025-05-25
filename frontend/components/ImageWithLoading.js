import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

const ImageWithLoading = ({
  source,
  style = {},
  width = 800,
  quality = 75,
  showLoading = true,
  loadingColor = '#f0f0f0',
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle image load end
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // Handle image load error
  const handleError = () => {
    setIsLoading(false);
    setError(true);
    console.warn('Failed to load image:', source);
  };

  // If there's an error, return a simple placeholder
  if (error) {
    return (
      <View 
        style={[
          styles.placeholder, 
          { backgroundColor: loadingColor },
          style
        ]} 
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: source }}
        style={[styles.image, { width, height: '100%' }]}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        resizeMode="cover"
        {...rest}
      />
      
      {isLoading && showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default ImageWithLoading;
