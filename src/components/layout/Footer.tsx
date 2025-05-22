import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaArrowUp,
  FaApple,
  FaGooglePlay,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-white text-dark pt-5">
      <Container>
        <Row className="mb-5">
          {/* Column 1: Logo and App */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <div className="mb-4">
              <img
                src="https://tromoi.com/logo_mobile.png"
                alt="Trọ Mới"
                className="img-fluid"
                style={{ height: "85px" }}
              />
            </div>
            <p className="mb-4">
              Thành viên của{" "}
              <a href="#" className="text-decoration-none">
                ohi.vn
              </a>
            </p>
            <div className="d-flex mb-3">
              <img
                src="https://tromoi.com/frontend/home/images/logo_ohdidi.png"
                alt="ohi.didi"
                height="30"
                className="me-3"
              />
              <img
                src="	https://tromoi.com/frontend/home/images/logo_phong_kham.png"
                alt="phong kham tot"
                height="30"
                className="me-3"
              />
              <img
                src="https://tromoi.com/frontend/home/images/logo_nha_dat.png"
                alt="nha dep dat tot"
                height="30"
                className="me-3"
              />
              <img
                src="https://tromoi.com/frontend/home/images/logo_mat_bang.png"
                alt="mat bang moi"
                height="30"
              />
            </div>
            <h6 className="text-primary fw-bold mt-4 mb-3">
              TẢI APP TRỌ MỚI HOST NGAY
            </h6>
            <div className="d-flex mb-3">
              <div className="me-3">
                <img
                  src="https://tromoi.com/frontend/landing/app/images/img_qrcode.png"
                  alt="QR Code"
                  style={{ width: "100px" }}
                  className="img-fluid"
                />
              </div>
              <div className="d-flex flex-column">
                <a href="#" className="mb-2">
                  <img
                    src="https://tromoi.com/frontend/landing/app/images/img_download_appstore.png"
                    alt="App Store"
                    style={{ height: "40px" }}
                  />
                </a>
                <a href="#">
                  <img
                    src="https://tromoi.com/frontend/landing/app/images/img_download_googleplay.png"
                    alt="Google Play"
                    style={{ height: "40px" }}
                  />
                </a>
              </div>
            </div>
          </Col>

          {/* Column 2: Information */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-primary fw-bold mb-4">THÔNG TIN</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Điều khoản & Cam kết
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Quy chế hoạt động
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Giải quyết khiếu nại
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 3: System */}
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="text-primary fw-bold mb-4">HỆ THỐNG</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Dành cho chủ trọ
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Bảng phí
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Gói hội viên
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Hướng dẫn
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Hướng dẫn thanh toán VNPAY
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-decoration-none text-dark">
                  Liên hệ
                </a>
              </li>
            </ul>
          </Col>

          {/* Column 4: Contact */}
          <Col lg={3} md={6}>
            <h5 className="text-primary fw-bold mb-4">KẾT NỐI VỚI CHÚNG TÔI</h5>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex align-items-center">
                <FaPhone className="text-primary me-2" />{" "}
                <span>033.266.1579 - 035.866.1579</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <SiZalo className="text-primary me-2" /> <span>0332661579</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaEnvelope className="text-primary me-2" />{" "}
                <span>info@tromoi.com</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaFacebook className="text-primary me-2" />{" "}
                <span>tromoitoanquoc - tromoihue</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaTiktok className="text-primary me-2" />{" "}
                <span>@tromoi.com - @tromoi.hcm</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaYoutube className="text-primary me-2" /> <span>@tromoi</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="text-primary me-2" />{" "}
                <span>VP Huế: 4/16 Đoàn Hữu Trưng, TP. Huế</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="text-primary me-2" />{" "}
                <span>VP HCM: 19 Đường Số 23, Phường 10, Quận 6, TP. HCM</span>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      {/* Copyright Section */}
      <div className="py-3 bg-primary text-white">
        <Container>
          <div className="d-flex justify-content-center align-items-center">
            <p className="m-0">Copyright © 2015 - 2025 OHI Co.Ltd</p>
          </div>
        </Container>
      </div>

      {/* Scroll to top button */}
      <button
        className="btn rounded-circle position-fixed end-0 m-4"
        onClick={scrollToTop}
        style={{ width: "60px", height: "60px", bottom: "80px", right: "10px", backgroundColor: "transparent", "border": "none"}}
        aria-label="Scroll to top"
      >
        <FaArrowUp className="text-primary" size={24}/>
      </button>
    </footer>
  );
};

export default Footer;
