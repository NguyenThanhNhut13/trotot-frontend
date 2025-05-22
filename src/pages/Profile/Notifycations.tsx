import React, { useState } from "react";
import { Container, Row, Col, Nav, Button } from "react-bootstrap";
import Sidebar from "../MainPage/SidebarPersion";
import "./Notifications.css";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("all");

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="p-0 min-vh-100">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={9} className="py-4 px-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-primary fw-bold mb-0">THÔNG BÁO</h2>
              <p className="text-muted mb-0">Cập nhật thông báo trên Trọ Mới</p>
            </div>
            <Button
              variant="link"
              className="text-primary text-decoration-none fw-bold"
            >
              Đánh dấu đã đọc tất cả
            </Button>
          </div>

          <div className="notification-tabs">
            <Nav variant="tabs" className="border-bottom-0">
              <Nav.Item>
                <Nav.Link
                  className={activeTab === "all" ? "active" : ""}
                  onClick={() => handleTabSelect("all")}
                >
                  Tất cả
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === "activity" ? "active" : ""}
                  onClick={() => handleTabSelect("activity")}
                >
                  Hoạt động Trọ
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === "transaction" ? "active" : ""}
                  onClick={() => handleTabSelect("transaction")}
                >
                  Giao dịch
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === "promotion" ? "active" : ""}
                  onClick={() => handleTabSelect("promotion")}
                >
                  Khuyến mãi
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  className={activeTab === "account" ? "active" : ""}
                  onClick={() => handleTabSelect("account")}
                >
                  Tài khoản
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="notification-content bg-white p-0 mt-2">
            <div className="empty-notifications text-center py-5">
              <img
                src="/images/empty-notification.svg"
                alt="No notifications"
                className="empty-notification-image mb-4"
                style={{ maxWidth: "250px" }}
              />
              <h5 className="text-muted mb-2">
                Hiện tại, bạn chưa có thông báo nào.
              </h5>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
