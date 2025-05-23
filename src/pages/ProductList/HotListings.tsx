import React, { useContext, useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import roomApi from "../../apis/room.api"; // update path if needed
import { Room } from "../../types/room.type"; // kiểu gốc từ API
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAppSelector } from "../../store/hook";

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
}

const HotListings: React.FC<HotListingsProps> = ({
  title = "LỰA CHỌN CHỖ Ở HOT",
  page = 0,
  size = 25,
  sort = "createdAt,desc",
  roomType,
}) => {
  const [hotListings, setHotListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3; // Maximum retry attempts
  const [savedRoomIds, setSavedRoomIds] = useState<Set<number>>(new Set()); // Thêm state này

  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Helper function to create dummy empty listings if count is less than 5
  const ensureMinimumItems = (listings: Listing[], minCount: number = 5) => {
    if (listings.length >= minCount) return listings;

    // Create empty slots to fill the row
    const emptySlots = Array(minCount - listings.length).fill(null);
    return [...listings, ...emptySlots];
  };

  

  // Define fetchRooms outside useEffect
  const fetchRooms = async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching rooms, attempt ${attempt}/${maxRetries}`);

      const res = await roomApi.getRooms({ page, size, sort, roomType });
      console.log("API response:", res.data);
      const rooms = res.data.data.content;

      const mapped: Listing[] = rooms.map((room: Room) => {
        const district = room.district ?? "";
        const province = room.province ?? "";
        const location = `${district}, ${province}`.replace(/^, |, $/g, "");

        return {
          id: room.id,
          image:
            room.imageUrls[0] ||
            "https://tromoi.com/uploads/guest/o_1h5tpk1fl1i0047413epqpsee3a.jpg",
          title: room.title,
          price: `${room.price.toLocaleString()} VNĐ`,
          area: room.area,
          location,
        };
      });

      // Kiểm tra nếu tất cả các location đều trống => có thể lỗi address service, thử reload nếu chưa vượt quá giới hạn
      const allLocationsEmpty = mapped.every(
        (listing) => listing.location === ""
      );

      if (allLocationsEmpty && attempt <= maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000;
        console.warn("Address service có thể đang gặp sự cố. Đang thử lại...");
        setTimeout(() => fetchRooms(attempt + 1), delay);
        return;
      }

      localStorage.setItem(`list${roomType}Pagging`, JSON.stringify(mapped));
      setHotListings(mapped);
    } catch (error) {
      console.error("Error fetching hot listings", error);
      if (attempt <= maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000;
        setTimeout(() => fetchRooms(attempt + 1), delay);
      } else {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem(`list${roomType}Pagging`);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setHotListings(parsedData);
        return;
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    fetchRooms(); // Call fetchRooms
  }, [page, size, sort, roomType]); // Re-fetch if params change

  const handleSaveRoom = async (e: React.MouseEvent, roomId: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để lưu phòng trọ");
      return;
    }

    try {
      // Gọi API trực tiếp thay vì dùng toggleSaveRoom để kiểm soát luồng tốt hơn
      if (savedRoomIds.has(roomId)) {
        // Xóa phòng khỏi danh sách yêu thích
        await roomApi.removeFromWishList(roomId);
        // Cập nhật UI ngay lập tức
        setSavedRoomIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(roomId);
          return newSet;
        });
      } else {
        // Thêm phòng vào danh sách yêu thích
        await roomApi.addToWishList(roomId);
        // Cập nhật UI ngay lập tức
        setSavedRoomIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(roomId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  useEffect(() => {
    // Sử dụng biến flag để chỉ gọi API một lần khi đăng nhập
    let isMounted = true;

    if (isAuthenticated) {
      const fetchSavedRoomIds = async () => {
        try {
          const response = await roomApi.getSavedRoomIds();
          if (isMounted && response.data?.data?.roomIds) {
            setSavedRoomIds(new Set(response.data.data.roomIds));
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchSavedRoomIds();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

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
          <Button
            variant="primary"
            onClick={() => {
              setRetryCount(retryCount + 1);
              fetchRooms();
            }}
          >
            Thử lại
          </Button>
        </div>
      ) : (
        Array.from(
          { length: Math.ceil(hotListings.length / 5) },
          (_, rowIndex) => {
            // Get current slice of listings for this row
            const rowItems = hotListings.slice(rowIndex * 5, rowIndex * 5 + 5);

            // Ensure we always have 5 items (some may be null)
            const paddedItems = ensureMinimumItems(rowItems);

            return (
              <Row key={rowIndex} className="mb-4 g-3">
                {paddedItems.map((listing, index) => (
                  <Col key={index} style={{ width: "20%" }}>
                    {listing ? (
                      <Card
                        key={listing.id}
                        className="h-100 border-0 shadow-sm position-relative"
                        onClick={() => {
                          window.location.href = `/phong-tro/${listing.id}`;
                        }}
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
                          className="position-absolute bg-white rounded-circle p-1 d-flex justify-content-center align-items-center"
                          style={{
                            top: "10px",
                            right: "10px",
                            width: "28px",
                            height: "28px",
                            zIndex: 1,
                            cursor: "pointer",
                          }}
                          onClick={(e) => handleSaveRoom(e, listing.id)}
                        >
                          {savedRoomIds.has(listing.id) ? (
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
        <Button
          variant="outline-primary"
          className="px-4"
          href={
            roomType === "BOARDING_HOUSE"
              ? "/category/nha-tro-phong-tro"
              : roomType === "APARTMENT"
              ? "/category/chung-cu-can-ho"
              : roomType === "WHOLE_HOUSE"
              ? "/category/nha-nguyen-can"
              : "/category/all"
          }
        >
          Xem tất cả <i className="fas fa-arrow-right ms-1"></i>
        </Button>
      </div>
    </div>
  );
};

export default HotListings;
