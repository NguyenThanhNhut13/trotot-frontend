import React, { use, useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../contexts/app.context";
import PurchasePostModal from "../RoomPostPage/PurchaseSlot";
import "../../assets/styles/Sidebar.css";
import paymentAPI from "../../apis/payment.api";
import { toast } from "react-toastify";
import userApi from "../../apis/user.api";

const Sidebar = () => {
  const { profile } = useContext(AppContext);
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false); // Trạng thái hiển thị modal
  const [total, setTotal] = useState<number>(0);
  const [slot, setSlot] = useState<number>(0);
  const [activePath, setActivePath] = useState<string>("");

  useEffect(() => {
    const userId = profile?.id;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (userId) {
      const getTotal = async () => {
        try {
          const response = await paymentAPI.getWallet(userId);
          const profile = await userApi.getProfile();
          setTotal(response.data.data.balance);
          setSlot(profile.data.data.numberOfPosts);
        } catch (error) {
          toast.error("Lỗi khi lấy thông tin ví");
        }
      };
      getTotal();
    }
  });

  // Set active path based on current location when component mounts
  useEffect(() => {
    const currentPath = window.location.pathname;
    setActivePath(currentPath);
  }, []);

  const sidebarItems = [
    { icon: "📊", label: "Thông tin chung", path: "/profile" },
    { icon: "📋", label: "Quản lý tin", path: "/manage-posts" },
    { icon: "💬", label: "Quản lý đánh giá", path: "/manage-reviews" },
    { icon: "⏳", label: "Lịch sử giao dịch", path: "/history" },
  ];

  const handleSidebarClick = (path: string) => {
    setActivePath(path);
    navigate(path);
  };

  const handleDepositClick = () => {
    navigate("/deposit");
  };

  const handlePurchasePostClick = () => {
    setShowPurchaseModal(true); // Hiển thị modal
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="sidebar p-3">
      <div className="text-center mb-3">
        <img
          src="https://i.postimg.cc/L60YJ5L1/hinh-nen-buon-danbo.jpg"
          alt="Avatar"
          style={{ width: 60, height: 60, borderRadius: "50%" }}
        />
        <h5 className="mt-2 mb-1">{profile?.fullName || "Null"}</h5>
        <p className="text-muted" style={{ fontSize: 14 }}>
          ID: #{profile?.id || "29721"}
        </p>
      </div>

      <div className="mb-3 px-2">
        <div className="d-flex justify-content-between">
          <span>TK chính:</span>
          <span className="text-danger fw-bold">{formatVND(total)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>TK khuyến mãi:</span>
          <span className="text-danger fw-bold">0 đ</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Số lượng tin:</span>
          <span className="text-danger fw-bold">{slot}</span>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3 px-2">
        <Button
          variant="outline-primary"
          className="flex-fill"
          onClick={handlePurchasePostClick} // Thêm sự kiện onClick
        >
          Mua số lượng tin đăng
        </Button>
        <Button
          variant="primary"
          className="flex-fill"
          onClick={handleDepositClick}
        >
          Nạp tiền
        </Button>
      </div>

      <div className="sidebar-menu">
        {sidebarItems.map((item, index) => {
          const isActive = activePath === item.path;
          return (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center py-3 px-3 mb-2"
              style={{
                borderRadius: 8,
                backgroundColor: isActive ? "#0d6efd" : "#f8f9fa",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                height: "48px",
                fontWeight: 500,
                border: isActive ? "1px solid #0d6efd" : "1px solid #e9ecef",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0,0,0,0.05)";
                }
              }}
              onClick={() => handleSidebarClick(item.path)}
            >
              <span className="d-flex align-items-center">
                <span
                  style={{
                    marginRight: 12,
                    fontSize: "18px",
                    color: isActive ? "white" : "inherit",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ color: isActive ? "white" : "inherit" }}>
                  {item.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal mua số lượng tin đăng */}
      <PurchasePostModal
        total={total}
        show={showPurchaseModal}
        onHide={() => setShowPurchaseModal(false)}
      />
    </div>
  );
};

export default Sidebar;
