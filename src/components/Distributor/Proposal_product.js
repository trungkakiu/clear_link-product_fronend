import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import RocketLoad from "../../Utils/RocketLoad";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  InputGroup,
  Container,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faShoppingCart,
  faStore,
  faTag,
  faSortAmountUp,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/Distributor/Proposal_product.scss";
import ProductDetailModal from "../Modal/Distributor/ProductDetailModal";
import CreateOrderModal from "../Modal/Distributor/CreateOrderModal";

const Proposal_product = () => {
  const { User } = useContext(UserContext);
  const API_URL = process.env.REACT_APP_API_IMAGE_URL || "";
  const [proposalProduct, setproposalProduct] = useState([]);
  const [isload, setisload] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleShowOrder = (product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [showOrderModal, setShowOrderModal] = useState(false);
  const getProposalproduct = async () => {
    try {
      setisload(true);
      const res = await api_request.getProposalProduct(User);
      if (res?.RC === 200) {
        setproposalProduct(res.RD);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    getProposalproduct();
  }, []);

  const handleOrderConfirm = async (payload, challen_code) => {
    try {
      const res = await api_request.createOrderProduct(
        User,
        payload,
        challen_code,
      );
      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
          RD: res?.RD,
        };
      } else {
        return {
          RM: "Lỗi hệ thống!",
          RC: 500,
        };
      }
    } catch (error) {
      toast.error("Lỗi tạo đơn hàng!");
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    }
  };

  const filteredProducts = proposalProduct.filter((p) => {
    const matchName =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCompany =
      filterCompany === "" ||
      p.manufacturer_info?.company_name === filterCompany;
    const matchPrice = maxPrice === "" || p.price <= parseInt(maxPrice);
    return matchName && matchCompany && matchPrice;
  });

  const companies = [
    ...new Set(proposalProduct.map((p) => p.manufacturer_info?.company_name)),
  ].filter(Boolean);

  if (isload) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "75vh" }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <Container fluid className="aws-marketplace py-5 px-4">
      <ProductDetailModal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        product={selectedProduct}
        API_URL={API_URL}
      />
      <CreateOrderModal
        User={User}
        onConfirm={(payload, challen_code) =>
          handleOrderConfirm(payload, challen_code)
        }
        onHide={() => setShowOrderModal(false)}
        product={selectedProduct}
        show={showOrderModal}
      />
      <Card className="aws-filter-section mb-5 border-0">
        <Card.Body className="p-4">
          <Row className="gy-3 align-items-center">
            <Col xl={4}>
              <div className="d-flex align-items-center">
                <div className="icon-box-orange me-3 shadow-sm">
                  <FontAwesomeIcon
                    icon={faStore}
                    size="lg"
                    className="text-white"
                  />
                </div>
                <div>
                  <h3 className="fw-800 text-main m-0">Supply Market</h3>
                  <p className="text-muted small mb-0">
                    Hệ thống phân phối linh kiện On-chain
                  </p>
                </div>
              </div>
            </Col>
            <Col xl={8}>
              <Row className="g-3">
                <Col md={5}>
                  <InputGroup className="shadow-xs">
                    <InputGroup.Text className="bg-light border-0">
                      <FontAwesomeIcon icon={faSearch} className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      className="filter-input-custom shadow-none"
                      placeholder="Tìm kiếm sản phẩm hoặc mã ID..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    className="filter-input-custom shadow-none"
                    onChange={(e) => setFilterCompany(e.target.value)}
                  >
                    <option value="">Tất cả nhà cung cấp</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    className="filter-input-custom shadow-none"
                    placeholder="Giá tối đa..."
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {filteredProducts.map((p) => (
          <Col
            key={p.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={3}
            className="d-flex"
          >
            <Card className="product-card w-100 border-0">
              <div className="card-img-container shadow-sm">
                <Badge
                  bg="aws-orange"
                  className="position-absolute top-0 end-0 m-2 shadow"
                  style={{ zIndex: 2, background: "#ff9900" }}
                >
                  Standard
                </Badge>
                <Card.Img
                  src={`${API_URL}main-card/${p.main_cardimage}`}
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300x200?text=Product")
                  }
                />
              </div>

              <Card.Body className="p-3 pt-2 d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  <div
                    className="bg-light rounded-circle p-1 me-2"
                    style={{
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faStore}
                      className="text-primary"
                      style={{ fontSize: "10px" }}
                    />
                  </div>
                  <span className="fw-bold text-muted text-truncate small">
                    {p.manufacturer_info?.company_name}
                  </span>
                </div>

                <h6
                  className="fw-800 text-dark mb-1 text-truncate"
                  title={p.name}
                >
                  {p.name}
                </h6>
                <code className="x-small text-aws-orange mb-3">#{p.id}</code>

                <div className="price-tag mb-3 mt-auto">
                  <small
                    className="text-muted d-block fw-bold"
                    style={{ fontSize: "9px" }}
                  >
                    GIÁ NIÊM YẾT
                  </small>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="h5 fw-800 text-danger m-0">
                      {p.price.toLocaleString()}đ
                    </span>
                    <Badge
                      bg="success"
                      className="bg-opacity-10 text-success border border-success border-opacity-25"
                      style={{ fontSize: "9px" }}
                    >
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="white"
                    className="btn-detail py-2 fw-bold d-flex align-items-center justify-content-center"
                    onClick={() => handleShowDetail(p)}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" /> Chi
                    tiết
                  </Button>
                  <Button
                    className="btn-order-main py-2 fw-bold shadow-sm"
                    onClick={() => handleShowOrder(p)}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />{" "}
                    Tạo đơn ngay
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-5 mt-5">
          <FontAwesomeIcon
            icon={faSearch}
            size="4x"
            className="text-light mb-3"
          />
          <h4 className="text-muted">Không tìm thấy sản phẩm nào</h4>
          <p className="text-muted">
            Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </Container>
  );
};
export default Proposal_product;
