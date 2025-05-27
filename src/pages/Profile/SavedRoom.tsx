import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import Sidebar from "../MainPage/SidebarPersion";
import { FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { AppDispatch, RootState } from "../../store/store";
import { fetchSavedRooms, removeSavedRoom } from "../../store/slices/savedRoomsSlice";
import "./SavedRoom.css";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";

interface Room {
  id: number;
  title: string;
  address: string;
  price: string;
  type: string;
  area: number;
  imageUrl: string;
  district: string;
  province: string;
  isHot?: boolean;
}

export default function SavedRoom() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate(); 
  const { items: savedRooms, loading, error } = useSelector((state: RootState) => state.savedRooms);

  // Fetch saved rooms from Redux
  useEffect(() => {
    dispatch(fetchSavedRooms())
      .unwrap()
      .catch((error) => {
        toast.error(
          "Đã xảy ra lỗi khi tải danh sách trọ đã lưu: " + (error || "Lỗi không xác định")
        );
      });
  }, [dispatch]);

  // Cập nhật hàm handleRemoveSaved
  const handleRemoveSaved = async (event: React.MouseEvent, id: number) => {
    // Ngăn không cho sự kiện click lan truyền đến card (tránh chuyển trang)
    event.stopPropagation();
    
    try {
      // Dispatch action để xóa phòng từ Redux store và API
      await dispatch(removeSavedRoom(id)).unwrap();
      toast.success("Đã xóa trọ khỏi danh sách yêu thích!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa trọ khỏi danh sách yêu thích!");
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={3} className="p-0 min-vh-100">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={9} className="py-4 px-5">
          <h2 className="text-primary fw-bold mb-2">TRỌ ĐÃ LƯU</h2>
          <p className="text-muted mb-4">Tổng số {savedRooms.length} trọ</p>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải danh sách trọ đã lưu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <p>Đã xảy ra lỗi: {error}</p>
            </div>
          ) : savedRooms.length > 0 ? (
            <div className="saved-rooms-container">
              {savedRooms.map((room) => (
                <Card
                  key={room.id}
                  className="mb-4 overflow-hidden border-0 shadow-sm"
                  onClick={() => navigate(`/phong-tro/${room.id}`)}
                >
                  <div className="position-relative">
                    {room.isHot && (
                      <Badge
                        bg="danger"
                        className="position-absolute top-0 start-0 m-2 hot-badge"
                      >
                        HOT
                      </Badge>
                    )}
                    <div
                      className="favorite-icon position-absolute"
                      onClick={(e) => handleRemoveSaved(e, room.id)}
                    >
                      <FaHeart className="text-danger" size={24} />
                    </div>
                    <Row className="g-0">
                      <Col md={4} className="room-image-container p-0">
                        <img
                          src={room.imageUrl}
                          className="room-image w-100 h-100"
                          alt={room.title}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/default-room.jpg";
                          }}
                        />
                      </Col>
                      <Col md={8}>
                        <Card.Body>
                          <Card.Title as="h5" className="fw-bold mb-3">
                            <a
                              href="#"
                              className="text-decoration-none text-dark"
                            >
                              {room.title}
                            </a>
                          </Card.Title>

                          <div className="d-flex align-items-center mb-2 text-muted">
                            <div className="me-5">
                              Từ{" "}
                              <span className="text-primary fw-bold">
                                {formatCurrency(room.price)}
                              </span>
                            </div>
                          </div>

                          <div className="d-flex flex-wrap mt-3">
                            <Badge
                              bg="light"
                              text="dark"
                              className="me-2 mb-2 px-3 py-2 rounded-pill"
                            >
                              {room.type}
                            </Badge>
                            <Badge
                              bg="light"
                              text="dark"
                              className="me-2 mb-2 px-3 py-2 rounded-pill"
                            >
                              {room.area} m²
                            </Badge>
                          </div>

                          <div className="d-flex align-items-center mt-3">
                            <FaMapMarkerAlt className="text-muted me-2" />
                            <small className="text-muted">
                              {room.district && room.province
                                ? `${room.district}, ${room.province}`
                                : "Không có địa chỉ"}
                            </small>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p>
                Bạn chưa lưu trọ nào. Hãy tìm kiếm và lưu những trọ yêu thích!
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
