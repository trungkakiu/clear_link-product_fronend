import React from "react";
import { Card, Col } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useModalStore } from "../Context/Otp_globalstate";
import { Button } from "bootstrap";

const Otp_wait = () => {
  const hasOtpBlock = useModalStore((state) => state.hasOtpBlock);
  const { isOpen, setIsOpen } = useModalStore((state) => ({
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
  }));

  return (
    <Col md={6} lg={4} className="mx-auto mt-5">
      <Card className="shadow-lg border-light p-4 h-100 text-center">
        <Card.Body>
          <div className="mb-4">
            <span
              className="icon icon-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
              style={{ width: 64, height: 64 }}
            >
              <FontAwesomeIcon icon={faLock} />
            </span>
          </div>
          <h3 className="mb-3">Chờ Xác Thực PIN</h3>
          <p className="text-muted mb-4">
            Vui lòng kiểm tra ứng dụng xác thực của bạn để nhập mã PIN và hoàn
            tất quá trình đăng nhập.
          </p>
          <Button variant="primary" onClick={() => setIsOpen(true)}>
            Tạo mã PIN ngay
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Otp_wait;
