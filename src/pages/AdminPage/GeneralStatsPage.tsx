"use client"

import { useState } from "react"
import { Card, Form, Button } from "react-bootstrap"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { SidebarLayout } from "../MainPage/Sidebar"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js"
import {
  FaChartLine,
  FaEye,
  FaHeart,
  FaPhone,
  FaCalendarAlt,
  FaArrowUp,
  FaMapMarkerAlt,
  FaHome,
  FaFire,
  FaRegBuilding,
  FaLock,
  FaCheckCircle,
  FaArrowDown,
} from "react-icons/fa"
import { useResponsive } from "../../store/hook"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

const GeneralStatsPage = () => {
  const { isMobile } = useResponsive()
  const [timeRange, setTimeRange] = useState("7days")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with real API calls
  const [stats, setStats] = useState({
    totalRooms: 24,
    activeRooms: 18,
    hotRooms: 6,
    normalRooms: 12,
    closedRooms: 3,
    blockedRooms: 3,
    totalViews: 1250,
    totalLikes: 89,
    totalCalls: 156,
    conversionRate: 12.5,
  })

  // Chart data
  const viewsChartData = {
    labels:
      timeRange === "7days"
        ? ["17/04", "18/04", "19/04", "20/04", "21/04", "22/04", "23/04"]
        : timeRange === "30days"
          ? ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"]
          : ["Tháng 1", "Tháng 2", "Tháng 3"],
    datasets: [
      {
        label: "Lượt xem",
        data:
          timeRange === "7days"
            ? [45, 52, 38, 67, 89, 76, 95]
            : timeRange === "30days"
              ? [320, 450, 380, 520]
              : [1200, 1450, 1250],
        borderColor: "#0046a8",
        backgroundColor: "rgba(0, 70, 168, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#0046a8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }

  const roomTypeChartData = {
    labels: ["Phòng trọ", "Nhà nguyên căn", "Căn hộ"],
    datasets: [
      {
        data: [stats.totalRooms * 0.6, stats.totalRooms * 0.25, stats.totalRooms * 0.15],
        backgroundColor: ["#0046a8", "#28a745", "#ffc107"],
        borderWidth: 0,
      },
    ],
  }

  const performanceChartData = {
    labels: ["Lượt xem", "Lượt thích", "Lượt gọi"],
    datasets: [
      {
        label: "Hiệu suất",
        data: [stats.totalViews, stats.totalLikes, stats.totalCalls],
        backgroundColor: ["rgba(0, 70, 168, 0.8)", "rgba(220, 53, 69, 0.8)", "rgba(40, 167, 69, 0.8)"],
        borderColor: ["#0046a8", "#dc3545", "#28a745"],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#0046a8",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6c757d",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6c757d",
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
          padding: 20,
          usePointStyle: true,
          font: {
            size: isMobile ? 12 : 14,
          },
        },
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#0046a8",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6c757d",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6c757d",
        },
      },
    },
  }

  const statsCards = [
    { title: "Tổng số trọ", value: stats.totalRooms, color: "primary", icon: FaHome, change: "+12%", trend: "up" },
    {
      title: "Trọ đang hoạt động",
      value: stats.activeRooms,
      color: "success",
      icon: FaCheckCircle,
      change: "+8%",
      trend: "up",
    },
    { title: "Trọ Hot", value: stats.hotRooms, color: "warning", icon: FaFire, change: "+25%", trend: "up" },
    { title: "Trọ thường", value: stats.normalRooms, color: "info", icon: FaRegBuilding, change: "+5%", trend: "up" },
    {
      title: "Trọ đã đóng",
      value: stats.closedRooms,
      color: "secondary",
      icon: FaMapMarkerAlt,
      change: "-2%",
      trend: "down",
    },
    { title: "Bị khóa", value: stats.blockedRooms, color: "danger", icon: FaLock, change: "0%", trend: "neutral" },
  ]

  const performanceCards = [
    { title: "Tổng lượt xem", value: stats.totalViews, icon: FaEye, color: "primary", change: "+15%" },
    { title: "Lượt thích", value: stats.totalLikes, icon: FaHeart, color: "danger", change: "+22%" },
    { title: "Lượt gọi", value: stats.totalCalls, icon: FaPhone, color: "success", change: "+18%" },
    { title: "Tỷ lệ chuyển đổi", value: `${stats.conversionRate}%`, icon: FaArrowUp, color: "warning", change: "+3%" },
  ]

  return (
    <SidebarLayout>
      <div className="d-flex flex-column gap-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h2 className="text-primary fw-bold mb-1 d-flex align-items-center">
              <FaChartLine className="me-2" />
              THỐNG KÊ TỔNG QUAN
            </h2>
            <p className="text-muted mb-0">Theo dõi hiệu suất và phân tích dữ liệu</p>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center"
            style={{ borderRadius: "8px" }}
          >
            <FaCalendarAlt className="me-2" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon
            const TrendIcon = stat.trend === "up" ? FaArrowUp : stat.trend === "down" ? FaArrowDown : null
            return (
              <div key={index} className={`col-6 col-md-4 col-lg-2`}>
                <Card
                  className={`text-white bg-${stat.color} h-100 border-0 shadow-sm position-relative overflow-hidden`}
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
                  <Card.Body className="p-3 text-center position-relative">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <IconComponent size={isMobile ? 18 : 22} />
                    </div>
                    <Card.Title className="mb-1" style={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}>
                      {stat.title}
                    </Card.Title>
                    <Card.Text className="fw-bold mb-1" style={{ fontSize: isMobile ? "1.3rem" : "1.8rem" }}>
                      {stat.value}
                    </Card.Text>
                    <div className="d-flex align-items-center justify-content-center">
                      {TrendIcon && <TrendIcon size={10} className="me-1" />}
                      <small className="opacity-75" style={{ fontSize: "0.65rem" }}>
                        {stat.change}
                      </small>
                    </div>
                  </Card.Body>
                  {/* Decorative element */}
                  <div
                    className="position-absolute"
                    style={{
                      top: "-20px",
                      right: "-20px",
                      width: "60px",
                      height: "60px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                    }}
                  />
                </Card>
              </div>
            )
          })}
        </div>

        {/* Performance Cards */}
        <div className="row g-3">
          {performanceCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <div key={index} className="col-6 col-lg-3">
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
                  <Card.Body className="p-3 text-center">
                    <div
                      className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-${card.color}`}
                      style={{
                        width: isMobile ? 40 : 50,
                        height: isMobile ? 40 : 50,
                        backgroundColor: `var(--bs-${card.color})15`,
                      }}
                    >
                      <IconComponent size={isMobile ? 18 : 22} />
                    </div>
                    <h6 className="text-muted mb-1" style={{ fontSize: isMobile ? "0.75rem" : "0.85rem" }}>
                      {card.title}
                    </h6>
                    <h4
                      className={`fw-bold text-${card.color} mb-1`}
                      style={{ fontSize: isMobile ? "1.3rem" : "1.5rem" }}
                    >
                      {card.value}
                    </h4>
                    <small className="text-success" style={{ fontSize: "0.7rem" }}>
                      <FaArrowUp size={8} className="me-1" />
                      {card.change}
                    </small>
                  </Card.Body>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="row g-4">
          {/* Views Chart */}
          <div className="col-12 col-xl-8">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <h5 className="fw-bold text-primary mb-0 d-flex align-items-center">
                    <FaEye className="me-2" />
                    LƯỢT XEM THEO THỜI GIAN
                  </h5>
                  <Form.Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{ width: "auto", borderRadius: "8px", minWidth: "180px" }}
                    size="sm"
                  >
                    <option value="7days">7 ngày gần nhất</option>
                    <option value="30days">30 ngày gần nhất</option>
                    <option value="90days">90 ngày gần nhất</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: isMobile ? "250px" : "300px" }}>
                  <Line data={viewsChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Room Type Distribution */}
          <div className="col-12 col-xl-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <h5 className="fw-bold text-primary mb-0">PHÂN BỐ LOẠI PHÒNG</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: isMobile ? "250px" : "300px" }}>
                  <Doughnut data={roomTypeChartData} options={doughnutOptions} />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Performance Chart */}
          <div className="col-12">
            <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
              <Card.Header className="bg-transparent border-0 p-4 pb-0">
                <h5 className="fw-bold text-primary mb-0 d-flex align-items-center">
                  <FaArrowUp className="me-2" />
                  HIỆU SUẤT TƯƠNG TÁC
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: isMobile ? "250px" : "300px" }}>
                  <Bar data={performanceChartData} options={barOptions} />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default GeneralStatsPage
