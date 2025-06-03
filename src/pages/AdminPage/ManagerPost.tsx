"use client"

import { useEffect, useState } from "react"
import { Card, Table, Button, Badge, Form, InputGroup, Row, Col, Container } from "react-bootstrap"
import { SidebarLayout } from "../MainPage/Sidebar"
import roomApi from "../../apis/room.api"
import { formatCurrency } from "../../utils/utils"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaSearch,
  FaSort,
  FaHome,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaList,
  FaTh,
} from "react-icons/fa"
import type { Room } from "../../types/room.type"
import { useAppSelector, useResponsive } from "../../store/hook"

export default function ManagerPost() {
  const navigate = useNavigate()
  const { profile } = useAppSelector((state) => state.user)
  const { isMobile } = useResponsive()
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"table" | "grid">(isMobile ? "grid" : "table")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
  })
  const maxRetries = 3

  // Primary color scheme
  const primaryColor = "#0046a8"
  const primaryGradient = "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)"

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

      // Calculate stats (excluding expired)
      const activeRooms = roomsData.filter((room) => room.forGender === "ALL").length
      const pendingRooms = roomsData.filter((room) => room.forGender === "MALE").length
      const rejectedRooms = roomsData.filter((room) => room.forGender === "FEMALE").length

      setStats({
        total: roomsData.length,
        active: activeRooms,
        pending: pendingRooms,
        rejected: rejectedRooms,
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

    // Filter by status (excluding expired)
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

  const getStatusConfig = (status: string) => {
    const statusMap = {
      ALL: {
        label: "Hoạt động",
        icon: FaCheckCircle,
        color: "#28a745",
        bgColor: "#d4edda",
      },
      MALE: {
        label: "Chờ duyệt",
        icon: FaClock,
        color: "#ffc107",
        bgColor: "#fff3cd",
      },
      FEMALE: {
        label: "Từ chối",
        icon: FaTimesCircle,
        color: "#dc3545",
        bgColor: "#f8d7da",
      },
    }

    return statusMap[status as keyof typeof statusMap] || statusMap["ALL"]
  }

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status)
    const IconComponent = config.icon

    // Use a soft gradient background and a subtle border for a more beautiful look
    const gradientMap: Record<string, string> = {
      "#28a745": "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)", // active
      "#ffc107": "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)", // pending
      "#dc3545": "linear-gradient(90deg, #f857a6 0%, #ff5858 100%)", // rejected
    }
    const bgGradient = gradientMap[config.color] || "linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)"

    return (
      <Badge
        style={{
          background: bgGradient,
          color: "#fff",
          border: "none",
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "5px 12px",
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          letterSpacing: "0.5px",
        }}
        className="d-flex align-items-center gap-1"
      >
        <IconComponent size={10} style={{ marginRight: 4 }} />
        {config.label}
      </Badge>
    )
  }

  const statsCards = [
    {
      title: "Tổng tin đăng",
      value: stats.total,
      color: primaryColor,
      icon: FaHome,
      gradient: primaryGradient,
    },
    {
      title: "Đang hoạt động",
      value: stats.active,
      color: "#10b981",
      icon: FaCheckCircle,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      title: "Đang chờ duyệt",
      value: stats.pending,
      color: "#f59e0b",
      icon: FaClock,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      title: "Bị từ chối",
      value: stats.rejected,
      color: "#ef4444",
      icon: FaTimesCircle,
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    },
  ]

  if (loading) {
    return (
      <SidebarLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Đang tải dữ liệu...</h5>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <Container fluid className="p-3">
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4 text-center">
              <h5 className="text-danger mb-3">Có lỗi xảy ra</h5>
              <p className="text-muted mb-3">{error}</p>
              <Button variant="danger" onClick={() => fetchRooms()} style={{ borderRadius: "8px" }}>
                <FaSyncAlt className="me-2" />
                Thử lại
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </SidebarLayout>
    )
  }

  const renderGridView = () => (
    <Row className="g-3">
      {filteredRooms.map((room) => (
        <Col key={room.id} xs={12} sm={6} lg={4}>
          <Card
            className="h-100 border-0 shadow-sm"
            style={{
              borderRadius: "16px",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onClick={() => handleView(room.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            <div className="position-relative" style={{ height: "160px", overflow: "hidden" }}>
              {room.images?.[0]?.imageUrl ? (
                <img
                  src={room.images[0].imageUrl || "/placeholder.svg"}
                  alt={room.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center h-100"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <FaHome className="text-muted" size={32} />
                </div>
              )}
              <div className="position-absolute top-0 end-0 m-2">{getStatusBadge(room.forGender || "ALL")}</div>
            </div>

            <Card.Body className="p-3">
              <h6
                className="fw-bold mb-2"
                style={{
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {room.title}
              </h6>

              <div className="d-flex align-items-center mb-2">
                <FaMapMarkerAlt size={10} className="text-muted me-1" />
                <small
                  className="text-muted"
                  style={{
                    fontSize: "0.75rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {room.district ? `${room.district}, ${room.province}` : "Không có địa chỉ"}
                </small>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-danger fw-bold" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(room.price)} đ
                </span>
                <small className="text-muted">{room.area} m²</small>
              </div>

              <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()} style={{ marginTop: "auto" }}>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="flex-fill"
                  onClick={() => handleView(room.id)}
                  style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                >
                  <FaEye size={10} className="me-1" />
                  Xem
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  className="flex-fill"
                  onClick={() => handleUpdate(room.id)}
                  style={{ borderRadius: "8px", fontSize: "0.75rem" }}
                >
                  <FaEdit size={10} className="me-1" />
                  Sửa
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(room.id)}
                  style={{ borderRadius: "8px", minWidth: "32px" }}
                >
                  <FaTrash size={10} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )

  const renderTableView = () => (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th className="border-0 py-3 fw-bold" style={{ width: "40%" }}>
              Tin đăng
            </th>
            <th className="border-0 py-3 fw-bold text-center" style={{ width: "15%" }}>
              Giá
            </th>
            <th className="border-0 py-3 fw-bold text-center" style={{ width: "15%" }}>
              Trạng thái
            </th>
            <th className="border-0 py-3 fw-bold text-center" style={{ width: "30%" }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRooms.map((room) => (
            <tr
              key={room.id}
              style={{
                borderBottom: "1px solid #f1f3f4",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => handleView(room.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
            >
              <td className="py-3">
                <div className="d-flex align-items-center">
                  <div
                    className="me-3 rounded-2 overflow-hidden flex-shrink-0"
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    {room.images?.[0]?.imageUrl ? (
                      <img
                        src={room.images[0].imageUrl || "/placeholder.svg"}
                        alt={room.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center h-100"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <FaHome className="text-secondary" size={16} />
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h6
                      className="fw-bold mb-1"
                      style={{
                        fontSize: "0.9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {room.title}
                    </h6>
                    <div className="d-flex align-items-center text-muted">
                      <FaMapMarkerAlt size={10} className="me-1" />
                      <small
                        style={{
                          fontSize: "0.75rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {room.district ? `${room.district}, ${room.province}` : "Không có địa chỉ"}
                      </small>
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 text-center">
                <div className="fw-bold text-danger" style={{ fontSize: "0.9rem" }}>
                  {formatCurrency(room.price)} đ
                </div>
                <small className="text-muted">{room.area} m²</small>
              </td>
              <td className="py-3 text-center">{getStatusBadge(room.forGender || "ALL")}</td>
              <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-center gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-circle"
                    title="Xem chi tiết"
                    onClick={() => handleView(room.id)}
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FaEye size={10} />
                  </Button>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="rounded-circle"
                    title="Chỉnh sửa"
                    onClick={() => handleUpdate(room.id)}
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FaEdit size={10} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-circle"
                    title="Xóa"
                    onClick={() => handleDelete(room.id)}
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FaTrash size={10} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )

  return (
    <SidebarLayout>
      <Container fluid className="px-3">
        <div className="d-flex flex-column gap-3">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2
                className="fw-bold mb-1 d-flex align-items-center"
                style={{
                  color: primaryColor,
                  fontSize: isMobile ? "1.3rem" : "1.8rem",
                }}
              >
                <FaChartLine className="me-2" />
                QUẢN LÝ TIN ĐĂNG
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                Quản lý và theo dõi các tin đăng của bạn
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row className="g-3">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Col key={index} xs={6} sm={3}>
                  <Card
                    className="text-white border-0 h-100"
                    style={{
                      background: stat.gradient,
                      borderRadius: "16px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  >
                    <Card.Body className="p-3 text-center">
                      <IconComponent size={isMobile ? 20 : 24} className="mb-2" />
                      <Card.Title className="mb-1" style={{ fontSize: isMobile ? "0.75rem" : "0.85rem" }}>
                        {stat.title}
                      </Card.Title>
                      <Card.Text className="fw-bold mb-0" style={{ fontSize: isMobile ? "1.5rem" : "1.8rem" }}>
                        {stat.value}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {/* Filters */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-3">
              <Row className="g-2 align-items-end">
                <Col xs={12} md={4}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ backgroundColor: "#f8f9fa" }}>
                      <FaSearch className="text-muted" size={12} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </InputGroup>
                </Col>

                <Col xs={6} md={2}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ backgroundColor: "#f8f9fa" }}>
                      <FaFilter className="text-muted" size={10} />
                    </InputGroup.Text>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <option value="all">Tất cả</option>
                      <option value="active">Hoạt động</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="rejected">Từ chối</option>
                    </Form.Select>
                  </InputGroup>
                </Col>

                <Col xs={6} md={2}>
                  <InputGroup size="sm">
                    <InputGroup.Text style={{ backgroundColor: "#f8f9fa" }}>
                      <FaSort className="text-muted" size={10} />
                    </InputGroup.Text>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="price-high">Giá cao</option>
                      <option value="price-low">Giá thấp</option>
                    </Form.Select>
                  </InputGroup>
                </Col>

                <Col xs={12} md={4}>
                  <div className="d-flex gap-2 justify-content-end">
                    <Button
                      variant={viewMode === "table" ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      style={{
                        backgroundColor: viewMode === "table" ? primaryColor : "transparent",
                        borderColor: primaryColor,
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaList size={12} className="me-1" />
                      Bảng
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      style={{
                        backgroundColor: viewMode === "grid" ? primaryColor : "transparent",
                        borderColor: primaryColor,
                        fontSize: "0.8rem",
                      }}
                    >
                      <FaTh size={12} className="me-1" />
                      Lưới
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => fetchRooms()}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <FaSyncAlt size={12} />
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results */}
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0" style={{ color: primaryColor, fontSize: "1.1rem" }}>
              DANH SÁCH ({filteredRooms.length})
            </h5>
          </div>

          {/* Listings */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            {filteredRooms.length === 0 ? (
              <Card.Body className="text-center py-5">
                <FaHome size={40} className="text-muted mb-3" />
                <h5 className="text-muted mb-2">Không có tin đăng nào</h5>
                <p className="text-muted mb-0">
                  {searchTerm || statusFilter !== "all" ? "Thử thay đổi bộ lọc" : "Hãy tạo tin đăng đầu tiên"}
                </p>
              </Card.Body>
            ) : (
              <Card.Body className="p-3">{viewMode === "grid" ? renderGridView() : renderTableView()}</Card.Body>
            )}
          </Card>
        </div>
      </Container>
    </SidebarLayout>
  )
}
