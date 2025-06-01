import React, { useRef, useEffect } from "react";
import { Row, Col, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sidebar from "../MainPage/Sidebar";
import "../../assets/styles/PostRoom.css";

interface RoomType {
  icon: string;
  title: string;
  description: string;
  link: string;
}

const PostRoomPage = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (window.innerWidth <= 767 && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handlePostClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="main-content d-flex flex-column flex-md-row">
      {/* Sidebar: stack on top on small screens, left on md+ */}
      <div
        className="sidebar-container bg-light p-3 shadow-sm"
        style={{
          width: "100%",
          maxWidth: "320px",
          minWidth: "220px",
          height: "auto",
        }}
      >
        <Sidebar />
      </div>

      <div className="content flex-grow-1 p-3" ref={contentRef}>
        <h2 className="text-center mb-4">CHỌN LOẠI HÌNH</h2>
        <Container fluid>
          <Row className="justify-content-center">
            {roomTypes.map((room, index) => (
              <Col
                key={index}
                xs={12}
                sm={6}
                md={4}
                className="mb-4 d-flex align-items-stretch"
              >
                <div className="room-type text-center p-3 w-100 border rounded shadow-sm h-100 d-flex flex-column">
                  <img
                    src={room.icon}
                    alt={room.title}
                    style={{ width: "90px", height: "70px", margin: "0 auto" }}
                  />
                  <h5 className="mt-3">{room.title}</h5>
                  <p className="text-muted flex-grow-1">{room.description}</p>
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
        </Container>
      </div>
      <style>{`
        @media (max-width: 767.98px) {
          .main-content {
            flex-direction: column !important;
          }
          .sidebar-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            height: auto !important;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PostRoomPage;
