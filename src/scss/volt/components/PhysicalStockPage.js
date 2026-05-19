import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
  Form,
  Button,
  Container,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBox,
  faLayerGroup,
  faWeightHanging,
  faLink,
  faWarehouse,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/PhysicalStockPage.scss";
import api_request from "../../apicontroller/api_request";
import RocketLoad from "../../Utils/RocketLoad";
import { UserContext } from "../../Context/UserContext";

const ProductVersionCard = ({ item }) => {
  const { batch_info, metadata_id, total_quantity, product_info, product_id } =
    item;

  return (
    <Card className="stock-card border-0 shadow-sm mb-4">
      <div className="card-image-wrapper">
        <Card.Img
          variant="top"
          src={
            `${process.env.REACT_APP_API_IMAGE_URL}main-card/${batch_info?.product_version?.main_cardimage}` ||
            "https://via.placeholder.com/300?text=No+Image"
          }
          className="product-img"
        />
        <Badge bg="primary" className="version-badge">
          Version {batch_info?.product_version?.version || "1.0"}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          <small className="text-uppercase text-muted fw-bold letter-spacing-1">
            {product_info?.type || "General"}
          </small>
          <h5
            className="product-title text-truncate"
            title={batch_info?.product_version?.name}
          >
            {batch_info?.product_version?.name}
          </h5>
        </div>

        <div className="info-grid mb-3">
          <div className="info-item">
            <FontAwesomeIcon icon={faBox} className="me-2 text-gray-400" />
            <span>
              SKU: <strong>{product_id}</strong>
            </span>
          </div>
          <div className="info-item">
            <FontAwesomeIcon
              icon={faWeightHanging}
              className="me-2 text-gray-400"
            />
            <span>{batch_info?.product_version?.weight} kg / đơn vị</span>
          </div>
        </div>

        <div className="stock-level-section p-3 bg-light rounded-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small text-muted">Tổng tồn thực tế:</span>
            <span className="h4 m-0 text-dark fw-extrabold">
              {total_quantity}{" "}
              <small className="h6 text-muted fw-normal">
                {batch_info?.product_version?.unit || "Hộp"}
              </small>
            </span>
          </div>
          {/* Thanh progress thể hiện mức độ đầy kho - anh có thể tính theo % sức chứa nếu muốn */}
          <div className="progress mt-2" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="blockchain-footer mt-auto pt-3 border-top">
          <div className="d-flex align-items-center text-muted x-small">
            <FontAwesomeIcon icon={faLink} className="me-2 text-info" />
            <span
              className="text-truncate"
              title={batch_info?.product_version?.txt_hash}
            >
              Hash: {batch_info?.product_version?.txt_hash?.substring(0, 16)}...
            </span>
          </div>
          <Button
            variant="link"
            className="p-0 mt-2 text-primary fw-bold btn-view-slots"
          >
            <FontAwesomeIcon icon={faWarehouse} className="me-1" /> Xem vị trí
            chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default function PhysicalStockPage() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchToolbar] = useState("");
  const { User } = useContext(UserContext);
  const [secondsActive, setSecondsActive] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [isLoad, setIsLoad] = useState(false);

  const fetchInventory = async (isFirstLoad = false) => {
    try {
      if (isIdle) return;
      if (isFirstLoad) setIsLoad(true);

      const response = await api_request.getCurrentInventory(User);
      const data = await response.RD;
      setInventory(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tồn kho:", error);
    } finally {
      if (isFirstLoad) setIsLoad(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);

    const interval = setInterval(() => {
      fetchInventory(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoad) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          minHeight: "75vh",
        }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <Container fluid className="physical-stock-page py-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark">Danh Mục Hàng Tồn Kho</h2>
          <p className="text-muted mb-0">
            Quản lý trực quan sản phẩm theo từng phiên bản và mã băm Blockchain.
          </p>
        </div>
        <div className="stats-summary d-none d-md-flex gap-4">
          <div className="stat-box text-end">
            <div className="small text-muted">Tổng chủng loại</div>
            <div className="h4 fw-bold mb-0">{inventory.length}</div>
          </div>
          <div className="stat-box text-end">
            <div className="small text-muted">Trạng thái</div>
            <Badge bg="soft-success" className="text-success px-3">
              Đã đồng bộ
            </Badge>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm kiếm theo tên sản phẩm, SKU hoặc phiên bản..."
                  className="border-start-0 ps-0"
                  onChange={(e) => setSearchToolbar(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-primary" className="me-2 shadow-sm">
                <FontAwesomeIcon icon={faHistory} className="me-2" /> Lịch sử
                nhập/xuất
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* GRID VIEW */}
      <Row>
        {/* Giả sử render mảng inventory */}
        {inventory.length > 0 ? (
          inventory.map((item, index) => (
            <Col key={index} xs={12} sm={6} lg={4} xl={3}>
              <ProductVersionCard item={item} />
            </Col>
          ))
        ) : (
          <Col className="text-center py-5">
            <FontAwesomeIcon
              icon={faBox}
              size="4x"
              className="text-gray-200 mb-3"
            />
            <h5 className="text-muted">Chưa có dữ liệu hàng tồn thực tế</h5>
          </Col>
        )}
      </Row>
    </Container>
  );
}
