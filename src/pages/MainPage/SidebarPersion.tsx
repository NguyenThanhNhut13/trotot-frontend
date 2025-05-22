import React, { useEffect } from "react";
import { Container, Col, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  FaUser,
  FaIdCard,
  FaHeart,
  FaBell,
  FaCommentAlt,
} from "react-icons/fa";

const SidebarPersion = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }); // rooms là danh sách được set lại

  return (
    <Container fluid className="p-0">
      <Col className="bg-white p-2 shadow-sm">
        <Nav className="flex-column">
          <Nav.Link
            as={Link}
            to="/personal-info"
            className={`d-flex align-items-center py-3 ${
              currentPath === "/personal-info"
                ? "text-primary fw-bold"
                : "text-dark"
            }`}
          >
            <div
              className={`rounded-circle p-2 me-3 ${
                currentPath === "/personal-info"
                  ? "bg-primary text-white"
                  : "bg-light text-primary"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUser />
            </div>
            Thông tin cá nhân
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/account-info"
            className={`d-flex align-items-center py-3 ${
              currentPath === "/account-info"
                ? "text-primary fw-bold"
                : "text-dark"
            }`}
          >
            <div
              className={`rounded-circle p-2 me-3 ${
                currentPath === "/account-info"
                  ? "bg-primary text-white"
                  : "bg-light text-primary"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaIdCard />
            </div>
            Thông tin tài khoản
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/favorites"
            className={`d-flex align-items-center py-3 ${
              currentPath === "/favorites"
                ? "text-primary fw-bold"
                : "text-dark"
            }`}
          >
            <div
              className={`rounded-circle p-2 me-3 ${
                currentPath === "/favorites"
                  ? "bg-primary text-white"
                  : "bg-light text-primary"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaHeart />
            </div>
            Trọ đã lưu
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/notifications"
            className={`d-flex align-items-center py-3 ${
              currentPath === "/notifications"
                ? "text-primary fw-bold"
                : "text-dark"
            }`}
          >
            <div
              className={`rounded-circle p-2 me-3 ${
                currentPath === "/notifications"
                  ? "bg-primary text-white"
                  : "bg-light text-primary"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaBell />
            </div>
            Thông báo
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/reviews"
            className={`d-flex align-items-center py-3 ${
              currentPath === "/reviews" ? "text-primary fw-bold" : "text-dark"
            }`}
          >
            <div
              className={`rounded-circle p-2 me-3 ${
                currentPath === "/reviews"
                  ? "bg-primary text-white"
                  : "bg-light text-primary"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCommentAlt />
            </div>
            Quản lý đánh giá trọ
          </Nav.Link>
        </Nav>
      </Col>
      {/* Empty space at the bottom */}
      <div style={{ height: "400px" }}></div>
    </Container>
  );
};

export default SidebarPersion;
