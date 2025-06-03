import { FormUpdateUserProfile, User, UserRespone } from '../types/user.type'
import http from '../utils/http';
import { SuccessResponse } from '../types/utils.type';

export const URL_GET_PROFILE = 'api/v1/users/profile'
export const URL_UPDATE_PROFILE = 'api/v1/users'

const userApi = {
  getProfile() {
    // Use the built-in retry in http.ts which already handles 500 errors
    return http.get<SuccessResponse<User>>(URL_GET_PROFILE);
  },
  
  updateProfile(body: FormUpdateUserProfile) {
    return http.put<UserRespone>(URL_UPDATE_PROFILE, body)
  },
}

export default userApi
