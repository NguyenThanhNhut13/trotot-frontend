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