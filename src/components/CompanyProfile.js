import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Image,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSave,
  faBuilding,
  faPhone,
  faUserTie,
  faGlobe,
  faIndustry,
  faFileInvoice,
  faWarehouse,
  faTruckLoading,
  faStore,
  faSitemap,
  faTruck,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faEdit,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import api_request from "../apicontroller/api_request";
import moment from "moment";
import "../scss/volt/components/CompanyProfile.scss";
import RocketLoad from "../Utils/RocketLoad";
import Otp_verify_dynamic from "./Modal/Otp_verify_dynamic";
import MapLocationPicker from "./MapLocationPicker";
import MapPreview from "./MapPreview";

const CompanyProfile = () => {
  const API_IMG = process.env.REACT_APP_API_IMAGE_URL;
  const { User } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const currentRole = User?.data?.role?.toUpperCase();

  const roleSpecificFields = {
    MANUFACTURER: [
      {
        label: "Năng lực sản xuất",
        key: "production_capacity",
        type: "number",
        icon: faIndustry,
        unit: "SP/Tháng",
      },
      {
        label: "Mã số thuế",
        key: "tax_code",
        type: "text",
        icon: faFileInvoice,
      },
      {
        label: "Địa chỉ nhà máy",
        key: "location",
        type: "text",
        icon: faMapMarkerAlt,
      },
    ],
    DISTRIBUTOR: [
      {
        label: "Vị trí kho bãi",
        key: "warehouse_location",
        type: "text",
        icon: faWarehouse,
      },
      {
        label: "Khả năng cung ứng",
        key: "delivery_capacity",
        type: "text",
        icon: faTruckLoading,
      },
      {
        label: "Số lượng đại lý",
        key: "agency_count",
        type: "number",
        icon: faSitemap,
      },
    ],
    RETAILER: [
      {
        label: "Địa chỉ cửa hàng",
        key: "store_address",
        type: "text",
        icon: faStore,
      },
      {
        label: "Số lượng chi nhánh",
        key: "branch_count",
        type: "number",
        icon: faSitemap,
      },
      {
        label: "Dòng sản phẩm chính",
        key: "product_lines",
        type: "text",
        icon: faTruckLoading,
      },
    ],
    TRANSPORTER: [
      {
        label: "Số lượng đội xe",
        key: "fleet_count",
        type: "number",
        icon: faTruck,
      },
      {
        label: "Khu vực hoạt động",
        key: "operation_area",
        type: "text",
        icon: faMapMarkedAlt,
      },
      {
        label: "Tải trọng tối đa",
        key: "max_capacity",
        type: "text",
        icon: faTruckLoading,
      },
    ],
  };

  const [modalState, setmodalState] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await api_request.getCompanyProfile(User);
    if (res?.RC === 200) setProfileData(res.RD);
    setLoading(false);
  };

  const handleUpdate = async (challen_code) => {
    setLoading(true);
    try {
      const formData = new FormData();

      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });

      if (selectedFile) {
        formData.append("logo_file", selectedFile);
      }

      const res = await api_request.updateProfile(User, challen_code, formData);

      if (res?.RC === 200) {
        toast.success("Cập nhật hồ sơ thành công!");
        setEditMode(false);
        return {
          RM: res.RM,
          RC: 200,
        };
      }

      return {
        RM: res.RM,
        RC: res.RC,
      };
    } catch (error) {
      toast.error("Lỗi khi cập nhật!");
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          minHeight: "75vh",
        }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <Container fluid className="aws-profile-wrapper py-4 px-4">
      <Otp_verify_dynamic
        close={() => setmodalState(false)}
        closeReload={() => {
          setmodalState(false);
          fetchData();
        }}
        message={"Để thay đổi thông tin doanh nghiệp hãy xác thực mã PIN!"}
        onSuccess={(challen_code) => {
          return handleUpdate(challen_code);
        }}
        show={modalState}
        title={"PIN VERIFY"}
      />
      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="aws-header-banner"></div>
        <Card.Body className="pt-0 px-4 pb-4">
          <Row className="align-items-end">
            <Col xs="auto" className="avatar-col">
              <div className="profile-avatar-container">
                <Image
                  src={
                    previewUrl
                      ? previewUrl
                      : profileData.logo
                        ? `${API_IMG}Company-logo/${profileData.logo}`
                        : "https://via.placeholder.com/150"
                  }
                  className="profile-logo shadow border-4 border-white"
                />
                {editMode && (
                  <label htmlFor="logo-upload" className="avatar-edit-badge">
                    <FontAwesomeIcon icon={faCamera} />
                    <input
                      type="file"
                      id="logo-upload"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </Col>
            <Col className="pb-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h3 className="fw-bold mb-1 text-main">
                    {profileData.company_name}
                  </h3>
                  <div className="d-flex gap-2 align-items-center">
                    <Badge
                      bg="aws-orange-soft"
                      className="text-aws-orange text-uppercase"
                    >
                      {currentRole}
                    </Badge>
                    <Badge bg="gray-100" className="text-muted border">
                      ID: {profileData.id}
                    </Badge>
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>Joined{" "}
                      {moment(profileData.createdAt).format("MMM YYYY")}
                    </small>
                  </div>
                </div>
                <div className="mt-2 mt-md-0">
                  {!editMode ? (
                    <Button
                      variant="outline-primary"
                      className="btn-aws-edit shadow-sm"
                      onClick={() => setEditMode(true)}
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-2" /> Sửa
                      thông tin
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        onClick={() => setEditMode(false)}
                      >
                        {" "}
                        <FontAwesomeIcon icon={faTimes} /> Hủy
                      </Button>
                      <Button
                        variant="success"
                        className="text-white shadow-sm"
                        onClick={() => setmodalState(true)}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" /> Lưu
                        thay đổi
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={7} lg={7} md={12}>
          <Card className="border-0 shadow-sm h-100">
            {" "}
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-aws-orange me-2"
                />
                Hồ sơ năng lực & Pháp lý
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="aws-label">
                    Tên doanh nghiệp
                  </Form.Label>
                  <Form.Control
                    disabled={!editMode}
                    value={profileData.company_name}
                    className="aws-input"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="aws-label">
                    Số giấy phép kinh doanh
                  </Form.Label>
                  <Form.Control
                    disabled={!editMode}
                    value={profileData.license_number}
                    className="aws-input"
                  />
                </Col>

                {roleSpecificFields[currentRole]?.map((field) => (
                  <Col md={6} key={field.key}>
                    <Form.Label className="aws-label">{field.label}</Form.Label>
                    <InputGroup className="aws-input-group">
                      <InputGroup.Text className="bg-light border-end-0">
                        <FontAwesomeIcon
                          icon={field.icon}
                          className="text-muted"
                        />
                      </InputGroup.Text>
                      <Form.Control
                        disabled={!editMode}
                        type={field.type}
                        value={profileData[field.key] || ""}
                        className="aws-input border-start-0"
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                      {field.unit && (
                        <InputGroup.Text className="bg-light small">
                          {field.unit}
                        </InputGroup.Text>
                      )}
                    </InputGroup>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5} lg={5} md={12}>
          <Card className="border-0 shadow-sm h-100">
            {" "}
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-aws-orange me-2"
                />
                Liên hệ trực tiếp
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4 d-flex flex-column justify-content-center">
              <div className="contact-grid">
                <div className="contact-box mb-3">
                  <FontAwesomeIcon icon={faUserTie} className="icon" />
                  <div className="content">
                    <small>Người phụ trách</small>
                    <Form.Control
                      disabled={!editMode}
                      size="sm"
                      value={profileData.contact_person}
                      className="aws-input-inline"
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          contact_person: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="contact-box">
                  <FontAwesomeIcon icon={faPhone} className="icon" />
                  <div className="content">
                    <small>Hotline</small>
                    <Form.Control
                      disabled={!editMode}
                      size="sm"
                      value={
                        profileData.contact_phone ||
                        profileData.contact_number ||
                        ""
                      }
                      className="aws-input-inline"
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          contact_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <Form.Label className="aws-label small text-muted">
                  Trạng thái hệ thống
                </Form.Label>
                <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                  <Badge
                    bg={profileData.status === "active" ? "success" : "warning"}
                  >
                    {profileData.status === "active"
                      ? "ĐANG HOẠT ĐỘNG"
                      : "TẠM NGỪNG"}
                  </Badge>
                  <Badge bg="info" className="text-white">
                    CHAIN: {profileData.chain_status}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* HÀNG DƯỚI: THẺ BẢN ĐỒ CHIẾM FULL CHIỀU RỘNG */}
        <Col xl={12} className="mt-4">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-aws-orange me-2"
                />
                Vị trí xác thực trên TraceChain
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {editMode ? (
                <div className="aws-map-setup p-0 rounded bg-white border-0">
                  <div className="instructions mb-3 p-3 bg-aws-navy-light rounded border-start border-3 border-aws-orange">
                    <h6 className="fw-bold small text-aws-navy mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-aws-orange"
                      />
                      Cập nhật vị trí GPS:
                    </h6>
                    <p className="x-small text-muted mb-0">
                      Sử dụng thanh tìm kiếm hoặc{" "}
                      <strong>click trực tiếp lên bản đồ</strong> để ghim vị trí
                      mới. Dữ liệu này sẽ được dùng để tính toán lộ trình vận
                      chuyển.
                    </p>
                  </div>
                  <MapLocationPicker
                    label="Tìm kiếm & Ghim vị trí"
                    height="400px" // Cho map to ra cho sướng anh ạ
                    initialCoords={
                      profileData.latitude && profileData.longitude
                        ? {
                            lat: profileData.latitude,
                            lng: profileData.longitude,
                          }
                        : null
                    }
                    onSelect={(data) => {
                      if (data) {
                        setProfileData({
                          ...profileData,
                          location: data.address,
                          latitude: data.lat,
                          longitude: data.lng,
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="aws-map-view">
                  {profileData.latitude && profileData.longitude ? (
                    <MapPreview
                      lat={parseFloat(profileData.latitude)}
                      lng={parseFloat(profileData.longitude)}
                      address={profileData.location}
                      height="400px"
                    />
                  ) : (
                    <div className="text-center py-5 bg-light rounded border border-dashed text-muted">
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        size="2x"
                        className="mb-2 opacity-25"
                      />
                      <p className="small mb-0">
                        Chưa có thông tin tọa độ GPS. Hãy nhấn chỉnh sửa để cập
                        nhật.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CompanyProfile;
