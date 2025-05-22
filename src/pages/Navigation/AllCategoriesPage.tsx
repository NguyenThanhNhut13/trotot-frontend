import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Form,
  Dropdown,
  InputGroup,
  Spinner,
  Nav,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import {
  Amenity,
  Room,
  RoomSearchParams,
  SurroundingArea,
  TargetAudience,
} from "../../types/room.type";
import roomApi from "../../apis/room.api";
import { Listing } from "./CategorySharedPage";

const AllCategoriesPage = () => {
  const [activeTab, setActiveTab] = useState<
    "BOARDING_HOUSE" | "WHOLE_HOUSE" | "APARTMENT" | null
  >(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<any>(null);
  const [filterError, setFilterError] = useState<string | null>(null); // Lỗi khi lấy bộ lọc
  const [searchError, setSearchError] = useState<string | null>(null); // Lỗi khi tìm kiếm
  const maxRetries = 3; // Số lần retry tối đa

  // API data states
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([]);
  const [surroundingAreas, setSurroundingAreas] = useState<SurroundingArea[]>(
    []
  );

  // Initialize selectedFilters
  const [selectedFilters, setSelectedFilters] = useState({
    area: [] as string[],
    amenities: [] as string[],
    targetAudiences: [] as string[],
    surroundingAreas: [] as string[],
  });

  // Area filter options
  const areaOptions = [
    { id: "under20", label: "Dưới 20 m2" },
    { id: "20-40", label: "20-40 m2" },
    { id: "40-60", label: "40-60 m2" },
    { id: "60-80", label: "60-80 m2" },
    { id: "above80", label: "Trên 80 m2" },
  ];

  // Fetch filters from API or localStorage
  useEffect(() => {
    const amenitiesLS = localStorage.getItem(`amenities`);
    const targetAudiencesLS = localStorage.getItem(`targetAudiences`);
    const surroundingAreasLS = localStorage.getItem(`surroundingAreas`);

    if (amenitiesLS && targetAudiencesLS && surroundingAreasLS) {
      try {
        setAmenities(JSON.parse(amenitiesLS));
        setTargetAudiences(JSON.parse(targetAudiencesLS));
        setSurroundingAreas(JSON.parse(surroundingAreasLS));
        return;
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    const fetchFilters = async (attempt = 1) => {
      setIsLoading(true);
      setFilterError(null); // Reset filter error state
      try {
        // Fetch amenities
        const amenitiesResponse = await roomApi.getAmenities();
        if (amenitiesResponse.data && amenitiesResponse.data.data) {
          localStorage.setItem(
            `amenities`,
            JSON.stringify(amenitiesResponse.data.data)
          );
          setAmenities(amenitiesResponse.data.data);
        }

        // Fetch target audiences
        const targetAudiencesResponse = await roomApi.getTargetAudiences();
        if (targetAudiencesResponse.data && targetAudiencesResponse.data.data) {
          localStorage.setItem(
            `targetAudiences`,
            JSON.stringify(targetAudiencesResponse.data.data)
          );
          setTargetAudiences(targetAudiencesResponse.data.data);
        }

        // Fetch surrounding areas
        const surroundingAreasResponse = await roomApi.getSurroundingAreas();
        if (
          surroundingAreasResponse.data &&
          surroundingAreasResponse.data.data
        ) {
          localStorage.setItem(
            `surroundingAreas`,
            JSON.stringify(surroundingAreasResponse.data.data)
          );
          setSurroundingAreas(surroundingAreasResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
        if (attempt <= maxRetries) {
          const delay = 3000 + (attempt - 1) * 1000; // 3s, 4s, 5s
          setTimeout(() => fetchFilters(attempt + 1), delay);
        } else {
          setFilterError("Không thể tải bộ lọc. Vui lòng thử lại sau.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Fetch search params and perform search
  useEffect(() => {
    const params = localStorage.getItem("searchParams");
    if (params) {
      try {
        const parsedParams = JSON.parse(params);
        setSearchParams(parsedParams);
        performSearch(parsedParams);
      } catch (error) {
        console.error("Error parsing search params:", error);
      }
    } else {
      // If no search params, load all rooms
      performSearch({});
    }
  }, []);

  // Handle tab change
  const handleTabChange = (
    roomType: "BOARDING_HOUSE" | "WHOLE_HOUSE" | "APARTMENT" | null
  ) => {
    setActiveTab(roomType);

    if (searchParams) {
      // Add roomType to searchParams and search again
      const newParams = { ...searchParams, roomType };
      performSearch(newParams);
    } else {
      // If no searchParams, search by roomType only
      performSearch({ roomType });
    }
  };

  // Perform search with given params
  const performSearch = async (params: any, attempt = 1) => {
    setIsSearching(true);
    setSearchError(null); // Reset search error state
    try {
      const searchRoomParams: RoomSearchParams = {
        page: 0,
        size: 10,
      };

      // Add roomType if provided
      if (params.roomType) {
        searchRoomParams.roomType = params.roomType;
      }

      // Add other params if they exist
      if (params.query) {
        searchRoomParams.street = params.query;
      }

      if (params.province) {
        searchRoomParams.city = params.province;
      }

      if (params.district) {
        searchRoomParams.district = params.district;
      }

      if (params.minPrice !== undefined) {
        searchRoomParams.minPrice = params.minPrice;
      }

      if (params.maxPrice !== undefined) {
        searchRoomParams.maxPrice = params.maxPrice;
      }

      if (params.areaRange) {
        searchRoomParams.areaRange = params.areaRange;
      }

      // Call search API
      const response = await roomApi.searchRooms(searchRoomParams);

      if (response.data && response.data.data && response.data.data.content) {
        const transformedListings = response.data.data.content.map(
          (item: Room) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            area: item.area,
            image: item.imageUrls[0],
            location: `${item.district}, ${item.province}`,
          })
        );

        setListings(transformedListings);
        setFilteredListings(transformedListings);
        setTotalCount(response.data.data.totalElements);
      }
    } catch (error) {
      console.error("Error searching rooms:", error);
      if (attempt <= maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000; // 3s, 4s, 5s
        setTimeout(() => performSearch(params, attempt + 1), delay);
      } else {
        setSearchError("Không thể tìm kiếm phòng. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterListings(e.target.value, selectedFilters);
  };

  const toggleAreaFilter = (areaId: string) => {
    setSelectedFilters((prev) => {
      const newAreas = prev.area.includes(areaId)
        ? prev.area.filter((id) => id !== areaId)
        : [...prev.area, areaId];

      const newFilters = { ...prev, area: newAreas };
      filterListings(searchTerm, newFilters);
      return newFilters;
    });
  };

  const toggleAmenityFilter = (amenityId: string) => {
    setSelectedFilters((prev) => {
      const newAmenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId];

      const newFilters = { ...prev, amenities: newAmenities };
      filterListings(searchTerm, newFilters);
      return newFilters;
    });
  };

  const toggleTargetAudienceFilter = (audienceId: string) => {
    setSelectedFilters((prev) => {
      const newTargetAudiences = prev.targetAudiences.includes(audienceId)
        ? prev.targetAudiences.filter((id) => id !== audienceId)
        : [...prev.targetAudiences, audienceId];

      const newFilters = { ...prev, targetAudiences: newTargetAudiences };
      filterListings(searchTerm, newFilters);
      return newFilters;
    });
  };

  const toggleSurroundingAreaFilter = (areaId: string) => {
    setSelectedFilters((prev) => {
      const newSurroundingAreas = prev.surroundingAreas.includes(areaId)
        ? prev.surroundingAreas.filter((id) => id !== areaId)
        : [...prev.surroundingAreas, areaId];

      const newFilters = { ...prev, surroundingAreas: newSurroundingAreas };
      filterListings(searchTerm, newFilters);
      return newFilters;
    });
  };

  // Filter listings based on search term and filters
  const filterListings = (search: string, filters: typeof selectedFilters) => {
    let result = [...listings];

    // Apply search term filter
    if (search) {
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(search.toLowerCase()) ||
          listing.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply area filters
    if (filters.area.length > 0) {
      result = result.filter((listing) => {
        if (filters.area.includes("under20") && listing.area < 20) return true;
        if (
          filters.area.includes("20-40") &&
          listing.area >= 20 &&
          listing.area < 40
        )
          return true;
        if (
          filters.area.includes("40-60") &&
          listing.area >= 40 &&
          listing.area < 60
        )
          return true;
        if (
          filters.area.includes("60-80") &&
          listing.area >= 60 &&
          listing.area < 80
        )
          return true;
        if (filters.area.includes("above80") && listing.area >= 80) return true;
        return false;
      });
    }

    setFilteredListings(result);
  };

  // Expose fetchFilters for retry button in filter error alert
  function fetchFilters(attempt = 1): void {
    setIsLoading(true);
    setFilterError(null);
    roomApi
      .getAmenities()
      .then((amenitiesResponse) => {
        if (amenitiesResponse.data && amenitiesResponse.data.data) {
          localStorage.setItem(
            `amenities`,
            JSON.stringify(amenitiesResponse.data.data)
          );
          setAmenities(amenitiesResponse.data.data);
        }
        return roomApi.getTargetAudiences();
      })
      .then((targetAudiencesResponse) => {
        if (targetAudiencesResponse.data && targetAudiencesResponse.data.data) {
          localStorage.setItem(
            `targetAudiences`,
            JSON.stringify(targetAudiencesResponse.data.data)
          );
          setTargetAudiences(targetAudiencesResponse.data.data);
        }
        return roomApi.getSurroundingAreas();
      })
      .then((surroundingAreasResponse) => {
        if (
          surroundingAreasResponse.data &&
          surroundingAreasResponse.data.data
        ) {
          localStorage.setItem(
            `surroundingAreas`,
            JSON.stringify(surroundingAreasResponse.data.data)
          );
          setSurroundingAreas(surroundingAreasResponse.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching filters:", error);
        if (attempt < maxRetries) {
          const delay = 3000 + (attempt - 1) * 1000; // 3s, 4s, 5s
          setTimeout(() => fetchFilters(attempt + 1), delay);
        } else {
          setFilterError("Không thể tải bộ lọc. Vui lòng thử lại sau.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div>
      {/* Blue header background with search */}
      <div className="bg-primary text-white py-4">
        <div className="container">
          <h1 className="fw-bold mb-4">TẤT CẢ PHÒNG TRỌ GIÁ RẺ, MỚI NHẤT</h1>

          <div
            className="d-flex flex-wrap align-items-center bg-white p-2"
            style={{ borderRadius: "8px" }}
          >
            {/* Search input */}
            <div className="d-flex align-items-center flex-grow-1 pe-2">
              <div
                className="bg-primary d-flex justify-content-center align-items-center"
                style={{ width: "45px", height: "45px", borderRadius: "4px" }}
              >
                <FaSearch color="white" size={20} />
              </div>
              <input
                type="text"
                className="form-control border-0 shadow-none ms-2"
                placeholder="Bạn muốn tìm trọ ở đâu?"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ height: "45px" }}
              />
            </div>

            {/* Category dropdown */}
            <div
              className="border-start px-3 d-flex align-items-center"
              style={{ height: "45px" }}
            >
              <div className="dropdown">
                <button
                  className="btn btn-white dropdown-toggle text-start d-flex align-items-center justify-content-between"
                  type="button"
                  id="categoryDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: "180px" }}
                >
                  <span>Tất cả loại phòng</span>
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="categoryDropdown"
                >
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => handleTabChange(null)}
                    >
                      Tất cả loại phòng
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => handleTabChange("BOARDING_HOUSE")}
                    >
                      Nhà trọ, phòng trọ
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => handleTabChange("WHOLE_HOUSE")}
                    >
                      Nhà nguyên căn
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => handleTabChange("APARTMENT")}
                    >
                      Căn hộ, chung cư
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Location dropdown */}
            <div
              className="border-start px-3 d-flex align-items-center"
              style={{ height: "45px" }}
            >
              <div className="dropdown">
                <button
                  className="btn btn-white dropdown-toggle text-start d-flex align-items-center justify-content-between"
                  type="button"
                  id="locationDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: "180px" }}
                >
                  <span>Địa điểm</span>
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="locationDropdown"
                >
                  <li>
                    <a className="dropdown-item" href="#">
                      Hồ Chí Minh
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Hà Nội
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Đà Nẵng
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Price dropdown */}
            <div
              className="border-start px-3 d-flex align-items-center"
              style={{ height: "45px" }}
            >
              <div className="dropdown">
                <button
                  className="btn btn-white dropdown-toggle text-start d-flex align-items-center justify-content-between"
                  type="button"
                  id="priceDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: "180px" }}
                >
                  <span>Mức giá</span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="priceDropdown">
                  <li>
                    <a className="dropdown-item" href="#">
                      Dưới 1 triệu
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      1-3 triệu
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      3-5 triệu
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      5-10 triệu
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Trên 10 triệu
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Search button */}
            <div className="ps-3">
              <button
                className="btn text-white d-flex align-items-center"
                style={{
                  backgroundColor: "#ff5a00",
                  borderColor: "#ff5a00",
                  height: "45px",
                  fontWeight: "500",
                }}
              >
                <FaSearch className="me-2" /> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {searchParams && (
          <div className="alert alert-info mb-3">
            <strong>Kết quả tìm kiếm cho: </strong>
            {searchParams.query && <span>"{searchParams.query}" </span>}
            {searchParams.province && <span>tại {searchParams.province} </span>}
            {searchParams.minPrice && (
              <span>từ {searchParams.minPrice / 1000000} triệu </span>
            )}
            {searchParams.maxPrice && (
              <span>đến {searchParams.maxPrice / 1000000} triệu </span>
            )}
            {searchParams.areaRange && (
              <span>diện tích {searchParams.areaRange}m² </span>
            )}
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => {
                localStorage.removeItem("searchParams");
                setSearchParams(null);
                performSearch({});
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        <div className="d-flex flex-nowrap">
          {/* Left sidebar - Filters */}
          <div
            className="filter-sidebar"
            style={{ width: "280px", minWidth: "280px", marginRight: "20px" }}
          >
            <div className="bg-white p-3 rounded shadow-sm mb-4">
              <h5 className="fw-bold text-primary mb-3">
                <FaSearch className="me-2" />
                Lọc tìm kiếm
              </h5>

              {/* Hiển thị lỗi nếu không tải được bộ lọc */}
              {filterError && (
                <div className="alert alert-danger mb-3">
                  {filterError}
                  <Button
                    variant="primary"
                    size="sm"
                    className="ms-2"
                    onClick={() => fetchFilters()}
                  >
                    Thử lại
                  </Button>
                </div>
              )}

              {/* Area filters */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Diện tích</h6>
                {areaOptions.map((area) => (
                  <Form.Check
                    key={area.id}
                    type="checkbox"
                    id={`area-${area.id}`}
                    label={area.label}
                    className="mb-2"
                    checked={selectedFilters.area.includes(area.id)}
                    onChange={() => toggleAreaFilter(area.id)}
                  />
                ))}
              </div>

              {/* Amenity filters from API */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Tiện nghi</h6>
                {isLoading ? (
                  <p>Đang tải...</p>
                ) : (
                  amenities.map((amenity) => (
                    <Form.Check
                      key={amenity.id}
                      type="checkbox"
                      id={`amenity-${amenity.id}`}
                      label={amenity.name}
                      className="mb-2"
                      checked={selectedFilters.amenities.includes(
                        amenity.id.toString()
                      )}
                      onChange={() =>
                        toggleAmenityFilter(amenity.id.toString())
                      }
                    />
                  ))
                )}
              </div>

              {/* Target audience filters from API */}
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Đối tượng thuê</h6>
                {isLoading ? (
                  <p>Đang tải...</p>
                ) : (
                  targetAudiences.map((audience) => (
                    <Form.Check
                      key={audience.id}
                      type="checkbox"
                      id={`audience-${audience.id}`}
                      label={audience.name}
                      className="mb-2"
                      checked={selectedFilters.targetAudiences.includes(
                        audience.id.toString()
                      )}
                      onChange={() =>
                        toggleTargetAudienceFilter(audience.id.toString())
                      }
                    />
                  ))
                )}
              </div>

              {/* Surrounding area filters from API */}
              <div className="mb-3">
                <h6 className="fw-bold mb-2">Khu vực xung quanh</h6>
                {isLoading ? (
                  <p>Đang tải...</p>
                ) : (
                  surroundingAreas.map((area) => (
                    <Form.Check
                      key={area.id}
                      type="checkbox"
                      id={`surrounding-${area.id}`}
                      label={area.name}
                      className="mb-2"
                      checked={selectedFilters.surroundingAreas.includes(
                        area.id.toString()
                      )}
                      onChange={() =>
                        toggleSurroundingAreaFilter(area.id.toString())
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right content - Listing results */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between mb-3">
              <p className="mb-0">Tổng {totalCount} kết quả</p>
            </div>

            {/* Loading indicator */}
            {isSearching && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tìm kiếm...</p>
              </div>
            )}

            {/* Hiển thị lỗi nếu không tìm kiếm được */}
            {searchError && !isSearching && (
              <div className="alert alert-danger mb-3">
                {searchError}
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => performSearch(searchParams || {})}
                >
                  Thử lại
                </Button>
              </div>
            )}

            {/* Listing results */}
            {!isSearching && !searchError && filteredListings.length === 0 && (
              <div className="alert alert-warning">
                Không tìm thấy kết quả phù hợp. Vui lòng thử lại với các tiêu
                chí khác.
              </div>
            )}

            {!isSearching && !searchError && filteredListings.map((listing, index) => (
              <Card key={index} className="mb-3 border-0 shadow-sm">
                <div className="position-relative">
                  {/* HOT label */}
                  <div
                    className="position-absolute bg-danger text-white px-2 py-1"
                    style={{ top: "10px", left: "0" }}
                  >
                    HOT
                  </div>

                  <Row className="g-0">
                    {/* Left - Image */}
                    <Col md={4}>
                      <Card.Img
                        src={listing.image}
                        alt={listing.title}
                        style={{ height: "100%", objectFit: "cover" }}
                      />
                    </Col>

                    {/* Right - Content */}
                    <Col md={8}>
                      <Card.Body>
                        <div className="d-flex justify-content-between">
                          <Card.Title className="fw-bold mb-2">
                            {listing.title}
                          </Card.Title>
                          <FaHeart
                            className="text-muted"
                            style={{ cursor: "pointer" }}
                          />
                        </div>

                        <Card.Text className="text-danger fw-bold mb-2">
                          {listing.price} triệu/tháng
                        </Card.Text>

                        <div className="d-flex mb-2">
                          <span className="me-3">{listing.area}m²</span>
                          <span className="badge bg-info text-white me-2">
                            {(listing as any).type === "BOARDING_HOUSE"
                              ? "Phòng trọ"
                              : (listing as any).type === "WHOLE_HOUSE"
                              ? "Nhà nguyên căn"
                              : "Căn hộ"}
                          </span>
                        </div>

                        <div className="d-flex align-items-center text-muted mb-2">
                          <FaMapMarkerAlt className="me-1" />
                          {listing.location}
                        </div>

                        <Link
                          to={`/phong-tro/${index}`}
                          className="text-decoration-none"
                        >
                          <Button variant="primary" className="mt-1">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </Card.Body>
                    </Col>
                  </Row>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {filteredListings.length > 0 && !searchError && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">«</span>
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">»</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesPage;