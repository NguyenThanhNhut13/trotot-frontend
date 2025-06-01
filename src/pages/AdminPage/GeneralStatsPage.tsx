"use client"
import { Card, Form } from "react-bootstrap"
import { Line } from "react-chartjs-2"
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
} from "chart.js"
import { useResponsive } from "../../store/hook"
import { FaChartLine, FaHome, FaFire, FaRegBuilding, FaLock, FaCheckCircle } from "react-icons/fa"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const GeneralStatsPage = () => {
  const { isMobile } = useResponsive()

  // Data for the line chart (last 7 days views)
  const chartData = {
    labels: ["17/04/2025", "18/04/2025", "19/04/2025", "20/04/2025", "21/04/2025", "22/04/2025", "23/04/2025"],
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
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend as per screenshot
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const statsCards = [
    { title: "Tổng số trọ", value: 0, color: "primary", icon: FaHome },
    { title: "Trọ đang hoạt động", value: 0, color: "success", icon: FaCheckCircle },
    { title: "Trọ Hot", value: 0, color: "warning", icon: FaFire },
    { title: "Trọ thường", value: 0, color: "primary", icon: FaRegBuilding },
    { title: "Trọ đã đóng", value: 0, color: "secondary", icon: FaHome },
    { title: "Bị khóa", value: 0, color: "danger", icon: FaLock },
  ]

  return (
    <SidebarLayout>
      <div className="d-flex flex-column gap-4">
        {/* Header */}
        <div>
          <h2 className="text-primary fw-bold mb-1 d-flex align-items-center">
            <FaChartLine className="me-2" />
            THÔNG TIN CHUNG
          </h2>
          <p className="text-muted mb-0">Thống kê và theo dõi hoạt động của bạn</p>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className={`col-${isMobile ? "6" : "12 col-sm-6 col-md-4 col-lg-2"}`}>
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
              </div>
            )
          })}
        </div>

        {/* Views Chart */}
        <div>
          <h3 className="text-primary fw-bold mb-3 d-flex align-items-center" style={{ fontSize: "1.25rem" }}>
            <FaChartLine className="me-2" />
            LƯỢT XEM
          </h3>

          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <Form.Label className="fw-medium mb-0" style={{ fontSize: "1rem" }}>
              Tất cả tin
            </Form.Label>
            <Form.Select className="rounded" style={{ fontSize: "0.9rem", padding: "0.5rem", maxWidth: "200px" }}>
              <option>7 ngày gần nhất</option>
              <option>30 ngày gần nhất</option>
              <option>90 ngày gần nhất</option>
            </Form.Select>
          </div>

          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <Card.Body className="p-3">
              <div style={{ height: "300px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default GeneralStatsPage
