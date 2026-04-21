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
  faEye,
  faSignature,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import "../../scss/volt/components/Manufacture/ShipOrderProcess.scss";
import OrderDetailModal from "../Modal/OrderDetailModal";
import { useLocation } from "react-router-dom";

const ShipOrderProcess = () => {
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const highlineId = query.get("highline");
  const isModalNeeded = query.get("openModal") === "true";
  const [modalstate, setmodastate] = useState({
    detail: false,
  });
  const [modaldata, setmodaldata] = useState(null);
  const [activeTab, setActiveTab] = useState("process");
  const [orderdata, setorderdata] = useState({
    Shipping_process: [],
    Shipping_receiver: [],
  });

  useEffect(() => {
    if (
      !isload &&
      (orderdata.Shipping_process.length > 0 ||
        orderdata.Shipping_receiver.length > 0) &&
      highlineId
    ) {
      const targetId = String(highlineId);

      const inProcess = orderdata.Shipping_process.find(
        (o) => String(o.id) === targetId,
      );
      const inReceiver = orderdata.Shipping_receiver.find(
        (o) => String(o.id) === targetId,
      );
      const targetOrder = inProcess || inReceiver;

      if (targetOrder) {
        if (inReceiver && activeTab !== "receiver") {
          setActiveTab("receiver");
        } else if (inProcess && activeTab !== "process") {
          setActiveTab("process");
        }

        setTimeout(() => {
          const element = document.getElementById(`ship-card-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("aws-highline-active");
            setTimeout(
              () => element.classList.remove("aws-highline-active"),
              4000,
            );
          }

          if (isModalNeeded) {
            handleShowDetail(targetOrder);
          }
        }, 600);
      }
    }
  }, [highlineId, isModalNeeded, orderdata, isload]);

  const fetchShipOrder = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchShipOrderAPI(User);
      if (res?.RC === 200) {
        setorderdata({
          Shipping_process: res.RD.Shipping_process || [],
          Shipping_receiver: res.RD.Shipping_receiver || [],
        });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    fetchShipOrder();
  }, []);

  const handleShowDetail = (order) => {
    setmodaldata(order);
    setmodastate({ detail: true });
  };

  if (isload) {
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
    <Container fluid className="p-2 p-md-4 bg-aws-light min-vh-100">
      {modaldata && (
        <OrderDetailModal
          show={modalstate.detail}
          onHide={() => setmodastate({ detail: false })}
          closeReload={() => {
            setmodastate({ detail: false });
            fetchShipOrder();
          }}
          order={modaldata}
        />
      )}

      <div className="mb-4 ps-2">
        <h4 className="fw-800 text-aws-navy mb-1">Shipment Console</h4>
        <p className="text-muted small">
          Quản lý và điều phối vận tải đa phương thức trên TraceChain
        </p>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <div className="aws-tabs-wrapper mb-4">
          <Nav
            variant="pills"
            className="aws-tabs flex-nowrap overflow-auto py-2"
          >
            <Nav.Item>
              <Nav.Link eventKey="process" className="px-3 px-md-4 text-nowrap">
                Đơn hàng đã gửi ({orderdata.Shipping_process.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="ms-2">
              <Nav.Link
                eventKey="receiver"
                className="px-3 px-md-4 text-nowrap"
              >
                Đơn hàng đến ({orderdata.Shipping_receiver.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <Tab.Content>
          <Tab.Pane eventKey="process">
            {orderdata.Shipping_process.length > 0 ? (
              orderdata.Shipping_process.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onShowDetail={handleShowDetail}
                  query={query}
                />
              ))
            ) : (
              <EmptyState message="Chưa có đơn hàng nào được gửi" />
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="receiver">
            {orderdata.Shipping_receiver.length > 0 ? (
              orderdata.Shipping_receiver.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onShowDetail={handleShowDetail}
                />
              ))
            ) : (
              <EmptyState message="Chưa có đơn hàng vận chuyển đến" />
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

const OrderCard = ({ order, onShowDetail, query }) => {
  const isReady =
    order.sender_confirm === "confirmed" &&
    order.receiver_confirm === "accepted" &&
    order.transporter_confirm === "accepted";

  return (
    <Card
      id={`ship-card-${order.id}`}
      className={`aws-resource-card border-0 shadow-sm mb-3 mx-2 ${String(query?.get("highline")) === String(order.id) ? "aws-highline-init" : ""}`}
    >
      <Card.Body className="p-3">
        <Row className="align-items-center g-3">
          <Col xs={12} lg={3} className="border-end-lg">
            <div className="d-flex align-items-center">
              <div className="icon-box-aws me-3 bg-soft-primary text-primary">
                <FontAwesomeIcon icon={faBox} />
              </div>
              <div className="min-width-0">
                <div className="extra-small text-muted fw-bold uppercase">
                  Mã vận đơn
                </div>
                <div
                  className="fw-800 text-aws-navy text-truncate"
                  style={{ maxWidth: "180px" }}
                >
                  {order.id}
                </div>
                <div className="extra-small text-muted">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} lg={4} className="py-2 py-lg-0 border-end-lg px-lg-4">
            <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border border-dashed">
              <div className="text-center flex-grow-1">
                <div className="tiny-label opacity-50">SENDER</div>
                <div
                  className="small fw-bold text-truncate mx-auto"
                  style={{ maxWidth: "70px" }}
                >
                  {order.sender_data?.company_name || "N/A"}
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-muted small mx-2"
              />
              <div className="text-center flex-grow-1 border-start border-end px-1">
                <div className="tiny-label opacity-50">RECEIVER</div>
                <div
                  className="small fw-bold text-truncate mx-auto"
                  style={{ maxWidth: "70px" }}
                >
                  {order.receiver_data?.company_name || "N/A"}
                </div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="text-muted small mx-2"
              />
              <div className="text-center flex-grow-1">
                <div className="tiny-label opacity-50">SHIPPER</div>
                <div
                  className="small fw-bold text-truncate mx-auto"
                  style={{ maxWidth: "70px" }}
                >
                  {order.shipper_data?.company_name || "N/A"}
                </div>
              </div>
            </div>
          </Col>

          <Col xs={7} lg={3} className="text-center px-lg-4">
            <div className="d-flex justify-content-center gap-1 mb-2">
              <StatusIcon
                confirm={order.sender_confirm}
                label="S"
                title="Sender"
              />
              <StatusIcon
                confirm={order.transporter_confirm}
                label="T"
                title="Transporter"
              />
              <StatusIcon
                confirm={order.receiver_confirm}
                label="R"
                title="Receiver"
              />
            </div>
            <Badge
              bg={isReady ? "success" : "warning"}
              className="w-100 py-1 extra-small uppercase ls-1"
            >
              {isReady ? "Đồng thuận hoàn tất" : "Chờ đồng thuận"}
            </Badge>
          </Col>

          <Col xs={5} lg={2} className="text-end">
            <div className="d-grid gap-2">
              <Button
                onClick={() => onShowDetail(order)}
                variant="outline-primary"
                size="sm"
                className="fw-bold shadow-none"
              >
                <FontAwesomeIcon icon={faEye} className="me-md-2" />
                <span className="d-none d-md-inline">Xem chi tiết</span>
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const StatusIcon = ({ confirm, label, title }) => {
  const isOk = confirm === "accepted" || confirm === "confirmed";
  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-circle fw-bold text-white ${isOk ? "bg-success" : "bg-gray-400"}`}
      style={{ width: "22px", height: "22px", fontSize: "10px" }}
      title={`${title}: ${confirm}`}
    >
      {label}
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-5 bg-white rounded shadow-sm mx-2">
    <FontAwesomeIcon icon={faBox} size="3x" className="text-gray-200 mb-3" />
    <p className="text-muted fw-bold">{message}</p>
  </div>
);

export default ShipOrderProcess;
