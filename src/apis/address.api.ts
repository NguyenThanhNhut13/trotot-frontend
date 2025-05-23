import { SuccessResponse } from "../types/utils.type";
import { Province, District, Ward, GetAddressResponse, Forward } from "../types/address.type";
import axios from "axios";

import http from '../utils/http';
import { Address } from '../types/address.type'
import { get } from "lodash";

interface Coordinates {
  lat: number;
  lon: number;
}

// External API URLs
export const URL_GET_PROVINCES =
  "provinces/getAll";
export const URL_GET_DISTRICTS_BY_PROVINCE =
  "districts/getByProvince";
export const URL_GET_WARDS_BY_DISTRICT =
  "wards/getByDistrict";

export const URL_GET_ADDRESSES = 'api/v1/addresses';
export const URL_GET_MAP_FORWARD = "api/v1/geocode/forward"

// Create a separate axios instance for the external API
const externalHttp = axios.create({
  baseURL: "https://vn-public-apis.fpo.vn/",
  headers: {
    "Content-Type": "application/json",
  },
});


const addressAPI = {
  getProvinces() {
    return externalHttp.get<GetAddressResponse>(URL_GET_PROVINCES, {
      params: { limit: -1 },
    });
  },

  getDistricts(provinceCode: string) {
    return externalHttp.get<GetAddressResponse>(
      URL_GET_DISTRICTS_BY_PROVINCE,
      {
        params: { provinceCode, limit: -1 },
      }
    );
  },

  getWards(districtCode: string) {
    return externalHttp.get<GetAddressResponse>(URL_GET_WARDS_BY_DISTRICT, {
      params: { districtCode, limit: -1 },
    });
  },
  getAddresses(params: { street?: string; district?: string; province?: string } = {}) {
    const { street, district, province } = params;
    return http.get<SuccessResponse<Address[]>>(`${URL_GET_ADDRESSES}/search`, {
      params: { street, district, province },
    });
  },

  getAllAddresses() {
    return http.get<SuccessResponse<Address[]>>(URL_GET_ADDRESSES);
  },

  getAddressById(id: number) {
    return http.get<SuccessResponse<Address>>(`${URL_GET_ADDRESSES}/${id}`);
  },

  saveAddress(address: Address) {
    return http.post<SuccessResponse<Address>>(URL_GET_ADDRESSES, address);
  },

  updateAddress(id: number, address: Address) {
    return http.put<SuccessResponse<Address>>(`${URL_GET_ADDRESSES}/${id}`, address);
  },

  deleteAddress(id: number) {
    return http.delete<SuccessResponse<void>>(`${URL_GET_ADDRESSES}/${id}`);
  },

  getMapForward(address: string) {
    return http.get<SuccessResponse<Forward>>(URL_GET_MAP_FORWARD, {
      params: { address }
    });
  }
};

export default addressAPI;

export interface GeocodingResponse {
  lat: number;
  lon: number;
  display_name: string;
}

export const getMapForward = async (address: string) => {
  // Ensure address is a string
  const addressString = typeof address === 'object' 
    ? Object.values(address).filter(Boolean).join(', ')
    : address;
    
  try {
    // Use relative URL to work with proxy
    return await axios.get('/api/v1/geocode/forward', {
      params: { address: addressString }
    });
  } catch (error) {
    console.error('Geocoding API failed:', error);
    throw error;
  }
};

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name?: string;
}

export interface ForwardGeocodingResponse {
  data: {
    success: boolean;
    message: string;
    data: GeocodingResult | GeocodingResult[];
  }
}