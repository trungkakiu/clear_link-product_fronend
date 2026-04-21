import React from "react";
import { Col, Image, Badge, Row } from "@themesberg/react-bootstrap";

const OrderSidebar = ({ data, API_URL }) => (
  <Col lg={4} className="bg-white border-end p-4">
    <div className="text-center mb-4">
      <Image
        src={`${API_URL}main-card/${data.product_pinner?.main_cardimage}`}
        rounded
        className="shadow-sm mb-3 w-100"
        style={{
          height: "180px",
          objectFit: "cover",
          border: "1px solid #eee",
        }}
      />
      <h5 className="fw-bold mb-1 text-main">{data.product_pinner?.name}</h5>
      <Badge bg="gray-100" className="text-muted border p-2">
        MÃ SP: {data.product_id}
      </Badge>
    </div>

    <div className="order-details-sidebar">
      <label className="x-small text-muted fw-bold d-block text-uppercase mb-2">
        Đối tác sản xuất
      </label>
      <div className="d-flex align-items-center p-2 bg-light rounded-3 mb-4">
        <Image
          src={`${API_URL}Company-logo/${data.partner_info?.logo}`}
          width={35}
          height={35}
          className="me-2 rounded-circle border shadow-sm"
        />
        <div className="overflow-hidden">
          <span className="fw-bold text-dark d-block text-truncate">
            {data.partner_info?.company_name}
          </span>
          <span className="extra-small text-muted">
            ID: {data.partner_info?.id}
          </span>
        </div>
      </div>

      <Row className="text-center">
        <Col xs={6} className="border-end">
          <label className="x-small text-muted fw-bold d-block text-uppercase">
            Số lượng
          </label>
          <span className="h5 fw-800 text-main">
            {data.Quantity?.toLocaleString()}
          </span>
        </Col>
        <Col xs={6}>
          <label className="x-small text-muted fw-bold d-block text-uppercase">
            Tổng giá trị
          </label>
          <span className="h5 fw-800 text-danger">
            {Number(data.total_price).toLocaleString()}đ
          </span>
        </Col>
      </Row>
    </div>
  </Col>
);

export default OrderSidebar;
