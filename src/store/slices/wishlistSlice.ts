import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomApi from '../../apis/room.api';
import { toast } from 'react-toastify';

interface WishlistState {
  savedRoomIds: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  savedRoomIds: [],
  isLoading: false,
  error: null,
};

export const getSavedRoomIds = createAsyncThunk(
  'wishlist/getSavedRoomIds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getSavedRoomIds();
      return response.data.data.roomIds || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await roomApi.addToWishList(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await roomApi.removeFromWishList(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSavedRoomIds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSavedRoomIds.fulfilled, (state, action) => {
        state.savedRoomIds = action.payload;
        state.isLoading = false;
      })
      .addCase(getSavedRoomIds.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.savedRoomIds.push(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.savedRoomIds = state.savedRoomIds.filter(id => id !== action.payload);
      });
  },
});

export default wishlistSlice.reducer;