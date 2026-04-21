import React from "react";
import { Row, Col, Form, Image } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingUsd } from "@fortawesome/free-solid-svg-icons";

const PaymentOption = ({
  id,
  icon,
  title,
  description,
  checked,
  onChange,
  logos,
}) => (
  <div
    className={`aws-payment-option p-3 border rounded mb-2 ${checked ? "border-warning bg-soft-warning active" : ""}`}
    onClick={() => onChange(id)}
    style={{ cursor: "pointer" }}
  >
    <div className="d-flex align-items-start">
      <Form.Check
        type="radio"
        checked={checked}
        readOnly
        className="me-3 mt-1"
      />
      <div>
        <div className="d-flex align-items-center mb-1">
          <Image src={icon} className="me-2" style={{ width: "20px" }} />
          <strong className={checked ? "text-warning" : ""}>{title}</strong>
        </div>
        <p className="extra-small text-muted mb-0">{description}</p>
        {logos && checked && (
          <div className="d-flex gap-2 mt-2">
            {logos.map((l, i) => (
              <Image key={i} src={l} height="12" />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const PaymentMethods = ({ method, setFormData, icons }) => (
  <div className="mt-3 pt-3 border-top">
    <h6 className="small fw-bold mb-3">
      <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2 text-primary" />{" "}
      Phương thức thanh toán
    </h6>
    <Row>
      <Col md={6}>
        <PaymentOption
          id="COD"
          title="Thanh toán COD"
          description="Trả tiền mặt khi nhận hàng"
          icon={icons.COD_icon}
          checked={method === "COD"}
          onChange={(id) =>
            setFormData((prev) => ({ ...prev, payment_method: id }))
          }
        />
      </Col>
      <Col md={6}>
        <PaymentOption
          id="BANK"
          title="VietQR"
          description="Chuyển khoản nhanh 24/7"
          icon={icons.VietQR}
          logos={[icons.BIDV, icons.VCB]}
          checked={method === "BANK"}
          onChange={(id) =>
            setFormData((prev) => ({ ...prev, payment_method: id }))
          }
        />
      </Col>
      {["40", "50", "60", "70"].map((p) => (
        <Col md={3} key={p}>
          <PaymentOption
            id={`DEPOSIT_${p}`}
            title={`Cọc ${p}%`}
            description={`Trả trước ${p}% đơn hàng`}
            icon={icons.VietQR}
            checked={method === `DEPOSIT_${p}`}
            onChange={(id) =>
              setFormData((prev) => ({ ...prev, payment_method: id }))
            }
          />
        </Col>
      ))}
    </Row>
  </div>
);

export default PaymentMethods;
