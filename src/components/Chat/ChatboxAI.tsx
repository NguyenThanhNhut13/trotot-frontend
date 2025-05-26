import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Form, InputGroup, Spinner } from "react-bootstrap";
import { FaComments, FaPaperPlane, FaTimes, FaHome } from "react-icons/fa";
import chatboxAI from "../../apis/chatboxAI.api";
import "./ChatboxAI.css";
import { useNavigate } from "react-router-dom";

interface Message {
  sender: "user" | "bot";
  text: string;
  rooms?: RoomSuggestion[];
}

interface RoomSuggestion {
  id: number;
  title: string;
  price: string;
  area: string;
  imageUrl: string;
}

const ChatboxAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo Trọ Tốt. Tôi có thể giúp bạn tìm phòng trọ phù hợp. Bạn có thể chọn một gợi ý hoặc nhập câu hỏi của riêng bạn.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Tìm trọ ở Bình Thạnh",
    "Tìm phòng trọ có wifi",
    "Tìm trọ gần bệnh viện",
    "Tìm trọ giá dưới 5 triệu",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
      setInputValue("");
    }
  };

  const parseRoomData = (text: string): RoomSuggestion[] => {
    // Match pattern like: ID: 67 – 🏠 Phong tro moi – 1,000,000đ – 25.0m² – Ảnh: https://...jpg
    const roomRegex =
      /ID: (\d+) – 🏠 (.+?) – ([\d,]+đ) – ([\d.]+m²) – Ảnh: (.+?)(?=\n|$)/g;
    const rooms: RoomSuggestion[] = [];
    let match;

    while ((match = roomRegex.exec(text)) !== null) {
      rooms.push({
        id: parseInt(match[1], 10),
        title: match[2],
        price: match[3],
        area: match[4],
        imageUrl: match[5],
      });
    }

    return rooms;
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setIsLoading(true);

    try {
      // User ID should be dynamic in a real app (e.g., from user session)
      const userId = "user" + Math.floor(Math.random() * 1000);
      const response = await chatboxAI.sendMessage(userId, message);

      // Process the response
      if (response.data && response.data.length > 0) {
        // Get intro message (first item)
        const introMessage =
          response.data[0]?.text || "Đây là kết quả tìm kiếm:";

        // Get room suggestions (second item)
        const roomsText = response.data[1]?.text || "";
        const roomSuggestions = parseRoomData(roomsText);

        // Add bot messages to chat
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: introMessage,
          },
          {
            sender: "bot",
            text: roomSuggestions.length
              ? "Nhấn vào để xem chi tiết:"
              : "Không tìm thấy phòng trọ phù hợp.",
            rooms: roomSuggestions,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Xin lỗi, tôi không thể tìm kiếm được kết quả nào.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message to AI chatbox:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToRoomDetail = (roomId: number) => {
    navigate(`/phong-tro/${roomId}`); 
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        className="chatbox-toggle-btn"
        variant="primary"
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="chatbox-container">
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <div className="d-flex align-items-center">
              <FaComments className="me-2" />
              <span className="fw-bold">Trợ lý tìm phòng AI</span>
            </div>
            <Button
              variant="link"
              className="p-0 text-white"
              onClick={toggleChat}
            >
              <FaTimes />
            </Button>
          </Card.Header>

          <Card.Body className="chatbox-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>

                  {message.rooms && message.rooms.length > 0 && (
                    <div className="room-suggestions">
                      {message.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="room-item"
                          onClick={() => goToRoomDetail(room.id)}
                        >
                          <div className="room-image">
                            <img src={room.imageUrl} alt={room.title} />
                          </div>
                          <div className="room-info">
                            <h6 className="room-title">{room.title}</h6>
                            <div className="room-details">
                              <span className="room-price">{room.price}</span>
                              <span className="room-area">{room.area}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <Spinner animation="border" size="sm" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Card.Body>

          <Card.Footer className="p-2 bg-light">
            <div className="suggestions-container mb-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline-primary"
                  size="sm"
                  className="me-2 mb-1"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <FaPaperPlane />
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ChatboxAI;
