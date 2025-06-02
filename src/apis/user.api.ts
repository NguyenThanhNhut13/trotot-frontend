import { FormUpdateUserProfile, User, UserRespone } from '../types/user.type'
import http, { Http } from '../utils/http';
import { SuccessResponse } from '../types/utils.type';
import { toast } from 'react-toastify';

export const URL_GET_PROFILE = 'api/v1/users/profile'
export const URL_UPDATE_PROFILE = 'api/v1/users'

// Add this retry function specifically for critical API calls like getProfile
const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3, 
  initialDelay = 2000  // Longer initial delay for cold starts
): Promise<T> => {
  let retries = 0;
  let lastError: any;

  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      retries++;
      
      // Calculate longer delays for cold starts and CORS issues
      const delay = initialDelay * Math.pow(2, retries - 1);
      
      // Special handling for CORS and network errors
      if (error.message === 'Network Error' || 
          error.code === 'ERR_NETWORK' || 
          error.message?.includes('CORS')) {
        console.log(`CORS/Network error detected. Waiting longer before retry ${retries}/${maxRetries}...`);
      } else {
        console.log(`API call failed. Attempt ${retries}/${maxRetries}. Retrying in ${delay}ms...`);
      }
      
      // Show user-friendly toast for longer delays
      if (retries === 1) {
        toast.info("Đang kết nối lại với máy chủ, vui lòng đợi...", {
          autoClose: delay
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // After all retries fail
  console.error('All retry attempts failed:', lastError);
  throw lastError;
};

const userApi = {
  // Wrap getProfile with retry logic
  getProfile() {
    return retryApiCall(() => http.get<SuccessResponse<User>>('api/v1/users/profile'));
  },
  updateProfile(body: FormUpdateUserProfile) {
    return http.put<UserRespone>(URL_UPDATE_PROFILE, body)
  },
}

export default userApi
