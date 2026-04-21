import React from "react";
import {
  Modal,
  Row,
  Col,
  Badge,
  Image,
  ListGroup,
  Button,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCube,
  faUser,
  faMoneyBillWave,
  faHandshake,
  faCheckCircle,
  faClock,
  faBuilding,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/OrderDetailModal.scss";

const OrderDetailModal = ({ show, onHide, data, onAccept }) => {
  if (!data) return null;

  const getPaymentStatus = (status) => {
    const configs = {
      BANK_awaiting_payment: {
        text: "Chờ thanh toán",
        bg: "bg-soft-warning",
        color: "text-warning",
        icon: faClock,
      },
      paid: {
        text: "Đã thanh toán",
        bg: "bg-soft-success",
        color: "text-success",
        icon: faCheckCircle,
      },
    };
    const cfg = configs[status] || configs.BANK_awaiting_payment;
    return (
      <Badge className={`${cfg.bg} ${cfg.color} px-3 py-2 border-0`}>
        <FontAwesomeIcon icon={cfg.icon} className="me-2" /> {cfg.text}
      </Badge>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="aws-collaboration-modal"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="h6 d-flex align-items-center">
          <div className="icon-aws-sm me-2">
            <FontAwesomeIcon icon={faHandshake} />
          </div>
          Chi tiết hợp tác sản xuất
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* SECTION 1: HEADER INFO */}
        <div className="header-banner p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center shadow-soft">
          <div>
            <div className="text-muted extra-small text-uppercase fw-bold">
              Mã định danh (Batch)
            </div>
            <h5 className="mb-0 text-aws-navy ">{data.Product_batch}</h5>
          </div>
          <div className="text-end">
            {getPaymentStatus(data.payment_status)}
          </div>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <div className="aws-card p-3 mb-3 h-100">
              <label className="section-label">
                <FontAwesomeIcon icon={faCube} className="me-2" />
                Thông tin sản phẩm
              </label>
              <div className="d-flex mt-2">
                <Image
                  src={`http://192.168.1.6:5099/main-card/${data.product_pinner?.main_cardimage}`}
                  className="rounded-2 shadow-sm"
                  width={100}
                  height={100}
                  style={{ objectFit: "cover" }}
                />
                <div className="ms-3 flex-grow-1">
                  <h6 className="fw-bold mb-1">{data.product_pinner?.name}</h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small text-muted">Số lượng đặt:</span>
                    <strong className="text-dark">
                      {data.Quantity.toLocaleString()} sp
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Đơn giá:</span>
                    <strong className="text-primary">
                      {Number(data.product_pinner?.price).toLocaleString()}đ
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={5}>
            <div className="aws-card p-3 h-100 bg-soft-primary">
              <label className="section-label">
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                Đối tác yêu cầu
              </label>
              <div className="d-flex align-items-center mt-2">
                <Image
                  src={`http://192.168.1.6:5099/Company-logo/${data.partner_info?.logo}`}
                  roundedCircle
                  width={50}
                  height={50}
                  style={{ objectFit: "cover" }}
                  className="border bg-white p-1 me-2"
                />
                <div className="ms-3">
                  <div className="fw-bold text-aws-navy lh-1 mb-1">
                    {data.partner_info?.company_name}
                  </div>
                  <small className="text-muted">
                    <FontAwesomeIcon icon={faUser} size="xs" className="me-1" />
                    {data.partner_info?.contact_person}
                  </small>
                </div>
              </div>
            </div>
          </Col>

          {/* SECTION 2: TÀI CHÍNH & TIẾN ĐỘ */}
          <Col xs={12}>
            <div className="aws-card p-3 bg-light border-0">
              <Row className="text-center g-0">
                <Col xs={4} className="border-end">
                  <div className="extra-small text-muted text-uppercase fw-bold">
                    Tổng thanh toán
                  </div>
                  <div className="h5 text-danger mb-0">
                    {Number(data.total_price).toLocaleString()}đ
                  </div>
                </Col>
                <Col xs={4} className="border-end px-2">
                  <div className="extra-small text-muted text-uppercase fw-bold">
                    Ngày bắt đầu
                  </div>
                  <div className="fw-bold text-aws-navy">
                    {new Date(data.Start_date).toLocaleDateString()}
                  </div>
                </Col>
                <Col xs={4} className="px-2">
                  <div className="extra-small text-muted text-uppercase fw-bold">
                    Ngày hoàn thành
                  </div>
                  <div className="fw-bold text-aws-navy">
                    {new Date(data.End_date).toLocaleDateString()}
                  </div>
                </Col>
              </Row>
            </div>
          </Col>

          {/* SECTION 3: BILLS & NOTES */}
          <Col xs={12}>
            <div className="aws-card p-3">
              <label className="section-label mb-3 d-flex justify-content-between align-items-center">
                <span>
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-2" />
                  Lịch sử hóa đơn
                </span>
                <span className="extra-small text-muted font-monospace">
                  Code: {data.payment_code}
                </span>
              </label>
              <ListGroup className="list-group-flush small">
                {data.bills?.map((bill) => (
                  <ListGroup.Item
                    key={bill.id}
                    className="px-0 d-flex justify-content-between align-items-center border-bottom-dashed"
                  >
                    <div>
                      <Image
                        src={`http://192.168.1.6:5099/User-avatar/${bill.payer?.avatar}`}
                        roundedCircle
                        width={50}
                        height={50}
                        style={{ objectFit: "cover" }}
                        className="border bg-white p-1 me-2"
                      />
                      <strong>{bill.payer?.name}</strong>{" "}
                      <span className="text-muted">đã nộp đơn xác thực</span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">
                        {Number(bill.amount_expected).toLocaleString()}đ
                      </div>
                      <small className="text-muted">
                        {new Date(bill.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0 pb-4 justify-content-center">
        <Button variant="outline-secondary" onClick={onHide} className="px-4">
          Đóng
        </Button>
        {data.payment_status === "BANK_awaiting_payment" && (
          <Button
            variant="warning"
            className="btn-aws-orange text-white border-0 px-4 fw-bold"
            onClick={onAccept}
          >
            Xác nhận thanh toán
          </Button>
        )}
        {data.status === "active" && (
          <Button
            disabled
            variant="info"
            className="btn-aws-orange text-white border-0 px-4 fw-bold"
          >
            Đang sản xuất
          </Button>
        )}
        {data.status !== "active" && (
          <Button
            onClick={onAccept}
            variant="primary"
            className="btn-aws px-4 shadow-soft"
          >
            Xác nhận sản xuất
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetailModal;
