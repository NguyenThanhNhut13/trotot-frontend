"use client"

import { useState, useEffect } from "react"
import { Nav, Button, Spinner } from "react-bootstrap"
import { FaBell, FaCheckDouble, FaFilter, FaSearch } from "react-icons/fa"
import { useNavigate, useLocation } from "react-router-dom"
import { useResponsive } from "../../store/hook"
import "./Notifications.css"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const { isMobile, isTablet } = useResponsive()
  const navigate = useNavigate()
  const location = useLocation()

  // Simulate loading effect
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [activeTab])

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <SidebarPersonLayout>
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#0046a8" }}>
              THÔNG BÁO
            </h2>
            <p className="text-muted mb-3 mb-md-0">Cập nhật thông báo trên Trọ Tốt</p>
          </div>
          <Button
            variant="outline-primary"
            className="d-flex align-items-center justify-content-center"
            style={{
              borderColor: "#0046a8",
              color: "#0046a8",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0046a8"
              e.currentTarget.style.color = "white"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "#0046a8"
            }}
          >
            <FaCheckDouble className="me-2" size={14} />
            Đánh dấu đã đọc tất cả
          </Button>
        </div>

        {/* Tabs and Search */}
        <div className="notification-controls mb-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            {/* Tabs */}
            <div className={`notification-tabs ${isMobile ? "scrollable-tabs" : ""}`}>
              <Nav variant="tabs" className="border-bottom-0">
                <Nav.Item>
                  <Nav.Link
                    className={activeTab === "all" ? "active" : ""}
                    onClick={() => handleTabSelect("all")}
                    style={{
                      color: activeTab === "all" ? "#0046a8" : "#6c757d",
                      borderColor: activeTab === "all" ? "#0046a8" : "transparent",
                      borderBottom: activeTab === "all" ? "2px solid #0046a8" : "none",
                    }}
                  >
                    Tất cả
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className={activeTab === "activity" ? "active" : ""}
                    onClick={() => handleTabSelect("activity")}
                    style={{
                      color: activeTab === "activity" ? "#0046a8" : "#6c757d",
                      borderColor: activeTab === "activity" ? "#0046a8" : "transparent",
                      borderBottom: activeTab === "activity" ? "2px solid #0046a8" : "none",
                    }}
                  >
                    Hoạt động Trọ
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className={activeTab === "transaction" ? "active" : ""}
                    onClick={() => handleTabSelect("transaction")}
                    style={{
                      color: activeTab === "transaction" ? "#0046a8" : "#6c757d",
                      borderColor: activeTab === "transaction" ? "#0046a8" : "transparent",
                      borderBottom: activeTab === "transaction" ? "2px solid #0046a8" : "none",
                    }}
                  >
                    Giao dịch
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className={activeTab === "promotion" ? "active" : ""}
                    onClick={() => handleTabSelect("promotion")}
                    style={{
                      color: activeTab === "promotion" ? "#0046a8" : "#6c757d",
                      borderColor: activeTab === "promotion" ? "#0046a8" : "transparent",
                      borderBottom: activeTab === "promotion" ? "2px solid #0046a8" : "none",
                    }}
                  >
                    Khuyến mãi
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className={activeTab === "account" ? "active" : ""}
                    onClick={() => handleTabSelect("account")}
                    style={{
                      color: activeTab === "account" ? "#0046a8" : "#6c757d",
                      borderColor: activeTab === "account" ? "#0046a8" : "transparent",
                      borderBottom: activeTab === "account" ? "2px solid #0046a8" : "none",
                    }}
                  >
                    Tài khoản
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            {/* Search and Filter - Only on larger screens */}
            {!isMobile && (
              <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm thông báo..."
                    style={{
                      paddingLeft: "2.5rem",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                  <FaSearch
                    className="position-absolute"
                    style={{ left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#6c757d" }}
                  />
                </div>
                <Button
                  variant="light"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                    width: "40px",
                    height: "38px",
                  }}
                >
                  <FaFilter size={14} />
                </Button>
              </div>
            )}
          </div>

          {/* Search on mobile - only visible on mobile */}
          {isMobile && (
            <div className="d-flex align-items-center gap-2 mt-3">
              <div className="position-relative flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm thông báo..."
                  style={{
                    paddingLeft: "2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                  }}
                />
                <FaSearch
                  className="position-absolute"
                  style={{ left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#6c757d" }}
                />
              </div>
              <Button
                variant="light"
                className="d-flex align-items-center justify-content-center"
                style={{
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                  width: "40px",
                  height: "38px",
                }}
              >
                <FaFilter size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Notification Content */}
        <div className="notification-content bg-white rounded-3 shadow-sm flex-grow-1" style={{ overflow: "hidden" }}>
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner
                animation="border"
                variant="primary"
                style={{ color: "#0046a8", width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Đang tải thông báo...</p>
            </div>
          ) : (
            <div className="empty-notifications text-center py-5">
              <div
                className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: "120px",
                  height: "120px",
                  background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                }}
              >
                <FaBell size={48} style={{ color: "#0046a8" }} />
              </div>
              <h5 className="fw-bold mb-2">Không có thông báo nào</h5>
              <p className="text-muted mb-0 px-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
                Hiện tại, bạn chưa có thông báo nào. Thông báo sẽ xuất hiện khi có cập nhật mới.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarPersonLayout>
  )
}
