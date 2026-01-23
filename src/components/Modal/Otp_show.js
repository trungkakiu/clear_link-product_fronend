import React, { useEffect, useState } from "react";
import { Modal, Button, ProgressBar } from "@themesberg/react-bootstrap";
import "../../scss/volt/components/Otp_show.scss";

const Otp_show = ({ show, close, otp }) => {
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!show) return;

    setTimeLeft(180);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      backdrop="static"
      keyboard={false}
      className="otp-result-modal"
    >
      <Modal.Header>
        <Modal.Title>Mã PIN của bạn</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="otp-info">
          Đây là <strong>mã PIN bảo mật</strong> bạn vừa tạo. Hãy lưu trữ thật
          cẩn thận – mã này sẽ không hiển thị lại.
        </p>

        <div className="otp-box">{otp}</div>

        <div className="countdown">
          Tự động đóng sau: <strong>{formatTime(timeLeft)}</strong>
        </div>

        <ProgressBar
          now={(timeLeft / 180) * 100}
          variant="primary"
          className="mt-2"
        />

        <p className="warning-text mt-3">
          ⚠ Lưu ý: Nếu bạn quên PIN, các khóa bảo mật liên quan sẽ không thể
          truy cập.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={close}>
          Tôi đã lưu lại
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Otp_show;
