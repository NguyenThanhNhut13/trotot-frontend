
import { SuccessResponse } from "./utils.type";

export type Province = {
  id: string;
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
  isDeleted: boolean;
};

export type District = {
  id: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
  isDeleted: boolean;
};

export type Ward = {
  id: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
  isDeleted: boolean;
};

export type PaginatedAddressResponse = {
    nItems: number;
    nPages: number;
    data: Province[] | District[] | Ward[];
}

export type GetAddressResponse = SuccessResponse<PaginatedAddressResponse> 

export interface Address {
    id: number;
    province: string;
    district: string;
    ward: string;
    street: string;
    houseNumber: string;
    latitude: number | null;
    longitude: number | null;
  }

export type Forward = {
  latitude: number;
  longitude: number;
}