import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hook';
import { toast } from 'react-toastify';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireRole = [],
  redirectPath = '/'
}) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { profile } = useAppSelector(state => state.user);
  const location = useLocation();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tiếp tục!", {
        position: "top-right",
        autoClose: 3000
      });
    } else if (requireRole.length > 0 && profile) {
      toast.error("Bạn không có quyền truy cập trang này!", {
        position: "top-right", 
        autoClose: 3000
      });
    }
  }, [requireAuth, isAuthenticated, requireRole, profile]);

  // Kiểm tra xác thực
  if (requireAuth && !isAuthenticated) {
    // Lưu đường dẫn hiện tại để sau khi đăng nhập có thể chuyển hướng về
    return <Navigate to={redirectPath} state={{ 
      from: location.pathname,
      isRedirect: true, // Flag để đánh dấu đây là redirect
      skipFetch: true, 
      reason: 'auth_required' 
    }} replace />;
  }

  // Kiểm tra role nếu yêu cầu
  if (requireRole.length > 0 && profile) {
    return <Navigate to={redirectPath} state={{ 
      from: location.pathname,
      isRedirect: true, 
      skipFetch: true, 
      reason: 'permission_denied' 
    }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;