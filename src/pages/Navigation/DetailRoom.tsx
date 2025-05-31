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
  const [loading, setLoading] = useState<boolean>(true)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhone, setShowPhone] = useState<boolean>(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [latitude, setLatitude] = useState(0)
  const [address, setAddress] = useState<string | "">("")
  const [similarRoomsError, setSimilarRoomsError] = useState<string | null>(null)
  const maxRetries = 3

  // State cho modal đánh giá
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [images, setImages] = useState<File[]>([])

  // State cho modal thông báo thành công
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)

  // State để lưu userId
  const [userId, setUserId] = useState<number | null>(null)

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [similarRoomsLoading, setSimilarRoomsLoading] = useState<boolean>(true)

  // Fetch room details by ID with retry
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        // Make sure id is a number
        if (!id) return
        const roomId = Number.parseInt(id)

        // Use retry mechanism for room details API call
        const roomResponse = await retryApiCall(
          () => roomApi.getRoomById(roomId),
          3, // max retries
          1000, // initial delay in ms
        )

        // Extract the actual room data from the response
        const roomData = roomResponse.data.data
        setRoom(roomData)

        // Handle address geocoding
        if (roomData.address) {
          // Create a proper address string for geocoding
          const addressString =
            typeof roomData.address === "object"
              ? `${roomData.address.street || ""}, ${roomData.address.ward || ""}, ${roomData.address.district || ""}, ${roomData.address.province || ""}`
              : roomData.address

          try {
            // Try backend API first
            const geoResponse = await addressAPI.getMapForward(addressString)
            const geoData = geoResponse.data.data

            // Process the response
            if (geoData) {
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
            }
          } catch (error) {
            console.log("Backend geocoding failed, trying fallback...")

            try {
              // Use fallback geocoding service
              const fallbackResult = await fallbackGeocode(addressString)

              if (fallbackResult) {
                setLatitude(fallbackResult.lat)
                setLongitude(fallbackResult.lon)
                setAddress(addressString)
                console.log("Using fallback geocoding result")
              } else {
                // If all geocoding fails, use default coordinates
                const cityName = roomData.address.province || "Đà Nẵng"
                const defaultCoords = getDefaultCoordinates(cityName)
                setLatitude(defaultCoords.lat)
                setLongitude(defaultCoords.lon)
                console.log("Using default city coordinates")
              }
            } catch (fallbackError) {
              console.error("All geocoding methods failed:", fallbackError)
              // Set default coordinates
              setLatitude(16.0544)
              setLongitude(108.2022)
            }
          }
        } else {
          // No address available
          console.log("No address data available, using default coordinates")
          setLatitude(16.0544)
          setLongitude(108.2022)
          setAddress("Địa chỉ không xác định")
        }
      } catch (error) {
        console.error("Error fetching room details:", error)
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
        console.log("Attempt 1: Loading similar rooms data...")
        const roomId = room.id

        const similarRoomsData = await retryApiCall(() => roomApi.aiGetSimilarRoom(roomId), 3, 1000)

        if (similarRoomsData?.data?.data) {
          setSimilarRooms(similarRoomsData.data.data)
          console.log("Successfully loaded similar rooms")
        }
      } catch (error) {
        console.error("Error fetching similar rooms:", error)
        setSimilarRoomsError("Không thể tải danh sách phòng tương tự. Vui lòng thử lại sau.")
      } finally {
        setSimilarRoomsLoading(false)
      }
    }

    fetchSimilarRooms()
  }, [room])

  // Fetch user profile to get userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        console.log("No access token found, user not logged in.")
        return
      }

      try {
        const response = await userApi.getProfile()
        if (response.data.success) {
          setUserId(response.data.data.id)
        } else {
          throw new Error(response.data.message || "Lỗi khi lấy thông tin người dùng")
        }
      } catch (error: any) {
        console.error("Error fetching user profile:", error)
        toast.error("Không thể lấy thông tin người dùng. Vui lòng thử lại.")
      }
    }

    fetchUserProfile()
  }, [])

  const [similarRooms, setSimilarRooms] = useState<any[]>([])
  const getSimilarRoom = async (attempt = 1) => {
    try {
      console.log(`Attempt ${attempt}: Loading similar rooms data...`)
      const response = await roomApi.aiGetSimilarRoom(room!.id)
      setSimilarRooms(response.data.data)
      setSimilarRoomsError(null)
      console.log("Successfully loaded similar rooms")
    } catch (error) {
      console.error("Error fetching similar rooms:", error)
      if (attempt <= maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000
        setTimeout(() => getSimilarRoom(attempt + 1), delay)
      } else {
        setSimilarRoomsError("Không thể tải danh sách phòng tương tự. Vui lòng thử lại sau.")
      }
    }
  }

  useEffect(() => {
    if (!room) return
    getSimilarRoom()
  }, [room])

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!room) return

      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) return

      try {
        const response = await roomApi.getSavedRoomIds()
        console.log("Saved rooms response:", response.data)

        if (response.data?.data?.roomIds) {
          const isSaved = response.data.data.roomIds.includes(room.id)
          console.log(`Room ${room.id} saved status:`, isSaved)
          setIsFavorite(isSaved)
        }
      } catch (error) {
        console.error("Error checking favorite status:", error)
      }
    }

    checkFavoriteStatus()
  }, [room])

  const handleToggleFavorite = async () => {
    if (!room) return

    const isLoggedIn = localStorage.getItem("accessToken")
    if (!isLoggedIn) {
      localStorage.setItem("pendingAction", "save-room")
      localStorage.setItem("pendingRoomId", room.id.toString())

      // Show login modal
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
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.")
    }
  }

  const handleLoginModalClose = () => {
    setShowLoginModal(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: room?.title,
          text: `Xem phòng trọ: ${room?.title}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Đã sao chép liên kết vào clipboard"))
        .catch(() => toast.error("Không thể sao chép liên kết"))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(files)
    }
  }

  const handleSubmitReview = async () => {
    if (!room) return

    // Kiểm tra đăng nhập
    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để gửi đánh giá")
      setShowReviewModal(false)
      return
    }

    // Kiểm tra userId
    if (!userId) {
      toast.error("Không thể xác định thông tin người dùng. Vui lòng thử lại.")
      setShowReviewModal(false)
      return
    }

    // Kiểm tra dữ liệu nhập
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
        // Đóng modal đánh giá và mở modal thông báo thành công
        setShowReviewModal(false)
        setShowSuccessModal(true)
        // Reset các trường
        setRating(0)
        setComment("")
        setImages([])
      } else {
        throw new Error(response.data.message || "Lỗi khi gửi đánh giá")
      }
    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.")
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
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted">Đang tải thông tin phòng...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="alert alert-danger shadow-sm border-0 rounded-3">
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
          <div className="alert alert-warning shadow-sm border-0 rounded-3">
            <i className="fas fa-search fa-2x text-warning mb-3"></i>
            <h5>Không tìm thấy</h5>
            <p className="mb-0">Không tìm thấy phòng trọ này.</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <div className="bg-light min-vh-100">
      <Container>
        {/* Back Button - Mobile Friendly */}
        <div className="d-block d-md-none mb-3 mt-2">
          <Button
            variant="outline-primary"
            onClick={handleGoBack}
            className="d-flex align-items-center border-0 bg-white shadow-sm rounded-pill px-3 py-2"
            style={{ zIndex: 1000 }}
          >
            <FaArrowLeft className="me-2" />
            <span className="fw-medium">Quay lại</span>
          </Button>
        </div>


        <Row className="g-4">
          {/* Main Content */}
          <Col lg={8}>
            {/* Breadcrumb - Hidden on mobile */}
            <nav aria-label="breadcrumb" className="mb-4 d-none d-md-block">
              <ol className="breadcrumb bg-white rounded-3 shadow-sm px-3 py-2 mb-0">
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    className="text-decoration-none text-primary fw-medium"
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
            <Card className="border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h1 className="h4 fw-bold text-dark mb-2 lh-base">{room.title}</h1>
                    <div className="d-flex align-items-center text-muted">
                      <FaMapMarkerAlt className="text-primary me-2 flex-shrink-0" />
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
                  <Badge bg="primary" className="rounded-pill px-3 py-2 fs-6">
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
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="text-primary h5 mb-1">Giá thuê</div>
                      <div className="h6 text-danger fw-bold mb-0">{room.price.toLocaleString()} đ/tháng</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="text-primary h5 mb-1">Diện tích</div>
                      <div className="h6 fw-bold mb-0">
                        <FaRuler className="me-1" />
                        {room.area} m²
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="text-primary h5 mb-1">Đặt cọc</div>
                      <div className="h6 fw-bold mb-0">{room.deposit.toLocaleString()} đ</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="text-center p-3 bg-light rounded-3">
                      <div className="text-primary h5 mb-1">Đối tượng</div>
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
            <Card className="border-0 shadow-sm mb-4 rounded-3 overflow-hidden">
              <div className="position-relative">
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
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
                        className={`flex-shrink-0 rounded-2 overflow-hidden cursor-pointer ${
                          activeIndex === index ? "border border-primary border-2" : "border"
                        }`}
                        style={{
                          cursor: "pointer",
                          width: "60px",
                          height: "45px",
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
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Body className="p-3">
                <Row className="g-2">
                  <Col xs={12} sm={4}>
                    <Button
                      variant="success"
                      className="w-100 rounded-pill fw-medium"
                      onClick={() => setShowReviewModal(true)}
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
                    >
                      {isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                      {isFavorite ? "Đã lưu" : "Lưu tin"}
                    </Button>
                  </Col>
                  <Col xs={6} sm={4}>
                    <Button variant="outline-primary" className="w-100 rounded-pill fw-medium" onClick={handleShare}>
                      <FaShareAlt className="me-2" />
                      Chia sẻ
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Room Description */}
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaEye className="text-primary me-2" />
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
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaHome className="text-primary me-2" />
                  Đặc điểm phòng trọ
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-3">
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaHome className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Số phòng</div>
                        <div className="fw-bold">{room.totalRooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaUsers className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Số người tối đa</div>
                        <div className="fw-bold">{room.maxPeople} người</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaBed className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng ngủ</div>
                        <div className="fw-bold">{room.numberOfBedrooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaBath className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng tắm</div>
                        <div className="fw-bold">{room.numberOfBathrooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaUtensils className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Nhà bếp</div>
                        <div className="fw-bold">{room.numberOfKitchens} phòng</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <FaCouch className="text-primary me-3 fs-5" />
                      <div>
                        <div className="small text-muted">Phòng khách</div>
                        <div className="fw-bold">{room.numberOfLivingRooms} phòng</div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="mt-4 p-3 bg-light rounded-3">
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
                        <FaRegCalendarAlt className="text-primary me-2" />
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
            <Card className="border-0 shadow-sm mb-4 rounded-3">
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
                      <div className="d-flex align-items-center p-2 rounded-2 bg-light">
                        <FaCheck className="text-success me-2 flex-shrink-0" />
                        <span className="small fw-medium">{amenity.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Target Audience */}
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaUsers className="text-primary me-2" />
                  Đối tượng thuê phù hợp
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-2">
                  {room.targetAudiences.map((audience, index) => (
                    <Col xs={6} md={4} key={index}>
                      <div className="d-flex align-items-center p-2 rounded-2 bg-light">
                        <FaUsers className="text-primary me-2 flex-shrink-0" />
                        <span className="small fw-medium">{audience.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Surrounding Environment */}
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h4 className="fw-bold text-dark mb-0">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  Khu vực xung quanh
                </h4>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-2">
                  {room.surroundingAreas.map((area, index) => (
                    <Col xs={6} md={4} key={index}>
                      <div className="d-flex align-items-center p-2 rounded-2 bg-light">
                        <FaMapMarkerAlt className="text-primary me-2 flex-shrink-0" />
                        <span className="small fw-medium">{area.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Location Map */}
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 pb-0 p-3">
                <h4 className="fw-bold text-dark mb-0">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  Vị trí trên bản đồ
                </h4>
              </Card.Header>
              <Card.Body className="p-3">
                <div
                  className="map-container rounded-bottom-3 overflow-hidden"
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
            {/* Contact Card */}
            <Card className="border-0 shadow-sm mb-4 rounded-3 sticky-top" style={{ top: "20px" }}>
              <Card.Header className="bg-primary text-white border-0 p-4 rounded-top-3">
                <h5 className="mb-0 fw-bold">Thông tin liên hệ</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="avatar me-3 bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <FaUserAlt className="text-primary fs-4" />
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
                    variant="primary"
                    size="lg"
                    className="rounded-pill fw-medium"
                    onClick={() => setShowPhone(!showPhone)}
                  >
                    <FaPhone className="me-2" />
                    {showPhone ? room.posterPhone : "Hiện số điện thoại"}
                  </Button>

                  <Button
                    variant={isFavorite ? "danger" : "outline-danger"}
                    size="lg"
                    className="rounded-pill fw-medium"
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? <FaHeart className="me-2" /> : <FaRegHeart className="me-2" />}
                    {isFavorite ? "Đã lưu tin" : "Lưu tin này"}
                  </Button>

                  <Button variant="outline-primary" size="lg" className="rounded-pill fw-medium" onClick={handleShare}>
                    <FaShareAlt className="me-2" />
                    Chia sẻ tin này
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Similar Rooms */}
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Header className="bg-success text-white border-0 p-4 rounded-top-3">
                <h5 className="mb-0 fw-bold">Phòng trọ tương tự</h5>
              </Card.Header>
              {similarRoomsError ? (
                <Card.Body className="p-4">
                  <div className="alert alert-danger border-0 rounded-3 mb-3">
                    <div className="small">{similarRoomsError}</div>
                  </div>
                  <Button variant="primary" size="sm" className="rounded-pill" onClick={() => getSimilarRoom()}>
                    Thử lại
                  </Button>
                </Card.Body>
              ) : (
                <div className="list-group list-group-flush">
                  {similarRoomsLoading ? (
                    <div className="p-4 text-center">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span className="small text-muted">Đang tải...</span>
                    </div>
                  ) : similarRooms.length > 0 ? (
                    similarRooms.slice(0, 5).map((similarRoom) => (
                      <div key={similarRoom.id} className="list-group-item border-0 p-3">
                        <Link to={`/detail-room/${similarRoom.id}`} className="text-decoration-none text-dark">
                          <Row className="g-3 align-items-center">
                            <Col xs={4}>
                              <div className="rounded-3 overflow-hidden bg-light" style={{ height: "70px" }}>
                                {similarRoom.imageUrls && similarRoom.imageUrls[0] && (
                                  <img
                                    src={similarRoom.imageUrls[0] || "/placeholder.svg"}
                                    alt={similarRoom.title}
                                    className="w-100 h-100"
                                    style={{ objectFit: "cover" }}
                                  />
                                )}
                              </div>
                            </Col>
                            <Col xs={8}>
                              <div className="fw-bold mb-1 text-truncate" style={{ fontSize: "0.9rem" }}>
                                {similarRoom.title}
                              </div>
                              <div className="text-danger fw-bold mb-1" style={{ fontSize: "0.85rem" }}>
                                {similarRoom.price?.toLocaleString()} đ/tháng
                              </div>
                              <div className="d-flex align-items-center text-muted" style={{ fontSize: "0.8rem" }}>
                                <FaRuler className="me-1" />
                                <span className="me-2">{similarRoom.area} m²</span>
                                <FaMapMarkerAlt className="me-1" />
                                <span className="text-truncate">
                                  {similarRoom.address
                                    ? `${similarRoom.address.district || ""}, ${similarRoom.address.province || ""}`
                                    : "Đang cập nhật"}
                                </span>
                              </div>
                            </Col>
                          </Row>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted">
                      <div className="small">Không có phòng tương tự</div>
                    </div>
                  )}
                </div>
              )}
              <Card.Footer className="bg-white border-0 text-center p-3 rounded-bottom-3">
                <Link
                  to={`/${
                    room.roomType === "BOARDING_HOUSE"
                      ? "phong-tro"
                      : room.roomType === "WHOLE_HOUSE"
                        ? "nha-nguyen-can"
                        : "can-ho"
                  }`}
                  className="text-decoration-none fw-medium"
                >
                  Xem thêm phòng trọ <FaAngleRight className="ms-1" />
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
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
                      const target = e.currentTarget;
                      target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<SVGElement>) => {
                      const target = e.currentTarget;
                      target.style.transform = "scale(1)";
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
                className="border-2 rounded-3"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)} className="rounded-pill px-4">
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReview}
            className="rounded-pill px-4 fw-medium"
            disabled={rating === 0 || !comment.trim()}
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
          <Button variant="primary" onClick={() => setShowSuccessModal(false)} className="rounded-pill px-4 fw-medium">
            Đóng
          </Button>
        </Modal.Body>
      </Modal>

      <LoginModal show={showLoginModal} handleClose={handleLoginModalClose} />
    </div>
  )
}
