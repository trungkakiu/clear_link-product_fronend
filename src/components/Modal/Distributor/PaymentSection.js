import React from "react";
import { Button, FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import FlexibleModal from "../FlexibleModal";
import { Image } from "@themesberg/react-bootstrap";

const PaymentSection = ({
  data,
  flexmodal,
  setflexmodal,
  handleCheckpayment,
  flexload,
  paymentstatus,
  qrLoading,
  setQrLoading,
  PaymentDetail,
}) => (
  <div className="p-4 text-center bg-white rounded-3 shadow-sm border">
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

    <div className="alert alert-soft-warning border-start border-4 border-warning text-start mb-4 shadow-xs">
      <div className="d-flex small text-warning">
        <FontAwesomeIcon icon={faClock} className="me-2 mt-1" />
        <div>
          <strong className="d-block">CHỜ THANH TOÁN</strong>
          Nội dung: <b className="text-dark">{data.payment_code}</b>. Quét mã QR
          để tiếp tục.
        </div>
      </div>
    </div>

    <div
      className="p-3 border border-2 border-dashed d-inline-block rounded-3 mb-3 bg-white shadow-sm"
      style={{ minHeight: "220px" }}
    >
      {qrLoading && (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ height: "200px", width: "200px" }}
        >
          <div className="spinner-border text-primary mb-2" />
          <small className="text-muted">Đang tạo mã QR...</small>
        </div>
      )}
      <Image
        src={`https://img.vietqr.io/image/BIDV-96247R3CT5-compact.jpg?amount=${Number(data?.minimum_payment_to_start)}&addInfo=${encodeURIComponent(data.payment_code)}&accountName=DO%20DANG%20CHUNG`}
        onLoad={() => setQrLoading(false)}
        style={{
          width: "200px",
          height: "200px",
          display: qrLoading ? "none" : "block",
        }}
      />
    </div>

    <div
      className="bg-light p-3 rounded-3 text-start mx-auto border mb-3"
      style={{ maxWidth: "400px" }}
    >
      <div className="d-flex justify-content-between mb-2 small text-muted">
        Số tiền cọc:{" "}
        <b className="text-danger">
          {Number(data?.minimum_payment_to_start).toLocaleString()}đ
        </b>
      </div>
      <div className="d-flex justify-content-between small text-muted">
        Nội dung: <b className="text-primary">{data.payment_code}</b>
      </div>
    </div>

    <button
      onClick={() => setflexmodal(true)}
      className="btn btn-outline-primary btn-sm rounded-pill px-4"
    >
      <FontAwesomeIcon icon={faSearch} className="me-2" /> Kiểm tra trạng thái
    </button>
  </div>
);

export default PaymentSection;
