import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import wishlistReducer from './slices/wishlistSlice'
import roomReducer from './slices/roomSlice'
import paymentReducer from './slices/paymentSlice'
import reviewReducer from './slices/reviewSlice'
import roomListingsReducer from './slices/roomListingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    room: roomReducer,
    payment: paymentReducer,
    review: reviewReducer,
    roomListings: roomListingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'user/getProfile/rejected',
          'wishlist/getSavedRoomIds/rejected',
          'room/fetchRoomDetails/rejected',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['user.error', 'wishlist.error', 'room.error'],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch