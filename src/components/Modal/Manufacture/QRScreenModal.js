import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSearch,
  faQrcode,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
// 🚀 ĐÃ BỔ SUNG: Import thêm Row và Col từ @themesberg/react-bootstrap
import {
  Image,
  Button,
  Modal,
  Spinner,
  Badge,
  Row,
  Col,
} from "@themesberg/react-bootstrap";
import FlexibleModal from "../FlexibleModal";
import PaymentDetail from "../Distributor/PaymentDetail";
import { UserContext } from "../../../Context/UserContext";
import api_request from "../../../apicontroller/api_request";

const QRScreenModal = ({ show = false, onClose, data = {}, min_to_start }) => {
  const { User } = useContext(UserContext);
  const [localQrLoading, setLocalQrLoading] = useState(true);
  const [innerModal, setInnerModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatusData, setPaymentStatusData] = useState(null);

  useEffect(() => {
    if (show) {
      setLocalQrLoading(true);
    }
  }, [show, data?.payment_code]);

  if (!data) return null;
  const { payment_code, payment_method } = data;

  // Thuật toán đối soát dòng tiền khấu trừ tự động
  const expected = parseFloat(data.amount_expected || 0);
  const actual = parseFloat(data.amount_actual || 0);
  const amount_remaining = Math.max(0, expected - actual);

  const minRequired = parseFloat(min_to_start || 0);
  const min_remaining = Math.max(0, minRequired - actual);

  const handleCheckpayment = async () => {
    try {
      if (show === false || !payment_code) return;
      setIsChecking(true);
      const res = await api_request.checkpaymentstatus(User, payment_code);

      if (res?.RC === 200) {
        setPaymentStatusData(res.RD);
        return res.RD;
      }
    } catch (error) {
      console.error(">>> Check Payment Error:", error);
    } finally {
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  const onManualCheck = async () => {
    if (isChecking) return;

    const result = await handleCheckpayment();
    if (result) {
      setInnerModal(true);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        centered
        className="qr-payment-modal"
        backdrop="static"
      >
        <Modal.Header className="border-0 pb-0">
          {actual > 0 && amount_remaining > 0 && (
            <Badge
              bg="warning"
              className="ms-2 mt-2 text-uppercase fw-bold"
              style={{ fontSize: "11px" }}
            >
              Thanh toán một phần
            </Badge>
          )}
          <Button
            variant="close"
            onClick={onClose}
            className="ms-auto shadow-none"
            disabled={isChecking}
          />
        </Modal.Header>

        <Modal.Body className="px-4 pb-4 pt-0 text-center">
          <div className="mb-3">
            <div className="icon-shape icon-shape-primary rounded-circle mb-3">
              <FontAwesomeIcon icon={faQrcode} size="lg" />
            </div>
            <h5 className="mb-1">THANH TOÁN HÓA ĐƠN</h5>
            <p className="text-muted small">
              Phương thức:{" "}
              <span className="text-primary fw-bold text-uppercase">
                {payment_method || "Chuyển khoản"}
              </span>
            </p>
          </div>

          <div className="alert alert-soft-primary border-0 rounded-12 text-start mb-4 py-2 px-3">
            <div className="d-flex align-items-center small">
              <FontAwesomeIcon icon={faClock} className="text-primary me-2" />
              <div>
                Nội dung chuyển khoản:{" "}
                <b className="text-dark">{payment_code}</b>
              </div>
            </div>
          </div>

          <div
            className="qr-container p-2 border-2 border-dashed rounded-20 mb-4 bg-white shadow-sm d-inline-block"
            style={{
              position: "relative",
              border: "2px dashed #e9ecef",
              width: "240px",
              height: "240px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {localQrLoading && (
              <div
                className="qr-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  zIndex: 2,
                }}
              >
                <Spinner
                  animation="border"
                  variant="primary"
                  size="sm"
                  className="mb-2"
                />
                <div className="small text-muted fw-bold">
                  Đang cấu hình VietQR...
                </div>
              </div>
            )}

            {amount_remaining > 0 ? (
              <Image
                src={`https://img.vietqr.io/image/BIDV-96247R3CT5-compact.jpg?amount=${amount_remaining}&addInfo=${encodeURIComponent(payment_code || "")}&accountName=DO%20DANG%20CHUNG`}
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "12px",
                  display: localQrLoading ? "none" : "block",
                }}
                onLoad={() => setLocalQrLoading(false)}
              />
            ) : (
              <div className="text-center p-3 text-success">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  size="3x"
                  className="mb-2"
                />
                <div className="fw-bold small">
                  Đã khấu trừ hoàn tất từ tiền cọc gốc!
                </div>
              </div>
            )}
          </div>

          <div
            className="bg-light p-3 rounded-12 mx-auto mb-4"
            style={{ maxWidth: "340px" }}
          >
            <Row className="w-100 mx-0 mb-2 small align-items-center">
              <Col xs={6} className="text-start ps-0">
                <span className="text-muted fw-bold">
                  Giá trị đợt giao này:
                </span>
              </Col>
              <Col xs={6} className="text-end pe-0">
                <span className="text-dark fw-bold">
                  {expected.toLocaleString("vi-VN")}đ
                </span>
              </Col>
            </Row>

            {actual > 0 && (
              <Row className="w-100 mx-0 mb-2 small align-items-center text-success">
                <Col xs={6} className="text-start ps-0">
                  <span className="fw-bold">Đã thanh toán trước đó:</span>
                </Col>
                <Col xs={6} className="text-end pe-0">
                  <span className="fw-bold">
                    -{actual.toLocaleString("vi-VN")}đ
                  </span>
                </Col>
              </Row>
            )}

            {/* DÒNG 3: SỐ TIỀN CÒN LẠI PHẢI QUÉT QR CHÍNH (Đẩy 2 biên tuyệt đối) */}
            <Row className="w-100 mx-0 mb-2 border-top pt-2 align-items-center">
              <Col xs={6} className="text-start ps-0">
                <span className="text-muted small fw-bold">
                  Số tiền còn lại:
                </span>
              </Col>
              <Col xs={6} className="text-end pe-0">
                <span className="text-danger fw-800 fs-5">
                  {amount_remaining.toLocaleString("vi-VN")}đ
                </span>
              </Col>
            </Row>

            {/* DÒNG 4: SỐ TIỀN TỐI THIỂU CẦN ĐÓNG THÊM (Hiển thị conditional) */}
            {min_remaining > 0 && amount_remaining > min_remaining && (
              <Row className="w-100 mx-0 mb-2 border-top pt-2 align-items-center text-warning small">
                <Col xs={7} className="text-start ps-0">
                  <span className="fw-bold">
                    Cần đóng thêm để bắt đầu giao:
                  </span>
                </Col>
                <Col xs={5} className="text-end pe-0">
                  <span className="fw-bold">
                    {min_remaining.toLocaleString("vi-VN")}đ
                  </span>
                </Col>
              </Row>
            )}

            {/* DÒNG 5: NỘI DUNG CÚ PHÁP CHUYỂN KHOẢN */}
            <Row className="w-100 mx-0 border-top pt-2 align-items-center small">
              <Col xs={6} className="text-start ps-0">
                <span className="text-muted fw-bold">Nội dung cú pháp:</span>
              </Col>
              <Col xs={6} className="text-end pe-0">
                <span className="text-primary fw-bold">{payment_code}</span>
              </Col>
            </Row>
          </div>
          {/* ========================================================================= */}

          <Button
            variant="primary"
            className="w-100 py-3 rounded-pill fw-bold shadow-soft d-flex align-items-center justify-content-center"
            onClick={onManualCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FontAwesomeIcon icon={faSearch} className="me-2" />
            )}
            {isChecking ? "ĐANG KIỂM TRA SỐ DƯ..." : "KIỂM TRA SỐ DƯ"}
          </Button>
        </Modal.Body>
      </Modal>

      {/* Modal báo kết quả */}
      <FlexibleModal
        isOpen={innerModal}
        onClose={() => setInnerModal(false)}
        onConfirm={handleCheckpayment}
        buttonText="Cập nhật lại"
        isLoading={isChecking}
        showFooter={paymentStatusData?.status !== "paid"}
        title="Kết quả giao dịch"
        type={paymentStatusData?.status === "paid" ? "success" : "info"}
      >
        <PaymentDetail data={paymentStatusData} />
      </FlexibleModal>

      <style>{`
        .qr-payment-modal .modal-content { border-radius: 24px; border: none; }
        .rounded-12 { border-radius: 12px; }
        .rounded-20 { border-radius: 20px; }
        .fw-800 { font-weight: 800; }
        .icon-shape { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto; background: rgba(94, 114, 228, 0.1); color: #5e72e4; }
      `}</style>
    </>
  );
};

export default React.memo(QRScreenModal);
