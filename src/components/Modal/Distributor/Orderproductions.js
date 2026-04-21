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
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faMicrochip,
  faFileContract,
  faSearch,
  faTools,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../../scss/volt/components/Manufacture/OEMproductions.scss";
import OEMacceptRequestModal from "../Modal/Manufacture/OEMacceptRequestModal";

const Orderproductions = () => {
  const [OEMs, setOEMs] = useState([]);
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [modalstate, setmodalstate] = useState({
    OEMacp: false,
  });
  const [modaldata, setmodaldata] = useState({
    OEMacp: null,
  });

  const fetchOEMs = async () => {
    try {
      setisload(true);
      const res = await api_request.fecthORMs(User);
      if (res && res.RC === 200) {
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

  const openModal = (key, data) => {
    setmodalstate((prev) => ({ ...prev, [key]: true }));
    setmodaldata((prev) => ({ ...prev, [key]: data }));
  };

  const closeModal = (key, isrefresh) => {
    setmodalstate((prev) => ({ ...prev, [key]: false }));
    setmodaldata((prev) => ({ ...prev, [key]: null }));
    if (isrefresh) {
      fetchOEMs();
    }
  };

  const getStatusConfig = (status, isReceiver) => {
    switch (status) {
      case "pending":
        return {
          text: isReceiver ? "Cần xác nhận" : "Đang chờ phản hồi",
          variant: "warning",
          icon: faTools,
          bg: "#fff7e6",
          color: "#ffa000",
        };
      case "active":
        return {
          text: "Đang hoạt động",
          variant: "success",
          icon: faMicrochip,
          bg: "#e6fffa",
          color: "#00a854",
        };
      case "rejected":
        return {
          text: "Bị từ chối",
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

  if (isload) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-75">
        <RocketLoad />
      </div>
    );
  }

  return (
    <div className="aws-oem-wrapper">
      <OEMacceptRequestModal
        show={modalstate.OEMacp}
        close={() => closeModal("OEMacp", false)}
        closeRefresh={() => closeModal("OEMacp", true)}
        data={modaldata.OEMacp}
      />
      <Container fluid className="aws-oem-wrapper px-4">
        <Row className="py-4">
          <Col xs={12} className="mb-4">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-white rounded-circle shadow-sm me-3">
                <FontAwesomeIcon
                  icon={faIndustry}
                  className="text-aws-orange"
                  size="lg"
                />
              </div>
              <div>
                <h3 className="fw-bold text-main m-0">Production Hub</h3>
                <p className="text-muted mb-0">
                  Manage your subcontracting and manufacturing orders
                </p>
              </div>
            </div>
          </Col>
          
          <Col xs={12}>
            <Card className="aws-card h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold m-0 text-main">Assignments List</h5>
                    <small className="text-muted">
                      Theo dõi và quản lý tiến độ gia công toàn hệ thống
                    </small>
                  </div>
                  <Button
                    variant="light"
                    className="rounded-pill px-3 text-muted border-0"
                  >
                    View History
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  {OEMs && OEMs.length > 0 ? (
                    OEMs.map((item) => {
                      const isReceiver = !item.is_my_order;
                      const statusStyle = getStatusConfig(
                        item.status,
                        isReceiver,
                      );

                      return (
                        <Col
                          xl={4}
                          lg={6}
                          md={6}
                          xs={12}
                          className="mb-4"
                          key={item.id}
                        >
                          <Card className="aws-card-item border-0 shadow-xs h-100 position-relative overflow-hidden">
                            <div
                              style={{
                                height: "4px",
                                backgroundColor: statusStyle.color,
                              }}
                            />

                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex gap-1">
                                  <Badge
                                    bg={isReceiver ? "info" : "primary"}
                                    className="rounded-pill px-2 py-1 small fw-normal shadow-none"
                                  >
                                    {isReceiver ? "Bên Nhận" : "Bên Gửi"}
                                  </Badge>
                                  {item.is_OEM && (
                                    <Badge
                                      bg={"info"}
                                      className="rounded-pill px-2 py-1 small fw-normal shadow-none"
                                    >
                                      OEM
                                    </Badge>
                                  )}
                                </div>

                                <Badge
                                  style={{
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                  }}
                                  className="border-0 px-2 py-1"
                                >
                                  <FontAwesomeIcon
                                    icon={statusStyle.icon}
                                    className="me-1 x-small"
                                  />
                                  {statusStyle.text}
                                </Badge>
                              </div>

                              <div className="d-flex align-items-center mb-3">
                                <div className="product-thumb me-3">
                                  <img
                                    src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${item.product_pinner?.main_cardimage}`}
                                    alt="product"
                                    className="rounded-3 shadow-sm"
                                    style={{
                                      width: "65px",
                                      height: "65px",
                                      objectFit: "cover",
                                      border: "1px solid #eee",
                                    }}
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/65";
                                    }}
                                  />
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                  <h6 className="fw-bold mb-0 text-truncate text-main">
                                    {item.product_pinner?.name}
                                  </h6>
                                  <p className="text-muted x-small mb-1 text-truncate">
                                    ID: {item.product_id}
                                  </p>
                                  <div className="mb-1">
                                    {item.product_pinner?.OEMfile ? (
                                      <a
                                        href={`${process.env.REACT_APP_API_IMAGE_URL}OEM-file/${item.product_pinner.OEMfile}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-aws-orange x-small fw-bold text-decoration-none d-flex align-items-center"
                                      >
                                        <FontAwesomeIcon
                                          icon={faFileUpload}
                                          className="me-1"
                                        />
                                        Tài liệu hướng dẫn
                                      </a>
                                    ) : (
                                      <span className="text-muted x-small fst-italic d-flex align-items-center">
                                        <FontAwesomeIcon
                                          icon={faFileUpload}
                                          className="me-1 opacity-50"
                                        />
                                        Không có tài liệu
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-aws-orange fw-bold x-small mb-0">
                                    {item.product_pinner?.price?.toLocaleString()}{" "}
                                    VNĐ
                                  </p>
                                </div>
                              </div>

                              <div className="p-2 rounded-3 bg-light mb-3">
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                  <span className="x-small text-muted">
                                    Đối tác:
                                  </span>
                                  <span
                                    className="x-small fw-bold text-main text-truncate ms-2"
                                    style={{ maxWidth: "150px" }}
                                  >
                                    {item.partner_info?.company_name}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                  <span className="x-small text-muted">
                                    Số lượng:
                                  </span>
                                  <span className="x-small fw-bold text-dark">
                                    {item.Quantity || 0} sản phẩm
                                  </span>
                                </div>
                                <div className="d-flex align-items-center justify-content-between">
                                  <span className="x-small text-muted">
                                    Thời hạn:
                                  </span>
                                  <span className="x-small text-dark fw-600">
                                    {moment(item.Start_date).format("DD/MM")} -{" "}
                                    {moment(item.End_date).format("DD/MM/YYYY")}
                                  </span>
                                </div>
                              </div>

                              <div className="d-grid gap-2">
                                {item.status === "pending" && isReceiver ? (
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    className="btn-aws-orange text-white border-0 py-2 fw-bold"
                                    onClick={() => openModal("OEMacp", item)}
                                  >
                                    {item.is_OEM
                                      ? "Duyệt gia công ngay"
                                      : "Duyệt yêu cầu ngay"}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="border-0 py-2 text-muted fw-bold bg-aws-soft"
                                  >
                                    {item.status === "pending" && !isReceiver
                                      ? "Đang chờ phản hồi..."
                                      : "Xem chi tiết"}
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                            <div className="px-3 pb-2 text-end">
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.65rem" }}
                              >
                                Cập nhật: {moment(item.updatedAt).fromNow()}
                              </small>
                            </div>
                          </Card>
                        </Col>
                      );
                    })
                  ) : (
                    <Col xs={12} className="text-center py-5">
                      <div className="opacity-20 mb-3">
                        <FontAwesomeIcon icon={faSearch} size="4x" />
                      </div>
                      <h6 className="text-muted">
                        Chưa có bản ghi gia công nào
                      </h6>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Orderproductions;
