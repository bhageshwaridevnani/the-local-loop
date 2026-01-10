/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Validate inputs
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  
  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a location is within a specified radius
 * @param {number} lat1 - Latitude of center point
 * @param {number} lon1 - Longitude of center point
 * @param {number} lat2 - Latitude of target point
 * @param {number} lon2 - Longitude of target point
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} True if within radius
 */
function isWithinRadius(lat1, lon1, lat2, lon2, radiusKm = 5) {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance !== null && distance <= radiusKm;
}

/**
 * Get the closest location from a list of locations
 * @param {number} lat - Latitude of reference point
 * @param {number} lon - Longitude of reference point
 * @param {Array} locations - Array of locations with latitude and longitude
 * @returns {Object} Closest location with distance
 */
function getClosestLocation(lat, lon, locations) {
  if (!locations || locations.length === 0) {
    return null;
  }

  let closest = null;
  let minDistance = Infinity;

  locations.forEach(location => {
    const distance = calculateDistance(lat, lon, location.latitude, location.longitude);
    if (distance !== null && distance < minDistance) {
      minDistance = distance;
      closest = { ...location, distance };
    }
  });

  return closest;
}

/**
 * Sort locations by distance from a reference point
 * @param {number} lat - Latitude of reference point
 * @param {number} lon - Longitude of reference point
 * @param {Array} locations - Array of locations with latitude and longitude
 * @returns {Array} Sorted array of locations with distance
 */
function sortByDistance(lat, lon, locations) {
  if (!locations || locations.length === 0) {
    return [];
  }

  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(lat, lon, location.latitude, location.longitude)
    }))
    .filter(location => location.distance !== null)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter locations within a specified radius
 * @param {number} lat - Latitude of center point
 * @param {number} lon - Longitude of center point
 * @param {Array} locations - Array of locations with latitude and longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} Filtered and sorted array of locations
 */
function filterByRadius(lat, lon, locations, radiusKm = 5) {
  if (!locations || locations.length === 0) {
    return [];
  }

  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(lat, lon, location.latitude, location.longitude)
    }))
    .filter(location => location.distance !== null && location.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
function formatDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined) {
    return 'N/A';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(2)} km`;
}

module.exports = {
  calculateDistance,
  isWithinRadius,
  getClosestLocation,
  sortByDistance,
  filterByRadius,
  formatDistance
};

