import React, { useContext, useEffect, useState } from "react";
import BgImage from "../../assets/img/bgr_active_role.jpg";
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIndustry,
  faUnlockAlt,
  faBarcode,
  faMapMarkerAlt,
  faCogs,
  faCertificate,
  faUser,
  faPhone,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import MapLocationPicker from "../MapLocationPicker";

const Manufacturer_register = () => {
  const { User, updateUserDataField } = useContext(UserContext);
  const history = useHistory();
  const [Manufacturer_data, setManufacturerData] = useState({
    factory_name: "",
    license_number: "",
    tax_code: "",
    location: "",
    address_detail: "",
    lat: null,
    lng: null,
    production_capacity: "",
    certifications: "",
    contact_person: "",
    contact_phone: "",
  });

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  const handleChange = (key, value) => {
    setManufacturerData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLocationSelect = (data) => {
    if (data) {
      setManufacturerData((prev) => ({
        ...prev,
        location: data.address,
        lat: data.lat,
        lng: data.lng,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (
        !Manufacturer_data.location ||
        !Manufacturer_data.lat ||
        !Manufacturer_data.factory_name ||
        !Manufacturer_data.address_detail ||
        !Manufacturer_data.lat ||
        !Manufacturer_data.lng ||
        !Manufacturer_data.location
      ) {
        toast.warning("Vui lòng chọn vị trí nhà máy trên bản đồ!");
        return;
      }

      const res = await api_request.regis_role(
        "Manufacturer",
        Manufacturer_data,
        User,
      );

      if (res && res.RC === 200) {
        await updateUserDataField("role_active", "pending");
        toast.success("Thông tin đăng ký đã được gửi phê duyệt!");
        history.replace("/user/pending-submit");
      } else {
        toast.error(res?.RM || "Lỗi đăng ký");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau!");
      console.error(error);
    }
  };

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
              className="text-gray-700 card-link"
            >
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Quay lại
            </span>
          </p>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <div className="bg-white shadow-soft border rounded p-4 p-lg-5">
                <div className="text-center mb-4">
                  <h3 className="mb-0 fw-bold text-aws-navy">
                    Đăng ký Nhà sản xuất
                  </h3>
                  <p className="small text-muted">
                    Thông tin vị trí sẽ được xác thực trên TraceChain
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Tên nhà máy/Công ty
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faIndustry} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="VD: Nhà máy Sữa ABC"
                            value={Manufacturer_data.factory_name}
                            onChange={(e) =>
                              handleChange("factory_name", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <Col md={12}>
                      <MapLocationPicker
                        label="Vị trí nhà máy (Bản đồ Mapbox)"
                        height="250px"
                        onSelect={handleLocationSelect}
                      />
                      {Manufacturer_data.location && (
                        <div className="mt-2 p-2 bg-light rounded small border-start border-3 border-aws-orange">
                          <strong>Địa chỉ xác thực:</strong>{" "}
                          {Manufacturer_data.location}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Địa chỉ chi tiết
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faIndustry} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="Số nhà / đường "
                            value={Manufacturer_data.address_detail}
                            onChange={(e) =>
                              handleChange("address_detail", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Giấy phép kinh doanh
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="Mã số GPKD"
                            value={Manufacturer_data.license_number}
                            onChange={(e) =>
                              handleChange("license_number", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Mã số thuế</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faBarcode} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="MST doanh nghiệp"
                            value={Manufacturer_data.tax_code}
                            onChange={(e) =>
                              handleChange("tax_code", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Công suất sản xuất (đơn vị/ngày)
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faCogs} />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            required
                            placeholder="Số lượng"
                            value={Manufacturer_data.production_capacity}
                            onChange={(e) =>
                              handleChange(
                                "production_capacity",
                                e.target.value,
                              )
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Chứng chỉ chất lượng
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faCertificate} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="ISO 9001, HACCP..."
                            value={Manufacturer_data.certifications}
                            onChange={(e) =>
                              handleChange("certifications", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Người đại diện liên hệ
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUser} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="Họ và tên"
                            value={Manufacturer_data.contact_person}
                            onChange={(e) =>
                              handleChange("contact_person", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Số điện thoại
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPhone} />
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            required
                            placeholder="Số điện thoại"
                            value={Manufacturer_data.contact_phone}
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
                    variant="primary"
                    className="w-100 py-2 fw-bold shadow-sm"
                  >
                    Gửi hồ sơ đăng ký Manufacturer
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

export default Manufacturer_register;
