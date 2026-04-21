import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  Badge,
  Alert,
  Card,
} from "@themesberg/react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faCamera,
  faVideo,
  faTruckLoading,
  faMicrochip,
  faMapMarkerAlt,
  faTimes,
  faFolderOpen,
  faTrashAlt,
  faPlayCircle,
  faSignature,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../../apicontroller/api_request";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import { useContext } from "react";
import { UserContext } from "../../../Context/UserContext";

const ShipperInspectionModal = ({ show, onHide, mode, data, closeReload }) => {
  const [formData, setFormData] = useState({
    inspection_type:
      mode === "success" ? "confirm_delivery" : "delivery_failed",
    actual_quantities: {},
    condition_summary: "",
    images: [],
    video: null,
  });

  const { User } = useContext(UserContext);
  const [modalState, setModalState] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const isFailedMode = mode === "failed";

  useEffect(() => {
    if (data?.batches) {
      const initialQtys = {};
      data.batches.forEach((batch) => {
        initialQtys[batch.id] = batch.quantity;
      });
      setFormData((prev) => ({ ...prev, actual_quantities: initialQtys }));
    }
  }, [data, show]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10),
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, video: file }));
  };

  const validate = () => {
    if (isFailedMode) {
    
      return (
        formData.images.length < 2 ||
        !formData.video ||
        formData.condition_summary.length < 5
      );
    }
    return formData.images.length < 1;
  };

  const handleSubmit = async (challenge_code) => {
    try {
      const uploadData = new FormData();
      uploadData.append("inspection_type", formData.inspection_type);
      uploadData.append("condition_summary", formData.condition_summary);
      uploadData.append(
        "actual_quantities",
        JSON.stringify(formData.actual_quantities),
      );

      formData.images.forEach((file) => uploadData.append("images", file));
      if (formData.video) uploadData.append("video", formData.video);

      const res = await api_request.AcceptAndSignOrder(
        User,
        data.id,
        challenge_code,
        uploadData,
      );
      return res
        ? { RM: res.RM, RC: res.RC }
        : { RM: "Lỗi phản hồi hệ thống", RC: "500" };
    } catch (error) {
      return { RM: error.message || "Giao dịch thất bại", RC: "500" };
    }
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={onHide}
      size="lg"
      className="shipper-modal"
    >
      <Otp_verify_dynamic
        close={() => setModalState(false)}
        closeReload={() => {
          setModalState(false);
          closeReload();
        }}
        show={modalState}
        message={
          isFailedMode
            ? "Xác nhận sự cố giao hàng!"
            : "Xác nhận hoàn tất đơn hàng!"
        }
        onSuccess={handleSubmit}
        title={"KÝ SỐ VẬN ĐƠN"}
      />

      <Modal.Header
        className={`py-3 border-0 ${isFailedMode ? "bg-danger" : "bg-success"} text-white`}
      >
        <div className="d-flex align-items-center">
          <FontAwesomeIcon
            icon={isFailedMode ? faExclamationTriangle : faCheckCircle}
            className="me-3 fs-3"
          />
          <div>
            <Modal.Title className="h5 mb-0 text-uppercase fw-bold">
              {isFailedMode ? "Báo cáo giao hàng lỗi" : "Xác nhận giao hàng"}
            </Modal.Title>
            <small className="opacity-75 font-mono">ORDER_ID: {data?.id}</small>
          </div>
        </div>
        <Button variant="close" onClick={onHide} className="btn-close-white" />
      </Modal.Header>

      <Modal.Body className="bg-light p-0">
        <Row className="g-0">
          
          <Col lg={12} className="p-3">
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted fw-bold text-uppercase">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />{" "}
                    Điểm giao hàng
                  </span>
                  <Badge bg="dark">
                    {data?.customer_data?.company_name || "Khách lẻ"}
                  </Badge>
                </div>
                <div className="fw-bold text-dark mb-1">
                  {data?.shipping_address}
                </div>
                <div className="small text-muted">
                  Số kiện hàng:{" "}
                  <span className="text-primary fw-bold">
                    {data?.batches?.length} Batches
                  </span>
                </div>
              </Card.Body>
            </Card>

            {isFailedMode && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-danger uppercase">
                  Lý do giao thất bại *
                </Form.Label>
                <Form.Select
                  className="border-2 shadow-none"
                  value={formData.inspection_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inspection_type: e.target.value,
                    })
                  }
                >
                  <option value="delivery_failed">
                    Khách không nghe máy / Vắng nhà
                  </option>
                  <option value="customer_rejected">
                    Khách từ chối nhận hàng (Sai mẫu/Lỗi)
                  </option>
                  <option value="return_shipment">
                    Hàng hư hỏng trong quá trình vận chuyển
                  </option>
                </Form.Select>
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="mt-2 border-2"
                  placeholder="Mô tả ngắn gọn tình trạng thực tế..."
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition_summary: e.target.value,
                    })
                  }
                />
              </Form.Group>
            )}

            {/* PHẦN CHỤP ẢNH / VIDEO - TRỌNG TÂM */}
            <div className="media-capture-zone bg-white p-3 rounded shadow-sm">
              <h6 className="small fw-bold text-uppercase mb-3 border-bottom pb-2">
                Bằng chứng hiện trường *
              </h6>

              <Row className="g-2">
                <Col xs={6}>
                  <div
                    className="capture-btn image-btn text-center p-3 border rounded cursor-pointer"
                    onClick={() => imageInputRef.current.click()}
                  >
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="fs-2 text-primary mb-1"
                    />
                    <div className="x-small fw-bold">
                      CHỤP ẢNH ({formData.images.length})
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div
                    className={`capture-btn video-btn text-center p-3 border rounded cursor-pointer ${formData.video ? "bg-soft-success" : ""}`}
                    onClick={() => videoInputRef.current.click()}
                  >
                    <FontAwesomeIcon
                      icon={faVideo}
                      className={`fs-2 ${formData.video ? "text-success" : "text-danger"} mb-1`}
                    />
                    <div className="x-small fw-bold">
                      {formData.video ? "ĐÃ CÓ VIDEO" : "QUAY VIDEO"}
                    </div>
                  </div>
                </Col>
              </Row>

              <input
                type="file"
                ref={imageInputRef}
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <input
                type="file"
                ref={videoInputRef}
                hidden
                accept="video/*"
                onChange={handleVideoChange}
              />

              {/* Preview ảnh nhanh cho Shipper */}
              {formData.images.length > 0 && (
                <div className="d-flex mt-3 overflow-auto pb-2">
                  {formData.images.map((file, idx) => (
                    <div
                      key={idx}
                      className="position-relative me-2"
                      style={{ flexShrink: 0 }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        className="rounded border"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        className="btn-remove-mini"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white border-0 py-3 shadow-lg">
        <Button
          variant="link"
          className="text-muted small me-auto"
          onClick={onHide}
        >
          Hủy bỏ
        </Button>
        <Button
          variant={isFailedMode ? "danger" : "success"}
          className="px-4 py-2 fw-bold shadow-lg"
          disabled={validate()}
          onClick={() => setModalState(true)}
        >
          <FontAwesomeIcon icon={faSignature} className="me-2" />
          KÝ XÁC NHẬN
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShipperInspectionModal;
