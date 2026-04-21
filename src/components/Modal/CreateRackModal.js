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
  faServer,
  faLayerGroup,
  faTh,
  faHashtag,
  faArrowRight,
  faTools,
} from "@fortawesome/free-solid-svg-icons";
import Processing_Modal from "./Processing_Modal";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/CreateRackModal.scss";
import { UserContext } from "../../Context/UserContext";

const CreateRackModal = ({ show, handleClose, zone, getWareHouse }) => {
  const { User } = useContext(UserContext);
  const [rackData, setRackData] = useState({
    zone_id: zone?.id,
    rack_code: "",
    rack_type: "SELECTIVE",
    num_levels: 3,
    num_slots_per_level: 5,
    max_weight: 0,
  });

  const [processStatus, setProcessStatus] = useState({
    show: false,
    state: "loading",
    msg: "",
  });

  useEffect(() => {
    if (show && zone) {
      setRackData((prev) => ({ ...prev, zone_id: zone.id }));
    }
  }, [show, zone]);

  const handleCreateRack = async () => {
    try {
      setProcessStatus({
        show: true,
        state: "loading",
        msg: "Đang khởi tạo cấu trúc Rack...",
      });
      const res = await api_request.createRackApi(User, rackData);
      if (res.RC === 200) {
        setProcessStatus({
          show: true,
          state: "success",
          msg: "Dãy kệ đã được ghi nhận!",
        });
        setTimeout(() => {
          setProcessStatus({ show: false, state: "loading", msg: "" });
          handleClose();
          if (getWareHouse) getWareHouse();
        }, 1500);
      } else {
        setProcessStatus({ show: true, state: "error", msg: res.RM });
      }
    } catch (error) {
      setProcessStatus({ show: true, state: "error", msg: "Lỗi hệ thống!" });
    }
  };

  const renderPreviewGrid = () => {
    let levels = [];
    for (let i = 1; i <= rackData.num_levels; i++) {
      let slots = [];
      for (let j = 1; j <= rackData.num_slots_per_level; j++) {
        slots.push(
          <div key={`slot-${i}-${j}`} className="slot-unit shadow-sm">
            <small>{j}</small>
          </div>,
        );
      }
      levels.push(
        <div key={`level-${i}`} className="level-row" data-level={`L${i}`}>
          <div className="slots-container">{slots}</div>
        </div>,
      );
    }
    return levels.reverse();
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={handleClose}
      size="xl"
      className="rack-creation-modal"
    >
      <Processing_Modal
        show={processStatus.show}
        status={processStatus.state}
        message={processStatus.msg}
        onApi={handleCreateRack}
        onClose={() => setProcessStatus((p) => ({ ...p, show: false }))}
      />

      <Modal.Header className="border-0">
        <Modal.Title className="d-flex align-items-center">
          <FontAwesomeIcon icon={faTools} className="me-2 text-warning" />
          CẤU HÌNH DÃY KỆ (RACK SETUP)
        </Modal.Title>
        <Button
          variant="close"
          onClick={handleClose}
          className="btn-close-white shadow-none"
        />
      </Modal.Header>

      <Modal.Body className="p-4 p-lg-5">
        <Row>
          <Col lg={6} className="pe-lg-5">
            <h6 className="fw-bold text-navy mb-4 text-uppercase">
              Thông số kỹ thuật
            </h6>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Mã dãy kệ (Code)
              </Form.Label>
              <Form.Control
                className="input-field-custom"
                placeholder="VD: RACK-A1"
                onChange={(e) =>
                  setRackData({ ...rackData, rack_code: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Loại kệ (Rack Type)
              </Form.Label>
              <Form.Select
                className="input-field-custom"
                onChange={(e) =>
                  setRackData({ ...rackData, rack_type: e.target.value })
                }
              >
                <option value="SELECTIVE">Selective (Phổ biến)</option>
                <option value="DRIVE_IN">Drive-In (Tối ưu diện tích)</option>
                <option value="FLOW">Flow Rack (FIFO)</option>
                <option value="CANTILEVER">Cantilever (Hàng cồng kềnh)</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Số tầng (Levels)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={rackData.num_levels}
                    onChange={(e) =>
                      setRackData({
                        ...rackData,
                        num_levels: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Ô mỗi tầng (Slots)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="20"
                    value={rackData.num_slots_per_level}
                    onChange={(e) =>
                      setRackData({
                        ...rackData,
                        num_slots_per_level: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Trọng lượng (KG)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={rackData.max_weight}
                    onChange={(e) =>
                      setRackData({
                        ...rackData,
                        max_weight: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 p-3 bg-light rounded-3 border">
              <small className="text-muted d-block">
                * Tổng số{" "}
                <strong>
                  {rackData.num_levels * rackData.num_slots_per_level} slots
                </strong>{" "}
                sẽ được tự động tạo và gán mã định danh duy nhất trên
                TraceChain.
              </small>
            </div>
          </Col>

          <Col lg={6}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold text-navy mb-0">Mô phỏng 2D-Grid</h6>
              <Badge bg="primary">ZONE: {zone?.zone_name}</Badge>
            </div>
            <div className="rack-visualizer shadow-inner">
              {renderPreviewGrid()}
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light border-0 px-4 py-3">
        <Button
          variant="link"
          className="text-gray-500 text-decoration-none"
          onClick={handleClose}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          className="px-5 py-2 fw-bold shadow-sm"
          style={{ borderRadius: "10px" }}
          onClick={() =>
            setProcessStatus({ show: true, state: "loading", msg: "" })
          }
        >
          XÁC NHẬN TẠO DÃY KỆ{" "}
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateRackModal;
