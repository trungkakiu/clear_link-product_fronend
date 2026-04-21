import React, { useState } from "react";
import { Modal, Button, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const AWSActionModal = ({
  show,
  onHide,
  title,
  message,
  subMessage,
  action,
  type = "info",
  actionText = "Xác nhận",
  animation = "slide-up",
}) => {
  const [loading, setLoading] = useState(false);

  const config = React.useMemo(
    () =>
      ({
        success: {
          icon: faCheckCircle,
          color: "#2dce89",
          btnVariant: "success",
        },
        warning: {
          icon: faExclamationTriangle,
          color: "#fb6340",
          btnVariant: "warning",
        },
        danger: { icon: faTimesCircle, color: "#f5365c", btnVariant: "danger" },
        info: { icon: faInfoCircle, color: "#11cdef", btnVariant: "info" },
      })[type],
    [type],
  );

  const handleAction = async () => {
    if (!action) return;
    console.log("call+");
    try {
      setLoading(true);
      const res = await action();

      if (res && (res.RC === 200 || res.RC === 201)) {
        toast.success(res.RM || "Thao tác thành công!");
        onHide();
      } else {
        toast.error(res?.RM || "Thao tác chưa thể thực hiện!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối TraceChain!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={loading ? null : onHide}
      centered
      className={`aws-mobile-modal ${animation}`}
      contentClassName="border-0 shadow-lg"
      backdrop={loading ? "static" : true}
    >
      <Modal.Body className="p-4 text-center">
        <div className="mb-3 mt-2">
          <FontAwesomeIcon
            icon={config.icon}
            size="3x"
            style={{
              color: config.color,
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
            }}
          />
        </div>

        <h5 className="fw-800 text-aws-navy mb-2">{title}</h5>
        <p className="text-muted small mb-1 px-2">{message}</p>
        {subMessage && (
          <p className="text-primary tiny fw-bold mb-3">{subMessage}</p>
        )}

        <Button
          variant={config.btnVariant}
          disabled={loading}
          className="w-100 py-3 rounded-pill fw-bold shadow-none text-uppercase d-flex align-items-center justify-content-center"
          onClick={handleAction}
          style={{
            letterSpacing: "1px",
            height: "55px",
            transition: "all 0.3s",
          }}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                className="me-2"
              />
              ĐANG XÁC THỰC...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              {actionText}
            </>
          )}
        </Button>

        {!loading && (
          <button
            className="btn btn-link text-muted mt-3 btn-sm text-decoration-none fw-bold"
            onClick={onHide}
          >
            BỎ QUA
          </button>
        )}
      </Modal.Body>

      {/* Anh Trung lưu ý: Chỗ này có thể mang ra file CSS riêng cho sạch máy */}
      <style>{`
        .tiny { font-size: 11px; }
        .aws-mobile-modal .modal-dialog {
          margin: 1rem;
          display: flex;
          align-items: flex-end;
          min-height: calc(100% - 2rem);
        }
        @media (min-width: 576px) {
          .aws-mobile-modal .modal-dialog { align-items: center; max-width: 400px; margin: auto; }
        }
        .aws-mobile-modal .modal-content { border-radius: 28px; }
        .slide-up .modal-content { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </Modal>
  );
};

export default AWSActionModal;
