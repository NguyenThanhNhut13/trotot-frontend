import "./App.css";
import useRouteElement from "./useRouteElement";
import ChatboxAI from "./components/Chat/ChatboxAI";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store/store";
import { useEffect } from "react";
import { checkAndRefreshToken } from "./store/slices/authSlice";
import { getProfile } from "./store/slices/userSlice";

function App() {
  const routeElement = useRouteElement();
  const dispatch = useDispatch<AppDispatch>();

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
      </>
  );
}

export default App;
