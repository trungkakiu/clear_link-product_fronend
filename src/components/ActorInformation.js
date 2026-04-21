import React, { useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCamera,
  faEnvelope,
  faPhone,
  faShieldAlt,
  faUserCircle,
  faMapMarkerAlt,
  faIdCard,
  faCrown,
  faCheckCircle,
  faCopy,
  faHistory,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../scss/volt/pages/ActorProfile.scss";
import { UserContext } from "../Context/UserContext";
import { toast } from "react-toastify";
import api_request from "../apicontroller/api_request";

const ActorInformation = ({}) => {
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const { User, updateUserDataField } = useContext(UserContext);
  const [isAvatarupload, setisAvatarupload] = useState(false);

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: User.data.name,
    phone_number: User.data.phone_number,
    personal_tax_code: User.data.personal_tax_code,
    address_1: User.data.address_1,
    address_2: User.data.address_2,
  });
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewAvatar(previewUrl);
    }
  };

  const upload_avatar = async () => {
    try {
      if (isAvatarupload) return;
      setisAvatarupload(true);
      const formdata = new FormData();
      formdata.append("avatar_file", selectedFile);

      const res = await api_request.user_upload_avatar(User, formdata);
      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
          updateUserDataField(res.RD);
        } else {
          toast.error(res.RN);
        }
      } else {
        toast.error("Không nhận được phản hồi từ hệ thống!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
      console.error(error);
    } finally {
      setTimeout(() => {
        setisAvatarupload(false);
      }, 5000);
    }
  };

  const cancelPreview = () => {
    setPreviewAvatar(null);
    setSelectedFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateInfo = async () => {
    try {
      if (isUpdatingInfo) return;
      setIsUpdatingInfo(true);

      const res = await api_request.user_update_info(User, formData);

      if (res && res.RC === 200) {
        toast.success(res.RM);
        updateUserDataField(res.RD);
        setIsEditing(false);
      } else {
        toast.error(res?.RM || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối hệ thống!");
    } finally {
      setIsUpdatingInfo(false);
    }
  };
  const currentDisplayAvatar =
    previewAvatar ||
    (User.data.avatar !== "null"
      ? `${API_URL}User-avatar/${User.data.avatar}`
      : `${User.data.name}`);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép Public Key!");
  };

  if (!User || !User.data) return null;

  return (
    <div className="aws-profile-wrapper">
      <nav className="aws-top-nav">
        <div className="custom-container">
          <div className="d-flex align-items-center justify-content-between py-2">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="text-white p-0 me-3"
                onClick={() => window.history.back()}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <div className="nav-brand">
                <span className="fw-bold text-white">
                  Identity & Access Management
                </span>
                <span className="mx-2 text-muted">/</span>
                <span className="text-aws-orange small fw-bold">
                  Actor Information
                </span>
              </div>
            </div>
            <div className="user-id-badge d-none d-md-block">
              {User.data.id}
            </div>
          </div>
        </div>
      </nav>

      <div className="custom-container mt-4 pb-5">
        <Row className="justify-content-center">
          <Col xl={4} lg={5} className="mb-4">
            <Card className="aws-card border-standard h-100 shadow-sm">
              <Card.Body className="p-4 d-flex flex-column align-items-center">
                <div className="avatar-section mb-4">
                  <div className="avatar-preview shadow">
                    <img src={currentDisplayAvatar} alt="User Avatar" />

                    <label
                      htmlFor="avatar-upload"
                      className="avatar-edit-overlay"
                    >
                      <FontAwesomeIcon icon={faCamera} />
                      <span>Change</span>
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {previewAvatar && (
                    <div className="mt-2 d-flex gap-2 justify-content-center">
                      <Button
                        onClick={upload_avatar}
                        variant="aws-orange"
                        disabled={isAvatarupload}
                        size="sm"
                        className="py-0 px-2 x-small"
                      >
                        Save
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0 x-small"
                        onClick={cancelPreview}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!previewAvatar && <div className="status-dot online"></div>}
                </div>
                <div className="text-center mb-3">
                  <h4 className="fw-bold mb-1">
                    {User.data.name}
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-info ms-2"
                    />
                  </h4>
                  <p className="text-muted small">{User.data.email}</p>
                </div>

                <div className="info-list-group w-100 border-top pt-3">
                  <div className="info-row">
                    <span className="label">Role Type</span>
                    <Badge bg="primary" className="aws-badge-flat">
                      {User.data.role.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="info-row">
                    <span className="label">Access Level</span>
                    <span className="value text-aws-blue fw-bold">
                      {User.data.level.toUpperCase()}
                    </span>
                  </div>
                </div>

                {User.data.is_prime && (
                  <div className="prime-card mt-3">
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="text-warning me-2"
                    />
                    <span className="fw-bold">AWS PRIME PARTNER</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={8} lg={7}>
            <Card className="aws-card border-standard bg-aws-dark text-white mb-4 overflow-hidden">
              <div className="aws-card-accent-orange"></div>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-aws-orange me-2"
                  />
                  <span className="fw-bold x-small text-uppercase">
                    Blockchain Signature Identity
                  </span>
                </div>
                <div className="crypto-address-box">
                  <code className="text-info x-small text-truncate">
                    {User.data.public_key}
                  </code>
                  <Button
                    variant="link"
                    className="p-0 text-aws-orange"
                    onClick={() => copyToClipboard(User.data.public_key)}
                  >
                    <FontAwesomeIcon icon={faCopy} className="hover-scale" />
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Form Details */}
            <Card className="aws-card border-standard shadow-sm">
              <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="aws-icon-square me-2">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-aws-blue"
                    />
                  </div>
                  <h6 className="m-0 fw-bold">General Configuration</h6>
                </div>
                <Button
                  variant={isEditing ? "outline-danger" : "aws-orange"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="fw-bold px-3"
                >
                  {isEditing ? "Discard Changes" : "Edit Settings"}
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6}>
                    <label className="aws-input-label">Actor Name</label>
                    <Form.Control
                      type="text"
                      name="name"
                      onChange={handleInputChange}
                      defaultValue={User.data.name}
                      readOnly={!isEditing}
                      className={`aws-input ${isEditing ? "editing" : ""}`}
                    />
                  </Col>
                  <Col md={6}>
                    <label className="aws-input-label">Global Phone</label>
                    <Form.Control
                      type="text"
                      defaultValue={User.data.phone_number}
                      name="phone_number"
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={`aws-input ${isEditing ? "editing" : ""}`}
                    />
                  </Col>
                  <Col md={12}>
                    <label className="aws-input-label">
                      Tax ID Verification
                    </label>
                    <Form.Control
                      type="text"
                      value={User.data.personal_tax_code || "N/A"}
                      name="personal_tax_code"
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                      className={`aws-input ${isEditing ? "editing" : ""}`}
                    />
                  </Col>
                  <Col xs={12}>
                    <label className="aws-input-label">
                      Primary & Secondary Address
                    </label>
                    <Form.Control
                      type="text"
                      name="address_1"
                      onChange={handleInputChange}
                      defaultValue={User.data.address_1}
                      readOnly={!isEditing}
                      className={`aws-input mb-2 ${isEditing ? "editing" : ""}`}
                      placeholder="Address line 1"
                    />
                    <Form.Control
                      type="text"
                      name="address_2"
                      onChange={handleInputChange}
                      defaultValue={User.data.address_2}
                      readOnly={!isEditing}
                      className={`aws-input ${isEditing ? "editing" : ""}`}
                      placeholder="Address line 2"
                    />
                  </Col>
                </Row>

                <div className="audit-footer mt-4">
                  <div className="audit-item">
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                    Created:{" "}
                    {moment(User.data.createdAt).format("DD MMM, YYYY")}
                  </div>
                  <div className="audit-item">
                    Sync Status: {moment(User.data.updatedAt).fromNow()}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-3 border-top text-end">
                    <Button
                      variant="aws-blue"
                      disabled={isUpdatingInfo}
                      onClick={handleUpdateInfo}
                      className="aws-btn-submit px-4 shadow-sm"
                    >
                      <FontAwesomeIcon
                        icon={faCloudUploadAlt}
                        className="me-2"
                      />
                      Update Information
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ActorInformation;
