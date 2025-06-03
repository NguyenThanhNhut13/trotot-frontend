"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Row, Col, Card, Badge, Spinner, Button } from "react-bootstrap"
import { FaMapMarkerAlt, FaHeart, FaTrash, FaHome } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import type { AppDispatch, RootState } from "../../store/store"
import { fetchSavedRooms, removeSavedRoom } from "../../store/slices/savedRoomsSlice"
import { formatCurrency } from "../../utils/formatters"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"
import { useResponsive } from "../../store/hook"

interface Room {
  id: number
  title: string
  address: string
  price: string
  type: string
  area: number
  imageUrl: string
  district: string
  province: string
  isHot?: boolean
}

const SavedRoomPage = () => {
  const { isMobile, isTablet } = useResponsive()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { items: savedRooms, loading, error } = useSelector((state: RootState) => state.savedRooms)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())

  // Fetch saved rooms from Redux
  useEffect(() => {
    if (savedRooms.length === 0 && !loading && !error) {
      dispatch(fetchSavedRooms())
        .unwrap()
        .catch((error) => {
          toast.error("Đã xảy ra lỗi khi tải danh sách trọ đã lưu: " + (error || "Lỗi không xác định"))
        })
    }
  }, [dispatch, savedRooms.length, loading, error])

  const handleRemoveSaved = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation()

    setRemovingIds((prev) => new Set(prev).add(id))

    try {
      await dispatch(removeSavedRoom(id)).unwrap()
      toast.success("Đã xóa trọ khỏi danh sách yêu thích!")
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa trọ khỏi danh sách yêu thích!")
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleViewRoom = (id: number) => {
    navigate(`/phong-tro/${id}`)
  }

  const renderMobileCard = (room: Room) => (
    <Card
      key={room.id}
      className="mb-3 border-0 shadow-sm rounded-4 overflow-hidden"
      style={{
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
      }}
      onClick={() => handleViewRoom(room.id)}
    >
      <div className="position-relative">
        {room.isHot && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-0 m-2 z-3"
            style={{
              fontSize: "0.7rem",
              padding: "0.4rem 0.6rem",
              borderRadius: "12px",
            }}
          >
            HOT
          </Badge>
        )}

        <div className="position-relative">
          <img
            src={room.imageUrl || "/placeholder.svg"}
            className="w-100"
            alt={room.title}
            style={{
              height: "160px",
              objectFit: "cover",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=160&width=300"
            }}
          />
          <div className="position-absolute top-0 end-0 m-2 d-flex gap-2" style={{ zIndex: 2 }}>
            <Button
              variant="light"
              size="sm"
              className="rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: "32px", height: "32px" }}
              onClick={(e) => handleRemoveSaved(e, room.id)}
              disabled={removingIds.has(room.id)}
            >
              {removingIds.has(room.id) ? <Spinner size="sm" /> : <FaHeart className="text-danger" size={14} />}
            </Button>
          </div>
        </div>

        <Card.Body className="p-3">
          <Card.Title className="fw-bold mb-2" style={{ fontSize: "0.9rem", lineHeight: "1.3" }}>
            {room.title}
          </Card.Title>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ color: "#0046a8", fontSize: "0.9rem" }}>
              {formatCurrency(room.price)}
            </span>
            <Badge bg="light" text="dark" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
              {room.area} m²
            </Badge>
          </div>

          <div className="d-flex align-items-center text-muted mb-2">
            <FaMapMarkerAlt size={12} className="me-1" />
            <small style={{ fontSize: "0.75rem" }}>
              {room.district && room.province ? `${room.district}, ${room.province}` : "Không có địa chỉ"}
            </small>
          </div>

          <Badge bg="light" text="dark" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
            {room.type}
          </Badge>
        </Card.Body>
      </div>
    </Card>
  )

  const renderDesktopCard = (room: Room) => (
    <Card
      key={room.id}
      className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden"
      style={{
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)"
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)"
      }}
      onClick={() => handleViewRoom(room.id)}
    >
      <div className="position-relative">
        {room.isHot && (
          <Badge
            bg="danger"
            className="position-absolute top-0 start-0 m-3 z-3"
            style={{
              fontSize: "0.75rem",
              padding: "0.5rem 0.8rem",
              borderRadius: "15px",
            }}
          >
            HOT
          </Badge>
        )}

        <Row className="g-0">
          <Col md={4} className="position-relative">
            <img
              src={room.imageUrl || "/placeholder.svg"}
              className="w-100 h-100"
              alt={room.title}
              style={{
                minHeight: "200px",
                objectFit: "cover",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=200&width=300"
              }}
            />
            <div className="position-absolute top-0 end-0 m-3 d-flex gap-2" style={{ zIndex: 2 }}>
              <Button
                variant="light"
                size="sm"
                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: "36px", height: "36px" }}
                onClick={(e) => handleRemoveSaved(e, room.id)}
                disabled={removingIds.has(room.id)}
              >
                {removingIds.has(room.id) ? <Spinner size="sm" /> : <FaHeart className="text-danger" size={16} />}
              </Button>
            </div>
          </Col>

          <Col md={8}>
            <Card.Body className="p-4">
              <Card.Title className="fw-bold mb-3" style={{ fontSize: "1.1rem" }}>
                {room.title}
              </Card.Title>

              <div className="d-flex align-items-center mb-3">
                <span className="fw-bold me-4" style={{ color: "#0046a8", fontSize: "1.1rem" }}>
                  Từ {formatCurrency(room.price)}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                  {room.type}
                </Badge>
                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill">
                  {room.area} m²
                </Badge>
              </div>

              <div className="d-flex align-items-center">
                <FaMapMarkerAlt className="text-muted me-2" />
                <small className="text-muted">
                  {room.district && room.province ? `${room.district}, ${room.province}` : "Không có địa chỉ"}
                </small>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </div>
    </Card>
  )

  return (
    <SidebarPersonLayout>
      <div className="px-3">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: "#0046a8", fontSize: isMobile ? "1.5rem" : "1.75rem" }}>
              TRỌ ĐÃ LƯU
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
              Tổng số {savedRooms.length} trọ đã lưu
            </p>
          </div>

          {savedRooms.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <FaHeart style={{ color: "#0046a8" }} />
              <span className="fw-medium" style={{ color: "#0046a8", fontSize: "0.9rem" }}>
                {savedRooms.length}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
              }}
            >
              <Spinner animation="border" style={{ color: "white" }} />
            </div>
            <p className="text-muted">Đang tải danh sách trọ đã lưu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)",
              }}
            >
              <FaTrash style={{ color: "white", fontSize: "30px" }} />
            </div>
            <p className="text-danger">Đã xảy ra lỗi: {error}</p>
          </div>
        ) : savedRooms.length > 0 ? (
          <div>
            {isMobile || isTablet ? (
              <Row className="g-3">
                {savedRooms.map((room) => (
                  <Col xs={12} sm={6} key={room.id}>
                    {renderMobileCard(room)}
                  </Col>
                ))}
              </Row>
            ) : (
              <div>{savedRooms.map((room) => renderDesktopCard(room))}</div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: "100px",
                height: "100px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              }}
            >
              <FaHome style={{ color: "#6c757d", fontSize: "40px" }} />
            </div>
            <h5 className="fw-bold mb-2" style={{ color: "#0046a8" }}>
              Chưa có trọ nào được lưu
            </h5>
            <p className="text-muted mb-4">Hãy tìm kiếm và lưu những trọ yêu thích của bạn!</p>
            <Button
              variant="primary"
              className="rounded-3 px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                border: "none",
              }}
              onClick={() => navigate("/tim-kiem")}
            >
              Tìm kiếm trọ
            </Button>
          </div>
        )}
      </div>
    </SidebarPersonLayout>
  )
}

export default SavedRoomPage
