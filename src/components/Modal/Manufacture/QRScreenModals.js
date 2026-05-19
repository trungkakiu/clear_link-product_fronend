import React, { useState, useContext, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSearch,
  faQrcode,
  faCheckCircle,
  faMoneyBillWave,
  faBoxOpen,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {
  Image,
  Button,
  Modal,
  Spinner,
  Row,
  Col,
  Badge,
} from "@themesberg/react-bootstrap";
import FlexibleModal from "../FlexibleModal";
import PaymentDetail from "../Distributor/PaymentDetail";
import { UserContext } from "../../../Context/UserContext";
import api_request from "../../../apicontroller/api_request";

const QRScreenModals = ({ show = false, onClose, order = {} }) => {
  const { User } = useContext(UserContext);
  const [innerModal, setInnerModal] = useState(false);

  const [checkingIds, setCheckingIds] = useState({});
  const [paymentStatusData, setPaymentStatusData] = useState(null);

  const [localPaidStatus, setLocalPaidStatus] = useState({});

  const payableItems = useMemo(() => {
    if (!order || !show) return [];

    const items = [];
    const myCompanyId = User?.data?.company_id;

    if (order.Ship_pay_bill && order.Ship_pay_bill.payer_id === myCompanyId) {
      items.push({
        ...order.Ship_pay_bill,
        _title: "PHÍ VẬN CHUYỂN",
        _subtitle: `Vận đơn: ${order.id}`,
        _icon: faTruck,
        _type: "shipping",
      });
    }

    if (order.batches && order.batches.length > 0) {
      order.batches.forEach((batch) => {
        const pOrder = batch.Pinned_order;
        if (pOrder && pOrder.bills) {
          const bill = Array.isArray(pOrder.bills)
            ? pOrder.bills[0]
            : pOrder.bills;
          if (bill && bill.payer_id === myCompanyId) {
            items.push({
              ...bill,
              _title: `TIỀN HÀNG: ${batch.batch_name}`,
              _subtitle: `Mã lô: ${batch.id.substring(0, 12)}...`,
              _icon: faBoxOpen,
              _type: "batch",
            });
          }
        }
      });
    }

    return items;
  }, [order, show, User?.data?.company_id]);

  const handleCheckpayment = async (payment_code) => {
    if (!show || !payment_code) return null;

    try {
      setCheckingIds((prev) => ({ ...prev, [payment_code]: true }));
      const res = await api_request.checkpaymentstatus(User, payment_code);

      if (res?.RC === 200) {
        setPaymentStatusData(res.RD);

        if (
          res.RD.status === "paid" ||
          res.RD.status === "completed" ||
          res.RD.status === "complated"
        ) {
          setLocalPaidStatus((prev) => ({ ...prev, [payment_code]: true }));
        }
        return res.RD;
      } else {
        console.warn("API không tìm thấy giao dịch:", res);
      }
    } catch (error) {
      console.error(">>> Check Payment Error:", error);
    } finally {
      setTimeout(() => {
        setCheckingIds((prev) => ({ ...prev, [payment_code]: false }));
      }, 500);
    }
  };

  const onManualCheck = async (payment_code) => {
    if (checkingIds[payment_code]) return;
    const result = await handleCheckpayment(payment_code);
    if (result) {
      setInnerModal(true);
    }
  };

  if (!order || payableItems.length === 0) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        centered
        size="lg"
        className="qr-payment-modal"
        backdrop="static"
      >
        <Modal.Header className="bg-aws-navy text-white border-0 py-3">
          <Modal.Title className="h6 mb-0 fw-bold d-flex align-items-center">
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              className="me-2 text-aws-orange"
            />
            THANH TOÁN GIAO DỊCH
          </Modal.Title>
          <Button
            variant="close"
            onClick={onClose}
            className="btn-close-white shadow-none"
            disabled={Object.values(checkingIds).some(Boolean)}
          />
        </Modal.Header>

        <Modal.Body
          className="px-4 pb-4 pt-4 bg-light"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <div className="mb-4 text-center">
            <h5 className="fw-bold text-aws-navy mb-1">
              Quét mã QR để thanh toán
            </h5>
            <p className="text-muted small">
              Bạn có thể chọn thanh toán từng khoản hoặc nhờ Kế toán quét từng
              mã.
            </p>
          </div>

          <Row className="g-4">
            {payableItems.map((item, index) => {
              const isPaid =
                localPaidStatus[item.payment_code] ||
                ["paid", "completed", "complated"].includes(item.status);

              const isCheckingThis = checkingIds[item.payment_code];

              return (
                <Col md={6} key={item.id || index}>
                  <div className="bg-white rounded-20 p-3 shadow-sm border border-light h-100 d-flex flex-column">
                    {/* Header Card */}
                    <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
                      <div>
                        <div
                          className=" text-aws-navy fw-bold"
                          style={{ fontSize: "14px" }}
                        >
                          <FontAwesomeIcon
                            icon={item._icon}
                            className="me-2 text-muted"
                          />
                          {item._title}
                        </div>
                        <div className="extra-small text-muted mt-1">
                          {item._subtitle}
                        </div>
                      </div>
                      <Badge
                        bg={isPaid ? "success" : "warning"}
                        className="text-uppercase shadow-none"
                      >
                        {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
                      </Badge>
                    </div>

                    {isPaid ? (
                      <div className="text-center py-4 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          size="3x"
                          className="text-success mb-3 opacity-75"
                        />
                        <h5 className="fw-bold text-success mb-1">
                          Giao dịch hoàn tất
                        </h5>
                        <div className="text-muted small">
                          Hóa đơn này đã được đối soát.
                        </div>
                      </div>
                    ) : (
                      <div className="text-center flex-grow-1 d-flex flex-column">
                        <div className="mb-2">
                          <span className="text-danger fw-900 fs-4">
                            {Number(item.amount_expected || 0).toLocaleString(
                              "vi-VN",
                            )}{" "}
                            <small className="text-muted fs-6">VNĐ</small>
                          </span>
                        </div>

                        <div
                          className="qr-container mx-auto p-2 border-2 border-dashed rounded-12 mb-3 bg-white"
                          style={{
                            border: "2px dashed #e9ecef",
                            width: "200px",
                            height: "200px",
                          }}
                        >
                          {item.payment_code && (
                            <Image
                              src={`https://img.vietqr.io/image/BIDV-96247R3CT5-compact.jpg?amount=${item.amount_expected}&addInfo=${encodeURIComponent(item.payment_code)}&accountName=DO%20DANG%20CHUNG`}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "8px",
                              }}
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3 small">
                          <span className="text-muted">Nội dung CK:</span>
                          <span className="fw-bold text-primary">
                            {item.payment_code || "N/A"}
                          </span>
                        </div>

                        <Button
                          variant="outline-primary"
                          className="w-100 py-2 rounded-pill fw-bold mt-auto"
                          onClick={() => onManualCheck(item.payment_code)}
                          disabled={isCheckingThis || !item.payment_code}
                        >
                          {isCheckingThis ? (
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faSearch} className="me-2" />
                          )}
                          {isCheckingThis
                            ? "ĐANG KIỂM TRA..."
                            : "KIỂM TRA GIAO DỊCH"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
      </Modal>

      <FlexibleModal
        isOpen={innerModal}
        onClose={() => setInnerModal(false)}
        onConfirm={() => handleCheckpayment(paymentStatusData?.payment_code)}
        buttonText="Cập nhật lại"
        isLoading={Object.values(checkingIds).some(Boolean)}
        showFooter={paymentStatusData?.status !== "paid"}
        title="Kết quả giao dịch"
        type={paymentStatusData?.status === "paid" ? "success" : "info"}
      >
        <PaymentDetail data={paymentStatusData} />
      </FlexibleModal>

      <style>{`
        .qr-payment-modal .modal-content { border-radius: 16px; border: none; overflow: hidden; }
        .rounded-12 { border-radius: 12px; }
        .rounded-20 { border-radius: 20px; }
        .fw-800 { font-weight: 800; }
        .fw-900 { font-weight: 900; }
      `}</style>
    </>
  );
};

export default React.memo(QRScreenModals);
