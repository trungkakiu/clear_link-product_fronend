import React, { useContext, useEffect, useState } from "react";
import { Container, Badge, Row, Col, Card } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faWeightHanging,
  faMapMarkerAlt,
  faChevronRight,
  faSearch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import "../../scss/volt/components/Transporter/Allvehicles.scss";
import ViewVehicleModal from "../Modal/Transporter/ViewVehicleModal";

const Allvehicles = () => {
  const [isload, setisload] = useState(false);
  const { User } = useContext(UserContext);
  const [vehicles, setvehicles] = useState([]);
  const [drivers, setdrivers] = useState([]);
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [modalstate, setmodalstate] = useState(false);
  const [modaldata, setmodaldata] = useState(null);
  const fetchAllvehicle = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchAllvehicleAPI(User);
      if (res?.RC === 200) {
        setvehicles(res.RD.vehicles);
        setdrivers(res.RD.drivers);
      } else {
        toast.error(res?.RM || "Lỗi lấy dữ liệu");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setTimeout(() => setisload(false), 800);
    }
  };

  useEffect(() => {
    fetchAllvehicle();
  }, []);

  const truck_cate = {
    container: "Container",
    tanker: "Xe bồn chứa",
    refrigerated: "Xe lạnh",
    truck_closed: "Xe thùng kín",
    truck_open: "Xe thùng mở",
    dump_truck: "Xe ben",
    passenger: "Xe khách",
    crane_truck: "Xe cẩu tự hành",
    flatbed: "Xe sàn phẳng",
  };

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
    <Container fluid className="py-4">
      <ViewVehicleModal
        onHide={() => setmodalstate(false)}
        show={modalstate}
        vehicle={modaldata}
        closeReload={() => {
          setmodalstate(false);
          fetchAllvehicle();
        }}
        drivers={drivers}
      />
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-800 text-main mb-1">Fleet Management</h4>
          <p className="text-muted small mb-0">
            Quản lý và giám sát {vehicles.length} phương tiện vận tải
          </p>
        </div>
        <button
          className="btn btn-sm shadow-sm px-3 fw-bold"
          style={{ background: "#ff9900", color: "white", border: "none" }}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Đăng ký xe mới
        </button>
      </div>

      <div className="bg-white p-2 rounded shadow-sm mb-4 border d-flex gap-2">
        <div
          className="input-group input-group-sm"
          style={{ maxWidth: "400px" }}
        >
          <span className="input-group-text bg-white border-0">
            <FontAwesomeIcon icon={faSearch} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-none"
            placeholder="Tìm biển số, loại xe..."
          />
        </div>
      </div>

      {/* Grid Danh sách xe */}
      <div className="aws-vehicle-grid">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="vehicle-card"
            onClick={() => {
              setmodalstate(true);
              setmodaldata(v);
            }}
          >
            <div className="vehicle-header">
              <img
                src={
                  v.vehicle_main_avatar
                    ? `${API_URL}main-card/${v.vehicle_main_avatar}`
                    : "https://via.placeholder.com/400x200?text=No+Image"
                }
                className="main-img"
                alt="vehicle"
              />
              <Badge
                bg={v.status === "available" ? "success" : "warning"}
                className="status-badge"
              >
                {v.status}
              </Badge>
              <div className="view-detail-overlay">
                XEM CHI TIẾT HỒ SƠ{" "}
                <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
              </div>
            </div>

            <div className="vehicle-info">
              <div className="plate-number">
                <FontAwesomeIcon
                  icon={faTruck}
                  style={{ color: "#ff9900", fontSize: "14px" }}
                />
                {v.plate_number}
              </div>
              <div className="mb-2">
                <span className="vin-text">VIN: {v.vin_number || "N/A"}</span>
              </div>

              <div className="small text-muted mb-3">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="me-2 text-danger"
                />
                {v.current_location_name || "Chưa cập nhật vị trí"}
              </div>

              <div className="spec-row">
                <div className="spec-item">
                  <div className="label">Loại xe</div>
                  <div
                    className="value text-truncate"
                    style={{ maxWidth: "120px" }}
                    title={v.vehicle_category}
                  >
                    {truck_cate[v.vehicle_category]?.split("(")[0]}
                  </div>
                </div>
                <div className="spec-item border-start border-end">
                  <div className="label">Tải trọng</div>
                  <div className="value">
                    <FontAwesomeIcon
                      icon={faWeightHanging}
                      size="xs"
                      className="me-1 text-muted"
                    />
                    {v.capacity} {v.capacity_unit}
                  </div>
                </div>
                <div className="spec-item">
                  <div className="label">Phân loại</div>
                  <div
                    className="value text-truncate"
                    style={{ maxWidth: "120px" }}
                    title={v.vehicle_type}
                  >
                    {v.vehicle_type?.split("(")[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-5 bg-white rounded border">
          <p className="text-muted">Chưa có phương tiện nào được đăng ký.</p>
        </div>
      )}
    </Container>
  );
};

export default Allvehicles;
