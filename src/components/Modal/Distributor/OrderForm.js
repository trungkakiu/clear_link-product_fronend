import React from "react";
import { Col, Form, InputGroup, Row, Badge } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const OrderForm = ({
  formData,
  setFormData,
  total,
  payNow,
  remaining,
  percent,
}) => (
  <Col md={7}>
    <Form className="px-2">
      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">Số lượng đặt hàng</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FontAwesomeIcon icon={faBox} />
          </InputGroup.Text>
          <Form.Control
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            min="1"
          />
        </InputGroup>
      </Form.Group>

      <Row>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Ngày bắt đầu</Form.Label>
            <Form.Control
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Hạn hoàn thành</Form.Label>
            <Form.Control
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="small fw-bold">Ghi chú</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Yêu cầu thêm..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </Form.Group>

      <div className="payment-summary-card p-3 rounded mt-3 shadow-sm bg-white border-left-aws">
        <div className="d-flex justify-content-between mb-2 small text-muted">
          Tổng giá trị:{" "}
          <span className="fw-bold text-main">{total.toLocaleString()}đ</span>
        </div>
        <div className="py-2 border-top border-bottom my-2 bg-light px-2 rounded border-dashed-orange d-flex justify-content-between align-items-center">
          <span className="fw-bold small">
            {formData.payment_method === "COD"
              ? "Thanh toán khi nhận:"
              : `Cọc NGAY (${percent}%):`}
          </span>
          <span className="fw-bold text-danger h4 mb-0">
            {payNow.toLocaleString()}đ
          </span>
        </div>
        {remaining > 0 && (
          <div className="d-flex justify-content-between small text-muted">
            Còn lại:{" "}
            <span className="fw-bold text-main">
              {remaining.toLocaleString()}đ
            </span>
          </div>
        )}
      </div>
    </Form>
  </Col>
);

export default OrderForm;
