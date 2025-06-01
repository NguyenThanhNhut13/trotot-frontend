import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authApi from '../../apis/auth.api';
import { setAccessTokenToLS, setRefreshTokenToLS, clearLS, getRefreshTokenFromLS } from '../../utils/auth';
import { getProfile, resetProfile } from './userSlice';
import { jwtDecode } from 'jwt-decode'; 

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: Boolean(localStorage.getItem('accessToken')),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { credential: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.data && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        // Lưu token vào localStorage ngay tại đây
        setAccessTokenToLS(accessToken);
        setRefreshTokenToLS(refreshToken);
        return response.data;
      }
      return rejectWithValue("Định dạng phản hồi không hợp lệ");
    } catch (error: any) {
      // Log lỗi chi tiết để debug
      console.error("Login error details:", error);
      
      // Trả về đầy đủ chi tiết lỗi cho người dùng
      if (error.response) {
        // Lỗi từ server với response
        return rejectWithValue({
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message || "Đăng nhập thất bại"
        });
      }
      
      // Lỗi network hoặc lỗi khác
      return rejectWithValue({
        message: error.message || "Không thể kết nối đến máy chủ"
      });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (payload: { refreshToken?: string } = {}, { dispatch, rejectWithValue }) => {
    try {
      // Sử dụng refreshToken từ tham số hoặc từ localStorage
      const refreshToken = payload.refreshToken || getRefreshTokenFromLS();
      
      // Nếu có refreshToken thì gọi API logout
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
      
      // Xóa dữ liệu trong localStorage
      clearLS();

      dispatch(resetProfile());

      return { success: true };
    } catch (error) {
      // Xóa localStorage ngay cả khi API thất bại
      clearLS();

      dispatch(resetProfile());
      
      return rejectWithValue(error);
    }
  }
);

export const checkAndRefreshToken = createAsyncThunk(
  'auth/checkAndRefreshToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Lấy token từ localStorage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Nếu không có token, không làm gì
      if (!accessToken || !refreshToken) {
        return rejectWithValue('No tokens available');
      }
      
      // Kiểm tra token có hết hạn chưa
      const isTokenExpired = (token: string) => {
        try {
          const decoded: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          return decoded.exp < currentTime;
        } catch {
          // Nếu không decode được, coi như token không hợp lệ
          return true;
        }
      };
      
      // Nếu access token chưa hết hạn, không cần refresh
      if (!isTokenExpired(accessToken)) {
        // Token vẫn còn hiệu lực, cập nhật state
        dispatch(setCredentials({ accessToken, refreshToken }));
        return { accessToken, refreshToken };
      }
      
      // Nếu access token hết hạn, thử refresh
      const response = await authApi.refreshToken({ accessToken, refreshToken });
      if (response.data && response.data.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Lưu token mới vào localStorage và cập nhật state
        setAccessTokenToLS(newAccessToken);
        setRefreshTokenToLS(newRefreshToken);
        
        // Cập nhật state trong redux
        dispatch(setCredentials({ 
          accessToken: newAccessToken, 
          refreshToken: newRefreshToken 
        }));
        
        // Tải thông tin người dùng sau khi refresh token thành công
        try {
          await dispatch(getProfile());
        } catch (error) {
          console.error('Error loading profile after token refresh:', error);
        }
        
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      }
      
      return rejectWithValue('Failed to refresh token');
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // Nếu refresh thất bại, xóa token và reset state
      clearLS();
      dispatch(resetAuth());
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const refreshTokenFromServer = createAsyncThunk(
  'auth/refreshTokenFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const storedAccessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }
      
      // Call your API endpoint to refresh the token
      const response = await authApi.refreshToken({ accessToken: storedAccessToken as string, refreshToken });
      
      // Update tokens in localStorage
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to refresh token',
        status: error.response?.status
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      setAccessTokenToLS(accessToken);
      setRefreshTokenToLS(refreshToken);
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      clearLS();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        setAccessTokenToLS(action.payload.data.accessToken);
        setRefreshTokenToLS(action.payload.data.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(checkAndRefreshToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(checkAndRefreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(refreshTokenFromServer.fulfilled, (state, action) => {
        state.isAuthenticated = true;
      })
      .addCase(refreshTokenFromServer.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload as string;
      })
    }
});

export const { setCredentials, resetAuth } = authSlice.actions;
export default authSlice.reducer;