import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Nav,
  Tab,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faTruck,
  faArrowRight,
  faClock,
  faCheckCircle,
  faExclamationCircle,
  faEye,
  faSignature,
  faBoxOpen,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import "../../scss/volt/components/Manufacture/ShipOrderProcess.scss";
import OrderDetailModal from "../Modal/OrderDetailModal";

const ShippingOrder = () => {
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [modalstate, setmodastate] = useState({
    detail: false,
  });

  const [modaldata, setmodaldata] = useState(null);
  const [orderdata, setorderdata] = useState({
    Shipping_process: [],
    Shipping_receiver: [],
  });

  const fetchShipOrder = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchShipOrderAPI(User);
      if (res?.RC === 200) {
        setorderdata({
          Shipping_process: res.RD.Shipping_process,
          Shipping_receiver: res.RD.Shipping_receiver,
        });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    fetchShipOrder();
  }, []);

  const StatusBadge = ({ confirm, label }) => {
    const isAccepted = confirm === "accepted" || confirm === "confirmed";
    return (
      <div className={`handshake-status ${isAccepted ? "active" : "pending"}`}>
        <FontAwesomeIcon
          icon={isAccepted ? faCheckCircle : faClock}
          className="me-1"
        />
        <span className="small fw-bold">{label}</span>
      </div>
    );
  };

  const OrderCard = ({ order, isOutgoing }) => {
    const isReady =
      order.sender_confirm === "confirmed" &&
      order.receiver_confirm === "accepted" &&
      order.transporter_confirm === "accepted";

    return (
      <Card className="aws-resource-card border-0 shadow-sm mb-3">
        <OrderDetailModal
          onHide={() =>
            setmodastate((prev) => ({
              ...prev,
              detail: false,
            }))
          }
          order={modaldata}
          show={modalstate.detail}
        />
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col lg={3} className="border-end-lg">
              <div className="d-flex align-items-center">
                <div className="icon-box-aws me-3">
                  <FontAwesomeIcon icon={faBox} />
                </div>
                <div>
                  <div className="extra-small text-muted fw-bold">ORDER ID</div>
                  <div className="fw-800 text-aws-navy">{order.id}</div>
                  <div className="extra-small text-muted">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </Col>

            {/* Cột 2: Hành trình 3 nhà */}
            <Col lg={4} className="py-3 py-lg-0 border-end-lg px-lg-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-center">
                  <div className="tiny-label">NGƯỜI GỬI</div>
                  <div
                    className="small fw-bold text-truncate"
                    style={{ maxWidth: "80px" }}
                  >
                    {order.sender_data.company_name}
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-muted small"
                />
                <div className="text-center">
                  <div className="tiny-label">BÊN NHẬN</div>
                  <div
                    className="small fw-bold text-truncate"
                    style={{ maxWidth: "80px" }}
                  >
                    {order.receiver_data.company_name}
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-muted small"
                />
                <div className="text-center">
                  <div className="tiny-label">VẬN TẢI</div>
                  <div
                    className="small fw-bold text-truncate"
                    style={{ maxWidth: "80px" }}
                  >
                    {order.shipper_data.company_name}
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={3} className="py-2 py-lg-0 px-lg-4 text-center">
              <div className="d-flex justify-content-center gap-2">
                <StatusBadge confirm={order.sender_confirm} label="S" />
                <StatusBadge confirm={order.transporter_confirm} label="T" />
                <StatusBadge confirm={order.receiver_confirm} label="R" />
              </div>
              <div className="mt-2">
                {isReady ? (
                  <Badge bg="success" className="aws-badge-status">
                    SẴN SÀNG XUẤT KHO
                  </Badge>
                ) : (
                  <Badge bg="warning" className="aws-badge-status text-dark">
                    ĐANG CHỜ ĐỒNG THUẬN
                  </Badge>
                )}
              </div>
            </Col>

            {/* Cột 4: Nút bấm */}
            <Col lg={2} className="text-end">
              <div className="d-grid gap-2">
                <Button
                  onClick={() => {
                    setmodastate((prev) => ({
                      ...prev,
                      detail: true,
                    }));
                    setmodaldata(order);
                  }}
                  variant="outline-dark"
                  size="sm"
                  className="aws-btn-secondary"
                >
                  <FontAwesomeIcon icon={faEye} className="me-2" /> Chi tiết
                </Button>
                {!isReady && (
                  <Button
                    variant="aws-orange"
                    size="sm"
                    className="aws-btn-primary"
                  >
                    <FontAwesomeIcon icon={faSignature} className="me-2" /> Xử
                    lý ngay
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const EmptyOrderState = ({ title, description, actionText, onAction }) => (
    <Card border="light" className="shadow-sm border-0 py-5">
      <Card.Body className="text-center">
        <div className="icon-shape icon-xl bg-soft-orange text-aws-orange rounded-circle mb-4 mx-auto">
          <FontAwesomeIcon icon={faBoxOpen} size="3x" className="opacity-50" />
        </div>
        <h5 className="text-aws-navy">{title}</h5>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px" }}>
          {description}
        </p>
        {onAction && (
          <Button
            variant="aws-orange"
            className="aws-btn-primary px-4"
            onClick={onAction}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            {actionText}
          </Button>
        )}
      </Card.Body>
    </Card>
  );

  if (isload)
    return (
      <div className="loader-container">
        <RocketLoad />
      </div>
    );

  return (
    <Container fluid className="p-4 bg-aws-light min-vh-100">
      <div className="mb-4">
        <h4 className="fw-800 text-aws-navy">Shipment Console</h4>
        <p className="text-muted small">
          Quản lý và điều phối vận tải đa phương thức trên TraceChain
        </p>
      </div>

      <Tab.Container defaultActiveKey="process">
        <Nav variant="pills" className="aws-tabs mb-4">
          <Nav.Item>
            <Nav.Link eventKey="process" className="px-4">
              Đơn hàng đã gửi ({orderdata.Shipping_process.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="receiver" className="px-4">
              Đơn hàng đến / Vận chuyển ({orderdata.Shipping_receiver.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="process">
            {orderdata.Shipping_process.length > 0 ? (
              orderdata.Shipping_process.map((order) => (
                <OrderCard key={order.id} order={order} isOutgoing={true} />
              ))
            ) : (
              <EmptyOrderState
                title="Chưa có vận đơn gửi đi"
                description="Hiện tại bạn chưa khởi tạo yêu cầu vận chuyển nào. Các đơn hàng bạn gửi đi sẽ xuất hiện tại đây để theo dõi lộ trình."
                actionText="TẠO ĐƠN VẬN MỚI"
                onAction={() => {
              
                }}
              />
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="receiver">
            {orderdata.Shipping_receiver.length > 0 ? (
              orderdata.Shipping_receiver.map((order) => (
                <OrderCard key={order.id} order={order} isOutgoing={false} />
              ))
            ) : (
              <EmptyOrderState
                title="Danh sách nhận hàng trống"
                description="Bạn chưa có đơn hàng nào cần tiếp nhận hoặc vận chuyển. Khi có đối tác gửi yêu cầu, thông tin sẽ hiển thị tại đây."
              />
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default ShippingOrder;
