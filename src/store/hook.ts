import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { checkAndRefreshToken } from './slices/authSlice';

const REFRESH_THRESHOLD = 2 * 60 * 1000;

// Thời gian kiểm tra token định kỳ (đơn vị: mili giây)
// Ví dụ: 1 phút = 60000 ms
const CHECK_INTERVAL = 60 * 1000;

export const useTokenRefresh = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, refreshToken, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getTokenExpiration = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      // Thời gian hết hạn (tính bằng giây) nhân với 1000 để chuyển thành mili giây
      return decoded.exp * 1000;
    } catch (error) {
      console.error('Error decoding token:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Chỉ thiết lập interval nếu người dùng đã đăng nhập
    if (isAuthenticated && accessToken && refreshToken) {
      // Hủy interval cũ nếu có
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Kiểm tra và refresh token ngay lập tức khi component mount
      const checkAndRefreshIfNeeded = async () => {
        if (!accessToken) return;

        const expirationTime = getTokenExpiration(accessToken);
        const currentTime = Date.now();
        
        // Nếu token sắp hết hạn (còn ít hơn threshold), refresh nó
        if (expirationTime - currentTime < REFRESH_THRESHOLD) {
          console.log('Token sắp hết hạn, đang refresh...');
          try {
            await dispatch(checkAndRefreshToken()).unwrap();
          } catch (error) {
            console.error('Lỗi khi refresh token:', error);
          }
        }
      };

      // Gọi kiểm tra ngay lập tức
      checkAndRefreshIfNeeded();

      // Thiết lập interval để kiểm tra định kỳ
      intervalRef.current = setInterval(checkAndRefreshIfNeeded, CHECK_INTERVAL);

      // Thêm event listeners để phát hiện người dùng active
      const resetInterval = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(checkAndRefreshIfNeeded, CHECK_INTERVAL);
        }
      };

      // Các sự kiện cho biết người dùng đang active
      window.addEventListener('mousemove', resetInterval);
      window.addEventListener('keypress', resetInterval);
      window.addEventListener('scroll', resetInterval);
      window.addEventListener('click', resetInterval);

      // Clean up
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        window.removeEventListener('mousemove', resetInterval);
        window.removeEventListener('keypress', resetInterval);
        window.removeEventListener('scroll', resetInterval);
        window.removeEventListener('click', resetInterval);
      };
    } else if (intervalRef.current) {
      // Nếu người dùng đã đăng xuất, hủy interval
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [dispatch, isAuthenticated, accessToken, refreshToken]);
};

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const [device, setDevice] = useState({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 992,
    isDesktop: window.innerWidth >= 992,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setDevice({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 992,
        isDesktop: width >= 992,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, ...device };
}

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector