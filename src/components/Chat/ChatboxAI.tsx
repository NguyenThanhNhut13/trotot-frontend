"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button, Card, Form, InputGroup } from "react-bootstrap"
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaRobot,
  FaUser,
  FaArrowRight,
  FaRegLightbulb,
  FaMapMarkerAlt,
  FaExpand,
  FaCompress,
} from "react-icons/fa"
import chatboxAI from "../../apis/chatboxAI.api"
import { useNavigate } from "react-router-dom"
import "./ChatboxAI.css"
import { useResponsive } from "../../store/hook"
import ReactMarkdown from "react-markdown"

interface Message {
  sender: "user" | "bot"
  text: string
  timestamp?: Date
  rooms?: RoomSuggestion[]
}

interface RoomSuggestion {
  id: number
  title: string
  price: string
  area: string
  imageUrl: string
  location?: string
}

const ChatboxAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý ảo Trọ Tốt. Tôi có thể giúp bạn tìm phòng trọ phù hợp. Bạn có thể hỏi về giá cả, vị trí, diện tích hoặc các yêu cầu khác. Ví dụ: 'Tìm phòng trọ giá dưới 2 triệu ở quận Gò Vấp, TP.HCM'.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Focus input when chat is opened
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    // Reset expanded state when closing
    if (isOpen) {
      setIsExpanded(false)
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSendMessage(inputValue)
      setInputValue("")
    }
  }

  const handleSendMessage = async (message: string) => {
    // Don't start a new request if we're already loading
    if (isLoading) return

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: message,
        timestamp: new Date(),
      },
    ])
    setIsLoading(true)

    try {
      const response = await chatboxAI.sendMessage(message)

      // Handle the API response
      if (typeof response.data === "object" && response.data !== null && "response" in response.data) {
        // Handle new API format
        if (typeof response.data.response === "object") {
          // Format with both summary and potential room data
          const summary = response.data.response.summary

          // Add the summary text as a bot message
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: summary,
              timestamp: new Date(),
            },
          ])

          // Check if there's room data to display
          if (
            response.data.response.raw_data &&
            Array.isArray(response.data.response.raw_data.content) &&
            response.data.response.raw_data.content.length > 0
          ) {
            // Process room data
            const roomSuggestions: RoomSuggestion[] = response.data.response.raw_data.content.map((room) => ({
              id: room.id,
              title: room.title,
              price: `${(room.price / 1000000).toFixed(1)} triệu đ`,
              area: `${room.area}m²`,
              imageUrl: room.imageUrls[0] || "/placeholder.svg",
              location: `${room.district}, ${room.province}`,
            }))

            // Add room suggestions as a separate message with slight delay for better UX
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                {
                  sender: "bot",
                  text: "Nhấn vào để xem chi tiết:",
                  timestamp: new Date(),
                  rooms: roomSuggestions,
                },
              ])
            }, 300)
          }
        } else {
          // Simple response format without room data
          const responseText = response.data.response
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: responseText,
              timestamp: new Date(),
            },
          ])
        }
      } else {
        // Fallback for unknown format
        const botText = typeof response.data === "string" ? response.data : JSON.stringify(response.data)

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: botText,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error: any) {
      console.error("Error sending message to AI chatbox:", error)
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: error?.message || "Xin lỗi, có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const goToRoomDetail = (roomId: number) => {
    navigate(`/phong-tro/${roomId}`)
    // Optional: close chat after navigation on mobile
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Enhanced sizing with expansion support
  const getChatDimensions = () => {
    if (isMobile) {
      return {
        width: "calc(100% - 30px)",
        height: "70vh",
        bottom: "75px",
        right: "15px",
      }
    } else if (isTablet) {
      return {
        width: "450px",
        height: "500px",
        bottom: "90px",
        right: "20px",
      }
    } else {
      // Desktop - expandable width
      return {
        width: isExpanded ? "650px" : "380px",
        height: isExpanded ? "570px" :"500px",
        bottom: "90px",
        right: "20px",
      }
    }
  }

  const chatDimensions = getChatDimensions()

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
        <Card className="chatbox-container" style={chatDimensions}>
          <Card.Header
            className="d-flex justify-content-between align-items-center text-white"
            style={{
              background: "linear-gradient(135deg, #0046a8 0%, #003d96 100%)",
              borderBottom: "none",
            }}
          >
            <div className="d-flex align-items-center">
              <FaRobot className="me-2" />
              <span className="fw-bold">Trợ lý tìm phòng AI</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              {/* Expand/Collapse button - only show on desktop */}
              {isDesktop && (
                <Button
                  variant="link"
                  className="p-0 text-white"
                  onClick={toggleExpanded}
                  style={{ opacity: 0.9, fontSize: "16px" }}
                  title={isExpanded ? "Thu nhỏ" : "Mở rộng"}
                >
                  {isExpanded ? <FaCompress /> : <FaExpand />}
                </Button>
              )}
              <Button
                variant="link"
                className="p-0 text-white"
                onClick={toggleChat}
                style={{ opacity: 0.9, fontSize: "18px" }}
              >
                <FaTimes />
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="chatbox-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender} ${message.sender === "bot" ? "animate-in-left" : "animate-in-right"}`}
                style={{
                  backgroundColor: message.sender === "user" ? "#0046a8" : "#e9ecef",
                  maxWidth: message.rooms ? "95%" : "80%",
                }}
              >
                <div className="message-content">
                  <div className="message-header">
                    {message.sender === "bot" ? (
                      <FaRobot size={12} className="message-icon" />
                    ) : (
                      <FaUser size={12} className="message-icon" />
                    )}
                    {message.timestamp && <span className="message-time">{formatTime(message.timestamp)}</span>}
                  </div>
                  {message.sender === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: (props) => <p style={{ marginBottom: 0 }} {...props} />,
                        ul: (props) => <ul style={{ marginBottom: 0, paddingLeft: 18 }} {...props} />,
                        li: (props) => <li style={{ marginBottom: 0 }} {...props} />,
                        strong: (props) => <strong {...props} />,
                        em: (props) => <em {...props} />,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.text}</p>
                  )}

                  {message.rooms && message.rooms.length > 0 && (
                    <div className="room-suggestions">
                      {message.rooms.map((room) => (
                        <div key={room.id} className="room-item" onClick={() => goToRoomDetail(room.id)}>
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
            <div ref={messagesEndRef} />
          </Card.Body>

          <Card.Footer className="p-2 bg-light">
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
  )
}

export default ChatboxAI
