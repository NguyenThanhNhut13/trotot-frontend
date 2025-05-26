import React, { useContext, useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { fetchRoomsByType, fetchSavedRoomIds, saveRoom, unsaveRoom } from "../../store/slices/roomListingsSlice";
import { Link, useNavigate } from "react-router-dom";
import { 
  selectListingsByType,  
  selectLoadingStatus, 
  selectError,
  selectSavedRoomIds 
} from '../../store/selectors/roomListings.selectors';

interface Listing {
  id: number;
  image: string;
  title: string;
  price: string;
  area: number;
  location: string;
}

interface HotListingsProps {
  title?: string;
  page?: number;
  size?: number;
  sort?: string;
  roomType?: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE";
  onSaveRoom?: (roomId: number) => void;
}

const HotListings: React.FC<HotListingsProps> = ({
  title = "LỰA CHỌN CHỖ Ở HOT",
  page = 0,
  size = 25,
  sort = "createdAt,desc",
  roomType,
  onSaveRoom 
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Use memoized selectors
  const listings = useAppSelector(state => 
    selectListingsByType(state, roomType)
  );
  
  const loading = useAppSelector(state => 
    selectLoadingStatus(state, roomType)
  );
  
  const error = useAppSelector(state => 
    selectError(state, roomType)
  );

  const savedRoomIds = useAppSelector(selectSavedRoomIds);

  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  // Helper function to create dummy empty listings if count is less than 5
  const ensureMinimumItems = (listings: Listing[], minCount: number = 5) => {
    if (listings.length >= minCount) return listings;

    // Create empty slots to fill the row
    const emptySlots = Array(minCount - listings.length).fill(null);
    return [...listings, ...emptySlots];
  };

  // Fetch rooms on component mount or when parameters change
  useEffect(() => {
    if (roomType) {
      dispatch(fetchRoomsByType({ roomType, page, size, sort }));
    }
  }, [dispatch, page, size, sort, roomType]);

  // Fetch saved room IDs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSavedRoomIds());
    }
  }, [dispatch, isAuthenticated]);

  const handleSaveRoom = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      // Use onSaveRoom prop to show login modal in parent component
      if (onSaveRoom) {
        onSaveRoom(roomId);
      } else {
        // Fallback to toast if no handler provided
        toast.info("Vui lòng đăng nhập để lưu phòng trọ");
    }
      return;
    }

    try {
      // Check if room is already saved
      const isRoomSaved = savedRoomIds.includes(roomId);
      
      if (isRoomSaved) {
        await dispatch(unsaveRoom(roomId)).unwrap();
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await dispatch(saveRoom(roomId)).unwrap();
        toast.success("Đã lưu tin thành công");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Có lỗi xảy ra khi cập nhật danh sách yêu thích");
    }
  };

  // Function to retry loading
  const handleRetry = () => {
    if (roomType) {
      dispatch(fetchRoomsByType({ roomType, page, size, sort }));
    }
  };

  return (
    <div className="hot-listings mt-4">
      <h2
        className="fw-bold"
        style={{
          fontSize: "24px",
          textTransform: "uppercase",
          lineHeight: 1.5,
          color: "#113f9d",
        }}
      >
        {title}
      </h2>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <div className="text-center my-4">
          <p className="text-danger">{error}</p>
          <Button variant="primary" onClick={handleRetry}>
            Thử lại
          </Button>
        </div>
      ) : (
        Array.from(
          { length: Math.ceil(listings.length / 5) },
          (_, rowIndex) => {
            // Get current slice of listings for this row
            const rowItems = listings.slice(rowIndex * 5, rowIndex * 5 + 5);

            // Ensure we always have 5 items (some may be null)
            const paddedItems = ensureMinimumItems(rowItems);

            return (
              <Row key={rowIndex} className="mb-4 g-3">
                {paddedItems.map((listing, index) => (
                  <Col key={index} style={{ width: "20%" }}>
                    {listing ? (
                      <Link 
                        to={`/phong-tro/${listing.id}`}
                        className="text-decoration-none"
                        onClick={(e) => {
                          // Ngăn không cho Link kích hoạt nếu click vào icon heart
                          if ((e.target as HTMLElement).closest('.heart-icon')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Card
                          key={listing.id}
                          className="h-100 border-0 shadow-sm position-relative"
                        >
                          {/* HOT Label */}
                          <div
                            className="position-absolute bg-danger text-white px-2 py-1 fw-bold"
                            style={{
                              top: "10px",
                              left: "0",
                              zIndex: 1,
                              fontSize: "0.7rem",
                            }}
                          >
                            HOT
                          </div>

                          {/* Favorite Heart Icon */}
                          <div
                            className="position-absolute bg-white rounded-circle p-1 d-flex justify-content-center align-items-center heart-icon"
                            style={{
                              top: "10px",
                              right: "10px",
                              width: "28px",
                              height: "28px",
                              zIndex: 2, // Higher than card
                              cursor: "pointer",
                            }}
                            onClick={(e) => handleSaveRoom(e, listing.id)}
                          >
                            {savedRoomIds.includes(listing.id) ? (
                              <FaHeart className="text-danger" size={16} />
                            ) : (
                              <FaRegHeart size={16} />
                            )}
                          </div>

                          <Card.Img
                            variant="top"
                            src={listing.image}
                            alt={listing.title}
                            style={{ height: "180px", objectFit: "cover" }}
                          />

                          <Card.Body className="p-3">
                            <Card.Title
                              className="text-truncate mb-2"
                              style={{ fontSize: "0.95rem", fontWeight: "bold" }}
                            >
                              {listing.title}
                            </Card.Title>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div
                                className="text-danger fw-bold"
                                style={{ fontSize: "1.1rem" }}
                              >
                                {parseFloat(
                                  listing.price.replace(/[^\d.]/g, "")
                                ).toLocaleString()}{" "}
                                triệu/tháng
                              </div>
                              <div className="text-muted">
                                {listing.area}m<sup>2</sup>
                              </div>
                            </div>

                            <div
                              className="d-flex align-items-center text-muted"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <i className="fas fa-map-marker-alt me-1"></i>
                              <div className="text-truncate">
                                {listing.location}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Link>
                    ) : (
                      // Render an empty column to maintain layout
                      <div></div>
                    )}
                  </Col>
                ))}
              </Row>
            );
          }
        )
      )}

      <div className="mt-3 d-flex justify-content-center">
        <Link
          to={
            roomType === "BOARDING_HOUSE"
              ? "/category/nha-tro-phong-tro"
              : roomType === "APARTMENT"
              ? "/category/chung-cu-can-ho"
              : roomType === "WHOLE_HOUSE"
              ? "/category/nha-nguyen-can"
              : "/category/all"
          }
          className="btn btn-outline-primary px-4"
        >
          Xem tất cả <i className="fas fa-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default HotListings;
