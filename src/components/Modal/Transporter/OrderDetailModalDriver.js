import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faLocationDot,
  faTruckMoving,
  faCalendarCheck,
  faMoneyBillWave,
  faBoxOpen,
  faHashtag,
  faXmark,
  faRoute,
  faCopy,
  faDotCircle,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { faXbox } from "@fortawesome/free-brands-svg-icons";
import "../../../scss/volt/components/Transporter/OrderDetailModalMobile.scss";

const OrderDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;
  const order = data?.order;

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

  return (
    <div
      data-aos={"fade-up"}
      className={`modern-modal-overlay ${isOpen ? "active" : ""}`}
      onClick={onClose}
    >
      <div
        className="modern-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-handle"></div>

        <div className="modern-modal-header">
          <div className="header-info">
            <div className="icon-box">
              <FontAwesomeIcon icon={faTruckMoving} />
            </div>
            <div>
              <h6>Chi tiết vận đơn</h6>
              <small>Mã đơn: {order?.id.split("_")[1] || "N/A"}</small>
            </div>
          </div>
          <button onClick={onClose} className="close-circle-btn">
            <FontAwesomeIcon icon={faExclamation} />
          </button>
        </div>

        <div className="modern-modal-body">
          <div className="status-price-card">
            <div className="price-info">
              <small>TỔNG CƯỚC PHÍ</small>
              <h4 className="text-white">
                {Number(order?.total_ship_price).toLocaleString("vi-VN")}{" "}
                <span>đ</span>
              </h4>
            </div>
            <div className={`status-pill ${order?.status}`}>{status}</div>
          </div>
          <div className="modern-route-box">
            <div className="route-item">
              <div className="marker-wrapper">
                <div className="dot start"></div>
                <div className="line"></div>
              </div>
              <div className="content">
                <label>ĐIỂM BỐC HÀNG</label>
                <p>{order?.start_add}</p>
              </div>
            </div>
            <div className="route-item">
              <div className="marker-wrapper">
                <div className="dot end">
                  <FontAwesomeIcon icon={faDotCircle} />
                </div>
              </div>
              <div className="content">
                <label>ĐIỂM GIAO HÀNG</label>
                <p>{order?.target_add}</p>
              </div>
            </div>
          </div>
          <div className="modern-stats-grid">
            <div className="stat-card">
              <div className="s-icon purple">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <div className="s-data">
                <small>Số lượng</small>
                <p>{order?.total_quantity} kiện</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="s-icon orange">
                <FontAwesomeIcon icon={faRoute} />
              </div>
              <div className="s-data">
                <small>Quãng đường</small>
                <p>{order?.distance} km</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="s-icon blue">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="s-data">
                <small>Ngày tạo</small>
                <p>{new Date(order?.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="s-icon green">
                <FontAwesomeIcon icon={faHashtag} />
              </div>
              <div className="s-data">
                <small>Mã vận đơn</small>
                <p>#{order?.id.split("_")[1]}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Phương tiện (Dark Mode Card) */}
          <div className="modern-vehicle-card">
            <div className="v-icon">
              <FontAwesomeIcon icon={faTruckMoving} />
            </div>
            <div className="v-info">
              <p className="plate">{data.plate_number}</p>
              <p className="type">{data.vehicle_type}</p>
            </div>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(order?.id)}
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>

        <div className="modern-modal-footer">
          <button className="btn-close-main" onClick={onClose}>
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
