import React, { useContext, useEffect, useState } from "react";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faMapMarkerAlt,
  faClock,
  faCheckCircle,
  faRoute,
  faGasPump,
  faIdCard,
  faShieldAlt,
  faSitemap,
  faBoxes,
  faWeightHanging,
  faMapMarkedAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion/dist/framer-motion";
import "../../scss/volt/components/Driver/DriverDashboard.scss";
import { useHistory } from "react-router-dom";
import OrderDetailModalDriver from "../../components/Modal/Transporter/OrderDetailModalDriver";
import { Badge, Row } from "@themesberg/react-bootstrap";

const Driver_dashboard = () => {
  const { User } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [isload, setisload] = useState(false);
  const history = useHistory();

  const [modalstate, setmodalstate] = useState({
    detail: false,
  });

  const openModal = (key) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const closeModal = (key) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const MyOrder = async (isSilent = false) => {
      try {
        if (!isSilent && isMounted) setisload(true);

        const res = await api_request.getMyOrder(User);

        if (isMounted && res && res.RC === 200) {
          setData(res.RD);
        }
      } catch (error) {
        if (isMounted) console.error(error);
      } finally {
        if (isMounted) setisload(false);
      }
    };

    MyOrder();

    const timer = setInterval(() => {
      MyOrder(true);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [User]);
  if (isload && !data)
    return <div className="loader">Đang khởi tạo lộ trình...</div>;

  let status = "Hàng chưa sẵn sàng";
  switch (data?.order?.status) {
    case "ready_to_pick":
      status = "Hàng sẵn sàng";
      break;
    case "in_truck":
      status = "Đã bốc hàng";
      break;
    case "shiping":
      status = "Đang vận chuyển!";
      break;
    case "proposed":
      status = "Đơn chưa sẵn sàng";
      break;
    case "outTruck":
      status = "Đã dỡ hàng";
      break;
    case "delivered":
      status = "Đã hoàn thành";
      break;
    case "mising_product":
      status = "Thiếu hàng";
      break;
    case "failed":
      status = "Thất bại";
      break;
    case "batch_fixed":
      status = "Sửa hàng";
      break;
    case "return":
      status = "Trả hàng";
      break;
    default:
  }

  let driver_status = "Chưa bắt đầu chuyến";
  switch (data?.order?.fleet_status[data?.id]) {
    case "not_start":
      driver_status = "Chưa bắt đầu chuyến";
      break;
    case "ship_start":
      driver_status = "Đang tới nhà cung cấp";
      break;
    case "arrived":
      driver_status = "Đã tới nhà cung cấp!";
      break;
    case "picking":
      driver_status = "Hàng đã lên xe";
      break;
    case "take_out":
      driver_status = "Hàng đã xuống xe";
      break;
    case "delivering":
      driver_status = "Đang vận chuyển";
      break;
    case "return":
      driver_status = "Trả hàng";
      break;
    case "delivered":
      driver_status = "Đã hoàn thành";
      break;

    default:
  }
  return (
    <div className="driver-dashboard">
      <OrderDetailModalDriver
        isOpen={modalstate?.detail}
        data={data}
        onClose={() => closeModal("detail")}
      />
      <div className="bg-decorator"></div>

      <header className="dashboard-header">
        <div className="user-profile">
          <div className="avatar-wrapper">
            <img
              src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${data?.vehicle_main_avatar}`}
              alt="truck"
              className="truck-avatar"
            />
            <div className="online-indicator"></div>
          </div>
          <div className="info">
            <h3 className="plate-number">{data?.plate_number}</h3>
            <p className="vehicle-type">
              <FontAwesomeIcon icon={faIdCard} className="me-1" />{" "}
              {data?.vehicle_type}
            </p>
          </div>
        </div>
        <div className="fleet-badge">
          <FontAwesomeIcon icon={faSitemap} className="me-1" />
          {data?.Fleets[0]?.fleet_code}
        </div>
      </header>

      <main className="dashboard-content">
        <AnimatePresence mode="wait">
          {data?.order ? (
            <motion.section
              key="active-order"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="active-order-card"
            >
              <div className="card-header-aws">
                <div className="status-row">
                  <div className="badge-milestone">
                    <span className="dot"></span>
                    {status.toUpperCase()}
                  </div>
                  <div className="badge-driver">{driver_status}</div>
                </div>
              </div>

              <div className="shipping-route-v2">
                <div className="route-step">
                  <div className="step-icon origin">
                    <div className="dot-inner"></div>
                  </div>
                  <div className="step-content">
                    <label>ĐIỂM ĐI</label>
                    <div className="address">
                      {data?.order?.start_add || "Tổng kho TraceChain"}
                    </div>
                  </div>
                </div>

                <div className="route-path">
                  <div className="path-line"></div>
                  <div className="path-truck">
                    <FontAwesomeIcon icon={faTruck} />
                  </div>
                </div>

                <div className="route-step">
                  <div className="step-icon destination">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="dest-icon"
                    />
                  </div>
                  <div className="step-content">
                    <label>ĐIỂM ĐẾN</label>
                    <div className="address">
                      {data?.order?.target_add || "Địa chỉ nhận hàng"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-quick-info-v2">
                <div className="info-box-v2">
                  <div className="icon-wrapper route">
                    <FontAwesomeIcon icon={faRoute} />
                  </div>
                  <div className="text-group">
                    <span>{Number(data.order.distance).toFixed(1)} km</span>
                  </div>
                </div>

                <div className="info-box-v2">
                  <div className="icon-wrapper quantity">
                    <FontAwesomeIcon icon={faBoxes} />
                  </div>
                  <div className="text-group">
                    <span>{data.order.total_quantity} kiện</span>
                  </div>
                </div>

                <div className="info-box-v2">
                  <div className="icon-wrapper weight">
                    <FontAwesomeIcon icon={faWeightHanging} />
                  </div>
                  <div className="text-group">
                    <span>
                      {data.capacity >= 1000
                        ? `${(data.capacity / 1000).toFixed(1)} tấn`
                        : `${data.capacity} kg`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="order-mobile-actions">
                <button
                  className="btn-nav-main"
                  onClick={() => {
                    if (data?.order) {
                      const {
                        start_lng,
                        start_lat,
                        target_lng,
                        target_lat,
                        id,
                        fleet_status,
                      } = data.order;

                      const currentDriverStatus =
                        fleet_status?.[data.id] || "not_start";

                      history.push({
                        pathname: `/navigation/${start_lng},${start_lat}/${target_lng},${target_lat}/${id}`,
                        state: {
                          DriverStatus: currentDriverStatus,
                          vehicle_id: data.id,
                          lastUpdated: new Date().toISOString(),
                        },
                      });
                    } else {
                      toast.warn("Hiện tại chưa có lộ trình di chuyển!");
                    }
                  }}
                >
                  <div className="icon-circle">
                    <FontAwesomeIcon icon={faMapMarkedAlt} />
                  </div>
                  <div className="label-group">
                    <span>MỞ BẢN ĐỒ DẪN ĐƯỜNG</span>
                  </div>
                </button>

                <button
                  className="btn-info-sub"
                  onClick={() => openModal("detail")}
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Xem chi tiết đơn hàng
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.div
              key="no-order"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state-card"
            >
              <div className="pulse-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h4>Sẵn sàng nhận đơn</h4>
              <p>Hệ thống chưa ghi nhận đơn hàng mới!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="stats-grid mt-3">
          <div className="stat-card">
            <div className="stat-icon fuel">
              <FontAwesomeIcon icon={faGasPump} />
            </div>
            <div className="stat-data">
              <p>{data?.Fleets[0]?.fuel_norm_average}L</p>
              <small>Định mức / 100km</small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon weight">
              <FontAwesomeIcon icon={faTruck} />
            </div>
            <div className="stat-data">
              <p>{data?.capacity}kg</p>
              <small>Tải trọng tối đa</small>
            </div>
          </div>
        </div>

        <section className="operation-area-v2 mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon
                icon={faMapMarkedAlt}
                className="text-info small"
              />
              <span
                className="fw-800 text-aws-navy text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Khu vực hoạt động
              </span>
            </div>
            {data?.Fleets?.[0]?.operation_area?.length > 0 && (
              <Badge
                bg="soft-info"
                className="text-info fw-bold border-0"
                style={{ fontSize: "9px" }}
              >
                {data.Fleets[0].operation_area.length} VÙNG
              </Badge>
            )}
          </div>

          <div className="area-wrapper">
            {data?.Fleets?.[0]?.operation_area?.length > 0 ? (
              <div
                className="d-flex overflow-auto pb-2 gap-2 hide-scrollbar"
                style={{ webkitOverflowScrolling: "touch" }}
              >
                {data.Fleets[0].operation_area.map((area) => (
                  <div
                    key={area}
                    className="bg-white border rounded-pill px-3 py-1 d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      whiteSpace: "nowrap",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <span
                      className="bg-success rounded-circle"
                      style={{ width: "6px", height: "6px" }}
                    ></span>
                    <span
                      className="fw-700 text-aws-navy"
                      style={{ fontSize: "12px" }}
                    >
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed rounded-3 p-3 d-flex align-items-center gap-3">
                <div
                  className="bg-soft-secondary rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: "40px", height: "40px", fontSize: "20px" }}
                >
                  🌐
                </div>
                <div>
                  <h6
                    className="mb-0 fw-800 text-aws-navy"
                    style={{ fontSize: "13px" }}
                  >
                    Toàn quốc
                  </h6>
                  <p
                    className="mb-0 text-muted"
                    style={{ fontSize: "11px", lineHeight: "1.2" }}
                  >
                    Tài xế tự do, hỗ trợ vận chuyển toàn quốc
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Driver_dashboard;
