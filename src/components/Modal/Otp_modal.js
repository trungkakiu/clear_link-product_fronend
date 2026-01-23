import React, { useContext, useEffect, useRef, useState } from "react";
import "../../scss/volt/components/Otp_modal.scss";
import { Modal, Button, Row, Col } from "@themesberg/react-bootstrap";
import { Routes } from "../../routes";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

const Otp_modal = ({ show, close, isForced, result }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const { User } = useContext(UserContext);

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
      if (inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length < 6) return;
    const res = await api_request.post_otp(User, otp);
    if (res) {
      if (res.RC === 200) {
        toast.success("Đã tạo mã PIN thành công!");
        result(res.RD);
      }
      if (res.RC === 201) {
        toast.success(res.RM);
        result(res.RD);
      } else {
        toast.error(res.RM);
      }
    }
  };

  const isValid = digits.every((d) => d !== "");

  return (
    <Modal
      show={show}
      onHide={isForced ? () => {} : close}
      centered
      className="otp-modal"
      backdrop={isForced ? "static" : true}
      keyboard={!isForced}
    >
      <Modal.Header closeButton={!isForced}>
        <Modal.Title className="otp-title">Tạo mã PIN bảo mật</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="otp-subtitle">
          Đây là bước <strong>tạo mã PIN bảo mật cá nhân</strong>. Vui lòng nhập{" "}
          <strong>6 chữ số bất kỳ</strong> để đặt mật mã bảo vệ khóa bảo mật của
          bạn
          <br />
          <br />
          <span
            style={{
              fontSize: "0.85rem",
              color: "#b91c1c",
              fontWeight: 600,
            }}
          >
            ⚠ Lưu ý quan trọng:
          </span>
          <ul
            style={{
              fontSize: "0.85rem",
              color: "#374151",
              marginTop: "6px",
              paddingLeft: "20px",
              lineHeight: "1.4",
            }}
          >
            <li>
              Mã PIN này <strong>không thể khôi phục</strong> nếu bạn quên.
            </li>
            <li>
              PIN sẽ được dùng để <strong>mã hóa và giải mã</strong> dữ liệu bảo
              mật.
            </li>
            <li>Hãy ghi nhớ hoặc lưu trữ mã PIN ở nơi an toàn.</li>
          </ul>
        </p>

        <Row className="g-2 justify-content-center">
          {digits.map((digit, index) => (
            <Col xs={2} key={index}>
              <input
                type="text"
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
        {!isForced && (
          <Button variant="outline-secondary" onClick={close}>
            Hủy
          </Button>
        )}

        <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
          Tiếp tục
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Otp_modal;
