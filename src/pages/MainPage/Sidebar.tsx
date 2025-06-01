"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button, Offcanvas } from "react-bootstrap"
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
  FaBars,
} from "react-icons/fa"
import PurchasePostModal from "../RoomPostPage/PurchaseSlot"
import paymentAPI from "../../apis/payment.api"
import { toast } from "react-toastify"
import userApi from "../../apis/user.api"
import { useAppSelector, useResponsive } from "../../store/hook"

interface SidebarProps {
  show?: boolean
  onHide?: () => void
  variant?: "fixed" | "offcanvas"
}

const AppSidebar = ({ show = true, onHide, variant = "fixed" }: SidebarProps) => {
  const { profile } = useAppSelector((state) => state.user)
  const { isMobile } = useResponsive()
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
    if (variant === "offcanvas" && onHide) {
      onHide()
    }
  }

  const handleDepositClick = () => {
    navigate("/deposit")
    if (variant === "offcanvas" && onHide) {
      onHide()
    }
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

  const sidebarContent = (
    <div
      className="d-flex flex-column h-100"
      style={{
        background: "#f8f9fa",
        width: variant === "fixed" ? "280px" : "100%",
      }}
    >
      {/* Header */}
      <div
        className="border-bottom p-3"
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        }}
      >
        {/* User Profile Section */}
        <div className="text-center">
          <div className="position-relative d-inline-block mb-3">
            <img
              src={ "https://i.postimg.cc/L60YJ5L1/hinh-nen-buon-danbo.jpg"}
              alt="Avatar"
              className="rounded-circle border border-3 border-white shadow"
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
              }}
            />
            <div
              className="position-absolute bg-success rounded-circle border border-2 border-white"
              style={{ width: 16, height: 16, bottom: 0, right: 0 }}
            />
          </div>

          <div>
            <h6 className="fw-semibold text-gray-800 mb-1 lh-sm">{profile?.fullName || "Người dùng"}</h6>
            <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
              ID: #{profile?.id || "29721"}
            </p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="d-flex flex-column gap-4">
          {/* Account Balance Section */}
          <div>
            <h6 className="d-flex align-items-center text-muted fw-medium mb-3" style={{ fontSize: "0.875rem" }}>
              <FaWallet className="me-2 text-primary" />
              Tài khoản
            </h6>
            <div className="bg-white rounded-3 p-3 border shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  TK chính:
                </span>
                <span className="fw-semibold text-success">{isLoading ? "..." : formatVND(total)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  TK khuyến mãi:
                </span>
                <span className="fw-semibold text-warning">0 đ</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Số lượng tin:
                </span>
                <span className="fw-semibold text-primary">{isLoading ? "..." : slot}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2">
            <Button
              variant="outline-primary"
              className="d-flex align-items-center justify-content-center py-2"
              onClick={handlePurchasePostClick}
              style={{ borderRadius: "8px", fontSize: "0.875rem" }}
            >
              <FaPlus className="me-2" size={14} />
              Mua số lượng tin
            </Button>
            <Button
              variant="primary"
              className="d-flex align-items-center justify-content-center py-2"
              onClick={handleDepositClick}
              style={{
                borderRadius: "8px",
                fontSize: "0.875rem",
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                border: "none",
              }}
            >
              <FaWallet className="me-2" size={14} />
              Nạp tiền
            </Button>
          </div>

          {/* Navigation Menu */}
          <div>
            <h6 className="text-muted fw-medium mb-3" style={{ fontSize: "0.875rem" }}>
              MENU CHÍNH
            </h6>

            <div className="d-flex flex-column gap-2">
              {sidebarItems.map((item, index) => {
                const isActive = activePath === item.path
                const IconComponent = item.icon

                return (
                  <div
                    key={index}
                    className={`d-flex align-items-center gap-3 px-3 py-2 rounded-3 position-relative overflow-hidden`}
                    style={{
                      backgroundColor: isActive ? "#0046a8" : "#ffffff",
                      cursor: "pointer",
                      border: `1px solid ${isActive ? "#0046a8" : "#e9ecef"}`,
                      transition: "all 0.2s ease",
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
                    <div
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: isActive ? "rgba(255,255,255,0.2)" : `${item.color}15`,
                        color: isActive ? "white" : item.color,
                      }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span
                      className="fw-medium flex-grow-1"
                      style={{
                        color: isActive ? "white" : "#2c3e50",
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.label}
                    </span>
                    <FaChevronRight
                      size={12}
                      style={{
                        color: isActive ? "white" : "#6c757d",
                        opacity: 0.7,
                      }}
                    />

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
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-top p-3 mt-auto"
        style={{
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
        }}
      >
        {/* VIP Badge */}
        <div className="text-center">
          <FaCrown className="text-warning mb-2" size={24} />
          <div>
            <p className="fw-semibold text-warning mb-1" style={{ fontSize: "0.875rem" }}>
              Nâng cấp VIP
            </p>
            <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
              Để có thêm nhiều tính năng
            </p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchasePostModal total={total} show={showPurchaseModal} onHide={() => setShowPurchaseModal(false)} />
    </div>
  )

  if (variant === "offcanvas") {
    return (
      <Offcanvas show={show} onHide={onHide} placement="start" style={{ width: "280px", maxWidth: "80vw" }}>
        <Offcanvas.Body className="p-0">{sidebarContent}</Offcanvas.Body>
      </Offcanvas>
    )
  }

  return sidebarContent
}

// Layout wrapper component
export const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, isTablet } = useResponsive()
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const shouldShowFixedSidebar = !isMobile && !isTablet

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header for Mobile/Tablet */}
      {(isMobile || isTablet) && (
        <div className="sticky-top d-flex align-items-center gap-3 p-3 border-bottom bg-white shadow-sm">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center justify-content-center"
            onClick={() => setShowMobileSidebar(true)}
            style={{ width: "40px", height: "40px", borderRadius: "8px" }}
          >
            <FaBars size={16} />
          </Button>
          <h6 className="mb-0 fw-semibold text-primary">Dashboard</h6>
        </div>
      )}

      {/* Main Content Area */}
      <div className="d-flex flex-grow-1">
        {/* Fixed Sidebar for Desktop */}
        {shouldShowFixedSidebar && (
          <div style={{ width: "280px", flexShrink: 0 }}>
            <div className="h-100 overflow-hidden" style={{ position: "sticky", top: 0 }}>
              <AppSidebar variant="fixed" />
            </div>
          </div>
        )}

        {/* Mobile Sidebar */}
        <AppSidebar variant="offcanvas" show={showMobileSidebar} onHide={() => setShowMobileSidebar(false)} />

        {/* Main Content */}
        <div className="flex-grow-1">
          <div className="p-3 p-md-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AppSidebar
