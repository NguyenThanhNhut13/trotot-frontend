import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Province } from "../../types/address.type";
import { Link } from "react-router-dom";
import { useResponsive } from "../../store/hook";

// Định nghĩa kiểu cho tỉnh phổ biến (không kế thừa từ Province)
interface PopularProvince {
  code: string;
  name: string;
  count: number;
}

// Định nghĩa kiểu cho props
interface ProvinceListingsProps {
  provinces: Province[];
}

const ProvinceListings: React.FC<ProvinceListingsProps> = ({ provinces }) => {
  const { isMobile } = useResponsive();

  // Danh sách 12 tỉnh thành phổ biến (dữ liệu giả)
  const popularProvinces: PopularProvince[] = [
    { code: "HCM", name: "Hồ Chí Minh", count: 4328 },
    { code: "HN", name: "Hà Nội", count: 1575 },
    { code: "DN", name: "Đà Nẵng", count: 873 },
    { code: "TTH", name: "Thừa Thiên Huế", count: 458 },
    { code: "BD", name: "Bình Dương", count: 191 },
    { code: "CT", name: "Cần Thơ", count: 161 },
    { code: "DN", name: "Đồng Nai", count: 58 },
    { code: "HP", name: "Hải Phòng", count: 34 },
    { code: "KH", name: "Khánh Hòa", count: 30 },
    { code: "LA", name: "Long An", count: 21 },
    { code: "AG", name: "An Giang", count: 8 },
    { code: "BRVT", name: "Bà Rịa - Vũng Tàu", count: 7 }
  ];
  
  // Helper function to safely get province count
  const getProvinceCount = (province: Province | PopularProvince): string | number => {
    return 'count' in province ? province.count : Math.floor(Math.random() * 100);
  };

  // Hiển thị 12 tỉnh phổ biến trên mobile, đầy đủ trên desktop
  const displayProvinces = isMobile ? popularProvinces : provinces;

  // Create rows of provinces for layout
  const createProvinceRows = () => {
    const rows = [];
    const itemsPerRow = isMobile ? 3 : 4; // 3 cột trên mobile, 4 cột trên desktop
    
    for (let i = 0; i < displayProvinces.length; i += itemsPerRow) {
      const rowProvinces = displayProvinces.slice(i, i + itemsPerRow);
      rows.push(rowProvinces);
    }
    return rows;
  };

  return (
    <Container className="my-4">
      <h2 className={`fw-bold mb-2 ${isMobile ? 'h5 text-center' : 'text-primary'}`}>
        KHÁM PHÁ THÊM TRỌ MỚI Ở CÁC TỈNH THÀNH
      </h2>
      
      {!isMobile && (
        <p className="text-muted mb-4">Dưới đây là tổng hợp các tỉnh thành có nhiều trọ mới và được quan tâm nhất</p>
      )}
      
      <Row className={isMobile ? 'g-2 mt-2' : 'g-3'}>
        {createProvinceRows().map((rowProvinces, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {rowProvinces.map((province, colIndex) => (
              <Col 
                xs={4}  // Mobile: 3 cột (12/3 = 4)
                md={!isMobile ? 3 : undefined} 
                key={`province-${rowIndex}-${colIndex}`} 
                className={`${isMobile ? 'mb-2' : 'mb-3'}`}
              >
                <Link 
                  to={`/filter?province=${province.code}`}
                  className="text-decoration-none"
                >
                  {isMobile ? (
                    <div className="border rounded p-2 text-center bg-light h-100">
                      <h6 className="fw-bold text-primary mb-0" style={{ fontSize: '0.7rem' }}>
                        {province.name}
                      </h6>
                      <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
                        {getProvinceCount(province)} phòng
                      </small>
                    </div>
                  ) : (
                    <div className="d-flex flex-column">
                      <h5 className="fw-bold text-dark mb-1">{province.name}</h5>
                      <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
                        {getProvinceCount(province)} phòng trọ
                      </p>
                    </div>
                  )}
                </Link>
              </Col>
            ))}
          </React.Fragment>
        ))}
      </Row>
    </Container>
  );
};

export default ProvinceListings;