/**
 * Optimizes an Unsplash image URL for better performance
 * @param {string} url - The original Unsplash image URL
 * @param {Object} options - Optimization options
 * @param {number} [options.width=800] - Target width in pixels
 * @param {number} [options.quality=75] - Image quality (1-100)
 * @returns {string} Optimized image URL
 */
const optimizeImageUrl = (url, { width = 800, quality = 75 } = {}) => {
  if (!url) return url;
  
  try {
    // Parse the URL
    const urlObj = new URL(url);
    
    // Only process Unsplash URLs
    if (!urlObj.hostname.includes('unsplash.com')) {
      return url;
    }
    
    // Add or update query parameters for optimization
    urlObj.searchParams.set('auto', 'format');  // Auto-optimize format
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', Math.min(100, Math.max(1, quality)).toString());
    
    // Use more efficient format if supported by the browser
    if (urlObj.searchParams.get('fm') === undefined) {
      urlObj.searchParams.set('fm', 'webp');
    }
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Error optimizing image URL:', error);
    return url;
  }
};

/**
 * Creates an optimized image component with FastImage
 * @param {Object} props - Component props
 * @param {string} props.source - Image source URL
 * @param {Object} [props.style] - Additional styles
 * @param {number} [props.width] - Target width
 * @param {number} [props.quality] - Image quality (1-100)
 * @returns {JSX.Element} Optimized Image component
 */
const OptimizedImage = ({
  source,
  style = {},
  width = 800,
  quality = 75,
  ...rest
}) => {
  // Import FastImage dynamically to avoid issues with SSR
  const FastImage = require('react-native-fast-image').default;
  
  // If source is not a string or is empty, return null or a placeholder
  if (!source) {
    return null;
  }
  
  // Optimize the image URL
  const optimizedUri = optimizeImageUrl(source, { width, quality });
  
  return (
    <FastImage
      source={{ uri: optimizedUri }}
      style={style}
      resizeMode={FastImage.resizeMode.cover}
      {...rest}
    />
  );
};

export {
  optimizeImageUrl,
  OptimizedImage,
};

export default {
  optimizeImageUrl,
  OptimizedImage,
};
