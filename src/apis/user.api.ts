import { FormUpdateUserProfile, User, UserRespone } from '../types/user.type'
import http from '../utils/http'

export const URL_GET_PROFILE = 'api/v1/users/profile'
export const URL_UPDATE_PROFILE = 'api/v1/users'

const userApi = {
  getProfile() {
    return http.get<UserRespone>(URL_GET_PROFILE)
  },
  updateProfile(body: FormUpdateUserProfile) {
    return http.put<UserRespone>(URL_UPDATE_PROFILE, body)
  },
}

export default userApi
