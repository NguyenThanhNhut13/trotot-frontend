"use client"
import { useState } from "react"
import type React from "react"

import {
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaArrowUp,
  FaMapMarkerAlt,
  FaSearch,
  FaRegBuilding,
  FaRegStar,
  FaRegCreditCard,
  FaRegQuestionCircle,
  FaRegFileAlt,
  FaShieldAlt,
  FaHandshake,
  FaUsers,
  FaRegClock,
  FaChevronRight,
  FaRegPaperPlane,
} from "react-icons/fa"
import { SiZalo } from "react-icons/si"
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap"
import { useResponsive } from "../../store/hook"

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })
  const { isMobile, isTablet } = useResponsive()
  const [email, setEmail] = useState("")

  const primaryColor = "#0046a8"

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription logic here
    alert(`Cảm ơn bạn đã đăng ký nhận tin tức từ Trọ Tốt với email: ${email}`)
    setEmail("")
  }

  return (
    <footer className="pt-5 bg-light">
      {/* Top section with gradient background */}
      <div
        className="py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0056d3 100%)`,
          borderRadius: "0 100px 0 0",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={7} md={6} className="mb-4 mb-md-0">
              <h2 className="fw-bold mb-3">Tìm phòng trọ tốt nhất tại Việt Nam</h2>
              <p className="mb-4 opacity-80">
                Trọ Tốt kết nối hàng triệu người tìm trọ với chủ nhà trên khắp Việt Nam. Nhanh chóng, an toàn và miễn
                phí.
              </p>
              <div className="d-flex flex-wrap gap-4">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <div className="h4 mb-0 fw-bold">1M+</div>
                    <div className="opacity-75">Người dùng</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <FaRegBuilding size={20} />
                  </div>
                  <div>
                    <div className="h4 mb-0 fw-bold">500K+</div>
                    <div className="opacity-75">Tin đăng</div>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <FaRegClock size={20} />
                  </div>
                  <div>
                    <div className="h4 mb-0 fw-bold">24/7</div>
                    <div className="opacity-75">Hỗ trợ</div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={5} md={6}>
              <Card className="border-0 shadow-lg rounded-lg p-4">
                <Card.Body>
                  <h4 className="text-dark fw-bold mb-3">Đăng ký nhận tin mới</h4>
                  <p className="text-muted mb-4">
                    Nhận thông báo về phòng trọ mới nhất và các ưu đãi đặc biệt từ Trọ Tốt
                  </p>
                  <Form onSubmit={handleSubscribe}>
                    <div className="d-flex">
                      <Form.Control
                        type="email"
                        placeholder="Email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="me-2 py-3 px-3"
                      />
                      <Button
                        type="submit"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #0056d3 100%)`,
                          border: "none",
                        }}
                        className="px-4"
                      >
                        <FaRegPaperPlane />
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main footer content */}
      <Container className="py-5">
        <Row>
          {/* Column 1: About */}
          <Col lg={3} md={6} sm={12} className="mb-4 mb-lg-0">
            <div className={`mb-4 ${isMobile ? "text-center" : ""}`}>
              <img
                src="https://tromoi.com/logo_mobile.png"
                alt="Trọ Tốt"
                className="img-fluid mb-3"
                style={{ height: "60px" }}
              />
              <h5 className="fw-bold">Trọ Tốt - Tìm trọ dễ dàng</h5>
            </div>
            <p className="text-muted mb-4">
              Nền tảng kết nối người thuê và chủ nhà hàng đầu Việt Nam. Chúng tôi giúp bạn tìm kiếm căn phòng phù hợp
              với nhu cầu và ngân sách.
            </p>

            <h6 className={`fw-bold mb-3 ${isMobile ? "text-center" : ""}`} style={{ color: primaryColor }}>
              TẢI ỨNG DỤNG TRỌ TỐT
            </h6>
            <div className={`d-flex ${isMobile ? "justify-content-center" : ""}`}>
              <div className="me-3">
                <img
                  src="https://tromoi.com/frontend/landing/app/images/img_qrcode.png"
                  alt="QR Code"
                  style={{ width: "80px" }}
                  className="img-fluid rounded"
                />
              </div>
              <div className="d-flex flex-column">
                <a href="#" className="mb-2">
                  <img
                    src="https://tromoi.com/frontend/landing/app/images/img_download_appstore.png"
                    alt="App Store"
                    style={{ height: "35px" }}
                  />
                </a>
                <a href="#">
                  <img
                    src="https://tromoi.com/frontend/landing/app/images/img_download_googleplay.png"
                    alt="Google Play"
                    style={{ height: "35px" }}
                  />
                </a>
              </div>
            </div>
          </Col>

          {/* Column 2: Services */}
          <Col lg={3} md={6} sm={6} xs={12} className="mb-4 mb-lg-0">
            <h5 className={`fw-bold mb-4 ${isMobile ? "mt-3" : ""}`} style={{ color: primaryColor }}>
              DỊCH VỤ
            </h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaSearch className="me-2" size={14} />
                  <span>Tìm phòng trọ</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaRegBuilding className="me-2" size={14} />
                  <span>Cho thuê phòng</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaRegStar className="me-2" size={14} />
                  <span>Đánh giá chỗ ở</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaRegCreditCard className="me-2" size={14} />
                  <span>Tính chi phí thuê</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: Support */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className={`fw-bold mb-4 ${isMobile ? "mt-3" : ""}`} style={{ color: primaryColor }}>
              HỖ TRỢ
            </h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaRegQuestionCircle className="me-2" size={14} />
                  <span>Câu hỏi thường gặp</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaRegFileAlt className="me-2" size={14} />
                  <span>Hướng dẫn sử dụng</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaShieldAlt className="me-2" size={14} />
                  <span>Chính sách bảo mật</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
              <li className="mb-3">
                <a
                  href="#"
                  className="text-decoration-none text-muted d-flex align-items-center"
                  style={{ transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = primaryColor
                    el.querySelector(".icon-arrow")!.classList.add("ms-2")
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ""
                    el.querySelector(".icon-arrow")!.classList.remove("ms-2")
                  }}
                >
                  <FaHandshake className="me-2" size={14} />
                  <span>Điều khoản dịch vụ</span>
                  <FaChevronRight className="ms-1 icon-arrow" size={12} style={{ transition: "all 0.3s ease" }} />
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Contact */}
          <Col lg={3} md={6}>
            <h5 className={`fw-bold mb-4 ${isMobile ? "mt-3" : ""}`} style={{ color: primaryColor }}>
              LIÊN HỆ
            </h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <div className="d-flex">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f8f9fa",
                      color: primaryColor,
                    }}
                  >
                    <FaPhone size={16} />
                  </div>
                  <div>
                    <div className="fw-medium">Hotline 24/7</div>
                    <div className="text-muted">033.266.1579 - 035.866.1579</div>
                  </div>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f8f9fa",
                      color: primaryColor,
                    }}
                  >
                    <SiZalo size={16} />
                  </div>
                  <div>
                    <div className="fw-medium">Zalo</div>
                    <div className="text-muted">0332661579</div>
                  </div>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f8f9fa",
                      color: primaryColor,
                    }}
                  >
                    <FaEnvelope size={16} />
                  </div>
                  <div>
                    <div className="fw-medium">Email</div>
                    <div className="text-muted">support@trotot.com</div>
                  </div>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f8f9fa",
                      color: primaryColor,
                    }}
                  >
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div>
                    <div className="fw-medium">Văn phòng</div>
                    <div className="text-muted">VP Huế: 4/16 Đoàn Hữu Trưng, TP. Huế</div>
                    <div className="text-muted">VP HCM: 19 Đường Số 23, P.10, Q.6, TP. HCM</div>
                  </div>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-4">
              <h6 className="fw-bold mb-3" style={{ color: primaryColor }}>
                KẾT NỐI VỚI CHÚNG TÔI
              </h6>
              <div className="d-flex gap-2">
                <a
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f8f9fa",
                    color: primaryColor,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = primaryColor
                    el.style.color = "white"
                    el.style.transform = "translateY(-3px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = "#f8f9fa"
                    el.style.color = primaryColor
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <FaFacebook size={18} />
                </a>
                <a
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f8f9fa",
                    color: primaryColor,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = primaryColor
                    el.style.color = "white"
                    el.style.transform = "translateY(-3px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = "#f8f9fa"
                    el.style.color = primaryColor
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <FaTiktok size={18} />
                </a>
                <a
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f8f9fa",
                    color: primaryColor,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = primaryColor
                    el.style.color = "white"
                    el.style.transform = "translateY(-3px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = "#f8f9fa"
                    el.style.color = primaryColor
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <FaYoutube size={18} />
                </a>
                <a
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f8f9fa",
                    color: primaryColor,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = primaryColor
                    el.style.color = "white"
                    el.style.transform = "translateY(-3px)"
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = "#f8f9fa"
                    el.style.color = primaryColor
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <SiZalo size={18} />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Partner Section */}
      <div className="py-4 bg-white">
        <Container>
          <div className="text-center">
            <h6 className="fw-bold mb-4" style={{ color: primaryColor }}>
              ĐỐI TÁC CHIẾN LƯỢC
            </h6>
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4">
              <img
                src="https://tromoi.com/frontend/home/images/logo_ohdidi.png"
                alt="ohi.didi"
                height="35"
                className="opacity-75"
              />
              <img
                src="https://tromoi.com/frontend/home/images/logo_phong_kham.png"
                alt="phong kham tot"
                height="35"
                className="opacity-75"
              />
              <img
                src="https://tromoi.com/frontend/home/images/logo_nha_dat.png"
                alt="nha dep dat tot"
                height="35"
                className="opacity-75"
              />
              <img
                src="https://tromoi.com/frontend/home/images/logo_mat_bang.png"
                alt="mat bang moi"
                height="35"
                className="opacity-75"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Copyright Section */}
      <div className="py-4 text-white" style={{ backgroundColor: primaryColor }}>
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="m-0">© 2021 - 2025 TroTot.com - Nền tảng cho thuê trọ hàng đầu Việt Nam</p>
            <div className="d-flex align-items-center mt-2 mt-md-0">
              <small className="me-2">Được phát triển bởi</small>
              <a href="#" className="text-white text-decoration-none">
                <strong>NTN Co.Ltd</strong>
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Scroll to top button */}
      <button
        className="btn position-fixed rounded-circle shadow-lg"
        onClick={scrollToTop}
        style={{
          width: isMobile ? "50px" : "60px",
          height: isMobile ? "50px" : "60px",
          bottom: isMobile ? "90px" : "90px",
          right: isMobile ? "23px" : "23px",
          backgroundColor: primaryColor,
          color: "white",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        aria-label="Scroll to top"
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "scale(1.1)"
          el.style.boxShadow = "0 10px 25px rgba(0, 70, 168, 0.4)"
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = "scale(1)"
          el.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"
        }}
      >
        <FaArrowUp size={isMobile ? 18 : 22} />
      </button>
    </footer>
  )
}

export default Footer
