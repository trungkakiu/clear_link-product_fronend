import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Card,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileContract,
  faMicrochip,
  faWallet,
  faSpinner,
  faClock,
  faReceipt,
  faBarcode,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";
import RocketLoad from "../../../Utils/RocketLoad";

// Import các mảnh nhỏ anh em mình vừa tách (Giả sử anh để cùng thư mục)
import OrderSidebar from "./OrderSidebar";
import PaymentSection from "./PaymentSection";
import ProductionSection from "./ProductionSection";
import PaymentDetail from "./PaymentDetail";

const BatchDetailModal = ({ show, onHide, data, API_URL }) => {
  const { User } = useContext(UserContext);

  // --- STATES QUẢN LÝ ---
  const [batchDetail, setBatchDetail] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [paymentstatus, setpaymentstatus] = useState(null);
  const [flexmodal, setflexmodal] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const [flexload, setflextload] = useState(false);

  useEffect(() => {
    const getBatchData = async () => {
      if (show && data?.Product_batch) {
        try {
          setLoadingBatch(true);
          const res = await api_request.get_batch_detail(
            User,
            data.Product_batch,
          );
          if (res?.RC === 200) setBatchDetail(res.RD);
          else setBatchDetail(null);
        } catch (error) {
          console.error("Lỗi lấy thông tin Batch:", error);
        } finally {
          setLoadingBatch(false);
        }
      }
    };
    if (show) getBatchData();
  }, [show, data?.Product_batch, User]);

  // --- LOGIC KIỂM TRA THANH TOÁN ---
  const handleCheckpayment = async () => {
    try {
      setflextload(true);
      const res = await api_request.checkpaymentstatus(
        User,
        data?.payment_code,
      );
      if (res?.RC === 200) setpaymentstatus(res.RD);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setflextload(false), 500);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: { color: "#00a854", bg: "#e6fffa", text: "Hoàn thành" },
      in_progress: { color: "#007bff", bg: "#e7f1ff", text: "Đang sản xuất" },
      pending: { color: "#ffa000", bg: "#fff7e6", text: "Đang chờ" },
      QC_passed: { color: "#52c41a", bg: "#f6ffed", text: "QC Đạt" },
      QC_failed: { color: "#ff4d4f", bg: "#fff1f0", text: "QC Không đạt" },
    };
    return configs[status] || configs.pending;
  };

  // --- ĐIỀU KIỆN HIỂN THỊ THANH TOÁN ---
  const isBankWait =
    (data?.payment_method === "BANK" &&
      data?.payment_status === "BANK_awaiting_payment") ||
    data?.payment_status === "BANK_partially_payment";

  if (!data) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="aws-order-batch-modal"
    >
      <Modal.Header closeButton className="bg-aws-navy text-white">
        <Modal.Title className="h6">
          <FontAwesomeIcon
            icon={faFileContract}
            className="me-2 text-warning"
          />
          Theo dõi tiến độ đơn hàng:{" "}
          <span className="text-aws-orange ms-1">#{data.id}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        <Row className="g-0">
          <OrderSidebar data={data} API_URL={API_URL} />

          <Col lg={8} className="p-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-800 text-main m-0 d-flex align-items-center">
                <FontAwesomeIcon
                  icon={isBankWait ? faWallet : faMicrochip}
                  className={`me-2 ${isBankWait ? "text-danger" : "text-aws-orange"}`}
                />
                {isBankWait
                  ? "XÁC NHẬN THANH TOÁN"
                  : "DỮ LIỆU VẬN HÀNH ON-CHAIN"}
              </h6>
              <Badge
                bg={isBankWait ? "danger" : "dark"}
                className="p-2 fw-normal shadow-sm"
              >
                <FontAwesomeIcon
                  icon={isBankWait ? faClock : faMicrochip}
                  className="me-1"
                />
                {isBankWait ? "Awaiting Payment" : "Real-time Data"}
              </Badge>
            </div>


            {isBankWait ? (
              <PaymentSection
                data={data}
                flexmodal={flexmodal}
                setflexmodal={setflexmodal}
                handleCheckpayment={handleCheckpayment}
                flexload={flexload}
                paymentstatus={paymentstatus}
                PaymentDetail={PaymentDetail}
                qrLoading={qrLoading}
                setQrLoading={setQrLoading}
              />
            ) : (
              <>
                {loadingBatch ? (
                  <div className="text-center py-5">
                    <RocketLoad />
                  </div>
                ) : batchDetail ? (
                  <ProductionSection
                    batchDetail={batchDetail}
                    getStatusConfig={getStatusConfig}
                  />
                ) : (
                  <div className="text-center py-5 bg-white rounded-3 border border-dashed">
                    <h5 className="text-muted">Chưa có dữ liệu sản xuất</h5>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top px-4 py-3">
        <Button
          variant="link"
          className="text-muted small fw-bold"
          onClick={onHide}
        >
          THOÁT CHẾ ĐỘ XEM
        </Button>
        <Button
          variant="aws-orange"
          className="px-4 fw-bold shadow-sm"
          disabled={!batchDetail}
        >
          XUẤT PHIẾU KIỂM ĐỊNH
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchDetailModal;
