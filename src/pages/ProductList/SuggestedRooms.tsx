"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { FaHeart, FaMapMarkerAlt, FaEye, FaClock } from "react-icons/fa"
import { useAppDispatch, useAppSelector, useResponsive } from "../../store/hook"
import roomApi from "../../apis/room.api"
import type { Room } from "../../types/room.type"
import { fetchRecommendedRooms, resetRecommendations } from "../../store/slices/recommendationSlice"

interface SuggestedRoomsProps {
  onSaveRoom?: (roomId: number) => void
}

interface SuggestedRoom {
  id: number
  title: string
  price: number
  area: number
  imageUrls: string[]
  district: string
  province: string
  createdAt: string
  viewCount?: number
}

const SuggestedRooms = ({ onSaveRoom }: SuggestedRoomsProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { profile } = useAppSelector((state) => state.user);
  const { rooms: suggestedRooms, loading: isLoading, error, hasLoaded } = 
    useAppSelector((state) => state.recommendation);

  // Chỉ fetch khi user đã đăng nhập
  useEffect(() => {
    if (!isAuthenticated || !profile || hasLoaded) return;

    const timer = setTimeout(() => {
      dispatch(fetchRecommendedRooms(profile.id));
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, profile, hasLoaded]);

  // Không hiển thị gì nếu user chưa đăng nhập
  if (!isAuthenticated) {
    return null
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const createdDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Vừa đăng"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    return "Hơn 1 tuần trước"
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-2">
            <i className="fas fa-magic me-2"></i>
            GỢI Ý DÀNH CHO BẠN
          </h2>
          <p className="text-muted mb-0">Những phòng trọ phù hợp với sở thích và nhu cầu của bạn</p>
        </div>
        {!isMobile && (
          <Link to="/category/tat-ca" className="text-decoration-none">
            <Button variant="outline-primary" className="rounded-pill px-4">
              Xem tất cả
              <i className="fas fa-arrow-right ms-2"></i>
            </Button>
          </Link>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Đang tìm kiếm phòng trọ phù hợp cho bạn...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert variant="warning" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <Button
            variant="outline-primary"
            size="sm"
            className="ms-3"
            onClick={() => dispatch(resetRecommendations())}
          >
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Rooms Grid */}
      {!isLoading && !error && suggestedRooms.length > 0 && (
        <>
          <Row className="g-3">
            {suggestedRooms.map((room) => (
              <Col key={room.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Card className="h-100 border-0 shadow-sm room-card">
                  <div className="position-relative">
                    {/* Room Image */}
                    <div className="position-relative overflow-hidden" style={{ height: "200px" }}>
                      <Card.Img
                        variant="top"
                        src={room.imageUrls[0] || "/placeholder.svg?height=200&width=300"}
                        alt={room.title}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />

                      {/* Overlay with view count */}
                      <div
                        className="position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill text-white d-flex align-items-center"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", fontSize: "0.75rem" }}
                      >
                        <FaEye className="me-1" size={12} />
                        {Math.floor(Math.random() * 100) + 10}
                      </div>

                      {/* Heart icon */}
                      <div className="position-absolute top-0 start-0 m-2">
                        <Button
                          variant="light"
                          size="sm"
                          className="rounded-circle p-2 border-0"
                          style={{ width: "36px", height: "36px" }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onSaveRoom?.(room.id)
                          }}
                        >
                          <FaHeart size={14} className="text-muted" />
                        </Button>
                      </div>

                      {/* Suggested badge */}
                      <div
                        className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded-pill text-white"
                        style={{
                          backgroundColor: "#28a745",
                          fontSize: "0.7rem",
                          fontWeight: "600",
                        }}
                      >
                        <i className="fas fa-star me-1"></i>
                        Gợi ý
                      </div>
                    </div>
                  </div>

                  <Card.Body className="p-3">
                    {/* Title */}
                    <Card.Title
                      className="fw-bold mb-2 text-truncate"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        lineHeight: "1.3",
                      }}
                      title={room.title}
                    >
                      {room.title}
                    </Card.Title>

                    {/* Price */}
                    <div className="d-flex align-items-center mb-2">
                      <span className="fw-bold text-danger" style={{ fontSize: isMobile ? "1rem" : "1.1rem" }}>
                        {room.price.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-muted ms-1" style={{ fontSize: "0.8rem" }}>
                        /tháng
                      </span>
                    </div>

                    {/* Area */}
                    <div className="mb-2">
                      <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                        Diện tích: <strong>{room.area}m²</strong>
                      </span>
                    </div>

                    {/* Location */}
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-muted me-1" size={12} />
                      <span
                        className="text-muted text-truncate"
                        style={{ fontSize: "0.8rem" }}
                        title={`${room.district}, ${room.province}`}
                      >
                        {room.district}, {room.province}
                      </span>
                    </div>

                    {/* Time posted
                    <div className="d-flex align-items-center mb-3">
                      <FaClock className="text-muted me-1" size={12} />
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {formatTimeAgo(room.createdAt)}
                      </span>
                    </div> */}

                    {/* View button
                    <Link to={`/phong-tro/${room.id}`} className="text-decoration-none">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-100 rounded-pill"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Xem chi tiết
                      </Button>
                    </Link> */}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Mobile view all button */}
          {isMobile && (
            <div className="text-center mt-4">
              <Link to="/category/tat-ca" className="text-decoration-none">
                <Button variant="outline-primary" className="rounded-pill px-4">
                  Xem tất cả gợi ý<i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && suggestedRooms.length === 0 && hasLoaded && (
        <div className="text-center py-5">
          <i className="fas fa-search text-muted mb-3" style={{ fontSize: "3rem" }}></i>
          <h5 className="text-muted mb-2">Chưa có gợi ý phù hợp</h5>
          <p className="text-muted mb-3">
            Hãy tìm kiếm và xem một số phòng trọ để chúng tôi có thể gợi ý tốt hơn cho bạn
          </p>
          <Link to="/category/tat-ca" className="text-decoration-none">
            <Button variant="primary" className="rounded-pill px-4">
              Khám phá ngay
            </Button>
          </Link>
        </div>
      )}
    </Container>
  )
}

export default SuggestedRooms
