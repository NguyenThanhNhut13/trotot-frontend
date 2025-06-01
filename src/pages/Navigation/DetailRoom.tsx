"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Badge, Button, Carousel, Spinner, Modal, Form } from "react-bootstrap"
import {
  FaMapMarkerAlt,
  FaRuler,
  FaPhone,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaRegCalendarAlt,
  FaUserAlt,
  FaAngleRight,
  FaStar,
  FaHome,
  FaUsers,
  FaBed,
  FaBath,
  FaUtensils,
  FaCouch,
  FaArrowLeft,
  FaEye,
  FaCheck,
} from "react-icons/fa"
import roomApi from "../../apis/room.api"
import reviewAPI from "../../apis/review.api"
import userApi from "../../apis/user.api"
import type { RoomGetByID, RoomImage } from "../../types/room.type"
import { toast } from "react-toastify"
import RoomMap from "../../components/common/Map/RoomMap"
import addressAPI from "../../apis/address.api"
import { fallbackGeocode, getDefaultCoordinates, retryApiCall } from "../../utils/geocodingFallback"
import LoginModal from "../../pages/Login/LoginModal"
import { useResponsive } from "../../store/hook"

export default function DetailRoom() {
  const { isMobile, isTablet } = useResponsive()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<RoomGetByID | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [latitude, setLatitude] = useState(0)
  const [address, setAddress] = useState("")
  const [similarRoomsError, setSimilarRoomsError] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [similarRoomsLoading, setSimilarRoomsLoading] = useState(true)
  const [similarRooms, setSimilarRooms] = useState<any[]>([])

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!id) return
        const roomId = Number.parseInt(id)
        const roomResponse = await retryApiCall(() => roomApi.getRoomById(roomId), 3, 1000)
        const roomData = roomResponse.data.data
        setRoom(roomData)
        if (roomData.address) {
          const addressString =
            typeof roomData.address === "object"
              ? `${roomData.address.street || ""}, ${roomData.address.ward || ""}, ${roomData.address.district || ""}, ${roomData.address.province || ""}`
              : roomData.address
          try {
            const geoResponse = await addressAPI.getMapForward(addressString)
            const geoData = geoResponse.data.data
            let coordinates
            if (Array.isArray(geoData) && geoData.length > 0) {
              coordinates = geoData[0]
            } else if (typeof geoData === "object") {
              coordinates = geoData
            }
            if (coordinates && "lat" in coordinates && "lon" in coordinates) {
              setLatitude(coordinates.lat)
              setLongitude(coordinates.lon)
              setAddress(addressString)
            }
          } catch {
            try {
              const fallbackResult = await fallbackGeocode(addressString)
              if (fallbackResult) {
                setLatitude(fallbackResult.lat)
                setLongitude(fallbackResult.lon)
                setAddress(addressString)
              } else {
                const cityName = roomData.address.province || "Đà Nẵng"
                const defaultCoords = getDefaultCoordinates(cityName)
                setLatitude(defaultCoords.lat)
                setLongitude(defaultCoords.lon)
              }
            } catch {
              setLatitude(16.0544)
              setLongitude(108.2022)
            }
          }
        } else {
          setLatitude(16.0544)
          setLongitude(108.2022)
          setAddress("Địa chỉ không xác định")
        }
      } catch {
        setError("Không thể tải thông tin phòng. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
    fetchRoomDetails()
  }, [id])

  useEffect(() => {
    if (!room) return
    const fetchSimilarRooms = async () => {
      setSimilarRoomsLoading(true)
      setSimilarRoomsError(null)
      try {
        const roomId = room.id
        const similarRoomsData = await retryApiCall(() => roomApi.aiGetSimilarRoom(roomId), 3, 1000)
        if (similarRoomsData?.data?.data) {
          setSimilarRooms(similarRoomsData.data.data)
        }
      } catch {
        setSimilarRoomsError("Không thể tải danh sách phòng tương tự. Vui lòng thử lại sau.")
      } finally {
        setSimilarRoomsLoading(false)
      }
    }
    fetchSimilarRooms()
  }, [room])

  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) return
      try {
        const response = await userApi.getProfile()
        if (response.data.success) {
          setUserId(response.data.data.id)
        } else {
          throw new Error()
        }
      } catch {}
    }
    fetchUserProfile()
  }, [])

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!room) return
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) return
      try {
        const response = await roomApi.getSavedRoomIds()
        if (response.data?.data?.roomIds) {
          setIsFavorite(response.data.data.roomIds.includes(room.id))
        }
      } catch {}
    }
    checkFavoriteStatus()
  }, [room])

  const handleToggleFavorite = async () => {
    if (!room) return
    const isLoggedIn = localStorage.getItem("accessToken")
    if (!isLoggedIn) {
      localStorage.setItem("pendingAction", "save-room")
      localStorage.setItem("pendingRoomId", room.id.toString())
      setShowLoginModal(true)
      return
    }
    try {
      if (!isFavorite) {
        await roomApi.addToWishList(room.id)
        toast.success("Đã lưu tin thành công")
      } else {
        await roomApi.removeFromWishList(room.id)
        toast.success("Đã xóa tin khỏi danh sách yêu thích")
      }
      setIsFavorite(!isFavorite)
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.")
    }
  }

  const handleLoginModalClose = () => setShowLoginModal(false)

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: room?.title,
          text: `Xem phòng trọ: ${room?.title}`,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Đã sao chép liên kết vào clipboard"))
        .catch(() => toast.error("Không thể sao chép liên kết"))
    }
  }

  const handleSubmitReview = async () => {
    if (!room) return
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để gửi đánh giá")
      setShowReviewModal(false)
      return
    }
    if (!userId) {
      toast.error("Không thể xác định thông tin người dùng. Vui lòng thử lại.")
      setShowReviewModal(false)
      return
    }
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn điểm số từ 1 đến 5")
      return
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập bình luận")
      return
    }
    try {
      const uploadedImages: RoomImage[] = images.map((file, index) => ({
        publicId: `local-${index}-${file.name}`,
        imageUrl: URL.createObjectURL(file),
      }))
      const reviewData = {
        roomId: room.id,
        userId: userId,
        rating: rating,
        comment: comment,
        images: uploadedImages,
      }
      const response = await reviewAPI.createReview(reviewData)
      if (response.data.success) {
        setShowReviewModal(false)
        setShowSuccessModal(true)
        setRating(0)
        setComment("")
        setImages([])
      } else {
        throw new Error()
      }
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.")
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="text-center">
          <Spinner animation="border" style={{ width: "3rem", height: "3rem", color: "#0046a8" }} />
          <div className="mt-3 text-muted fw-medium">Đang tải thông tin phòng...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="alert alert-danger shadow-sm border-0 rounded-4">
            <i className="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
            <h5>Có lỗi xảy ra</h5>
            <p className="mb-0">{error}</p>
          </div>
        </div>
      </Container>
    )
  }

  if (!room) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="alert alert-warning shadow-sm border-0 rounded-4">
            <i className="fas fa-search fa-2x text-warning mb-3"></i>
            <h5>Không tìm thấy</h5>
            <p className="mb-0">Không tìm thấy phòng trọ này.</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Container className="py-4">
        {/* Back Button - Mobile Friendly */}
        <div className="d-block d-md-none mb-3">
          <Button
            variant="outline-primary"
            onClick={handleGoBack}
            className="d-flex align-items-center border-0 shadow-sm rounded-pill px-3 py-2"
            style={{
              backgroundColor: "white",
              color: "#0046a8",
              borderColor: "#0046a8",
            }}
          >
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Quay lại</span>
          </Button>
        </div>
        <Row className="g-4">
          <Col lg={8}>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
              <ol className="breadcrumb bg-white rounded-4 shadow-sm px-4 py-3 mb-0">
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    className="text-decoration-none fw-medium"
                    style={{ color: "#0046a8" }}
                    onClick={(e) => {
                      e.preventDefault()
                      handleGoBack()
                    }}
                  >
                    <FaHome className="me-1" />
                    Trang chủ
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <Link
                    className="text-decoration-none text-muted fw-medium"
                    to={`/category/${
                      room.roomType === "BOARDING_HOUSE"
                        ? "nha-tro-phong-tro"
                        : room.roomType === "WHOLE_HOUSE"
                        ? "nha-nguyen-can"
                        : "can-ho"
                    }`}
                  >
                    {room.roomType === "BOARDING_HOUSE"
                      ? "Phòng trọ"
                      : room.roomType === "WHOLE_HOUSE"
                      ? "Nhà nguyên căn"
                      : "Căn hộ"}
                  </Link>
                </li>
                <li className="breadcrumb-item active text-muted" aria-current="page">
                  {room.title.length > 30 ? `${room.title.substring(0, 30)}...` : room.title}
                </li>
              </ol>
            </nav>
            {/* Room Title Section */}
            <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h1 className="h4 fw-bold text-dark mb-2 lh-base">{room.title}</h1>
                    <div className="d-flex align-items-center text-muted">
                      <FaMapMarkerAlt style={{ color: "#0046a8" }} className="me-2 flex-shrink-0" />
                      <span className="small">
                        {room.address ? (
                          <>
                            {room.address.houseNumber || ""}, {room.address.street || ""}, {room.address.ward || ""},{" "}
                            {room.address.district || ""}, {room.address.province || ""}
                          </>
                        ) : (
                          "Đang cập nhật địa chỉ"
                        )}
                      </span>
                    </div>
                  </div>
                  <Badge style={{ backgroundColor: "#0046a8" }} className="rounded-pill px-3 py-2 fs-6">
                    {room.roomType === "BOARDING_HOUSE"
                      ? "Phòng trọ"
                      : room.roomType === "WHOLE_HOUSE"
                      ? "Nhà nguyên căn"
                      : "Căn hộ"}
                  </Badge>
                </div>
                {/* Quick Stats */}
                <Row className="g-3">
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <div style={{ color: "#0046a8" }} className="h6 mb-1">
                        Giá thuê
                      </div>
                      <div className="h6 text-danger fw-bold mb-0">{room.price.toLocaleString()} đ/tháng</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <div style={{ color: "#0046a8" }} className="h6 mb-1">
                        Diện tích
                      </div>
                      <div className="h6 fw-bold mb-0">
                        <FaRuler className="me-1" />
                        {room.area} m²
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <div style={{ color: "#0046a8" }} className="h6 mb-1">
                        Đặt cọc
                      </div>
                      <div className="h6 fw-bold mb-0">{room.deposit.toLocaleString()} đ</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <div style={{ color: "#0046a8" }} className="h6 mb-1">
                        Đối tượng
                      </div>
                      <div className="h6 fw-bold mb-0">
                        <FaUsers className="me-1" />
                        {room.forGender === "ALL" ? "Tất cả" : room.forGender === "MALE" ? "Nam" : "Nữ"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Image Carousel */}
            <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
              <div className="position-relative">
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={setActiveIndex}
                  interval={null}
                  className="room-carousel"
                  indicators={false}
                >
                  {room.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <div
                        style={{
                          height: isMobile ? "250px" : isTablet ? "350px" : "450px",
                          backgroundColor: "#f8f9fa",
                          position: "relative",
                        }}
                      >
                        <img
                          className="d-block w-100 h-100"
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={`Hình ${index + 1} của ${room.title}`}
                          style={{ objectFit: "cover" }}
                        />
                        <div className="position-absolute top-0 end-0 m-3">
                          <Badge bg="dark" className="bg-opacity-75 rounded-pill px-3 py-2">
                            {index + 1} / {room.images.length}
                          </Badge>
                        </div>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
                {/* Thumbnail Navigation */}
                <div className="p-3 bg-white">
                  <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                    {room.images.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`flex-shrink-0 rounded-3 overflow-hidden cursor-pointer ${
                          activeIndex === index ? "border-2" : "border"
                        }`}
                        style={{
                          cursor: "pointer",
                          width: "60px",
                          height: "45px",
                          borderColor: activeIndex === index ? "#0046a8" : "#dee2e6",
                        }}
                      >
                        <img
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={`Thumbnail ${index}`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            {/* Action Buttons */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={12} sm={4}>
                    <Button
                      variant="success"
                      className="w-100 rounded-pill fw-medium"
                      onClick={() => setShowReviewModal(true)}
                      style={{
                        backgroundColor: "#28a745",
                        borderColor: "#28a745",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaStar className="me-2" />
                      Đánh giá phòng
                    </Button>
                  </Col>
                  <Col xs={6} sm={4}>
                    <Button
                      variant={isFavorite ? "danger" : "outline-danger"}
                      className="w-100 rounded-pill fw-medium"
                      onClick={handleToggleFavorite}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      {isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                      {isFavorite ? "Đã lưu" : "Lưu tin"}
                    </Button>
                  </Col>
                  <Col xs={6} sm={4}>
                    <Button
                      variant="outline-primary"
                      className="w-100 rounded-pill fw-medium"
                      onClick={handleShare}
                      style={{
                        borderColor: "#0046a8",
                        color: "#0046a8",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FaShareAlt className="me-2" />
                      Chia sẻ
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            {/* Room Description */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaEye style={{ color: "#0046a8" }} className="me-2" />
                  Thông tin mô tả
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <p className="text-muted lh-lg mb-0" style={{ whiteSpace: "pre-line" }}>
                  {room.description}
                </p>
              </Card.Body>
            </Card>
            {/* Room Specifications */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaHome style={{ color: "#0046a8" }} className="me-2" />
                  Đặc điểm phòng trọ
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-3">
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaHome style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Số phòng</div>
                        <div className="fw-bold">{room.totalRooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaUsers style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Số người tối đa</div>
                        <div className="fw-bold">{room.maxPeople} người</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaBed style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng ngủ</div>
                        <div className="fw-bold">{room.numberOfBedrooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaBath style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng tắm</div>
                        <div className="fw-bold">{room.numberOfBathrooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaUtensils style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Nhà bếp</div>
                        <div className="fw-bold">{room.numberOfKitchens} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <FaCouch style={{ color: "#0046a8" }} className="me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng khách</div>
                        <div className="fw-bold">{room.numberOfLivingRooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                </Row>
                <div className="mt-4 p-3 rounded-4" style={{ backgroundColor: "#f8f9fa" }}>
                  <Row>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-success me-2" />
                        <span className="small">
                          <strong>Trọ tự quản:</strong> {room.selfManaged ? "Có" : "Không"}
                        </span>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <FaRegCalendarAlt style={{ color: "#0046a8" }} className="me-2" />
                        <span className="small">
                          <strong>Ngày đăng:</strong> {room.createdAt}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            {/* Amenities */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaCheck className="text-success me-2" />
                  Tiện nghi
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-2">
                  {room.amenities.map((amenity, index) => (
                    <Col xs={6} md={4} key={index}>
                      <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                        <FaCheck className="text-success me-2 flex-shrink-0" />
                        <span className="small fw-medium">{amenity.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
            {/* Target Audience */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaUsers style={{ color: "#0046a8" }} className="me-2" />
                  Đối tượng thuê phù hợp
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-2">
                  {room.targetAudiences.map((audience, index) => (
                    <Col xs={6} md={4} key={index}>
                      <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                        <FaUsers style={{ color: "#0046a8" }} className="me-2 flex-shrink-0" />
                        <span className="small fw-medium">{audience.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
            {/* Surrounding Environment */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaMapMarkerAlt style={{ color: "#0046a8" }} className="me-2" />
                  Khu vực xung quanh
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-2">
                  {room.surroundingAreas.map((area, index) => (
                    <Col xs={6} md={4} key={index}>
                      <div className="d-flex align-items-center p-2 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                        <FaMapMarkerAlt style={{ color: "#0046a8" }} className="me-2 flex-shrink-0" />
                        <span className="small fw-medium">{area.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
            {/* Location Map */}
            <Card className="border-0 shadow-sm mb-4 rounded-4">
              <Card.Header className="bg-white border-0 pb-0 p-3">
                <h4 className="fw-bold text-dark mb-0">
                  <FaMapMarkerAlt style={{ color: "#0046a8" }} className="me-2" />
                  Vị trí trên bản đồ
                </h4>
              </Card.Header>
              <Card.Body className="p-3">
                <div
                  className="map-container rounded-4 overflow-hidden"
                  style={{
                    height: isMobile ? "300px" : "400px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <RoomMap
                    latitude={latitude}
                    longitude={longitude}
                    roomTitle="Phòng trọ ở khu vực này"
                    roomAddress={address}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4 rounded-4 sticky-top" style={{ top: "20px" }}>
              <Card.Header className="text-white border-0 p-4 rounded-top-4" style={{ backgroundColor: "#0046a8" }}>
                <h5 className="mb-0 fw-bold">Thông tin liên hệ</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="avatar me-3 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "rgba(0, 70, 168, 0.1)",
                    }}
                  >
                    <FaUserAlt style={{ color: "#0046a8" }} className="fs-4" />
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="mb-1 fw-bold">{room.posterName}</h5>
                    <div className="small text-muted d-flex align-items-center">
                      <FaRegCalendarAlt className="me-1" />
                      Đã đăng: {room.createdAt}
                    </div>
                  </div>
                </div>
                <div className="d-grid gap-3">
                  <Button
                    size="lg"
                    className="rounded-pill fw-medium"
                    onClick={() => setShowPhone(!showPhone)}
                    style={{
                      backgroundColor: "#0046a8",
                      borderColor: "#0046a8",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FaPhone className="me-2" />
                    {showPhone ? room.posterPhone : "Hiện số điện thoại"}
                  </Button>
                  <Button
                    variant={isFavorite ? "danger" : "outline-danger"}
                    size="lg"
                    className="rounded-pill fw-medium"
                    onClick={handleToggleFavorite}
                    style={{ transition: "all 0.3s ease" }}
                  >
                    {isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                    {isFavorite ? "Đã lưu tin" : "Lưu tin này"}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="rounded-pill fw-medium"
                    onClick={handleShare}
                    style={{
                      borderColor: "#0046a8",
                      color: "#0046a8",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <FaShareAlt className="me-2" />
                    Chia sẻ tin này
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* Similar Rooms Section */}
        <Card className="border-0 shadow-sm rounded-4 mt-5">
          <Card.Header className="text-white border-0 p-4 rounded-top-4" style={{ backgroundColor: "#28a745" }}>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fw-bold">
                <FaHome className="me-2" />
                Phòng trọ tương tự
              </h4>
              <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                {similarRooms.length} phòng
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {similarRoomsError ? (
              <div className="text-center py-4">
                <div className="alert alert-danger border-0 rounded-4 mb-3">
                  <div className="small">{similarRoomsError}</div>
                </div>
                <Button
                  variant="primary"
                  className="rounded-pill px-4"
                  onClick={() => setSimilarRoomsError(null)}
                  style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
                >
                  Thử lại
                </Button>
              </div>
            ) : similarRoomsLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="me-2" style={{ color: "#0046a8" }} />
                <div className="mt-2 text-muted">Đang tìm phòng tương tự...</div>
              </div>
            ) : similarRooms.length > 0 ? (
              <Row className="g-4">
                {similarRooms.slice(0, isMobile ? 2 : isTablet ? 4 : 6).map((similarRoom) => (
                  <Col key={similarRoom.id} xs={12} sm={6} md={4} lg={4}>
                    <Link to={`/detail-room/${similarRoom.id}`} className="text-decoration-none">
                      <Card
                        className="h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card"
                        style={{ transition: "all 0.3s ease" }}
                      >
                        <div className="position-relative">
                          <div style={{ height: "200px", backgroundColor: "#f8f9fa" }}>
                            {similarRoom.imageUrls && similarRoom.imageUrls[0] && (
                              <img
                                src={similarRoom.imageUrls[0] || "/placeholder.svg"}
                                alt={similarRoom.title}
                                className="w-100 h-100"
                                style={{ objectFit: "cover" }}
                              />
                            )}
                          </div>
                          <Badge
                            className="position-absolute top-0 start-0 m-2 rounded-pill px-2 py-1"
                            style={{ backgroundColor: "#28a745", fontSize: "0.7rem" }}
                          >
                            Tương tự
                          </Badge>
                        </div>
                        <Card.Body className="p-3">
                          <h6 className="fw-bold mb-2 text-truncate text-dark" title={similarRoom.title}>
                            {similarRoom.title}
                          </h6>
                          <div className="text-danger fw-bold mb-2" style={{ fontSize: "1rem" }}>
                            {similarRoom.price?.toLocaleString()} đ/tháng
                          </div>
                          <div className="d-flex align-items-center justify-content-between text-muted small">
                            <div className="d-flex align-items-center">
                              <FaRuler className="me-1" />
                              <span>{similarRoom.area} m²</span>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaMapMarkerAlt className="me-1" />
                              <span className="text-truncate" style={{ maxWidth: "100px" }}>
                                {similarRoom.address
                                  ? `${similarRoom.address.district || ""}, ${similarRoom.address.province || ""}`
                                  : "Đang cập nhật"}
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5">
                <div className="text-muted mb-3">
                  <FaHome style={{ fontSize: "3rem", opacity: 0.3 }} />
                </div>
                <h6 className="text-muted">Không có phòng tương tự</h6>
                <p className="text-muted small">Hệ thống đang tìm kiếm phòng phù hợp cho bạn</p>
              </div>
            )}
            {similarRooms.length > 0 && (
              <div className="text-center mt-4">
                <Link
                  to={`/category/${
                    room.roomType === "BOARDING_HOUSE"
                      ? "nha-tro-phong-tro"
                      : room.roomType === "WHOLE_HOUSE"
                      ? "nha-nguyen-can"
                      : "can-ho"
                  }`}
                  className="btn btn-outline-primary rounded-pill px-4 fw-medium"
                  style={{ borderColor: "#0046a8", color: "#0046a8" }}
                >
                  Xem thêm phòng trọ <FaAngleRight className="ms-1" />
                </Link>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <FaStar className="text-warning me-2" />
            Đánh giá phòng trọ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium mb-3">Điểm đánh giá của bạn</Form.Label>
              <div className="d-flex justify-content-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={32}
                    className="mx-1 cursor-pointer"
                    color={star <= rating ? "#ffc107" : "#e4e5e9"}
                    style={{ cursor: "pointer", transition: "color 0.2s" }}
                    onClick={() => setRating(star)}
                    onMouseEnter={(e: React.MouseEvent<SVGElement>) => {
                      e.currentTarget.style.transform = "scale(1.1)"
                    }}
                    onMouseLeave={(e: React.MouseEvent<SVGElement>) => {
                      e.currentTarget.style.transform = "scale(1)"
                    }}
                  />
                ))}
              </div>
              {rating > 0 && (
                <div className="text-center mt-2">
                  <Badge bg="warning" className="rounded-pill px-3 py-2">
                    {rating} / 5 sao
                  </Badge>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Chia sẻ trải nghiệm của bạn</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ những gì bạn thích về phòng trọ này..."
                className="border-2 rounded-4"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)} className="rounded-pill px-4">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmitReview}
            className="rounded-pill px-4 fw-medium"
            disabled={rating === 0 || !comment.trim()}
            style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
          >
            <FaStar className="me-2" />
            Gửi đánh giá
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="text-success mb-3">
            <FaCheck style={{ fontSize: "4rem" }} />
          </div>
          <h4 className="fw-bold text-success mb-3">Thành công!</h4>
          <p className="text-muted mb-4">Đánh giá của bạn đã được gửi thành công. Cảm ơn bạn đã chia sẻ!</p>
          <Button
            onClick={() => setShowSuccessModal(false)}
            className="rounded-pill px-4 fw-medium"
            style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
          >
            Đóng
          </Button>
        </Modal.Body>
      </Modal>
      <LoginModal show={showLoginModal} handleClose={handleLoginModalClose} />
      <style>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 70, 168, 0.15) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .sticky-top {
            position: relative !important;
            top: auto !important;
          }
        }
      `}</style>
    </div>
  )
}
