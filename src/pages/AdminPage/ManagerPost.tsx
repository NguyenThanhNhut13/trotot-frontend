"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form, InputGroup } from "react-bootstrap"
import Sidebar from "../MainPage/Sidebar"
import roomApi from "../../apis/room.api"
import { formatCurrency } from "../../utils/utils"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSort,
  FaHome,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa"
import type { Room } from "../../types/room.type"
import { useAppSelector, useResponsive } from "../../store/hook"

export default function ManagerPost() {
  const navigate = useNavigate()
  const { profile } = useAppSelector((state) => state.user)
  const { isMobile, isTablet } = useResponsive()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
  })
  const maxRetries = 3

  useEffect(() => {
    if (profile?.id) {
      fetchRooms()
    }
  }, [profile?.id])

  useEffect(() => {
    filterAndSortRooms()
  }, [rooms, searchTerm, statusFilter, sortBy])

  const fetchRooms = async (attempt = 1) => {
    if (!profile?.id) {
      setError("Bạn cần đăng nhập để xem danh sách phòng")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await roomApi.getRooms({ roomType: "BOARDING_HOUSE" })
      const roomsData = response.data.data.content as Room[]

      // Calculate real stats
      const activeRooms = roomsData.filter((room) => room.forGender === "ALL").length
      const pendingRooms = roomsData.filter((room) => room.forGender === "MALE").length
      const rejectedRooms = roomsData.filter((room) => room.forGender === "FEMALE").length

      setStats({
        total: roomsData.length,
        active: activeRooms,
        pending: pendingRooms,
        rejected: rejectedRooms
      })

      setRooms(roomsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching rooms:", error)

      if (attempt < maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000
        setTimeout(() => fetchRooms(attempt + 1), delay)
      } else {
        setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }
  }

  const filterAndSortRooms = () => {
    let filtered = [...rooms]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.province?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => {
        switch (statusFilter) {
          case "active":
            return room.forGender === "ALL"
          case "pending":
            return room.forGender === "MALE"
          case "rejected":
            return room.forGender === "FEMALE"
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        case "area-large":
          return b.area - a.area
        case "area-small":
          return a.area - b.area
        default:
          return 0
      }
    })

    setFilteredRooms(filtered)
  }

  const handleUpdate = (roomId: number) => {
    navigate(`/post-room/edit/${roomId}`)
  }

  const handleView = (roomId: number) => {
    navigate(`/phong-tro/${roomId}`)
  }

  const handleDelete = async (roomId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này không?")) {
      try {
        toast.success("Xóa tin đăng thành công")
        setRooms(rooms.filter((room) => room.id !== roomId))
        setStats((prev) => ({ ...prev, total: prev.total - 1 }))
      } catch (error) {
        toast.error("Xóa tin đăng thất bại")
      }
    }
  }

  const getRoomTypeLabel = (roomType: string) => {
    switch (roomType) {
      case "APARTMENT":
        return "Căn hộ"
      case "WHOLE_HOUSE":
        return "Nhà nguyên căn"
      case "BOARDING_HOUSE":
        return "Phòng trọ"
      default:
        return roomType
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ALL: { variant: "success", label: "Đang hoạt động", icon: FaCheckCircle },
      MALE: { variant: "warning", label: "Đang chờ duyệt", icon: FaClock },
      FEMALE: { variant: "danger", label: "Bị từ chối", icon: FaTimesCircle },
      OTHER: { variant: "secondary", label: "Hết hạn", icon: FaExclamationTriangle },
    }

    const config = statusMap[status as keyof typeof statusMap] || statusMap["ALL"]
    const IconComponent = config.icon

    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <IconComponent size={12} />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  const getResponsiveLayout = () => {
    if (isMobile) return { sidebarWidth: "100%", mainWidth: "100%", showSidebar: false }
    if (isTablet) return { sidebarWidth: "280px", mainWidth: "calc(100% - 280px)", showSidebar: true }
    return { sidebarWidth: "320px", mainWidth: "calc(100% - 320px)", showSidebar: true }
  }

  const layout = getResponsiveLayout()

  const statsCards = [
    { title: "Tổng tin đăng", value: stats.total, color: "primary", icon: FaHome },
    { title: "Đang hoạt động", value: stats.active, color: "success", icon: FaCheckCircle },
    { title: "Đang chờ duyệt", value: stats.pending, color: "warning", icon: FaClock },
    { title: "Bị từ chối", value: stats.rejected, color: "danger", icon: FaTimesCircle },
  ]

  if (loading) {
    return (
      <Container fluid className="p-0">
        <Row className="m-0" style={{ minHeight: "100vh" }}>
          {layout.showSidebar && (
            <Col style={{ width: layout.sidebarWidth, minWidth: layout.sidebarWidth }}>
              <Sidebar />
            </Col>
          )}
          <Col className="d-flex justify-content-center align-items-center" style={{ width: layout.mainWidth }}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  if (error) {
    return (
      <Container fluid className="p-0">
        <Row className="m-0" style={{ minHeight: "100vh" }}>
          {layout.showSidebar && (
            <Col style={{ width: layout.sidebarWidth, minWidth: layout.sidebarWidth }}>
              <Sidebar />
            </Col>
          )}
          <Col className="p-4" style={{ width: layout.mainWidth }}>
            <div className="alert alert-danger d-flex align-items-center">
              <FaExclamationTriangle className="me-3" size={24} />
              <div>
                <h6 className="mb-1">Có lỗi xảy ra</h6>
                <p className="mb-2">{error}</p>
                <Button variant="outline-danger" size="sm" onClick={() => fetchRooms()}>
                  Thử lại
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid className="p-0">
      <Row className="m-0" style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        {layout.showSidebar && (
          <Col className="p-0" style={{ width: layout.sidebarWidth, minWidth: layout.sidebarWidth }}>
            <Sidebar />
          </Col>
        )}

        {/* Main Content */}
        <Col className={`${isMobile ? "p-3" : "p-4"}`} style={{ width: layout.mainWidth }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary fw-bold mb-1">
                <FaChartLine className="me-2" />
                QUẢN LÝ TIN ĐĂNG
              </h2>
              <p className="text-muted mb-0">Quản lý và theo dõi các tin đăng của bạn</p>
            </div>
            <Button
              variant="primary"
              className="d-flex align-items-center"
              onClick={() => navigate("/post-room")}
              style={{
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                border: "none",
                borderRadius: "12px",
              }}
            >
              <FaPlus className="me-2" />
              {isMobile ? "Đăng tin" : "Đăng tin mới"}
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Col key={index} xs={6} md={4} lg={isMobile ? 6 : 2} className="mb-3">
                  <Card
                    className={`text-white bg-${stat.color} h-100 border-0 shadow-sm`}
                    style={{
                      borderRadius: "16px",
                      background: `linear-gradient(135deg, var(--bs-${stat.color}) 0%, var(--bs-${stat.color}) 100%)`,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)"
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
                    }}
                  >
                    <Card.Body className="p-3 text-center">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <IconComponent size={isMobile ? 20 : 24} />
                      </div>
                      <Card.Title className="mb-1" style={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                        {stat.title}
                      </Card.Title>
                      <Card.Text className="fw-bold mb-0" style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}>
                        {stat.value}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {/* Filters and Search */}
          <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col xs={12} md={6} lg={4}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm tin đăng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0"
                      style={{ borderRadius: "0 8px 8px 0" }}
                    />
                  </InputGroup>
                </Col>

                <Col xs={6} md={3} lg={2}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="expired">Hết hạn</option>
                  </Form.Select>
                </Col>

                <Col xs={6} md={3} lg={2}>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="price-high">Giá cao → thấp</option>
                    <option value="price-low">Giá thấp → cao</option>
                    <option value="area-large">Diện tích lớn → nhỏ</option>
                    <option value="area-small">Diện tích nhỏ → lớn</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results Info */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-primary">DANH SÁCH TIN ĐĂNG ({filteredRooms.length})</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fetchRooms()}
              className="d-flex align-items-center"
              style={{ borderRadius: "8px" }}
            >
              <FaSort className="me-2" />
              Làm mới
            </Button>
          </div>

          {/* Room Listings */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            {filteredRooms.length === 0 ? (
              <Card.Body className="text-center py-5">
                <FaHome size={48} className="text-muted mb-3" />
                <h5 className="text-muted mb-3">
                  {searchTerm || statusFilter !== "all"
                    ? "Không tìm thấy tin đăng phù hợp"
                    : "Bạn chưa có tin đăng nào"}
                </h5>
                <Button
                  variant="primary"
                  onClick={() => navigate("/post-room")}
                  className="d-flex align-items-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                    border: "none",
                    borderRadius: "12px",
                  }}
                >
                  <FaPlus className="me-2" />
                  Đăng tin mới
                </Button>
              </Card.Body>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th className="border-0 py-3 text-center" style={{ width: "60px" }}>
                        #
                      </th>
                      <th className="border-0 py-3">Tin đăng</th>
                      {!isMobile && <th className="border-0 py-3">Giá</th>}
                      {!isMobile && <th className="border-0 py-3">Diện tích</th>}
                      {!isMobile && <th className="border-0 py-3">Loại</th>}
                      {!isMobile && <th className="border-0 py-3">Địa điểm</th>}
                      <th className="border-0 py-3">Trạng thái</th>
                      <th className="border-0 py-3 text-center" style={{ width: "120px" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room, index) => (
                      <tr key={room.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                        <td className="py-3 text-center text-muted">{index + 1}</td>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="me-3 rounded-3 bg-light d-flex align-items-center justify-content-center"
                              style={{
                                width: isMobile ? 40 : 50,
                                height: isMobile ? 40 : 50,
                                backgroundImage: room.images?.[0]?.imageUrl
                                  ? `url(${room.images[0].imageUrl})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                flexShrink: 0,
                              }}
                            >
                              {!room.images?.[0]?.imageUrl && <FaHome className="text-secondary" size={20} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                className="fw-medium mb-1"
                                style={{
                                  fontSize: isMobile ? "0.9rem" : "1rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: isMobile ? "150px" : "200px",
                                }}
                              >
                                {room.title}
                              </div>
                              {isMobile && (
                                <div className="small text-muted">
                                  <div className="text-danger fw-bold">{formatCurrency(room.price)} đ</div>
                                  <div>
                                    {room.area} m² • {getRoomTypeLabel(room.roomType)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {!isMobile && (
                          <>
                            <td className="py-3">
                              <span className="text-danger fw-bold">{formatCurrency(room.price)} đ</span>
                            </td>
                            <td className="py-3">{room.area} m²</td>
                            <td className="py-3">
                              <Badge bg="light" text="dark" className="border">
                                {getRoomTypeLabel(room.roomType)}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div
                                style={{
                                  maxWidth: "150px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {room.district ? `${room.district}, ${room.province}` : "Không có địa chỉ"}
                              </div>
                            </td>
                          </>
                        )}
                        <td className="py-3">{getStatusBadge(room.forGender || "ALL")}</td>
                        <td className="py-3 text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="rounded-circle p-2"
                              title="Xem chi tiết"
                              onClick={() => handleView(room.id)}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-circle p-2"
                              title="Chỉnh sửa"
                              onClick={() => handleUpdate(room.id)}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-circle p-2"
                              title="Xóa"
                              onClick={() => handleDelete(room.id)}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
