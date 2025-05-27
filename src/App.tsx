import "./App.css";
import useRouteElement from "./useRouteElement";
import ChatboxAI from "./components/Chat/ChatboxAI";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store/store";
import { useEffect } from "react";
import { checkAndRefreshToken } from "./store/slices/authSlice";
import { getProfile } from "./store/slices/userSlice";
import { useTokenRefresh } from "./store/hook";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

function App() {
  const routeElement = useRouteElement();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useTokenRefresh();

  useEffect(() => {
    const handlePaymentCallback = () => {
      // Kiểm tra xem URL hiện tại có chứa thông tin callback từ VNPAY không
      const urlParams = new URLSearchParams(window.location.search);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      
      // Chỉ xử lý nếu có response code (tức là đang trong luồng callback thanh toán)
      if (vnp_ResponseCode) {
        // Lấy đường dẫn redirect đã lưu
        const redirectPath = localStorage.getItem('redirectAfterPayment') || '/';
        
        // Xóa khỏi localStorage sau khi đã lấy
        localStorage.removeItem('redirectAfterPayment');
        
        // Kiểm tra kết quả thanh toán
        if (vnp_ResponseCode === '00') {
          toast.success('Nạp tiền thành công!', {
            position: 'top-right',
            autoClose: 3000
          });
          
          // Chuyển hướng về trang đăng trọ sau 1.5 giây
          setTimeout(() => {
            navigate(redirectPath);
          }, 1500);
        } else {
          toast.error('Thanh toán không thành công. Mã lỗi: ' + vnp_ResponseCode, {
            position: 'top-right',
            autoClose: 3000
          });
          
          // Chuyển hướng về trang nạp tiền sau 2 giây
          setTimeout(() => {
            navigate('/deposit');
          }, 2000);
        }
      }
    };
    
    handlePaymentCallback();
  }, [location.search, navigate]);

  useEffect(() => {
    const loadUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          // Nếu có token trong localStorage, thử lấy thông tin người dùng
          await dispatch(checkAndRefreshToken()).unwrap();
          await dispatch(getProfile()).unwrap();
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [dispatch]);
  return (
      <>
        <div style={{ backgroundColor: "#f4f4f4" }}>{routeElement}</div>
        <ChatboxAI />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          style={{ zIndex: 9999 }} 
        />
      </>
  );
}

export default App;
