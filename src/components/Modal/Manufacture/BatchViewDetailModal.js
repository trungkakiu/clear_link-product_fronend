import React, { useContext, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Image,
  ProgressBar,
  Card,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faHistory,
  faUserShield,
  faBox,
  faCheckCircle,
  faTimesCircle,
  faLink,
  faWeightHanging,
  faBoxes,
  faTruckLoading,
  faSync,
  faQrcode,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/BatchViewDetail.scss";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import QrBatchDisplayModal from "./QrBatchDisplayModal";

const BatchViewDetailModal = ({ show, onHide, batch, closeReload }) => {
  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");
  const progressPercent = Math.round(
    (batch?.progress_quantity / batch?.quantity) * 100,
  );
  const { User } = useContext(UserContext);
  const [modalstate, setmodalstate] = useState(false);
  const [Qrmodalstate, setQrmodalstate] = useState(false);

  if (!batch) return null;
  const reupdateBatch = async (challenge_code) => {
    try {
      const res = await api_request.reupdateBatchAPI(
        User,
        challenge_code,
        batch.id,
      );
      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    }
  };

  const boxesPerPallet =
    Math.round(batch?.total_box / batch?.total_pallet) || 0;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="aws-view-modal"
    >
      <Modal.Header closeButton className="bg-aws-navy text-white border-0">
        <Modal.Title className="h6 mb-0">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="me-2 text-aws-orange"
          />
          CHI TIẾT LÔ HÀNG:{" "}
          <span className="text-aws-orange ms-1">{batch.id}</span>
        </Modal.Title>
      </Modal.Header>

      <QrBatchDisplayModal
        onHide={() => setQrmodalstate(false)}
        show={Qrmodalstate}
        qrCodes={batch.Qr_codes}
        targetId={batch.id}
        closeReload={() => {
          setQrmodalstate(false);
          closeReload();
        }}
      />

      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => {
          setmodalstate(false);
          closeReload();
        }}
        message={"Xác nhận PIN để cập nhật lại thông tin lô sản phẩm"}
        onSuccess={(challenge_code) => {
          return reupdateBatch(challenge_code);
        }}
        show={modalstate}
        title={"PIN VERIFY"}
      />
      <Modal.Body className="p-0 bg-light">
        {/* BANNER TRẠNG THÁI & LOGISTICS STATUS */}
        <div className="status-banner d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center">
              <div className={`status-dot me-2 ${batch.status}`}></div>
              <span className="fw-bold text-uppercase small text-aws-navy">
                {batch.status}
              </span>
            </div>
            <Badge
              bg={batch.is_boxed ? "success" : "warning"}
              className="text-uppercase"
            >
              <FontAwesomeIcon icon={faBox} className="me-1" />
              {batch.is_boxed ? "Đã đóng thùng" : "Chưa đóng thùng"}
            </Badge>
          </div>
          <div className="text-muted small">
            <FontAwesomeIcon icon={faHistory} className="me-1" />{" "}
            {formatDate(batch.updatedAt)}
          </div>
        </div>

        <div className="p-4">
          <Row>
            <Col md={7}>
              {/* THÔNG TIN SẢN XUẤT */}
              <Card className="border-0 shadow-sm mb-3">
                <Card.Body>
                  <h6 className="section-title mb-3 text-aws-navy">
                    Thông tin sản xuất
                  </h6>
                  <div className="d-flex gap-3 mb-4">
                    <Image
                      src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${batch.product?.main_cardimage}`}
                      className="product-img-detail border rounded"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h5 className="mb-1 fw-800 text-dark">
                        {batch.product?.name}
                      </h5>
                      <div className="text-muted small">
                        Lô: <span className="fw-bold">{batch.batch_name}</span>
                      </div>
                      <Badge bg="light" className="text-primary border mt-2">
                        {batch.Department?.partname}
                      </Badge>
                    </div>
                  </div>

                  <div className="production-progress">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-bold">Tiến độ sản xuất</span>
                      <span className="small fw-bold text-primary">
                        {progressPercent}%
                      </span>
                    </div>
                    <ProgressBar
                      now={progressPercent}
                      className="aws-progress mb-2"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>
                        Thực tế:{" "}
                        <b>{batch.progress_quantity?.toLocaleString()}</b>
                      </span>
                      <span>
                        Kế hoạch: <b>{batch.quantity?.toLocaleString()}</b>
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* THÔNG SỐ LOGISTICS & VẬN TẢI - PHẦN MỚI THÊM */}
              <Card className="border-0 shadow-sm mb-3 bg-white">
                <Card.Body>
                  <h6 className="section-title mb-3 text-aws-orange">
                    <FontAwesomeIcon icon={faTruckLoading} className="me-2" />
                    Thông số Logistics & Vận tải
                  </h6>
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="p-2 border rounded bg-light">
                        <div className="tiny text-muted text-uppercase fw-bold">
                          Trọng lượng SP
                        </div>
                        <div className="fw-bold text-aws-navy">
                          <FontAwesomeIcon
                            icon={faWeightHanging}
                            className="me-1 text-muted small"
                          />
                          {batch.weight_per_unit} <small>kg/sp</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-2 border rounded bg-light">
                        <div className="tiny text-muted text-uppercase fw-bold">
                          Tổng trọng lượng
                        </div>
                        <div className="fw-bold text-danger">
                          {batch.total_weight} <small>kg</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-2 border rounded bg-light">
                        <div className="tiny text-muted text-uppercase fw-bold">
                          Tổng số Box (Thùng)
                        </div>
                        <div className="fw-bold text-aws-navy">
                          <FontAwesomeIcon
                            icon={faBoxes}
                            className="me-1 text-aws-orange small"
                          />
                          {batch.total_box} <small>thùng</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="p-2 border rounded bg-aws-light-orange border-aws-orange">
                        <div className="tiny text-aws-orange text-uppercase fw-bold">
                          Dự kiến Pallet
                        </div>
                        <div className="fw-bold text-aws-navy">
                          {batch.total_pallet}{" "}
                          <small>kệ ({boxesPerPallet} box/pallet)</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className="p-2 border rounded bg-aws-light-orange border-aws-orange">
                        <div className="tiny text-aws-orange text-uppercase fw-bold">
                          Mẫu thùng đựng
                        </div>
                        <div className="fw-bold text-aws-navy">
                          {batch?.boxed?.pack_code}{" "}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col md={5}>
              <div className="info-group mb-4">
                <h6 className="section-title-sm mb-3">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" />
                  Nhân sự xác thực
                </h6>

                <div className="aws-person-profile mb-3">
                  <div className="label-top mb-1 small text-muted">
                    Nhân viên QC:
                  </div>
                  {batch.QC ? (
                    <div className="d-flex align-items-center p-2 rounded bg-white border shadow-xs">
                      <Image
                        src={`${process.env.REACT_APP_API_IMAGE_URL}User-avatar/${batch.QC.avatar}`}
                        roundedCircle
                        className="me-3 border"
                        style={{ width: 42, height: 42, objectFit: "cover" }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-bold text-aws-navy small">
                          {batch.QC.name}
                        </div>
                        <div className="extra-small text-muted text-truncate">
                          {batch.QC.email}
                        </div>
                        <div className="extra-small text-aws-orange fw-bold">
                          {batch.QC.phone_number}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-2 rounded border border-dashed bg-light small italic text-muted">
                      Chưa có QC xác nhận
                    </div>
                  )}
                </div>

                <div className="aws-person-profile">
                  <div className="label-top mb-1 small text-muted">
                    Quản lý duyệt:
                  </div>
                  {batch.QC_manager ? (
                    <div className="d-flex align-items-center p-2 rounded bg-white border shadow-xs">
                      {/* Render tương tự QC */}
                    </div>
                  ) : (
                    <div className="text-center p-2 rounded border border-dashed bg-light small italic text-muted">
                      Chờ quản lý phê duyệt...
                    </div>
                  )}
                </div>
              </div>

              <div className="info-group">
                <h6 className="section-title-sm mb-3">
                  <FontAwesomeIcon icon={faLink} className="me-2" />
                  Blockchain Metadata
                </h6>
                <div className="blockchain-card p-3 rounded bg-aws-navy text-white">
                  <div className="mb-2">
                    <div className="extra-small text-muted-light text-uppercase">
                      Mã định danh lô hàng
                    </div>
                    <div className="small fw-bold text-truncate text-aws-orange">
                      {batch.id}
                    </div>
                  </div>
                  <div>
                    <div className="extra-small text-muted-light text-uppercase">
                      Trạng thái On-chain
                    </div>
                    <Badge
                      className={`w-100 mt-1 aws-chain-badge ${batch.status === "completed" ? "bg-success" : "bg-warning text-dark"}`}
                    >
                      {batch.status === "completed"
                        ? "VERIFIED ON-CHAIN"
                        : "WAITING FOR SYNC"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-0 p-4 d-flex justify-content-between align-items-center">
        {/* Nhóm nút vận hành bên trái */}
        <div className="d-flex gap-2">
          <Button
            variant="warning"
            className="btn-aws-action shadow-sm"
            onClick={() => setQrmodalstate(true)}
          >
            <FontAwesomeIcon icon={faQrcode} className="me-2" />
            QR Kiểm soát
          </Button>

          {!["completed", "pending", "pairing"].includes(batch.status) && (
            <Button
              variant="outline-secondary"
              className="btn-aws-update shadow-sm"
              onClick={() => setmodalstate(true)}
            >
              <FontAwesomeIcon icon={faSync} className="me-2" />
              Cập nhật lại thông số
            </Button>
          )}
        </div>

        {/* Nhóm nút kết thúc bên phải */}
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="link"
            className="text-muted fw-bold text-decoration-none btn-close-modal"
            onClick={onHide}
          >
            Đóng
          </Button>

          <Button className="btn-aws-navy px-4 py-2 shadow-sm" onClick={onHide}>
            <FontAwesomeIcon icon={faFilePdf} className="me-2 text-warning" />
            Xuất báo cáo (PDF)
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchViewDetailModal;
