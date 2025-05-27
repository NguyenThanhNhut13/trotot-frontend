import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authApi from '../../apis/auth.api';
import { setAccessTokenToLS, setRefreshTokenToLS, clearLS, getRefreshTokenFromLS } from '../../utils/auth';

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
  async (payload: { refreshToken?: string } = {}, { rejectWithValue }) => {
    try {
      // Sử dụng refreshToken từ tham số hoặc từ localStorage
      const refreshToken = payload.refreshToken || getRefreshTokenFromLS();
      
      // Nếu có refreshToken thì gọi API logout
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
      
      // Xóa dữ liệu trong localStorage
      clearLS();
      return { success: true };
    } catch (error) {
      // Xóa localStorage ngay cả khi API thất bại
      clearLS();
      return rejectWithValue(error);
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
      });
  },
});

export const { setCredentials, resetAuth } = authSlice.actions;
export default authSlice.reducer;