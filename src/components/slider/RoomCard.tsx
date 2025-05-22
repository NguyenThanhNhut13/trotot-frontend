import React from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { FaStar, FaPlayCircle, FaMapMarkerAlt } from "react-icons/fa";

interface RoomCardProps {
  image: string;
  location: string;
  title: string;
  price: string;
  rating: number;
  link: string;
}

const RoomCard: React.FC<RoomCardProps> = ({
  image,
  location,
  title,
  price,
  rating,
  link,
}) => {
  // Extract district from location (e.g., "Quận 5" from "Quận 5, TP.HCM")
  const district = location.split(",")[0];

  return (
    <Card className="h-100 border-0 rounded-3 overflow-hidden position-relative shadow">
      {/* Room Image */}
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={
            image ||
            "https://tromoi.com/uploads/rooms/large/phong-tro-ho-chi-minh.webp"
          }
          style={{ height: "180px", objectFit: "cover" }}
        />

        {/* Play Button Overlay */}
        <div className="position-absolute top-50 start-50 translate-middle">
          <FaPlayCircle size={40} color="white" style={{ opacity: 0.9 }} />
        </div>

        {/* District Label */}
        <div
          className="position-absolute bottom-0 start-0 w-100 p-2 text-white"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7))",
            textAlign: "center",
          }}
        >
          <div className="d-flex flex-column align-items-center">
            <img
              src="https://tromoi.com/frontend/home/images/logo-footer.png"
              alt="TroMoi"
              width="35"
              className="mb-1"
            />
            <h5
              className="mb-0 fw-bold"
              style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.6)" }}
            >
              {district}
            </h5>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <Card.Body className="p-3 bg-white">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6
            className="card-title mb-0 text-truncate"
            style={{ fontSize: "0.95rem", fontWeight: "bold", maxWidth: "80%" }}
          >
            {title}
          </h6>
          <div
            className="d-flex align-items-center"
            style={{ fontSize: "0.8rem" }}
          >
            <FaStar color="#FFD700" size={14} />
            <span className="ms-1">{rating}</span>
          </div>
        </div>

        <div
          className="d-flex align-items-center text-muted mb-1"
          style={{ fontSize: "0.8rem" }}
        >
          <FaMapMarkerAlt className="me-1" size={12} />
          <span className="text-truncate">{location}</span>
        </div>

        <div className="text-danger fw-bold" style={{ fontSize: "0.9rem" }}>
          {price}
        </div>
      </Card.Body>

      {/* Clickable Link Overlay */}
      <Link to={link} className="stretched-link"></Link>
    </Card>
  );
};

export default RoomCard;
