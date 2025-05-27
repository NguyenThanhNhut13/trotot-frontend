import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../apis/user.api';
import authApi from '../../apis/auth.api';
import { User } from '../../types/user.type';

interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const getProfile = createAsyncThunk('user/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await userApi.getProfile();
    return response.data;
  } catch (error: any) {
    // Cải thiện thông báo lỗi
    return rejectWithValue({
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message || 'Không thể tải thông tin người dùng',
    });
  }
});

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Không thể cập nhật thông tin người dùng',
      });
    }
  }
);

// Thêm vào userSlice
export const upgradeUserRole = createAsyncThunk(
  'user/upgradeRole',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await authApi.upgradeRole();
      
      // Sau khi nâng cấp thành công, tải lại thông tin người dùng
      dispatch(getProfile());
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Không thể nâng cấp quyền người dùng',
      });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetProfile: (state) => {
      state.profile = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data;
      });
  },
});

export const { resetProfile } = userSlice.actions;
export default userSlice.reducer;