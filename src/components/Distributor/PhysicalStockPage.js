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
  faHistory,
  faEdit,
  faCheck,
  faTimes,
  faTruckLoading,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "../../scss/volt/components/PhysicalStockPage.scss";
import api_request from "../../apicontroller/api_request";
import RocketLoad from "../../Utils/RocketLoad";
import { UserContext } from "../../Context/UserContext";
import Otp_verify_dynamic from "../Modal/Otp_verify_dynamic";

const ProductVersionCard = ({ item, User }) => {
  const product = item.product_info || {};
  const master = product.master || {};
  const [modalstate, setModalState] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [salePrice, setSalePrice] = useState(item.sale_price || 0);
  const [tempPrice, setTempPrice] = useState(item.sale_price || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: item.currency || "VND",
    }).format(price);
  };

  const handleSavePrice = async (challenge_code) => {
    setIsSaving(true);
    try {
      const res = await api_request.updateInventoryPrice(
        User,
        challenge_code,
        product.id,
        item.id,
        tempPrice,
      );
      if (res) {
        if (res.RC === 200) {
          setSalePrice(tempPrice);
          setIsEditing(false);
        }
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      return {
        RM: "Lỗi hệ thống",
        RC: 500,
      };
    } finally {
      setTempPrice(salePrice);
    }
  };

  const handleToggleStatus = async () => {
    const oldStatus = currentStatus;
    const newStatus = oldStatus === "active" ? "inactive" : "active";
    setCurrentStatus(newStatus);
    setIsChangingStatus(true);

    try {
      const res = await api_request.updateCatalogStatusAPI(
        User,
        product.id,
        item.id,
        newStatus,
      );

      if (res.RC !== 200) {
        throw new Error(res.RM || "Lỗi không xác định");
      }
    } catch (error) {
      setCurrentStatus(oldStatus);
      toast.error("Không thể cập nhật trạng thái, vui lòng thử lại!");
      console.error("Lỗi cập nhật trạng thái:", error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <Card className="pos-stock-card border-0 shadow-sm">
      <Otp_verify_dynamic
        close={() => setModalState(false)}
        closeReload={() => setModalState(false)}
        message={"Xác nhận mã PIN để thay đổi giá hàng hóa mới"}
        onSuccess={(challenge_code) => {
          return handleSavePrice(challenge_code);
        }}
        show={modalstate}
        title={"PIN VERIFY - XÁC NHẬN THAY ĐỔI GIÁ BÁN"}
      />
      <div className="card-image-wrapper">
        <Badge bg="light" text="dark" className="border version-badge-left">
          #{product.product_id || "N/A"}
        </Badge>
        <Card.Img
          variant="top"
          src={
            product.main_cardimage
              ? `${process.env.REACT_APP_API_IMAGE_URL}main-card/${product.main_cardimage}`
              : "https://via.placeholder.com/150?text=No+Image"
          }
          onError={(e) => {
            const currentSrc = e.target.src;
            if (currentSrc.includes("main-card")) {
              e.target.src = `${process.env.REACT_APP_API_IMAGE_URL}User-avatar/${product.main_cardimage}`;
            } else {
              e.target.src = "https://via.placeholder.com/150?text=No+Image";
            }
          }}
          className="product-img"
        />
        <Badge bg="light" text="dark" className="version-badge border">
          v{product.version || 1}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <h6 className="product-title text-truncate mb-1" title={product.name}>
          {product.name || "Sản phẩm chưa cập nhật tên"}
        </h6>
        <div className="text-muted small mb-2 text-truncate">
          {master.type || "Hàng hóa chung"}
        </div>

        <div className="pricing-block mt-2">
          <div
            className="text-muted mb-1"
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textAlign: "center",
            }}
          >
            Giá gốc hệ thống
          </div>

          <InputGroup size="sm" className="edit-price-group">
            <Form.Control
              type="text"
              className="text-center fw-bold"
              value={
                product.price
                  ? new Intl.NumberFormat("vi-VN").format(product.price) + " Đ"
                  : "0 Đ"
              }
              readOnly
              style={{
                backgroundColor: "#f8f9fa",
                color: "#6c757d",
                fontSize: "14px",
                borderStyle: "dashed",
              }}
            />
          </InputGroup>
        </div>
        <div className="status-switch-block mt-3 p-2 rounded bg-light border">
          <Form.Check
            type="switch"
            id={`switch-${item.id}`}
            label={
              currentStatus === "active"
                ? "Đang kinh doanh"
                : "Ngừng kinh doanh"
            }
            checked={currentStatus === "active"}
            onChange={handleToggleStatus}
            disabled={isChangingStatus}
            className={`fw-bold ${currentStatus === "active" ? "text-success" : "text-muted"}`}
          />
        </div>

        <div className="pricing-block mt-2">
          {isEditing ? (
            <InputGroup size="sm" className="edit-price-group">
              <Form.Control
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                autoFocus
                disabled={isSaving}
              />
              <Button
                variant="success"
                onClick={() => setModalState(true)}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faCheck} />
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </InputGroup>
          ) : (
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-primary fs-6">
                {formatPrice(salePrice)}
              </span>
              <Button
                variant="light"
                size="sm"
                className="edit-btn text-muted border"
                onClick={() => {
                  setTempPrice(salePrice);
                  setIsEditing(true);
                }}
              >
                <FontAwesomeIcon icon={faEdit} /> Sửa
              </Button>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-top mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">Tồn kho:</span>
            <span
              className={`fw-bold ${item.quantity > 0 ? "text-success" : "text-danger"}`}
            >
              {item.quantity}
            </span>
          </div>

          <Button
            variant={item.quantity > 0 ? "primary" : "secondary"}
            size="sm"
            className="w-100 fw-bold"
            disabled={item.quantity <= 0}
          >
            <FontAwesomeIcon icon={faTruckLoading} className="me-1" />
            {item.quantity > 0 ? "TẠO ĐƠN XUẤT" : "HẾT HÀNG"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const PhysicalStockPage = () => {
  const { User } = useContext(UserContext);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchToolbar, setSearchToolbar] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);

  const fetchInitialData = async (isFirstLoad = false) => {
    try {
      if (isIdle) return; // Nếu đang treo máy thì không gọi API đỡ tốn băng thông
      if (isFirstLoad) setIsLoading(true);

      const res = await api_request.getCurrentInventory(User); // Nhớ import hàm này đúng nhé

      if (res.RC === 200) {
        setInventoryItems(res.RD || []);
      } else {
        toast.error("Lỗi tải danh mục hàng hóa!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống khi tải dữ liệu!");
    } finally {
      if (isFirstLoad) setIsLoading(false);
    }
  };

  useEffect(() => {
    // SỬA Ở ĐÂY: Gọi fetchInitialData thay vì PhysicalStockPage
    fetchInitialData(true);

    const interval = setInterval(() => {
      fetchInitialData(false); // SỬA Ở ĐÂY NỮA
    }, 5000);

    return () => clearInterval(interval);
  }, [isIdle]); // Nên thêm isIdle vào mảng dependency để interval cập nhật trạng thái mới nhất
  const inventoryFiltered = inventoryItems.filter((item) => {
    const searchLow = searchToolbar.toLowerCase();
    const prodName = item.product_info?.name?.toLowerCase() || "";
    return prodName.includes(searchLow);
  });

  return (
    <Container fluid className="physical-stock-page-light py-4">
      <Card className="border-0 mb-4 shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <Row className="align-items-center">
            <Col xs={12} md={5}>
              <h4 className="mb-1 fw-bold text-dark">
                <FontAwesomeIcon icon={faBox} className="me-2 text-primary" />
                Danh mục Hàng hóa
              </h4>
              <p className="text-muted small mb-0">
                Quản lý bảng giá & tồn kho hệ thống POS
              </p>
            </Col>
            <Col
              xs={12}
              md={7}
              className="mt-3 mt-md-0 d-flex gap-2 justify-content-md-end"
            >
              <InputGroup style={{ maxWidth: "300px" }}>
                <InputGroup.Text className="bg-light">
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên sản phẩm..."
                  onChange={(e) => setSearchToolbar(e.target.value)}
                />
              </InputGroup>
              <Button variant="outline-secondary">
                <FontAwesomeIcon icon={faHistory} /> Lịch sử
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <RocketLoad />
        </div>
      ) : (
        <Row className="g-3">
          {inventoryFiltered.length > 0 ? (
            inventoryFiltered.map((item, index) => (
              <Col
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="col-5-custom"
              >
                <ProductVersionCard item={item} User={User} />
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center py-5 text-muted">
              <FontAwesomeIcon
                icon={faBox}
                size="3x"
                className="mb-3 opacity-50"
              />
              <h5>Không tìm thấy sản phẩm nào</h5>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default PhysicalStockPage;
