import React, { useContext, useEffect } from "react";
import { useState } from "react";
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
  faTruck,
  faUnlockAlt,
  faMapMarkedAlt,
  faUsers,
  faUser,
  faPhone,
  faAngleLeft,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import BgImage from "../assets/img/bgr_active_role.jpg";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";

const Transporter_register = () => {
  const history = useHistory();
  const { User, updateUserDataField } = useContext(UserContext);
  const [Transporter_data, setTransporterData] = useState({
    company_name: "",
    license_number: "",
    fleet_size: "",
    service_area: "",
    contact_person: "",
    contact_phone: "",
  });

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  const handleChange = (key, value) => {
    setTransporterData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (
        !Transporter_data.company_name ||
        !Transporter_data.contact_person ||
        !Transporter_data.contact_phone ||
        !Transporter_data.fleet_size ||
        !Transporter_data.license_number ||
        !Transporter_data.service_area
      ) {
        toast.warning("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const res = await api_request.regis_role(
        "Transporter",
        Transporter_data,
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
                  <h3 className="mb-0">Transporter Registration</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Company Name */}
                  <Form.Group className="mb-4">
                    <Form.Label>Company Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faTruck} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="ABC Logistics"
                        value={Transporter_data.company_name}
                        onChange={(e) =>
                          handleChange("company_name", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    {/* License Number */}
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
                            placeholder="VN-1234-LOG"
                            value={Transporter_data.license_number}
                            onChange={(e) =>
                              handleChange("license_number", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* Fleet Size */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Fleet Size</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUsers} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="e.g. 20 trucks"
                            value={Transporter_data.fleet_size}
                            onChange={(e) =>
                              handleChange("fleet_size", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Service Area</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faMapMarkedAlt} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Nationwide / HCMC / Hanoi"
                        value={Transporter_data.service_area}
                        onChange={(e) =>
                          handleChange("service_area", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

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
                            placeholder="Nguyen Van C"
                            value={Transporter_data.contact_person}
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
                            placeholder="0903 XXX XXX"
                            value={Transporter_data.contact_phone}
                            onChange={(e) =>
                              handleChange("contact_phone", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Submit */}
                  <Button type="submit" variant="primary" className="w-100">
                    Register Transporter
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
