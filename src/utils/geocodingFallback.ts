import axios from 'axios';

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name?: string;
}

/**
 * Fallback geocoding function using OpenStreetMap when the backend API fails
 */
export const fallbackGeocode = async (address: string): Promise<GeocodingResult | null> => {
  try {
    // Use OpenStreetMap's Nominatim API as fallback
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'TroTot-Frontend/1.0',
        'Accept-Language': 'vi,en'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        display_name: response.data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Fallback geocoding failed:", error);
    return null;
  }
};

/**
 * Default coordinates for common Vietnam cities when all geocoding fails
 */
export const getDefaultCoordinates = (cityName: string) => {
  const cities: Record<string, {lat: number, lon: number}> = {
    'Đà Nẵng': {lat: 16.0544, lon: 108.2022},
    'Hồ Chí Minh': {lat: 10.8231, lon: 106.6297},
    'Hà Nội': {lat: 21.0278, lon: 105.8342},
  };
  
  return cities[cityName] || cities['Đà Nẵng']; // Default to Da Nang if city not found
};

/**
 * Generic retry function for API calls
 * @param apiCall Function that makes the API call
 * @param maxRetries Maximum number of retry attempts
 * @param delay Initial delay between retries in milliseconds
 * @returns Promise with the API response or throws an error after all retries
 */
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>, 
  maxRetries = 3, 
  delay = 1000
): Promise<T> => {
  let retries = 0;
  let lastError: any;

  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      // Only retry on server errors (500s) or network errors
      if (error?.response?.status && error.response.status < 500 && error.response.status !== 0) {
        throw error; // Don't retry for client errors (400s)
      }
      
      lastError = error;
      retries++;
      console.log(`API call failed. Attempt ${retries}/${maxRetries}. Retrying in ${delay}ms...`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff - double the delay for next retry
      delay *= 2;
    }
  }
  
  console.error('All retry attempts failed:', lastError);
  throw lastError;
};