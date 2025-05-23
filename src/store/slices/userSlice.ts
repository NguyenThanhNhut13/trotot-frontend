import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../../apis/user.api';
import { User } from '../../types/user.type';
import { setProfileToLS } from '../../utils/auth';

interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: JSON.parse(localStorage.getItem('profile') || 'null'),
  isLoading: false,
  error: null,
};

export const getProfile = createAsyncThunk('user/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await userApi.getProfile();
    return response.data;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await userApi.updateProfile(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
        setProfileToLS(action.payload.data);
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data;
        setProfileToLS(action.payload.data);
      });
  },
});

export default userSlice.reducer;