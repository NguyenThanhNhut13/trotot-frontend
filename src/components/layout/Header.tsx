import React, { useState, useEffect, useContext } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginModal from "../../pages/Login/LoginModal";
import RegisterModal from "../../pages/Register/RegisterModal";
import authApi from "../../apis/auth.api";
import { useMutation } from "@tanstack/react-query";
import { AppContext } from "../../contexts/app.context";
import { FaBell, FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { profile } = useAppSelector(state => state.user);

  const { setIsAuthenticated, setProfile, profile } = useContext(AppContext)

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setIsAuthenticated(false)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setProfile(null)
      navigate('/')
    }
  })

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
  const handlePostRoomClick = () => {
    if (!profile) {
      toast.error("Vui lòng đăng nhập để đăng tin!", {
        position: "top-right",
        autoClose: 3000
      })
      setShowLogin(true)
      return
    }
    navigate('/post-room')
  }

  const categories = [
    { path: "/category/nha-tro-phong-tro", label: "Nhà trọ, phòng trọ" },
    { path: "/category/nha-nguyen-can", label: "Nhà nguyên căn" },
    { path: "/category/can-ho-chung-cu", label: "Căn hộ" },
    { path: "/category/video-review", label: "Video review" },
    { path: "/category/blog", label: "Blog" },
  ];

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="me-4">
            <img
              src="https://tromoi.com/logo_mobile.png"
              alt="TroMoi"
              height="40"
              className="d-inline-block align-top"
            />

            {/* <span className="fw-bold fs-4" style={{ color: "#103272" }}>
              TRỌ MỚI
            </span> */}
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
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
                      transition: "all 0.2s ease-in-out",
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
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
      <RegisterModal
        show={showRegister}
        handleClose={() => setShowRegister(false)}
      />
    </>
  );
};

export default Header;
