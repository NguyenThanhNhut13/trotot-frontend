import React, { useContext, useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppContext } from "../../contexts/app.context";
import { toast } from "react-toastify";
import paymentAPI from "../../apis/payment.api";
import userApi from "../../apis/user.api";

interface PurchasePostModalProps {
  show: boolean;
  onHide: () => void;
  total?: number;
  onPurchaseSuccess?: () => void; // Callback to notify parent of success
}

const PurchasePostModal: React.FC<PurchasePostModalProps> = ({
  total,
  show,
  onHide,
  onPurchaseSuccess,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPostCount, setNewPostCount] = useState<number | null>(null);
  const { profile, setProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  const packages = [
    { name: "Thêm 1 Trọ", price: 20000, discount: 0, amount: 1 },
    { name: "Thêm 5 Trọ", price: 90000, discount: 10000, amount: 5 },
    { name: "Thêm 10 Trọ", price: 170000, discount: 30000, amount: 10 },
  ];

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSelectPackage = (packageAmount: number) => {
    setSelectedPackage(packageAmount);
  };

  const fetchUpdatedProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data.data);
      setNewPostCount(response.data.data.numberOfPosts);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching updated profile:", error);
      toast.error("Không thể tải số lượng trọ mới. Vui lòng làm mới trang.");
      return null;
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error("Vui lòng chọn gói đăng tin trước khi thanh toán!");
      return;
    }

    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để thực hiện thanh toán!");
      navigate("/login");
      onHide();
      return;
    }

    if (!profile?.id) {
      toast.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!");
      navigate("/login");
      onHide();
      return;
    }

    try {
      // Include userId in the request body if required by the API
      const response = await paymentAPI.purchaseSlot({ 
        amount: selectedPackage,
      });

      if (response.data?.success) { // Adjust based on actual response structure
        const updatedProfile = await fetchUpdatedProfile();
        if (updatedProfile) {
          setShowSuccessModal(true);
          onPurchaseSuccess?.(); // Notify parent component
        }
        onHide();
      } else {
        toast.error(response.data?.message || "Mua gói thất bại! Vui lòng thử lại.");
        onHide();
      }
    } catch (error: any) {
      console.error("Error during purchase:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi mua gói. Vui lòng thử lại.";
      toast.error(errorMessage);
      onHide();
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const totalAmount = selectedPackage
    ? packages.find((p) => p.amount === selectedPackage)?.price || 0
    : 0;

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        dialogClassName="modal-dialog-centered"
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title
            className="w-100 text-center fw-bold fs-4"
            style={{ color: "#0056b3" }}
          >
            BẢNG GIÁ MUA SỐ LƯỢNG ĐĂNG TIN
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Row className="g-4 mb-4 justify-content-center">
            {packages.map((pkg) => (
              <Col key={pkg.name} md={4} className="px-3">
                <div
                  className="position-relative h-100"
                  style={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow:
                      selectedPackage === pkg.amount
                        ? "0 0 0 3px #0d6efd, 0 5px 15px rgba(0,0,0,0.1)"
                        : "0 5px 15px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                    transform:
                      selectedPackage === pkg.amount
                        ? "translateY(-5px)"
                        : "none",
                  }}
                  onClick={() => handleSelectPackage(pkg.amount)}
                >
                  <div
                    style={{
                      backgroundColor:
                        selectedPackage === pkg.amount ? "#0d6efd" : "#f8f9fa",
                      borderBottom: "1px solid #eaeaea",
                      padding: "15px 10px",
                      textAlign: "center",
                    }}
                  >
                    <h5
                      className="mb-0 fw-bold"
                      style={{
                        color:
                          selectedPackage === pkg.amount ? "#fff" : "#0d6efd",
                      }}
                    >
                      {pkg.name}
                    </h5>
                  </div>

                  <div className="p-4 text-center bg-white">
                    <h3 className="fw-bold mb-1" style={{ color: "#ff5a00" }}>
                      {pkg.price.toLocaleString()} đ
                    </h3>

                    {pkg.discount > 0 && (
                      <div
                        className="mt-2 py-1 px-2 d-inline-block"
                        style={{
                          backgroundColor: "#e8f7ee",
                          color: "#28a745",
                          borderRadius: "4px",
                          fontSize: "0.9rem",
                        }}
                      >
                        Tiết kiệm {pkg.discount.toLocaleString()} đ
                      </div>
                    )}
                  </div>

                  {selectedPackage === pkg.amount && (
                    <div
                      className="position-absolute"
                      style={{
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span style={{ color: "#0d6efd", fontSize: "14px" }}>
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          <div
            className="p-3 rounded mb-3"
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #eaeaea",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <p className="mb-0">
                TK chính: <span className="fw-bold">{formatVND(total || 0)}</span>
              </p>
              <p className="mb-0">
                Số tiền thanh toán:{" "}
                <span
                  className="fw-bold"
                  style={{ color: "#ff5a00", fontSize: "1.1rem" }}
                >
                  {totalAmount.toLocaleString()} đ
                </span>
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 justify-content-center pb-4 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-4 py-2"
            style={{ borderRadius: "6px", fontWeight: "500" }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            className="px-4 py-2 ms-3"
            style={{
              borderRadius: "6px",
              fontWeight: "500",
              backgroundColor: "#0d6efd",
              border: "none",
            }}
            disabled={!selectedPackage}
          >
            Mua gói
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showSuccessModal}
        onHide={handleCloseSuccessModal}
        centered
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center fw-bold fs-4" style={{ color: "#28a745" }}>
            Thành công!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p>Bạn đã mua gói thành công!</p>
          {newPostCount !== null && (
            <p>Số lượng trọ còn lại: <strong>{newPostCount}</strong></p>
          )}
          <Button
            variant="success"
            onClick={handleCloseSuccessModal}
            className="mt-3 px-4 py-2"
            style={{ borderRadius: "6px", fontWeight: "500" }}
          >
            Đóng
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PurchasePostModal;