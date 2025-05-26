import React, { useState } from "react";
import { Modal, Button as BsButton, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

import authApi from "../../apis/auth.api";
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
import { useMutation } from "@tanstack/react-query";
import { saveRoom } from "../../store/slices/roomListingsSlice";


type FormData = Pick<LoginSchema, "credential" | "password">;
const loginSchemaPick = loginSchema.pick(["credential", "password"]);

interface LoginModalProps {
  show: boolean;
  handleClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, handleClose }) => {
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registerCredential, setRegisterCredential] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(loginSchemaPick),
  });

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.login(body),
  });



  // Update the submit handler to use Redux
  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);

    const requestBody = {
      credential: data.credential,
      password: data.password,
    };
    
    try {
      // Your existing login logic
      await dispatch(login(requestBody)).unwrap();
      await dispatch(getProfile()).unwrap();
      
      // Check for pending save room action
      const pendingAction = localStorage.getItem("pendingAction");
      const pendingRoomId = localStorage.getItem("pendingRoomId");
      
      if (pendingAction === "save-room" && pendingRoomId) {
        try {
          // Use the saveRoom action from Redux
          await dispatch(saveRoom(parseInt(pendingRoomId))).unwrap();
          toast.success("Đã đăng nhập và lưu phòng thành công");
        } catch (saveError) {
          console.error("Error saving room after login:", saveError);
        }
        
        // Clear pending action
        localStorage.removeItem("pendingAction");
        localStorage.removeItem("pendingRoomId");
      }
      
      handleClose();
      
    } catch (error) {
      // Your existing error handling
    } finally {
      setIsLoading(false);
    }
  });

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
