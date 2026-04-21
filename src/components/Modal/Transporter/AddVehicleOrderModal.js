import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Accordion,
  Badge,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBus,
  faSitemap,
  faTruckLoading,
  faCheckCircle,
  faPlus,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../../Context/UserContext";
import api_request from "../../../apicontroller/api_request";
import RocketLoad from "../../../Utils/RocketLoad";
import { toast } from "react-toastify";
import "../../../scss/volt/components/Transporter/AddVehicleOrderModal.scss";

const AddVehicleOrderModal = ({
  show,
  close,
  type_delivery,

  onSelectVehicle,
}) => {
  const [fleetlist, setfleetlist] = useState([]);
  const [unfleetvehicle, setunfleetvehicle] = useState([]);
  const [isload, setisload] = useState(false);
  const { User } = useContext(UserContext);

  const fetchFleetValid = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchFleetValidApi(User, type_delivery);
      if (res?.RC === 200) {
        setfleetlist(res.RD.fleetlist);
        setunfleetvehicle(res.RD.unfleetvehicle);
      } else {
        toast.error(res?.RM || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setTimeout(() => setisload(false), 500);
    }
  };

  useEffect(() => {
    if (show) fetchFleetValid();
  }, [show]);

  const handleSelect = (vehicle) => {
    if (onSelectVehicle) {
      onSelectVehicle(vehicle);
      close();
    }
  };

  const renderVehicleItem = (v, fleetName = null) => (
    <ListGroup.Item
      key={v.id}
      className="border-0 border-bottom py-3 px-3 vehicle-item-hover"
    >
      <Row className="align-items-center">
        <Col xs="auto">
          <div className="icon-shape icon-xs icon-shape-primary rounded">
            <FontAwesomeIcon icon={faBus} />
          </div>
        </Col>
        <Col className="ms-n2">
          <h6 className="fs-6 fw-bold mb-1">{v.plate_number}</h6>
          <div className="d-flex align-items-center">
            <Badge bg="light" className="text-dark border me-2">
              {v.vehicle_category}
            </Badge>
            <small className="text-muted">
              Tải trọng: {v.capacity} {v.capacity_unit}
            </small>
          </div>
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleSelect(v)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Chọn
          </Button>
        </Col>
      </Row>
    </ListGroup.Item>
  );

  return (
    <Modal
      show={show}
      onHide={close}
      size="lg"
      centered
      backdrop="static"
      className="aws-modal"
    >
      <Modal.Header closeButton className="bg-aws-navy text-white">
        <Modal.Title className="h6">
          <FontAwesomeIcon
            icon={faTruckLoading}
            className="me-2 text-aws-orange"
          />
          Điều động phương tiện cho đơn hàng
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light" style={{ minHeight: "60vh" }}>
        {isload ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <RocketLoad />
          </div>
        ) : (
          <div className="p-3">
            {/* PHẦN 1: XE CHƯA CÓ ĐỘI (ƯU TIÊN HIỂN THỊ) */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-aws-orange">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Xe tự do (Chưa gán đội)
                </h6>
                <Badge bg="dark">{unfleetvehicle.length} xe</Badge>
              </Card.Header>
              <ListGroup
                variant="flush"
                style={{ maxHeight: "250px", overflowY: "auto" }}
              >
                {unfleetvehicle.length > 0 ? (
                  unfleetvehicle.map((v) => renderVehicleItem(v))
                ) : (
                  <div className="p-4 text-center text-muted small italic">
                    Không có xe tự do khả dụng
                  </div>
                )}
              </ListGroup>
            </Card>

            <h6 className="aws-label mb-3 px-1 text-uppercase small fw-800 text-muted">
              <FontAwesomeIcon icon={faSitemap} className="me-2" />
              Danh sách đội xe (Fleet List)
            </h6>
            <Accordion defaultActiveKey="0" className="fleet-accordion">
              {fleetlist.map((fleet, index) => (
                <Accordion.Item
                  eventKey={index.toString()}
                  key={fleet.id}
                  className="border-0 shadow-sm mb-2 rounded overflow-hidden"
                >
                  <Accordion.Header className="bg-white border-0">
                    <div className="d-flex align-items-center w-100 justify-content-between pe-3">
                      <div>
                        <span className="fw-800 text-aws-navy">
                          {fleet.fleet_name}
                        </span>
                        <small className="ms-2 text-muted">
                          ({fleet.fleet_code})
                        </small>
                      </div>
                      <Badge bg="info" className="rounded-pill">
                        {fleet.Vehicles?.length || 0} xe
                      </Badge>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="p-0 bg-white">
                    <ListGroup variant="flush">
                      {fleet.Vehicles?.map((v) =>
                        renderVehicleItem(v, fleet.fleet_name),
                      )}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-white border-top">
        <Button variant="link" className="text-muted" onClick={close}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddVehicleOrderModal;
