import React, { useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
  Badge,
  Offcanvas,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../../pages/Login/LoginModal";
import RegisterModal from "../../pages/Register/RegisterModal";
import { FaBell, FaHeart, FaBars } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch, useResponsive } from "../../store/hook";
import { checkAndRefreshToken, logout } from '../../store/slices/authSlice';
import { upgradeUserRole } from "../../store/slices/userSlice";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.user);

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      dispatch(logout({ refreshToken }));
    }
    setTimeout(() => {
      window.location.reload()
    }, 5000);
  };

  // Hàm kiểm tra đăng nhập trước khi cho đăng trọ
  const handlePostRoomClick = async () => {
    if (!isAuthenticated || !profile) {
      toast.error("Vui lòng đăng nhập để đăng tin!", {
        position: "top-right",
        autoClose: 3000
      })
      setShowLogin(true)
      return
    }

    try {
      // Hiển thị thông báo đang xử lý
      toast.info("Đang chuẩn bị tài khoản để đăng tin...", {
        position: "top-right",
        autoClose: 2000
      });
      
      // Dispatch thunk upgradeUserRole
      const resultAction = await dispatch(upgradeUserRole());

      await dispatch(checkAndRefreshToken()).unwrap();
      
      // Kiểm tra kết quả dispatch
      if (upgradeUserRole.fulfilled.match(resultAction)) {
        // Xử lý khi thành công
        toast.success("Tài khoản đã được nâng cấp thành chủ trọ!", {
          position: "top-right",
          autoClose: 3000
        });
        
        // Chuyển hướng đến trang đăng tin
        navigate('/post-room');
      } else if (upgradeUserRole.rejected.match(resultAction)) {
        // Xử lý lỗi từ payload
        const errorPayload = resultAction.payload as any;
        
        // Kiểm tra lỗi 409 - đã có role phù hợp
        if (errorPayload?.status === 409) {
          toast.info("Bạn đã có quyền đăng tin!", {
            position: "top-right",
            autoClose: 2000
          });
          navigate('/post-room');
          return;
        }
        
        // Xử lý các lỗi khác
        toast.error(`Không thể nâng cấp tài khoản: ${errorPayload?.message || "Vui lòng thử lại sau"}`, {
          position: "top-right",
          autoClose: 3000
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi nâng cấp tài khoản:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau", {
        position: "top-right",
        autoClose: 3000
      });
    }
  }

  const categories = [
    { path: "/category/nha-tro-phong-tro", label: "Nhà trọ, phòng trọ" },
    { path: "/category/nha-nguyen-can", label: "Nhà nguyên căn" },
    { path: "/category/can-ho-chung-cu", label: "Căn hộ" },
    { path: "/category/video-review", label: "Review" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Liên hệ" },
  ];

  return (
    <>
      {/* Navbar cho desktop */}
      {!isMobile && (
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
                  const isActive = location.pathname === cat.path;
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
                  );
                })}
              </Nav>

              <Nav className="align-items-center">
                <Nav.Link className="position-relative me-3">
                  <FaBell size={20} />
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-75 translate-middle"
                  >
                    0
                  </Badge>
                </Nav.Link>

                <Nav.Link className="me-3">
                  <FaHeart size={20} />
                </Nav.Link>

                {profile?.fullName ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      className="d-flex align-items-center border-0"
                    >
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
                        <i className="far fa-user text-primary me-2"></i> Thông
                        tin cá nhân
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/account-info" className="py-3">
                        <i className="far fa-id-card text-primary me-2"></i> Thông
                        tin tài khoản
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile" className="py-3">
                        <i className="fas fa-home text-primary me-2"></i> Dành cho
                        chủ trọ
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout} className="py-3">
                        <i className="fas fa-sign-out-alt text-primary me-2"></i>{" "}
                        Đăng xuất
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

                <Button
                  variant="primary"
                  className="ms-3"
                  onClick={handlePostRoomClick}
                >
                  <i className="fa fa-paper-plane me-1"></i> Đăng tin ngay
                </Button>
              </Nav>
            </div>
          </Container>
        </Navbar>
      )}

      {/* Navbar cho mobile */}
      {isMobile && (
        <Navbar bg="white" className="shadow-sm py-2">
          <Container className="px-2">
            {/* Menu Icon */}
            <button
              className="btn border-0 px-1"
              onClick={() => setShowMobileMenu(true)}
              style={{ padding: '0', background: 'transparent' }}
            >
              <FaBars size={22} />
            </button>

            {/* Center Logo */}
            <Navbar.Brand
              as={Link}
              to="/"
              className="m-0 mx-auto"
            >
              <img
                src="https://tromoi.com/logo_mobile.png"
                alt="TroMoi"
                height="30"
              />
            </Navbar.Brand>

            {/* Right Authentication */}
            <div className="d-flex align-items-center">
              <Link 
                to="/login" 
                className="btn text-dark px-1"
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogin(true);
                }}
              >
                <img 
                  src="https://tromoi.com/frontend/home/images/icon_signin.svg" 
                  alt="Đăng nhập"
                  width="26"
                />
              </Link>
              <Link 
                to="/register" 
                className="btn text-dark px-1"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(true);
                }}
              >
                <img 
                  src="https://tromoi.com/frontend/home/images/icon_signup.svg" 
                  alt="Đăng ký"
                  width="26"
                />
              </Link>
              <button
                onClick={handlePostRoomClick}
                className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center ms-1"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="fa fa-paper-plane"></i>
              </button>
            </div>
          </Container>
        </Navbar>
      )}

      {/* Offcanvas Menu cho mobile */}
      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="start"
        backdrop={true}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <img
              src="https://tromoi.com/logo_mobile.png"
              alt="TroMoi"
              height="30"
            />
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          {/* Danh sách menu đứng dạng full width */}
          <div className="list-group list-group-flush">
            {categories.map((cat) => (
              <Link 
                key={cat.path}
                to={cat.path}
                className="list-group-item list-group-item-action border-0 border-bottom py-3"
                onClick={() => setShowMobileMenu(false)}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal
        show={showRegister}
        handleClose={() => setShowRegister(false)}
      />
    </>
  );
};

export default Header;