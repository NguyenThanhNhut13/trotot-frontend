import { ref } from 'yup'
import { AuthResponse } from '../types/auth.type'
import http from '../utils/http'
import { SuccessResponse, SuccessResponseOfUpdateCredentials } from '../types/utils.type'

export const URL_LOGIN = 'api/v1/auth/login'
export const URL_REGISTER = 'api/v1/auth/register'
export const URL_LOGOUT = 'api/v1/auth/logout'
export const URL_REFRESH_TOKEN = 'api/v1/auth/refresh'
export const URL_VERIFY_OTP = 'api/v1/auth/verify-otp'
export const URL_UPDATE_CREDENTIALS = 'api/v1/auth/me/credentials'
export const URL_UPDATE_CREDENTIALS_VERIFY = 'api/v1/auth/me/credentials/verify'
export const URL_FORGOT_PASSWORD_REQUEST = "api/v1/auth/forgot-password/request";
export const URL_FORGOT_PASSWORD_VERIFY_OTP = "api/v1/auth/forgot-password/verify-otp";
export const URL_FORGOT_PASSWORD_RESET = "api/v1/auth/forgot-password/reset";

const authApi = {
  registerAccount(body: { credential: string; fullName: String; password: string; confirmPassword: string }) {
    return http.post<AuthResponse>(URL_REGISTER, body)
  },
  login(body: { credential: string; password: string }) {
    return http.post<AuthResponse>(URL_LOGIN, body)
  },
  logout(body: { refreshToken: string }) {
    return http.post<AuthResponse>(URL_LOGOUT, body)
  },
  refreshToken(body: { accessToken: String; refreshToken: String }) {
    return http.post<AuthResponse>(URL_REFRESH_TOKEN, body)
  },
  verifyOtp(body: { credential: string; otp: string }) {
    return http.post<AuthResponse>(URL_VERIFY_OTP, body)
  },
  updateCredentials(body: { type: string; value: string }) {
    return http.post<SuccessResponseOfUpdateCredentials<null>>(URL_UPDATE_CREDENTIALS, body)
  },
  updateCredentialsVerify(body: { type: string; otp: string }) {
    return http.post<SuccessResponseOfUpdateCredentials<null>>(URL_UPDATE_CREDENTIALS_VERIFY, body)
  },

  forgotPasswordRequest(credential: string) {
    return http.post<SuccessResponse<null>>(`${URL_FORGOT_PASSWORD_REQUEST}/${credential}`);
  },

  forgotPasswordVerifyOtp(body: { type: string; credential: string; otp: string }) {
    return http.post<SuccessResponse<string>>(URL_FORGOT_PASSWORD_VERIFY_OTP, body)
  },

  resetPassword(body: { token: string; newPassword: string; confirmPassword: string }) {
    return http.post<SuccessResponse<null>>(URL_FORGOT_PASSWORD_RESET, body);
  },
}

export default authApi