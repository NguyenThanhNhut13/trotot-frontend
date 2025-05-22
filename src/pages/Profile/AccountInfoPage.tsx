import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import Sidebar from "../MainPage/SidebarPersion";
import { toast } from "react-toastify";
import authApi from "../../apis/auth.api";

// Type for Form.Control elements in React-Bootstrap
type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

const AccountInfoPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    accountStatus: true,
  });

  // New state for OTP handling
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentCredentialType, setCurrentCredentialType] = useState<
    "phone" | "email"
  >("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<FormControlElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, accountStatus: e.target.checked });
  };

  const handleOtpChange = (e: React.ChangeEvent<FormControlElement>) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent, type: "phone" | "email") => {
    e.preventDefault();
    setIsSubmitting(true);
    setCurrentCredentialType(type);

    try {
      const value = formData[type];
      if (value.trim() === "") {
        toast.error(
          `Vui lòng nhập ${
            type === "phone" ? "số điện thoại" : "email"
          } trước khi cập nhật`
        );
        return;
      }

      // Call API to update credentials
      const response = await authApi.updateCredentials({ type, value });

      if (response.data.success) {
        setShowOtpModal(true);
        toast.success(`Mã OTP đã được gửi đến ${value}`);
      } else {
        toast.error(
          response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau"
        );
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.updateCredentialsVerify({
        type: currentCredentialType,
        otp,
      });

      if (response.data.success) {
        toast.success("Cập nhật thành công!");
        setShowOtpModal(false);
        setOtp("");
      } else {
        toast.error(
          response.data.message || "Mã OTP không đúng, vui lòng thử lại"
        );
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Có lỗi xảy ra khi xác thực OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
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
          <h2 className="text-primary fw-bold mb-2">THÔNG TIN TÀI KHOẢN</h2>
          <p className="text-muted mb-4">
            Quản lý và cập nhật thông tin tài khoản trên Trọ Mới
          </p>

          <div className="bg-white p-4 rounded shadow-sm mb-5">
            <Form onSubmit={(e) => handleSubmit(e, "phone")}>
              <Form.Group className="mb-4 row align-items-center">
                <Form.Label column sm={3} className="ps-3">
                  Số điện thoại
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    placeholder="Nhập số điện thoại của bạn"
                    onChange={handleInputChange}
                    className="rounded"
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    variant="outline-primary"
                    type="submit"
                    className="rounded w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && currentCredentialType === "phone" ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      "Cập nhật"
                    )}
                  </Button>
                </Col>
              </Form.Group>
            </Form>

            <Form onSubmit={(e) => handleSubmit(e, "email")}>
              <Form.Group className="mb-4 row align-items-center">
                <Form.Label column sm={3} className="ps-3">
                  Email
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Nhập email của bạn"
                    onChange={handleInputChange}
                    className="rounded"
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    variant="outline-primary"
                    type="submit"
                    className="rounded w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && currentCredentialType === "email" ? (
                      <Spinner as="span" animation="border" size="sm" />
                    ) : (
                      "Cập nhật"
                    )}
                  </Button>
                </Col>
              </Form.Group>
            </Form>

            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group className="mb-4 row align-items-center">
                <Form.Label column sm={3} className="ps-3">
                  Mật khẩu
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    readOnly
                    className="rounded"
                  />
                </Col>
                <Col sm={2}>
                  <Button variant="outline-primary" className="rounded w-100">
                    Đổi mật khẩu
                  </Button>
                </Col>
              </Form.Group>
            </Form>

            <Form.Group className="row align-items-center">
              <Form.Label column sm={3} className="ps-3">
                Trạng thái tài khoản
              </Form.Label>
              <Col sm={9}>
                <Form.Check
                  type="checkbox"
                  id="account-status"
                  label="Tài khoản đã xác thực"
                  checked={formData.accountStatus}
                  onChange={handleCheckboxChange}
                  disabled
                />
              </Col>
            </Form.Group>
          </div>

          {/* OTP Verification Modal */}
          <Modal show={showOtpModal} onHide={handleCloseOtpModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Xác thực OTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Vui lòng nhập mã OTP đã được gửi đến{" "}
                {currentCredentialType === "phone" ? "số điện thoại" : "email"}{" "}
                của bạn
              </p>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseOtpModal}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Add space at the bottom */}
          <div style={{ height: "200px" }}></div>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountInfoPage;
