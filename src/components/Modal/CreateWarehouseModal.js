import React, { useContext, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faMapMarkerAlt,
  faSun,
  faSnowflake,
  faIcicles,
  faWind,
  faMicrochip,
  faArrowRight,
  faTags,
  faCrosshairs,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/CreateWarehouseModal.scss";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import Otp_verify_dynamic from "./Otp_verify_dynamic";

const CreateWarehouseModal = ({ show, handleClose, closeReload }) => {
  const { User } = useContext(UserContext);
  const [formData, setFormData] = useState({
    warehouse_name: "",
    warehouse_type: "Logistics Center",
    type: "dry",
    location: "",
    status: "active",
  });
  const [modalstate, setmodalstate] = useState(false);

  const createWarehouse = async (challenge_code) => {
    try {
      const res = await api_request.createWarehouseApi(
        User,
        challenge_code,
        formData,
      );
      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFormData({ ...formData, location: locationString });
        },
        (error) => {
          console.error(error);
          toast.error(
            "Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí.",
          );
        },
      );
    } else {
      toast.error("Trình duyệt của bạn không hỗ trợ lấy tọa độ GPS.");
    }
  };

  const warehouseTypes = [
    {
      id: "dry",
      label: "KHO KHÔ",
      icon: faSun,
      color: "#f59e0b",
      desc: "Hàng tiêu dùng, linh kiện (Normal temp)",
    },
    {
      id: "cold",
      label: "KHO LẠNH",
      icon: faWind,
      color: "#0ea5e9",
      desc: "Thực phẩm, dược phẩm (0°C to 15°C)",
    },
    {
      id: "frozen",
      label: "KHO ĐÔNG",
      icon: faIcicles,
      color: "#6366f1",
      desc: "Hàng cấp đông sâu (Below -18°C)",
    },
    {
      id: "normal",
      label: "KHO THƯỜNG",
      icon: faWarehouse,
      color: "#64748b",
      desc: "Lưu trữ đa năng, không yêu cầu nhiệt độ",
    },
  ];

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={handleClose}
      size="xl"
      className="warehouse-init-modal"
    >
      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => {
          setmodalstate(false);
          closeReload();
        }}
        message={"Xác nhận tạo kho hàng mới"}
        onSuccess={(challenge_code) => {
          return createWarehouse(challenge_code);
        }}
        show={modalstate}
        title={"PIN VERIFY"}
      />
      <Modal.Header className="border-0">
        <Modal.Title className="d-flex align-items-center text-white">
          <FontAwesomeIcon icon={faMicrochip} className="me-3 text-info" />
          KHỞI TẠO KHO HÀNG (WAREHOUSE)
        </Modal.Title>
        <Button
          variant="close"
          onClick={handleClose}
          className="btn-close-white shadow-none"
        />
      </Modal.Header>

      <Modal.Body className="p-4 p-lg-5">
        <Row>
          <Col lg={6} className="pe-lg-5 border-end">
            <div className="section-label mb-4">
              <Badge bg="primary" className="px-3 py-2 mb-2">
                PHÂN LOẠI MÔI TRƯỜNG
              </Badge>
              <p className="text-muted small">
                Chọn môi trường lưu trữ để hệ thống tự động tối ưu hóa Logic
                Blockchain.
              </p>
            </div>

            <div className="type-selector-grid">
              {warehouseTypes.map((t) => (
                <div
                  key={t.id}
                  className={`type-option ${formData.type === t.id ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, type: t.id })}
                >
                  <div
                    className="icon-circle"
                    style={{ backgroundColor: `${t.color}20`, color: t.color }}
                  >
                    <FontAwesomeIcon icon={t.icon} />
                  </div>
                  <div className="fw-bold small">{t.label}</div>
                  <div className="text-muted" style={{ fontSize: "0.65rem" }}>
                    {t.desc}
                  </div>
                </div>
              ))}
            </div>

            <h6 className="fw-bold text-navy mb-3 mt-4">THÔNG TIN ĐỊNH DANH</h6>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Tên kho hàng</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faTags} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="VD: Meta Warehouse - Dist 9"
                  onChange={(e) =>
                    setFormData({ ...formData, warehouse_name: e.target.value })
                  }
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Địa chỉ / Vị trí địa lý
              </Form.Label>
              <InputGroup className="shadow-sm border-0">
                <InputGroup.Text className="bg-white border-end-0">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-danger"
                  />
                </InputGroup.Text>

                <Form.Control
                  className="border-start-0 border-end-0"
                  placeholder="Nhập địa chỉ hoặc [Vĩ độ, Kinh độ]"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />

                <Button
                  className="border-start-0 px-3"
                  onClick={handleGetCurrentLocation}
                  title="Lấy tọa độ hiện tại"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  <FontAwesomeIcon icon={faCrosshairs} />{" "}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted small">
                Gợi ý: Nhấn nút tâm ngắm để tự động lấy tọa độ GPS hiện tại.
              </Form.Text>
            </Form.Group>
          </Col>

          <Col lg={6} className="ps-lg-5">
            <div className="digital-twin-preview shadow-lg">
              <div className="blueprint-grid"></div>

              <div className="warehouse-isometric text-center">
                <FontAwesomeIcon
                  icon={warehouseTypes.find((t) => t.id === formData.type).icon}
                  size="5x"
                  className="mb-4"
                  style={{
                    color: warehouseTypes.find((t) => t.id === formData.type)
                      .color,
                  }}
                />
                <h4 className="text-white fw-extrabold mb-2">
                  {formData.warehouse_name || "WAREHOUSE-TYPE"}
                </h4>
                <Badge bg="info" className="mb-3">
                  TYPE: {formData.type.toUpperCase()}
                </Badge>

                <div className="mt-4 p-3 bg-dark bg-opacity-50 rounded border border-secondary border-opacity-25 w-100">
                  <div
                    className="text-start small text-info font-monospace"
                    style={{ fontSize: "0.7rem" }}
                  >
                    &gt; Initializing Ledger... <br />
                    &gt; Setting Environment: {formData.type} <br />
                    &gt; Location: {formData.location || "Undefined"}
                  </div>
                </div>
              </div>

              <div
                className="position-absolute bottom-0 start-0 m-3 text-white-50"
                style={{ fontSize: "0.6rem" }}
              >
                TRACECHAIN_V2 // SYSTEM_READY
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light border-0 px-5 py-4">
        <Button
          variant="link"
          className="text-gray-600 text-decoration-none"
          onClick={handleClose}
        >
          Hủy bỏ thao tác
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const requiredFields = {
              warehouse_name: "Tên kho hàng",
              warehouse_type: "Loại hình vận hành",
              type: "Môi trường lưu trữ",
              location: "Địa chỉ hoặc tọa độ GPS",
            };
            for (const [key, label] of Object.entries(requiredFields)) {
              if (!formData[key] || formData[key].toString().trim() === "") {
                return toast.error(`Trường [${label}] không được để trống!`);
              }
            }

            setmodalstate(true);
          }}
          className="px-5 py-2 fw-bold shadow-lg d-flex align-items-center"
          style={{ borderRadius: "12px" }}
        >
          XÁC NHẬN KHỞI TẠO KHO{" "}
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateWarehouseModal;
