"use client"

import type React from "react"
import { useState } from "react"
import { FaWallet, FaCreditCard, FaQrcode, FaUniversity, FaCheckCircle, FaSpinner } from "react-icons/fa"
import paymentAPI from "../../apis/payment.api"
import { toast } from "react-toastify"
import { useAppSelector } from "../../store/hook"
import { SidebarLayout } from "../MainPage/Sidebar"

const DepositPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>("vnpay")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { profile } = useAppSelector((state) => state.user)

  // Danh sách số tiền có thể chọn
  const amounts = [50000, 100000, 200000, 300000, 500000, 1000000, 1500000, 2000000]

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    {
      id: "qrcode",
      name: "QR CODE",
      icon: FaQrcode,
      color: "#28a745",
      description: "Quét mã QR để thanh toán",
    },
    {
      id: "vnpay",
      name: "VNPAY",
      icon: FaCreditCard,
      color: "#0046a8",
      description: "Ví điện tử VNPAY",
    },
    {
      id: "atm",
      name: "ATM",
      icon: FaUniversity,
      color: "#dc3545",
      description: "Thẻ ATM/Internet Banking",
    },
  ]

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
  }

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
    <SidebarLayout>
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          margin: "-1rem",
          padding: "1rem",
          minHeight: "100vh",
        }}
      >
        <div className="container-fluid">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                boxShadow: "0 8px 32px rgba(0, 70, 168, 0.3)",
              }}
            >
              <FaWallet size={32} color="white" />
            </div>
            <h2
              className="fw-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              }}
            >
              NẠP TIỀN VÀO VÍ
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "clamp(0.9rem, 2vw, 1.1rem)" }}>
              Chọn số tiền và phương thức thanh toán phù hợp
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 col-xl-6">
              {/* Amount Selection */}
              <div
                className="bg-white rounded-4 p-4 mb-4 shadow-lg"
                style={{
                  border: "1px solid rgba(0, 70, 168, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#0046a8" }}>
                  <div
                    className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                    }}
                  >
                    <span className="text-white fw-bold" style={{ fontSize: "0.8rem" }}>
                      1
                    </span>
                  </div>
                  Chọn số tiền nạp
                </h5>

                <div className="row g-3">
                  {amounts.map((amount) => (
                    <div key={amount} className="col-6 col-md-4 col-lg-3">
                      <button
                        className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden`}
                        style={{
                          minHeight: "80px",
                          background:
                            selectedAmount === amount ? "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)" : "#f8f9fa",
                          color: selectedAmount === amount ? "white" : "#495057",
                          border: selectedAmount === amount ? "2px solid #0046a8" : "2px solid #e9ecef",
                          borderRadius: "16px",
                          fontSize: "clamp(0.7rem, 2vw, 0.9rem)",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                          transform: selectedAmount === amount ? "translateY(-2px)" : "translateY(0)",
                          boxShadow:
                            selectedAmount === amount
                              ? "0 8px 25px rgba(0, 70, 168, 0.3)"
                              : "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        onClick={() => handleAmountSelect(amount)}
                        onMouseEnter={(e) => {
                          if (selectedAmount !== amount) {
                            e.currentTarget.style.transform = "translateY(-2px)"
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedAmount !== amount) {
                            e.currentTarget.style.transform = "translateY(0)"
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                          }
                        }}
                      >
                        <span className="fw-bold">{formatVND(amount)}</span>
                        {selectedAmount === amount && (
                          <FaCheckCircle className="position-absolute" style={{ top: "8px", right: "8px" }} size={16} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div
                className="bg-white rounded-4 p-4 mb-4 shadow-lg"
                style={{
                  border: "1px solid rgba(0, 70, 168, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#0046a8" }}>
                  <div
                    className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                    }}
                  >
                    <span className="text-white fw-bold" style={{ fontSize: "0.8rem" }}>
                      2
                    </span>
                  </div>
                  Chọn phương thức thanh toán
                </h5>

                <div className="row g-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <div key={method.id} className="col-12 col-sm-4">
                        <div
                          className={`card h-100 position-relative overflow-hidden`}
                          style={{
                            cursor: "pointer",
                            border: selectedMethod === method.id ? `3px solid ${method.color}` : "2px solid #e9ecef",
                            borderRadius: "16px",
                            transition: "all 0.3s ease",
                            transform: selectedMethod === method.id ? "translateY(-4px)" : "translateY(0)",
                            boxShadow:
                              selectedMethod === method.id
                                ? `0 12px 30px ${method.color}40`
                                : "0 4px 12px rgba(0,0,0,0.1)",
                            background:
                              selectedMethod === method.id
                                ? `linear-gradient(135deg, ${method.color}15 0%, ${method.color}05 100%)`
                                : "white",
                          }}
                          onClick={() => handleMethodSelect(method.id)}
                          onMouseEnter={(e) => {
                            if (selectedMethod !== method.id) {
                              e.currentTarget.style.transform = "translateY(-2px)"
                              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedMethod !== method.id) {
                              e.currentTarget.style.transform = "translateY(0)"
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
                            }
                          }}
                        >
                          <div className="card-body text-center p-4">
                            <div
                              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                              style={{
                                width: "60px",
                                height: "60px",
                                background: selectedMethod === method.id ? method.color : `${method.color}20`,
                                color: selectedMethod === method.id ? "white" : method.color,
                              }}
                            >
                              <IconComponent size={24} />
                            </div>
                            <h6
                              className="fw-bold mb-2"
                              style={{
                                color: selectedMethod === method.id ? method.color : "#495057",
                                fontSize: "clamp(0.8rem, 2vw, 1rem)",
                              }}
                            >
                              {method.name}
                            </h6>
                            <p className="text-muted mb-0" style={{ fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)" }}>
                              {method.description}
                            </p>
                            {selectedMethod === method.id && (
                              <FaCheckCircle
                                className="position-absolute"
                                style={{ top: "12px", right: "12px", color: method.color }}
                                size={20}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Transaction Details */}
              <div
                className="bg-white rounded-4 p-4 mb-4 shadow-lg"
                style={{
                  border: "1px solid rgba(0, 70, 168, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#0046a8" }}>
                  <div
                    className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                    }}
                  >
                    <span className="text-white fw-bold" style={{ fontSize: "0.8rem" }}>
                      3
                    </span>
                  </div>
                  Chi tiết giao dịch
                </h5>

                <div
                  className="rounded-3 p-4"
                  style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <div className="row mb-3">
                    <div className="col-6">
                      <span className="text-muted" style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>
                        Số tiền thanh toán:
                      </span>
                    </div>
                    <div className="col-6 text-end">
                      <span
                        className="fw-bold"
                        style={{
                          color: "#0046a8",
                          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                        }}
                      >
                        {selectedAmount ? formatVND(selectedAmount) : "Chưa chọn"}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <span className="text-muted" style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>
                        Phương thức:
                      </span>
                    </div>
                    <div className="col-6 text-end">
                      <span
                        className="fw-bold"
                        style={{
                          color: "#0046a8",
                          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                        }}
                      >
                        {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                      </span>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <span className="text-muted" style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>
                        Nạp vào tài khoản:
                      </span>
                    </div>
                    <div className="col-6 text-end">
                      <span
                        className="fw-bold"
                        style={{
                          color: "#0046a8",
                          fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                        }}
                      >
                        {profile?.fullName || "Chưa đăng nhập"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="btn w-100 py-3 fw-bold position-relative overflow-hidden"
                style={{
                  background:
                    selectedAmount && !isLoading ? "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  transition: "all 0.3s ease",
                  boxShadow:
                    selectedAmount && !isLoading ? "0 8px 25px rgba(0, 70, 168, 0.4)" : "0 4px 12px rgba(0,0,0,0.2)",
                }}
                onClick={handleSubmit}
                disabled={!selectedAmount || isLoading}
                onMouseEnter={(e) => {
                  if (selectedAmount && !isLoading) {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 70, 168, 0.5)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAmount && !isLoading) {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 70, 168, 0.4)"
                  }
                }}
              >
                {isLoading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <FaSpinner className="me-2 fa-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center">
                    <FaWallet className="me-2" />
                    Tiến hành thanh toán
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DepositPage
