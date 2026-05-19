import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Card,
  Spinner,
  Pagination,
} from "@themesberg/react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print"; // Chú ý: Dùng hook này thay vì thẻ <ReactToPrint>
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

// ==========================================
// 1. COMPONENT IN ẤN (COMPONENT TO PRINT)
// ==========================================
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
                    fontSize: "11px",
                    fontWeight: "bold",
                    background: "#f4f4f4",
                    border: "1px solid #ddd",
                    marginTop: "5px",
                    padding: "2px 5px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={qr.blockchain_proof}
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

// ==========================================
// 2. MODAL HIỂN THỊ CHÍNH
// ==========================================
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
  const [isPreparingPrint, setIsPreparingPrint] = useState(false); // Cờ kiểm soát việc render thẻ in
  const { User } = useContext(UserContext);

  // --- LOGIC PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Hiển thị 12 mã / 1 trang

  const totalItems = qrCodes?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentQRCodes =
    qrCodes?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    ) || [];

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Trở về trang 1 nếu đổi lô hàng
  useEffect(() => {
    setCurrentPage(1);
  }, [qrCodes]);
  // -------------------------

  // --- LOGIC IN ẤN TỐI ƯU HIỆU NĂNG ---
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

  const triggerPrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      setIsPreparingPrint(false); // In xong thì HỦY DOM IN để giải phóng RAM
      handleConfirmPrinted();
    },
    removeAfterPrint: true,
  });

  const handlePrintClick = () => {
    setIsPreparingPrint(true); // Bật cờ cho React render hàng nghìn SVG ra DOM ẩn

    // Đợi 1.5 giây để React có thời gian vẽ DOM xong, rồi mới gọi lệnh In của Windows
    setTimeout(() => {
      triggerPrint();
    }, 1500);
  };
  // ------------------------------------

  // --- LOGIC TẠO QR MỚI ---
  const onCreateQr = async (challenge_code) => {
    try {
      const res = await api_request.create_qr_batch(
        User,
        targetId,
        challenge_code,
      );
      if (res && res.RC === 200) {
        toast.success("Tạo mã QR mới thành công!");
        setModalShow(false);
        closeReload();
      } else {
        toast.error(res?.RM || "Lỗi khi tạo mã QR mới!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo QR mới:", error);
      toast.error("Lỗi khi tạo QR mới! Vui lòng thử lại sau.");
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
            <FontAwesomeIcon icon={faQrcode} className="me-2 text-warning" />
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
              Danh sách thùng hàng ({totalItems} tem)
            </h6>
          </div>

          <Row className="g-3">
            {totalItems > 0 ? (
              currentQRCodes.map((qr) => (
                <Col key={qr.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="text-center shadow-sm border-0 qr-hover-card">
                    <Card.Body className="p-3">
                      <div className="p-2 rounded border mb-2 bg-white d-inline-block">
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
                          <span className="small fw-bold text-success">
                            XÁC THỰC
                          </span>
                        </div>
                      ) : (
                        <div className="mb-2">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="text-danger me-1"
                          />
                          <span className="small fw-bold text-danger">
                            CHƯA XÁC THỰC
                          </span>
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
                  message="Vui lòng xác thực OTP để kích hoạt ClearLink Protocol và tạo mã QR mới cho lô hàng này"
                  onSuccess={(challenge_code) => onCreateQr(challenge_code)}
                />
                <div
                  className="empty-qr-container p-5 rounded-3 shadow-sm border"
                  style={{
                    background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
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

                  <Button
                    variant="dark"
                    className="px-4 py-2 shadow-sm fw-bold btn-vignette"
                    style={{
                      borderLeft: "4px solid #ff6f00",
                      letterSpacing: "1px",
                    }}
                    onClick={() => setModalShow(true)}
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

          {/* HIỂN THỊ ĐIỀU HƯỚNG PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 pt-3 border-top">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <Pagination.Ellipsis key={page} disabled />;
                  }
                  return null;
                })}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          {/* 👉 CƠ CHẾ RENDER IN: CHỈ VẼ KHI isPreparingPrint BẰNG TRUE */}
          {isPreparingPrint && (
            <div style={{ display: "none" }}>
              <ComponentToPrint
                ref={componentRef}
                qrCodes={qrCodes} // Vẫn đẩy vào đủ 100% dữ liệu để in
                targetId={targetId}
              />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-white">
          <Button
            variant="link"
            className="text-gray"
            onClick={onHide}
            disabled={isPreparingPrint}
          >
            Đóng cửa sổ
          </Button>
          {totalItems > 0 && (
            <Button
              variant="dark"
              className="px-4 shadow-sm"
              style={{ borderLeft: "4px solid #ff6f00" }}
              onClick={handlePrintClick}
              disabled={isPreparingPrint} // Khóa nút khi đang load in
            >
              {isPreparingPrint ? (
                <>
                  <Spinner
                    size="sm"
                    animation="border"
                    className="me-2 text-warning"
                  />
                  ĐANG CHUẨN BỊ TRANG IN...
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faPrint}
                    className="me-2 text-warning"
                  />
                  XUẤT LỆNH IN TEM NHIỆT ({totalItems})
                </>
              )}
            </Button>
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
        .qr-hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .qr-hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .text-navy { color: #1a237e; }
      `}</style>
    </>
  );
};

export default QrBatchDisplayModal;
