import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Sidebar from "../MainPage/SidebarPerson";
import { FaPencilAlt } from "react-icons/fa";
import "./ReviewRoom.css";

export default function ReviewRoom() {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="p-0 min-vh-100">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={9} className="py-4 px-5">
          <h2 className="text-primary fw-bold mb-2">QUẢN LÝ ĐÁNH GIÁ TRỌ</h2>
          <p className="text-muted mb-4">
            Quản lý đánh giá trọ của bạn trên Trọ Mới
          </p>

          <div className="empty-reviews-container text-center py-5">
            <img
              src="/images/empty-review.svg"
              alt="No reviews"
              className="empty-review-image mb-4"
              style={{ maxWidth: "300px" }}
            />
            <h4 className="fw-bold mb-2">Bạn chưa viết đánh giá nào</h4>
            <p className="text-muted mb-4">
              Hãy chia sẻ trải nghiệm của bạn bằng cách viết đánh giá đầu tiên.
            </p>
            <Button
              variant="primary"
              className="px-4 py-2 d-inline-flex align-items-center"
            >
              <FaPencilAlt className="me-2" />
              Viết đánh giá
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
