"use client"

import { useState, useEffect } from "react"
import { Button, Spinner } from "react-bootstrap"
import { FaPencilAlt, FaStar, FaRegStar } from "react-icons/fa"
import { useNavigate, useLocation } from "react-router-dom"
import { useResponsive } from "../../store/hook"
import "./ReviewRoom.css"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"

export default function ReviewRoomPage() {
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
  }, [])

  const handleWriteReview = () => {
    // Navigate to write review page
    navigate("/write-review")
  }

  return (
    <SidebarPersonLayout>
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ color: "#0046a8" }}>
            QUẢN LÝ ĐÁNH GIÁ TRỌ
          </h2>
          <p className="text-muted mb-0">Quản lý đánh giá trọ của bạn trên Trọ Tốt</p>
        </div>

        {/* Content */}
        <div
          className="review-content bg-white rounded-3 shadow-sm flex-grow-1 d-flex flex-column align-items-center justify-content-center"
          style={{ overflow: "hidden" }}
        >
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <Spinner
                animation="border"
                variant="primary"
                style={{ color: "#0046a8", width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Đang tải đánh giá...</p>
            </div>
          ) : (
            <div className="empty-reviews-container text-center py-5 px-3">
              <div className="stars-container mb-4">
                <div className="d-flex justify-content-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className="mx-1"
                      style={{
                        transform: `rotate(${(star - 3) * 5}deg)`,
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.2) rotate(0deg)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${(star - 3) * 5}deg)`
                      }}
                    >
                      {star % 2 === 0 ? (
                        <FaStar size={isMobile ? 32 : 48} style={{ color: "#FFD700" }} />
                      ) : (
                        <FaRegStar size={isMobile ? 32 : 48} style={{ color: "#FFD700" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <h4 className="fw-bold mb-3">Bạn chưa viết đánh giá nào</h4>
              <p className="text-muted mb-4 px-md-5" style={{ maxWidth: "500px", margin: "0 auto" }}>
                Hãy chia sẻ trải nghiệm của bạn bằng cách viết đánh giá đầu tiên. Đánh giá của bạn sẽ giúp người khác
                tìm được trọ phù hợp.
              </p>

              <Button
                variant="primary"
                className="px-4 py-2 d-inline-flex align-items-center"
                onClick={handleWriteReview}
                style={{
                  backgroundColor: "#0046a8",
                  borderColor: "#0046a8",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#003d91"
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 70, 168, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0046a8"
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <FaPencilAlt className="me-2" />
                Viết đánh giá
              </Button>
            </div>
          )}
        </div>
      </div>
    </SidebarPersonLayout>
  )
}
