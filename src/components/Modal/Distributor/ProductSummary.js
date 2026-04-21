import React from "react";
import { Col, Image, Badge } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";

const ProductSummary = ({ product, API_URL }) => (
  <Col md={5} className="mb-4 mb-md-0">
    <div className="order-summary-box h-100 p-3 border rounded bg-light">
      <div className="text-center mb-3">
        <Image
          src={`${API_URL}main-card/${product.main_cardimage}`}
          rounded
          className="shadow-sm mb-3 w-100"
          style={{ height: "160px", objectFit: "cover" }}
        />
        <h5 className="fw-bold mb-1">{product.name}</h5>
        <Badge bg="soft-success" className="text-success mb-2">
          OEM: Tắt (Mẫu chuẩn)
        </Badge>
      </div>
      <div className="border-top pt-3">
        <div className="d-flex justify-content-between mb-2 small">
          <span className="text-muted">Đơn giá:</span>
          <span className="fw-bold">{product.price?.toLocaleString()}đ</span>
        </div>
        <div className="d-flex justify-content-between mb-2 small">
          <span className="text-muted">
            <FontAwesomeIcon icon={faStore} className="me-1" /> Đối tác:
          </span>
          <span className="fw-bold text-end">
            {product.manufacturer_info?.company_name}
          </span>
        </div>
      </div>
    </div>
  </Col>
);

export default ProductSummary;
