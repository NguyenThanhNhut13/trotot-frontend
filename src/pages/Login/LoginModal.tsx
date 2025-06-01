import React, { useState } from "react";
import { Modal, Button as BsButton, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

import { loginSchema, LoginSchema } from "../../utils/rules";
import { ErrorResponse } from "../../types/utils.type";
import { isAxiosUnprocessableEntityError } from "../../utils/utils";
import ChangePasswordModal from "./ChangePasswordModal";
import RegisterModal from "../Register/RegisterModal";
import OTPModal from "../Register/OTPModal";
// Import Redux hooks and actions
import { useAppDispatch } from '../../store/hook';
import { login } from '../../store/slices/authSlice';
import { getProfile } from '../../store/slices/userSlice';
import { useLocation, useNavigate } from "react-router-dom";


type FormData = Pick<LoginSchema, "credential" | "password">;
const loginSchemaPick = loginSchema.pick(["credential", "password"]);

interface LoginModalProps {
  show: boolean;
  handleClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, handleClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registerCredential, setRegisterCredential] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchemaPick),
  });

  // Update the submit handler to use Redux
  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setLoginError(null);

    const requestBody = {
      credential: data.credential,
      password: data.password,
    };
    
    try {
      // Your existing login logic
      await dispatch(login(requestBody)).unwrap();

      // Thêm delay nhỏ để đảm bảo token được lưu trước khi gọi API tiếp theo
      setTimeout(async () => {
        try {
          await dispatch(getProfile()).unwrap();
          console.log("Profile loaded successfully");
        } catch (profileError: any) {
          // Ghi log chi tiết lỗi để debug
          console.error("Chi tiết lỗi khi tải profile:", profileError);
        }
      }, 300);

      toast.success("Đăng nhập thành công");
      handleClose();

      const from = location.state?.from || '/';
      navigate(from, { replace: true });
      
    } catch (error: any) {
      // Handle specific validation errors
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
        const formError = error.response?.data.data;
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormData, {
              message: formError[key as keyof FormData],
              type: 'server'
            });
          });
        }
      } 
      setLoginError(getVietnameseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  });

  const getVietnameseErrorMessage = (error: any): string => {
    // Kiểm tra lỗi từ response
    const errorCode = error.response?.data?.code;
    const statusCode = error.response?.status;

    // Ánh xạ mã lỗi hoặc status code sang thông báo tiếng Việt
    if (errorCode === "USER_NOT_FOUND" || (statusCode === 404 && error.response?.data?.message?.includes("User not found"))) {
      return "Tài khoản không tồn tại. Vui lòng kiểm tra lại thông tin đăng nhập.";
    }
    
    if (errorCode === "INVALID_PASSWORD" || statusCode === 401) {
      return "Mật khẩu không chính xác. Vui lòng thử lại.";
    }
    
    if (statusCode === 403) {
      return "Tài khoản của bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.";
    }

    if (statusCode === 400) {
      return "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại.";
    }

    if (statusCode === 429) {
      return "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.";
    }

    // Trả về thông báo mặc định nếu không có ánh xạ cụ thể
    return "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterSuccess = (credential: string) => {
    setRegisterCredential(credential);
    setShowRegister(false);
    setShowOTP(true);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-none">
            Chào mừng bạn đến với Trọ Mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-0 pb-4">
          <div className="text-center mb-4">
            <img
              src="https://tromoi.com/favicon.png"
              alt="Trợ Mới Logo"
              style={{ width: "80px", height: "80px" }}
              className="mb-3"
            />
            <h4 className="fw-bold mb-4">Chào mừng bạn đến với Trọ Mới</h4>
          </div>

          <Form noValidate onSubmit={onSubmit}> 
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                {...register("credential")}
                isInvalid={!!errors.credential}
                placeholder="Email hoặc Số điện thoại"
                className="py-3 bg-light"
              />
              <Form.Control.Feedback type="invalid">
                {errors.credential?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                {...register("password")}
                isInvalid={!!errors.password}
                placeholder="Mật khẩu"
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
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Display error message if present */}
            {loginError && (
              <div className="text-danger mb-3">
                {loginError}
              </div>
            )}

            <div className="text-end mb-3">
              <button
                type="button"
                className="text-decoration-none"
                style={{
                  color: "#0066cc",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                onClick={() => setShowChangePassword(true)}
              >
                Quên mật khẩu?
              </button>
            </div>

            <BsButton
              variant="primary"
              id="btn-login"
              className="w-100 py-3"
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: "#ff5500", borderColor: "#ff5500" }}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </BsButton>
          </Form>

          <div className="text-center mt-3 mb-3">
            <span>Chưa có tài khoản? </span>
            <button
              type="button"
              className="text-decoration-none fw-semibold border-0 bg-transparent p-0"
              style={{ color: "#0066cc" }}
              onClick={() => {
                handleClose(); // Đóng LoginModal
                setShowRegister(true); // Mở RegisterModal
              }}
            >
              Đăng ký ngay
            </button>
          </div>

          <div className="d-flex align-items-center my-3">
            <div className="flex-grow-1 border-bottom"></div>
            <div className="px-3 text-secondary">Hoặc đăng nhập bằng</div>
            <div className="flex-grow-1 border-bottom"></div>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-3">
            <div
              className="d-flex justify-content-center align-items-center rounded-circle"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#dc3545",
                cursor: "pointer",
              }}
            >
              <FaGoogle color="white" />
            </div>
            <div
              className="d-flex justify-content-center align-items-center rounded-circle"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#1877f2",
                cursor: "pointer",
              }}
            >
              <FaFacebook color="white" />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ChangePasswordModal
        show={showChangePassword}
        handleClose={() => setShowChangePassword(false)}
      />

      <RegisterModal
        show={showRegister}
        handleClose={() => setShowRegister(false)}
      />

      <OTPModal
        show={showOTP}
        handleClose={() => setShowOTP(false)}
        credential={registerCredential}
      />
    </>
  );
};

export default LoginModal;
