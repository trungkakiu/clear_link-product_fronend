import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Form,
  Badge,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faBoxOpen,
  faClipboardCheck,
  faLayerGroup,
  faHistory,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/QCModal.scss";
import { toast } from "react-toastify";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";
import Otp_verify_dynamic from "../Otp_verify_dynamic";

const QCReportModal = ({ show, onHide, batchData, closeReload }) => {
  const [qcForm, setQcForm] = useState({
    qc_pass: 0,
    qc_failed: 0,
    create_supplement: false,
    note: "",
    batch_id: batchData?.id,
    status: "",
  });

  const isLocked = batchData?.status === "QC_passed";
  const { User } = useContext(UserContext);
  const [modalstate, setmodatastate] = useState(false);

  const onSubmit = async (challen_code) => {
    try {
      if (!batchData) {
        toast.error("Lỗi hệ thống, thiếu dữ liệu!");
        return { RM: "Thiếu dữ liệu!", RC: 500 };
      }
      const finalData = {
        ...qcForm,
        batch_id: batchData.id,
      };

      setQcForm(finalData);

      const res = await api_request.submitQCbatch(
        User,
        challen_code,
        finalData,
      );

      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khởi tạo!");
      return { RM: "Lỗi hệ thống!", RC: 500 };
    }
  };

  useEffect(() => {
    if (batchData) {
      setQcForm({
        ...qcForm,
        qc_pass: batchData.quantity,
        qc_failed: 0,
        status: "QC_passed",
      });
    }
  }, [batchData]);

  const handlePassChange = (val) => {
    const pass = Math.min(val, batchData.quantity);
    setQcForm({
      ...qcForm,
      qc_pass: pass,
      qc_failed: batchData.quantity - pass,
      create_supplement: batchData.quantity - pass > 0,
      status: batchData.quantity - pass === 0 ? "QC_passed" : "QC_failed",
    });
  };
  const handleQuickFail = () => {
    setQcForm({
      ...qcForm,
      qc_pass: 0,
      qc_failed: batchData.quantity,
      create_supplement: true,
      status: "QC_failed",
    });
    setmodatastate(true);
  };
  if (!batchData) return null;
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="aws-qc-modal"
    >
      <Otp_verify_dynamic
        close={() => setmodatastate(false)}
        closeReload={() => {
          setmodatastate(false);
          closeReload();
        }}
        message={"Xác nhận hoàn thành kiểm tra chất lượng lô hàng!"}
        onSuccess={(challen_code) => {
          return onSubmit(challen_code);
        }}
        show={modalstate}
        title={"PIN VERIFY"}
      />
      <Modal.Header closeButton className="bg-aws-navy text-white">
        <Modal.Title className="h6">
          <FontAwesomeIcon
            icon={faClipboardCheck}
            className="me-2 text-aws-orange"
          />
          KIỂM ĐỊNH LÔ (QC) - {batchData?.id}
          {isLocked && (
            <Badge bg="success" className="ms-2">
              ĐÃ CHỐT CHAIN
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        {isLocked && (
          <div className="alert alert-warning m-0 rounded-0 small py-2 px-4 border-0">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Lô hàng này đã đạt chuẩn QC và ghi nhận trên Blockchain. Không thể
            chỉnh sửa dữ liệu.
          </div>
        )}
        <Row className="g-0">
          <Col md={5} className="p-4 border-end bg-white">
            <h6 className="aws-label mb-3">Thông tin lô gốc</h6>
            <div className="d-flex align-items-center mb-3">
              <img
                src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${batchData?.product?.main_cardimage}`}
                alt="p"
                className="rounded me-2"
                style={{ width: 50 }}
              />
              <div>
                <div className="fw-800 text-main">
                  {batchData?.product?.name}
                </div>
                <div className="small text-muted">{batchData?.batch_name}</div>
              </div>
            </div>

            <div className="batch-info-list">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Tổng số lượng:</span>
                <span className="fw-bold">{batchData?.quantity}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Phòng ban:</span>
                <span
                  className="badge bg-light text-dark border d-flex justify-content-center align-items-center"
                  style={{
                    width: "fit-content",
                    margin: "0 auto",
                    minHeight: "24px",
                  }}
                >
                  {batchData?.Department?.partname}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Ngày SX:</span>
                <span className="small">
                  {new Date(batchData?.manufacture_date).toLocaleDateString(
                    "vi-VN",
                  )}
                </span>
              </div>
              <div className="qc-personnel-section pt-3 border-top">
                <h6 className="aws-label mb-3">Nhân sự kiểm định</h6>
                {batchData?.QC ? (
                  <div className="d-flex align-items-center p-2 rounded bg-light border">
                    <img
                      src={`${process.env.REACT_APP_API_IMAGE_URL}user-avatar/${batchData.QC.avatar}`}
                      alt="qc"
                      className="rounded-circle me-3 border border-2 border-aws-orange"
                      style={{ width: 45, height: 45, objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-800 text-aws-navy small">
                        {batchData.QC.name}
                      </div>
                      <div className="text-muted" style={{ fontSize: "10px" }}>
                        <FontAwesomeIcon icon={faHistory} className="me-1" />
                        Cập nhật:{" "}
                        {new Date(batchData.updatedAt).toLocaleTimeString(
                          "vi-VN",
                        )}
                      </div>
                      <Badge
                        bg="success"
                        className="mt-1"
                        style={{ fontSize: "9px" }}
                      >
                        NHÂN VIÊN ĐÃ XÁC NHẬN
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 rounded border border-dashed bg-light">
                    <FontAwesomeIcon
                      icon={faHistory}
                      className="text-muted mb-2 fa-lg"
                    />
                    <div className="small fw-bold text-muted">
                      ĐANG CHỜ NHÂN VIÊN QC...
                    </div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>
                      Lô hàng chưa có dữ liệu kiểm định
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col md={7} className="p-4">
            <h6 className="aws-label mb-3">Kết quả kiểm định</h6>
            <Row>
              <Col sm={6} className="mb-3">
                <Form.Label className="small fw-bold text-success">
                  Số lượng ĐẠT (PASS)
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </InputGroup.Text>
                  <Form.Control
                    disabled={isLocked}
                    type="number"
                    className="aws-input-premium border-start-0"
                    value={qcForm.qc_pass}
                    onChange={(e) =>
                      handlePassChange(parseInt(e.target.value) || 0)
                    }
                  />
                </InputGroup>
              </Col>

              <Col sm={6} className="mb-3">
                <Form.Label className="small fw-bold text-danger">
                  Số lượng LỖI (FAILED)
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-danger">
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </InputGroup.Text>
                  <Form.Control
                    disabled={isLocked}
                    type="number"
                    readOnly
                    className="aws-input-premium border-start-0 bg-light"
                    value={qcForm.qc_failed}
                  />
                </InputGroup>
              </Col>
            </Row>

            {qcForm.qc_failed > 0 && (
              <div className="supplement-box p-3 rounded mb-3 border-aws-orange">
                <Form.Check
                  disabled={isLocked}
                  type="switch"
                  id="supplement-switch"
                  label={
                    <span className="fw-bold text-aws-navy">
                      Tự động tạo lô sản xuất bù ({qcForm.qc_failed} cái)
                    </span>
                  }
                  checked={qcForm.create_supplement}
                  onChange={(e) =>
                    setQcForm({
                      ...qcForm,
                      create_supplement: e.target.checked,
                    })
                  }
                />
                <p className="small text-muted mb-0 mt-1">
                  * Lô bù sẽ kế thừa thông tin sản phẩm và gán parent_id từ lô
                  hiện tại.
                </p>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">
                Ghi chú kiểm định
              </Form.Label>
              <Form.Control
                disabled={isLocked}
                as="textarea"
                rows={2}
                className="aws-input-premium"
                placeholder="Lý do lỗi, vị trí phát hiện..."
                onChange={(e) => setQcForm({ ...qcForm, note: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top">
        <Button variant="link" className="text-muted" onClick={onHide}>
          Hủy bỏ
        </Button>
        <Button
          disabled={isLocked}
          className="aws-btn-orange px-4"
          onClick={() => setmodatastate(true)}
        >
          XÁC NHẬN LÔ HÀNG
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QCReportModal;
