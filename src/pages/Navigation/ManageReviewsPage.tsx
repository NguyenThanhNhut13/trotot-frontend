"use client"

import { useEffect, useState } from "react"
import { Row, Col, Card, Table, Spinner, Alert, Button, Modal, Form, Badge, Tabs, Tab } from "react-bootstrap"
import { SidebarLayout } from "../MainPage/Sidebar"
import reportAPI, { REPORT_TYPES, REPORT_STATUSES } from "../../apis/report.api"
import reviewAPI from "../../apis/review.api"
import { toast } from "react-toastify"
import { Bar, Doughnut } from "react-chartjs-2"
import { useAppSelector } from "../../store/hook"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import {
  FaStar,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaCheckCircle,
  FaComments,
  FaFilter,
  FaTrash,
  FaFlag,
  FaChartBar,
} from "react-icons/fa"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

interface Review {
  id: number
  roomId: number
  userId: number
  rating: number
  comment: string
  createdAt: string
}

interface ReportDTO {
  id: number
  roomId: number
  userId: number
  type: string
  description: string
  status: "PENDING" | "PROCESSING" | "RESOLVED"
  createAt: string
  updateAt: string
}

const ManageReviewsPage = () => {
  const { profile } = useAppSelector((state) => state.user)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reports, setReports] = useState<ReportDTO[]>([])
  const [filteredReports, setFilteredReports] = useState<ReportDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState<boolean>(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reportType, setReportType] = useState<string>(REPORT_TYPES.INAPPROPRIATE)
  const [reportDescription, setReportDescription] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [totalPendingReports, setTotalPendingReports] = useState<number>(0)
  const [totalProcessingReports, setTotalProcessingReports] = useState<number>(0)
  const [totalResolvedReports, setTotalResolvedReports] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Lấy danh sách đánh giá từ API
        const reviewsResponse = await fetchReviews()
        setReviews(reviewsResponse)

        // Lấy danh sách báo cáo
        const reportsResponse = await reportAPI.getAllReports()
        const userReports = reportsResponse.data.data.filter((report) => report.userId === profile?.id)
        setReports(userReports)
        setFilteredReports(userReports)

        // Tính toán thống kê
        const pending = userReports.filter((r) => r.status === REPORT_STATUSES.PENDING).length
        const processing = userReports.filter((r) => r.status === REPORT_STATUSES.PROCESSING).length
        const resolved = userReports.filter((r) => r.status === REPORT_STATUSES.RESOLVED).length
        setTotalPendingReports(pending)
        setTotalProcessingReports(processing)
        setTotalResolvedReports(resolved)
      } catch (err: any) {
        setError("Lỗi khi tải dữ liệu: " + (err.message || "Đã xảy ra lỗi"))
        toast.error("Lỗi khi tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    if (profile?.id) {
      fetchData()
    } else {
      setError("Không tìm thấy thông tin người dùng")
      setLoading(false)
    }
  }, [profile])

  // Lấy danh sách đánh giá từ API
  const fetchReviews = async (): Promise<Review[]> => {
    try {
      const response = await reviewAPI.getReviewsByUseId({ userId: profile?.id })
      if (!response.data.success) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách đánh giá")
      }
      // Ánh xạ dữ liệu từ ReviewDTO sang Review
      return response.data.data.map((dto: any) => ({
        id: dto.id,
        roomId: dto.roomId,
        userId: dto.user.id,
        rating: dto.rating,
        comment: dto.comment,
        createdAt: dto.createAt, // Nếu backend trả về createdAt, đổi thành dto.createdAt
      }))
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi lấy danh sách đánh giá")
    }
  }

  const handleReportReview = (review: Review) => {
    setSelectedReview(review)
    setShowReportModal(true)
  }

  const handleSubmitReport = async () => {
    if (!selectedReview || !reportDescription) {
      toast.error("Vui lòng nhập mô tả báo cáo")
      return
    }

    try {
      const reportData = {
        roomId: selectedReview.roomId,
        userId: profile?.id || 0,
        type: reportType,
        description: reportDescription,
      }
      const response = await reportAPI.submitReport(reportData)
      const newReport = response.data.data
      setReports([...reports, newReport])
      setFilteredReports([...filteredReports, newReport])
      setTotalPendingReports(totalPendingReports + 1)
      toast.success("Báo cáo đã được gửi thành công")
      setShowReportModal(false)
      setReportDescription("")
      setReportType(REPORT_TYPES.INAPPROPRIATE)
    } catch (err) {
      toast.error("Lỗi khi gửi báo cáo")
    }
  }

  const handleDeleteReport = async (reportId: number) => {
    try {
      await reportAPI.deleteReport(reportId)
      const updatedReports = reports.filter((r) => r.id !== reportId)
      setReports(updatedReports)
      setFilteredReports(updatedReports.filter((r) => filterStatus === "ALL" || r.status === filterStatus))
      setTotalPendingReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.PENDING).length)
      setTotalProcessingReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.PROCESSING).length)
      setTotalResolvedReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.RESOLVED).length)
      toast.success("Xóa báo cáo thành công")
    } catch (err) {
      toast.error("Lỗi khi xóa báo cáo")
    }
  }

  const handleFilterChange = (status: string) => {
    setFilterStatus(status)
    if (status === "ALL") {
      setFilteredReports(reports)
    } else {
      setFilteredReports(reports.filter((r) => r.status === status))
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === "") {
      return "Chưa có dữ liệu"
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ"
    }
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Chart data and options
  const reportChartData = {
    labels: ["Đang chờ xử lý", "Đang xử lý", "Đã giải quyết"],
    datasets: [
      {
        label: "Số lượng báo cáo",
        data: [totalPendingReports, totalProcessingReports, totalResolvedReports],
        backgroundColor: ["#ff6384", "#ffcd56", "#36a2eb"],
        borderColor: ["#ff1a53", "#ffab00", "#2a80b9"],
        borderWidth: 1,
      },
    ],
  }

  const reportChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Thống kê trạng thái báo cáo",
        font: {
          size: isMobile ? 14 : 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
  }

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0] // For ratings 1-5
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++
    }
  })

  const ratingChartData = {
    labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
    datasets: [
      {
        label: "Số lượng đánh giá",
        data: ratingCounts,
        backgroundColor: ["#ff6384", "#ff9f40", "#ffcd56", "#4bc0c0", "#36a2eb"],
        borderColor: ["#ff1a53", "#ff8c19", "#ffbd24", "#2ca8a8", "#2a80b9"],
        borderWidth: 1,
      },
    ],
  }

  const ratingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      title: {
        display: true,
        text: "Phân bố đánh giá theo số sao",
        font: {
          size: isMobile ? 14 : 16,
        },
      },
    },
  }

  // Render review card for mobile view
  const renderReviewCard = (review: Review) => (
    <Card className="mb-3 shadow-sm border-0 rounded-4 overflow-hidden">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2 rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>
              ID: {review.id}
            </Badge>
            <div className="d-flex align-items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} size={14} color={i < review.rating ? "#ffc107" : "#e4e5e9"} className="me-1" />
              ))}
            </div>
          </div>
          <small className="text-muted" style={{ fontSize: "0.7rem" }}>
            {formatDate(review.createdAt)}
          </small>
        </div>

        <p className="mb-2 text-truncate" style={{ fontSize: "0.85rem" }}>
          <strong>Phòng ID:</strong> {review.roomId}
        </p>

        <p className="mb-3" style={{ fontSize: "0.85rem" }}>
          {review.comment.length > 100 ? `${review.comment.substring(0, 100)}...` : review.comment}
        </p>

        <div className="d-flex justify-content-end">
          <Button
            variant="outline-danger"
            size="sm"
            className="d-flex align-items-center"
            onClick={() => handleReportReview(review)}
            style={{ fontSize: "0.75rem" }}
          >
            <FaFlag className="me-1" size={12} />
            Báo cáo
          </Button>
        </div>
      </Card.Body>
    </Card>
  )

  // Render report card for mobile view
  const renderReportCard = (report: ReportDTO) => {
    let statusBadge

    if (report.status === REPORT_STATUSES.PENDING) {
      statusBadge = (
        <Badge bg="warning" className="rounded-pill px-2 py-1">
          Đang chờ xử lý
        </Badge>
      )
    } else if (report.status === REPORT_STATUSES.PROCESSING) {
      statusBadge = (
        <Badge bg="info" className="rounded-pill px-2 py-1">
          Đang xử lý
        </Badge>
      )
    } else {
      statusBadge = (
        <Badge bg="success" className="rounded-pill px-2 py-1">
          Đã giải quyết
        </Badge>
      )
    }

    return (
      <Card className="mb-3 shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Badge bg="primary" className="rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>
              ID: {report.id}
            </Badge>
            <small className="text-muted" style={{ fontSize: "0.7rem" }}>
              {formatDate(report.createAt)}
            </small>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="mb-0" style={{ fontSize: "0.85rem" }}>
              <strong>Phòng ID:</strong> {report.roomId}
            </p>
            {statusBadge}
          </div>

          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
            <strong>Loại:</strong> {report.type}
          </p>

          <p className="mb-3" style={{ fontSize: "0.85rem" }}>
            {report.description.length > 100 ? `${report.description.substring(0, 100)}...` : report.description}
          </p>

          <div className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              size="sm"
              className="d-flex align-items-center"
              onClick={() => handleDeleteReport(report.id)}
              style={{ fontSize: "0.75rem" }}
            >
              <FaTrash className="me-1" size={12} />
              Xóa
            </Button>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <SidebarLayout>
      <div className="mb-4">
        <h2
          className="text-primary fw-bold mb-2"
          style={{
            fontSize: isMobile ? "1.5rem" : "1.75rem",
            background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          QUẢN LÝ ĐÁNH GIÁ
        </h2>
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          Quản lý đánh giá và báo cáo của bạn
        </p>
      </div>

      {/* Mobile/Tablet Tabs Navigation */}
      {isMobile && (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "overview")} className="mb-4">
          <Tab
            eventKey="overview"
            title={
              <div className="d-flex align-items-center">
                <FaChartBar className="me-1" size={14} />
                <span style={{ fontSize: "0.85rem" }}>Tổng quan</span>
              </div>
            }
          />
          <Tab
            eventKey="reviews"
            title={
              <div className="d-flex align-items-center">
                <FaComments className="me-1" size={14} />
                <span style={{ fontSize: "0.85rem" }}>Đánh giá</span>
              </div>
            }
          />
          <Tab
            eventKey="reports"
            title={
              <div className="d-flex align-items-center">
                <FaFlag className="me-1" size={14} />
                <span style={{ fontSize: "0.85rem" }}>Báo cáo</span>
              </div>
            }
          />
        </Tabs>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="danger" className="rounded-4 shadow-sm">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" size={18} />
            <div>
              <p className="mb-0 fw-medium">{error}</p>
              <p className="mb-0 small">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Content when data is loaded */}
      {!loading && !error && (
        <>
          {/* Overview Section - Always visible on desktop, conditionally on mobile */}
          {(!isMobile || activeTab === "overview") && (
            <>
              <h5
                className="fw-bold mb-3"
                style={{
                  fontSize: isMobile ? "1rem" : "1.1rem",
                  color: "#0046a8",
                }}
              >
                <FaChartBar className="me-2" />
                THỐNG KÊ
              </h5>

              {/* Statistics Cards */}
              <Row className="g-3 mb-4">
                <Col xs={6} sm={6} md={3}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: isMobile ? "40px" : "48px",
                            height: isMobile ? "40px" : "48px",
                            background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                          }}
                        >
                          <FaComments color="white" size={isMobile ? 16 : 20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            Tổng đánh giá
                          </h6>
                          <h3 className="mb-0 fw-bold" style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
                            {reviews.length}
                          </h3>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={6} sm={6} md={3}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: isMobile ? "40px" : "48px",
                            height: isMobile ? "40px" : "48px",
                            background: "linear-gradient(135deg, #ff6384 0%, #ff1a53 100%)",
                          }}
                        >
                          <FaExclamationTriangle color="white" size={isMobile ? 16 : 20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            Đang chờ xử lý
                          </h6>
                          <h3 className="mb-0 fw-bold" style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
                            {totalPendingReports}
                          </h3>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={6} sm={6} md={3}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: isMobile ? "40px" : "48px",
                            height: isMobile ? "40px" : "48px",
                            background: "linear-gradient(135deg, #ffcd56 0%, #ffab00 100%)",
                          }}
                        >
                          <FaHourglassHalf color="white" size={isMobile ? 16 : 20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            Đang xử lý
                          </h6>
                          <h3 className="mb-0 fw-bold" style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
                            {totalProcessingReports}
                          </h3>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={6} sm={6} md={3}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: isMobile ? "40px" : "48px",
                            height: isMobile ? "40px" : "48px",
                            background: "linear-gradient(135deg, #36a2eb 0%, #2a80b9 100%)",
                          }}
                        >
                          <FaCheckCircle color="white" size={isMobile ? 16 : 20} />
                        </div>
                        <div>
                          <h6 className="text-muted mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                            Đã giải quyết
                          </h6>
                          <h3 className="mb-0 fw-bold" style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
                            {totalResolvedReports}
                          </h3>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Charts */}
              {reports.length > 0 && (
                <Row className="g-4 mb-4">
                  <Col xs={12} lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                      <Card.Body className="p-3 p-md-4">
                        <div style={{ height: isMobile ? "200px" : "300px" }}>
                          <Bar data={reportChartData} options={reportChartOptions} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                      <Card.Body className="p-3 p-md-4">
                        <div style={{ height: isMobile ? "200px" : "300px" }}>
                          <Doughnut data={ratingChartData} options={ratingChartOptions} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          )}

          {/* Reviews Section */}
          {(!isMobile || activeTab === "reviews") && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5
                  className="fw-bold mb-0"
                  style={{
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    color: "#0046a8",
                  }}
                >
                  <FaComments className="me-2" />
                  DANH SÁCH ĐÁNH GIÁ
                </h5>
                <Badge bg="primary" pill className="px-3 py-2">
                  {reviews.length} đánh giá
                </Badge>
              </div>

              {reviews.length === 0 ? (
                <Alert variant="info" className="rounded-4 shadow-sm">
                  <div className="text-center py-4">
                    <FaComments size={32} className="text-info mb-3" />
                    <h6>Không có đánh giá nào</h6>
                    <p className="text-muted mb-0">Bạn chưa có đánh giá nào.</p>
                  </div>
                </Alert>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  {isMobile && <div className="mb-4">{reviews.map((review) => renderReviewCard(review))}</div>}

                  {/* Desktop View - Table */}
                  {!isMobile && (
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th className="py-3">ID</th>
                                <th className="py-3">Phòng</th>
                                <th className="py-3">Đánh giá</th>
                                <th className="py-3">Bình luận</th>
                                <th className="py-3">Thời gian</th>
                                <th className="py-3 text-end">Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviews.map((review) => (
                                <tr key={review.id}>
                                  <td className="py-3">{review.id}</td>
                                  <td className="py-3">{review.roomId}</td>
                                  <td className="py-3">
                                    <div className="d-flex align-items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <FaStar
                                          key={i}
                                          size={14}
                                          color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                                          className="me-1"
                                        />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    {review.comment.length > 50
                                      ? `${review.comment.substring(0, 50)}...`
                                      : review.comment}
                                  </td>
                                  <td className="py-3">{formatDate(review.createdAt)}</td>
                                  <td className="py-3 text-end">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="d-inline-flex align-items-center"
                                      onClick={() => handleReportReview(review)}
                                    >
                                      <FaFlag className="me-1" size={12} />
                                      Báo cáo
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Reports Section */}
          {(!isMobile || activeTab === "reports") && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5
                  className="fw-bold mb-0"
                  style={{
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    color: "#0046a8",
                  }}
                >
                  <FaFlag className="me-2" />
                  DANH SÁCH BÁO CÁO
                </h5>
                <Badge bg="primary" pill className="px-3 py-2">
                  {reports.length} báo cáo
                </Badge>
              </div>

              {/* Filter */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <FaFilter className="text-primary me-2" size={14} />
                    <Form.Label className="me-3 mb-0 fw-medium" style={{ fontSize: "0.9rem" }}>
                      Lọc theo trạng thái:
                    </Form.Label>
                    <Form.Select
                      size="sm"
                      className="rounded-pill"
                      style={{
                        fontSize: "0.85rem",
                        maxWidth: "200px",
                        border: "1px solid #dee2e6",
                      }}
                      value={filterStatus}
                      onChange={(e) => handleFilterChange(e.target.value)}
                    >
                      <option value="ALL">Tất cả</option>
                      <option value={REPORT_STATUSES.PENDING}>Đang chờ xử lý</option>
                      <option value={REPORT_STATUSES.PROCESSING}>Đang xử lý</option>
                      <option value={REPORT_STATUSES.RESOLVED}>Đã giải quyết</option>
                    </Form.Select>
                  </div>
                </Card.Body>
              </Card>

              {filteredReports.length === 0 ? (
                <Alert variant="info" className="rounded-4 shadow-sm">
                  <div className="text-center py-4">
                    <FaFlag size={32} className="text-info mb-3" />
                    <h6>Không có báo cáo nào</h6>
                    <p className="text-muted mb-0">Không có báo cáo nào phù hợp với bộ lọc.</p>
                  </div>
                </Alert>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  {isMobile && <div className="mb-4">{filteredReports.map((report) => renderReportCard(report))}</div>}

                  {/* Desktop View - Table */}
                  {!isMobile && (
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th className="py-3">ID</th>
                                <th className="py-3">Phòng</th>
                                <th className="py-3">Loại</th>
                                <th className="py-3">Mô tả</th>
                                <th className="py-3">Trạng thái</th>
                                <th className="py-3">Thời gian</th>
                                <th className="py-3 text-end">Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredReports.map((report) => (
                                <tr key={report.id}>
                                  <td className="py-3">{report.id}</td>
                                  <td className="py-3">{report.roomId}</td>
                                  <td className="py-3">{report.type}</td>
                                  <td className="py-3">
                                    {report.description.length > 50
                                      ? `${report.description.substring(0, 50)}...`
                                      : report.description}
                                  </td>
                                  <td className="py-3">
                                    {report.status === REPORT_STATUSES.PENDING ? (
                                      <Badge bg="warning" pill>
                                        Đang chờ xử lý
                                      </Badge>
                                    ) : report.status === REPORT_STATUSES.PROCESSING ? (
                                      <Badge bg="info" pill>
                                        Đang xử lý
                                      </Badge>
                                    ) : (
                                      <Badge bg="success" pill>
                                        Đã giải quyết
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-3">{formatDate(report.createAt)}</td>
                                  <td className="py-3 text-end">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="d-inline-flex align-items-center"
                                      onClick={() => handleDeleteReport(report.id)}
                                    >
                                      <FaTrash className="me-1" size={12} />
                                      Xóa
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title
            style={{
              fontSize: "1.25rem",
              color: "#0046a8",
            }}
          >
            <FaFlag className="me-2" />
            Báo cáo đánh giá
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Loại báo cáo</Form.Label>
              <Form.Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="rounded-3 border"
              >
                <option value={REPORT_TYPES.SPAM}>Spam</option>
                <option value={REPORT_TYPES.SCAM}>Lừa đảo</option>
                <option value={REPORT_TYPES.FAKE}>Giả mạo</option>
                <option value={REPORT_TYPES.INAPPROPRIATE}>Không phù hợp</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Mô tả lý do báo cáo</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Nhập lý do báo cáo vi phạm..."
                className="rounded-3 border"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowReportModal(false)} className="rounded-pill px-4">
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReport}
            className="rounded-pill px-4"
            style={{
              background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
              border: "none",
            }}
          >
            Gửi báo cáo
          </Button>
        </Modal.Footer>
      </Modal>
    </SidebarLayout>
  )
}

export default ManageReviewsPage
