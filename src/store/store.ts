import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import wishlistReducer from './slices/wishlistSlice'
// import roomReducer from './slices/roomSlice'
// import paymentReducer from './slices/paymentSlice'
// import reviewReducer from './slices/reviewSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    // room: roomReducer,
    // payment: paymentReducer,
    // review: reviewReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch