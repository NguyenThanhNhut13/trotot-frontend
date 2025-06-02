"use client"

import type React from "react"
import { useState } from "react"
import {
  FaWallet,
  FaCreditCard,
  FaQrcode,
  FaUniversity,
  FaCheckCircle,
  FaSpinner,
  FaBars,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa"
import { Container, Row, Col, Card, Button, Offcanvas, Badge } from "react-bootstrap"
import paymentAPI from "../../apis/payment.api"
import { toast } from "react-toastify"
import { useAppSelector } from "../../store/hook"
import { SidebarLayout } from "../MainPage/Sidebar"

const DepositPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>("vnpay")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const { profile } = useAppSelector((state) => state.user)

  // Simplified amount options with popular choices first
  const amounts = [
    { value: 20000, label: "20K", popular: true },
    { value: 50000, label: "50K", popular: true },
    { value: 100000, label: "100K", popular: true },
    { value: 200000, label: "200K", popular: true },
    { value: 500000, label: "500K", popular: false },
    { value: 1000000, label: "1M", popular: false },
    { value: 2000000, label: "2M", popular: false },
    { value: 5000000, label: "5M", popular: false },
  ]

  // Simplified payment methods
  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPAY",
      icon: FaCreditCard,
      color: "#1976d2",
      description: "Nhanh chóng & an toàn",
      recommended: true,
    },
    {
      id: "qrcode",
      name: "QR Code",
      icon: FaQrcode,
      color: "#4caf50",
      description: "Quét mã thanh toán",
      recommended: false,
    },
    {
      id: "atm",
      name: "Ngân hàng",
      icon: FaUniversity,
      color: "#ff9800",
      description: "ATM/Internet Banking",
      recommended: false,
    },
  ]

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  const handleSubmit = async () => {
    if (!selectedAmount) {
      toast.error("Vui lòng chọn số tiền cần nạp")
      return
    }

    try {
      setIsLoading(true)
      const userId = profile?.id

      if (!userId) {
        toast.error("Bạn cần đăng nhập để thực hiện chức năng này")
        return
      }

      const response = await paymentAPI.addMoneyToWallet(Number(userId), selectedAmount)

      if (response.data && response.data.data.paymentUrl) {
        localStorage.setItem("redirectAfterPayment", "/deposit")
        window.location.href = response.data.data.paymentUrl
      } else {
        toast.error("Không thể tạo giao dịch thanh toán. Vui lòng thử lại sau.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid>
        <Row>
          {/* Mobile Header */}
          <div className="d-lg-none sticky-top bg-white border-bottom p-3 shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center justify-content-center"
                onClick={() => setShowMobileSidebar(true)}
                style={{ width: "40px", height: "40px", borderRadius: "8px" }}
              >
                <FaBars size={16} />
              </Button>
              <h6 className="mb-0 fw-semibold text-primary">Nạp tiền vào ví</h6>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <Col lg={3} className="d-none d-lg-block px-0">
            <div style={{ position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
              <SidebarLayout>{null}</SidebarLayout>
            </div>
          </Col>

          {/* Mobile Sidebar */}
          <Offcanvas
            show={showMobileSidebar}
            onHide={() => setShowMobileSidebar(false)}
            placement="start"
            className="d-lg-none"
            style={{ width: "280px" }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <SidebarLayout>{null}</SidebarLayout>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={9} className="px-3 px-md-4">
            <div className="py-4">
              {/* Simple Header */}
              <div className="text-center mb-5">
                <div className="mb-3">
                  <FaWallet size={48} className="text-primary" />
                </div>
                <h1 className="h2 fw-bold text-dark mb-2">Nạp tiền vào ví</h1>
                <p className="text-muted">Chọn số tiền bạn muốn nạp vào tài khoản</p>
              </div>

              <Row className="justify-content-center">
                <Col xs={12} lg={8} xl={6}>
                  {/* Amount Selection - Simplified */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <h5 className="fw-semibold mb-3 text-dark">Chọn số tiền</h5>

                      <Row className="g-3">
                        {amounts.map((amount) => (
                          <Col key={amount.value} xs={6} md={4}>
                            <Button
                              variant={selectedAmount === amount.value ? "primary" : "outline-secondary"}
                              className="w-100 position-relative"
                              style={{
                                height: "70px",
                                borderRadius: "12px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                              }}
                              onClick={() => setSelectedAmount(amount.value)}
                            >
                              <div className="d-flex flex-column align-items-center">
                                <span className="fw-bold">{amount.label}</span>
                                <small className="opacity-75">{formatVND(amount.value)}</small>
                              </div>

                              {amount.popular && selectedAmount !== amount.value && (
                                <Badge
                                  bg="warning"
                                  className="position-absolute top-0 end-0 translate-middle"
                                  style={{ fontSize: "0.6rem" }}
                                >
                                  Phổ biến
                                </Badge>
                              )}

                              {selectedAmount === amount.value && (
                                <FaCheckCircle
                                  className="position-absolute top-0 end-0 translate-middle text-white"
                                  style={{ backgroundColor: "#0d6efd", borderRadius: "50%" }}
                                  size={16}
                                />
                              )}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Payment Method - Simplified */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <h5 className="fw-semibold mb-3 text-dark">Phương thức thanh toán</h5>

                      <div className="d-grid gap-3">
                        {paymentMethods.map((method) => {
                          const IconComponent = method.icon
                          const isSelected = selectedMethod === method.id

                          return (
                            <div
                              key={method.id}
                              className={`border rounded-3 p-3 cursor-pointer transition-all ${
                                isSelected ? "border-primary bg-primary bg-opacity-10" : "border-light-subtle"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSelectedMethod(method.id)}
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    backgroundColor: isSelected ? method.color : `${method.color}20`,
                                    color: isSelected ? "white" : method.color,
                                  }}
                                >
                                  <IconComponent size={20} />
                                </div>

                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2">
                                    <h6 className="mb-0 fw-semibold">{method.name}</h6>
                                    {method.recommended && (
                                      <Badge bg="success" style={{ fontSize: "0.7rem" }}>
                                        Khuyến nghị
                                      </Badge>
                                    )}
                                  </div>
                                  <small className="text-muted">{method.description}</small>
                                </div>

                                {isSelected && <FaCheckCircle className="text-primary" size={20} />}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Summary - Simplified */}
                  {selectedAmount && (
                    <Card className="mb-4 border-0 shadow-sm bg-light">
                      <Card.Body className="p-4">
                        <h6 className="fw-semibold mb-3 text-dark">Tóm tắt giao dịch</h6>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Số tiền nạp:</span>
                          <span className="fw-bold text-primary fs-5">{formatVND(selectedAmount)}</span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Phương thức:</span>
                          <span className="fw-semibold">
                            {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                          </span>
                        </div>

                        <div className="d-flex align-items-center text-success">
                          <FaShieldAlt className="me-2" size={14} />
                          <small>Giao dịch được bảo mật 100%</small>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Submit Button - Clean */}
                  <div className="d-grid">
                    <Button
                      size="lg"
                      className="py-3 fw-semibold"
                      style={{
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                      }}
                      onClick={handleSubmit}
                      disabled={!selectedAmount || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="me-2 fa-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          Thanh toán {selectedAmount ? formatVND(selectedAmount) : ""}
                          <FaArrowRight className="ms-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="text-center mt-4">
                    <div className="d-flex justify-content-center align-items-center gap-4 text-muted">
                      <div className="d-flex align-items-center">
                        <FaShieldAlt className="me-1" size={12} />
                        <small>Bảo mật SSL</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaCheckCircle className="me-1" size={12} />
                        <small>Xử lý tức thì</small>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DepositPage
