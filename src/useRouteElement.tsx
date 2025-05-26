import React, { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import HomePage from "./pages/MainPage/HomePage";
import CategoryPage from "./pages/Navigation/CategoryPage";
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
          path: "category/:type",
          element: <CategoryPage />,
        },
        {
          path: "/post-room",
          element: <PostRoomPage />, // thêm đường dẫn mới cho trang Dang tin
        },
        {
          path: "/post-room/:type",
          element: <RoomPostForm />,
        },
        {
          path: "/deposit",
          element: <DepositPage />, // thêm đường dẫn mới cho trang đăng tin
        },
        {
          path: "/personal-info",
          element: <PersonalInfoPage />, // thêm đường dẫn mới cho trang Thong tin cá nhân
        },
        {
          path: "/account-info",
          element: <AccountInfoPage />, // thêm đường dẫn mới cho trang Thong tin tài khoản
        },
        {
          path: "/profile",
          element: <GeneralStatsPage />, // thêm đường dẫn mới cho trang danh cho chủ trọ
        },{
          path: "//manage-posts",
          element: <ManagerPost />, // thêm đường dẫn mới cho trang danh cho chủ trọ
        },
        {
          path: "/favorites",
          element: <SavedRoom />, // Tro da luu
        },
        {
          path: "/notifications",
          element: <Notifications />, // Thong bao
        },

        {
          path: "/reviews",
          element: <ReviewRoom />, // Đánh giá phòng
        },
        {
          path: "/phong-tro/:id",
          element: <DetailRoom />, // thêm đường dẫn mới cho trang chi tiết phòng
        },
        {
          path: "/history",
          element: <HistoryPage />, // Lịch sử giao dịch
        },
        {
          path: "/manage-reviews",
          element: <ManageReviewsPage />, // Quản lý đánh giá
        },
      ],
    },
  ]);
  return routeElement;
}
