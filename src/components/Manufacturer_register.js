import React, { useContext, useEffect } from "react";
import { useState } from "react";
import BgImage from "../assets/img/bgr_active_role.jpg";
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
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";

const Manufacturer_register = () => {
  const { User, updateUserDataField } = useContext(UserContext);
  const history = useHistory();
  const [Manufacturer_data, setManufacturerData] = useState({
    factory_name: "",
    license_number: "",
    tax_code: "",
    location: "",
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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (
        !Manufacturer_data.certifications ||
        !Manufacturer_data.contact_person ||
        !Manufacturer_data.contact_phone ||
        !Manufacturer_data.factory_name ||
        !Manufacturer_data.license_number ||
        !Manufacturer_data.location ||
        !Manufacturer_data.production_capacity ||
        !Manufacturer_data.tax_code
      ) {
        toast.warning("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const res = await api_request.regis_role(
        "Manufacturer",
        Manufacturer_data,
        User
      );
      if (res) {
        if (res.RC === 200) {
          await updateUserDataField("role_active", "pending");
          toast.success("Thông tin đăng ký đã được ghi nhận!");
          history.replace("/user/pending-submit");
          return;
        } else {
          toast.error(res.RM);
          return;
        }
      }
    } catch (error) {
      toast.error("lỗi khi đăng ký thông tin, vui lòng thử lại sau!");
      console.error(error);
      return;
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        height: "100%",
        backgroundImage: `url(${BgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <section
        data-aos="fade-left"
        className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5"
      >
        <Container>
          <p className="text-center">
            <span
              onClick={() => history.goBack()}
              style={{ cursor: "pointer", userSelect: "none" }}
              className="text-gray-700 card-link"
            >
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back
            </span>
          </p>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <div className="bg-white shadow-soft border rounded p-4 p-lg-5">
                <div className="text-center mb-4">
                  <h3 className="mb-0">Manufacturer Registration</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Factory Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faIndustry} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="ABC Manufacturing Factory"
                        value={Manufacturer_data.factory_name}
                        onChange={(e) =>
                          handleChange("factory_name", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>License Number</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="123-ABC-999"
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
                        <Form.Label>Tax Code</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faBarcode} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="044xxxxxxx"
                            value={Manufacturer_data.tax_code}
                            onChange={(e) =>
                              handleChange("tax_code", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Location */}
                  <Form.Group className="mb-4">
                    <Form.Label>Location</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="Industrial Zone, District 9, HCMC"
                        value={Manufacturer_data.location}
                        onChange={(e) =>
                          handleChange("location", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    {/* Production Capacity */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Production Capacity</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faCogs} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            placeholder="e.g. 5000 units/day"
                            value={Manufacturer_data.production_capacity}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              handleChange("production_capacity", val);
                            }}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* Certifications */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Certifications</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faCertificate} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="ISO 9001, ISO 22000..."
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
                    {/* Contact Person */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Contact Person</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUser} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="Nguyen Van B"
                            value={Manufacturer_data.contact_person}
                            onChange={(e) =>
                              handleChange("contact_person", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* Contact Phone */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Contact Phone</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faPhone} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="0901 XXX XXX"
                            value={Manufacturer_data.contact_phone}
                            onChange={(e) =>
                              handleChange("contact_phone", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" variant="primary" className="w-100">
                    Register Manufacturer
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
