import React, { useEffect } from "react";
import { Modal, Button } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const FlexibleModal = ({
  isOpen,
  onClose,
  title = "Thông báo",
  type = "info",
  buttonText = "Xác nhận",
  onConfirm,
  isLoading = false,
  children,
  showFooter = true, 
}) => {
  useEffect(() => {
    onConfirm();
  }, []);

  const config = {
    success: { icon: faCheckCircle, color: "text-success", btn: "success" },
    error: { icon: faTimesCircle, color: "text-danger", btn: "danger" },
    warning: {
      icon: faExclamationTriangle,
      color: "text-warning",
      btn: "warning",
    },
    info: { icon: faInfoCircle, color: "text-info", btn: "info" },
  };

  const theme = config[type] || config.info;

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={isOpen}
      onHide={!isLoading ? onClose : undefined}
      backdrop={isLoading ? "static" : true} 
    >
      {/* Header */}
      <Modal.Header className="border-0">
        <Modal.Title className="h6 flex-grow-1 d-flex align-items-center">
          <FontAwesomeIcon
            icon={theme.icon}
            className={`${theme.color} me-2`}
          />
          {title}
        </Modal.Title>
        {!isLoading && (
          <Button variant="close" aria-label="Close" onClick={onClose} />
        )}
      </Modal.Header>

      <Modal.Body className="py-4">{children}</Modal.Body>

      {/* Footer */}
      {showFooter && (
        <Modal.Footer className="border-0">
          <Button
            variant="link"
            className="text-gray ms-auto"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant={theme.btn}
            onClick={onConfirm}
            disabled={isLoading}
            className="d-flex align-items-center shadow-soft"
          >
            {isLoading && (
              <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
            )}
            {isLoading ? "Đang xử lý..." : buttonText}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default FlexibleModal;
