import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCube,
  faSnowflake,
  faBoxes,
  faMicrochip,
  faListOl,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/CreateZoneModal.scss";
import Processing_Modal from "./Processing_Modal";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

const CreateZoneModal = ({
  show,
  handleClose,
  warehouse,
  index,
  getWareHouse,
}) => {
  const { User } = useContext(UserContext);

  const [zoneData, setZoneData] = useState({
    warehouse_id: "",
    index: 1,
    zone_name: "",
    storage_method: "RACKING",
    is_expirable: false,
  });

  const [processStatus, setProcessStatus] = useState({
    show: false,
    state: "loading",
    msg: "",
  });

  useEffect(() => {
    if (show && warehouse) {
      // 🛡️ KIỂM TRA BỌC THÉP:
      // Nếu index truyền vào là object (do nhầm lẫn props) hoặc không có giá trị
      // thì ép nó về null để hệ thống tự tính toán lại.
      let passedIndex = typeof index === "number" ? index : null;

      let finalIndex = passedIndex;

      if (!finalIndex) {
        const zones = warehouse.zones || [];
        // Tìm số index lớn nhất hiện có và cộng thêm 1
        finalIndex =
          zones.length > 0
            ? Math.max(...zones.map((z) => z.index || 0)) + 1
            : 1;
      }

      setZoneData({
        warehouse_id: warehouse.id,
        index: finalIndex, // Chắc chắn là con số
        zone_name: "",
        storage_method: "RACKING",
        is_expirable: false,
      });
    }
  }, [show, warehouse, index]);

  console.log("warehouse: ", warehouse);

  const methods = [
    {
      id: "RACKING",
      label: "KỆ TẦNG",
      icon: faCube,
      color: "#10b981",
      desc: "Tối ưu cho hàng lẻ, có tọa độ ô kệ chi tiết.",
    },
    {
      id: "BULK_STORAGE",
      label: "TẬP TRUNG",
      icon: faBoxes,
      color: "#8b5cf6",
      desc: "Chứa hàng đổ đống, pallet sàn số lượng lớn.",
    },
    {
      id: "COLD_STORAGE",
      label: "KHO LẠNH",
      icon: faSnowflake,
      color: "#0ea5e9",
      desc: "Bảo quản nhiệt độ thấp, kiểm soát môi trường.",
    },
  ];

  // 2. Hàm gọi API khởi tạo Zone
  const createNewZones = async () => {
    try {
      setProcessStatus((prev) => ({
        ...prev,
        state: "loading",
        msg: "Đang ghi nhận Khu vực vào sổ cái TraceChain...",
      }));

      const res = await api_request.createWareZoneApi(User, zoneData);

      if (res && res.RC === 200) {
        setProcessStatus({
          show: true,
          state: "success",
          msg: res.RM || "Khởi tạo thành công!",
        });

        // Đợi 1.5s để hiện hiệu ứng thành công rồi mới đóng
        setTimeout(() => {
          setProcessStatus({ show: false, state: "loading", msg: "" });
          handleClose();
          if (getWareHouse) getWareHouse(); // Refresh dữ liệu kho ở trang chủ
        }, 1500);
      } else {
        setProcessStatus({
          show: true,
          state: "error",
          msg: res.RM || "Lỗi khởi tạo trên Server.",
        });
      }
    } catch (error) {
      console.error(error);
      setProcessStatus({
        show: true,
        state: "error",
        msg: "Lỗi kết nối máy chủ Meta Node!",
      });
    }
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={handleClose}
      size="xl"
      className="zone-creation-modal"
    >
      {/* Modal xử lý trạng thái API tự động */}
      <Processing_Modal
        show={processStatus.show}
        status={processStatus.state}
        message={processStatus.msg}
        onApi={createNewZones} // Tự động vít ga khi show=true
        onRetry={createNewZones}
        onClose={() => setProcessStatus((prev) => ({ ...prev, show: false }))}
      />

      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center fw-bold text-navy">
          <FontAwesomeIcon icon={faMicrochip} className="me-2 text-info" />
          THIẾT LẬP KHU VỰC LƯU TRỮ (ZONE)
        </Modal.Title>
        <Button variant="close" onClick={handleClose} className="shadow-none" />
      </Modal.Header>

      <Modal.Body className="p-4">
        <Row>
          <Col lg={7} className="pe-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6
                className="fw-bold text-navy mb-0 text-uppercase"
                style={{ fontSize: "0.8rem", letterSpacing: "1px" }}
              >
                1. Vai trò & Phương thức
              </h6>
              <Badge
                bg="gray-200"
                className="text-dark py-2 px-3 border border-gray-300"
              >
                <FontAwesomeIcon icon={faListOl} className="me-1" />
                Thứ tự hiển thị:{" "}
                {typeof index === "object" ? index.index || 1 : index}
              </Badge>
            </div>

            <div className="method-selector mb-4">
              {methods.map((m) => (
                <div
                  key={m.id}
                  className={`method-item ${m.id} ${zoneData.storage_method === m.id ? "active" : ""}`}
                  onClick={() =>
                    setZoneData({ ...zoneData, storage_method: m.id })
                  }
                >
                  <div className="icon-box" style={{ color: m.color }}>
                    <FontAwesomeIcon icon={m.icon} />
                  </div>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>

            <h6
              className="fw-bold text-navy mb-3 text-uppercase"
              style={{ fontSize: "0.8rem", letterSpacing: "1px" }}
            >
              2. Thông tin định danh
            </h6>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-gray-600">
                Tên Khu Vực
              </Form.Label>
              <Form.Control
                className="py-2 shadow-none border-gray-300"
                placeholder="VD: Zone A - Logistics tầng 1"
                value={zoneData.zone_name}
                onChange={(e) =>
                  setZoneData({ ...zoneData, zone_name: e.target.value })
                }
              />
            </Form.Group>

            <div className="bg-light p-3 rounded-3 border">
              <Form.Check
                type="switch"
                label="Khu vực yêu cầu theo dõi hạn dùng (Expirable)"
                id="expirable-switch"
                className="fw-bold small mb-0"
                checked={zoneData.is_expirable}
                onChange={(e) =>
                  setZoneData({ ...zoneData, is_expirable: e.target.checked })
                }
              />
              <small
                className="text-muted d-block mt-2"
                style={{ fontSize: "0.7rem" }}
              >
                * Kích hoạt để áp dụng logic Blockchain FEFO cho hàng hóa tại
                khu vực này.
              </small>
            </div>
          </Col>

          <Col lg={5}>
            <div className="preview-panel h-100 d-flex flex-column border-start ps-lg-4">
              <h6 className="fw-bold text-center mb-3 text-gray-400 uppercase small">
                Blueprint Preview
              </h6>
              <div className="preview-box active-preview shadow-sm flex-grow-1 d-flex align-items-center justify-content-center bg-white rounded-3 border-dashed">
                <div className="text-center p-4">
                  <div className="pulse-container mb-3">
                    <FontAwesomeIcon
                      icon={
                        methods.find((m) => m.id === zoneData.storage_method)
                          .icon
                      }
                      size="3x"
                      style={{
                        color: methods.find(
                          (m) => m.id === zoneData.storage_method,
                        ).color,
                      }}
                    />
                  </div>
                  <div className="mt-2 fw-extrabold text-navy h5 text-uppercase">
                    {zoneData.zone_name || "Zone_Name_Empty"}
                  </div>
                  <p
                    className="text-muted small mt-2 mx-auto"
                    style={{ maxWidth: "220px" }}
                  >
                    {methods.find((m) => m.id === zoneData.storage_method).desc}
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light border-0 px-4 py-3">
        <Button
          variant="link"
          className="text-gray-500 text-decoration-none fw-bold"
          onClick={handleClose}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={() => {
            // Kiểm tra Validation
            if (!zoneData.zone_name.trim()) {
              return toast.error("Vui lòng nhập Tên Khu Vực!");
            }

            // Bật Modal xử lý, onApi sẽ tự động được gọi
            setProcessStatus({
              show: true,
              state: "loading",
              msg: "Hệ thống đang đồng bộ dữ liệu...",
            });
          }}
          variant="primary"
          className="px-5 py-2 shadow-sm fw-extrabold text-uppercase"
          style={{ borderRadius: "10px", fontSize: "0.8rem" }}
        >
          Khởi tạo Zone <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateZoneModal;
