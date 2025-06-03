"use client"

import { useState, useEffect } from "react"
import { Nav, Button, Spinner, Form, InputGroup } from "react-bootstrap"
import { FaBell, FaCheckDouble, FaFilter, FaSearch, FaTimes } from "react-icons/fa"
import { useNavigate, useLocation } from "react-router-dom"
import { useResponsive } from "../../store/hook"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
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

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "activity", label: "Hoạt động" },
    { key: "transaction", label: "Giao dịch" },
    { key: "promotion", label: "Khuyến mãi" },
    { key: "account", label: "Tài khoản" },
  ]

  return (
    <SidebarPersonLayout>
      <div
        className="d-flex flex-column h-100"
        style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          minHeight: "100vh",
          margin: "-1rem",
          padding: isMobile ? "1rem" : "1.5rem",
        }}
      >
        {/* Header */}
        <div className="mb-3 mb-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div className="mb-3 mb-md-0">
              <h2
                className="fw-bold mb-1"
                style={{
                  color: "#0046a8",
                  fontSize: isMobile ? "1.5rem" : "2rem",
                }}
              >
                THÔNG BÁO
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: isMobile ? "0.85rem" : "1rem" }}>
                Cập nhật thông báo trên Trọ Tốt
              </p>
            </div>

            {/* Action buttons */}
            <div className="d-flex align-items-center gap-2">
              {isMobile && (
                <Button
                  variant="light"
                  size="sm"
                  className="d-flex align-items-center justify-content-center"
                  onClick={() => setShowSearch(!showSearch)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  {showSearch ? <FaTimes size={14} /> : <FaSearch size={14} />}
                </Button>
              )}

              <Button
                variant="outline-primary"
                size={isMobile ? "sm" : undefined}
                className="d-flex align-items-center justify-content-center"
                style={{
                  borderColor: "#0046a8",
                  color: "#0046a8",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                }}
              >
                <FaCheckDouble className="me-1 me-md-2" size={isMobile ? 12 : 14} />
                {isMobile ? "Đã đọc" : "Đánh dấu đã đọc tất cả"}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {isMobile && showSearch && (
            <div className="mt-3">
              <InputGroup size="sm">
                <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                  <FaSearch size={12} />
                </InputGroup.Text>
                <Form.Control type="text" placeholder="Tìm thông báo..." style={{ fontSize: "0.85rem" }} />
                <Button variant="light" style={{ border: "1px solid #dee2e6" }}>
                  <FaFilter size={12} />
                </Button>
              </InputGroup>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-3">
          {isMobile ? (
            // Mobile: Dropdown-style tabs
            <div className="d-flex align-items-center gap-2 mb-3">
              <Form.Select
                size="sm"
                value={activeTab}
                onChange={(e) => handleTabSelect(e.target.value)}
                style={{
                  fontSize: "0.85rem",
                  borderColor: "#0046a8",
                  color: "#0046a8",
                }}
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          ) : (
            // Desktop/Tablet: Regular tabs
            <div className="bg-white rounded-3 shadow-sm p-2">
              <Nav variant="pills" className="flex-nowrap">
                {tabs.map((tab) => (
                  <Nav.Item key={tab.key} className="flex-shrink-0">
                    <Nav.Link
                      className={`px-3 py-2 ${activeTab === tab.key ? "active" : ""}`}
                      onClick={() => handleTabSelect(tab.key)}
                      style={{
                        color: activeTab === tab.key ? "white" : "#0046a8",
                        backgroundColor: activeTab === tab.key ? "#0046a8" : "transparent",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      {tab.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          )}

          {/* Desktop Search */}
          {!isMobile && (
            <div className="d-flex justify-content-end mt-3">
              <div className="d-flex align-items-center gap-2">
                <InputGroup style={{ width: "300px" }}>
                  <InputGroup.Text style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
                    <FaSearch size={14} />
                  </InputGroup.Text>
                  <Form.Control type="text" placeholder="Tìm thông báo..." style={{ fontSize: "0.9rem" }} />
                </InputGroup>
                <Button
                  variant="light"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <FaFilter size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Content */}
        <div
          className="bg-white rounded-3 shadow-sm flex-grow-1 d-flex flex-column"
          style={{
            minHeight: isMobile ? "400px" : "500px",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-4">
              <Spinner
                animation="border"
                style={{
                  color: "#0046a8",
                  width: isMobile ? "2rem" : "3rem",
                  height: isMobile ? "2rem" : "3rem",
                }}
              />
              <p className="mt-3 text-muted mb-0" style={{ fontSize: isMobile ? "0.85rem" : "1rem" }}>
                Đang tải thông báo...
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-4 text-center">
              <div
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: isMobile ? "80px" : "120px",
                  height: isMobile ? "80px" : "120px",
                  background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                }}
              >
                <FaBell size={isMobile ? 32 : 48} style={{ color: "#0046a8" }} />
              </div>
              <h5 className="fw-bold mb-2" style={{ fontSize: isMobile ? "1.1rem" : "1.25rem" }}>
                Không có thông báo nào
              </h5>
              <p
                className="text-muted mb-0"
                style={{
                  fontSize: isMobile ? "0.85rem" : "1rem",
                  maxWidth: isMobile ? "280px" : "400px",
                  lineHeight: "1.5",
                }}
              >
                Hiện tại, bạn chưa có thông báo nào. Thông báo sẽ xuất hiện khi có cập nhật mới.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarPersonLayout>
  )
}
