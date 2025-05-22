import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { AppContext } from "../../contexts/app.context";
import reportAPI, { REPORT_TYPES, REPORT_STATUSES } from "../../apis/report.api";
import reviewAPI from "../../apis/review.api"; // Import reviewAPI
import { toast } from "react-toastify";
import Sidebar from "../MainPage/Sidebar";
import "../../assets/styles/ManageReviewsPage.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Review {
  id: number;
  roomId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReportDTO {
  id: number;
  roomId: number;
  userId: number;
  type: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "RESOLVED";
  createAt: string;
  updateAt: string;
}

const ManageReviewsPage = () => {
  const { profile } = useContext(AppContext);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reportType, setReportType] = useState<string>(REPORT_TYPES.INAPPROPRIATE);
  const [reportDescription, setReportDescription] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [totalPendingReports, setTotalPendingReports] = useState<number>(0);
  const [totalProcessingReports, setTotalProcessingReports] = useState<number>(0);
  const [totalResolvedReports, setTotalResolvedReports] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy danh sách đánh giá từ API
        const reviewsResponse = await fetchReviews();
        setReviews(reviewsResponse);

        // Lấy danh sách báo cáo
        const reportsResponse = await reportAPI.getAllReports();
        const userReports = reportsResponse.data.data.filter(
          (report) => report.userId === profile?.id
        );
        setReports(userReports);
        setFilteredReports(userReports);

        // Tính toán thống kê
        const pending = userReports.filter((r) => r.status === REPORT_STATUSES.PENDING).length;
        const processing = userReports.filter((r) => r.status === REPORT_STATUSES.PROCESSING).length;
        const resolved = userReports.filter((r) => r.status === REPORT_STATUSES.RESOLVED).length;
        setTotalPendingReports(pending);
        setTotalProcessingReports(processing);
        setTotalResolvedReports(resolved);
      } catch (err: any) {
        //
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchData();
    } else {
      setError("Không tìm thấy thông tin người dùng");
      setLoading(false);
    }
  }, [profile]);

  // Lấy danh sách đánh giá từ API
  const fetchReviews = async (): Promise<Review[]> => {
    try {
      const response = await reviewAPI.getReviewsByUseId({ userId: profile?.id });
      if (!response.data.success) {
        throw new Error(response.data.message || "Lỗi khi lấy danh sách đánh giá");
      }
      // Ánh xạ dữ liệu từ ReviewDTO sang Review
      return response.data.data.map((dto: any) => ({
        id: dto.id,
        roomId: dto.roomId,
        userId: dto.user.id,
        rating: dto.rating,
        comment: dto.comment,
        createdAt: dto.createAt, // Nếu backend trả về createdAt, đổi thành dto.createdAt
      }));
    } catch (error: any) {
      throw new Error(error.message || "Lỗi khi lấy danh sách đánh giá");
    }
  };

  const handleReportReview = (review: Review) => {
    setSelectedReview(review);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedReview || !reportDescription) {
      toast.error("Vui lòng nhập mô tả báo cáo");
      return;
    }

    try {
      const reportData = {
        roomId: selectedReview.roomId,
        userId: profile?.id || 0,
        type: reportType,
        description: reportDescription,
      };
      const response = await reportAPI.submitReport(reportData);
      const newReport = response.data.data;
      setReports([...reports, newReport]);
      setFilteredReports([...filteredReports, newReport]);
      setTotalPendingReports(totalPendingReports + 1);
      toast.success("Báo cáo đã được gửi thành công");
      setShowReportModal(false);
      setReportDescription("");
      setReportType(REPORT_TYPES.INAPPROPRIATE);
    } catch (err) {
      toast.error("Lỗi khi gửi báo cáo");
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      await reportAPI.deleteReport(reportId);
      const updatedReports = reports.filter((r) => r.id !== reportId);
      setReports(updatedReports);
      setFilteredReports(updatedReports.filter((r) => filterStatus === "ALL" || r.status === filterStatus));
      setTotalPendingReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.PENDING).length);
      setTotalProcessingReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.PROCESSING).length);
      setTotalResolvedReports(updatedReports.filter((r) => r.status === REPORT_STATUSES.RESOLVED).length);
      toast.success("Xóa báo cáo thành công");
    } catch (err) {
      toast.error("Lỗi khi xóa báo cáo");
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    if (status === "ALL") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === status));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === "") {
      return "Chưa có dữ liệu";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDates = (dateString: string) => {
    const currentDate = new Date();
    return currentDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Chart data and options
  const chartData = {
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
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Thống kê trạng thái báo cáo",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số lượng báo cáo",
        },
      },
    },
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0" style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Col
          xs={12}
          md={3}
          lg={2}
          className="bg-light p-3 shadow-sm vh-100"
          style={{ width: "30%" }}
        >
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col
          xs={12}
          md={9}
          lg={10}
          className="p-4 p-md-5"
          style={{ width: "70%" }}
        >
          <h2
            className="text-primary fw-bold mb-3"
            style={{ fontSize: "1.75rem" }}
          >
            QUẢN LÝ ĐÁNH GIÁ
          </h2>
          <h5 className="fw-bold mb-4" style={{ fontSize: "1rem" }}>
            THỐNG KÊ BÁO CÁO
          </h5>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={4} lg={2} className="mb-3">
              <Card
                className="text-white bg-primary rounded shadow-sm"
                style={{
                  height: "120px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Card.Body className="text-center p-3">
                  <Card.Title
                    style={{
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Tổng đánh giá
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {reviews.length}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2} className="mb-3">
              <Card
                className="text-white bg-primary rounded shadow-sm"
                style={{
                  height: "120px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Card.Body className="text-center p-3">
                  <Card.Title
                    style={{
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Báo cáo đang chờ
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {totalPendingReports}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2} className="mb-3">
              <Card
                className="text-white bg-primary rounded shadow-sm"
                style={{
                  height: "120px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Card.Body className="text-center p-3">
                  <Card.Title
                    style={{
                      fontSize: "1rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    Báo cáo đã giải quyết
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {totalResolvedReports}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Reports Chart */}
          {loading && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && reports.length === 0 && (
            <Alert variant="info">Không có báo cáo nào để hiển thị trên biểu đồ.</Alert>
          )}
          {!loading && !error && reports.length > 0 && (
            <div className="bg-white p-4 rounded shadow-sm mb-4">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          {/* Reviews Table */}
          <h5 className="fw-bold mb-4" style={{ fontSize: "1rem" }}>
            DANH SÁCH ĐÁNH GIÁ
          </h5>
          {loading && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && reviews.length === 0 && (
            <Alert variant="info">Không có đánh giá nào.</Alert>
          )}
          {!loading && !error && reviews.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Phòng</th>
                  <th>Điểm đánh giá</th>
                  <th>Bình luận</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>{review.roomId}</td>
                    <td>{review.rating}/5</td>
                    <td>{review.comment}</td>
                    <td>{formatDate(review.createdAt)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReportReview(review)}
                      >
                        Báo cáo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Reports Table with Filter */}
          <h5 className="fw-bold mb-4" style={{ fontSize: "1rem" }}>
            DANH SÁCH BÁO CÁO
          </h5>
          <Form.Group className="mb-4 d-flex align-items-center" style={{ maxWidth: "320px" }}>
            <Form.Label className="me-4 fw-medium" style={{ fontSize: "1rem", padding: "0.5rem" }}>
              Lọc theo trạng thái
            </Form.Label>
            <Form.Select
              className="rounded"
              style={{ fontSize: "0.9rem", padding: "0.5rem" }}
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value={REPORT_STATUSES.PENDING}>Đang chờ xử lý</option>
              <option value={REPORT_STATUSES.PROCESSING}>Đang xử lý</option>
              <option value={REPORT_STATUSES.RESOLVED}>Đã giải quyết</option>
            </Form.Select>
          </Form.Group>
          {!loading && !error && filteredReports.length === 0 && (
            <Alert variant="info">Không có báo cáo nào phù hợp với bộ lọc.</Alert>
          )}
          {!loading && !error && filteredReports.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Phòng</th>
                  <th>Loại</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thời gian báo cáo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.roomId}</td>
                    <td>{report.type}</td>
                    <td>{report.description}</td>
                    <td>
                      {report.status === REPORT_STATUSES.PENDING
                        ? "Đang chờ xử lý"
                        : report.status === REPORT_STATUSES.PROCESSING
                        ? "Đang xử lý"
                        : "Đã giải quyết"}
                    </td>
                    <td>{formatDates(report.createAt)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Report Modal */}
          <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Báo cáo đánh giá</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Loại báo cáo</Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value={REPORT_TYPES.SPAM}>Spam</option>
                    <option value={REPORT_TYPES.SCAM}>Lừa đảo</option>
                    <option value={REPORT_TYPES.FAKE}>Giả mạo</option>
                    <option value={REPORT_TYPES.INAPPROPRIATE}>Không phù hợp</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả lý do báo cáo</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Nhập lý do báo cáo vi phạm..."
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                Đóng
              </Button>
              <Button variant="primary" onClick={handleSubmitReport}>
                Gửi báo cáo
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default ManageReviewsPage;