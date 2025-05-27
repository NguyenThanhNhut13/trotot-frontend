import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomApi from '../../apis/room.api';
import { toast } from 'react-toastify';

interface Room {
  id: number;
  title: string;
  address: string;
  price: string;
  type: string;
  area: number;
  imageUrl: string;
  district: string;
  province: string;
  isHot?: boolean;
}

interface SavedRoomsState {
  items: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: SavedRoomsState = {
  items: [],
  loading: false,
  error: null,
};

// Thunk để lấy danh sách phòng đã lưu
export const fetchSavedRooms = createAsyncThunk(
  'savedRooms/fetchSavedRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getWishList();
      
      if (response.data && Array.isArray(response.data.data)) {
        // Map API response to Room interface
        return response.data.data.map((item: any) => ({
          id: item.id,
          title: item.title || "Không có tiêu đề",
          address: item.address || "Không có địa chỉ",
          price: item.price ? `${item.price} triệu/tháng` : "Liên hệ",
          type: item.type || "Nhà trọ, phòng trọ",
          area: item.area || 0,
          imageUrl: item.imageUrls[0] || "/images/default-room.jpg",
          district: item.district || "",
          province: item.province || "",
          isHot: item.isHot || false,
        }));
      }
      
      return rejectWithValue('Định dạng dữ liệu không hợp lệ');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách phòng đã lưu');
    }
  }
);

// Thunk để xóa phòng khỏi danh sách đã lưu
export const removeSavedRoom = createAsyncThunk(
  'savedRooms/removeSavedRoom',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await roomApi.removeFromWishList(roomId);
      return roomId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa phòng khỏi danh sách yêu thích');
    }
  }
);

const savedRoomsSlice = createSlice({
  name: 'savedRooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchSavedRooms
      .addCase(fetchSavedRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSavedRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Xử lý removeSavedRoom
      .addCase(removeSavedRoom.fulfilled, (state, action) => {
        state.items = state.items.filter(room => room.id !== action.payload);
      })
      .addCase(removeSavedRoom.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default savedRoomsSlice.reducer;