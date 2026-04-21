import React, { useContext, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Card,
  Spinner,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faFilePdf,
  faHistory,
  faTimesCircle,
  faCheckCircle,
  faPaperPlane,
  faFileSignature,
  faClock,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/CollaborationDetailModal.scss";
import moment from "moment";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";
import ContractSendModal from "./ContractSendModal";
import AWSNotifySlide from "../AWSNotifySlide";
import RocketLoad from "../../../Utils/RocketLoad";
import { toast } from "react-toastify";

const CollaborationDetailModal = ({
  show,
  onHide,
  proposal,
  isSend,
  closeReload,
}) => {
  const { User } = useContext(UserContext);
  const [isContractChoose, setisContractChoose] = useState(null);
  const [apiNotify, setApiNotify] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalState, setmodalState] = useState({
    otp: false,
    currentAction: null,
    message: "",
    contract_send: false,
  });

  const [showDetail, setShowDetail] = useState(false);

  if (!proposal) return null;

  const mappingContractContent = (htmlContent, proposal) => {
    if (!htmlContent || !proposal) return "";

    let mappedContent = htmlContent;

    const dataMap = {
      "{SENDER_COMPANY_NAME}": proposal.sender_data?.company_name || "N/A",
      "{SENDER_CONTACT_NAME}": proposal.sender_contact_name || "N/A",
      "{SENDER_CONTACT_EMAIL}": proposal.sender_contact_email || "N/A",
      "{SENDER_CONTACT_PHONE}": proposal.sender_contact_phone || "N/A",
      "{SENDER_TYPE}": proposal.sender_type || "N/A",

      "{RECEIVER_COMPANY_NAME}": proposal.receiver_company_name || "N/A",
      "{RECEIVER_CONTACT_EMAIL}": proposal.receiver_contact_email || "N/A",
      "{RECEIVER_TYPE}": proposal.receiver_type || "N/A",

      "{COLLABORATION_TYPE}": proposal.collaboration_type || "N/A",
      "{PROPOSAL_MESSAGE}": proposal.proposal_message || "",
      "{NDA_HASH}": proposal.contract_hash || "PENDING_VERIFICATION",

      "{DATE_TO_SIGN}": moment().format("DD/MM/YYYY"),
      "{ACCEPTED_AT}": proposal.accepted_at
        ? moment(proposal.accepted_at).format("DD/MM/YYYY HH:mm")
        : "N/A",
      "{BLOCKCHAIN_TX}": proposal.blockchain_tx || "WAITING_FOR_ONCHAIN",
    };

    Object.keys(dataMap).forEach((key) => {
      const regex = new RegExp(key, "g");
      const value = dataMap[key];

      mappedContent = mappedContent.replace(
        regex,
        `<span class="contract-variable">${value}</span>`,
      );
    });

    return mappedContent;
  };

  const partnerData = isSend ? proposal.receiver_data : proposal.sender_data;
  const partnerType = isSend ? proposal.receiver_type : proposal.sender_type;

  const CANCEL_MESSAGE =
    "Hành động hủy yêu cầu hợp tác này vĩnh viễn trên hệ thống. Vui lòng nhập mã PIN để xác nhận.";
  const REJECT_MESSAGE =
    "Hành động từ chối yêu cầu hợp tác này vĩnh viễn trên hệ thống. Vui lòng nhập mã PIN để xác nhận.";
  const ACCEPT_MESSAGE =
    "Để xác nhận chấp nhận hợp tác vui lòng nhập mã PIN để xác nhận.";

  const openModal = (key, actionType, message) => {
    setmodalState((prev) => ({
      ...prev,
      [key]: true,
      message: message,
      currentAction: actionType,
    }));
  };

  const closeModal = (key, reload) => {
    setmodalState((prev) => ({
      ...prev,
      [key]: false,
      currentAction: null,
      message: "",
    }));
    if (reload) closeReload();
  };

  const handleOtpSuccess = (challengeCode) => {
    switch (modalState.currentAction) {
      case "CANCEL":
        return onCancelRequest(challengeCode);
      case "REJECT":
        return onRejectRequest(challengeCode);
      case "ACCEPT":
        return onAcceptRequest(challengeCode);
      case "REJECT_CONTRACT":
        return onRejectContractTemplate(challengeCode);
      case "ACCEPT_CONTRACT":
        return onAcceptContractTemplate(challengeCode);
      case "SIGN_CONTRACT":
        return onSignContract(challengeCode);
      default:
        return false;
    }
  };

  const handleFinalSend = async (proposal_id, template) => {
    try {
      setIsProcessing(true);
      const res = await api_request.sendContractFile(
        User,
        proposal_id,
        template,
      );

      if (res && res.RC === 200) {
        toast.success(res.RM);
        setTimeout(() => closeReload(), 1500);
      } else {
        toast.error(res.RM);
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  const onSignContract = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onSignContractApi(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const onAcceptRequest = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onAcceptRequestApi(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const onRejectRequest = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onRejectRequest(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const onCancelRequest = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onCancelRequestApi(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const onRejectContractTemplate = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onRejectContractTemplateApi(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const onAcceptContractTemplate = async (challen_code) => {
    setIsProcessing(true);
    const res = await api_request.onAcceptContractTemplateApi(
      User,
      challen_code,
      proposal.id,
    );
    setIsProcessing(false);
    return res ? { RM: res.RM, RC: res.RC } : { RM: "Lỗi server", RC: 500 };
  };

  const renderCapability = () => {
    if (!partnerData) return null;
    const capacityMap = {
      MANUFACTURER: {
        label: "Production Capacity",
        unit: "units/month",
        val: partnerData.production_capacity,
      },
      TRANSPORTER: {
        label: "Fleet Size",
        unit: "vehicles",
        val: partnerData.fleet_count,
      },
      DISTRIBUTOR: {
        label: "Delivery Capacity",
        unit: "",
        val: partnerData.delivery_capacity,
      },
      RETAILER: {
        label: "Retail Network",
        unit: "Branches",
        val: partnerData.branch_count || 1,
      },
    };
    const cap = capacityMap[partnerType];
    return cap ? (
      <div className="aws-cap-item">
        <span className="label">{cap.label}</span>
        <p className="value">
          {cap.val?.toLocaleString() || "N/A"} {cap.unit}
        </p>
      </div>
    ) : null;
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={onHide}
      size="lg"
      className="aws-detail-modal"
    >
      {isProcessing && (
        <div className="aws-processing-overlay">
          <RocketLoad />
          <p className="mt-3 text-white fw-bold">
            Hệ thống đang xử lý, vui lòng đợi...
          </p>
        </div>
      )}

      <Otp_verify_dynamic
        show={modalState.otp}
        close={() => closeModal("otp")}
        title="Xác nhận danh tính"
        message={modalState.message}
        onSuccess={handleOtpSuccess}
        closeReload={() => closeModal("otp", true)}
      />

      <ContractSendModal
        closeReload={() => closeModal("contract_send", true)}
        handleClose={() => closeModal("contract_send", false)}
        show={modalState.contract_send}
        onSend={(contract) => setisContractChoose(contract)}
      />

      <Modal.Header className="aws-modal-header border-0 pb-0">
        <div className="d-flex align-items-center">
          <div
            className={`aws-icon-box me-3 ${isSend ? "bg-soft-info" : "bg-soft-primary"}`}
          >
            <FontAwesomeIcon
              icon={isSend ? faPaperPlane : faBuilding}
              className={isSend ? "text-info" : "text-primary"}
            />
          </div>
          <div>
            <Modal.Title className="h6 mb-0 fw-bold">
              {isSend
                ? "Sent Collaboration Request"
                : "Incoming Partnership Proposal"}
            </Modal.Title>
            <small className="text-muted text-uppercase x-small">
              Ref: {proposal.id}
            </small>
          </div>
        </div>
        <Button variant="close" onClick={onHide} />
      </Modal.Header>

      <Modal.Body className="aws-modal-body py-4">
        <Row>
          <Col xs={12} lg={5} className="border-end-lg mb-4 mb-lg-0">
            <h6 className="section-title mb-3">
              {isSend ? "Recipient" : "Sender"} Information
            </h6>
            <Card className="bg-light border-0 p-3 mb-3 shadow-sm">
              <div className="d-flex justify-content-between mb-2">
                <Badge bg="primary" className="aws-badge-type">
                  {partnerType}
                </Badge>
                <Badge className={`aws-badge-status ${proposal.status}`}>
                  {proposal.status.toUpperCase()}
                </Badge>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {partnerData?.company_name || "N/A"}
              </h5>
              <p className="small text-muted mb-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                {partnerData?.location ||
                  partnerData?.address ||
                  "Global Location"}
              </p>
              <div className="aws-capability-grid">
                {renderCapability()}
                <div className="aws-cap-item">
                  <span className="label">Chain Status</span>
                  <p className="value">
                    {partnerData?.chain_status || "Pending"}
                  </p>
                </div>
              </div>
            </Card>
            <div className="aws-contact-info">
              <div className="info-item">
                <FontAwesomeIcon icon={faUser} className="me-2" />{" "}
                <span>
                  {isSend ? "Contact Person" : proposal.sender_contact_name}
                </span>
              </div>
              <div className="info-item text-truncate">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />{" "}
                <span>
                  {isSend
                    ? proposal.receiver_contact_email
                    : proposal.sender_contact_email}
                </span>
              </div>
            </div>
          </Col>

          <Col xs={12} lg={7} className="ps-lg-4">
            <h6 className="section-title mb-3">Proposal Details</h6>
            <div className="aws-message-box p-3 mb-3 shadow-sm">
              <p className="fw-bold text-primary small mb-2">
                {proposal.collaboration_type}
              </p>
              <p className="aws-proposal-text mb-0 fst-italic">
                "{proposal.proposal_message}"
              </p>
            </div>
            <Row className="g-2">
              <Col xs={12} sm={6}>
                <div className="aws-file-attach p-2 border rounded d-flex align-items-center bg-white">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="text-danger me-2"
                  />
                  <a
                    href={proposal.attached_profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="small fw-bold text-truncate d-block"
                  >
                    View Profile PDF
                  </a>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="aws-file-attach p-2 border rounded d-flex align-items-center bg-white">
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="text-warning me-2"
                  />
                  <span className="small fw-bold">
                    {moment(proposal.createdAt).format("DD MMM, YYYY")}
                  </span>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light p-3">
        <Button
          variant="link"
          className="text-gray-600 me-auto"
          onClick={onHide}
        >
          Close
        </Button>
        {isSend ? (
          <>
            {proposal.status === "pending" && (
              <Button
                variant="outline-danger"
                className="aws-btn-reject"
                onClick={() => openModal("otp", "CANCEL", CANCEL_MESSAGE)}
              >
                Cancel Request
              </Button>
            )}
            {proposal.status === "accepted" && (
              <div className="d-flex gap-2">
                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() =>
                    openModal("contract_send", "CONTRACT", proposal)
                  }
                >
                  <FontAwesomeIcon
                    icon={isContractChoose ? faCheckCircle : faFileAlt}
                    className="me-2"
                  />
                  {isContractChoose
                    ? isContractChoose.template_name
                    : "Chọn mẫu"}
                </Button>
                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg"
                  disabled={!isContractChoose}
                  onClick={() => handleFinalSend(proposal.id, isContractChoose)}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" /> Gửi
                  hợp đồng
                </Button>
              </div>
            )}
            {proposal.status === "negotiating" && (
              <div className="d-flex gap-2">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                  fullscreen="sm-down"
                >
                  <Modal.Header closeButton className="border-0">
                    <Modal.Title className="h6 fw-bold">
                      Review Contract
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-2 p-md-4">
                    <div className="preview-paper shadow-sm p-3 p-md-5 bg-white mx-auto">
                      <h5 className="text-center fw-bold text-uppercase mb-4 fs-6 fs-md-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content small"
                        dangerouslySetInnerHTML={{
                          __html:
                            proposal.contract_template?.content_html ||
                            proposal.contract_template?.content,
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="border-0 bg-light">
                    <Button
                      variant="link"
                      className="text-dark"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng
                    </Button>
                    <Button variant="aws-green" className="text-white">
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Xuất
                      nháp
                    </Button>
                  </Modal.Footer>
                </Modal>
                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon
                    icon={isContractChoose ? faCheckCircle : faFileAlt}
                    className="me-2"
                  />
                  {proposal.contract_template.template_name}
                </Button>
                <Button
                  variant="outline-danger"
                  className="aws-btn-reject"
                  onClick={() => openModal("otp", "CANCEL", CANCEL_MESSAGE)}
                >
                  Cancel Request
                </Button>
                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg"
                  disabled={!isContractChoose}
                  onClick={() => handleFinalSend(proposal.id, isContractChoose)}
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Chờ phản hồi
                </Button>
              </div>
            )}
            {proposal.status === "negotiating_acp" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Chờ đối tác ký xác nhận
                </Button>
              </div>
            )}
            {proposal.status === "signing" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                  onClick={() =>
                    openModal(
                      "otp",
                      "SIGN_CONTRACT",
                      "Bằng việc xác nhận mã PIN bạn sẽ ký kết hợp đồng và tuân thủ theo các điều khoản được đưa ra, hãy xem kỹ lại hợp đồng nếu chưa chắc chắn!",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Chấp nhận & Ký kết
                </Button>
              </div>
            )}
            {proposal.status === "official" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {`Tình trạng hệ thống: ${proposal.onchain_status}`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {proposal.status === "pending" && (
              <div className="d-flex gap-2">
                <Button
                  onClick={() => openModal("otp", "REJECT", REJECT_MESSAGE)}
                  variant="outline-danger"
                >
                  Decline
                </Button>
                <Button
                  onClick={() => openModal("otp", "ACCEPT", ACCEPT_MESSAGE)}
                  variant="primary"
                  className="aws-btn-approve"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />{" "}
                  Accept & Sign
                </Button>
              </div>
            )}
            {proposal.status === "accepted" && (
              <div className="d-flex gap-2">
                <Button
                  onClick={() => openModal("otp", "REJECT", REJECT_MESSAGE)}
                  variant="outline-danger"
                >
                  Decline
                </Button>
                <Button variant="primary" className="aws-btn-approve">
                  <FontAwesomeIcon icon={faClock} className="me-2" /> Chờ đối
                  tác
                </Button>
              </div>
            )}
            {proposal.status === "negotiating" && (
              <div className="d-flex gap-2">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                  fullscreen="sm-down"
                >
                  <Modal.Header closeButton className="border-0">
                    <Modal.Title className="h6 fw-bold">
                      Review Contract
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-2 p-md-4">
                    <div className="preview-paper shadow-sm p-3 p-md-5 bg-white mx-auto">
                      <h5 className="text-center fw-bold text-uppercase mb-4 fs-6 fs-md-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content small"
                        dangerouslySetInnerHTML={{
                          __html:
                            proposal.contract_template?.content_html ||
                            proposal.contract_template?.content,
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="border-0 bg-light">
                    <Button
                      variant="link"
                      className="text-dark"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng
                    </Button>
                    <Button variant="aws-green" className="text-white">
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Xuất
                      nháp
                    </Button>
                  </Modal.Footer>
                </Modal>
                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon
                    icon={isContractChoose ? faCheckCircle : faFileAlt}
                    className="me-2"
                  />
                  {proposal.contract_template.template_name}
                </Button>
                <Button
                  onClick={() => openModal("otp", "REJECT", REJECT_MESSAGE)}
                  variant="outline-danger"
                >
                  Hủy hợp tác
                </Button>
                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg"
                  onClick={() =>
                    openModal("otp", "REJECT_CONTRACT", REJECT_MESSAGE)
                  }
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Từ chối hợp đồng
                </Button>
                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg"
                  onClick={() =>
                    openModal("otp", "ACCEPT_CONTRACT", ACCEPT_MESSAGE)
                  }
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Chấp nhận hợp đồng
                </Button>
              </div>
            )}

            {proposal.status === "negotiating_acp" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="outline-danger"
                  className="fw-bold"
                  onClick={() =>
                    openModal(
                      "otp",
                      "REJECT",
                      "Bạn đang thực hiện hủy bỏ toàn bộ yêu cầu hợp tác này.",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  Hủy hợp tác
                </Button>

                <Button
                  variant="warning"
                  className="text-white fw-bold shadow-sm"
                  onClick={() =>
                    openModal(
                      "otp",
                      "REJECT_CONTRACT",
                      "Yêu cầu đối tác gửi một bản dự thảo hợp đồng khác.",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faHistory} className="me-2" />
                  Yêu cầu mẫu khác
                </Button>
                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                  onClick={() =>
                    openModal(
                      "otp",
                      "SIGN_CONTRACT",
                      "Bằng việc xác nhận mã PIN bạn sẽ ký kết hợp đồng và tuân thủ theo các điều khoản được đưa ra, hãy xem kỹ lại hợp đồng nếu chưa chắc chắn!",
                    )
                  }
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Chấp nhận & Ký kết
                </Button>
              </div>
            )}
            {proposal.status === "signing" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Chờ đối tác ký đối xứng
                </Button>
              </div>
            )}
            {proposal.status === "official" && (
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-end">
                <Modal
                  show={showDetail}
                  onHide={() => setShowDetail(false)}
                  size="lg"
                  centered
                  className="aws-tech-modal"
                >
                  <Modal.Header closeButton>
                    <Modal.Title className="h6 fw-bold text-aws-blue">
                      Dự thảo hợp đồng chi tiết
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="bg-light p-4">
                    <div
                      className="preview-paper shadow-lg p-5 bg-white mx-auto"
                      style={{ borderTop: "5px solid #ff9900" }}
                    >
                      <h5 className="text-center fw-bold text-uppercase mb-5">
                        {proposal.contract_template?.template_name}
                      </h5>
                      <div
                        className="contract-content"
                        style={{ lineHeight: "1.8", fontSize: "14px" }}
                        dangerouslySetInnerHTML={{
                          __html: mappingContractContent(
                            proposal.contract_template?.content_html ||
                              proposal.contract_template?.content,
                            proposal,
                          ),
                        }}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowDetail(false)}
                    >
                      Đóng bản xem thử
                    </Button>
                  </Modal.Footer>
                </Modal>

                <Button
                  variant="info"
                  className="text-white fw-bold border-0 shadow-sm"
                  style={{ backgroundColor: "#0073bb" }}
                  onClick={() => setShowDetail(true)}
                >
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  Xem: {proposal.contract_template?.template_name}
                </Button>

                <Button
                  variant="aws-orange"
                  className="aws-btn-action shadow-lg fw-bold"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {`Tình trạng hệ thống: ${proposal.onchain_status}`}
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CollaborationDetailModal;
