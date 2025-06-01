import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentAPI from '../../apis/payment.api';

// Add this action to fetch wallet data
export const fetchWalletData = createAsyncThunk(
  'payment/fetchWallet',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getWallet(userId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Could not fetch wallet data',
      });
    }
  }
);

// Within your paymentSlice, add this to the state and reducers
const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    reviews: [],
    loading: false,
    error: null,
    wallet: {
      balance: 0,
      loading: false,
      error: null as any // Explicitly type error as any to allow assignment
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletData.pending, (state) => {
        state.wallet.loading = true;
        state.wallet.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.wallet.loading = false;
        state.wallet.balance = action.payload.balance;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.wallet.loading = false;
        state.wallet.error = action.payload as any;
      });
  },
});

export default paymentSlice.reducer;