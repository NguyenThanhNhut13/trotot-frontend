import { SuccessResponse } from "./utils.type";

export type RoomImage = {
    publicId: string;
    imageUrl: string;
  };
  
  export type Amenity = {
    id: number;
    name: string;
  };
  
  export type SurroundingArea = {
    id: number;
    name: string;
  };
  
  export type TargetAudience = {
    id: number;
    name: string;
  };
  
  export type Room = {
    id: number;
    userId: number;
    address: string | null;
    title: string;
    description: string;
    price: number;
    area: number;
    selfManaged: boolean;
    totalRooms: number;
    maxPeople: number;
    forGender: 'ALL' | 'MALE' | 'FEMALE';
    deposit: number;
    posterName: string;
    posterPhone: string;
    images: RoomImage[];
    imageUrls: string[]; 
    roomType: 'APARTMENT' | 'WHOLE_HOUSE' | 'BOARDING_HOUSE';
    amenities: Amenity[];
    surroundingAreas: SurroundingArea[];
    targetAudiences: TargetAudience[];
    numberOfLivingRooms: number;
    numberOfKitchens: number;
    numberOfBathrooms: number;
    numberOfBedrooms: number;
    createdAt: string;
    updatedAt: string;
    district: string;
    province: string;
  };
  
  export type PaginatedRoomResponse = {
    content: Room[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };

export type CreateRoomDTO = {
  userId: number;
  address: {
    id: number;
    province: string;
    district: string;
    ward: string;
    street: string;
    houseNumber: string;
    latitude?: number;
    longitude?: number;
  };
  title: string;
  description: string;
  price: number;
  area: number;
  selfManaged: boolean;
  totalRooms: number;
  maxPeople: number;
  forGender: "ALL" | "MALE" | "FEMALE" | "OTHER";
  deposit: number;
  posterName: string;
  posterPhone: string;
  images: {
    id: number;
    publicId?: string;
    imageUrl?: string;
  }[];
  roomType: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE";
  amenities: {
    id: number;
    name: string;
  }[];
  surroundingAreas: {
    id: number;
    name: string;
  }[];
  targetAudiences: {
    id: number;
    name: string;
  }[];
  numberOfLivingRooms: number;
  numberOfKitchens: number;
  numberOfBathrooms: number;
  numberOfBedrooms: number;
  createdAt?: string;
  updatedAt?: string;
};


// Search params interface
export interface RoomSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  street?: string;
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  areaRange?: string;
  roomType?: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE";
  amenities?: string | string[];
  environment?: string | string[];
  targetAudience?: string | string[];
  hasVideoReview?: boolean;
}
  
  export type GetRoomsResponse = SuccessResponse<PaginatedRoomResponse>;


  export type RoomGetByID = {
    id: number;
    userId: number;
    address: {
      id: number;
      province: string;
      district: string;
      ward: string;
      street: string;
      houseNumber: string;
      latitude: number;
      longitude: number;
    };
    title: string;
    description: string;
    price: number;
    area: number;
    selfManaged: boolean;
    totalRooms: number;
    maxPeople: number;
    forGender: "ALL" | "MALE" | "FEMALE";
    deposit: number;
    posterName: string;
    posterPhone: string;
    images: {
      id: number;
      publicId: string;
      imageUrl: string;
    }[];
    roomType: "APARTMENT" | "BOARDING_HOUSE" | "WHOLE_HOUSE";
    amenities: {
      id: number;
      name: string;
    }[];
    surroundingAreas: {
      id: number;
      name: string;
    }[];
    targetAudiences: {
      id: number;
      name: string;
    }[];
    numberOfLivingRooms: number;
    numberOfKitchens: number;
    numberOfBathrooms: number;
    numberOfBedrooms: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  };
  