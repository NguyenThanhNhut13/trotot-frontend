"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button, Offcanvas } from "react-bootstrap"
import { useLocation, useNavigate } from "react-router-dom"
import { FaUser, FaIdCard, FaHeart, FaBell, FaCommentAlt, FaBars, FaChevronRight, FaTimes } from "react-icons/fa"
import { useResponsive } from "../../store/hook"

interface SidebarPersonProps {
  show?: boolean
  onHide?: () => void
  variant?: "fixed" | "offcanvas"
}

const SidebarPerson = ({ show = true, onHide, variant = "fixed" }: SidebarPersonProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPath])

  const menuItems = [
    {
      path: "/personal-info",
      label: "Thông tin cá nhân",
      icon: FaUser,
    },
    {
      path: "/account-info",
      label: "Thông tin tài khoản",
      icon: FaIdCard,
    },
    {
      path: "/favorites",
      label: "Trọ đã lưu",
      icon: FaHeart,
    },
    {
      path: "/notifications",
      label: "Thông báo",
      icon: FaBell,
    },
    {
      path: "/reviews",
      label: "Quản lý đánh giá trọ",
      icon: FaCommentAlt,
    },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    if (variant === "offcanvas" && onHide) {
      onHide()
    }
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
        className="border-bottom p-3 position-relative"
        style={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        }}
      >
        {/* Close button for mobile */}
        {variant === "offcanvas" && (
          <Button
            variant="link"
            className="position-absolute top-0 end-0 mt-2 me-2 p-1"
            onClick={onHide}
            style={{
              color: "#0046a8",
              textDecoration: "none",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.8)",
            }}
          >
            <FaTimes size={14} />
          </Button>
        )}

        <h5 className="fw-bold text-center mb-0" style={{ color: "#0046a8" }}>
          Tài khoản của tôi
        </h5>
      </div>

      {/* Menu Items */}
      <div className="flex-grow-1 overflow-auto p-3">
        <div className="d-flex flex-column gap-2">
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.path
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
                onClick={() => handleNavigation(item.path)}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : `rgba(0, 70, 168, 0.1)`,
                    color: isActive ? "white" : "#0046a8",
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

      {/* Footer */}
      <div className="border-top p-3 mt-auto">
        <Button
          variant="outline-danger"
          className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
          onClick={() => navigate("/logout")}
        >
          <span>Đăng xuất</span>
        </Button>
      </div>
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
export const SidebarPersonLayout = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, isTablet } = useResponsive()
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  // Get current page title based on path
  const getPageTitle = () => {
    switch (currentPath) {
      case "/personal-info":
        return "Thông tin cá nhân"
      case "/account-info":
        return "Thông tin tài khoản"
      case "/favorites":
        return "Trọ đã lưu"
      case "/notifications":
        return "Thông báo"
      case "/reviews":
        return "Quản lý đánh giá trọ"
      default:
        return "Tài khoản của tôi"
    }
  }

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
          <h6 className="mb-0 fw-semibold" style={{ color: "#0046a8" }}>
            {getPageTitle()}
          </h6>
        </div>
      )}

      {/* Main Content Area */}
      <div className="d-flex flex-grow-1">
        {/* Fixed Sidebar for Desktop */}
        {shouldShowFixedSidebar && (
          <div style={{ width: "280px", flexShrink: 0 }}>
            <div className="h-100 overflow-hidden" style={{ position: "sticky", top: 0 }}>
              <SidebarPerson variant="fixed" />
            </div>
          </div>
        )}

        {/* Mobile Sidebar */}
        <SidebarPerson variant="offcanvas" show={showMobileSidebar} onHide={() => setShowMobileSidebar(false)} />

        {/* Main Content */}
        <div className="flex-grow-1">
          <div className="p-3 p-md-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default SidebarPerson
