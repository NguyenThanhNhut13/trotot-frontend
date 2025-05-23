import React, { useContext, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/styles/Deposit.css";
import paymentAPI from "../../apis/payment.api";
import { toast } from "react-toastify";

import { useAppSelector } from '../../store/hook';

const DepositPage: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("vnpay");
  const { profile } = useAppSelector(state => state.user);

  // Danh sách số tiền có thể chọn
  const amounts = [
    50000, 100000, 200000, 300000, 500000, 1000000, 1500000, 2000000,
  ];

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    {
      id: "qrcode",
      name: "QR CODE",
      icon: "https://i.postimg.cc/bNr7p4sY/qr-qu-t-m.webp", // Thay bằng URL thực tế
    },
    {
      id: "vnpay",
      name: "VNPAY",
      icon: "https://i.postimg.cc/MKnFhRFv/vnpay.webp", // Thay bằng URL thực tế
    },
    {
      id: "atm",
      name: "ATM",
      icon: "https://i.postimg.cc/vHCNMBJX/th-atm.jpg", // Thay bằng URL thực tế
    },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
  };

  const handleSubmit = async () => {
    if (!selectedAmount) {
      toast.error("Vui lòng chọn số tiền cần nạp");
      return;
    }

    try {
      // Lấy userId từ localStorage hoặc context state management
      const userId = profile?.id; // hoặc từ context của bạn

      if (!userId) {
        toast.error("Bạn cần đăng nhập để thực hiện chức năng này");
        return;
      }

      const response = await paymentAPI.addMoneyToWallet(
        Number(userId),
        selectedAmount
      );

      if (response.data && response.data.data.paymentUrl) {
        // Lưu thông tin chuyển hướng để sau khi thanh toán xong có thể quay lại
        localStorage.setItem("redirectAfterPayment", "/post-room");

        // Chuyển hướng đến trang thanh toán
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error(
          "Không thể tạo giao dịch thanh toán. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.");
    }
  };

  return (
    <Container className="py-4 deposit-container" style={{ maxWidth: "600px" }}>
      <h5 className="mb-3">NẠP TIỀN</h5>

      {/* Chọn số tiền */}
      <div className="mb-4">
        <h6 className="mb-2">Số tiền nạp:</h6>
        <Row>
          {amounts.map((amount) => (
            <Col xs={3} key={amount} className="mb-2">
              <Button
                variant={
                  selectedAmount === amount ? "primary" : "outline-secondary"
                }
                className="w-100 amount-button"
                onClick={() => handleAmountSelect(amount)}
              >
                {amount.toLocaleString()} đ
              </Button>
            </Col>
          ))}
        </Row>
      </div>

      {/* Chọn phương thức thanh toán */}
      <div className="mb-4">
        <h6 className="mb-2">Chọn phương thức thanh toán:</h6>
        <Row>
          {paymentMethods.map((method) => (
            <Col xs={4} key={method.id} className="text-center">
              <div
                className={`payment-method ${
                  selectedMethod === method.id ? "selected" : ""
                } text-center`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <img
                  src={method.icon}
                  alt={method.name}
                  style={{ width: "80px", height: "80px" }}
                />
                <p className="mt-2" style={{ fontSize: "14px" }}>
                  {method.name === "VNPAY" ? <>Ví VNPAY</> : method.name}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Chi tiết giao dịch */}
      <div className="transaction-details">
        <h6 className="mb-2">CHI TIẾT GIAO DỊCH</h6>
        <div className="border rounded p-3">
          <Row>
            <Col xs={6}>Số tiền thanh toán:</Col>
            <Col xs={6} className="text-end">
              {selectedAmount?.toLocaleString()} đ
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Phương thức thanh toán:</Col>
            <Col xs={6} className="text-end">
              {selectedMethod === "qrcode"
                ? "QR CODE"
                : selectedMethod === "vnpay"
                ? "VNPAY"
                : "ATM"}
            </Col>
          </Row>
          <Row>
            <Col xs={6}>Nạp vào tài khoản:</Col>
            <Col xs={6} className="text-end">
              {profile?.fullName || "Null"}
            </Col>
          </Row>
        </div>
      </div>

      {/* Nút chuyển tiền */}
      <Button variant="primary" className="w-100" onClick={handleSubmit}>
        Chuyển tiền
      </Button>
    </Container>
  );
};

export default DepositPage;
