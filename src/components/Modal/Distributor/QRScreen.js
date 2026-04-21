import React, { useState } from "react"; // Thêm useState để quản lý tại chỗ
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faCheckDouble,
  faClock,
  faReceipt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import {
  Image,
  Button,
  Badge,
  Col,
  Card,
  Row,
  ListGroup,
} from "@themesberg/react-bootstrap";
import FlexibleModal from "../FlexibleModal";
import PaymentDetail from "./PaymentDetail";

const QRScreen = ({
  createdOrder,
  payNow,
  setflexmodal,
  flexmodal,
  handleCheckpayment,
  flexload,
  paymentstatus,
}) => {
  const [localQrLoading, setLocalQrLoading] = useState(true);

  return (
    <div className="p-3 text-center">
      <FlexibleModal
        isOpen={flexmodal}
        onClose={() => setflexmodal(false)}
        onConfirm={handleCheckpayment}
        buttonText="Cập nhật"
        isLoading={flexload}
        showFooter={paymentstatus?.status !== "paid"}
        title="Chi tiết giao dịch"
        type={paymentstatus?.status === "paid" ? "success" : "info"}
      >
        <PaymentDetail data={paymentstatus} />
      </FlexibleModal>
      <div className="alert alert-soft-warning border-start border-4 border-warning text-start mb-3 shadow-xs">
        <div className="d-flex small">
          <FontAwesomeIcon icon={faClock} className="text-warning me-2 mt-1" />
          <div>
            <strong className="text-warning">ĐƠN HÀNG CHỜ THANH TOÁN</strong>
            <br />
            Mã đơn: <b className="text-dark">{createdOrder}</b>
          </div>
        </div>
      </div>

      <div
        className="p-3 border border-2 border-dashed d-inline-block rounded-lg mb-3 bg-white shadow-sm"
        style={{ minWidth: "220px", minHeight: "220px", position: "relative" }}
      >
        {localQrLoading && (
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div
              className="spinner-border spinner-border-sm text-primary mb-2"
              role="status"
            ></div>
            <div className="small text-muted">Đang tạo mã...</div>
          </div>
        )}
        <Image
          src={`https://img.vietqr.io/image/BIDV-96247R3CT5-compact.jpg?amount=${payNow}&addInfo=${encodeURIComponent(createdOrder)}&accountName=DO%20DANG%20CHUNG`}
          style={{
            width: "200px",
            height: "200px",
            display: localQrLoading ? "none" : "block",
          }}
          onLoad={() => setLocalQrLoading(false)}
        />
      </div>

      <div
        className="bg-light p-3 rounded text-start mx-auto border mb-3"
        style={{ maxWidth: "400px" }}
      >
        <div className="d-flex justify-content-between mb-1 small text-muted">
          Số tiền: <b className="text-danger">{payNow?.toLocaleString()}đ</b>
        </div>
        <div className="d-flex justify-content-between small text-muted">
          Nội dung: <b className="text-primary">{createdOrder}</b>
        </div>
      </div>

      <Button
        variant="outline-primary"
        size="sm"
        className="rounded-pill px-4"
        onClick={() => setflexmodal(true)}
      >
        <FontAwesomeIcon icon={faSearch} className="me-2" /> Kiểm tra trạng thái
      </Button>
    </div>
  );
};

export default QRScreen;
