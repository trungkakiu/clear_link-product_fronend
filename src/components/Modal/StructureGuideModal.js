import React from "react";
import { Modal, Button, Row, Col, Badge } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faProjectDiagram,
  faSnowflake,
  faBoxes,
  faTh,
  faArrowRight,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import TutorialImage from "../../assets/img/logo/Storage_totural.png";
import "../../scss/volt/components/StructureGuideModal.scss";

const StructureGuideModal = ({ show, handleClose }) => {
  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={handleClose}
      size="xl"
      className="guide-modal-content"
    >
      <Modal.Header className="border-0">
        <Modal.Title className="text-white d-flex align-items-center">
          <div
            className="bg-primary p-2 rounded-2 me-3 d-flex align-items-center justify-content-center"
            style={{ width: "35px", height: "35px" }}
          >
            <FontAwesomeIcon icon={faMicrochip} size="sm" />
          </div>
          <div>
            <div className="fw-bold h5 mb-0">HỆ THỐNG PHÂN CẤP LƯU TRỮ</div>
            <div
              className="text-info opacity-75"
              style={{ fontSize: "0.6rem", letterSpacing: "1px" }}
            >
              TRACECHAIN DYNAMIC ARCHITECTURE
            </div>
          </div>
        </Modal.Title>
        <Button
          variant="close"
          onClick={handleClose}
          className="btn-close-white shadow-none"
        />
      </Modal.Header>

      <Modal.Body>
        <Row className="g-0">
          <Col lg={12} className="p-4 bg-light">
            <div className="dashboard-preview mb-4">
              <div className="d-flex justify-content-between mb-2">
                <Badge bg="primary">ENGINE_VIEW: ACTIVE</Badge>
                <div
                  className="text-white-50 small font-monospace"
                  style={{ fontSize: "0.6rem" }}
                >
                  SECURE_LEDGER_ENABLED
                </div>
              </div>
              <img src={TutorialImage} alt="Warehouse Blueprint" />
            </div>

            <div className="feature-list">
              <div className="infographic-card cold">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faSnowflake} className="text-info" />
                  <h6>Khu vực Kho lạnh (Cold Storage)</h6>
                </div>
                <p className="text-muted">
                  Quản lý môi trường đặc biệt. Hệ thống tự động theo dõi điều
                  kiện bảo quản và cảnh báo biến động nhiệt độ trên Blockchain.
                </p>
              </div>

              <div className="infographic-card bulk">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faBoxes} className="text-purple" />
                  <h6>Khu phức hợp (Bulk/Complex)</h6>
                </div>
                <p className="text-muted">
                  Dành cho hàng hóa đổ đống hoặc hàng tập trung số lượng lớn.
                  Tối ưu diện tích mặt sàn, không yêu cầu cấu trúc kệ tầng.
                </p>
              </div>

              <div className="infographic-card rack">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faTh} className="text-success" />
                  <h6>Hệ thống Kệ tầng (Racking)</h6>
                </div>
                <p className="text-muted">
                  Cấu trúc Slot & Rack tiêu chuẩn. Cho phép định danh chính xác
                  vị trí theo tọa độ 3D (X, Y, Level) cho từng sản phẩm.
                </p>
              </div>

              <div className="infographic-card border-left-primary">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faProjectDiagram}
                    className="text-primary"
                  />
                  <h6>Logic TraceChain</h6>
                </div>
                <p className="text-muted">
                  Mọi sự dịch chuyển giữa các khu vực (Area - Slot) đều tạo ra
                  một Transaction Hash không thể sửa đổi.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 px-4 py-3 bg-white">
        <div className="me-auto text-muted small d-none d-lg-block">
          <i className="fa fa-info-circle me-1"></i> Cấu trúc này được tối ưu
          cho chuẩn logistics quốc tế.
        </div>
        <Button
          variant="outline-gray-400"
          className="fw-bold btn-sm"
          onClick={handleClose}
        >
          Đóng
        </Button>
        <Button
          variant="primary"
          className="ms-2 px-4 btn-sm fw-bold"
          onClick={handleClose}
        >
          BẮT ĐẦU CẤU HÌNH{" "}
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StructureGuideModal;
