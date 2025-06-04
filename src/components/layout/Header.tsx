"use client"

import { useState } from "react"
import { Navbar, Nav, Button, Container, Dropdown, Badge, Offcanvas } from "react-bootstrap"
import { Link, useLocation, useNavigate } from "react-router-dom"
import LoginModal from "../../pages/Login/LoginModal"
import RegisterModal from "../../pages/Register/RegisterModal"
import { FaBell, FaHeart, FaBars, FaUser, FaHome, FaVideo, FaBlog, FaPhone, FaTimes } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAppSelector, useAppDispatch, useResponsive } from "../../store/hook"
import { checkAndRefreshToken, logout, refreshTokenFromServer } from "../../store/slices/authSlice"
import { upgradeUserRole } from "../../store/slices/userSlice"

const Header = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const { isMobile, isTablet } = useResponsive()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  const dispatch = useAppDispatch()
  const { profile } = useAppSelector((state) => state.user)

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken")
    if (refreshToken) {
      dispatch(logout({ refreshToken }))
    }
    toast.success("Đăng xuất thành công!")
  }

  // Hàm kiểm tra đăng nhập trước khi cho đăng trọ
  const handlePostRoomClick = async () => {
    if (!isAuthenticated || !profile) {
      toast.error("Vui lòng đăng nhập để đăng tin!", {
        position: "top-right",
        autoClose: 3000,
      })
      setShowLogin(true)
      return
    }

    // Kiểm tra role trong accessToken
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]))
        let roles: string[] = []
        if (typeof payload.roles === "string") {
          roles = payload.roles.split(",").map((r: string) => r.trim())
        } else if (Array.isArray(payload.roles)) {
          roles = payload.roles
        }
        if (roles.includes("LANDLORD") || roles.includes("ADMIN")) {
          navigate("/post-room")
          return
        }
      } catch (err) {
        // Nếu lỗi parse token, tiếp tục xử lý nâng cấp
      }
    }

    try {
      toast.info("Đang chuẩn bị tài khoản để đăng tin...", {
        position: "top-right",
        autoClose: 2000,
      })

      const resultAction = await dispatch(upgradeUserRole())
      
      // Check if the upgrade was successful
      if (upgradeUserRole.fulfilled.match(resultAction)) {
        // You may need to create this action if it doesn't exist
        await dispatch(refreshTokenFromServer()).unwrap()
        
        // Verify the new role is in the token
        const newAccessToken = localStorage.getItem("accessToken")
        if (newAccessToken) {
          const newPayload = JSON.parse(atob(newAccessToken.split(".")[1]))
          let newRoles = Array.isArray(newPayload.roles) 
            ? newPayload.roles 
            : newPayload.roles.split(",").map((r: string) => r.trim())
            
          // If role not updated yet, try one more time after a brief delay
          if (!newRoles.includes("LANDLORD")) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            await dispatch(refreshTokenFromServer()).unwrap()
          }
        }
        
        toast.success("Tài khoản đã được nâng cấp thành chủ trọ!", {
          position: "top-right",
          autoClose: 3000,
        })
        navigate("/post-room")
      } else if (upgradeUserRole.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload as any
        if (errorPayload?.status === 409) {
          toast.info("Bạn đã có quyền đăng tin!", {
            position: "top-right",
            autoClose: 2000,
          })
          navigate("/post-room")
          return
        }
        toast.error(`Không thể nâng cấp tài khoản: ${errorPayload?.message || "Vui lòng thử lại sau"}`, {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error: any) {
      console.error("Lỗi khi nâng cấp tài khoản:", error)
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  const categories = [
    { path: "/category/nha-tro-phong-tro", label: "Nhà trọ, phòng trọ", icon: FaHome },
    { path: "/category/nha-nguyen-can", label: "Nhà nguyên căn", icon: FaHome },
    { path: "/category/can-ho-chung-cu", label: "Căn hộ", icon: FaHome },
    { path: "/category/video-review", label: "Review", icon: FaVideo },
    { path: "/blog", label: "Blog", icon: FaBlog },
    { path: "/contact", label: "Liên hệ", icon: FaPhone },
  ]

  return (
    <>
      {/* Navbar cho desktop - GIỮ NGUYÊN */}
      {!isMobile && !isTablet && (
        <Navbar bg="white" expand="lg" className="shadow-sm py-2 d-none d-lg-block">
          <Container>
            <Navbar.Brand as={Link} to="/" className="me-4">
              <img
                src="https://tromoi.com/logo_mobile.png"
                alt="TroMoi"
                height="40"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>

            <div className="d-flex flex-grow-1">
              <Nav className="me-auto">
                {categories.map((cat) => {
                  const isActive = location.pathname === cat.path
                  return (
                    <Nav.Link
                      key={cat.path}
                      as={Link}
                      to={cat.path}
                      className={`fw-medium mx-2`}
                      style={{
                        backgroundColor: isActive ? "#0145aa" : "transparent",
                        color: isActive ? "#ffffff" : "#393738",
                        padding: "10px 12px",
                        borderRadius: "4px",
                      }}
                    >
                      {cat.label}
                    </Nav.Link>
                  )
                })}
              </Nav>

              <Nav className="align-items-center">
                <Nav.Link className="position-relative me-3">
                  <FaBell size={20} />
                  <Badge bg="danger" pill className="position-absolute top-0 start-75 translate-middle">
                    0
                  </Badge>
                </Nav.Link>

                <Nav.Link className="me-3">
                  <FaHeart size={20} />
                </Nav.Link>

                {profile?.fullName ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0">
                      <img
                        src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
                        alt="User"
                        width="30"
                        height="30"
                        className="rounded-circle me-2"
                      />
                      <span>{profile.fullName}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="py-2 px-2">
                      <Dropdown.Item as={Link} to="/personal-info" className="py-3">
                        <i className="far fa-user text-primary me-2"></i> Thông tin cá nhân
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/account-info" className="py-3">
                        <i className="far fa-id-card text-primary me-2"></i> Thông tin tài khoản
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile" className="py-3">
                        <i className="fas fa-home text-primary me-2"></i> Dành cho chủ trọ
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout} className="py-3">
                        <i className="fas fa-sign-out-alt text-primary me-2"></i> Đăng xuất
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <>
                    <Button
                      variant="link"
                      className="text-dark text-decoration-none"
                      onClick={() => setShowLogin(true)}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="link"
                      className="text-dark text-decoration-none"
                      onClick={() => setShowRegister(true)}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}

                <Button variant="primary" className="ms-3" onClick={handlePostRoomClick}>
                  <i className="fa fa-paper-plane me-1"></i> Đăng tin ngay
                </Button>
              </Nav>
            </div>
          </Container>
        </Navbar>
      )}

      {/* Navbar cho tablet */}
      {isTablet && !isMobile && (
        <Navbar bg="white" className="shadow-sm py-2">
          <Container>
            <div className="d-flex align-items-center justify-content-between w-100">
              {/* Menu button */}
              <button
                className="btn p-2 rounded-circle border-0 me-3"
                onClick={() => setShowMobileMenu(true)}
                style={{
                  backgroundColor: "#f8f9fa",
                  transition: "all 0.3s ease",
                  width: "40px",
                  height: "40px",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = "#0145aa"
                  el.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.backgroundColor = "#f8f9fa"
                  el.style.color = "black"
                }}
              >
                <FaBars size={16} />
              </button>

              {/* Logo - Nhỏ hơn */}
              <Navbar.Brand as={Link} to="/" className="mx-auto">
                <img
                  src="https://tromoi.com/logo_mobile.png"
                  alt="TroMoi"
                  height="22"
                  className="img-fluid"
                  style={{ maxWidth: "55px" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=22&width=55&text=TroMoi"
                  }}
                />
              </Navbar.Brand>

              {/* Right side */}
              <div className="d-flex align-items-center">
                {profile?.fullName ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      className="d-flex align-items-center border-0 rounded-pill px-3 py-2"
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=0145aa&color=fff&size=28`}
                        alt="User"
                        width="28"
                        height="28"
                        className="rounded-circle me-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=28&width=28&text=U"
                        }}
                      />
                      <span className="fw-medium">{profile.fullName}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="py-2 shadow border-0 rounded-3" style={{ minWidth: "200px" }}>
                      <Dropdown.Item as={Link} to="/personal-info" className="py-3 px-3">
                        <FaUser className="text-primary me-3" size={14} />
                        Thông tin cá nhân
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile" className="py-3 px-3">
                        <FaHome className="text-primary me-3" size={14} />
                        Dành cho chủ trọ
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout} className="py-3 px-3 text-danger">
                        <i className="fas fa-sign-out-alt me-3"></i>
                        Đăng xuất
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2 rounded-pill px-3 py-1"
                      onClick={() => setShowLogin(true)}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-3 rounded-pill px-3 py-1"
                      onClick={() => setShowRegister(true)}
                    >
                      Đăng ký
                    </Button>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-pill px-3 py-2 fw-medium"
                  onClick={handlePostRoomClick}
                  style={{
                    background: "linear-gradient(135deg, #0145aa 0%, #0056d3 100%)",
                    border: "none",
                  }}
                >
                  <i className="fa fa-paper-plane me-1"></i>
                  Đăng tin
                </Button>
              </div>
            </div>
          </Container>
        </Navbar>
      )}

      {/* Navbar cho mobile - Logo rất nhỏ */}
      {isMobile && (
        <Navbar
          bg="white"
          className="shadow-sm py-2"
          style={{
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <Container className="px-3">
            <div className="d-flex align-items-center justify-content-between w-100">
              {/* Menu Icon */}
              <button
                className="btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
                onClick={() => setShowMobileMenu(true)}
                style={{
                  backgroundColor: "#0145aa",
                  width: "40px",
                  height: "40px",
                  transition: "all 0.3s ease",
                }}
              >
                <FaBars size={14} color="white" />
              </button>

              {/* Center Logo - RẤT NHỎ */}
              <Navbar.Brand as={Link} to="/" className="mx-auto d-flex align-items-center">
                <img
                  src="https://tromoi.com/logo_mobile.png"
                  alt="TroMoi"
                  height="18"
                  className="img-fluid"
                  style={{ maxWidth: "45px" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=18&width=45&text=TroMoi"
                  }}
                />
              </Navbar.Brand>

              {/* Right side - User hoặc Auth */}
              <div className="d-flex align-items-center">
                {profile?.fullName ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="border-0 rounded-circle p-1">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=0145aa&color=fff&size=36`}
                        alt="User"
                        width="36"
                        height="36"
                        className="rounded-circle"
                        style={{ border: "2px solid #0145aa" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=36&width=36&text=U"
                        }}
                      />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="py-2 shadow border-0 rounded-3" style={{ minWidth: "180px" }}>
                      <Dropdown.Item as={Link} to="/personal-info" className="py-3 px-3">
                        <FaUser className="text-primary me-3" size={14} />
                        Thông tin cá nhân
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile" className="py-3 px-3">
                        <FaHome className="text-primary me-3" size={14} />
                        Dành cho chủ trọ
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout} className="py-3 px-3 text-danger">
                        <i className="fas fa-sign-out-alt me-3"></i>
                        Đăng xuất
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="btn p-2 rounded-circle border-0 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "#f8f9fa",
                      width: "40px",
                      height: "40px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <FaUser size={14} color="#0145aa" />
                  </button>
                )}
              </div>
            </div>
          </Container>
        </Navbar>
      )}

      {/* Fixed Post Button cho mobile */}
      {isMobile && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1000 }}>
          <button
            onClick={handlePostRoomClick}
            className="btn text-white fw-bold px-4 py-3 rounded-pill shadow-lg d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #0145aa 0%, #0056d3 100%)",
              border: "none",
              fontSize: "16px",
              boxShadow: "0 8px 25px rgba(1, 69, 170, 0.3)",
            }}
          >
            <i className="fa fa-paper-plane me-2"></i>
            Đăng tin ngay
          </button>
        </div>
      )}

      {/* Offcanvas Menu */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="start"
        backdrop={true}
        className="border-0"
        style={{ width: isMobile ? "85%" : "350px" }}
      >
        {/* Header với gradient đẹp */}
        <Offcanvas.Header
          className="border-0 pb-0 text-white"
          style={{
            background: "linear-gradient(135deg, #0145aa 0%, #0056d3 100%)",
            minHeight: "70px",
          }}
        >
          <Offcanvas.Title className="d-flex align-items-center">
            <img
              src="https://tromoi.com/logo_mobile.png"
              alt="TroMoi"
              height="20"
              className="me-2"
              style={{ filter: "brightness(0) invert(1)" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=20&width=50&text=TroMoi"
              }}
            />
            <span className="fw-bold">TroMoi</span>
          </Offcanvas.Title>
          <button
            className="btn p-2 rounded-circle border-0"
            onClick={() => setShowMobileMenu(false)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "white",
            }}
          >
            <FaTimes size={14} />
          </button>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          {/* User section nếu đã đăng nhập */}
          {profile?.fullName && (
            <div
              className="p-4 text-white border-bottom"
              style={{
                background: "linear-gradient(180deg, #0145aa 0%, rgba(1, 69, 170, 0.8) 100%)",
              }}
            >
              <div className="d-flex align-items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=ffffff&color=0145aa&size=50`}
                  alt="User"
                  width="50"
                  height="50"
                  className="rounded-circle me-3"
                  style={{ border: "2px solid white" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=50&width=50&text=U"
                  }}
                />
                <div>
                  <div className="fw-bold">{profile.fullName}</div>
                  <small className="opacity-75">Thành viên TroMoi</small>
                </div>
              </div>
            </div>
          )}

          {/* Auth buttons nếu chưa đăng nhập */}
          {!profile?.fullName && (
            <div
              className="p-4 border-bottom"
              style={{
                background: "linear-gradient(180deg, #0145aa 0%, rgba(1, 69, 170, 0.8) 100%)",
              }}
            >
              <div className="d-grid gap-2">
                <button
                  className="btn btn-light fw-bold py-2 rounded-pill"
                  onClick={() => {
                    setShowMobileMenu(false)
                    setShowLogin(true)
                  }}
                >
                  <FaUser className="me-2" />
                  Đăng nhập
                </button>
                <button
                  className="btn btn-outline-light fw-medium py-2 rounded-pill"
                  onClick={() => {
                    setShowMobileMenu(false)
                    setShowRegister(true)
                  }}
                >
                  Đăng ký tài khoản
                </button>
              </div>
            </div>
          )}

          {/* Menu items với icons đẹp */}
          <div className="flex-grow-1 bg-white">
            {categories.map((cat, index) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="d-flex align-items-center text-decoration-none text-dark p-4 border-bottom"
                onClick={() => setShowMobileMenu(false)}
                style={{
                  transition: "all 0.3s ease",
                  borderLeft: location.pathname === cat.path ? "4px solid #0145aa" : "4px solid transparent",
                  backgroundColor: location.pathname === cat.path ? "#f8f9fa" : "transparent",
                }}
              >
                <div
                  className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: location.pathname === cat.path ? "#0145aa" : "#f8f9fa",
                    color: location.pathname === cat.path ? "white" : "#0145aa",
                  }}
                >
                  <cat.icon size={16} />
                </div>
                <div>
                  <div className={`fw-medium ${location.pathname === cat.path ? "text-primary" : ""}`}>{cat.label}</div>
                  <small className="text-muted">
                    {index === 0 && "Tìm phòng trọ giá rẻ"}
                    {index === 1 && "Thuê nhà nguyên căn"}
                    {index === 2 && "Căn hộ chung cư"}
                    {index === 3 && "Video đánh giá"}
                    {index === 4 && "Tin tức & mẹo hay"}
                    {index === 5 && "Hỗ trợ khách hàng"}
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />
    </>
  )
}

export default Header
