"use client"
import { useState, useEffect } from "react"
import { Row, Col, Form, Button, Modal, Spinner, Card } from "react-bootstrap"
import { FaUser, FaCalendarAlt, FaIdCard, FaMapMarkerAlt, FaVenusMars, FaCheckCircle } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation } from "@tanstack/react-query"
import { toast } from "react-toastify"
import userApi from "../../apis/user.api"
import { isAxiosUnprocessableEntityError } from "../../utils/utils"
import { userSchema, type UserSchema } from "../../utils/rules"
import { useAppSelector, useAppDispatch, useResponsive } from "../../store/hook"
import { SidebarPersonLayout } from "../MainPage/SidebarPerson"

// Use the existing user schema for validation
type FormData = Pick<UserSchema, "fullName" | "gender" | "dob" | "cccd" | "address">
const userSchemaP = userSchema.pick(["fullName", "gender", "dob", "cccd", "address"])

const PersonalInfoPage = () => {
  const { isMobile, isTablet } = useResponsive()
  const { profile } = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return ""
    return dateString.split("T")[0]
  }

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
  })

  useEffect(() => {
    if (profile) {
      setValue("fullName", profile.fullName || "")
      setValue("gender", profile.gender || "")
      setValue("dob", formatDateForInput(profile.dob) || "")
      setValue("cccd", profile.cccd || "")
      setValue("address", profile.address || "")
    }
  }, [profile, setValue])

  const updateProfileContext = async () => {
    await userApi.getProfile()
  }

  const updateProfileMutation = useMutation({
    mutationFn: (body: FormData) => userApi.updateProfile(body),
  })

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true)

    const formattedData = {
      ...data,
      dob: data.dob ? `${data.dob}T00:00:00` : "",
    }

    updateProfileMutation.mutate(formattedData, {
      onSuccess: () => {
        setShowSuccessModal(true)
        updateProfileContext()
        setIsLoading(false)
        toast.success("Cập nhật thông tin thành công!")
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError(error)) {
          const responseData = error.response?.data as {
            errors?: Record<string, string>
          }
          const formError = responseData?.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key],
                type: "Server",
              })
              toast.error(formError[key])
            })
          }
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật thông tin")
        }
        setIsLoading(false)
      },
    })
  })

  const handleCloseModal = () => {
    setShowSuccessModal(false)
  }

  return (
    <SidebarPersonLayout>
      <div className="py-3 py-md-4">
        <h2 className="fw-bold mb-2" style={{ color: "#0046a8", fontSize: isMobile ? "1.5rem" : "1.75rem" }}>
          THÔNG TIN CÁ NHÂN
        </h2>
        <p className="text-muted mb-4" style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
          Cập nhật thông tin cá nhân của bạn để tìm kiếm các thông tin phù hợp nhất.
        </p>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Card.Body className="p-4">
            <Form onSubmit={onSubmit} noValidate>
              <Row className="g-4">
                {/* Full Name */}
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium d-flex align-items-center gap-2 mb-2">
                      <FaUser style={{ color: "#0046a8" }} />
                      <span>Họ tên</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập họ tên của bạn"
                      className="rounded-3 border-secondary-subtle"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        padding: isMobile ? "0.6rem" : "0.75rem",
                      }}
                      isInvalid={!!errors.fullName}
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <Form.Control.Feedback type="invalid">{errors.fullName.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                {/* Gender */}
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium d-flex align-items-center gap-2 mb-2">
                      <FaVenusMars style={{ color: "#0046a8" }} />
                      <span>Giới tính</span>
                    </Form.Label>
                    <Form.Select
                      className="rounded-3 border-secondary-subtle"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        padding: isMobile ? "0.6rem" : "0.75rem",
                      }}
                      isInvalid={!!errors.gender}
                      {...register("gender")}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </Form.Select>
                    {errors.gender && (
                      <Form.Control.Feedback type="invalid">{errors.gender.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                {/* Date of Birth */}
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium d-flex align-items-center gap-2 mb-2">
                      <FaCalendarAlt style={{ color: "#0046a8" }} />
                      <span>Ngày sinh</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      className="rounded-3 border-secondary-subtle"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        padding: isMobile ? "0.6rem" : "0.75rem",
                      }}
                      isInvalid={!!errors.dob}
                      {...register("dob")}
                    />
                    {errors.dob && <Form.Control.Feedback type="invalid">{errors.dob.message}</Form.Control.Feedback>}
                  </Form.Group>
                </Col>

                {/* CCCD */}
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-medium d-flex align-items-center gap-2 mb-2">
                      <FaIdCard style={{ color: "#0046a8" }} />
                      <span>CCCD</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập CCCD của bạn"
                      className="rounded-3 border-secondary-subtle"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        padding: isMobile ? "0.6rem" : "0.75rem",
                      }}
                      isInvalid={!!errors.cccd}
                      {...register("cccd")}
                    />
                    {errors.cccd && <Form.Control.Feedback type="invalid">{errors.cccd.message}</Form.Control.Feedback>}
                  </Form.Group>
                </Col>

                {/* Address */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium d-flex align-items-center gap-2 mb-2">
                      <FaMapMarkerAlt style={{ color: "#0046a8" }} />
                      <span>Địa chỉ</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập địa chỉ của bạn"
                      className="rounded-3 border-secondary-subtle"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        padding: isMobile ? "0.6rem" : "0.75rem",
                      }}
                      isInvalid={!!errors.address}
                      {...register("address")}
                    />
                    {errors.address && (
                      <Form.Control.Feedback type="invalid">{errors.address.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                {/* Submit Button */}
                <Col xs={12}>
                  <div className="d-flex justify-content-start">
                    <Button
                      variant="primary"
                      type="submit"
                      className="rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                        border: "none",
                        minWidth: isMobile ? "120px" : "140px",
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Cập nhật</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={handleCloseModal} centered size="sm">
          <Modal.Body className="text-center py-4">
            <div className="mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                }}
              >
                <FaCheckCircle style={{ color: "white", fontSize: "40px" }} />
              </div>
            </div>
            <h5 className="fw-bold mb-2" style={{ color: "#0046a8" }}>
              Thành công!
            </h5>
            <p className="text-muted mb-4">Cập nhật thông tin cá nhân thành công</p>
            <Button
              variant="primary"
              onClick={handleCloseModal}
              className="px-4 rounded-3"
              style={{
                background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
                border: "none",
              }}
            >
              Đóng
            </Button>
          </Modal.Body>
        </Modal>
      </div>
    </SidebarPersonLayout>
  )
}

export default PersonalInfoPage
