import React from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import Sidebar from "../MainPage/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GeneralStatsPage = () => {
  // Data for the line chart (last 7 days views)
  const chartData = {
    labels: [
      "17/04/2025",
      "18/04/2025",
      "19/04/2025",
      "20/04/2025",
      "21/04/2025",
      "22/04/2025",
      "23/04/2025",
    ],
    datasets: [
      {
        label: "Lượt xem",
        data: [0, 0, 0, 0, 0, 0, 0], // Placeholder data (all 0 as per screenshot)
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide legend as per screenshot
      },
      title: {
        display: false,
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
            THỐNG TIN CHUNG
          </h2>
          <h5 className="fw-bold mb-4" style={{ fontSize: "1rem" }}>
            THỐNG KÊ
          </h5>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Row className="mb-4">
              <Col xs={12} sm={6} md={4} lg={2} className="mb-3">
                <Card
                  className="text-white bg-primary rounded shadow-sm"
                  style={{
                    height: "120px", // Fixed height for all cards
                    width: "100%", // Ensure the card takes the full width of the Col
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
                      Tổng số trọ
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
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
                      Trọ đang <br /> hoạt động
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4} lg={2} className="mb-3">
                <Card
                  className="text-white bg-warning rounded shadow-sm"
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
                      Trọ Hot
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
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
                      Trọ thường
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
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
                      Trọ đã đóng
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
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
                      Bị khóa
                    </Card.Title>
                    <Card.Text
                      style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    >
                      0
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Row>

          {/* Views Chart */}
          <h3
            className="text-primary fw-bold mb-3"
            style={{ fontSize: "1.25rem" }}
          >
            LƯỢT XEM
          </h3>
          <Form.Group
            className="mb-4 d-flex align-items-center"
            style={{ maxWidth: "320px" }}
          >
            <Form.Label
              className="me-4 fw-medium"
              style={{ fontSize: "1rem",padding: "0.5rem" }}
            >
              Tất cả tin
            </Form.Label>
            <Form.Select
              className="rounded"
              style={{ fontSize: "0.9rem", padding: "0.5rem" }}
            >
              <option>7 ngày gần nhất</option>
              <option>30 ngày gần nhất</option>
              <option>90 ngày gần nhất</option>
            </Form.Select>
          </Form.Group>

          <div className="bg-white p-4 rounded shadow-sm">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default GeneralStatsPage;
