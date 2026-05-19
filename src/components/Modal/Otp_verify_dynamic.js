import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Row, Col } from "@themesberg/react-bootstrap";
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
    status: "editing", // "editing" | "success" | "error"
    errorCode: 200,
    message: message,
  });

  const inputsRef = useRef([]);
  const { User } = useContext(UserContext);

  useEffect(() => {
    if (show) {
      setDigits(["", "", "", "", "", ""]);
      setIsSubmitting(false);
      setPageState({ status: "editing", errorCode: 200, message: message });

      setTimeout(() => {
        if (inputsRef.current[0]) inputsRef.current[0].focus();
      }, 200);
    }
  }, [show, message]);

  const handleRetry = () => {
    setDigits(["", "", "", "", "", ""]);
    setPageState({ status: "editing", errorCode: 200, message: message });
    setIsSubmitting(false);
    setTimeout(() => {
      if (inputsRef.current[0]) inputsRef.current[0].focus();
    }, 100);
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
        // Gọi hàm xử lý nghiệp vụ (AcceptShippingOrder)
        const finalRes = await onSuccess(resOtp.RD);
        setIsSubmitting(false);

        if (finalRes && finalRes.RC === 200) {
          setPageState({
            status: "success",
            errorCode: 200,
            message: finalRes.RM || "Hành động đã hoàn thành thành công!",
          });

          setTimeout(() => {
            close();
            if (closeReload) closeReload();
          }, 1500);
        } else {
          // Bắt mọi mã lỗi động từ Backend (400, 404, 500, số âm, v.v...)
          setPageState({
            status: "error",
            errorCode: finalRes?.RC || 400,
            message: finalRes?.RM || "Yêu cầu xử lý thất bại!",
          });
        }
      } else {
        setIsSubmitting(false);
        setDigits(["", "", "", "", "", ""]);
        if (inputsRef.current[0]) inputsRef.current[0].focus();
        toast.error(resOtp?.RM || "Mã PIN xác thực không chính xác!");
      }
    } catch (error) {
      setIsSubmitting(false);
      // Trích xuất mã lỗi và tin nhắn thô từ phản hồi mạng của Axios nếu có sập kết nối
      const serverErrorMsg =
        error.response?.data?.RM ||
        error.message ||
        "Lỗi kết nối máy chủ xác thực!";
      const serverErrorCode = error.response?.data?.RC || 500;

      setPageState({
        status: "error",
        errorCode: serverErrorCode,
        message: serverErrorMsg,
      });
    }
  };

  const renderContent = () => {
    if (pageState.status === "success") {
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
    }

    if (pageState.status === "error") {
      return (
        <div className="aws-page-status error-view">
          <div className="icon-wrapper bg-soft-danger">
            <FontAwesomeIcon
              icon={
                pageState.errorCode === 500
                  ? faExclamationTriangle
                  : faTimesCircle
              }
              className="text-danger"
              size="3x"
            />
          </div>
          <h5 className="mt-3 fw-bold text-dark">
            {pageState.errorCode === 500
              ? "Lỗi Hệ Thống"
              : "Hành động thất bại"}
          </h5>
          {/* Hiển thị chuẩn xác mã Code lỗi để anh em dev dễ gỡ Bug */}
          <div className="badge bg-light text-danger border mb-2 small fw-bold">
            Error Code: {pageState.errorCode}
          </div>
          <p className="text-muted px-2">{pageState.message}</p>
          <Button
            variant="outline-primary"
            className="mt-2"
            onClick={handleRetry}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    // Trạng thái mặc định: Chờ nhập mã PIN số hóa
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
  };

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      className="aws-otp-modal"
      backdrop="static"
    >
      {isSubmitting && pageState.status === "editing" && (
        <div className="aws-processing-overlay">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faCircleNotch}
              spin
              className="text-primary mb-2"
              size="3x"
            />
            <h6 className="fw-bold text-dark">Đang xác thực giao dịch...</h6>
          </div>
        </div>
      )}

      <Modal.Header
        className="border-0 pb-0"
        closeButton={pageState.status !== "success" && !isSubmitting}
      >
        <Modal.Title className="aws-otp-title d-flex align-items-center">
          <div className="aws-otp-icon me-2">
            <FontAwesomeIcon icon={faShieldAlt} />
          </div>
          {pageState.status === "editing" ? title : "Kết quả xử lý"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center pt-2 pb-4">
        {renderContent()}
      </Modal.Body>

      {pageState.status === "editing" && (
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
