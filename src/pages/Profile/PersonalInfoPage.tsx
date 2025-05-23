import React, { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Form, Button, Modal } from "react-bootstrap";
import Sidebar from "../MainPage/SidebarPersion";
import userApi from "../../apis/user.api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { isAxiosUnprocessableEntityError } from "../../utils/utils";
import { toast } from "react-toastify";
import { userSchema, UserSchema } from "../../utils/rules";
import { useAppSelector, useAppDispatch } from '../../store/hook';
import { updateProfile } from '../../store/slices/userSlice';

// Use the existing user schema for validation
type FormData = Pick<
  UserSchema,
  "fullName" | "gender" | "dob" | "cccd" | "address"
>;
const userSchemaP = userSchema.pick([
  "fullName",
  "gender",
  "dob",
  "cccd",
  "address",
]);

const PersonalInfoPage = () => {
   const { profile } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(userSchemaP),
    defaultValues: {
      fullName: "",
      gender: "",
      dob: "",
      cccd: "",
      address: "",
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("fullName", profile.fullName || "");
      setValue("gender", profile.gender || "");
      setValue("dob", formatDateForInput(profile.dob) || "");
      setValue("cccd", profile.cccd || "");
      setValue("address", profile.address || "");
    }
  }, [profile, setValue]);

  const updateProfileContext = async () => {
    await userApi.getProfile();
  };

  const updateProfileMutation = useMutation({
    mutationFn: (body: FormData) => userApi.updateProfile(body),
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);

    const formattedData = {
      ...data,
      dob: data.dob ? `${data.dob}T00:00:00` : "",
    };

    updateProfileMutation.mutate(formattedData, {
      onSuccess: () => {
        setShowSuccessModal(true);
        updateProfileContext();
        setIsLoading(false);
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError(error)) {
          const responseData = error.response?.data as {
            errors?: Record<string, string>;
          };
          const formError = responseData?.errors;
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key],
                type: "Server",
              });
              toast.error(formError[key]);
            });
          }
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật thông tin");
        }
        setIsLoading(false);
      },
    });
  });

  // Function to close the modal
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="p-0 min-vh-100">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={9} className="p-4 px-5">
          <h2 className="text-primary fw-bold mb-2">THÔNG TIN CÁ NHÂN</h2>
          <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
            Cập nhật thông tin cá nhân của bạn để tìm kiếm các thông tin phù hợp
            nhất.
          </p>
          <Form
            onSubmit={onSubmit}
            noValidate
            className="bg-white p-4 rounded shadow-sm"
            style={{ maxWidth: "600px" }}
          >
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                Họ tên
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ tên của bạn"
                className="rounded"
                style={{ fontSize: "0.9rem", padding: "0.75rem" }}
                isInvalid={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <Form.Control.Feedback type="invalid">
                  {errors.fullName.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                Giới tính
              </Form.Label>
              <Form.Select
                className="rounded"
                style={{ fontSize: "0.9rem", padding: "0.75rem" }}
                isInvalid={!!errors.gender}
                {...register("gender")}
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </Form.Select>
              {errors.gender && (
                <Form.Control.Feedback type="invalid">
                  {errors.gender.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                Ngày sinh
              </Form.Label>
              <Form.Control
                type="date"
                placeholder="dd/mm/yyyy"
                className="rounded"
                style={{ fontSize: "0.9rem", padding: "0.75rem" }}
                isInvalid={!!errors.dob}
                {...register("dob")}
              />
              {errors.dob && (
                <Form.Control.Feedback type="invalid">
                  {errors.dob.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                CCCD
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập CCCD của bạn"
                className="rounded"
                style={{ fontSize: "0.9rem", padding: "0.75rem" }}
                isInvalid={!!errors.cccd}
                {...register("cccd")}
              />
              {errors.cccd && (
                <Form.Control.Feedback type="invalid">
                  {errors.cccd.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium" style={{ fontSize: "0.9rem" }}>
                Địa chỉ
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập địa chỉ của bạn"
                className="rounded"
                style={{ fontSize: "0.9rem", padding: "0.75rem" }}
                isInvalid={!!errors.address}
                {...register("address")}
              />
              {errors.address && (
                <Form.Control.Feedback type="invalid">
                  {errors.address.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="rounded px-4 py-2"
              style={{
                fontSize: "0.9rem",
                backgroundColor: "#007bff",
                borderColor: "#007bff",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </Form>

          {/* Success Modal */}
          <Modal
            show={showSuccessModal}
            onHide={handleCloseModal}
            centered
            size="sm"
          >
            <Modal.Body className="text-center py-4">
              <div className="mb-3">
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(144, 238, 144, 0.2)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      color: "lightgreen",
                      fontSize: "40px",
                    }}
                  >
                    ✓
                  </div>
                </div>
              </div>
              <h5 className="fw-bold">Thành công</h5>
              <p className="text-muted mb-4">Cập nhật thông tin thành công</p>
              <Button
                variant="primary"
                onClick={handleCloseModal}
                className="px-4"
              >
                Đóng
              </Button>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default PersonalInfoPage;
