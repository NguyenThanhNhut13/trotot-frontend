"use client";

import React, { useState } from "react";
import { Modal, Button as BsButton, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authApi from "../../apis/auth.api";
import { isAxiosUnprocessableEntityError } from "../../utils/utils";
import { ErrorResponse } from "../../types/utils.type";
import OTPModal from "../Register/OTPModal"; // Import OTPModal

// Định nghĩa schema cho từng bước
const credentialSchema = yup.object({
  credential: yup.string().required("Email hoặc số điện thoại là bắt buộc"),
});

const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("Mật khẩu mới là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp"),
});

type CredentialFormData = { credential: string };
type ResetPasswordFormData = { newPassword: string; confirmPassword: string };

interface ChangePasswordModalProps {
  show: boolean;
  handleClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  show,
  handleClose,
}) => {
  const [step, setStep] = useState<"credential" | "otp" | "reset">(
    "credential"
  );
  const [credential, setCredential] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false); // State để điều khiển OTPModal

  // Form cho bước nhập email/số điện thoại
  const {
    register: registerCredential,
    handleSubmit: handleSubmitCredential,
    formState: { errors: credentialErrors },
  } = useForm<CredentialFormData>({
    resolver: yupResolver(credentialSchema),
  });

  // Form cho bước nhập mật khẩu mới
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setError: setResetError,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  // Bước 1: Gửi yêu cầu OTP
  const onSubmitCredential = handleSubmitCredential(async (data) => {
    setIsLoading(true);
    try {
      await authApi.forgotPasswordRequest(data.credential); // Sử dụng credential làm path parameter
      setCredential(data.credential);
      setStep("otp");
      setShowOTPModal(true); // Mở OTPModal
    } catch (error) {
      console.error("Failed to send OTP request:", error);
    } finally {
      setIsLoading(false);
    }
  });

  // Callback khi OTPModal xác minh thành công
 const handleOtpVerifySuccess = (token: string) => {
  setToken(token)
  setShowOTPModal(false)
  setStep("reset")
}

  // Bước 3: Reset mật khẩu
  const onSubmitReset = handleSubmitReset(async (data) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      handleClose(); // Đóng modal sau khi thành công
    } catch (error) {
      if (
        isAxiosUnprocessableEntityError<ErrorResponse<ResetPasswordFormData>>(
          error
        )
      ) {
        const formError = error.response?.data.data;
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setResetError(key as keyof ResetPasswordFormData, {
              message: formError[key as keyof ResetPasswordFormData],
              type: "Server",
            });
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-none">Thay Đổi Mật Khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-0 pb-4">
          <div className="text-center mb-4">
            <img
              src="https://tromoi.com/favicon.png"
              alt="Trợ Mới Logo"
              style={{ width: "80px", height: "80px" }}
              className="mb-3"
            />
            <h4 className="fw-bold mb-4">Thay Đổi Mật Khẩu</h4>
          </div>

          {/* Bước 1: Nhập email/số điện thoại */}
          {step === "credential" && (
            <Form noValidate onSubmit={onSubmitCredential}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  {...registerCredential("credential")}
                  isInvalid={!!credentialErrors.credential}
                  placeholder="Email hoặc Số điện thoại"
                  className="py-3 bg-light"
                />
                <Form.Control.Feedback type="invalid">
                  {credentialErrors.credential?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <BsButton
                variant="primary"
                className="w-100 py-3"
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#ff5500", borderColor: "#ff5500" }}
              >
                {isLoading ? "Đang gửi OTP..." : "Gửi OTP"}
              </BsButton>
            </Form>
          )}

          {/* Bước 3: Nhập mật khẩu mới */}
          {step === "reset" && (
            <Form noValidate onSubmit={onSubmitReset}>
              <Form.Group className="mb-3 position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  {...registerReset("newPassword")}
                  isInvalid={!!resetErrors.newPassword}
                  placeholder="Mật khẩu mới"
                  className="py-3 bg-light"
                />
                <div
                  className="position-absolute end-0 top-50 translate-middle-y pe-3"
                  style={{ cursor: "pointer" }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                <Form.Control.Feedback type="invalid">
                  {resetErrors.newPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  {...registerReset("confirmPassword")}
                  isInvalid={!!resetErrors.confirmPassword}
                  placeholder="Xác nhận mật khẩu mới"
                  className="py-3 bg-light"
                />
                <div
                  className="position-absolute end-0 top-50 translate-middle-y pe-3"
                  style={{ cursor: "pointer" }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
                <Form.Control.Feedback type="invalid">
                  {resetErrors.confirmPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <BsButton
                variant="primary"
                className="w-100 py-3"
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: "#ff5500", borderColor: "#ff5500" }}
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </BsButton>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Tích hợp OTPModal trong bước otp */}
      {step === "otp" && (
  <OTPModal
    show={showOTPModal}
    handleClose={() => setShowOTPModal(false)}
    credential={credential}
    onVerifySuccess={handleOtpVerifySuccess} // Pass the callback
  />
)}
    </>
  );
};

export default ChangePasswordModal;
