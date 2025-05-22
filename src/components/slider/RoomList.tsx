import React from "react";
import Slider from "react-slick";
import RoomCard from "./RoomCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const rooms = [
  {
    image: "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oQoEhDifvEBFW9AApNAgfLiNn6I0R6EBUAKTdC?lk3s=b59d6b55&x-expires=1745503200&x-signature=uxBKufxvEzuqIuttONssFNEnHFI%3D&shp=b59d6b55&shcp=-",
    location: "Gò Vấp, TP.HCM",
    title: "Nhà trọ số 88 Phạm Ngũ Lão",
    price: "1.8 triệu/tháng",
    rating: 4.5,
    link: "/phong-tro/88-pham-ngu-lao",
  },
  {
    image: "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oQoEhDifvEBFW9AApNAgfLiNn6I0R6EBUAKTdC?lk3s=b59d6b55&x-expires=1745503200&x-signature=uxBKufxvEzuqIuttONssFNEnHFI%3D&shp=b59d6b55&shcp=-",
    location: "Tân Bình, TP.HCM",
    title: "Nhà trọ cao cấp có thang máy",
    price: "4.8 triệu/tháng",
    rating: 4.5,
    link: "/phong-tro/100-hong-ha",
  },
  {
    image: "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oQoEhDifvEBFW9AApNAgfLiNn6I0R6EBUAKTdC?lk3s=b59d6b55&x-expires=1745503200&x-signature=uxBKufxvEzuqIuttONssFNEnHFI%3D&shp=b59d6b55&shcp=-",
    location: "Gò Vấp, TP.HCM",
    title: "Trọ cao cấp giá rẻ gần trung tâm",
    price: "3.3 triệu/tháng",
    rating: 4.5,
    link: "/phong-tro/537-nguyen-oanh",
  },
  {
    image: "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oQoEhDifvEBFW9AApNAgfLiNn6I0R6EBUAKTdC?lk3s=b59d6b55&x-expires=1745503200&x-signature=uxBKufxvEzuqIuttONssFNEnHFI%3D&shp=b59d6b55&shcp=-",
    location: "Gò Vấp, TP.HCM",
    title: "Ký túc xá giá rẻ nhưng riêng tư",
    price: "1.9 triệu/tháng",
    rating: 4.5,
    link: "/phong-tro/ktx-tran-thi-nghi",
  },
  {
    image: "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oQoEhDifvEBFW9AApNAgfLiNn6I0R6EBUAKTdC?lk3s=b59d6b55&x-expires=1745503200&x-signature=uxBKufxvEzuqIuttONssFNEnHFI%3D&shp=b59d6b55&shcp=-",
    location: "Quận 10, TP.HCM",
    title: "Phòng trọ phải rửa bát ngoài ban công",
    price: "3.5 triệu/tháng",
    rating: 4.1,
    link: "/phong-tro/474-41-nguyen-tri-phuong",
  },
];

const CustomArrow = ({ className, onClick }: any) => (
  <div
    className={className}
    onClick={onClick}
    style={{
      zIndex: 2,
      width: "40px",
      height: "40px",
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      ...(className?.includes("next") ? { right: "-10px" } : { left: "-10px" }),
    }}
  >
    <span
      style={{
        fontSize: "1.5rem",
        color: "#0046a8",
        fontWeight: "bold",
        display: "inline-block",
        lineHeight: "1",
      }}
    >
      {className?.includes("next") ? "›" : "‹"}
    </span>
  </div>
);

const RoomList: React.FC = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5, // Show 5 cards at once to match the image
    slidesToScroll: 1,
    nextArrow: <CustomArrow />,
    prevArrow: <CustomArrow />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 992, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  const cities = [
    { id: "all", name: "Tất cả" },
    { id: "hcm", name: "Hồ Chí Minh" },
    { id: "hn", name: "Hà Nội" },
    { id: "dn", name: "Đà Nẵng" },
    { id: "hue", name: "Thừa Thiên Huế" },
    { id: "bd", name: "Bình Dương" },
    { id: "hg", name: "Hà Giang" },
  ];

  const [selectedCity, setSelectedCity] = React.useState("all");

  return (
    <div
      className="room-list-container py-5 mt-5"
      style={{ backgroundColor: "#0046a8" }}
    >
      <div className="container">
        <h2 className="text-center mb-4 text-white fw-bold">
          TRẢI NGHIỆM TRỌ MỚI TẠI CÁC TỈNH THÀNH
        </h2>

        {/* City Filter Buttons */}
        <div className="d-flex justify-content-center flex-wrap mb-4">
          {cities.map((city) => (
            <button
              key={city.id}
              className={`btn mx-1 mb-2 ${
                selectedCity === city.id ? "btn-light" : "btn-outline-light"
              }`}
              onClick={() => setSelectedCity(city.id)}
              style={{
                borderRadius: "50px",
                padding: "6px 15px",
                fontSize: "0.9rem",
                fontWeight: selectedCity === city.id ? "bold" : "normal",
              }}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Room Cards Slider */}
        <div className="position-relative px-4 mx-2">
          <Slider {...settings} className="room-slider mx-1">
            {rooms.map((room, index) => (
              <div key={index} className="px-2 py-2">
                <RoomCard {...room} />
              </div>
            ))}
          </Slider>
        </div>

        {/* View More Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-light px-4 py-2"
            style={{ borderRadius: "4px", fontWeight: "500" }}
          >
            Xem thêm nhiều hơn
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
