import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Form, InputGroup, Spinner, Badge } from "react-bootstrap";
import { 
  FaComments, 
  FaPaperPlane, 
  FaTimes, 
  FaHome, 
  FaRobot, 
  FaUser, 
  FaArrowRight, 
  FaRegLightbulb,
  FaMapMarkerAlt,
  FaRegClock
} from "react-icons/fa";
import chatboxAI from "../../apis/chatboxAI.api";
import { useNavigate, useLocation } from "react-router-dom";
import "./ChatboxAI.css";
import { useResponsive } from "../../store/hook";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp?: Date;
  rooms?: RoomSuggestion[];
}

interface RoomSuggestion {
  id: number;
  title: string;
  price: string;
  area: string;
  imageUrl: string;
  location?: string;
}

const ChatboxAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo Trọ Tốt. Tôi có thể giúp bạn tìm phòng trọ phù hợp. Bạn có thể chọn một gợi ý hoặc nhập câu hỏi của riêng bạn.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic suggestions based on current page
  const getSuggestions = () => {
    const baseSuggestions = [
      "Tìm trọ ở Bình Thạnh",
      "Tìm phòng trọ có wifi",
      "Tìm trọ gần bệnh viện",
      "Tìm trọ giá dưới 5 triệu",
    ];

    // Add contextual suggestions based on current page
    if (location.pathname.includes("/phong-tro")) {
      return [
        ...baseSuggestions,
        "Có phòng tương tự không?",
        "Phòng này có gần trung tâm không?",
      ];
    }
    
    return baseSuggestions;
  };

  const suggestions = getSuggestions();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chat is opened
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

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
    // Show typing indicator
    if (e.target.value && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value) {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleSendMessage(inputValue);
      setInputValue("");
      setIsTyping(false);
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
        location: "Quận " + Math.floor(Math.random() * 12 + 1), // Mock location data
      });
    }

    return rooms;
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { 
      sender: "user", 
      text: message,
      timestamp: new Date()
    }]);
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
            timestamp: new Date()
          },
          {
            sender: "bot",
            text: roomSuggestions.length
              ? "Nhấn vào để xem chi tiết:"
              : "Không tìm thấy phòng trọ phù hợp.",
            rooms: roomSuggestions,
            timestamp: new Date(Date.now() + 500) // Slight delay for better UX
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Xin lỗi, tôi không thể tìm kiếm được kết quả nào.",
            timestamp: new Date()
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
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToRoomDetail = (roomId: number) => {
    navigate(`/phong-tro/${roomId}`);
    // Optional: close chat after navigation on mobile
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        className="chatbox-toggle-btn"
        style={{ 
          backgroundColor: "#0046a8", 
          borderColor: "#0046a8",
          width: isMobile ? "50px" : "60px",
          height: isMobile ? "50px" : "60px",
          bottom: isMobile ? "15px" : "20px",
          right: isMobile ? "15px" : "20px",
        }}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card 
          className="chatbox-container"
          style={{ 
            width: isMobile ? "calc(100% - 30px)" : isTablet ? "400px" : "380px",
            height: isMobile ? "70vh" : "500px",
            bottom: isMobile ? "75px" : "90px",
            right: isMobile ? "15px" : "20px",
          }}
        >
          <Card.Header 
            className="d-flex justify-content-between align-items-center text-white"
            style={{ backgroundColor: "#0046a8" }}
          >
            <div className="d-flex align-items-center">
              <FaRobot className="me-2" />
              <span className="fw-bold">Trợ lý tìm phòng AI</span>
              <Badge 
                bg="light" 
                text="dark" 
                className="ms-2 px-2 py-1" 
                style={{ fontSize: "0.65rem" }}
              >
                Beta
              </Badge>
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
              <div 
                key={index} 
                className={`message ${message.sender} ${message.sender === 'bot' ? 'animate-in-left' : 'animate-in-right'}`}
                style={{ 
                  backgroundColor: message.sender === 'user' ? '#0046a8' : '#e9ecef',
                  maxWidth: message.rooms ? '95%' : '80%'
                }}
              >
                <div className="message-content">
                  <div className="message-header">
                    {message.sender === 'bot' ? (
                      <FaRobot size={12} className="message-icon" />
                    ) : (
                      <FaUser size={12} className="message-icon" />
                    )}
                    {message.timestamp && (
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    )}
                  </div>
                  
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
                            <img src={room.imageUrl || "/placeholder.svg"} alt={room.title} />
                          </div>
                          <div className="room-info">
                            <h6 className="room-title">{room.title}</h6>
                            <div className="room-details">
                              <span className="room-price">{room.price}</span>
                              <span className="room-area">{room.area}</span>
                            </div>
                            {room.location && (
                              <div className="room-location">
                                <FaMapMarkerAlt size={10} className="me-1" />
                                <span>{room.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="room-action">
                            <FaArrowRight size={12} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message bot animate-pulse">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {isTyping && !isLoading && (
              <div className="user-typing">
                <FaRegClock size={10} className="me-1" />
                <span>Đang nhập...</span>
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
                  className="me-2 mb-1 suggestion-btn"
                  style={{ 
                    borderColor: "#0046a8", 
                    color: "#0046a8",
                    fontSize: "0.75rem"
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="chatbox-input"
                />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
                >
                  <FaPaperPlane />
                </Button>
              </InputGroup>
            </Form>
            
            <div className="chatbox-footer-info mt-2">
              <small className="text-muted d-flex align-items-center justify-content-center">
                <FaRegLightbulb size={10} className="me-1" />
                Trợ lý AI có thể mắc lỗi. Hãy kiểm tra thông tin.
              </small>
            </div>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ChatboxAI;
