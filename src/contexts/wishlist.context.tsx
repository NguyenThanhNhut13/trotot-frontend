import { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from './app.context';
import roomApi from '../apis/room.api';
import { toast } from 'react-toastify';

interface WishlistContextInterface {
  savedRoomIds: Set<number>;
  isRoomSaved: (roomId: number) => boolean;
  toggleSaveRoom: (roomId: number) => Promise<void>;
  refreshSavedRooms: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextInterface>({
  savedRoomIds: new Set<number>(),
  isRoomSaved: () => false,
  toggleSaveRoom: async () => {},
  refreshSavedRooms: async () => {},
});

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [savedRoomIds, setSavedRoomIds] = useState<Set<number>>(new Set());
  const { isAuthenticated } = useContext(AppContext);

  const refreshSavedRooms = async () => {
    if (!isAuthenticated) {
      setSavedRoomIds(new Set());
      return;
    }

    try {
      const response = await roomApi.getSavedRoomIds();
      if (response.data && Array.isArray(response.data.data)) {
        setSavedRoomIds(new Set(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching saved room IDs:', error);
    }
  };

  // Fetch saved room IDs when authenticated status changes
  useEffect(() => {
    refreshSavedRooms();
  }, [isAuthenticated]);

  const isRoomSaved = (roomId: number): boolean => {
    return savedRoomIds.has(roomId);
  };

  const toggleSaveRoom = async (roomId: number) => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để lưu phòng trọ');
      return;
    }

    try {
      if (isRoomSaved(roomId)) {
        await roomApi.removeFromWishList(roomId);
        setSavedRoomIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(roomId);
          return newSet;
        });
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await roomApi.addToWishList(roomId);
        setSavedRoomIds(prev => new Set(Array.from(prev).concat(roomId)));
        toast.success('Đã lưu phòng thành công');
      }
    } catch (error) {
      console.error('Error toggling saved room:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau');
    }
  };

  return (
    <WishlistContext.Provider value={{ savedRoomIds, isRoomSaved, toggleSaveRoom, refreshSavedRooms }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);