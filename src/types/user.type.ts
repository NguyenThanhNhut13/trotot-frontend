import { SuccessResponse } from "./utils.type"

export type Role = 'ADMIN' | 'USER'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK'

export interface User {
  id: number 
  fullName: string
  address: string
  dob: string
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  cccd: string
  numberOfPosts: number
}

export type UserRespone = SuccessResponse<{
  id: number 
  fullName: string
  address: string
  dob: string
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  cccd: string
  numberOfPosts: number
}>

// Define the shape of the form data
export interface FormUpdateUserProfile {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  dob: string;
  cccd: string;
  address: string;
}