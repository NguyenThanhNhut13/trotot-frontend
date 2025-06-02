"use client"

import { useEffect, useState } from "react"
import { Row, Col, Card, Spinner, Alert, Button, Tabs, Tab } from "react-bootstrap"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"
import {
  FaWallet,
  FaShoppingCart,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
} from "react-icons/fa"
import { SidebarLayout } from "../MainPage/Sidebar"
import paymentAPI from "../../apis/payment.api"
import { toast } from "react-toastify"
import { useAppSelector } from "../../store/hook"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend)

interface Transaction {
  id: number
  amount: number
  transactionType: "DEPOSIT" | "PURCHASE"
  description: string
  createdAt: string
}

const HistoryPage = () => {
  const { profile } = useAppSelector((state) => state.user)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalDeposits, setTotalDeposits] = useState<number>(0)
  const [totalPurchases, setTotalPurchases] = useState<number>(0)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30")
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    const userId = profile?.id
    if (userId) {
      const fetchTransactionHistory = async () => {
        try {
          setLoading(true)
          const response = await paymentAPI.getTransactionHistory(userId)
          const data = response.data.data || []
          setTransactions(data)

          // Calculate totals
          const deposits: number = data
            .filter((t: Transaction) => t.transactionType === "DEPOSIT")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          const purchases: number = data
            .filter((t: Transaction) => t.transactionType === "PURCHASE")
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
          setTotalDeposits(deposits)
          setTotalPurchases(purchases)
        } catch (err) {
          setError("Lỗi khi lấy lịch sử giao dịch")
          toast.error("Lỗi khi lấy lịch sử giao dịch")
        } finally {
          setLoading(false)
        }
      }
      fetchTransactionHistory()
    } else {
      setError("Không tìm thấy thông tin người dùng")
      setLoading(false)
    }
  }, [profile])

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value)
  }

  const formatCompactVND = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Calculate trends (mock calculation for demo)
  const calculateTrend = (current: number, type: string) => {
    const mockPrevious = current * 0.85 // Simulate 15% growth
    const change = ((current - mockPrevious) / mockPrevious) * 100
    return {
      percentage: `+${change.toFixed(1)}%`,
      isPositive: change > 0,
    }
  }

  // Statistics data
  const stats = [
    {
      title: "Tổng nạp tiền",
      value: totalDeposits,
      icon: FaWallet,
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      trend: calculateTrend(totalDeposits, "deposit"),
    },
    {
      title: "Tổng chi tiêu",
      value: totalPurchases,
      icon: FaShoppingCart,
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      trend: calculateTrend(totalPurchases, "purchase"),
    },
    {
      title: "Số dư hiện tại",
      value: totalDeposits - totalPurchases,
      icon: FaChartLine,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      trend: calculateTrend(totalDeposits - totalPurchases, "balance"),
    },
    {
      title: "Tổng giao dịch",
      value: transactions.length,
      icon: FaCalendarAlt,
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      trend: { percentage: `+${Math.round(transactions.length * 0.15)}`, isPositive: true },
      isCount: true,
    },
  ]

  // Chart data
  const barChartData = {
    labels: ["Nạp tiền", "Chi tiêu", "Số dư"],
    datasets: [
      {
        label: "Số tiền (VND)",
        data: [totalDeposits, totalPurchases, totalDeposits - totalPurchases],
        backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(59, 130, 246, 0.8)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(245, 158, 11)", "rgb(59, 130, 246)"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const doughnutChartData = {
    labels: ["Nạp tiền", "Chi tiêu"],
    datasets: [
      {
        data: [totalDeposits, totalPurchases],
        backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)"],
        borderColor: ["rgb(16, 185, 129)", "rgb(245, 158, 11)"],
        borderWidth: 3,
      },
    ],
  }

  // Generate line chart data from real transactions
  const generateLineChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split("T")[0]
    })

    const depositsByDay = last7Days.map((day) => {
      return transactions
        .filter((t) => t.transactionType === "DEPOSIT" && t.createdAt.startsWith(day))
        .reduce((sum, t) => sum + t.amount, 0)
    })

    const purchasesByDay = last7Days.map((day) => {
      return transactions
        .filter((t) => t.transactionType === "PURCHASE" && t.createdAt.startsWith(day))
        .reduce((sum, t) => sum + t.amount, 0)
    })

    return {
      labels: last7Days.map((day) => {
        const date = new Date(day)
        return `${date.getDate()}/${date.getMonth() + 1}`
      }),
      datasets: [
        {
          label: "Nạp tiền",
          data: depositsByDay,
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Chi tiêu",
          data: purchasesByDay,
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  const lineChartData = generateLineChartData()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 12,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 10,
          },
          callback: (value: any) => formatCompactVND(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${formatVND(context.raw)}`,
        },
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 12,
        },
      },
    },
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
          <div className="text-center">
            <Spinner animation="border" style={{ width: "3rem", height: "3rem", borderWidth: "3px" }} />
            <div className="mt-3 h5">Đang tải dữ liệu...</div>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger" className="text-center p-4 rounded-4 border-0 shadow">
              <h4 className="mb-3">⚠️ Có lỗi xảy ra</h4>
              <p className="mb-3">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </Alert>
          </Col>
        </Row>
      </SidebarLayout>
    )
  }

  // Render mobile/tablet view
  const renderMobileView = () => {
    return (
      <div className="d-block d-lg-none">
        {/* Mobile Tabs */}
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "overview")} className="mb-3 border-0" fill>
          <Tab eventKey="overview" title="Tổng quan">
            {/* Stats Cards - 2 columns on mobile */}
            <Row className="g-2 mb-3">
              {stats.map((stat, index) => (
                <Col key={index} xs={6}>
                  <Card
                    className="border-0 shadow-sm h-100"
                    style={{
                      borderRadius: "16px",
                      background: "white",
                    }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3"
                          style={{
                            width: "36px",
                            height: "36px",
                            background: stat.gradient,
                            color: "white",
                          }}
                        >
                          <stat.icon size={16} />
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          {stat.trend.isPositive ? (
                            <FaArrowUp size={10} className="text-success" />
                          ) : (
                            <FaArrowDown size={10} className="text-danger" />
                          )}
                          <span
                            className={`${stat.trend.isPositive ? "text-success" : "text-danger"}`}
                            style={{ fontSize: "0.7rem", fontWeight: "600" }}
                          >
                            {stat.trend.percentage}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div
                          className="fw-bold mb-1"
                          style={{
                            fontSize: "1rem",
                            color: stat.color,
                            lineHeight: 1.2,
                          }}
                        >
                          {stat.isCount ? stat.value : formatCompactVND(stat.value)}
                        </div>
                        <div
                          className="text-muted"
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "500",
                            lineHeight: 1.3,
                          }}
                        >
                          {stat.title}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Bar Chart */}
            <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-3 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                    Tổng quan giao dịch
                  </h6>
                  <div className="d-flex gap-1">
                    {["7", "30", "90"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "primary" : "outline-secondary"}
                        size="sm"
                        className="rounded-3 py-0 px-2"
                        style={{
                          fontSize: "0.7rem",
                          ...(selectedPeriod === period && {
                            background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                            border: "none",
                          }),
                        }}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period}d
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-3">
                <div style={{ height: "200px" }}>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>

            {/* Doughnut Chart */}
            <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-3 pb-0">
                <h6 className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                  Phân bổ giao dịch
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div style={{ height: "180px" }}>
                  <Doughnut data={doughnutChartData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>

            {/* Line Chart */}
            <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-3 pb-0">
                <h6 className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                  Xu hướng giao dịch 7 ngày qua
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                <div style={{ height: "200px" }}>
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="transactions" title="Giao dịch">
            {/* Recent Transactions */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-bold" style={{ fontSize: "0.9rem" }}>
                  Giao dịch gần đây
                </h6>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 rounded-3 py-1 px-2"
                  style={{ fontSize: "0.7rem" }}
                >
                  <FaFilter size={10} />
                  <span>Lọc</span>
                </Button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-2" style={{ fontSize: "2rem", opacity: 0.3 }}>
                    📊
                  </div>
                  <h6 className="text-muted" style={{ fontSize: "0.9rem" }}>
                    Chưa có giao dịch nào
                  </h6>
                  <p className="text-muted small" style={{ fontSize: "0.8rem" }}>
                    Các giao dịch của bạn sẽ hiển thị tại đây
                  </p>
                </div>
              ) : (
                <>
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="mb-2 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex gap-2">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-3"
                              style={{
                                width: "36px",
                                height: "36px",
                                background:
                                  transaction.transactionType === "DEPOSIT"
                                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                    : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                color: "white",
                              }}
                            >
                              {transaction.transactionType === "DEPOSIT" ? (
                                <FaArrowUp size={14} />
                              ) : (
                                <FaArrowDown size={14} />
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold mb-1" style={{ fontSize: "0.85rem" }}>
                                {transaction.description}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                                {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <div
                              className={`fw-bold ${transaction.transactionType === "DEPOSIT" ? "text-success" : "text-warning"}`}
                              style={{ fontSize: "0.85rem" }}
                            >
                              {transaction.transactionType === "DEPOSIT" ? "+" : "-"}
                              {formatVND(transaction.amount)}
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  {/* View All Button */}
                  <div className="text-center mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="rounded-3 px-4"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Xem tất cả
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    )
  }

  // Render desktop view
  const renderDesktopView = () => {
    return (
      <div className="d-none d-lg-block">
        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          {stats.map((stat, index) => (
            <Col key={index} xs={6} lg={3}>
              <Card
                className="border-0 shadow-sm h-100 position-relative overflow-hidden"
                style={{
                  borderRadius: "20px",
                  background: "white",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"
                }}
              >
                {/* Decorative background */}
                <div
                  className="position-absolute"
                  style={{
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    background: stat.gradient,
                    borderRadius: "50%",
                    opacity: 0.1,
                  }}
                />

                <Card.Body className="p-3 p-lg-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: "45px",
                        height: "45px",
                        background: stat.gradient,
                        color: "white",
                      }}
                    >
                      <stat.icon size={20} />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      {stat.trend.isPositive ? (
                        <FaArrowUp size={12} className="text-success" />
                      ) : (
                        <FaArrowDown size={12} className="text-danger" />
                      )}
                      <span
                        className={`${stat.trend.isPositive ? "text-success" : "text-danger"}`}
                        style={{ fontSize: "0.75rem", fontWeight: "600" }}
                      >
                        {stat.trend.percentage}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div
                      className="fw-bold mb-1"
                      style={{
                        fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                        color: stat.color,
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.isCount ? stat.value : formatCompactVND(stat.value)}
                    </div>
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "500",
                        lineHeight: 1.3,
                      }}
                    >
                      {stat.title}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section */}
        <Row className="g-4">
          {/* Bar Chart */}
          <Col xs={12} lg={8}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Tổng quan giao dịch</h5>
                  <div className="d-flex gap-2">
                    {["7", "30", "90"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "primary" : "outline-secondary"}
                        size="sm"
                        className="rounded-3"
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.75rem",
                          ...(selectedPeriod === period && {
                            background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                            border: "none",
                          }),
                        }}
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period}d
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "300px" }}>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Doughnut Chart */}
          <Col xs={12} lg={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <h5 className="mb-0 fw-bold">Phân bổ giao dịch</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "250px" }}>
                  <Doughnut data={doughnutChartData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Line Chart */}
          <Col xs={12}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <h5 className="mb-0 fw-bold">Xu hướng giao dịch 7 ngày qua</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: "300px" }}>
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Row className="mt-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Giao dịch gần đây</h5>
                  <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 rounded-3">
                    <FaFilter size={14} />
                    <span>Lọc giao dịch</span>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: "3rem", opacity: 0.3 }}>
                      📊
                    </div>
                    <h6 className="text-muted">Chưa có giao dịch nào</h6>
                    <p className="text-muted small">Các giao dịch của bạn sẽ hiển thị tại đây</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                          <th className="border-0 fw-semibold text-muted py-3">Loại</th>
                          <th className="border-0 fw-semibold text-muted py-3">Mô tả</th>
                          <th className="border-0 fw-semibold text-muted py-3">Ngày</th>
                          <th className="border-0 fw-semibold text-muted py-3 text-end">Số tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 10).map((transaction) => (
                          <tr key={transaction.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="border-0 py-3">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-3"
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    background:
                                      transaction.transactionType === "DEPOSIT"
                                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                        : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    color: "white",
                                  }}
                                >
                                  {transaction.transactionType === "DEPOSIT" ? (
                                    <FaArrowUp size={14} />
                                  ) : (
                                    <FaArrowDown size={14} />
                                  )}
                                </div>
                                <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                                  {transaction.transactionType === "DEPOSIT" ? "Nạp tiền" : "Chi tiêu"}
                                </span>
                              </div>
                            </td>
                            <td className="border-0 py-3">
                              <span style={{ fontSize: "0.9rem" }}>{transaction.description}</span>
                            </td>
                            <td className="border-0 py-3">
                              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                                {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </td>
                            <td className="border-0 py-3 text-end">
                              <span
                                className={`fw-bold ${transaction.transactionType === "DEPOSIT" ? "text-success" : "text-warning"}`}
                                style={{ fontSize: "0.9rem" }}
                              >
                                {transaction.transactionType === "DEPOSIT" ? "+" : "-"}
                                {formatVND(transaction.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <SidebarLayout>
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          minHeight: "calc(100vh - 2rem)",
          margin: "-1rem",
          padding: "1rem",
        }}
      >
        {/* Header */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <h1
                  className="mb-2 fw-bold"
                  style={{
                    background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "clamp(1.25rem, 4vw, 2rem)",
                  }}
                >
                  Lịch sử giao dịch
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  Theo dõi và quản lý các giao dịch của bạn
                </p>
              </div>
              <div className="d-none d-md-flex gap-2">
                <Button variant="outline-primary" size="sm" className="d-flex align-items-center gap-2 rounded-3">
                  <FaFilter size={14} />
                  <span className="d-none d-sm-inline">Lọc</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-2 rounded-3"
                  style={{ background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)", border: "none" }}
                >
                  <FaDownload size={14} />
                  <span className="d-none d-sm-inline">Xuất</span>
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Mobile/Tablet View */}
        {renderMobileView()}

        {/* Desktop View */}
        {renderDesktopView()}
      </div>
    </SidebarLayout>
  )
}

export default HistoryPage
