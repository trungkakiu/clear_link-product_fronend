import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, Row, Col, Card } from "@themesberg/react-bootstrap";
import "../../../scss/volt/components/Manufacture/ContractSendModal.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faFileAlt,
  faCloudUploadAlt,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../../apicontroller/api_request";
import RocketLoad from "../../../Utils/RocketLoad";
import { UserContext } from "../../../Context/UserContext";

const ContractSendModal = ({ show, handleClose, onSend }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, settemplates] = useState([]);
  const [isload, setisload] = useState(false);
  const { User } = useContext(UserContext);

  const handleConfirm = () => {
    if (!selectedTemplate) return;
    onSend(selectedTemplate);

    setSelectedTemplate(null);
    handleClose();
  };

  const handlefetchContract = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchContract(User);
      if (res && res.RC === 200) settemplates(res.RD);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setisload(false), 600);
    }
  };

  useEffect(() => {
    handlefetchContract();
  }, []);

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleDragStart = (e, template) => {
    e.dataTransfer.setData("templateId", template.id);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const templateId = e.dataTransfer.getData("templateId");
    const template = templates.find((t) => t.id === templateId);
    selectTemplate(template);
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={handleClose}
      size="xl"
      className="aws-modal"
    >
      <Modal.Header>
        <Modal.Title className="h6 text-white">
          Khởi tạo & Gửi hợp đồng đối tác
        </Modal.Title>
        <Button variant="close" aria-label="Close" onClick={handleClose} />
      </Modal.Header>

      {isload ? (
        <div className="loader-container">
          <RocketLoad />
        </div>
      ) : (
        <Modal.Body className="p-0">
          <Row className="m-0">
            {/* PHẦN 1: KHO HỢP ĐỒNG */}
            <Col lg={5} md={12} className="template-sidebar p-4 border-end">
              <h5 className="mb-3 section-title">Kho hợp đồng mẫu</h5>
              <p className="small text-muted mb-3 d-none d-lg-block">
                Kéo thả hoặc nhấn để chọn
              </p>

              <div
                className="template-list-container"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                {templates.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t)}
                    // BỔ SUNG: Nhấn vào là chọn luôn cho tiện
                    onClick={() => selectTemplate(t)}
                    className={`template-paper-card ${selectedTemplate?.id === t.id ? "active" : ""}`}
                  >
                    <div className="paper-body">
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        className="paper-icon"
                      />
                      <div className="paper-info">
                        <span className="name">{t.template_name}</span>
                        <small className="type">
                          {t.collaboration_type} - v{t.version}
                        </small>
                      </div>

                      {/* Thay nút "Kéo để xem" bằng chỉ dẫn động */}
                      <div className="select-action-label">
                        {selectedTemplate?.id === t.id ? (
                          <span className="text-success small fw-bold">
                            Đã chọn
                          </span>
                        ) : (
                          <span className="text-aws-blue small">Chọn</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* PHẦN 2: Ô XEM TRƯỚC / THẢ */}
            <Col
              lg={7}
              md={12}
              className="drop-zone-container p-4 d-flex flex-column"
            >
              <h5 className="mb-3 section-title">Bản nháp gửi đi</h5>
              <div
                className={`drop-zone ${selectedTemplate ? "has-file" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {!selectedTemplate ? (
                  <div className="drop-placeholder">
                    <FontAwesomeIcon
                      icon={faCloudUploadAlt}
                      size="3x"
                      className="mb-3 text-aws-blue"
                    />
                    <p className="px-3">
                      Kéo hợp đồng vào đây hoặc nhấn chọn từ danh sách bên trái
                    </p>
                  </div>
                ) : (
                  <div className="selected-preview animate-enter">
                    <div className="preview-header d-flex justify-content-between">
                      <div>
                        <FontAwesomeIcon
                          icon={faFileAlt}
                          className="me-2 text-aws-blue"
                        />
                        <strong>{selectedTemplate.template_name}</strong>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => setSelectedTemplate(null)}
                      >
                        Gỡ bỏ
                      </Button>
                    </div>
                    <div className="preview-content">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedTemplate.content_html,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 d-flex justify-content-end footer-actions">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={handleClose}
                >
                  Hủy
                </Button>
                <Button
                  variant="aws-orange"
                  disabled={!selectedTemplate}
                  onClick={() => handleConfirm()}
                  className="d-flex align-items-center"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" /> Chọn
                  hợp đồng
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      )}
    </Modal>
  );
};
export default ContractSendModal;
