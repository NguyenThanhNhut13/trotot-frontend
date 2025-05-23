import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// import omit from "lodash/omit";

import { schema, Schema } from "../../utils/rules";
import { ErrorResponse } from "../../types/utils.type";
import authApi from "../../apis/auth.api";
import { isAxiosUnprocessableEntityError } from "../../utils/utils";
import OTPModal from "./OTPModal";

import { useAppDispatch } from "../../store/hook";
// import { login } from "../../store/slices/authSlice";
// import { getProfile } from "../../store/slices/userSlice";

type RegisterModalProps = {
  show: boolean;
  handleClose: () => void;
};

/// Define the form data type based on the schema

type FormData = Pick<
  Schema,
  "credential" | "fullName" | "password" | "confirmPassword"
>;
const registerSchema = schema.pick([
  "credential",
  "fullName",
  "password",
  "confirmPassword",
]);

const RegisterModal: React.FC<RegisterModalProps> = ({ show, handleClose }) => {
  //  const dispatch = useAppDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentCredential, setCurrentCredential] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema),
  });

  const registerAccountMutation = useMutation({
    mutationFn: (body: FormData) => authApi.registerAccount(body),
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    registerAccountMutation.mutate(data, {
      onSuccess: (_, variables) => {
        console.log("✅ Mutation success, variables:", variables);
        setCurrentCredential(variables.credential); //Dung cho xac thuc OTP
        setShowOtpModal(true);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Register error:", error);
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.data;
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: "Server",
              });
            });
          }
        }
        setIsLoading(false);
      },
    });
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <Modal show={show && !showOtpModal} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <div className="w-100 text-center">
            <Modal.Title className="fw-bold">Đăng ký tài khoản mới</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={onSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Họ và Tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập vào Họ và Tên"
                {...register("fullName")}
                isInvalid={!!errors.fullName}
                className="py-2 bg-light"
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email / Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập vào Email hoặc Số điện thoại"
                {...register("credential")}
                isInvalid={!!errors.credential}
                className="py-2 bg-light"
              />
              <Form.Control.Feedback type="invalid">
                {errors.credential?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 position-relative">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Nhập vào mật khẩu"
                {...register("password")}
                isInvalid={!!errors.password}
                className="py-2 bg-light"
              />
              <div
                className="position-absolute end-0 top-50 translate-middle-y pe-3"
                style={{ cursor: "pointer", marginTop: "11px" }}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4 position-relative">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập vào mật khẩu"
                {...register("confirmPassword")}
                isInvalid={!!errors.confirmPassword}
                className="py-2 bg-light"
              />
              <div
                className="position-absolute end-0 top-50 translate-middle-y pe-3"
                style={{ cursor: "pointer", marginTop: "11px" }}
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              className="w-100 py-2 mb-3"
              disabled={isLoading}
              style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </Form>

          <div className="text-center" style={{ fontSize: "0.9rem" }}>
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <button 
              type="button"
              onClick={() => window.open('/terms', '_blank')}
              style={{ color: "#0046a8", textDecoration: "none", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Điều khoản & Cam kết
            </button>
            của Trợ Mới và xác nhận rằng bạn đã đọc{" "}
            <button 
              type="button"
              onClick={() => window.open('/terms', '_blank')}
              style={{ color: "#0046a8", textDecoration: "none", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Chính sách bảo mật
            </button>
            của chúng tôi.
          </div>
        </Modal.Body>
      </Modal>
      <OTPModal
        show={showOtpModal}
        handleClose={() => {
          setShowOtpModal(false);
          handleClose();
        }}
        credential={currentCredential}
      />
    </>
  );
};

export default RegisterModal;
