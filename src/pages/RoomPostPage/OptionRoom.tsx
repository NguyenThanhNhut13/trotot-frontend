import React, { useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sidebar from "../MainPage/Sidebar";
import "../../assets/styles/PostRoom.css";
import { min } from "moment";
import userApi from "../../apis/user.api";

interface RoomType {
  icon: string;
  title: string;
  description: string;
  link: string;
}

const PostRoomPage = () => {
  const navigate = useNavigate();



  const roomTypes: RoomType[] = [
    {
      icon: "https://i.postimg.cc/nzs7Gv2t/nhatro.png",
      title: "Nhà trọ, phòng trọ",
      description:
        "Cho thuê nhà trọ, phòng trọ sạch sẽ, an ninh, giá hợp lý, phù hợp cho sinh viên và người đi làm.",
      link: "/post-room/nha-tro-phong-tro",
    },
    {
      icon: "https://i.postimg.cc/1zdVX8Q7/nhanguyecan.png",
      title: "Nhà nguyên căn",
      description:
        "Cho thuê nhà nguyên căn rộng rãi, sạch sẽ, an ninh đảm bảo, lý tưởng cho gia đình hoặc nhóm người thuê dài hạn.",
      link: "/post-room/nha-tro-phong-tro",
    },
    {
      icon: "https://i.postimg.cc/nzQjDnVF/canho.png",
      title: "Căn hộ",
      description:
        "Cho thuê căn hộ tiện nghi, hiện đại, an ninh tốt, sạch sẽ, phù hợp cho gia đình hoặc người thuê dài hạn.",
      link: "/post-room/nha-tro-phong-tro",
    },
  ];

  // Hàm xử lý khi nhấn nút "Đăng ngay"
  const handlePostClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="main-content" style={{ display: "flex" }}>
      <div className="sidebar-container bg-light p-3 shadow-sm vh-100" style={{ width: "30%" }}>
        <Sidebar />
      </div>

      <div className="content" style={{ flex: 1, padding: "20px" }}>
        <h2 className="text-center mb-4">CHỌN LOẠI HÌNH</h2>
        <Row className="justify-content-center">
          {roomTypes.map((room, index) => (
            <Col key={index} md={4} className="mb-4">
              <div className="room-type text-center p-3 h-100 border rounded shadow-sm">
                <img
                  src={room.icon}
                  alt={room.title}
                  style={{ width: "90px", height: "70px", margin: "0 auto" }}
                />
                <h5 className="mt-3">{room.title}</h5>
                <p className="text-muted">{room.description}</p>
                <Button
                  variant="primary"
                  onClick={() => handlePostClick(room.link)}
                >
                  Đăng ngay
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default PostRoomPage;
