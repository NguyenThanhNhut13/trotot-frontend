import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Row,
  Col,
  Dropdown,
  Card,
  Container,
} from "react-bootstrap";
import RoomList from "../../components/slider/RoomList";
import HotListings from "../ProductList/HotListings";
import ProvinceListings from "../../components/common/ProvinceListings ";
import { FaDollarSign, FaMap, FaSearch } from "react-icons/fa";
import addressAPI from "../../apis/address.api";
import { District, Province, Ward } from "../../types/address.type";
import LoginModal from "../../pages/Login/LoginModal";
import { useAppDispatch, useAppSelector, useResponsive } from "../../store/hook";
import { fetchRoomsByType } from "../../store/slices/roomListingsSlice";
import { selectLastFetched, selectListingsByType } from "../../store/selectors/roomListings.selectors";

const HomePage = () => {
  const { isMobile, isTablet } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState("tat-ca");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  const [priceRange, setPriceRange] = useState("all");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const [areaRange, setAreaRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  const [isRedirected, setIsRedirected] = useState(false);

  const apartmentListings = useAppSelector(state => 
    selectListingsByType(state, 'APARTMENT')
  );
  
  const apartmentLastFetched = useAppSelector(state => 
    selectLastFetched(state, 'APARTMENT')
  );

  // useEffect(() => {
  //   const trainAI = async () => {
  //     try {
  //       const response = await roomApi.aiTrainMode();
  //     } catch (error) {
  //       console.error("Error train:", error);
  //     }
  //   };

  //   trainAI();
  // })

  useEffect(() => {
    if (location.state && (location.state.skipFetch || location.state.isRedirect)) {
      // Ghi nhớ trạng thái redirect
      setIsRedirected(true);
      console.log("Skipping data fetch due to redirect");
      return;
    }
  }, [location]);

  useEffect(() => {
    if (isRedirected) {
      // Đặt timeout để reset biến sau khi đã hiển thị trang
      const timer = setTimeout(() => {
        setIsRedirected(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isRedirected]);

  useEffect(() => {
    if (isRedirected) {
      console.log("Skipping apartment fetch due to redirect state");
      return;
    }

    const hasData = apartmentListings.length > 0;
    const isDataFresh = apartmentLastFetched && 
      (Date.now() - apartmentLastFetched < 5 * 60 * 1000); // 5 minutes
    
    if (!hasData || !isDataFresh) {
      dispatch(fetchRoomsByType({ roomType: 'APARTMENT' }));
    }
  }, [dispatch, apartmentListings.length, apartmentLastFetched]); 

  useEffect(() => {
    if (isRedirected) {
      console.log("Skipping provinces fetch due to redirect state");
      return;
    }

    // Load provinces
    const fetchProvinces = async () => {
      try {
        const response = await addressAPI.getProvinces();
        setProvinces(response.data.data.data as Province[]);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    
    fetchProvinces();
  }, []);

  // Handle saving rooms (shows login modal for unauthenticated users)
  const handleSaveRoom = (roomId: number) => {
    localStorage.setItem("pendingAction", "save-room");
    localStorage.setItem("pendingRoomId", roomId.toString());
    setPendingRoomId(roomId.toString());
    setShowLoginModal(true);
  };
  
  // Handle login modal close
  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  // Fetch provinces on component mount
  useEffect(() => {
    if (isRedirected) {
      console.log("Skipping provinces fetch due to redirect state");
      return;
    }

    const fetchProvinces = async () => {
      if (localStorage.getItem("provinces")) {
        const cachedProvinces = localStorage.getItem("provinces");
        if (cachedProvinces) {
          setProvinces(JSON.parse(cachedProvinces) as Province[]);
          return;
        }
      }
      try {
        setLoading(true);
        const response = await addressAPI.getProvinces();
        if (response.data && response.data.data && response.data.data.data) {
          setProvinces(response.data.data.data as Province[]);
          localStorage.setItem(
            "provinces",
            JSON.stringify(response.data.data.data as Province[])
          );
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (isRedirected) return;

    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }

      try {
        setLoading(true);
        const response = await addressAPI.getDistricts(selectedProvince);
        if (response.data && response.data.data && response.data.data.data) {
          setDistricts(response.data.data.data as District[]);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    // Reset dependent fields
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (isRedirected) return;

    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        return;
      }

      try {
        setLoading(true);
        const response = await addressAPI.getWards(selectedDistrict);
        if (response.data && response.data.data && response.data.data.data) {
          setWards(response.data.data.data as Ward[]);
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
    // Reset dependent field
    setSelectedWard("");
  }, [selectedDistrict]);

  // Reset location selections
  const resetLocationSelections = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
  };

  const handleAreaRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAreaRange(e.target.id);
  };

  const areaLabelMap: Record<string, string> = {
    "all-area": "Tất cả diện tích",
    "under-20": "Dưới 20 m²",
    "20-40": "20m² - 40 m²",
    "40-60": "40m² - 60 m²",
    "60-80": "60m² - 80 m²",
    "80-plus": "Trên 80 m²",
  };

  const resetAreaFilters = () => {
    setAreaRange("all-area");
  };

  const priceLabelMap: Record<string, string> = {
    all: "Tất cả mức giá",
    "under-1m": "Dưới 1 triệu",
    "1-10m": "1 - 10 triệu",
    "10-30m": "10 - 30 triệu",
    "30-50m": "30 - 50 triệu",
    "50m-plus": "Trên 50 triệu",
    "100m-plus": "Trên 100 triệu",
  };

  // Lấy room type từ selected category
  const getRoomTypeFromCategory = () => {
    switch (selectedCategory) {
      case "nha-tro-phong-tro":
        return "BOARDING_HOUSE";
      case "nha-nguyen-can":
        return "WHOLE_HOUSE";
      case "can-ho-chung-cu":
        return "APARTMENT";
      default:
        return null; // Nếu là "tất cả"
    }
  };

  // Chuyển đổi areaRange sang định dạng để lọc
  const getAreaRangeParam = () => {
    switch (areaRange) {
      case "under-20":
        return "0-20";
      case "20-40":
        return "20-40";
      case "40-60":
        return "40-60";
      case "60-80":
        return "60-80";
      case "80-plus":
        return "80-1000";
      default:
        return null;
    }
  };

  // Chuyển đổi priceRange sang định dạng để lọc
  const getPriceRangeParam = () => {
    // Sử dụng minPrice và maxPrice nếu đã nhập
    if (minPriceInput || maxPriceInput) {
      return {
        minPrice: minPriceInput
          ? parseFloat(minPriceInput) * 1000000
          : undefined,
        maxPrice: maxPriceInput
          ? parseFloat(maxPriceInput) * 1000000
          : undefined,
      };
    }

    // Nếu không, sử dụng priceRange đã chọn
    switch (priceRange) {
      case "under-1m":
        return { minPrice: 0, maxPrice: 1000000 };
      case "1-10m":
        return { minPrice: 1000000, maxPrice: 10000000 };
      case "10-30m":
        return { minPrice: 10000000, maxPrice: 30000000 };
      case "30-50m":
        return { minPrice: 30000000, maxPrice: 50000000 };
      case "50m-plus":
        return { minPrice: 50000000, maxPrice: undefined };
      case "100m-plus":
        return { minPrice: 100000000, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const roomType = getRoomTypeFromCategory();
    const areaRangeParam = getAreaRangeParam();
    const { minPrice, maxPrice } = getPriceRangeParam();

    const searchParams = {
      query: searchQuery,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      minPrice,
      maxPrice,
      areaRange: areaRangeParam,
      roomType,
    };

    // Lưu searchParams vào localStorage
    localStorage.setItem("searchParams", JSON.stringify(searchParams));

    // Chuyển hướng người dùng đến trang category phù hợp
    if (roomType) {
      // Nếu đã chọn một loại phòng cụ thể
      navigate(`/category/${selectedCategory}`);
    } else {
      // Nếu chọn "tất cả"
      navigate("/category/tat-ca");
    }
  };

  return (
    <div>
      <div
        className="banner position-relative"
        style={{
          background: "linear-gradient(to right, #00052e, #010c3a, #1a237e)",
          backgroundImage:
            "url('https://tromoi.com/frontend/home/images/banner_default.jpg')",
          backgroundSize: "cover",
          padding: isMobile ? "30px 0 15px" : "50px 0 20px",
          overflow: "visible",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Container>
          {/* QC 01 */}
          <Row className="align-items-center">
            <Col md={7} className="text-white px-4">
              <h1
                className="fw-bold"
                style={{ 
                  fontSize: isMobile ? "2rem" : isTablet ? "2.5rem" : "3rem", 
                  lineHeight: 1.2 
                }}
              >
                TÌM NHANH, KIẾM DỄ
              </h1>
              <h1
                className="fw-bold mb-4"
                style={{ 
                  fontSize: isMobile ? "2rem" : isTablet ? "2.5rem" : "3rem", 
                  lineHeight: 1.2 
                }}
              >
                TRỌ MỚI TOÀN QUỐC
              </h1>
              <p className="mb-4" style={{ fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                Trang thông tin và cho thuê phòng trọ nhanh chóng, hiệu quả với
                {!isMobile && <br />}
                hơn 500 tin đăng mới và 30.000 lượt xem mỗi ngày
              </p>
            </Col>
          </Row>

          <div className="">
            {/* Filter Section */}
            <Row className="mb-0 ">
              <Col className={isMobile ? "px-0" : ""}>
                {/* Category Tabs - Responsive */}
                {isMobile ? (
                  // Mobile category dropdown
                  <div className="mb-2 px-2">
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="form-select py-3 fw-bold"
                    >
                      <option value="tat-ca">Tất cả</option>
                      <option value="nha-tro-phong-tro">Nhà trọ, phòng trọ</option>
                      <option value="nha-nguyen-can">Nhà nguyên căn</option>
                      <option value="can-ho-chung-cu">Căn hộ</option>
                    </Form.Select>
                  </div>
                ) : (
                  // Desktop tabs
                  <div className="d-flex bg-transparent">
                    <Button
                      variant="primary"
                      className="d-inline-block py-3 border-0 fw-bold"
                      onClick={() => setSelectedCategory("tat-ca")}
                      style={{
                        backgroundColor:
                          selectedCategory === "tat-ca" ? "#0046a8" : "#e5ecf6",
                        color:
                          selectedCategory === "tat-ca" ? "#ffffff" : "#0046a8",
                        padding: "0 60px",
                        borderRadius: "8px 8px 0 0",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      Tất cả
                    </Button>
                    <Button
                      variant="light"
                      className="d-inline-block py-3 border-0 fw-bold"
                      onClick={() => setSelectedCategory("nha-tro-phong-tro")}
                      style={{
                        backgroundColor:
                          selectedCategory === "nha-tro-phong-tro"
                            ? "#0046a8"
                            : "#e5ecf6",
                        color:
                          selectedCategory === "nha-tro-phong-tro"
                            ? "#ffffff"
                            : "#0046a8",
                        marginLeft: "2px",
                        padding: "0 60px",
                        borderRadius: "8px 8px 0 0",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      Nhà trọ, phòng trọ
                    </Button>
                    <Button
                      variant="light"
                      className="d-inline-block py-3 border-0 fw-bold"
                      onClick={() => setSelectedCategory("nha-nguyen-can")}
                      style={{
                        backgroundColor:
                          selectedCategory === "nha-nguyen-can"
                            ? "#0046a8"
                            : "#e5ecf6",
                        color:
                          selectedCategory === "nha-nguyen-can"
                            ? "#ffffff"
                            : "#0046a8",
                        marginLeft: "2px",
                        padding: "0 60px",
                        borderRadius: "8px 8px 0 0",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      Nhà nguyên căn
                    </Button>
                    <Button
                      variant="light"
                      className="d-inline-block py-3 border-0 fw-bold"
                      onClick={() => setSelectedCategory("can-ho-chung-cu")}
                      style={{
                        backgroundColor:
                          selectedCategory === "can-ho-chung-cu"
                            ? "#0046a8"
                            : "#e5ecf6",
                        color:
                          selectedCategory === "can-ho-chung-cu"
                            ? "#ffffff"
                            : "#0046a8",
                        marginLeft: "2px",
                        padding: "0 60px",
                        borderRadius: "8px 8px 0 0",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      Căn hộ
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
            {/* Filter Inputs - Responsive */}
            <Row className="g-0 position-relative" style={{ zIndex: 1000 }}>
              <Col>
                {isMobile ? (
                  // Mobile vertical stacked filters
                  <div
                    className="p-2"
                    style={{
                      backgroundColor: "#0046a8",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    {/* Search input */}
                    <div className="mb-2">
                      <div className="input-group rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0 d-flex align-items-center">
                          <FaSearch color="#0046a8" />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Bạn muốn tìm trọ ở đâu?"
                          className="border-0 py-2"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="mb-2">
                      <Dropdown className="w-100">
                        <Dropdown.Toggle 
                          className="bg-white text-secondary border-0 w-100 text-start d-flex align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center">
                            <span className="input-group-text bg-white border-0 p-0 me-3 ms-3">
                              <FaMap color="#0046a8" />
                            </span>
                            {selectedWard ? (
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                                {(wards.find((w) => w.code === selectedWard)?.name || "") +
                                  ", " +
                                  (districts.find((d) => d.code === selectedDistrict)?.name || "") +
                                  ", " +
                                  (provinces.find((p) => p.code === selectedProvince)?.name || "")}
                              </span>
                            ) : selectedDistrict ? (
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                                {(districts.find((d) => d.code === selectedDistrict)?.name || "") +
                                  ", " +
                                  (provinces.find((p) => p.code === selectedProvince)?.name || "")}
                              </span>
                            ) : selectedProvince ? (
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                                {provinces.find((p) => p.code === selectedProvince)?.name || ""}
                              </span>
                            ) : (
                              <span>Địa điểm</span>
                            )}
                          </div>
                        </Dropdown.Toggle>
                        
                        {/* Dropdown Menu cho địa điểm */}
                        <Dropdown.Menu className="w-100 shadow border-0 p-0 mt-1">
                          <div className="p-3">
                            <h6 className="fw-bold text-primary mb-3">Chọn khu vực</h6>
                            
                            <Form.Group controlId="mobile-province" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Tỉnh/Thành phố</Form.Label>
                              <Form.Select
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                                className="form-select"
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((province) => (
                                  <option key={province.code} value={province.code}>
                                    {province.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group controlId="mobile-district" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Quận/Huyện</Form.Label>
                              <Form.Select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedProvince}
                                className={`form-select ${!selectedProvince ? 'bg-light' : ''}`}
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Quận/Huyện --</option>
                                {districts.map((district) => (
                                  <option key={district.code} value={district.code}>
                                    {district.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group controlId="mobile-ward" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Phường/Xã</Form.Label>
                              <Form.Select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedDistrict}
                                className={`form-select ${!selectedDistrict ? 'bg-light' : ''}`}
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Phường/Xã --</option>
                                {wards.map((ward) => (
                                  <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={resetLocationSelections}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                
                    {/* Price Range - Sửa lại để có thể click được */}
                    <div className="mb-2">
                      <Dropdown className="w-100">
                        <Dropdown.Toggle className="bg-white text-secondary border-0 w-100 text-start d-flex align-items-center justify-content-between">
                          <span className="input-group-text bg-white border-0">
                            <FaDollarSign color="#0046a8" />
                          </span>
                          <span className="text-start w-100">
                            {minPriceInput || maxPriceInput
                              ? `Từ ${minPriceInput || "0"} → ${maxPriceInput || "∞"} triệu`
                              : priceLabelMap[priceRange] || "Mức giá"}
                          </span>
                        </Dropdown.Toggle>
                        
                        {/* Dropdown Menu cho giá */}
                        <Dropdown.Menu className="w-100">
                          <div className="p-3">
                            <h6 className="mb-3">Chọn mức giá</h6>
                            
                            {/* Mức giá mặc định */}
                            <div className="mb-3">
                              {Object.keys(priceLabelMap).map((price) => (
                                <Form.Check
                                  key={price}
                                  type="radio"
                                  id={price}
                                  name="priceRange"
                                  label={priceLabelMap[price]}
                                  checked={priceRange === price}
                                  onChange={() => {
                                    setPriceRange(price);
                                    setMinPriceInput("");
                                    setMaxPriceInput("");
                                  }}
                                  className="mb-2"
                                />
                              ))}
                            </div>
                            
                            {/* Tùy chọn giá */}
                            <div className="mb-3">
                              <h6 className="small fw-bold mb-2">Tùy chọn giá (đơn vị: triệu)</h6>
                              <div className="d-flex">
                                <div className="me-2 flex-grow-1">
                                  <Form.Control
                                    type="number"
                                    placeholder="Từ"
                                    size="sm"
                                    value={minPriceInput}
                                    onChange={(e) => {
                                      setMinPriceInput(e.target.value);
                                      setPriceRange("custom");
                                    }}
                                  />
                                </div>
                                <div className="me-2">-</div>
                                <div className="flex-grow-1">
                                  <Form.Control
                                    type="number"
                                    placeholder="Đến"
                                    size="sm"
                                    value={maxPriceInput}
                                    onChange={(e) => {
                                      setMaxPriceInput(e.target.value);
                                      setPriceRange("custom");
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setPriceRange("all");
                                  setMinPriceInput("");
                                  setMaxPriceInput("");
                                }}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                                         
                    {/* Area Range */}
                    <div className="mb-2">
                      <Dropdown className="w-100">
                        <Dropdown.Toggle className="bg-white text-secondary border-0 w-100 text-start d-flex align-items-center justify-content-between">
                          <span className="input-group-text bg-white border-0">
                            <span style={{ color: "#0046a8" }}>m²</span>
                          </span>
                          <span className="text-start w-100">
                            {areaLabelMap[areaRange] || "Diện tích"}
                          </span>
                        </Dropdown.Toggle>
                        
                        {/* Dropdown Menu cho diện tích */}
                        <Dropdown.Menu className="w-100">
                          <div className="p-3">
                            <h6 className="mb-3">Chọn diện tích</h6>
                            
                            {Object.keys(areaLabelMap).map((area) => (
                              <Form.Check
                                key={area}
                                type="radio"
                                id={area}
                                name="areaRange"
                                label={areaLabelMap[area]}
                                checked={areaRange === area}
                                onChange={(e) => handleAreaRangeChange(e)}
                                className="mb-2"
                              />
                            ))}
                            <div className="d-flex justify-content-end mt-3">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={resetAreaFilters}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    {/* Search button full width on mobile */}
                    <div className="mt-2">
                      <Button
                        variant="danger"
                        className="py-2 w-100 border-0 rounded-3 fw-bold"
                        style={{ backgroundColor: "#ff5a00" }}
                        onClick={handleSearch}
                      >
                        <FaSearch className="me-2" /> Tìm kiếm
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Desktop horizontal filters
                  <div
                    className="d-flex p-2 align-items-stretch"
                    style={{
                      backgroundColor: "#0046a8",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    {/* Input: Ban muon tim tro o dau */}
                    <div className="flex-grow-1 px-1" style={{ maxWidth: "270px" }}>
                      <div className="input-group rounded-3 overflow-hidden h-100">
                        <span className="input-group-text bg-white border-0 h-100 d-flex align-items-center">
                          <FaSearch color="#0046a8" />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Bạn muốn tìm trọ ở đâu?"
                          className="border-0 py-2"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="flex-grow-1 px-1" style={{ maxWidth: "270px" }}>
                      <Dropdown className="h-100">
                        <Dropdown.Toggle className="btn bg-white text-secondary border-0 w-100 h-100 text-start d-flex align-items-center justify-content-between dropdown-toggle">
                          <div className="d-flex align-items-center">
                            <span className="input-group-text bg-white border-0 p-0 me-3 ms-3">
                              <FaMap color="#0046a8" />
                            </span>
                            {selectedWard ? (
                              <span className="text-truncate">
                                {wards.find((w) => w.code === selectedWard)?.name || ""}
                              </span>
                            ) : selectedDistrict ? (
                              <span className="text-truncate">
                                {districts.find((d) => d.code === selectedDistrict)?.name || ""}
                              </span>
                            ) : selectedProvince ? (
                              <span className="text-truncate">
                                {provinces.find((p) => p.code === selectedProvince)?.name || ""}
                              </span>
                            ) : (
                              <span>Địa điểm</span>
                            )}
                          </div>
                        </Dropdown.Toggle>
                        
                        {/* Location dropdown menu */}
                        <Dropdown.Menu className="w-100 shadow border-0 p-0 mt-1" style={{ minWidth: "300px" }}>
                          <div className="p-3">
                            <h6 className="fw-bold text-primary mb-3">Chọn khu vực</h6>
                            
                            <Form.Group controlId="desktop-province" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Tỉnh/Thành phố</Form.Label>
                              <Form.Select
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
                                className="form-select"
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                {provinces.map((province) => (
                                  <option key={province.code} value={province.code}>
                                    {province.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group controlId="desktop-district" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Quận/Huyện</Form.Label>
                              <Form.Select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedProvince}
                                className={`form-select ${!selectedProvince ? 'bg-light' : ''}`}
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Quận/Huyện --</option>
                                {districts.map((district) => (
                                  <option key={district.code} value={district.code}>
                                    {district.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <Form.Group controlId="desktop-ward" className="mb-3">
                              <Form.Label className="text-dark mb-1 fw-bold small">Phường/Xã</Form.Label>
                              <Form.Select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedDistrict}
                                className={`form-select ${!selectedDistrict ? 'bg-light' : ''}`}
                                style={{ fontSize: '14px', borderColor: '#dee2e6', padding: '8px 12px' }}
                              >
                                <option value="">-- Chọn Phường/Xã --</option>
                                {wards.map((ward) => (
                                  <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                            
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={resetLocationSelections}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    {/* Price */}
                    <div className="flex-grow-1 px-1" style={{ maxWidth: "270px" }}>
                      <Dropdown className="h-100">
                        <Dropdown.Toggle className="bg-white text-secondary border-0 w-100 h-100 text-start d-flex align-items-center">
                          <span className="input-group-text bg-white border-0">
                            <FaDollarSign color="#0046a8" />
                          </span>
                          <span className="text-start w-100 ms-2">
                            {minPriceInput || maxPriceInput
                              ? `${minPriceInput || "0"} → ${maxPriceInput || "∞"} triệu`
                              : priceLabelMap[priceRange] || "Mức giá"}
                          </span>
                        </Dropdown.Toggle>
                        
                        {/* Price dropdown menu */}
                        <Dropdown.Menu className="w-100">
                          <div className="p-3">
                            <h6 className="mb-3">Chọn mức giá</h6>
                            
                            {/* Mức giá mặc định */}
                            <div className="mb-3">
                              {Object.keys(priceLabelMap).map((price) => (
                                <Form.Check
                                  key={price}
                                  type="radio"
                                  id={price}
                                  name="priceRange"
                                  label={priceLabelMap[price]}
                                  checked={priceRange === price}
                                  onChange={() => {
                                    setPriceRange(price);
                                    setMinPriceInput("");
                                    setMaxPriceInput("");
                                  }}
                                  className="mb-2"
                                />
                              ))}
                            </div>
                            
                            {/* Tùy chọn giá */}
                            <div className="mb-3">
                              <h6 className="small fw-bold mb-2">Tùy chọn giá (đơn vị: triệu)</h6>
                              <div className="d-flex">
                                <div className="me-2 flex-grow-1">
                                  <Form.Control
                                    type="number"
                                    placeholder="Từ"
                                    size="sm"
                                    value={minPriceInput}
                                    onChange={(e) => {
                                      setMinPriceInput(e.target.value);
                                      setPriceRange("custom");
                                    }}
                                  />
                                </div>
                                <div className="me-2">-</div>
                                <div className="flex-grow-1">
                                  <Form.Control
                                    type="number"
                                    placeholder="Đến"
                                    size="sm"
                                    value={maxPriceInput}
                                    onChange={(e) => {
                                      setMaxPriceInput(e.target.value);
                                      setPriceRange("custom");
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setPriceRange("all");
                                  setMinPriceInput("");
                                  setMaxPriceInput("");
                                }}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    {/* Area */}
                    <div className="flex-grow-1 px-1" style={{ maxWidth: "270px" }}>
                      <Dropdown className="h-100">
                        <Dropdown.Toggle className="bg-white text-secondary border-0 w-100 h-100 text-start d-flex align-items-center">
                          <span className="input-group-text bg-white border-0">
                            <span style={{ color: "#0046a8" }}>m²</span>
                          </span>
                          <span className="text-start w-100 ms-2">
                            {areaLabelMap[areaRange] || "Diện tích"}
                          </span>
                        </Dropdown.Toggle>
                        
                        {/* Area dropdown menu */}
                        <Dropdown.Menu className="w-100">
                          <div className="p-3">
                            <h6 className="mb-3">Chọn diện tích</h6>
                            
                            {Object.keys(areaLabelMap).map((area) => (
                              <Form.Check
                                key={area}
                                type="radio"
                                id={area}
                                name="areaRange"
                                label={areaLabelMap[area]}
                                checked={areaRange === area}
                                onChange={(e) => handleAreaRangeChange(e)}
                                className="mb-2"
                              />
                            ))}
                            <div className="d-flex justify-content-end mt-3">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={resetAreaFilters}
                              >
                                Đặt lại
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Đóng dropdown sau khi chọn xong
                                  document.body.click();
                                }}
                              >
                                Xác nhận
                              </Button>
                            </div>
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    {/* Button tim kiem */}
                    <div className="flex-shrink-0 px-1 d-flex align-items-stretch">
                      <Button
                        variant="danger"
                        className="py-2 px-4 border-0 rounded-3 fw-bold h-100"
                        style={{ backgroundColor: "#ff5a00" }}
                        onClick={handleSearch}
                      >
                        <FaSearch className="me-2" /> Tìm kiếm
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      {/* Banner Section with Images */}
      <Container className="mt-4" style={{ position: "relative", zIndex: 1 }}>
        <Row className="g-3 mb-5">
          <Col md={4} sm={12} className="mb-3 mb-md-0">
            <div className="bg-primary bg-opacity-10 rounded p-2 text-center">
              <img
                src="https://tromoi.com/frontend/home/images/banners/banner_tang_30.webp"
                alt="Promotion"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col md={4} sm={6} className="mb-3 mb-md-0">
            <div className="bg-primary bg-opacity-10 rounded p-2 text-center">
              <img
                src="https://tromoi.com/frontend/home/images/banners/banner_dang_tro_nhanh.jpg"
                alt="Fast Booking"
                className="img-fluid"
              />
            </div>
          </Col>
          <Col md={4} sm={6}>
            <div className="bg-primary bg-opacity-10 rounded p-2 text-center">
              <img
                src="https://tromoi.com/frontend/home/images/banners/banner_video_review.jpg"
                alt="Video Reviews"
                className="img-fluid"
              />
            </div>
          </Col>
        </Row>
      </Container>

      <HotListings roomType="APARTMENT" title="LỰA CHỌN CHỖ Ở HOT" onSaveRoom={handleSaveRoom} isRedirected={isRedirected} />
      <RoomList />
      <HotListings roomType="WHOLE_HOUSE" title="NHÀ NGUYÊN CĂN CHO THUÊ" onSaveRoom={handleSaveRoom} isRedirected={isRedirected} />
      <HotListings roomType="BOARDING_HOUSE" title="NHÀ TRỌ, PHÒNG TRỌ" onSaveRoom={handleSaveRoom} isRedirected={isRedirected} />
      <ProvinceListings provinces={provinces} />
      <LoginModal 
        show={showLoginModal}
        handleClose={handleLoginModalClose}
      />
    </div>
  );
};

export default HomePage;
