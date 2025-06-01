import React from "react";
import { useRoutes } from "react-router-dom";
import HomePage from "./pages/MainPage/HomePage";
import HomeLayOut from "./pages/MainPage/HomeLayOut";
import PostRoomPage from "./pages/RoomPostPage/OptionRoom"; // thêm import cho trang đăng tin
import RoomPostForm from "./pages/RoomPostPage/StepOne"; // thêm import cho trang đăng tin
import DepositPage from "./pages/PayPage/DepositPage";
import PersonalInfoPage from "./pages/Profile/PersonalInfoPage";
import AccountInfoPage from "./pages/Profile/AccountInfoPage";
import GeneralStatsPage from "./pages/AdminPage/GeneralStatsPage";
import SavedRoom from "./pages/Profile/SavedRoom";
import Notifications from "./pages/Profile/Notifycations";
import ReviewRoom from "./pages/Profile/ReviewRoom";
import DetailRoom from "./pages/Navigation/DetailRoom";
import HistoryPage from "./pages/PayPage/HistoryPage";
import ManageReviewsPage from "./pages/Navigation/ManageReviewsPage";
import ManagerPost from "./pages/AdminPage/ManagerPost";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoomListingsPage from "./pages/Navigation/RoomListingsPage";

export default function useRouteElement() {
  const routeElement = useRoutes([
    {
      path: "/",
      element: <HomeLayOut />, // chứa Header + Footer
      children: [
        {
          index: true, // tương đương path: ''
          element: <HomePage />,
        },
        {
          path: "/category/:categorySlug",
          element: <RoomListingsPage />
        },
        {
          path: "/post-room",
          element: (
            <ProtectedRoute>
              <PostRoomPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/post-room/:type",
          element: <RoomPostForm />,
        },
        {
          path: "/deposit",
         element: (
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/personal-info",
          element: (
            <ProtectedRoute>
              <PersonalInfoPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/account-info",
          element: (
            <ProtectedRoute>
              <AccountInfoPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile",
          element: (
            <ProtectedRoute>
              <GeneralStatsPage />
            </ProtectedRoute>
          ),
        },{
          path: "/manage-posts",
          element: (
            <ProtectedRoute>
              <ManagerPost />
            </ProtectedRoute>
          ),
        },
        {
          path: "/favorites",
          element: (
            <ProtectedRoute>
              <SavedRoom />
            </ProtectedRoute>
          ),
        },
        {
          path: "/notifications",
          element: (
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          ),
        },

        {
          path: "/reviews",
          element: (
            <ProtectedRoute>
              <ReviewRoom />
            </ProtectedRoute>
          ),
        },
        {
          path: "/phong-tro/:id",
          element: <DetailRoom />, // thêm đường dẫn mới cho trang chi tiết phòng
        },
        {
          path: "/history",
          element: (
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/manage-reviews",
          element: (
            <ProtectedRoute>
              <ManageReviewsPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);
  return routeElement;
}
