import React from "react";
import { Badge, Row, Col, ListGroup } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faBarcode,
  faCheckDouble,
  faCopy,
  faShieldAlt,
  faExternalLinkAlt,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const PaymentDetail = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-grow text-primary mb-3" role="status"></div>
        <p className="text-aws-navy fw-bold animate-pulse">
          AWS Gateway: Synchronizing...
        </p>
      </div>
    );
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`, {
      autoClose: 1000,
      hideProgressBar: true,
    });
  };

  // Hàm tính toán font-size dựa trên độ dài chuỗi tiền
  const getFontSize = (amount) => {
    const len = Number(amount || 0).toLocaleString().length;
    if (len > 12) return "1.1rem"; // Trên 1 tỷ
    if (len > 9) return "1.25rem"; // Hàng trăm triệu
    return "1.5rem"; // Mặc định
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        text: "Verified & Paid",
        bg: "bg-soft-success",
        color: "text-success",
        icon: faCheckDouble,
      },
      partially_paid: {
        text: "Partial Settlement",
        bg: "bg-soft-warning",
        color: "text-warning",
        icon: faCircle,
      },
      pending: {
        text: "Awaiting Settlement",
        bg: "bg-soft-info",
        color: "text-info",
        icon: faShieldAlt,
      },
    };
    return (
      configs[status] || {
        text: status,
        bg: "bg-soft-secondary",
        color: "text-secondary",
        icon: faShieldAlt,
      }
    );
  };

  const statusCfg = getStatusConfig(data?.status);

  return (
    <div className="payment-aws-theme p-1">
      {/* SECTION 1: Status Header */}
      <div className="d-flex align-items-center p-3 rounded-top border bg-white">
        <div
          className={`icon icon-shape icon-xs ${statusCfg.bg} ${statusCfg.color} rounded me-3 shadow-soft`}
        >
          <FontAwesomeIcon icon={statusCfg.icon} size="sm" />
        </div>
        <div className="flex-grow-1 text-start">
          <h6
            className="mb-0 fw-extrabold text-aws-navy text-uppercase small"
            style={{ letterSpacing: "0.5px" }}
          >
            {statusCfg.text}
          </h6>
          <code className="text-muted" style={{ fontSize: "9px" }}>
            TXN: {data?.sepay_transaction_id || "N/A"}
          </code>
        </div>
        <Badge
          bg="dark"
          className="text-uppercase py-1 px-2"
          style={{ fontSize: "8px" }}
        >
          ON-CHAIN
        </Badge>
      </div>

      {/* SECTION 2: Financial Metrics - CHỐNG VỠ GIAO DIỆN */}
      <div className="bg-light p-3 border-start border-end shadow-inner">
        <Row className="g-3">
          {[
            {
              label: "Expected Amount",
              value: data?.amount_expected,
              color: "text-aws-navy",
              border: "border-primary",
            },
            {
              label: "Actual Received",
              value: data?.amount_actual,
              color: data?.status === "paid" ? "text-success" : "text-warning",
              border:
                data?.status === "paid" ? "border-success" : "border-warning",
            },
          ].map((item, idx) => (
            <Col xs={12} md={6} key={idx}>
              <div
                className={`p-3 bg-white rounded shadow-sm border-start border-3 ${item.border} h-100 financial-card`}
              >
                <label
                  className="d-block text-muted fw-bold text-uppercase mb-1"
                  style={{ fontSize: "9px" }}
                >
                  {item.label}
                </label>
                <div className="d-flex align-items-baseline flex-wrap">
                  <h4
                    className={`mb-0 fw-800 ${item.color} price-text`}
                    style={{ fontSize: getFontSize(item.value) }}
                  >
                    {Number(item.value || 0).toLocaleString()}
                  </h4>
                  <span
                    className="ms-1 fw-bold text-muted"
                    style={{ fontSize: "10px" }}
                  >
                    VND
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="bg-white p-3 rounded-bottom border shadow-sm">
        <ListGroup className="list-group-flush small">
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2 border-0 border-bottom border-dashed">
            <div className="text-muted small">
              <FontAwesomeIcon
                icon={faBarcode}
                className="me-2 text-primary opacity-50"
              />
              Payment VA
            </div>
            <div className="d-flex align-items-center">
              <span className="fw-bold text-aws-navy font-monospace me-2 bg-light px-2 py-1 rounded small">
                {data?.payment_code}
              </span>
              <FontAwesomeIcon
                icon={faCopy}
                className="text-muted cursor-pointer hover-text-primary"
                onClick={() => copyToClipboard(data?.payment_code, "mã VA")}
              />
            </div>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-center px-0 py-2 border-0">
            <div className="text-muted small">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="me-2 text-primary opacity-50"
              />
              Security
            </div>
            <span className="fw-bold text-dark" style={{ fontSize: "10px" }}>
              AES-256 SSL Verified
            </span>
          </ListGroup.Item>
        </ListGroup>

        <div className="mt-3 p-2 rounded bg-soft-primary d-flex align-items-center border border-primary border-opacity-10">
          <FontAwesomeIcon
            icon={faReceipt}
            className="text-primary me-2"
            size="sm"
          />
          <small className="text-primary fw-bold" style={{ fontSize: "10px" }}>
            Xác thực qua BIDV Virtual Account
          </small>
          <FontAwesomeIcon
            icon={faExternalLinkAlt}
            className="ms-auto text-primary opacity-50"
            size="xs"
          />
        </div>
      </div>

      <style>{`
        .payment-aws-theme { font-family: 'Public Sans', -apple-system, sans-serif; }
        .text-aws-navy { color: #232f3e; }
        .fw-800 { font-weight: 800; }
        .bg-soft-success { background-color: #e6fffa; }
        .bg-soft-warning { background-color: #fffbe6; }
        .bg-soft-primary { background-color: #f1faff; }
        .price-text { 
          white-space: nowrap; 
          transition: font-size 0.2s ease;
          letter-spacing: -0.5px;
        }
        .financial-card { min-height: 80px; }
        .border-dashed { border-style: dashed !important; }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        @media (max-width: 576px) {
          .price-text { font-size: 1.1rem !important; }
        }
      `}</style>
    </div>
  );
  
};

export default PaymentDetail;
