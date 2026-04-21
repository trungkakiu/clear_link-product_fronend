import React, { useEffect, useRef } from "react";
import { Modal, Button } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faCheckCircle,
  faTimesCircle,
  faServer,
} from "@fortawesome/free-solid-svg-icons";

const Processing_Modal = ({
  show,
  status,
  message,
  onApi, // Hàm API truyền vào
  onRetry,
  onClose,
}) => {
  // Dùng ref để đảm bảo chỉ gọi API một lần duy nhất khi modal hiện lên
  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (show && status === "loading" && onApi && !hasCalledApi.current) {
      onApi();
      hasCalledApi.current = true;
    }

    // Reset ref khi đóng modal để lần sau mở lại vẫn chạy
    if (!show) {
      hasCalledApi.current = false;
    }
  }, [show, status, onApi]);

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="status-icon loading">
            <FontAwesomeIcon
              icon={faCircleNotch}
              spin
              size="4x"
              className="text-primary"
            />
          </div>
        );
      case "success":
        return (
          <div className="status-icon success pulse">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="4x"
              className="text-success"
            />
          </div>
        );
      case "error":
        return (
          <div className="status-icon error shake">
            <FontAwesomeIcon
              icon={faTimesCircle}
              size="4x"
              className="text-danger"
            />
          </div>
        );
      default:
        return (
          <FontAwesomeIcon
            icon={faServer}
            size="4x"
            className="text-gray-400"
          />
        );
    }
  };

  return (
    <Modal
      show={show}
      onHide={status !== "loading" ? onClose : null}
      centered
      backdrop="static"
      className="aws-processing-modal"
    >
      <Modal.Body className="text-center p-5">
        <div className="visual-wrapper mb-4">{renderIcon()}</div>
        <h4 className="fw-extrabold text-navy mb-2">
          {status === "loading" && "Đang xử lý giao dịch..."}
          {status === "success" && "Thao tác thành công!"}
          {status === "error" && "Có lỗi xảy ra!"}
        </h4>
        <p className="text-muted mb-4 px-3">{message}</p>
        {status !== "loading" && (
          <div className="action-group d-flex justify-content-center gap-2">
            {status === "error" && onRetry && (
              <Button variant="primary" onClick={onRetry}>
                Thử lại
              </Button>
            )}
            <Button variant="outline-gray-500" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}
      </Modal.Body>
      {status === "loading" && <div className="loading-progress-bar"></div>}
    </Modal>
  );
};

export default Processing_Modal;
