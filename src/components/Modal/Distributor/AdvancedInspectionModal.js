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
  faCheckDouble,
  faExclamationTriangle,
  faCamera,
  faVideo,
  faShieldAlt,
  faMicrochip,
  faTruck,
  faTimes,
  faFolderOpen,
  faTrashAlt,
  faPlayCircle,
  faFileSignature,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../../apicontroller/api_request";
import "../../../scss/volt/components/Distributor/AdvancedInspectionModal.scss";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import { useContext } from "react";
import { UserContext } from "../../../Context/UserContext";

const AdvancedInspectionModal = ({ show, onHide, type, data, closeReload }) => {
  const [formData, setFormData] = useState({
    inspection_type: type === "confirm" ? "confirm_delivery" : "quality_check",
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
  const isRejectMode = type === "reject";

  useEffect(() => {
    if (!show) setShowImageManager(false);
  }, [show]);

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

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    if (isRejectMode) {
      return (
        formData.images.length < 4 ||
        !formData.video ||
        formData.condition_summary.length < 10
      );
    } else {
      return formData.images.length < 1;
    }
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

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          uploadData.append("images", file);
        });
      }

      if (formData.video) {
        uploadData.append("video", formData.video);
      }

      const res = await api_request.AcceptAndSignOrder(
        User,
        data.id,
        challenge_code,
        uploadData,
      );

      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
      return { RM: "Unknown error", RC: "500" };
    } catch (error) {
      console.error("Submission error:", error);
      return {
        RM: error.message || "Submission failed",
        RC: error.code || "500",
      };
    }
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={onHide}
      size="xl"
      className="inspection-modal"
    >
      <Otp_verify_dynamic
        close={() => setModalState(false)}
        closeReload={() => {
          setModalState(false);
          closeReload();
        }}
        show={modalState}
        message={"Xác nhận báo cáo đơn hàng!"}
        onSuccess={(challenge_code) => {
          return handleSubmit(challenge_code);
        }}
        title={"PIN VERIFY"}
      />
      <Modal.Header className="bg-dark text-white border-0 py-3 shadow-sm">
        <div className="d-flex align-items-center">
          <motion.div
            animate={isRejectMode ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FontAwesomeIcon
              icon={isRejectMode ? faExclamationTriangle : faCheckDouble}
              className={`me-3 fs-4 ${isRejectMode ? "text-danger" : "text-success"}`}
            />
          </motion.div>
          <div>
            <Modal.Title className="h6 mb-0 text-uppercase tracking-wider">
              {isRejectMode
                ? "Dispute Resolution Center"
                : "Standard Delivery Confirmation"}
            </Modal.Title>
            <small className="text-muted font-mono uppercase">
              ID: {data?.id || "N/A"}
            </small>
          </div>
        </div>
        <Button variant="close" variant="white" onClick={onHide} />
      </Modal.Header>

      <Modal.Body className="p-0 bg-white">
        <Row className="g-0">
          {/* SIDEBAR - Giao diện Kỹ sư AWS */}
          <Col lg={4} className="bg-light border-end p-4">
            <h6 className="text-uppercase small fw-bold text-muted mb-4 border-bottom pb-2">
              Shipment Details
            </h6>
            <div className="mb-3">
              <small className="text-uppercase fw-bold text-muted x-small d-block">
                Logistic Partner
              </small>
              <div className="d-flex align-items-center mt-1">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="text-primary me-2"
                  size="sm"
                />
                <span className="small fw-bold text-dark">
                  {data?.shipper_data?.company_name}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <small className="text-uppercase fw-bold text-muted x-small d-block">
                Verified Personnel
              </small>
              <div className="d-flex align-items-center mt-1">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-success me-2"
                  size="sm"
                />
                <span className="small text-dark fw-bold">
                  {data?.shipping_vehicle?.[0]?.Driver?.name}
                </span>
              </div>
              <Badge bg="gray-800" className="mt-2 font-mono">
                {data?.shipping_vehicle?.[0]?.plate_number}
              </Badge>
            </div>

            <Card className="border-0 shadow-sm bg-white p-3 mb-3 border-left-primary">
              <div className="d-flex justify-content-between x-small text-uppercase mb-1">
                <span className="text-muted">Value Assessment:</span>
                <span className="fw-bold text-primary">
                  {Number(data?.product_total_price).toLocaleString()}đ
                </span>
              </div>
              <div className="d-flex justify-content-between x-small text-uppercase">
                <span className="text-muted">Batch Inventory:</span>
                <span className="fw-bold">{data?.batches?.length} Units</span>
              </div>
            </Card>
          </Col>

          {/* MAIN ACTION AREA */}
          <Col
            lg={8}
            className="p-4"
            style={{ maxHeight: "75vh", overflowY: "auto" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* HIỂN THỊ ALERT THEO CHẾ ĐỘ */}
                <Alert
                  variant={isRejectMode ? "danger" : "info"}
                  className="border-0 shadow-sm mb-4 py-2"
                >
                  <div className="d-flex align-items-center small">
                    <FontAwesomeIcon
                      icon={
                        isRejectMode ? faExclamationTriangle : faClipboardCheck
                      }
                      className="me-3 fs-5"
                    />
                    <div>
                      {isRejectMode ? (
                        <strong>DISPUTE MODE:</strong>
                      ) : (
                        <strong>CONFIRMATION MODE:</strong>
                      )}{" "}
                      {isRejectMode
                        ? "Yêu cầu đầy đủ 04 ảnh & 01 video bằng chứng."
                        : "Vui lòng tải ít nhất 01 ảnh xác nhận tình trạng hàng hóa lúc bàn giao."}
                    </div>
                  </div>
                </Alert>

                {isRejectMode ? (
                  /* --- REJECT MODE UI --- */
                  <section className="reject-ui">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-uppercase">
                        Cơ sở khiếu nại *
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
                        <option value="quality_check">
                          Hàng lỗi chất lượng sản phẩm
                        </option>
                        <option value="return_shipment">
                          Trả hàng (Cần bên A xác nhận)
                        </option>
                        <option value="repair_product">
                          Cần sửa chữa tại chỗ
                        </option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-uppercase">
                        Biên bản tình trạng *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        className="border-2 shadow-none"
                        placeholder="Nhập tóm tắt sự cố..."
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition_summary: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </section>
                ) : (
                  /* --- CONFIRM MODE UI --- */
                  <section className="confirm-ui">
                    <h6 className="small fw-bold text-uppercase text-primary mb-3">
                      Verification Checklist
                    </h6>
                    <div className="table-responsive border rounded bg-white shadow-sm mb-4">
                      <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                          <tr className="small fw-bold text-muted uppercase">
                            <th className="border-0">Batch</th>
                            <th className="border-0 text-center">Giao</th>
                            <th
                              className="border-0 text-center"
                              style={{ width: "120px" }}
                            >
                              Thực nhận
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.batches?.map((batch) => (
                            <tr key={batch.id}>
                              <td className="small font-mono fw-bold">
                                {batch.id}
                              </td>
                              <td className="text-center font-mono">
                                {batch.quantity}
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  className="text-center fw-bold border-2 border-primary"
                                  defaultValue={batch.quantity}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </section>
                )}

                {/* MEDIA SECTION - Dùng chung cho cả 2 nhưng logic gắt khác nhau */}
                <div className="media-section border-top pt-3">
                  <Form.Label className="small fw-bold text-uppercase d-block mb-2">
                    {isRejectMode
                      ? "Evidence Photos (Min: 4) *"
                      : "Receipt Photos (Min: 1) *"}
                  </Form.Label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {formData.images.length === 0 ? (
                    <div
                      className="upload-zone text-center p-4 border-dashed border-2 rounded bg-light cursor-pointer"
                      onClick={() => imageInputRef.current.click()}
                    >
                      <FontAwesomeIcon
                        icon={faCamera}
                        className="fs-3 text-primary mb-2"
                      />
                      <div className="small fw-bold uppercase">
                        Nhấn để chụp/tải ảnh xác nhận
                      </div>
                    </div>
                  ) : (
                    <div
                      className="folder-preview p-3 rounded d-flex align-items-center justify-content-between shadow-sm bg-white border"
                      onClick={() => setShowImageManager(!showImageManager)}
                    >
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faFolderOpen}
                          className="text-warning fs-3 me-3"
                        />
                        <div>
                          <div className="small fw-bold text-dark uppercase">
                            Images Repository
                          </div>
                          <small className="text-muted">
                            {formData.images.length} ảnh đã sẵn sàng
                          </small>
                        </div>
                      </div>
                      <div className="file-count-badge">
                        {formData.images.length}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          imageInputRef.current.click();
                        }}
                      >
                        + Thêm
                      </Button>
                    </div>
                  )}

                  <AnimatePresence>
                    {showImageManager && formData.images.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="image-manage-list mt-2 bg-light p-2 rounded"
                      >
                        {formData.images.map((file, idx) => (
                          <div
                            key={idx}
                            className="position-relative me-2"
                            style={{ width: "80px", flexShrink: 0 }}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt="p"
                              className="rounded border w-100 h-100 object-fit-cover"
                              style={{ height: "80px" }}
                            />
                            <button
                              className="btn btn-danger btn-xs position-absolute top-0 end-0 p-1 rounded-circle shadow-sm"
                              onClick={() => removeImage(idx)}
                              style={{ transform: "translate(40%, -40%)" }}
                            >
                              <FontAwesomeIcon icon={faTimes} size="xs" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CHỈ HIỆN VIDEO KHI Ở CHẾ ĐỘ REJECT */}
                  {isRejectMode && (
                    <div className="mt-4">
                      <Form.Label className="small fw-bold text-uppercase d-block mb-2">
                        Unboxing Video (Required) *
                      </Form.Label>
                      <input
                        type="file"
                        ref={videoInputRef}
                        hidden
                        accept="video/*"
                        onChange={handleVideoChange}
                      />

                      {!formData.video ? (
                        <div
                          className="upload-zone text-center p-4 border-dashed border-2 rounded bg-light cursor-pointer"
                          onClick={() => videoInputRef.current.click()}
                        >
                          <FontAwesomeIcon
                            icon={faVideo}
                            className="fs-3 text-danger mb-2"
                          />
                          <div className="small fw-bold uppercase">
                            Tải lên video thực tế tại kho
                          </div>
                        </div>
                      ) : (
                        <div className="video-container shadow-lg">
                          <div className="video-overlay py-2 px-3">
                            <span className="small fw-bold">
                              <FontAwesomeIcon
                                icon={faPlayCircle}
                                className="me-2 text-danger"
                              />{" "}
                              EVIDENCE_VIDEO.MP4
                            </span>
                            <Button
                              variant="link"
                              className="text-white p-0"
                              onClick={() =>
                                setFormData({ ...formData, video: null })
                              }
                            >
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </Button>
                          </div>
                          <video
                            src={URL.createObjectURL(formData.video)}
                            controls
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-dark border-0 py-3 px-4">
        <Button
          variant="link"
          className="text-white-50 small me-auto decoration-none"
          onClick={onHide}
        >
          Abandone Transaction
        </Button>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => setModalState(true)}
            variant={isRejectMode ? "danger" : "success"}
            className="px-5 py-2 fw-bold text-uppercase shadow-lg border-0"
            disabled={validate()}
          >
            <FontAwesomeIcon icon={faMicrochip} className="me-2" />
            {isRejectMode ? "Sign & Reject" : "Sign & Accept"}
          </Button>
        </motion.div>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvancedInspectionModal;
