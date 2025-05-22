import { SuccessResponse } from './utils.type'

export type AuthResponse = SuccessResponse<{
  accessToken: string
  refreshToken: string
}>

export type RefreshTokenReponse = SuccessResponse<{ accessToken: string , refreshToken: string }>

