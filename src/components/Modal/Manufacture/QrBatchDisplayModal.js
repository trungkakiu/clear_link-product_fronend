import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Spinner,
} from "@themesberg/react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import ReactToPrint from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrint,
  faQrcode,
  faBoxOpen,
  faShieldAlt,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import { toast } from "react-toastify";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";

const ComponentToPrint = React.forwardRef((props, ref) => {
  const { qrCodes, targetId } = props;

  return (
    <div ref={ref} className="print-only-container">
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h4
          style={{
            textAlign: "center",
            marginBottom: "30px",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
          }}
        >
          DANH SÁCH TEM NHÃN TRUY XUẤT - LÔ HÀNG: {targetId}
        </h4>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            gap: "15px",
          }}
        >
          {qrCodes?.map((qr) => (
            <div
              key={qr.id}
              style={{
                width: "180px",
                height: "260px",
                border: "1px dashed #000",
                padding: "15px",
                textAlign: "center",
                pageBreakInside: "avoid",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  color: "#1a237e",
                }}
              >
                TRACECHAIN SYSTEM
              </div>
              <div style={{ marginBottom: "10px" }}>
                <QRCodeSVG
                  value={`${qr.id}|${qr.secure_token}`}
                  size={130}
                  level="M"
                />
              </div>
              <div style={{ marginTop: "5px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#666",
                    wordBreak: "break-all",
                  }}
                >
                  ID: {qr.id.substring(0, 15)}...
                </div>
                <div
                  style={{
                    fontSize: "11px", // Giảm nhẹ size cho thanh thoát
                    fontWeight: "bold",
                    background: "#f4f4f4",
                    border: "1px solid #ddd",
                    marginTop: "5px",
                    padding: "2px 5px", // Thêm tí đệm cho chữ khỏi dính biên
                    whiteSpace: "nowrap", // KHÔNG cho xuống dòng
                    overflow: "hidden", // ẨN phần thừa
                    textOverflow: "ellipsis", // HIỆN dấu ba chấm (...)
                  }}
                  title={qr.blockchain_proof} // Di chuột vào hiện full mã
                >
                  {qr.blockchain_proof || "Chưa có Proof"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const QrBatchDisplayModal = ({
  show,
  onHide,
  qrCodes,
  targetId,
  isVerifying,
  closeReload,
}) => {
  const componentRef = useRef();
  const [modalShow, setModalShow] = useState(false);
  const { User } = useContext(UserContext);

  const handleConfirmPrinted = async () => {
    if (!qrCodes || qrCodes.length === 0) return;
    const isConfirmed = window.confirm(
      "Hệ thống hỏi: Bạn đã in tem thành công và máy in không gặp lỗi chứ?\n\nBấm OK để xác nhận trạng thái 'ĐÃ IN' cho các mã này.",
    );

    if (isConfirmed) {
      try {
        const qrIds = qrCodes.map((qr) => qr.id);
        const res = await api_request.confirm_qr_printed(User, qrIds);

        if (res?.RC === 200) {
          toast.success("Xác nhận trạng thái PRINTED thành công!");
          if (closeReload) closeReload();
        } else {
          toast.error(res?.RM || "Lỗi khi cập nhật trạng thái in!");
        }
      } catch (error) {
        console.error("Lỗi xác nhận in:", error);
        toast.error("Lỗi kết nối máy chủ khi xác nhận in!");
      }
    } else {
      toast.info("Lệnh in chưa được xác nhận vào hệ thống.");
    }
  };

  const onCreateQr = async (challenge_code) => {
    try {
      const res = await api_request.create_qr_batch(
        User,
        targetId,
        challenge_code,
      );
      if (res) {
        if (res.RC === 200) {
          toast.success("Tạo mã QR mới thành công!");
          setModalShow(false);
          closeReload();
        } else {
          toast.error(res.RM || "Lỗi khi tạo mã QR mới!");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo QR mới:", error);
      toast.error("Lỗi khi tạo QR mới! Vui lòng thử lại sau.");
      return {
        RM: "Lỗi kết nối máy chủ tạo QR mới!",
        RC: 500,
      };
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered>
        {isVerifying && (
          <div className="blockchain-verify-overlay">
            <div className="text-center text-white">
              <Spinner
                animation="border"
                variant="warning"
                style={{ width: "4rem", height: "4rem" }}
              />
              <h5 className="mt-4 fw-bold">ĐANG XÁC THỰC TRÊN NODE...</h5>
              <p className="small">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        )}

        <Modal.Header
          closeButton
          style={{ background: "#1a237e", color: "#fff" }}
        >
          <Modal.Title className="h6">
            <FontAwesomeIcon
              icon={faQrcode}
              className="me-2 text-warning text-white"
            />
            QUẢN LÝ ĐỊNH DANH QR - LÔ HÀNG:{" "}
            <span className="text-warning">{targetId}</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            maxHeight: "75vh",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            padding: "25px",
          }}
        >
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <h6 className="text-navy fw-bold mb-0">
              <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
              Danh sách {qrCodes?.length || 0} thùng hàng (Boxes)
            </h6>
          </div>

          <Row className="g-3">
            {qrCodes && qrCodes.length > 0 ? (
              qrCodes.map((qr) => (
                <Col key={qr.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="text-center shadow-sm border-0 qr-hover-card">
                    <Card.Body className="p-3">
                      <div className="scanner-frame p-2 rounded border mb-2 bg-white">
                        <div className="scan-line"></div>
                        <QRCodeSVG
                          value={`${qr.id}|${qr.secure_token}`}
                          size={130}
                          level="M"
                        />
                      </div>
                      {qr.status === "verified" ? (
                        <div className="mb-2">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="text-success me-1"
                          />
                          XÁC THỰC
                        </div>
                      ) : (
                        <div className="mb-2">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="text-danger me-1"
                          />
                          CHƯA XÁC THỰC
                        </div>
                      )}
                      <div
                        className="fw-bold text-navy mb-1"
                        style={{ fontSize: "13px" }}
                      >
                        {qr.blockchain_proof}
                      </div>
                      <code style={{ fontSize: "10px", color: "#ff6f00" }}>
                        {qr.id.substring(0, 18)}...
                      </code>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs={12} className="text-center py-5">
                <Otp_verify_dynamic
                  show={modalShow}
                  close={() => setModalShow(false)}
                  title="Xác thực để tạo mã QR mới"
                  closeReload={() => {
                    setModalShow(false);
                    closeReload();
                  }}
                  message={
                    "Vui lòng xác thực OTP để kích hoạt ClearLink Protocol và tạo mã QR mới cho lô hàng này"
                  }
                  onSuccess={(challenge_code) => {
                    return onCreateQr(challenge_code);
                  }}
                />
                <div
                  className="empty-qr-container p-5 rounded-3 shadow-sm border"
                  style={{
                    background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  {/* 1. Icon làm điểm nhấn - Nhìn cực kỳ uy tín */}
                  <div className="mb-4">
                    <div
                      className="icon-circle bg-dark d-inline-flex align-items-center justify-content-center shadow"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "3px solid #ff6f00",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faQrcode}
                        size="2x"
                        className="text-white"
                      />
                    </div>
                  </div>

                  {/* 2. Phần text thông báo */}
                  <h5 className="fw-bold text-dark mb-2">DANH SÁCH QR TRỐNG</h5>
                  <p
                    className="text-muted mb-4 small"
                    style={{ lineHeight: "1.6" }}
                  >
                    Hệ thống chưa ghi nhận mã định danh nào cho lô hàng này.{" "}
                    <br />
                    Vui lòng kích hoạt <b>TraceChain Protocol</b> để khởi tạo mã
                    mới.
                  </p>

                  {/* 3. Nút bấm "Vít ga" */}
                  <Button
                    variant="dark"
                    className="px-4 py-2 shadow-sm fw-bold btn-vignette"
                    style={{
                      borderLeft: "4px solid #ff6f00",
                      letterSpacing: "1px",
                    }}
                    onClick={() => {
                      setModalShow(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSync}
                      className="me-2 text-warning"
                    />
                    KHỞI TẠO MÃ QR BLOCKCHAIN
                  </Button>
                </div>
              </Col>
            )}
          </Row>

          <ComponentToPrint
            ref={componentRef}
            qrCodes={qrCodes}
            targetId={targetId}
          />
        </Modal.Body>

        <Modal.Footer className="bg-white">
          <Button variant="link" className="text-gray" onClick={onHide}>
            Đóng cửa sổ
          </Button>
          {qrCodes && qrCodes.length > 0 && (
            <ReactToPrint
              trigger={() => (
                <Button
                  variant="dark"
                  className="px-4 shadow-sm"
                  style={{ borderLeft: "4px solid #ff6f00" }}
                >
                  <FontAwesomeIcon icon={faPrint} className="me-2" /> XUẤT LỆNH
                  IN TEM NHIỆT
                </Button>
              )}
              content={() => componentRef.current}
              onAfterPrint={handleConfirmPrinted}
            />
          )}
        </Modal.Footer>
      </Modal>

      <style>{`
        .blockchain-verify-overlay {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(26, 35, 126, 0.9); z-index: 1100;
            display: flex; align-items: center; justify-content: center;
            border-radius: 0.5rem;
        }
        .scanner-frame { position: relative; overflow: hidden; }
        .scan-line {
            position: absolute; width: 100%; height: 2px; background: #ff6f00;
            top: 0; left: 0; box-shadow: 0 0 10px #ff6f00;
            animation: scan-move 2s infinite linear; z-index: 1;
        }
        @keyframes scan-move {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
        .qr-hover-card:hover { transform: translateY(-5px); transition: 0.3s; }
        .text-navy { color: #1a237e; }
      `}</style>
    </>
  );
};

export default QrBatchDisplayModal;
