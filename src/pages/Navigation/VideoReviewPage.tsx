import { useState, useEffect, useRef } from "react";
import mediaAPI from "../../apis/media.api";
import { Media } from "../../types/media.type";
import { Card, Col, Row, Badge } from "react-bootstrap";
import { FaHeart, FaShare } from "react-icons/fa";

// Extend the Media type to include fields visible in the UI
interface ExtendedMedia extends Media {
  title: string;
  rating: number;
  likes: number;
}

const VideoReviewPage = () => {
  const [videos, setVideos] = useState<ExtendedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]); // Store video element refs

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await mediaAPI.getVideos();
        setVideos(
          response.data.data.map((video: Media) => ({
            ...video,
            title: (video as any).title || "Phòng rộng rãi, thoáng mát, full nội thất...",
            rating: (video as any).rating ?? 5.0,
            likes: (video as any).likes ?? 0,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Handle video play/pause toggle and pause other videos
  const toggleVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        // Pause all other videos
        videoRefs.current.forEach((v, i) => {
          if (v && i !== index && !v.paused) {
            v.pause();
            v.currentTime = 0; // Optional: reset other videos
          }
        });
        video.play();
      } else {
        video.pause();
      }
    }
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;

  return (
    <div className="container my-4">
      <h2 className="text-uppercase mb-2">Video Review</h2>
      <p className="text-muted mb-4">
        Khám phá ngay những chương trình cực hấp dẫn tại Trợ Mới để được nhận thêm ưu đãi và lựa chọn tuyệt vời cho cả 6 miền nhé!
      </p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Badge pill bg="primary" className="px-3 py-2">
          Tất cả
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Hồ Chí Minh
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Hà Nội
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Đà Nẵng
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Thừa Thiên Huế
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Bình Dương
        </Badge>
        <Badge pill bg="light" text="dark" className="px-3 py-2">
          Hải Phòng
        </Badge>
      </div>

      {videos.length === 0 ? (
        <p className="text-center">No videos available.</p>
      ) : (
        <Row xs={1} sm={2} md={3} lg={5} className="g-3">
          {videos.map((video, index) => (
            <Col key={video.publicId}>
              <Card className="h-100 border-0 shadow-sm">
                <div className="position-relative">
                  <video
                    width="100%"
                    height="auto"
                    className="rounded-top"
                    poster={video.imageUrl}
                    ref={(el) => { videoRefs.current[index] = el; }} // Assign ref
                    onClick={() => toggleVideo(index)} // Toggle play/pause
                    controls={false} // Hide default controls for custom behavior
                    style={{ cursor: "pointer" }} // Indicate clickable
                  >
                    <source src={video.imageUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="position-absolute bottom-0 end-0 p-2">
                    <FaShare className="text-white" />
                  </div>
                </div>

                <Card.Body className="p-2">
                  <Card.Title className="text-muted small mb-1">
                    Bán Mới, Thành phố Hồ Chí Minh
                  </Card.Title>
                  <Card.Text className="mb-1" style={{ fontSize: "0.9rem" }}>
                    {video.title}
                  </Card.Text>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-warning">
                      {video.rating.toFixed(1)} <span className="text-muted">★</span>
                    </span>
                    <span className="text-muted">({video.likes.toLocaleString()} lượt thích)</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default VideoReviewPage;