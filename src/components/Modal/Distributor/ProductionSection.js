import React from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const ProductionSection = ({ batchDetail, getStatusConfig }) => (
  <div className="batch-status-content">
    <Row className="mb-4 g-3">
      <Col md={4}>
        <Card className="border-0 shadow-sm text-center p-3 border-top border-primary border-3">
          <label className="x-small text-muted fw-bold mb-1">Mã Lô</label>
          <code className="h6 fw-bold text-primary">{batchDetail.id}</code>
        </Card>
      </Col>
      <Col md={4}>
        <Card
          className="border-0 shadow-sm text-center p-3 border-top border-3"
          style={{ borderColor: getStatusConfig(batchDetail.status).color }}
        >
          <label className="x-small text-muted fw-bold mb-1">TRẠNG THÁI</label>
          <div>
            <Badge
              style={{
                backgroundColor: getStatusConfig(batchDetail.status).bg,
                color: getStatusConfig(batchDetail.status).color,
              }}
              className="py-2 px-3"
            >
              {getStatusConfig(batchDetail.status).text.toUpperCase()}
            </Badge>
          </div>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm text-center p-3 border-top border-danger border-3">
          <label className="x-small text-muted fw-bold mb-1 uppercase">
            Hạn hoàn thành
          </label>
          <span className="fw-bold text-dark h6">
            {moment(batchDetail.expiry_date).format("DD/MM/YYYY")}
          </span>
        </Card>
      </Col>
    </Row>

    <div className="p-4 bg-white shadow-sm rounded-3 border-start border-5 border-aws-orange mb-4">
      <div className="d-flex justify-content-between align-items-end mb-2">
        <h2 className="m-0 text-dark">
          {(
            (batchDetail.progress_quantity / batchDetail.quantity) *
            100
          ).toFixed(1)}
          %
        </h2>
        <span className="h4 fw-bold text-aws-orange">
          {batchDetail.progress_quantity?.toLocaleString()} /{" "}
          {batchDetail.quantity?.toLocaleString()} SP
        </span>
      </div>
      <ProgressBar
        now={(batchDetail.progress_quantity / batchDetail.quantity) * 100}
        variant="warning"
        animated
        style={{ height: "12px" }}
      />
    </div>

    <div className="p-4 bg-white rounded-3 shadow-sm text-start">
      <h6 className="fw-bold mb-3 border-bottom pb-2">
        <FontAwesomeIcon icon={faHistory} className="me-2 text-muted" /> Lịch sử
        vận hành
      </h6>
      <div className="small">
        <div className="mb-2">
          <span className="text-primary fw-bold">• Cập nhật mới:</span> Giai
          đoạn {getStatusConfig(batchDetail.status).text}
        </div>
        <div>
          <span className="text-muted">
            • {moment(batchDetail.manufacture_date).format("DD/MM/YYYY")}:
          </span>{" "}
          Khởi tạo lô hàng.
        </div>
      </div>
    </div>
  </div>
);

export default ProductionSection;
