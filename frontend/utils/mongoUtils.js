/**
 * Utility functions for working with MongoDB ObjectIds in the frontend
 */

/**
 * Checks if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean} - True if the ID is a valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id) return false;
  const str = String(id);
  return /^[0-9a-fA-F]{24}$/.test(str);
};

/**
 * Ensures an ID is in a valid ObjectId string format
 * @param {string|object} id - The ID to format
 * @returns {string|null} - The formatted ID or null if invalid
 */
export const formatObjectId = (id) => {
  if (!id) return null;
  
  // If it's already a string, validate it
  if (typeof id === 'string') {
    return isValidObjectId(id) ? id : null;
  }
  
  // If it's an object with a toString method (like an actual ObjectId)
  if (id.toString && typeof id.toString === 'function') {
    const str = id.toString();
    return isValidObjectId(str) ? str : null;
  }
  
  return null;
};
