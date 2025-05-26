import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Base selectors
const selectRoomListingsState = (state: RootState) => state.roomListings;

// Memoized selectors
export const selectListingsByType = createSelector(
  [selectRoomListingsState, (_state: RootState, roomType?: string) => roomType],
  (roomListingsState, roomType) => {
    if (!roomType) return [];
    return roomListingsState.listingsByType[roomType] || [];
  }
);

export const selectLoadingStatus = createSelector(
  [selectRoomListingsState, (_state: RootState, roomType?: string) => roomType],
  (roomListingsState, roomType) => {
    if (!roomType) return false;
    return roomListingsState.loading[roomType] || false;
  }
);

export const selectError = createSelector(
  [selectRoomListingsState, (_state: RootState, roomType?: string) => roomType],
  (roomListingsState, roomType) => {
    if (!roomType) return null;
    return roomListingsState.error[roomType] || null;
  }
);

export const selectLastFetched = createSelector(
  [selectRoomListingsState, (_state: RootState, roomType?: string) => roomType],
  (roomListingsState, roomType) => {
    if (!roomType) return null;
    return roomListingsState.lastFetched?.[roomType] || null;
  }
);

export const selectSavedRoomIds = createSelector(
  [selectRoomListingsState],
  (roomListingsState) => roomListingsState.savedRoomIds
);