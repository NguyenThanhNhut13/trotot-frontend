import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { AppContext } from "../../contexts/app.context";
import paymentAPI from "../../apis/payment.api";
import { toast } from "react-toastify";
import Sidebar from "../MainPage/Sidebar";
import "../../assets/styles/HistoryPage.css";
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

interface Transaction {
  id: number;
  amount: number;
  transactionType: "DEPOSIT" | "PURCHASE";
  description: string;
  createdAt: string;
}

const HistoryPage = () => {
  const { profile } = useContext(AppContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);

  useEffect(() => {
    const userId = profile?.id;
    if (userId) {
      const fetchTransactionHistory = async () => {
        try {
          setLoading(true);
          const response = await paymentAPI.getTransactionHistory(userId);
          const data = response.data.data || [];
          setTransactions(data);

          // Calculate totals
          const deposits: number = data
            .filter((t: Transaction) => t.transactionType === "DEPOSIT")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          const purchases: number = data
            .filter((t: Transaction) => t.transactionType === "PURCHASE")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          setTotalDeposits(deposits);
          setTotalPurchases(purchases);
        } catch (err) {
          setError("Lỗi khi lấy lịch sử giao dịch");
          toast.error("Lỗi khi lấy lịch sử giao dịch");
        } finally {
          setLoading(false);
        }
      };
      fetchTransactionHistory();
    } else {
      setError("Không tìm thấy thông tin người dùng");
      setLoading(false);
    }
  }, [profile]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Chart data and options
  const chartData = {
    labels: ["Nạp tiền", "Thanh toán"],
    datasets: [
      {
        label: "Tổng số tiền (VND)",
        data: [totalDeposits, totalPurchases],
        backgroundColor: ["#007bff", "#ff6384"],
        borderColor: ["#0056b3", "#ff1a53"],
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
        text: "Tổng giá trị giao dịch theo loại",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số tiền (VND)",
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
            LỊCH SỬ GIAO DỊCH
          </h2>
          <h5 className="fw-bold mb-4" style={{ fontSize: "1rem" }}>
            THỐNG KÊ
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
                    Tổng nạp tiền
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {formatVND(totalDeposits)}
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
                    Tổng thanh toán
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {formatVND(totalPurchases)}
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
                    Tổng giao dịch
                  </Card.Title>
                  <Card.Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  >
                    {transactions.length}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Transaction Chart */}
          {loading && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && transactions.length === 0 && (
            <Alert variant="info">Không có giao dịch nào để hiển thị trên biểu đồ.</Alert>
          )}
          {!loading && !error && transactions.length > 0 && (
            <div className="bg-white p-4 rounded shadow-sm">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default HistoryPage;