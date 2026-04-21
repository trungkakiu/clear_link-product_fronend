import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Row, Col, Spinner } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faLock,
  faCircleNotch,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import "../../scss/volt/components/Otp_modal_dynamic.scss";

const Otp_verify_dynamic = ({
  show,
  title,
  message,
  close,
  onSuccess,
  closeReload,
}) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageState, setPageState] = useState({
    status: 203, // Trạng thái chờ nhập
    message: message,
  });

  const inputsRef = useRef([]);
  const { User } = useContext(UserContext);

  useEffect(() => {
    if (show) {
      setDigits(["", "", "", "", "", ""]);
      setIsSubmitting(false);
      setPageState({ status: 203, message: message });

      setTimeout(() => {
        if (inputsRef.current[0]) inputsRef.current[0].focus();
      }, 200);
    }
  }, [show, message]);
  // ---------------------------------

  const handleRetry = () => {
    setDigits(["", "", "", "", "", ""]);
    setPageState({ status: 203, message: message });
    setIsSubmitting(false);
  };

  const handleChange = (index, value) => {
    const val = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < 5) {
      if (inputsRef.current[index + 1]) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      if (inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return;

    try {
      setIsSubmitting(true);
      const resOtp = await api_request.vetify_user_otp(User, otp);
      if (resOtp && resOtp.RC === 200) {
        const finalRes = await onSuccess(resOtp.RD);
        if (finalRes && finalRes.RC === 200) {
          setIsSubmitting(false);
          setPageState({
            status: 200,
            message: finalRes.RM || "Action completed successfully!",
          });

          setTimeout(() => {
            close();
            if (closeReload) closeReload();
          }, 1500);
        } else {
          setIsSubmitting(false);
          setPageState({
            status: 400,
            message: finalRes?.RM || "Hành động thất bại!",
          });
        }
      } else {
        setIsSubmitting(false);
        setDigits(["", "", "", "", "", ""]);
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
        toast.error(resOtp?.RM || "Mã PIN không chính xác!");
      }
    } catch (error) {
      setIsSubmitting(false);
      setPageState({ status: 500, message: "Lỗi kết nối máy chủ xác thực!" });
    }
  };

  const renderContent = () => {
    switch (pageState.status) {
      case 200:
        return (
          <div className="aws-page-status success-view">
            <div className="icon-wrapper bg-soft-success">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-success"
                size="3x"
              />
            </div>
            <h5 className="mt-3 fw-bold text-dark">Thành công!</h5>
            <p className="text-muted">{pageState.message}</p>
          </div>
        );
      case 400:
      case 500:
        return (
          <div className="aws-page-status error-view">
            <div className="icon-wrapper bg-soft-danger">
              <FontAwesomeIcon
                icon={
                  pageState.status === 500
                    ? faExclamationTriangle
                    : faTimesCircle
                }
                className="text-danger"
                size="3x"
              />
            </div>
            <h5 className="mt-3 fw-bold text-dark">
              {pageState.status === 500 ? "Lỗi Hệ Thống" : "Thất bại"}
            </h5>
            <p className="text-muted">{pageState.message}</p>
            <Button
              variant="outline-primary"
              className="mt-2"
              onClick={() => {
                handleSubmit();
                setPageState({ status: 203, message: message });
              }}
            >
              Thử lại
            </Button>
          </div>
        );
      default:
        return (
          <>
            <div className="aws-lock-visual mb-3">
              <FontAwesomeIcon icon={faLock} className="text-warning" />
            </div>
            <p className="aws-otp-message px-3">{pageState.message}</p>
            <Row className="g-2 justify-content-center mt-4">
              {digits.map((digit, index) => (
                <Col xs={2} key={index} style={{ maxWidth: "50px" }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    className="aws-otp-input"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    disabled={isSubmitting}
                  />
                </Col>
              ))}
            </Row>
          </>
        );
    }
  };

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      className="aws-otp-modal"
      backdrop="static"
    >
      {isSubmitting && pageState.status === 203 && (
        <div className="aws-processing-overlay">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCircleNotch}
              spin
              className="text-primary mb-2"
              size="3x"
            />
            <h6 className="fw-bold text-dark">Processing...</h6>
          </div>
        </div>
      )}

      <Modal.Header
        className="border-0 pb-0"
        closeButton={pageState.status !== 200 && !isSubmitting}
      >
        <Modal.Title className="aws-otp-title d-flex align-items-center">
          <div className="aws-otp-icon me-2">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          {pageState.status === 203 ? title : "Kết quả xác thực"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center pt-2 pb-4">
        {renderContent()}
      </Modal.Body>

      {pageState.status === 203 && (
        <Modal.Footer className="border-0 pt-0 px-4 pb-4 justify-content-center gap-3">
          <Button
            variant="link"
            className="aws-btn-cancel text-muted"
            onClick={close}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            className="aws-btn-submit px-4"
            onClick={handleSubmit}
            disabled={!digits.every((d) => d !== "") || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận PIN"}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default Otp_verify_dynamic;
