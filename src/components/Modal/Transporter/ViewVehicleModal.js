import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Image,
  Card,
  Badge,
  InputGroup,
  Form,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faInfoCircle,
  faMapMarkerAlt,
  faWeightHanging,
  faTimes,
  faSearch,
  faPlus,
  faUserTie,
  faPhone,
  faEnvelope,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Transporter/Vehicledetail.scss";
import { toast } from "react-toastify";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";

const ViewVehicleModal = ({
  show,
  onHide,
  vehicle,
  drivers,
  onPinDriver,
  closeReload,
}) => {
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;

  const [tempVehicle, setTempVehicle] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const { User } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDriverSelect, setShowDriverSelect] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setTempVehicle({ ...vehicle });
    }
  }, [vehicle, show]);

  const handleZoom = (url) => setZoomImage(url);

  const filteredDrivers = drivers?.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectDriver = async (driver) => {
    try {
      const selectedDriver = drivers.find((d) => d.id === driver.id);
      const currentDriver = tempVehicle.Driver;
      setTempVehicle((prev) => ({
        ...prev,
        driver_id: driver.id,
        Driver: selectedDriver?.actor_info || selectedDriver,
      }));

      setShowDriverSelect(false);

      const res = await api_request.pinDriver(User, driver.id, vehicle.id);
      if (res) {
        if (res.RC !== 200) {
          toast.error(res.RM);
          setTempVehicle((prev) => ({
            ...prev,
            driver_id: driver.id,
            Driver: currentDriver,
          }));
        } else {
          closeReload();
        }
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleInputChange = (field, value) => {
    setTempVehicle((prev) => ({ ...prev, [field]: value }));
  };

  if (!tempVehicle) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="aws-page-container aws-view-modal"
      >
        <Modal.Header className="bg-aws-navy text-white py-3 border-0">
          <Modal.Title className="h6 mb-0 d-flex align-items-center">
            <FontAwesomeIcon icon={faTruck} className="me-2 text-aws-orange" />
            Hồ sơ phương tiện:{" "}
            <span className="text-aws-orange ms-2">
              {tempVehicle.plate_number}
            </span>
          </Modal.Title>
          <Button
            variant="link"
            className="text-white p-0 shadow-none"
            onClick={onHide}
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Modal.Header>

        <Modal.Body className="p-4 bg-aws-light">
          <Row className="gy-4 position-relative">
            {/* CỘT TRÁI: HÌNH ẢNH & TÀI XẾ */}
            <Col lg={5} className="aws-sticky-column">
              <div className="sticky-content-box">
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Hình ảnh định danh</h6>
                    <Badge
                      bg={
                        tempVehicle.status === "available"
                          ? "success"
                          : "warning"
                      }
                    >
                      {tempVehicle.status?.toUpperCase()}
                    </Badge>
                  </Card.Header>
                  <Card.Body className="p-2">
                    <div
                      onClick={() =>
                        handleZoom(
                          `${API_URL}main-card/${tempVehicle.vehicle_main_avatar}`,
                        )
                      }
                      className="upload-zone-main shadow-inner border-0 cursor-pointer"
                    >
                      <Image
                        src={
                          tempVehicle.vehicle_main_avatar
                            ? `${API_URL}main-card/${tempVehicle.vehicle_main_avatar}`
                            : "https://via.placeholder.com/500x300"
                        }
                        className="img-preview-full"
                      />
                    </div>
                  </Card.Body>
                </Card>

                {/* HIỂN THỊ TÀI XẾ ĐÃ CHỌN */}
                <Card className="border-0 shadow-sm overflow-hidden mb-4 border-start border-4 border-aws-orange">
                  <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold text-aws-navy">
                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="me-2 text-aws-orange"
                      />
                      Nhân sự vận hành
                    </h6>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="fw-bold px-3 shadow-none"
                      onClick={() => setShowDriverSelect(true)}
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-1" />
                      {tempVehicle.Driver ? "Thay đổi tài xế" : "Gán tài xế"}
                    </Button>
                  </Card.Header>
                  <Card.Body
                    className={
                      tempVehicle.Driver
                        ? "p-3"
                        : "p-4 text-center bg-soft-light"
                    }
                  >
                    {tempVehicle.Driver ? (
                      <div className="d-flex align-items-center">
                        <Image
                          src={`${API_URL}main-card/${tempVehicle.Driver.avatar}`}
                          roundedCircle
                          className="me-3 border border-2 border-aws-orange shadow-sm"
                          style={{ width: 65, height: 65, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-800 text-aws-navy fs-6 mb-0">
                            {tempVehicle.Driver.name}
                          </div>
                          <div className="small text-muted mb-1">
                            <FontAwesomeIcon
                              icon={faEnvelope}
                              className="me-1 opacity-50"
                            />{" "}
                            {tempVehicle.Driver.email}
                          </div>
                          <div className="small fw-bold text-info">
                            <FontAwesomeIcon icon={faPhone} className="me-1" />{" "}
                            {tempVehicle.Driver.phone_number ||
                              tempVehicle.Driver.phonenumber}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <FontAwesomeIcon
                          icon={faUserTie}
                          size="2x"
                          className="text-muted opacity-20 mb-2"
                        />
                        <div className="text-muted small italic">
                          Chưa chỉ định tài xế lái xe này
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h6 className="mb-0 fw-bold">
                      Chi tiết phương tiện (
                      {tempVehicle.sub_images?.length || 0})
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="gallery-grid">
                      {tempVehicle.sub_images?.map((img, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            handleZoom(`${API_URL}main-card/${img.image_name}`)
                          }
                          className="gallery-item-wrapper shadow-xs"
                        >
                          <Image
                            src={`${API_URL}main-card/${img.image_name}`}
                            className="gallery-img"
                          />
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>

            {/* CỘT PHẢI: FORM CẬP NHẬT */}
            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3 border-bottom">
                  <h6 className="mb-0 d-flex align-items-center text-main">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="me-2 text-aws-orange"
                    />
                    Thông số kỹ thuật & Pháp lý
                  </h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4">
                    <Col md={6}>
                      <label className="aws-label d-flex justify-content-between">
                        Biển số{" "}
                        <FontAwesomeIcon
                          icon={faLock}
                          className="text-muted small"
                        />
                      </label>
                      <Form.Control
                        readOnly
                        className="aws-input-premium bg-soft-light fw-bold"
                        value={tempVehicle.plate_number}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="aws-label d-flex justify-content-between">
                        Số khung (VIN){" "}
                        <FontAwesomeIcon
                          icon={faLock}
                          className="text-muted small"
                        />
                      </label>
                      <Form.Control
                        readOnly
                        className="aws-input-premium bg-soft-light text-muted"
                        value={tempVehicle.vin_number || "N/A"}
                      />
                    </Col>
                    <Col md={12}>
                      <label className="aws-label">Phân loại phương tiện</label>
                      <Form.Control
                        readOnly
                        className="aws-input-premium"
                        value={tempVehicle.vehicle_type}
                        onChange={(e) =>
                          handleInputChange("vehicle_type", e.target.value)
                        }
                      />
                    </Col>
                    <Col md={6}>
                      <label className="aws-label">
                        Trọng tải vận hành (
                        {tempVehicle.capacity_unit?.toUpperCase()})
                      </label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0 text-muted">
                          <FontAwesomeIcon icon={faWeightHanging} />
                        </InputGroup.Text>
                        <Form.Control
                          className="aws-input-premium border-start-0"
                          value={tempVehicle.capacity}
                          onChange={(e) =>
                            handleInputChange("capacity", e.target.value)
                          }
                        />
                      </InputGroup>
                    </Col>
                    <Col md={6}>
                      <label className="aws-label">Ngày đăng ký</label>
                      <Form.Control
                        readOnly
                        className="aws-input-premium bg-soft-light"
                        value={new Date(
                          tempVehicle.createdAt,
                        ).toLocaleDateString("vi-VN")}
                      />
                    </Col>
                    <Col md={12}>
                      <label className="aws-label">Vị trí bãi đỗ</label>
                      <Form.Control
                        className="aws-input-premium"
                        value={tempVehicle.current_location_name || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "current_location_name",
                            e.target.value,
                          )
                        }
                      />
                    </Col>
                    <Col md={12}>
                      <label className="aws-label">
                        Ghi chú / Mô tả hệ thống
                      </label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        className="aws-input-premium"
                        value={tempVehicle.notes || ""}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                      />
                    </Col>
                  </Row>

                  <div className="mt-5 d-flex justify-content-end gap-2 border-top pt-4">
                    <Button
                      variant="link"
                      className="text-muted fw-bold shadow-none"
                      onClick={onHide}
                    >
                      HỦY BỎ
                    </Button>
                    <Button
                      className="aws-btn-submit px-5 shadow-none"
                      onClick={() =>
                        onPinDriver(
                          tempVehicle.driver_id,
                          tempVehicle.id,
                          tempVehicle,
                        )
                      }
                    >
                      CẬP NHẬT HỒ SƠ
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* --- MODAL CHỌN TÀI XẾ --- */}
      <Modal
        show={showDriverSelect}
        onHide={() => setShowDriverSelect(false)}
        centered
        size="md"
        className="aws-view-modal shadow-lg"
        style={{ zIndex: 1060 }}
      >
        <Modal.Header closeButton className="bg-aws-navy text-white border-0">
          <Modal.Title className="h6">Chọn tài xế vận hành</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3 bg-light border-bottom">
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm tên, email..."
                className="border-start-0 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          <ListGroup
            variant="flush"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {filteredDrivers?.length > 0 ? (
              filteredDrivers.map((driver) => (
                <ListGroup.Item
                  key={driver.id}
                  action
                  className="d-flex align-items-center py-3 px-4"
                  onClick={() => handleSelectDriver(driver)}
                >
                  <Image
                    src={`${API_URL}main-card/${driver.avatar || driver.actor_info?.avatar}`}
                    roundedCircle
                    className="me-3"
                    style={{ width: 45, height: 45, objectFit: "cover" }}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold text-aws-navy mb-0">
                      {driver.name || driver.actor_info?.name}
                    </div>
                    <div className="extra-small text-muted">
                      {driver.email || driver.actor_info?.email}
                    </div>
                  </div>
                  <Badge bg="soft-orange" className="text-aws-orange">
                    <FontAwesomeIcon icon={faPlus} />
                  </Badge>
                </ListGroup.Item>
              ))
            ) : (
              <div className="p-5 text-center text-muted small italic">
                Không có tài xế khả dụng
              </div>
            )}
          </ListGroup>
        </Modal.Body>
      </Modal>

      <Modal
        show={!!zoomImage}
        onHide={() => setZoomImage(null)}
        centered
        size="lg"
        className="aws-lightbox"
      >
        <Modal.Body className="p-0 position-relative bg-transparent border-0">
          <Button
            variant="link"
            className="position-absolute text-white p-0"
            style={{ top: "-40px", right: "0", fontSize: "24px" }}
            onClick={() => setZoomImage(null)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </Button>
          <Image
            src={zoomImage}
            className="w-100 rounded shadow-lg"
            style={{ maxHeight: "85vh", objectFit: "contain" }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ViewVehicleModal;
