import React, { useContext, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faShieldAlt,
  faInfoCircle,
  faFileSignature,
  faAddressCard,
  faTrashAlt,
  faFileUpload,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/SendProposalModal.scss";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";

const SendProposalModal = ({ show, close, partner, senderInfo, onSend }) => {
  const { User } = useContext(UserContext);
  const [proposal, setProposal] = useState({
    message: "",
    type: "Comprehensive Partnership",
    receiver_type: partner?.company_type || "",
    contactName: senderInfo?.name || "",
    contactPhone: senderInfo?.phone || "",
    contactEmail: senderInfo?.email || "",
  });
  const fileInputRef = useRef(null);
  const [apiwaite, setapiwaite] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    try {
      setapiwaite(true);
      const formData = new FormData();
      console.log(partner.company_type);
      formData.append("message", proposal.message);
      formData.append("collaboration_type", proposal.type);
      formData.append("receiver_type", partner.company_type);
      formData.append("sender_contact_name", proposal.contactName);
      formData.append("sender_contact_phone", proposal.contactPhone);
      formData.append("sender_contact_email", proposal.contactEmail);

      formData.append("receiver_id", partner?.company_id);
      formData.append(
        "receiver_company_name",
        partner?.manufacturer?.company_name,
      );

      if (selectedFile) {
        formData.append("attached_file", selectedFile);
      }

      const res = await api_request.sendproposalRequest(User, formData);
      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi gửi dữ liệu!");
      console.error(error);
    } finally {
      setapiwaite(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={close}
      size="lg"
      centered
      className="aws-proposal-modal"
    >
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="fs-6 fw-bold text-dark">
          <FontAwesomeIcon icon={faPaperPlane} className="text-primary me-2" />
          Gửi lời ngỏ hợp tác tới {partner?.company_name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-white">
        <Alert
          variant="info"
          className="aws-alert-minimal border-0 shadow-xs mb-4"
        >
          <div className="d-flex">
            <FontAwesomeIcon icon={faInfoCircle} className="mt-1 me-2" />
            <div className="small">
              Lời ngỏ này sẽ được gửi trực tiếp đến bộ phận thu mua của{" "}
              <strong>{partner?.company_name}</strong>. Mã bảo mật NDA sẽ được
              đính kèm để bảo vệ quyền lợi hai bên.
            </div>
          </div>
        </Alert>

        <Form>
          <Row>
            <Col md={12} className="mb-4">
              <div className="section-header-aws mb-3">
                <FontAwesomeIcon
                  icon={faAddressCard}
                  className="me-2 text-muted"
                />
                <span className="fw-bold small text-uppercase text-muted">
                  Thông tin người đại diện bên gửi
                </span>
              </div>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Label className="small fw-bold">Họ tên</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={proposal.contactName}
                    onChange={(e) =>
                      setProposal({ ...proposal, contactName: e.target.value })
                    }
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold">
                    Số điện thoại
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={proposal.contactPhone}
                    onChange={(e) =>
                      setProposal({ ...proposal, contactPhone: e.target.value })
                    }
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold">
                    Email công việc
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    value={proposal.contactEmail}
                    onChange={(e) =>
                      setProposal({ ...proposal, contactEmail: e.target.value })
                    }
                  />
                </Col>
              </Row>
            </Col>
            <Col md={12} className="mb-4">
              <div className="section-header-aws mb-3 border-top pt-3">
                <FontAwesomeIcon
                  icon={faPaperclip}
                  className="me-2 text-muted"
                />
                <span className="fw-bold small text-uppercase text-muted">
                  Hồ sơ năng lực / Tài liệu đính kèm
                </span>
              </div>

              {!selectedFile ? (
                <div
                  className="aws-upload-dropzone"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip"
                  />
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="mb-2 text-muted fs-4"
                  />
                  <div className="fw-bold small">Nhấn để tải lên tài liệu</div>
                  <div className="text-muted extra-small">
                    Chấp nhận PDF, DOCX, ZIP (Tối đa 10MB)
                  </div>
                </div>
              ) : (
                <div className="aws-file-preview d-flex align-items-center justify-content-between p-2 border rounded shadow-xs">
                  <div className="d-flex align-items-center">
                    <div className="file-icon-box me-3">
                      <FontAwesomeIcon
                        icon={faFileSignature}
                        className="text-primary"
                      />
                    </div>
                    <div>
                      <div
                        className="fw-bold small text-truncate"
                        style={{ maxWidth: "400px" }}
                      >
                        {selectedFile.name}
                      </div>
                      <div className="text-muted extra-small">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="text-danger p-0"
                    onClick={removeFile}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </div>
              )}
            </Col>
            {/* Phần nội dung lời mời */}
            <Col md={12}>
              <div className="section-header-aws mb-3 border-top pt-3">
                <FontAwesomeIcon
                  icon={faFileSignature}
                  className="me-2 text-muted"
                />
                <span className="fw-bold small text-uppercase text-muted">
                  Nội dung đề nghị hợp tác
                </span>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Loại hình hợp tác mong muốn
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={proposal.type}
                  onChange={(e) =>
                    setProposal({ ...proposal, type: e.target.value })
                  }
                >
                  <option value="Comprehensive Partnership">
                    Hợp tác toàn diện
                  </option>
                  <option value="OEM Manufacturing">Gia công OEM</option>
                  <option value="Supply Chain Connection">
                    Kết nối cung ứng
                  </option>
                  <option value="Distributor">Đại lý phân phối</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Lời nhắn chi tiết
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Mô tả ngắn gọn về nhu cầu hợp tác của bạn..."
                  className="aws-textarea"
                  value={proposal.message}
                  onChange={(e) =>
                    setProposal({ ...proposal, message: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="nda-commitment-footer p-3 rounded bg-light border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-warning me-3 fs-4"
                />
                <div>
                  <div className="fw-bold small">Cam kết bảo mật (NDA)</div>
                  <div className="text-muted extra-small">
                    Bằng việc gửi đi, bạn đồng ý tuân thủ các điều khoản bảo mật
                    thông tin On-chain của sàn.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top p-3">
        <Button
          variant="link"
          className="text-muted small fw-bold text-decoration-none"
          onClick={close}
        >
          Hủy bỏ
        </Button>
        <Button
          disabled={apiwaite}
          className="aws-btn-orange px-4 shadow-sm"
          onClick={handleSubmit}
        >
          Gửi lời ngỏ ngay
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SendProposalModal;
