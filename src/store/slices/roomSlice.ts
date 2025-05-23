import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  loading: false,
  error: null
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {},
  extraReducers: () => {}
});

export default roomSlice.reducer;