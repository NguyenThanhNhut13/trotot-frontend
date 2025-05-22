import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Province } from "../../types/address.type";

// Định nghĩa kiểu cho props
interface ProvinceListingsProps {
  provinces: Province[];
}


const ProvinceListings: React.FC<ProvinceListingsProps> = ({ provinces }) => {
  // Create pairs of provinces for 2-column layout
  const createProvincePairs = () => {
    const pairs = [];
    for (let i = 0; i < provinces.length; i += 4) {
      const rowProvinces = provinces.slice(i, i + 4);
      pairs.push(rowProvinces);
    }
    return pairs;
  };

  return (
    <Container className="my-5">
      <h2 className="text-primary fw-bold mb-2">KHÁM PHÁ THÊM TRỌ MỚI Ở CÁC TỈNH THÀNH</h2>
      <p className="text-muted mb-4">Dưới đây là tổng hợp các tỉnh thành có nhiều trọ mới và được quan tâm nhất</p>
      
      <Row>
        {createProvincePairs().map((rowProvinces, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {rowProvinces.map((province, colIndex) => (
              <Col md={3} sm={6} key={`province-${rowIndex}-${colIndex}`} className="mb-4">
                <div className="d-flex flex-column">
                  <h5 className="fw-bold text-dark mb-1">{province.name}</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>{province.code} phòng trọ</p>
                </div>
              </Col>
            ))}
          </React.Fragment>
        ))}
      </Row>
    </Container>
  );
};

export default ProvinceListings;
