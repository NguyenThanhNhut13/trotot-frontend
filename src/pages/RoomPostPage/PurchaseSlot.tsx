import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import paymentAPI from "../../apis/payment.api";
import { useAppSelector, useAppDispatch } from '../../store/hook';
import { getProfile } from '../../store/slices/userSlice'; // Import getProfile instead of updateProfile

interface PurchasePostModalProps {
  show: boolean;
  onHide: () => void;
  total?: number;
  onPurchaseSuccess?: () => void;
}

interface HandleCloseSuccessModal {
  (): Promise<void>;
}

const packages = [
  { name: "Thêm 1 Trọ", price: 20000, discount: 0, amount: 1 },
  { name: "Thêm 5 Trọ", price: 90000, discount: 10000, amount: 5 },
  { name: "Thêm 10 Trọ", price: 170000, discount: 30000, amount: 10 },
];

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const PurchasePostModal: React.FC<PurchasePostModalProps> = ({
  total,
  show,
  onHide,
  onPurchaseSuccess,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<number>(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPostCount, setNewPostCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const { profile } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  // Get user balance from profile
  const userBalance = total || 0;
  const totalAmount = packages.find((p) => p.amount === selectedPackage)?.price || 0;

  // Check if balance is sufficient whenever package selection or balance changes
  useEffect(() => {
    if (userBalance < totalAmount) {
      setInsufficientFunds(true);
    } else {
      setInsufficientFunds(false);
    }
  }, [selectedPackage, userBalance, totalAmount]);

  const handlePurchase = async () => {
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
    // Add balance check before purchase
    if (userBalance < totalAmount) {
      toast.error("Số dư không đủ để thực hiện giao dịch này. Vui lòng nạp thêm tiền!");
      return;
    }
    
    if (!selectedPackage) {
      toast.error("Vui lòng chọn gói đăng tin trước khi thanh toán!");
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    try {
      const response = await paymentAPI.purchaseSlot({ amount: selectedPackage });
      if (response.data?.success) {
        // Calculate new count for display
        const newCount = (profile.numberOfPosts || 0) + selectedPackage;
        setShowSuccessModal(true);
        onPurchaseSuccess?.();
        onHide();
      } else {
        toast.error(response.data?.message || "Mua gói thất bại! Vui lòng thử lại.");
        onHide();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Đã có lỗi xảy ra khi mua gói. Vui lòng thử lại."
      );
      onHide();
    } finally {
      // Always turn off loading state
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal: HandleCloseSuccessModal = async () => {
    try {
      await dispatch(getProfile()).unwrap();
      console.log("Profile refreshed after purchase");
    } catch (profileError: unknown) {
      console.error("Error refreshing profile:", profileError);
    }
    setShowSuccessModal(false);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered dialogClassName="modal-dialog-centered" size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="w-100 text-center fw-bold fs-4" style={{ color: "#0056b3" }}>
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
                    transform: selectedPackage === pkg.amount ? "translateY(-5px)" : "none",
                  }}
                  onClick={() => setSelectedPackage(pkg.amount)}
                >
                  <div
                    style={{
                      backgroundColor: selectedPackage === pkg.amount ? "#0d6efd" : "#f8f9fa",
                      borderBottom: "1px solid #eaeaea",
                      padding: "15px 10px",
                      textAlign: "center",
                    }}
                  >
                    <h5
                      className="mb-0 fw-bold"
                      style={{
                        color: selectedPackage === pkg.amount ? "#fff" : "#0d6efd",
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
                      <span style={{ color: "#0d6efd", fontSize: "14px" }}>✓</span>
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
                <span className="fw-bold" style={{ color: "#ff5a00", fontSize: "1.1rem" }}>
                  {totalAmount.toLocaleString()} đ
                </span>
              </p>
            </div>
          </div>

          {/* Balance warning message */}
          {insufficientFunds && (
            <div className="px-4 mb-3">
              <div className="alert alert-warning d-flex align-items-center" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <div>
                  Số dư của bạn không đủ để mua gói này. Vui lòng nạp thêm tiền hoặc chọn gói khác.
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pb-4 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-4 py-2"
            style={{ borderRadius: "6px", fontWeight: "500" }}
            disabled={isLoading} // Disable cancel button while loading
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            className="px-4 py-2 ms-3 d-flex align-items-center justify-content-center"
            style={{
              borderRadius: "6px",
              fontWeight: "500",
              backgroundColor: "#0d6efd",
              border: "none",
              minWidth: "120px", // Ensure button doesn't change size when spinner appears
              opacity: insufficientFunds ? "0.65" : "1"
            }}
            disabled={!selectedPackage || isLoading || insufficientFunds} // Disable button while loading or no package selected
          >
            {isLoading ? (
              <>
                <Spinner 
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Đang xử lý...
              </>
            ) : (
              insufficientFunds ? 'Số dư không đủ' : 'Mua gói'
            )}
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
