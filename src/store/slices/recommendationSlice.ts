import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomApi from '../../apis/room.api';

// Định nghĩa kiểu cho phòng được gợi ý
export interface RecommendedRoom {
  id: number;
  title: string;
  price: number;
  area: number;
  roomType: string;
  imageUrls: string[];
  district: string;
  province: string;
}

// Định nghĩa state
interface RecommendationState {
  rooms: RecommendedRoom[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean;
}

// Initial state
const initialState: RecommendationState = {
  rooms: [],
  loading: false,
  error: null,
  hasLoaded: false
};

// Thunk để lấy danh sách phòng trọ được đề xuất
export const fetchRecommendedRooms = createAsyncThunk(
  'recommendation/fetchRecommendedRooms',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await roomApi.getUserRecommendations(userId);
      
      // API trả về theo format đã cho
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      return rejectWithValue('Định dạng dữ liệu không hợp lệ');
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Không thể tải gợi ý phòng trọ do kết nối quá chậm. Vui lòng thử lại sau.');
      }
      return rejectWithValue(error.message || 'Không thể tải gợi ý phòng trọ. Vui lòng thử lại sau.');
    }
  }
);

// Tạo slice
const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    resetRecommendations: (state) => {
      state.hasLoaded = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendedRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.loading = false;
        state.hasLoaded = true;
      })
      .addCase(fetchRecommendedRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasLoaded = true;
      });
  }
});

// Export actions và reducer
export const { resetRecommendations } = recommendationSlice.actions;
export default recommendationSlice.reducer;