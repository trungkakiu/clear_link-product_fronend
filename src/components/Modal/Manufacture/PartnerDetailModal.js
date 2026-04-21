import React, { useContext, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Card,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faPhone,
  faUser,
  faCertificate,
  faIndustry,
  faMapMarkerAlt,
  faStar,
  faTimes,
  faEnvelopeOpenText,
  faCheckDecal,
  faCircleNotch,
  faDotCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/PartnerDetailModal.scss";
import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import SendProposalModal from "./SendProposalModal";
import { UserContext } from "../../../Context/UserContext";

const PartnerDetailModal = ({ show, close, partner, API_URL }) => {
  const [modalState, setModalState] = useState({
    proposal: false,
  });
  const [modelData, setmodalData] = useState({
    proposal: null,
  });
  const { User } = useContext(UserContext);

  const openModal = (key, data) => {
    setModalState((prev) => ({
      ...prev,
      [key]: true,
    }));
    setmodalData((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const closeModal = (key) => {
    setModalState((prev) => ({
      ...prev,
      [key]: false,
    }));
    setmodalData((prev) => ({
      ...prev,
      [key]: null,
    }));
  };
  if (!partner) return null;

  const info =
    partner.manufacturer_info ||
    partner.distributor_info ||
    partner.retailer_info ||
    partner.transporter_info;
  const name = info?.company_name || "Doanh nghiệp đối tác";

  return (
    <Modal
      show={show}
      onHide={close}
      size="xl"
      centered
      className="aws-custom-modal"
    >
      <SendProposalModal
        close={() => closeModal("proposal")}
        partner={partner}
        show={modalState.proposal}
        senderInfo={modalState.data}
        onSend={() => {}}
      />
      <div className="modal-hero-header">
        <div
          className="banner-image"
          style={{
            backgroundImage: `url(${partner.banner_url ? `${API_URL}Sector-banner/${partner.banner_url}` : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"})`,
          }}
        >
          <div className="banner-overlay"></div>
        </div>
        <Button variant="close" className="btn-close-white" onClick={close} />

        <div className="floating-logo-container">
          <img
            src={
              partner.logo_url
                ? `${API_URL}Sector-logo/${partner.logo_url}`
                : `https://ui-avatars.com/api/?name=${name}`
            }
            alt="Company Logo"
            className="company-logo-main"
          />
        </div>
      </div>

      <Modal.Body className="aws-modal-content px-4 px-md-5">
        <Row>
          <Col lg={8} className="pe-lg-5">
            <div className="header-text-block">
              <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                <h2 className="company-title-detailed">{name}</h2>
                {partner.is_active_market && (
                  <Badge
                    className={
                      info.chain_status === "active"
                        ? "badge-verified"
                        : "badge-notverifed"
                    }
                  >
                    <FontAwesomeIcon
                      icon={
                        info.chain_status === "active"
                          ? faCheckCircle
                          : faDotCircle
                      }
                      className="me-1"
                    />{" "}
                    {info.chain_status === "active"
                      ? "Xác thực đối tác"
                      : "Đối tác chưa xác thực"}
                  </Badge>
                )}
              </div>
              <p className="slogan-text text-primary">
                “{partner.slogan || "Building excellence through innovation."}”
              </p>
            </div>

            <hr className="divider-minimal" />

            <section className="detail-section">
              <h6 className="detail-label">
                <FontAwesomeIcon icon={faEnvelopeOpenText} className="me-2" />
                Giới thiệu doanh nghiệp
              </h6>
              <p className="description-body">
                {partner.description ||
                  "Nội dung giới thiệu chi tiết đang được cập nhật..."}
              </p>
            </section>

            <Row className="g-4 mt-2">
              <Col md={6}>
                <div className="detail-card-item h-100">
                  <h6 className="card-label">
                    <FontAwesomeIcon icon={faIndustry} className="me-2" /> Năng
                    lực vận hành
                  </h6>
                  <div className="card-data-grid">
                    <div className="data-row">
                      <span>Mã số thuế:</span>{" "}
                      <strong>{info?.tax_code || "---"}</strong>
                    </div>
                    <div className="data-row">
                      <span>Giấy phép:</span>{" "}
                      <strong>{info?.license_number || "---"}</strong>
                    </div>
                    <div className="data-row">
                      <span>Công suất:</span>{" "}
                      <strong>
                        {info?.production_capacity || "100+"} sản phẩm/tháng
                      </strong>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-card-item h-100">
                  <h6 className="card-label">
                    <FontAwesomeIcon icon={faCertificate} className="me-2" />{" "}
                    Chứng chỉ & Cam kết
                  </h6>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge bg="dark" className="badge-tag">
                      {info?.certifications}
                    </Badge>
                    {info?.chain_status === "active" && (
                      <Badge bg="success" className="badge-tag">
                        Bền vững On-chain
                      </Badge>
                    )}

                    {partner.is_oem_ready && (
                      <Badge bg="primary" className="badge-tag">
                        OEM Ready
                      </Badge>
                    )}
                  </div>
                  <p className="cert-note">
                    {info?.certifications ||
                      "Đã kiểm định năng lực sản xuất chuẩn quốc tế."}
                  </p>
                </div>
              </Col>
            </Row>
          </Col>

          <Col lg={4} className="mt-4 mt-lg-0">
            <div className="sticky-info-panel">
              <Card className="contact-card shadow-sm border-0">
                <Card.Body className="p-4">
                  <h6 className="panel-label mb-3">Thông tin liên hệ</h6>
                  <div className="contact-item">
                    <div className="icon-circle">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                    <div className="contact-info">
                      <span className="label">Văn phòng/Nhà máy</span>
                      <span className="value">
                        {info?.location || "Địa chỉ chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="icon-circle">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="contact-info">
                      <span className="label">Người đại diện</span>
                      <span className="value">
                        {info?.contact_person || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="icon-circle">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <div className="contact-info">
                      <span className="label">Số điện thoại</span>
                      <span className="value">
                        {info?.contact_phone || "Đã xác thực"}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={
                      info.id === User.data.company_id
                        ? ""
                        : () => openModal("proposal")
                    }
                    variant="primary"
                    disabled={info.id === User.data.company_id}
                    className="btn-aws-primary w-100 mt-4"
                  >
                    {info.id === User.data.company_id
                      ? "Công ty của bạn"
                      : "Gửi lời mời hợp tác"}
                  </Button>
                </Card.Body>
              </Card>

              <div className="stats-container-modern mt-3">
                <div className="stat-box">
                  <span className="stat-value">
                    {partner.rating_avg}{" "}
                    <FontAwesomeIcon icon={faStar} className="star-icon" />
                  </span>
                  <span className="stat-label">Đánh giá</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{partner.total_deals}</span>
                  <span className="stat-label">Giao dịch</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default PartnerDetailModal;
