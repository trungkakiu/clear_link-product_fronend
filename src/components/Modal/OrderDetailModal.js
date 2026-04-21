import React, { use, useContext, useEffect, useState } from "react";
import {
  Modal,
  Table,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Image,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faBuilding,
  faTruck,
  faUserTie,
  faSignature,
  faCheckCircle,
  faExternalLinkAlt,
  faWeightHanging,
  faTags,
  faMapMarkedAlt,
  faMoneyBillWave,
  faPlus,
  faTimesCircle,
  faMap,
  faClock,
  faHandHoldingUsd,
  faHashtag,
  faCheckDouble,
  faFileSignature,
  faHandshake,
  faUndo,
  faMotorcycle,
  faCalculator,
  faMapMarkerAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/pages/OrderDetailModal.scss";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import AddVehicleOrderModal from "./Transporter/AddVehicleOrderModal";
import Otp_verify_dynamic from "./Otp_verify_dynamic";
import MapNavigationPage from "../MapNavigationPage";
import MapNavigationModal from "../MapNavigationPage";
import AdvancedInspectionModal from "./Distributor/AdvancedInspectionModal";
import ShipperInspectionModal from "./Transporter/ShipperInspectionModal";

const OrderDetailModal = ({ show, onHide, order, closeReload }) => {
  const imageBaseUrl = process.env.REACT_APP_API_IMAGE_URL;
  const { User } = useContext(UserContext);
  const [fleetLiveStatus, setFleetLiveStatus] = useState({
    locations: order?.fleet_current_locations || {},
    histories: order?.fleet_route_histories || {},
  });
  const [selectedVehicles, setSelectedVehicles] = useState(
    order?.shipping_vehicle || [],
  );

  useEffect(() => {
    if (order) {
      setSelectedVehicles(order.shipping_vehicle || []);
      setInspectionData(order);
    }
  }, [order?.id]);
  const [modalstate, setmodalstate] = useState({
    addvehicle: false,
    shipingAccept: false,
    distAccept: false,
    inTruck: false,
    outTruck: false,
    delivered: false,
    order_ready: false,
    intruck_confirm: false,
    tracking_order: false,
    inspection: false,
    inspectionShiper: false,
  });
  const [isOffline, setIsOffline] = useState(false);
  const [inspectionData, setInspectionData] = useState(order);
  const [inspectionType, setInspectionType] = useState("confirm");
  const [currentShipperLocation, setCurrentShipperLocation] = useState([]);

  const fetchShipperLocation = async () => {
    if (!modalstate.tracking_order || !order?.id) return;

    try {
      const res = await api_request.fetchShipperLocationApi(User, order?.id);
      if (res && res.RC === 200 && res.RD) {
        const vehiclesArray = res.RD.vehicles || [];
        const newLocations = {};

        vehiclesArray.forEach((v) => {
          if (v.lat && v.lng) {
            newLocations[v.id] = {
              lat: Number(v.lat),
              lng: Number(v.lng),
              updatedAt: v.updatedAt,
            };
          }
        });

        setFleetLiveStatus((prev) => ({
          ...prev,
          locations: newLocations,
        }));

        const lastUpdate = new Date(res.RD.last_update).getTime();
        setIsOffline(Date.now() - lastUpdate > 300000);
      }
    } catch (error) {
      console.error("Error fetching shipper location:", error);
    }
  };

  const vehiclecapacity = selectedVehicles.reduce((sum, v) => {
    return sum + (parseFloat(v.capacity) || 0);
  }, 0);

  let isWeightAble =
    vehiclecapacity >= parseFloat(inspectionData.total_weight || 0);

  const weightGap =
    parseFloat(inspectionData.total_weight || 0) - vehiclecapacity;

  useEffect(() => {
    let intervalId;

    if (order?.id && modalstate.tracking_order) {
      fetchShipperLocation();
      intervalId = setInterval(fetchShipperLocation, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Cleared tracking interval");
      }
    };
  }, [order?.id, modalstate.tracking_order]);

  const [modalMessage, setmodalMessage] = useState({
    message: "",
    title: "",
  });

  const [apistate, setapistate] = useState();

  const openModal = (
    key,
    title = "PIN VERIFY",
    message = "Nhập mã PIN để xác nhận!",
  ) => {
    setmodalMessage({ title, message });
    setapistate(key);
    setmodalstate((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key) => {
    setmodalstate((prev) => ({ ...prev, [key]: false }));
    setapistate(null);
  };

  const handleAddVehicle = (vehicle) => {
    if (!selectedVehicles.find((v) => v.id === vehicle.id)) {
      setSelectedVehicles((prev) => [...prev, vehicle]);
    } else {
      toast.info("Xe này đã có trong danh sách điều động!");
    }
  };

  useEffect(() => {
    if (modalstate.tracking_order) {
      const interval = setInterval(() => {}, 5000);
      return () => clearInterval(interval);
    }
  }, [modalstate.tracking_order === true]);

  const AcceptShippingOrder = async (challenge_code, type) => {
    try {
      let res;
      switch (apistate) {
        case "shipingAccept":
          res = await api_request.AcceptShippingOrderApi(
            User,
            order.id,
            challenge_code,
            selectedVehicles,
            inspectionData?.execution_type,
          );
          break;
        case "order_ready":
          res = await api_request.orderReadytoPick(
            User,
            order.id,
            challenge_code,
          );
          break;
        case "distAccept":
          res = await api_request.disAcceptShippingOrderApi(
            User,
            order?.id,
            challenge_code,
          );
          break;
        case "inTruck":
          res = await api_request.intruckBatch(User, order?.id, challenge_code);
          break;
        case "outTruck":
          res = await api_request.shipingComplete(
            User,
            order?.id,
            challenge_code,
          );
          break;
        case "delivered":
          res = await api_request.receivedBatch(
            User,
            order?.id,
            challenge_code,
          );
          break;
        case "intruck_confirm":
          res = await api_request.intruckConfirm(
            User,
            order.id,
            challenge_code,
          );
          break;
      }

      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      } else {
        return {
          RM: "Lỗi hệ thống!",
          RC: 500,
        };
      }
    } catch (error) {
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    }
  };

  const handleRemoveVehicle = (vehicleId) => {
    setSelectedVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  };

  if (!order) return null;

  const totalWeight = order?.batches?.reduce(
    (sum, b) => sum + (parseFloat(b.total_weight) || 0),
    0,
  );

  const PartnerInfo = ({ title, data, confirmStatus, icon }) => (
    <div
      className={`timeline-node ${confirmStatus === "accepted" || confirmStatus === "confirmed" ? "success" : "warning"}`}
    >
      <div className="node-icon">
        {data?.logo ? (
          <Image
            src={`${imageBaseUrl}Company-logo/${data.logo}`}
            roundedCircle
            className="partner-logo-sm"
          />
        ) : (
          <FontAwesomeIcon icon={icon} />
        )}
      </div>
      <div className="node-content">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="tiny-label text-uppercase">{title}</div>
            <div className="fw-800 text-aws-navy d-flex align-items-center">
              {data?.company_name || "N/A"}
              {data?.chain_status === "active" && (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-info ms-2"
                  title="On-chain Verified"
                />
              )}
            </div>
            <div className="extra-small text-muted">
              ID: {data?.id || "N/A"}
            </div>
          </div>
          <Badge
            bg={
              confirmStatus === "confirmed" || confirmStatus === "accepted"
                ? "success"
                : "warning"
            }
            className="handshake-badge"
          >
            {confirmStatus === "confirmed" || confirmStatus === "accepted"
              ? "ĐÃ XÁC NHẬN"
              : "CHỜ PHÊ DUYỆT"}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      centered
      show={show}
      onHide={onHide}
      size="xl"
      className="aws-modal-v2"
    >
      <ShipperInspectionModal
        closeReload={closeReload}
        data={inspectionData}
        show={modalstate.inspectionShiper}
        mode={inspectionType}
        onHide={() =>
          setmodalstate((prev) => ({ ...prev, inspectionShiper: false }))
        }
      />
      <AdvancedInspectionModal
        data={inspectionData}
        onHide={() => setmodalstate((prev) => ({ ...prev, inspection: false }))}
        show={modalstate.inspection}
        type={inspectionType}
        closeReload={closeReload}
      />
      <MapNavigationModal
        show={modalstate.tracking_order}
        onClose={() => setmodalstate({ ...modalstate, tracking_order: false })}
        destination={[Number(order?.target_lng), Number(order?.target_lat)]}
        orderId={order?.id || "TX-2026"}
        startPoint={[Number(order?.start_lng), Number(order?.start_lat)]}
        fleetAssignments={order?.fleet_assignments}
        fleetCurrentLocations={fleetLiveStatus.locations}
        fleetRouteHistories={fleetLiveStatus.histories}
      />
      <AddVehicleOrderModal
        show={modalstate.addvehicle}
        close={() => setmodalstate((prev) => ({ ...prev, addvehicle: false }))}
        type_delivery={order.type_delivery}
        onSelectVehicle={handleAddVehicle}
      />

      <Otp_verify_dynamic
        close={() => closeModal(apistate)}
        closeReload={() => {
          closeModal(apistate);
          closeReload();
        }}
        message={modalMessage.message}
        onSuccess={(challenge_code) => {
          return AcceptShippingOrder(challenge_code);
        }}
        show={
          modalstate.shipingAccept ||
          modalstate.inTruck ||
          modalstate.intruck_confirm ||
          modalstate.shipingAccept ||
          modalstate.distAccept ||
          modalstate.delivered ||
          modalstate.order_ready ||
          modalstate.outTruck
        }
        title={modalMessage.title}
      />

      <Modal.Header className="bg-aws-navy text-white border-0 py-3">
        <Modal.Title className="h6 mb-0 fw-bold d-flex align-items-center">
          <div className="order-id-tag me-3">VẬN ĐƠN</div>
          {order.id}
          <Badge bg="info" className="ms-3 extra-small text-uppercase">
            {order.status}
          </Badge>
        </Modal.Title>
        <Button
          variant="close"
          onClick={onHide}
          className="btn-close-white shadow-none"
        />
      </Modal.Header>

      <Modal.Body className="bg-aws-light p-4">
        <Row className="g-4">
          <Col lg={8}>
            <Card
              className="border-0 shadow-sm mb-4 overflow-hidden"
              style={{ borderRadius: "12px" }}
            >
              <Card.Header className="bg-aws-navy py-3 border-0">
                <h6
                  className="fw-bold text-white mb-0 text-uppercase d-flex align-items-center"
                  style={{ fontSize: "14px", letterSpacing: "1px" }}
                >
                  <div
                    className="icon-shape icon-xs bg-aws-orange text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{ width: "30px", height: "30px" }}
                  >
                    <FontAwesomeIcon icon={faTruck} />
                  </div>
                  Thông số vận hành đơn vận
                </h6>
              </Card.Header>
              <Card.Body className="p-4 bg-white">
                <Row className="g-4">
                  {/* KHỐI 1: LOẠI XE */}
                  <Col md={4} sm={6}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 p-3 bg-soft-info rounded-3 text-info me-3">
                        <FontAwesomeIcon icon={faTruck} size="lg" />
                      </div>
                      <div>
                        <div
                          className="extra-small text-muted fw-bold text-uppercase mb-1"
                          style={{ fontSize: "10px" }}
                        >
                          Phương tiện
                        </div>
                        <div className="fw-800 text-aws-navy text-uppercase h6 mb-0">
                          {order.type_delivery || "N/A"}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col md={4} sm={6}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 p-3 bg-soft-warning rounded-3 text-warning me-3">
                        <FontAwesomeIcon icon={faTags} size="lg" />
                      </div>
                      <div>
                        <div
                          className="extra-small text-muted fw-bold text-uppercase mb-1"
                          style={{ fontSize: "10px" }}
                        >
                          Phân loại hàng
                        </div>
                        <div className="fw-800 text-aws-navy text-uppercase h6 mb-0">
                          {order.type_capatry || "N/A"}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col md={4} sm={6}>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 p-3 bg-soft-success rounded-3 text-success me-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" />
                      </div>
                      <div>
                        <div
                          className="extra-small text-muted fw-bold text-uppercase mb-1"
                          style={{ fontSize: "10px" }}
                        >
                          Lộ trình dự kiến
                        </div>
                        <div className="fw-800 text-success h6 mb-0">
                          {parseFloat(order.distance).toLocaleString()}{" "}
                          <small className="fw-bold">KM</small>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {(User?.data?.role === "manufacturer" ||
                    User?.data?.role === "transporter") && (
                    <Col xs={12}>
                      <div className="mt-2 p-3 rounded-3 border-start border-4 border-success bg-light d-flex justify-content-between align-items-center shadow-sm">
                        <div className="d-flex align-items-center">
                          <div
                            className="icon-shape bg-success text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                          </div>
                          <div>
                            <span
                              className="small text-muted fw-bold text-uppercase d-block"
                              style={{ fontSize: "11px" }}
                            >
                              Tổng chi phí vận chuyển thỏa thuận
                            </span>
                            <span className="h5 fw-900 text-aws-navy mb-0">
                              {parseFloat(
                                order.total_ship_price,
                              ).toLocaleString()}{" "}
                              <small className="text-muted">VNĐ</small>
                            </span>
                          </div>
                        </div>
                        <Badge
                          bg="soft-success"
                          className="text-success border border-success px-3 py-2 rounded-pill"
                        >
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-1"
                          />{" "}
                          On-Chain Validated
                        </Badge>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-800 text-aws-navy mb-4 d-flex align-items-center border-bottom pb-2">
                  <FontAwesomeIcon
                    icon={faSignature}
                    className="me-2 text-aws-orange"
                  />
                  PHÊ DUYỆT ĐIỀU PHỐI (3-WAY HANDSHAKE)
                </h6>
                <div className="shipping-timeline-v2">
                  <PartnerInfo
                    title="Bên gửi hàng (Sender)"
                    data={order.sender_data}
                    confirmStatus={order.sender_confirm}
                    icon={faBuilding}
                  />
                  <PartnerInfo
                    title="Đơn vị vận chuyển (Shipper)"
                    data={order.shipper_data}
                    confirmStatus={order.transporter_confirm}
                    icon={faTruck}
                  />
                  <PartnerInfo
                    title="Bên nhận hàng (Customer)"
                    data={order.receiver_data}
                    confirmStatus={order.receiver_confirm}
                    icon={faUserTie}
                  />
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h6 className="fw-800 text-aws-navy mb-3">
                  CHI TIẾT KIỆN HÀNG ({order.batches?.length})
                </h6>
                <div className="table-responsive">
                  <Table hover className="aws-table-clean">
                    <thead>
                      <tr>
                        <th>Batch ID</th>
                        <th>Tên sản phẩm / Lô</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-center">Trọng lượng</th>
                        <th className="text-end">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.batches?.map((batch) => (
                        <tr key={batch.id}>
                          <td>
                            <code className="text-aws-orange fw-bold">
                              {batch.id}
                            </code>
                          </td>
                          <td>
                            <div className="fw-bold small">
                              {batch.batch_name}
                            </div>
                            <div className="extra-small text-muted">
                              Hết hạn:{" "}
                              {new Date(batch.expiry_date).toLocaleDateString(
                                "vi-VN",
                              )}
                            </div>
                          </td>
                          <td className="text-center fw-800">
                            {batch.quantity.toLocaleString()}
                          </td>
                          <td className="text-center">
                            <Badge bg="light" className="text-dark border-0">
                              {batch.total_weight} kg
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Badge
                              pill
                              bg="light"
                              className="text-info border shadow-none extra-small text-uppercase"
                            >
                              {batch.Shiping_status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-bottom py-2 px-3 text-center">
                <h6 className="fw-800 text-aws-navy mb-0 small">
                  BẢO CHỨNG TRACECHAIN
                </h6>
              </Card.Header>
              <Card.Body className="text-center p-4">
                <div className="qr-container-main">
                  <QRCode value={order.id} size={140} fgColor="#232f3e" />
                  <div className="qr-label mt-2">ID: {order.id}</div>
                </div>

                <div className="blockchain-status-box mt-4">
                  <Badge
                    bg={
                      order.onchain_status === "delivery_signed"
                        ? "success"
                        : "secondary"
                    }
                    className="w-100 py-2 mb-3 shadow-none"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    {order.onchain_status === "agreement_pending"
                      ? "CHỜ KÝ SỐ GIAO DỊCH"
                      : order.onchain_status === "agreement_hashed" &&
                          order.status === "proposed"
                        ? "ĐÃ KÝ GIAO DỊCH - ĐANG CHUẨN BỊ HÀNG"
                        : order.onchain_status === "agreement_hashed" &&
                            order.status === "ready_to_pick"
                          ? "ĐÃ KÝ GIAO DỊCH - CHỜ XUẤT KHO"
                          : order.onchain_status === "agreement_hashed" &&
                              order.status === "in_truck"
                            ? "ĐÃ KÝ GIAO DỊCH - CHỜ VẬN CHUYỂN"
                            : order.onchain_status === "pickup_verified"
                              ? "ĐANG VẬN CHUYỂN"
                              : order.onchain_status === "delivery_signed"
                                ? "ĐƠN HÀNG ĐÃ GIAO THÀNH CÔNG"
                                : order.onchain_status === "failed"
                                  ? "GIAO DỊCH THẤT BẠI"
                                  : order.onchain_status === "pairing"
                                    ? "ĐANG XỬ LÝ ON-CHAIN"
                                    : "CHỜ ĐỒNG THUẬN"}
                  </Badge>

                  <div className="text-start">
                    <div className="tiny-label">Mã giao dịch (TxHash)</div>
                    <div
                      className="hash-text-box small text-break"
                      style={{
                        fontSize: "10px",
                        background: "#f4f4f4",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      {order.blockchain_tx || "Giao dịch đang chờ khởi tạo..."}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm bg-aws-navy text-white">
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div>
                  <Row className="mb-4">
                    <Col
                      xs={6}
                      className="border-end border-white border-opacity-10"
                    >
                      <span className="tiny-label opacity-50 d-block mb-1 text-uppercase ls-1">
                        <FontAwesomeIcon
                          icon={faWeightHanging}
                          className="me-1 text-aws-orange"
                        />
                        Trọng tải
                      </span>
                      <div className="h4 fw-800 mb-0 text-aws-orange">
                        {totalWeight ? totalWeight.toLocaleString() : "0"}
                        <span className="ms-1 small opacity-50">Kg</span>
                      </div>
                    </Col>
                    <Col xs={6} className="ps-3">
                      <span className="tiny-label opacity-50 d-block mb-1 text-uppercase ls-1">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="me-1 text-info"
                        />
                        Số lượng
                      </span>
                      <div className="h4 fw-800 mb-0">
                        {order.total_quantity
                          ? order.total_quantity.toLocaleString()
                          : "0"}
                        <span className="ms-1 small opacity-50">SP</span>
                      </div>
                    </Col>
                  </Row>

                  <div className="summary-row mb-4 bg-white bg-opacity-5 p-2 rounded">
                    <span className="tiny-label opacity-50 d-block mb-1 text-uppercase ls-1">
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        className="me-1 text-danger"
                      />
                      Địa chỉ giao nhận
                    </span>
                    <div className="small fw-bold text-info text-truncate-2">
                      {order.delivery_address || "Chưa xác định"}
                    </div>
                  </div>

                  {(User?.data?.role === "distributor" ||
                    User?.data?.role === "manufacturer") &&
                    order.product_total_price && (
                      <div className="summary-row mb-3 pt-3 border-top border-white border-opacity-10">
                        <span className="tiny-label opacity-50 d-block mb-1 text-uppercase ls-1">
                          <FontAwesomeIcon
                            icon={faHandHoldingUsd}
                            className="me-1 text-success"
                          />
                          TỔNG GIÁ TRỊ HÀNG HÓA
                        </span>
                        <div className="h3 fw-900 mb-0 text-aws-orange">
                          {Number(order.product_total_price).toLocaleString()}
                          <span className="ms-2 small fw-normal">VND</span>
                        </div>
                      </div>
                    )}
                </div>
                <div>
                  <hr className="my-3 opacity-10" />
                  <div className="extra-small italic opacity-50 lh-sm">
                    <FontAwesomeIcon icon={faHashtag} className="me-1" />
                    Dữ liệu đã được mã hóa On-chain. Mọi thay đổi trái phép sẽ
                    bị hệ thống từ chối.
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={12}>
            {User?.data?.role === "transporter" && (
              <Row className="g-3">
                {" "}
                <Col lg={8}>
                  <Card className="border-0 shadow-sm h-100">
                    {" "}
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <h6 className="fw-800 text-aws-navy mb-0 text-uppercase">
                          <FontAwesomeIcon
                            icon={faTruck}
                            className="me-2 text-info"
                          />
                          Điều động đội xe ({selectedVehicles.length})
                        </h6>
                        <div className="d-flex align-items-center">
                          <span className="text-muted small me-2 text-nowrap">
                            Hình thức vận chuyển:
                          </span>
                          <Form.Select
                            size="sm"
                            className="fw-bold text-aws-navy border-0 bg-light shadow-none"
                            style={{ width: "180px" }}
                            value={inspectionData.execution_type || "Single"}
                            onChange={(e) =>
                              setInspectionData((prev) => ({
                                ...prev,
                                execution_type: e.target.value,
                              }))
                            }
                            disabled={selectedVehicles.length <= 1}
                          >
                            <option value="Single">🚚 Đơn lẻ</option>
                            <option value="Convoy">🚛 Theo đoàn</option>
                            <option value="Independent">🚐 Độc lập</option>
                          </Form.Select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <Badge
                          bg={isWeightAble ? "success" : "danger"}
                          className="p-2 w-100 shadow-none"
                        >
                          <FontAwesomeIcon
                            icon={
                              isWeightAble
                                ? faCheckCircle
                                : faExclamationTriangle
                            }
                            className="me-2"
                          />
                          {isWeightAble
                            ? "Sức tải đạt yêu cầu"
                            : `Thiếu tải: ${weightGap.toLocaleString()} kg`}
                        </Badge>
                      </div>

                      {selectedVehicles.length > 0 ? (
                        <div className="table-responsive rounded border">
                          <Table className="align-items-center table-flush mb-0 aws-table-clean">
                            <thead className="thead-light">
                              <tr>
                                <th className="border-bottom small fw-bold">
                                  BIỂN SỐ
                                </th>
                                <th className="border-bottom small fw-bold text-center">
                                  TRẠNG THÁI
                                </th>
                                <th className="border-bottom small fw-bold text-center">
                                  TẢI TRỌNG
                                </th>
                                <th className="border-bottom small fw-bold text-end pe-3">
                                  TÀI XẾ
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedVehicles.map((v) => (
                                <tr key={v.id}>
                                  <td>
                                    <div
                                      className="text-aws-navy fw-bold"
                                      style={{ fontSize: "13px" }}
                                    >
                                      {v.plate_number}
                                    </div>
                                    <Badge
                                      bg="light"
                                      className="text-dark border extra-small text-uppercase"
                                    >
                                      {v.vehicle_category}
                                    </Badge>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center justify-content-center">
                                      {(() => {
                                        const status =
                                          order?.fleet_status?.[v.id];
                                        let badgeClass =
                                          "bg-soft-secondary text-secondary";
                                        let statusText = status || "unknown";

                                        if (
                                          status === "delivering" ||
                                          status === "in_transit"
                                        ) {
                                          badgeClass =
                                            "bg-soft-success text-success";
                                          statusText = "Đang giao";
                                        } else if (status === "delivered") {
                                          badgeClass = "bg-soft-info text-info";
                                          statusText = "Đã giao";
                                        } else if (
                                          status === "waiting" ||
                                          status === "pending"
                                        ) {
                                          badgeClass =
                                            "bg-soft-warning text-warning";
                                          statusText = "Đang chờ";
                                        }

                                        return (
                                          <span
                                            className={`badge ${badgeClass} rounded-pill fw-bold`}
                                            style={{
                                              padding: "5px 10px",
                                              fontSize: "10px",
                                              textTransform: "uppercase",
                                              border: "1px solid currentColor",
                                              letterSpacing: "0.5px",
                                            }}
                                          >
                                            {statusText}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </td>

                                  <td className="text-center fw-bold">
                                    {v.capacity}{" "}
                                    <small>{v.capacity_unit}</small>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center justify-content-end pe-2">
                                      <div className="text-end me-2">
                                        <div className="small fw-bold mb-0">
                                          {v.Driver?.name || "Chưa gán"}
                                        </div>
                                        <div className="extra-small text-muted">
                                          {v.Driver?.phone_number || "N/A"}
                                        </div>
                                      </div>
                                      <div
                                        className="avatar-sm bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                        style={{
                                          width: "30px",
                                          height: "30px",
                                          fontSize: "11px",
                                          border: "1px solid #e5e7eb",
                                        }}
                                      >
                                        {v.Driver?.name
                                          ?.charAt(0)
                                          .toUpperCase() || "T"}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-5 bg-light rounded border border-dashed">
                          <FontAwesomeIcon
                            icon={faTruck}
                            size="2x"
                            className="opacity-20 mb-2"
                          />
                          <div className="small fw-bold text-muted">
                            Vui lòng thêm xe để bắt đầu
                          </div>
                        </div>
                      )}

                      {order.transporter_confirm !== "accepted" && (
                        <Button
                          variant="aws-orange"
                          size="sm"
                          className="w-100 mt-3 fw-bold"
                          onClick={() =>
                            setmodalstate((prev) => ({
                              ...prev,
                              addvehicle: true,
                            }))
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} className="me-1" />{" "}
                          Thêm xe vào đội
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Header className="bg-aws-navy text-white py-3">
                      <h6
                        className="mb-0 text-uppercase fw-bold"
                        style={{ fontSize: "13px" }}
                      >
                        <FontAwesomeIcon
                          icon={faCalculator}
                          className="me-2 text-aws-orange"
                        />
                        Yêu cầu vận chuyển
                      </h6>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <div className="info-list">
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                          <span className="text-muted small">
                            Hình thức giao:
                          </span>
                          <span className="fw-bold text-aws-navy">
                            {inspectionData.type_delivery}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                          <span className="text-muted small">Loại hàng:</span>
                          <span className="fw-bold text-aws-navy">
                            {inspectionData.type_capatry}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                          <span className="text-muted small">Quãng đường:</span>
                          <span className="fw-bold text-aws-navy">
                            {order.distance} km
                          </span>
                        </div>
                        <div className="p-3 bg-light rounded text-center mt-4">
                          <div className="text-muted extra-small mb-1">
                            ĐƠN GIÁ THỎA THUẬN
                          </div>
                          <h5 className="fw-bold text-aws-orange mb-0">
                            {Number(
                              inspectionData.cost_per_km,
                            ).toLocaleString()}{" "}
                            <small>đ/km</small>
                          </h5>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {User?.data?.role !== "transporter" && (
              <Card className="mt-3 border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-800 text-aws-navy mb-0 text-uppercase">
                      <FontAwesomeIcon
                        icon={faTruck}
                        className="me-2 text-info"
                      />
                      Đội xe điều động ({selectedVehicles.length})
                    </h6>
                  </div>

                  {selectedVehicles.length > 0 ? (
                    <div className=" table-responsive rounded border">
                      <Table className="align-items-center table-flush mb-0 aws-table-clean">
                        <thead className="thead-light">
                          <tr>
                            <th className="border-bottom small fw-bold">
                              BIỂN SỐ
                            </th>
                            <th className="border-bottom small fw-bold">
                              LOẠI XE
                            </th>
                            <th className="border-bottom small fw-bold text-center">
                              TẢI TRỌNG
                            </th>
                            <th className="border-bottom text-align-center small fw-bold">
                              TÀI XẾ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVehicles.map((v) => (
                            <tr key={v.id} className="aws-table-row-hover">
                              <td className="ps-3">
                                <div
                                  className="fw-bold text-aws-navy"
                                  style={{ fontWeight: "900" }}
                                >
                                  {v.plate_number}
                                </div>
                                <div className="extra-small text-muted">
                                  ID: {v.id.substring(0, 8)}...
                                </div>
                              </td>

                              <td>
                                <Badge
                                  bg="light"
                                  className="text-dark border text-uppercase"
                                  style={{
                                    fontSize: "10px",
                                    padding: "5px 8px",
                                  }}
                                >
                                  {v.vehicle_category}
                                </Badge>
                              </td>

                              <td className="text-center">
                                <div className="fw-bold">
                                  {v.capacity > 1000
                                    ? v.capacity / 1000
                                    : v.capacity}
                                </div>
                                <div className="extra-small text-muted text-uppercase">
                                  TẤN
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    className="avatar-sm bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold me-2"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      fontSize: "12px",
                                      border: "1px solid #e5e7eb",
                                    }}
                                  >
                                    {v.Driver?.name
                                      ? v.Driver.name.charAt(0).toUpperCase()
                                      : "T"}
                                  </div>
                                  <div>
                                    <div className="small fw-bold mb-0">
                                      {v.Driver?.name || "Chưa gán lái xe"}
                                    </div>
                                    <div className="extra-small text-muted">
                                      {v.Driver?.phone_number || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded border border-dashed">
                      <div className="text-muted mb-2">
                        <FontAwesomeIcon
                          icon={faTruck}
                          size="2x"
                          className="opacity-20"
                        />
                      </div>
                      <div className="small fw-bold text-muted">
                        Chưa có xe nào được chọn
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top p-3">
        <Button
          variant="link"
          className="text-muted fw-bold small"
          onClick={onHide}
        >
          ĐÓNG
        </Button>
        <SenderActions
          order={order}
          User={User}
          modalstate={modalstate}
          openModal={openModal}
        />
        <TransporterActions
          order={order}
          User={User}
          selectedVehicles={selectedVehicles}
          setmodalstate={setmodalstate}
          openModal={openModal}
          isWeightAble={isWeightAble}
        />
        <CustomerActions
          order={order}
          User={User}
          setmodalstate={setmodalstate}
          openModal={openModal}
          setInspectionData={setInspectionData}
          setInspectionType={setInspectionType}
          modalstate={modalstate}
        />
      </Modal.Footer>
    </Modal>
  );
};

const SenderActions = ({ order, User, modalstate, openModal }) => {
  if (User?.data?.company_id !== order?.sender_id) return null;

  return (
    <>
      {order?.transporter_confirm === "accepted" &&
      order?.receiver_confirm === "accepted" ? (
        <div className="ms-2">
          {order?.status === "ready_to_pick" ? (
            <Button
              variant="aws-orange"
              className="aws-btn-primary px-4"
              onClick={() =>
                openModal(
                  "inTruck",
                  "XÁC NHẬN XUẤT XƯỞNG",
                  "Nhập mã PIN để xác nhận hàng đã rời kho và lên xe vận chuyển!",
                )
              }
            >
              <FontAwesomeIcon icon={faSignature} className="me-2" /> Xuất xưởng
            </Button>
          ) : order?.status === "in_truck" ? (
            <Button
              variant="aws-orange"
              className="aws-btn-primary px-4"
              disabled
            >
              <FontAwesomeIcon icon={faSignature} className="me-2" /> Đợi đối
              tác xác nhận vận chuyển
            </Button>
          ) : order?.status === "proposed" ? (
            <Button
              onClick={() =>
                openModal(
                  "order_ready",
                  "XÁC NHẬN HÀNG HÓA",
                  "Nhập mã PIN để xác nhận hàng hóa đã sẵn sàng để vận chuyển!",
                )
              }
              variant="aws-orange"
              className="aws-btn-primary px-4"
            >
              <FontAwesomeIcon icon={faSignature} className="me-2" /> Sẵn sàng
              vận chuyển
            </Button>
          ) : (
            order?.status === "shipping" && (
              <Button
                onClick={() => openModal("tracking_order")}
                variant="aws-orange"
                className="aws-btn-primary px-4"
              >
                <FontAwesomeIcon icon={faSignature} className="me-2" /> Theo dõi
                đơn hàng
              </Button>
            )
          )}
        </div>
      ) : (
        <Button variant="aws-orange" className="aws-btn-primary px-4" disabled>
          <FontAwesomeIcon icon={faSignature} className="me-2" /> Đợi đối tác
          phản hồi
        </Button>
      )}
    </>
  );
};

const TransporterActions = ({
  order,
  User,
  selectedVehicles,
  setmodalstate,
  isWeightAble,
  openModal,
}) => {
  const isButtonDisabled = React.useMemo(() => {
    const hasNoVehicles = !selectedVehicles || selectedVehicles.length === 0;
    const isAlreadyOnChain = order?.onchain_status === "agreement_hashed";

    return isAlreadyOnChain || hasNoVehicles || !isWeightAble;
  }, [order?.onchain_status, selectedVehicles, isWeightAble]);
  if (User?.data?.role !== "transporter") return null;

  return (
    <div className="ms-2 d-flex">
      {order.transporter_confirm !== "accepted" ? (
        <Button
          variant="aws-orange"
          className="aws-btn-primary px-4"
          disabled={isButtonDisabled}
          title={
            order.onchain_status === "agreement_hashed"
              ? "Giao dịch đã On-chain thành công"
              : !selectedVehicles || selectedVehicles.length === 0
                ? "Vui lòng chọn ít nhất 1 xe để ký số"
                : "Nhấn để xác nhận ký số"
          }
          onClick={() =>
            openModal(
              "shipingAccept",
              "KÝ SỐ VẬN ĐƠN",
              "Xác nhận điều động xe và nhận vận chuyển đơn hàng này.",
            )
          }
        >
          <FontAwesomeIcon icon={faSignature} className="me-2" />
          {order.onchain_status === "agreement_hashed"
            ? "Đơn đã xác nhận"
            : "XÁC NHẬN KÝ SỐ"}
        </Button>
      ) : (
        <>
          {order.onchain_status === "agreement_hashed" && (
            <>
              <Button
                onClick={() => openModal("tracking_order")}
                variant="aws-orange"
                className="px-4 ms-2"
              >
                <FontAwesomeIcon icon={faSignature} className="me-2" />
                Tracking đơn hàng
              </Button>
              {order.status === "in_truck" && (
                <Button
                  variant="aws-orange"
                  className="px-4 ms-2"
                  onClick={() =>
                    openModal(
                      "intruck_confirm",
                      "XÁC NHẬN LẤY HÀNG",
                      "Nhập PIN để xác nhận bạn đã lấy hàng và bắt đầu vận chuyển!",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faSignature} className="me-2" /> Xác
                  nhận lấy hàng
                </Button>
              )}
            </>
          )}
          {order.status === "shipping" &&
            order.onchain_status === "pickup_verified" && (
              <>
                <Button
                  onClick={() => openModal("tracking_order")}
                  variant="aws-orange"
                  className="px-4 ms-2"
                >
                  <FontAwesomeIcon icon={faSignature} className="me-2" />
                  Tracking đơn hàng
                </Button>
                <Button
                  onClick={() =>
                    openModal(
                      "outTruck",
                      "XÁC NHẬN GIAO HÀNG",
                      "Xác nhận hàng thực đã được giao tới kho của khách hàng.",
                    )
                  }
                  variant="aws-orange"
                  className="px-4 ms-2"
                >
                  <FontAwesomeIcon icon={faSignature} className="me-2" />
                  Xác nhận đã giao
                </Button>
                <Button
                  onClick={() => setmodalstate("inspection")}
                  variant="danger"
                  className="px-4 ms-2"
                >
                  Giao hàng thất bại
                </Button>
              </>
            )}

          {order.onchain_status !== "agreement_hashed" &&
            order.status !== "shipping" && (
              <Button
                variant="aws-orange"
                className="aws-btn-primary px-4"
                disabled
              >
                <FontAwesomeIcon icon={faClock} className="me-2" /> Chờ phản hồi
              </Button>
            )}
        </>
      )}
    </div>
  );
};

const CustomerActions = ({
  order,
  User,
  openModal,
  setInspectionData,
  setInspectionType,
  setmodalstate,
  modalstate,
}) => {
  if (User?.data?.company_id !== order?.customer_id) return null;

  return (
    <div className="ms-2">
      {order.onchain_status === "delivery_signed" ? (
        <>
          <Button variant="warning" className="px-4 me-2">
            <FontAwesomeIcon icon={faCheckDouble} className="me-2" /> Nhập kho
          </Button>
          <Button variant="success" className="px-4" disabled>
            <FontAwesomeIcon icon={faCheckDouble} className="me-2" /> Đơn hoàn
            thành
          </Button>
        </>
      ) : (
        <>
          {order.receiver_confirm === "pending" ? (
            <Button
              variant="aws-orange"
              className="aws-btn-primary px-4"
              onClick={() =>
                openModal(
                  "distAccept",
                  "PIN VERIFY",
                  "Nhập mã PIN để xác nhận đơn vẩn chuyển này!",
                )
              }
            >
              <FontAwesomeIcon icon={faFileSignature} className="me-2" /> Xác
              nhận nhập hàng
            </Button>
          ) : (
            <div className="d-flex align-items-center">
              {!order.Delivery_completed ||
              order.onchain_status !== "pickup_verified" ? (
                <Button variant="outline-primary" className="px-4" disabled>
                  <FontAwesomeIcon icon={faBox} className="me-2" /> Chờ Shipper
                  lấy hàng...
                </Button>
              ) : (
                <>
                  {order?.status === "outTruck" ? (
                    <div className="d-flex gap-3 mt-3">
                      <Button
                        variant="aws-orange"
                        className="aws-btn-primary px-4 py-2 flex-grow-1"
                        onClick={() => {
                          setmodalstate((prev) => ({
                            ...prev,
                            inspectionShiper: true,
                          }));
                          setInspectionType("success");
                          setInspectionData(order);
                        }}
                      >
                        <FontAwesomeIcon icon={faHandshake} className="me-2" />
                        Xác nhận đã nhận hàng
                      </Button>

                      <Button
                        variant="outline-danger"
                        className="px-4 py-2 flex-grow-1"
                        onClick={() => {
                          setmodalstate((prev) => ({
                            ...prev,
                            inspectionShiper: true,
                          }));
                          setInspectionType("failed");
                          setInspectionData(order);
                        }}
                      >
                        <FontAwesomeIcon icon={faUndo} className="me-2" /> Trả
                        hàng
                      </Button>
                    </div>
                  ) : order?.status === "delivered" ? (
                    <Button
                      variant="aws-orange"
                      className="aws-btn-primary px-4"
                    >
                      <FontAwesomeIcon icon={faHandshake} className="me-2" />{" "}
                      Đơn hàng hoàn thành
                    </Button>
                  ) : (
                    <Button
                      variant="aws-orange"
                      className="aws-btn-primary px-4"
                      onClick={() => openModal("tracking_order")}
                    >
                      <FontAwesomeIcon icon={faHandshake} className="me-2" />{" "}
                      Theo dõi đơn hàng
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderDetailModal;
