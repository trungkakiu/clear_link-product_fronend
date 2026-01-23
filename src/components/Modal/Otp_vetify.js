import React, { useContext, useEffect, useRef, useState } from "react";
import "../../scss/volt/components/Otp_modal.scss";
import { Modal, Button, Row, Col } from "@themesberg/react-bootstrap";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

const Otp_vetify = ({ show, title, close, product_id }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const { User } = useContext(UserContext);
  const [sessionOTP, setsessionOTP] = useState();

  useEffect(() => {
    if (show && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
    if (!show) {
      setDigits(["", "", "", "", "", ""]);
    }
  }, [show]);

  const handleChange = (index, value) => {
    const val = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);

    if (val && index < 5 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = inputsRef.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handledrop = async (sesionOTP) => {
    try {
      const res = await api_request.dropProduct(
        User,
        sesionOTP,
        "product",
        product_id,
      );
      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
          close();
        } else {
          toast.error(res.RM);
        }
      } else {
        toast.error("Lỗi hệ thống!");
        return;
      }
    } catch (error) {
      console.error(error);
      return;
    }
  };
  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return;

    const res = await api_request.vetify_user_otp(User, otp);
    if (!res) return;

    if (res.RC === 200) {
      await handledrop(res.RD);
      return;
    }
    toast.error(res.RM || "Mã PIN không hợp lệ");
    return;
  };

  const isValid = digits.every((d) => d !== "");

  return (
    <Modal show={show} onHide={close} centered className="otp-modal">
      <Modal.Header closeButton>
        <Modal.Title className="otp-title">Xác thực bằng mã PIN</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="otp-subtitle">{title}</p>
        <p className="otp-subtitle">
          Vui lòng nhập <strong>6 chữ số PIN</strong> để xác thực danh tính của
          bạn.
        </p>

        <Row className="g-2 justify-content-center mt-3">
          {digits.map((digit, index) => (
            <Col xs={2} key={index}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
              />
            </Col>
          ))}
        </Row>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <Button variant="outline-secondary" onClick={close}>
          Hủy
        </Button>

        <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
          Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Otp_vetify;
