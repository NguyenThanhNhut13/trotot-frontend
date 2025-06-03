"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Row, Col, Form, Button, Modal, Spinner, Card } from "react-bootstrap"
import { toast } from "react-toastify"
import { FaLock, FaPhone, FaEnvelope, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"
import authApi from "../../apis/auth.api"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"
import { useResponsive } from "../../store/hook"

// Type for Form.Control elements in React-Bootstrap
type FormControlElement = HTMLInputElement | HTMLTextAreaElement

const AccountInfoPage = () => {
  const { isMobile, isTablet } = useResponsive()
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    accountStatus: true,
  })

  // New state for OTP handling
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [currentCredentialType, setCurrentCredentialType] = useState<"phone" | "email">("phone")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Mock data - replace with actual API call
        setFormData({
          phone: "+84 123 456 789",
          email: "user@example.com",
          password: "••••••••",
          accountStatus: true,
        })
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Không thể tải thông tin tài khoản")
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<FormControlElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<FormControlElement>) => {
    const { name, value } = e.target
    setPasswordData({ ...passwordData, [name]: value })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, accountStatus: e.target.checked })
  }

  const handleOtpChange = (e: React.ChangeEvent<FormControlElement>) => {
    setOtp(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent, type: "phone" | "email") => {
    e.preventDefault()
    setIsSubmitting(true)
    setCurrentCredentialType(type)

    try {
      const value = formData[type]
      if (value.trim() === "") {
        toast.error(`Vui lòng nhập ${type === "phone" ? "số điện thoại" : "email"} trước khi cập nhật`)
        return
      }

      // Call API to update credentials
      const response = await authApi.updateCredentials({ type, value })

      if (response.data.success) {
        setShowOtpModal(true)
        toast.success(`Mã OTP đã được gửi đến ${value}`)
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau")
      }
    } catch (error) {
      console.error("Error updating credentials:", error)
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Vui lòng nhập mã OTP")
      return
    }

    setIsVerifying(true)
    try {
      const response = await authApi.updateCredentialsVerify({
        type: currentCredentialType,
        otp,
      })

      if (response.data.success) {
        toast.success("Cập nhật thành công!")
        setShowOtpModal(false)
        setOtp("")
      } else {
        toast.error(response.data.message || "Mã OTP không đúng, vui lòng thử lại")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("Có lỗi xảy ra khi xác thực OTP")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự")
      return
    }

    setIsSubmitting(true)
    
    // try {
    //   // Call API to change password
    //   const response = await authApi.updatePassword({
    //     currentPassword,
    //     newPassword,
    //   })

    //   if (response.data.success) {
    //     toast.success("Đổi mật khẩu thành công!")
    //     setShowPasswordModal(false)
    //     setPasswordData({
    //       currentPassword: "",
    //       newPassword: "",
    //       confirmPassword: "",
    //     })
    //   } else {
    //     toast.error(response.data.message || "Có lỗi xảy ra, vui lòng thử lại sau")
    //   }
    // } catch (error) {
    //   console.error("Error changing password:", error)
    //   toast.error("Có lỗi xảy ra, vui lòng thử lại sau")
    // } finally {
    //   setIsSubmitting(false)
    // }
  }

  const handleCloseOtpModal = () => {
    setShowOtpModal(false)
    setOtp("")
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <SidebarPersonLayout>
      <div className="px-3">
        <h2 className="fw-bold mb-2" style={{ color: "#0046a8", fontSize: isMobile ? "1.5rem" : "1.75rem" }}>
          THÔNG TIN TÀI KHOẢN
        </h2>
        <p className="text-muted mb-4">Quản lý và cập nhật thông tin tài khoản trên Trọ Mới</p>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-4">
            {/* Phone Number */}
            <Form onSubmit={(e) => handleSubmit(e, "phone")} className="mb-4">
              <Form.Group as={Row} className="align-items-center mb-4">
                <Form.Label column xs={12} md={3} className="fw-medium">
                  <div className="d-flex align-items-center gap-2">
                    <FaPhone style={{ color: "#0046a8" }} />
                    <span>Số điện thoại</span>
                  </div>
                </Form.Label>
                <Col xs={12} md={7} className="mt-2 mt-md-0">
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    placeholder="Nhập số điện thoại của bạn"
                    onChange={handleInputChange}
                    className="rounded-3 border-secondary-subtle"
                  />
                </Col>
                <Col xs={12} md={2} className="mt-3 mt-md-0">
                  <Button
                    variant="outline-primary"
                    type="submit"
                    className="rounded-3 w-100"
                    disabled={isSubmitting}
                    style={{ borderColor: "#0046a8", color: "#0046a8" }}
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

            {/* Email */}
            <Form onSubmit={(e) => handleSubmit(e, "email")} className="mb-4">
              <Form.Group as={Row} className="align-items-center mb-4">
                <Form.Label column xs={12} md={3} className="fw-medium">
                  <div className="d-flex align-items-center gap-2">
                    <FaEnvelope style={{ color: "#0046a8" }} />
                    <span>Email</span>
                  </div>
                </Form.Label>
                <Col xs={12} md={7} className="mt-2 mt-md-0">
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Nhập email của bạn"
                    onChange={handleInputChange}
                    className="rounded-3 border-secondary-subtle"
                  />
                </Col>
                <Col xs={12} md={2} className="mt-3 mt-md-0">
                  <Button
                    variant="outline-primary"
                    type="submit"
                    className="rounded-3 w-100"
                    disabled={isSubmitting}
                    style={{ borderColor: "#0046a8", color: "#0046a8" }}
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

            {/* Password */}
            <Form.Group as={Row} className="align-items-center mb-4">
              <Form.Label column xs={12} md={3} className="fw-medium">
                <div className="d-flex align-items-center gap-2">
                  <FaLock style={{ color: "#0046a8" }} />
                  <span>Mật khẩu</span>
                </div>
              </Form.Label>
              <Col xs={12} md={7} className="mt-2 mt-md-0">
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  readOnly
                  className="rounded-3 border-secondary-subtle"
                />
              </Col>
              <Col xs={12} md={2} className="mt-3 mt-md-0">
                <Button
                  variant="outline-primary"
                  className="rounded-3 w-100"
                  onClick={() => setShowPasswordModal(true)}
                  style={{ borderColor: "#0046a8", color: "#0046a8" }}
                >
                  Đổi mật khẩu
                </Button>
              </Col>
            </Form.Group>

            {/* Account Status */}
            <Form.Group as={Row} className="align-items-center">
              <Form.Label column xs={12} md={3} className="fw-medium">
                Trạng thái tài khoản
              </Form.Label>
              <Col xs={12} md={9} className="mt-2 mt-md-0">
                <div className="d-flex align-items-center gap-2">
                  {formData.accountStatus ? (
                    <>
                      <FaCheckCircle className="text-success" />
                      <span className="text-success fw-medium">Tài khoản đã xác thực</span>
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="text-warning" />
                      <span className="text-warning fw-medium">Tài khoản chưa xác thực</span>
                    </>
                  )}
                </div>
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* OTP Verification Modal */}
        <Modal show={showOtpModal} onHide={handleCloseOtpModal} centered>
          <Modal.Header closeButton style={{ background: "#f8f9fa" }}>
            <Modal.Title style={{ color: "#0046a8" }}>Xác thực OTP</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-4">
              Vui lòng nhập mã OTP đã được gửi đến{" "}
              <span className="fw-medium">{currentCredentialType === "phone" ? "số điện thoại" : "email"} của bạn</span>
            </p>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                className="form-control-lg text-center"
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
              style={{ background: "#0046a8", borderColor: "#0046a8" }}
            >
              {isVerifying ? <Spinner as="span" animation="border" size="sm" /> : "Xác nhận"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Password Change Modal */}
        <Modal show={showPasswordModal} onHide={handleClosePasswordModal} centered>
          <Modal.Header closeButton style={{ background: "#f8f9fa" }}>
            <Modal.Title style={{ color: "#0046a8" }}>Đổi mật khẩu</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePasswordModal}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={isSubmitting}
              style={{ background: "#0046a8", borderColor: "#0046a8" }}
            >
              {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : "Xác nhận"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </SidebarPersonLayout>
  )
}

export default AccountInfoPage
