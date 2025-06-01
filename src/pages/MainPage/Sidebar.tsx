"use client"

import { useEffect, useState } from "react"
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import {
  FaUser,
  FaClipboardList,
  FaComments,
  FaHistory,
  FaWallet,
  FaPlus,
  FaCrown,
  FaChevronRight,
} from "react-icons/fa"
import PurchasePostModal from "../RoomPostPage/PurchaseSlot"
import paymentAPI from "../../apis/payment.api"
import { toast } from "react-toastify"
import userApi from "../../apis/user.api"
import { useAppSelector } from "../../store/hook"
import { useResponsive } from "../../store/hook"

const Sidebar = () => {
  const { profile } = useAppSelector((state) => state.user)
  const { isMobile, isTablet } = useResponsive()
  const navigate = useNavigate()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [total, setTotal] = useState<number>(0)
  const [slot, setSlot] = useState<number>(0)
  const [activePath, setActivePath] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = profile?.id
    window.scrollTo({ top: 0, behavior: "smooth" })

    if (userId) {
      const getTotal = async () => {
        try {
          setIsLoading(true)
          const [walletResponse, profileResponse] = await Promise.all([
            paymentAPI.getWallet(userId),
            userApi.getProfile(),
          ])
          setTotal(walletResponse.data.data.balance)
          setSlot(profileResponse.data.data.numberOfPosts)
        } catch (error) {
          toast.error("Lỗi khi lấy thông tin ví")
        } finally {
          setIsLoading(false)
        }
      }
      getTotal()
    }
  }, [profile?.id])

  useEffect(() => {
    const currentPath = window.location.pathname
    setActivePath(currentPath)
  }, [])

  const sidebarItems = [
    {
      icon: FaUser,
      label: "Thông tin chung",
      path: "/profile",
      color: "#0046a8",
    },
    {
      icon: FaClipboardList,
      label: "Quản lý tin",
      path: "/manage-posts",
      color: "#28a745",
    },
    {
      icon: FaComments,
      label: "Quản lý đánh giá",
      path: "/manage-reviews",
      color: "#ffc107",
    },
    {
      icon: FaHistory,
      label: "Lịch sử giao dịch",
      path: "/history",
      color: "#6f42c1",
    },
  ]

  const handleSidebarClick = (path: string) => {
    setActivePath(path)
    navigate(path)
  }

  const handleDepositClick = () => {
    navigate("/deposit")
  }

  const handlePurchasePostClick = () => {
    setShowPurchaseModal(true)
  }

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  const getCompactLayout = () => isMobile || isTablet

  return (
    <div
      className={`h-100 ${getCompactLayout() ? "p-2" : "p-4"}`}
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderRight: "1px solid #dee2e6",
        minHeight: "100vh",
      }}
    >
      {/* User Profile Section */}
      <div
        className={`text-center mb-4 p-3 bg-white rounded-3 shadow-sm`}
        style={{
          border: "1px solid #e9ecef",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        <div className="position-relative d-inline-block mb-3">
          <img
            src={"https://i.postimg.cc/L60YJ5L1/hinh-nen-buon-danbo.jpg"}
            alt="Avatar"
            className="rounded-circle border border-3 border-white shadow"
            style={{
              width: getCompactLayout() ? 50 : 70,
              height: getCompactLayout() ? 50 : 70,
              objectFit: "cover",
            }}
          />
          <div
            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
            style={{ width: 16, height: 16 }}
          />
        </div>

        <h6 className={`fw-bold mb-1 ${getCompactLayout() ? "fs-6" : "fs-5"}`} style={{ color: "#2c3e50" }}>
          {profile?.fullName || "Người dùng"}
        </h6>
        <p className="text-muted mb-0" style={{ fontSize: getCompactLayout() ? "0.75rem" : "0.875rem" }}>
          ID: #{profile?.id || "29721"}
        </p>
      </div>

      {/* Account Balance Section */}
      <div className="mb-4 p-3 bg-white rounded-3 shadow-sm" style={{ border: "1px solid #e9ecef" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#2c3e50" }}>
          <FaWallet className="me-2 text-primary" />
          Tài khoản
        </h6>

        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              TK chính:
            </span>
            <span className="fw-bold text-success">{isLoading ? "..." : formatVND(total)}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              TK khuyến mãi:
            </span>
            <span className="fw-bold text-warning">0 đ</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Số lượng tin:
            </span>
            <span className="fw-bold text-primary">{isLoading ? "..." : slot}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`mb-4 ${getCompactLayout() ? "d-flex flex-column gap-2" : "d-flex gap-2"}`}>
        <Button
          variant="outline-primary"
          className={`d-flex align-items-center justify-content-center fw-medium ${getCompactLayout() ? "w-100 py-2" : "flex-fill py-2"}`}
          onClick={handlePurchasePostClick}
          style={{
            borderRadius: "12px",
            fontSize: getCompactLayout() ? "0.8rem" : "0.875rem",
            transition: "all 0.3s ease",
          }}
        >
          <FaPlus className="me-2" size={14} />
          {getCompactLayout() ? "Mua tin" : "Mua số lượng tin"}
        </Button>
        <Button
          variant="primary"
          className={`d-flex align-items-center justify-content-center fw-medium ${getCompactLayout() ? "w-100 py-2" : "flex-fill py-2"}`}
          onClick={handleDepositClick}
          style={{
            borderRadius: "12px",
            fontSize: getCompactLayout() ? "0.8rem" : "0.875rem",
            background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
            border: "none",
            transition: "all 0.3s ease",
          }}
        >
          <FaWallet className="me-2" size={14} />
          Nạp tiền
        </Button>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: "0.875rem" }}>
          MENU CHÍNH
        </h6>

        {sidebarItems.map((item, index) => {
          const isActive = activePath === item.path
          const IconComponent = item.icon

          return (
            <div
              key={index}
              className={`d-flex align-items-center justify-content-between p-3 mb-2 rounded-3 position-relative overflow-hidden`}
              style={{
                backgroundColor: isActive ? "#0046a8" : "#ffffff",
                cursor: "pointer",
                border: `1px solid ${isActive ? "#0046a8" : "#e9ecef"}`,
                transition: "all 0.3s ease",
                transform: isActive ? "translateX(4px)" : "translateX(0)",
                boxShadow: isActive ? "0 4px 12px rgba(0, 70, 168, 0.3)" : "0 2px 4px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa"
                  e.currentTarget.style.transform = "translateX(2px)"
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#ffffff"
                  e.currentTarget.style.transform = "translateX(0)"
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)"
                }
              }}
              onClick={() => handleSidebarClick(item.path)}
            >
              <div className="d-flex align-items-center">
                <div
                  className={`d-flex align-items-center justify-content-center rounded-2 me-3`}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : `${item.color}15`,
                    color: isActive ? "white" : item.color,
                  }}
                >
                  <IconComponent size={16} />
                </div>
                <span
                  className="fw-medium"
                  style={{
                    color: isActive ? "white" : "#2c3e50",
                    fontSize: getCompactLayout() ? "0.875rem" : "0.9rem",
                  }}
                >
                  {getCompactLayout() && item.label.length > 12 ? item.label.substring(0, 12) + "..." : item.label}
                </span>
              </div>

              {!getCompactLayout() && (
                <FaChevronRight
                  size={12}
                  style={{
                    color: isActive ? "white" : "#6c757d",
                    opacity: 0.7,
                  }}
                />
              )}

              {/* Active indicator */}
              {isActive && (
                <div
                  className="position-absolute start-0 top-0 h-100"
                  style={{
                    width: 4,
                    backgroundColor: "#ffffff",
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* VIP Badge */}
      {!getCompactLayout() && (
        <div
          className="mt-4 p-3 text-center rounded-3"
          style={{
            background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
            border: "1px solid #f1c40f",
          }}
        >
          <FaCrown className="text-warning mb-2" size={24} />
          <p className="mb-2 fw-bold" style={{ color: "#8b6914", fontSize: "0.875rem" }}>
            Nâng cấp VIP
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
            Để có thêm nhiều tính năng
          </p>
        </div>
      )}

      {/* Purchase Modal */}
      <PurchasePostModal total={total} show={showPurchaseModal} onHide={() => setShowPurchaseModal(false)} />
    </div>
  )
}

export default Sidebar
