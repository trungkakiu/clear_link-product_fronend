import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Accordion,
  Badge,
  Tabs,
  Tab,
  Card,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faUnlockAlt,
  faMapMarkedAlt,
  faUsers,
  faUser,
  faPhone,
  faAngleLeft,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import BgImage from "../assets/img/bgr_active_role.jpg";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";
import MapLocationPicker from "./MapLocationPicker";
import "../scss/volt/components/Transporter/transregis.scss";

const REGIONS = [
  {
    label: "Đông Bắc Bộ",
    provinces: [
      "Hà Giang",
      "Cao Bằng",
      "Bắc Kạn",
      "Tuyên Quang",
      "Lào Cai",
      "Yên Bái",
      "Thái Nguyên",
      "Lạng Sơn",
      "Quảng Ninh",
      "Bắc Giang",
      "Phú Thọ",
    ],
  },
  {
    label: "Tây Bắc Bộ",
    provinces: ["Điện Biên", "Lai Châu", "Sơn La", "Hòa Bình"],
  },
  {
    label: "Đồng Bằng Sông Hồng",
    provinces: [
      "Hà Nội",
      "Hải Phòng",
      "Bắc Ninh",
      "Hà Nam",
      "Hải Dương",
      "Hưng Yên",
      "Nam Định",
      "Ninh Bình",
      "Thái Bình",
      "Vĩnh Phúc",
    ],
  },
  {
    label: "Bắc Trung Bộ",
    provinces: [
      "Thanh Hóa",
      "Nghệ An",
      "Hà Tĩnh",
      "Quảng Bình",
      "Quảng Trị",
      "Thừa Thiên Huế",
    ],
  },
  {
    label: "Nam Trung Bộ & Tây Nguyên",
    provinces: [
      "Đà Nẵng",
      "Quảng Nam",
      "Quảng Ngãi",
      "Bình Định",
      "Phú Yên",
      "Khánh Hòa",
      "Ninh Thuận",
      "Bình Thuận",
      "Kon Tum",
      "Gia Lai",
      "Đắk Lắk",
      "Đắk Nông",
      "Lâm Đồng",
    ],
  },
  {
    label: "Đông Nam Bộ",
    provinces: [
      "TP. Hồ Chí Minh",
      "Bà Rịa - Vũng Tàu",
      "Bình Dương",
      "Bình Phước",
      "Đồng Nai",
      "Tây Ninh",
    ],
  },
  {
    label: "Đồng Bằng Sông Cửu Long",
    provinces: [
      "Cần Thơ",
      "An Giang",
      "Bạc Liêu",
      "Bến Tre",
      "Cà Mau",
      "Đồng Tháp",
      "Hậu Giang",
      "Kiên Giang",
      "Long An",
      "Sóc Trăng",
      "Tiền Giang",
      "Trà Vinh",
      "Vĩnh Long",
    ],
  },
];

const RegionCollapse = ({
  region,
  index,
  serviceArea,
  onToggleArea,
  onToggleRegion,
}) => {
  const selectedInRegion = region.provinces.filter((p) =>
    serviceArea.includes(p),
  );
  const isAllSelected = selectedInRegion.length === region.provinces.length;

  return (
    <Col md={12} lg={6}>
      <Accordion className="mt-3 aws-region-accordion">
        <Accordion.Item
          eventKey={index}
          className="border-0 shadow-sm mb-2 overflow-hidden"
        >
          <Accordion.Header>
            <div className="d-flex justify-content-between align-items-center w-100 pe-3">
              <div className="d-flex align-items-center">
                <div
                  className={`status-dot me-2 ${selectedInRegion.length > 0 ? "active" : ""}`}
                ></div>
                <span className="small fw-bold text-aws-navy">
                  {region.label}
                </span>
              </div>
              {selectedInRegion.length > 0 && (
                <Badge
                  bg={isAllSelected ? "success" : "info"}
                  className="extra-small px-2"
                >
                  {selectedInRegion.length}/{region.provinces.length}
                </Badge>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white border-top py-3">
            <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
              <span className="tiny text-muted text-uppercase fw-bold">
                Danh sách tỉnh thành
              </span>
              <span
                className="tiny text-primary fw-bold cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleRegion(region.provinces);
                }}
              >
                {isAllSelected ? "Bỏ chọn hết" : "Chọn tất cả"}
              </span>
            </div>
            <div className="province-grid">
              {region.provinces.map((p) => (
                <div key={p} className="province-item">
                  <Form.Check
                    type="checkbox"
                    id={`check-${p}`}
                    label={p}
                    className="custom-aws-check"
                    checked={serviceArea.includes(p)}
                    onChange={() => onToggleArea(p)}
                  />
                </div>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Col>
  );
};

// 3. COMPONENT CHÍNH
const Transporter_register = () => {
  const history = useHistory();
  const { User, updateUserDataField } = useContext(UserContext);
  const [Transporter_data, setTransporterData] = useState({
    company_name: "",
    license_number: "",
    fleet_size: "",
    service_area: [],
    location: "",
    address_detail: "",
    lat: null,
    lng: null,
    contact_person: "",
    contact_phone: "",
  });

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User, history]);

  // Logic Toggle từng tỉnh
  const toggleArea = (province) => {
    setTransporterData((prev) => {
      const current = prev.service_area || [];
      const newAreas = current.includes(province)
        ? current.filter((a) => a !== province)
        : [...current, province];
      return { ...prev, service_area: newAreas };
    });
  };

  // Logic Toggle cả vùng
  const toggleRegion = (provinces) => {
    const current = Transporter_data.service_area || [];
    const allSelected = provinces.every((p) => current.includes(p));

    if (allSelected) {
      setTransporterData((prev) => ({
        ...prev,
        service_area: prev.service_area.filter((a) => !provinces.includes(a)),
      }));
    } else {
      setTransporterData((prev) => ({
        ...prev,
        service_area: Array.from(new Set([...prev.service_area, ...provinces])),
      }));
    }
  };

  const handleChange = (key, value) => {
    setTransporterData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationSelect = (data) => {
    if (data) {
      setTransporterData((prev) => ({
        ...prev,
        location: data.address,
        lat: data.lat,
        lng: data.lng,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !Transporter_data.company_name ||
      !Transporter_data.contact_person ||
      !Transporter_data.contact_phone ||
      !Transporter_data.fleet_size ||
      !Transporter_data.address_detail ||
      !Transporter_data.lat ||
      !Transporter_data.lng ||
      !Transporter_data.license_number ||
      Transporter_data.service_area.length === 0
    ) {
      toast.warning("Vui lòng nhập đầy đủ thông tin và chọn khu vực dịch vụ!");
      return;
    }

    try {
      const res = await api_request.regis_role(
        "Transporter",
        Transporter_data,
        User,
      );
      if (res?.RC === 200) {
        await updateUserDataField("role_active", "pending");
        toast.success("Thông tin đăng ký đã được ghi nhận!");
        history.replace("/user/pending-submit");
      } else {
        toast.error(res?.RM || "Lỗi khi đăng ký!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau!");
    }
  };

  const northernRegions = REGIONS.slice(0, 3);
  const southernRegions = REGIONS.slice(3);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${BgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <section className="d-flex align-items-center py-5">
        <Container>
          <p className="text-center">
            <span
              onClick={() => history.goBack()}
              style={{ cursor: "pointer" }}
              className="text-gray-700"
            >
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Quay lại
            </span>
          </p>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={9}>
              <div className="bg-white shadow-soft border rounded p-4 p-lg-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-aws-navy">
                    ĐĂNG KÝ NHÀ VẬN CHUYỂN
                  </h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Tên công ty vận tải
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faTruck} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            placeholder="VD: Giao Hàng Nhanh (GHN)"
                            value={Transporter_data.company_name}
                            onChange={(e) =>
                              handleChange("company_name", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={12}>
                      <MapLocationPicker
                        label="Vị trí văn phòng/bãi xe"
                        height="280px"
                        onSelect={handleLocationSelect}
                      />
                      {Transporter_data.location && (
                        <div className="mt-2 p-2 bg-light rounded small border-start border-3 border-aws-orange text-dark">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-danger me-2"
                          />
                          {Transporter_data.location}
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Địa chỉ chi tiết (Số nhà/Đường)
                        </Form.Label>
                        <Form.Control
                          required
                          placeholder="VD: 123 Phố Huế, Quận Hai Bà Trưng"
                          value={Transporter_data.address_detail}
                          onChange={(e) =>
                            handleChange("address_detail", e.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Giấy phép vận hành
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            placeholder="Mã số GPKD"
                            value={Transporter_data.license_number}
                            onChange={(e) =>
                              handleChange("license_number", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Quy mô đội xe
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUsers} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            placeholder="VD: 50 xe tải"
                            value={Transporter_data.fleet_size}
                            onChange={(e) =>
                              handleChange("fleet_size", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* SERVICE AREA SELECTOR */}
                  <Card className="border-0 shadow-sm mb-4 aws-selector-card overflow-hidden">
                    <Card.Header className="bg-aws-navy text-white py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0 fw-bold">
                          <FontAwesomeIcon
                            icon={faMapMarkedAlt}
                            className="me-2 text-aws-orange"
                          />{" "}
                          PHẠM VI DỊCH VỤ
                        </h6>
                      </div>
                      <Badge bg="aws-orange" className="px-3 py-2">
                        Đã chọn: {Transporter_data.service_area.length} Tỉnh
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-0 bg-light-soft">
                      <Tabs
                        defaultActiveKey="north"
                        className="aws-tabs-custom"
                      >
                        <Tab eventKey="north" title="MIỀN BẮC">
                          <div className="p-3">
                            <Row className="g-2">
                              {northernRegions.map((region, index) => (
                                <RegionCollapse
                                  key={region.label}
                                  region={region}
                                  index={`n-${index}`}
                                  serviceArea={Transporter_data.service_area}
                                  onToggleArea={toggleArea}
                                  onToggleRegion={toggleRegion}
                                />
                              ))}
                            </Row>
                          </div>
                        </Tab>
                        <Tab eventKey="south" title="MIỀN TRUNG & NAM">
                          <div className="p-3">
                            <Row className="g-2">
                              {southernRegions.map((region, index) => (
                                <RegionCollapse
                                  key={region.label}
                                  region={region}
                                  index={`s-${index}`}
                                  serviceArea={Transporter_data.service_area}
                                  onToggleArea={toggleArea}
                                  onToggleRegion={toggleRegion}
                                />
                              ))}
                            </Row>
                          </div>
                        </Tab>
                      </Tabs>
                    </Card.Body>
                  </Card>

                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Người liên hệ
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUser} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            value={Transporter_data.contact_person}
                            onChange={(e) =>
                              handleChange("contact_person", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold small">
                          Số điện thoại
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPhone} />
                          </InputGroup.Text>
                          <Form.Control
                            required
                            value={Transporter_data.contact_phone}
                            onChange={(e) =>
                              handleChange("contact_phone", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    variant="aws-orange"
                    className="w-100 py-3 fw-bold shadow-sm text-white"
                  >
                    HOÀN TẤT ĐĂNG KÝ HỒ SƠ
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default Transporter_register;
