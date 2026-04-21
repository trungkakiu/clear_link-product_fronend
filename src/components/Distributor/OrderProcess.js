import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faMicrochip,
  faFileContract,
  faSearch,
  faTools,
  faFileUpload,
  faFilter,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../../scss/volt/components/Distributor/OrderProcess.scss";
import OEMacceptRequestModal from "../Modal/Manufacture/OEMacceptRequestModal";
import BatchDetailModal from "../Modal/Distributor/BatchDetailModal";

const OrderProcess = () => {
  const [OEMs, setOEMs] = useState([]);
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [filter, setFilter] = useState({ code: "", company: "" });

  const [modalstate, setmodalstate] = useState({ OEMacp: false });
  const [modaldata, setmodaldata] = useState({ OEMacp: null });

  const fetchOEMs = async () => {
    try {
      setisload(true);
      const res = await api_request.fecthORMs(User);
      if (res?.RC === 200) {
        setOEMs(res.RD.OEMs);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    fetchOEMs();
  }, []);

  // Logic lọc dữ liệu
  const filteredOEMs = OEMs.filter((item) => {
    const matchCode =
      item.product_id.toLowerCase().includes(filter.code.toLowerCase()) ||
      item.id.toString().includes(filter.code);
    const matchCompany = item.partner_info?.company_name
      ?.toLowerCase()
      .includes(filter.company.toLowerCase());
    return matchCode && matchCompany;
  });

  const openModal = (key, data) => {
    setmodalstate((prev) => ({ ...prev, [key]: true }));
    setmodaldata((prev) => ({ ...prev, [key]: data }));
  };

  const closeModal = (key, isrefresh) => {
    setmodalstate((prev) => ({ ...prev, [key]: false }));
    setmodaldata((prev) => ({ ...prev, [key]: null }));
    if (isrefresh) fetchOEMs();
  };

  const getStatusConfig = (status, isReceiver) => {
    switch (status) {
      case "pending":
        return {
          text: isReceiver ? "Đang chờ" : "Xác nhận ngay",
          variant: "warning",
          icon: faTools,
          bg: "#fff7e6",
          color: "#ffa000",
        };
      case "active":
        return {
          text: "Đang chạy",
          variant: "success",
          icon: faMicrochip,
          bg: "#e6fffa",
          color: "#00a854",
        };
      case "rejected":
        return {
          text: "Từ chối",
          variant: "danger",
          icon: faFileContract,
          bg: "#fff1f0",
          color: "#f5222d",
        };
      default:
        return {
          text: status,
          variant: "secondary",
          icon: faSearch,
          bg: "#f5f5f5",
          color: "#8c8c8c",
        };
    }
  };

  if (isload)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-75">
        <RocketLoad />
      </div>
    );

  return (
    <div className="aws-oem-wrapper py-4 px-3">
      <BatchDetailModal
        API_URL={process.env.REACT_APP_API_IMAGE_URL}
        data={modaldata.OEMacp}
        onHide={() => closeModal("OEMacp", false)}
        show={modalstate.OEMacp}
      />
      <Container fluid>
        <Row className="mb-4 gy-4">
          <Col lg={12} xl={4} className="d-flex align-items-center">
            <div className="aws-branding-box d-flex align-items-center">
              <div
                className="icon-box-lg bg-white shadow-sm rounded-3 me-3 d-flex align-items-center justify-content-center"
                style={{ width: "60px", height: "60px" }}
              >
                <FontAwesomeIcon
                  icon={faIndustry}
                  className="text-aws-orange"
                  size="2x"
                />
              </div>
              <div>
                <h2 className="fw-800 text-main m-0 letter-spacing-tight">
                  Production Hub
                </h2>
                <Badge
                  bg="aws-orange-light"
                  className="text-aws-orange fw-bold mt-1"
                >
                  <i className="fas fa-check-circle me-1"></i> Quản lý chuỗi
                  cung ứng
                </Badge>
              </div>
            </div>
          </Col>

          <Col lg={12} xl={8}>
            <Card
              className="border-0 shadow-lg p-3 bg-white"
              style={{ borderRadius: "15px" }}
            >
              <Row className="g-3 align-items-center">
                <Col md={5}>
                  <Form.Label className="small fw-bold text-muted ms-1">
                    Mã sản phẩm / Order ID
                  </Form.Label>
                  <InputGroup size="lg" className="aws-input-group-modern">
                    <InputGroup.Text className="bg-light border-0 px-3 text-muted">
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      className="filter-input-lg border-0 bg-light shadow-none font-weight-600"
                      placeholder="Nhập mã SP hoặc ID..."
                      value={filter.code}
                      onChange={(e) =>
                        setFilter({ ...filter, code: e.target.value })
                      }
                      style={{ fontSize: "0.95rem" }}
                    />
                  </InputGroup>
                </Col>

                <Col md={5}>
                  <Form.Label className="small fw-bold text-muted ms-1">
                    Tên đối tác hợp tác
                  </Form.Label>
                  <InputGroup size="lg" className="aws-input-group-modern">
                    <InputGroup.Text className="bg-light border-0 px-3 text-muted">
                      <FontAwesomeIcon icon={faIndustry} />
                    </InputGroup.Text>
                    <Form.Control
                      className="filter-input-lg border-0 bg-light shadow-none font-weight-600"
                      placeholder="Nhập tên đối tác..."
                      value={filter.company}
                      onChange={(e) =>
                        setFilter({ ...filter, company: e.target.value })
                      }
                      style={{ fontSize: "0.95rem" }}
                    />
                  </InputGroup>
                </Col>

                <Col md={2} className="d-flex align-items-end">
                  <Button
                    variant="aws-orange"
                    className="w-100 shadow-sm fw-bold d-flex align-items-center justify-content-center"
                    style={{
                      height: "48px",
                      borderRadius: "10px",
                      marginTop: "28px",
                    }}
                    onClick={fetchOEMs}
                  >
                    <FontAwesomeIcon
                      icon={faSync}
                      className={`me-2 ${isload ? "fa-spin" : ""}`}
                    />
                    LÀM MỚI
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Card
          className="border-0 shadow-sm overflow-hidden"
          style={{ borderRadius: "15px" }}
        >
          <Card.Body className="p-4 bg-white">
            <Row className="g-4">
              {filteredOEMs.length > 0 ? (
                filteredOEMs.map((item) => {
                  const isReceiver = !item.is_my_order;
                  const statusStyle = getStatusConfig(item.status, isReceiver);

                  return (
                    <Col xl={3} lg={4} md={6} xs={12} key={item.id}>
                      <Card className="aws-card-item border-0 h-100">
                        <div
                          style={{
                            height: "4px",
                            backgroundColor: statusStyle.color,
                          }}
                        />

                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between mb-3">
                            <Badge
                              bg={isReceiver ? "info" : "primary"}
                              className="rounded-pill px-2 py-1 x-small fw-normal"
                            >
                              {isReceiver ? "Bên Gửi" : "Bên Nhận"}
                            </Badge>
                            <Badge
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                              className="border-0 px-2 py-1 x-small"
                            >
                              <FontAwesomeIcon
                                icon={statusStyle.icon}
                                className="me-1"
                              />{" "}
                              {statusStyle.text}
                            </Badge>
                          </div>

                          <div className="d-flex align-items-center mb-3">
                            <div className="product-thumb me-2">
                              <img
                                src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${item.product_pinner?.main_cardimage}`}
                                alt="product"
                                className="rounded-2"
                                width="50"
                                height="50"
                                style={{ objectFit: "cover" }}
                                onError={(e) =>
                                  (e.target.src =
                                    "https://via.placeholder.com/50")
                                }
                              />
                            </div>
                            <div className="overflow-hidden">
                              <h6
                                className="fw-bold mb-0 text-truncate text-main small"
                                title={item.product_pinner?.name}
                              >
                                {item.product_pinner?.name}
                              </h6>
                              <code className="text-muted x-small">
                                #{item.product_id}
                              </code>
                            </div>
                          </div>

                          <div
                            className="p-2 rounded bg-light mb-3"
                            style={{ fontSize: "0.75rem" }}
                          >
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Đối tác:</span>
                              <span
                                className="fw-bold text-truncate ms-2"
                                style={{ maxWidth: "100px" }}
                              >
                                {item.partner_info?.company_name}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span className="text-muted">Số lượng:</span>
                              <span className="fw-bold">
                                {item.Quantity || 0} SP
                              </span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Hạn:</span>
                              <span className="fw-bold text-aws-orange">
                                {moment(item.End_date).format("DD/MM/YY")}
                              </span>
                            </div>
                          </div>

                          <div className="d-grid">
                            <Button
                              onClick={() => openModal("OEMacp", item)}
                              variant="light"
                              size="sm"
                              className="btn-aws-soft py-1 text-muted fw-bold small"
                            >
                              Chi tiết
                            </Button>
                          </div>
                        </Card.Body>
                        <div
                          className="px-3 pb-2 text-end opacity-50"
                          style={{ fontSize: "0.6rem" }}
                        >
                          {moment(item.updatedAt).fromNow()}
                        </div>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <Col xs={12} className="text-center py-5">
                  <FontAwesomeIcon
                    icon={faSearch}
                    size="3x"
                    className="text-light mb-3"
                  />
                  <h6 className="text-muted">Không tìm thấy bản ghi phù hợp</h6>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default OrderProcess;
