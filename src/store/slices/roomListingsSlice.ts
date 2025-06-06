import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import roomApi from '../../apis/room.api';
import { Room } from '../../types/room.type';

interface Listing {
  id: number;
  image: string;
  title: string;
  price: string;
  area: number;
  location: string;
}

interface RoomListingsState {
  listingsByType: Record<string, Listing[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  lastFetched?: Record<string, number>;
  savedRoomIds: number[];
}

const initialState: RoomListingsState = {
  listingsByType: {},
  loading: {},
  error: {},
  lastFetched: {},
  savedRoomIds: [],
};

// Async thunk for fetching rooms by type
export const fetchRoomsByType = createAsyncThunk(
  'roomListings/fetchRoomsByType',
  async ({ 
    roomType, 
    page = 0, 
    size = 25, 
    sort = 'createdAt,desc',
    forceRefresh = false
  }: { 
    roomType?: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE";
    page?: number;
    size?: number;
    sort?: string;
    forceRefresh?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      // Check if we need to fetch or can use cached data
      const state = getState() as any;
      const hasData = roomType && state.roomListings.listingsByType[roomType]?.length > 0;
      const lastFetched = roomType && state.roomListings.lastFetched?.[roomType];
      
      // If we have data and it's not too old, return cached data
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const isDataFresh = lastFetched && (Date.now() - lastFetched < CACHE_DURATION);
      
      if (hasData && isDataFresh && !forceRefresh) {
        return { 
          roomType, 
          listings: state.roomListings.listingsByType[roomType], 
          fromCache: true 
        };
      }
      const res = await roomApi.getRooms({ page, size, sort, roomType });
      const rooms = res.data.data.content;
      
      const mapped: Listing[] = rooms.map((room: Room) => {
        const district = room.district ?? "";
        const province = room.province ?? "";
        const location = `${district}, ${province}`.replace(/^, |, $/g, "");

        return {
          id: room.id,
          image: room.imageUrls[0] || 
            "https://tromoi.com/uploads/guest/o_1h5tpk1fl1i0047413epqpsee3a.jpg",
          title: room.title,
          price: `${room.price.toLocaleString()} VNĐ`,
          area: room.area,
          location,
        };
      });
      
      return { roomType, listings: mapped, fromCache: false };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for fetching saved room IDs
export const fetchSavedRoomIds = createAsyncThunk(
  'roomListings/fetchSavedRoomIds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomApi.getSavedRoomIds();
      return response.data.data.roomIds || [];
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for saving a room
export const saveRoom = createAsyncThunk(
  'roomListings/saveRoom',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await roomApi.addToWishList(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for removing a room from saved list
export const unsaveRoom = createAsyncThunk(
  'roomListings/unsaveRoom',
  async (roomId: number, { rejectWithValue }) => {
    try {
      await roomApi.removeFromWishList(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const roomListingsSlice = createSlice({
  name: 'roomListings',
  initialState,
  reducers: {
    clearRoomListings: (state) => {
      state.listingsByType = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchRoomsByType
      .addCase(fetchRoomsByType.pending, (state, action) => {
        const { roomType = 'all' } = action.meta.arg;
        state.loading[roomType] = true;
        state.error[roomType] = null;
      })
      .addCase(fetchRoomsByType.rejected, (state, action) => {
        const { roomType = 'all' } = action.meta.arg;
        state.loading[roomType] = false;
        state.error[roomType] = "Failed to load listings";
      })
      .addCase(fetchRoomsByType.fulfilled, (state, action) => {
        const { roomType = 'all', listings, fromCache = false } = action.payload;

        if (!fromCache) {
          state.listingsByType[roomType] = listings;
          // Update the lastFetched timestamp
          if (!state.lastFetched) state.lastFetched = {};
          state.lastFetched[roomType] = Date.now();
        }
        state.loading[roomType] = false;
      })
      
      // Handle fetchSavedRoomIds
      .addCase(fetchSavedRoomIds.fulfilled, (state, action) => {
        state.savedRoomIds = action.payload;
      })
      
      // Handle saveRoom
      .addCase(saveRoom.fulfilled, (state, action) => {
        if (!state.savedRoomIds.includes(action.payload)) {
          state.savedRoomIds.push(action.payload);
        }
      })
      
      // Handle unsaveRoom
      .addCase(unsaveRoom.fulfilled, (state, action) => {
        state.savedRoomIds = state.savedRoomIds.filter(id => id !== action.payload);
      });
  }
});

export const { clearRoomListings } = roomListingsSlice.actions;
export default roomListingsSlice.reducer;