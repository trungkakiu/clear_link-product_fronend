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
  faUser,
  faUnlockAlt,
  faWarehouse,
  faPhone,
  faMapMarkerAlt,
  faUsers,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import api_request from "../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";

const Distributor_register = () => {
  const { User, updateUserDataField } = useContext(UserContext);
  const history = useHistory();
  const [Distributor_data, set_Distributor_data] = useState({
    company_name: "",
    license_number: "",
    warehouse_location: "",
    delivery_capacity: "",
    contact_person: "",
    contact_number: "",
  });

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  const handleChange = (key, value) => {
    set_Distributor_data((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (
        !Distributor_data.company_name ||
        !Distributor_data.contact_number ||
        !Distributor_data.contact_person ||
        !Distributor_data.delivery_capacity ||
        !Distributor_data.license_number ||
        !Distributor_data.warehouse_location
      ) {
        toast.warning("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const res = await api_request.regis_role(
        "Distributor",
        Distributor_data,
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
                  <h3 className="mb-0">Distributor Registration</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Company Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="Company A"
                        value={Distributor_data.company_name}
                        onChange={(e) =>
                          handleChange("company_name", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  <Row>
                    {/* 2. License Number */}
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
                            placeholder="123-ABC-456"
                            value={Distributor_data.license_number}
                            onChange={(e) =>
                              handleChange("license_number", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* 3. Delivery Capacity */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Delivery Capacity</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUsers} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="e.g. 50 trucks/day"
                            value={Distributor_data.delivery_capacity}
                            onChange={(e) =>
                              handleChange("delivery_capacity", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* 4. Warehouse Location */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Warehouse Location</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            required
                            placeholder="District 9, Ho Chi Minh"
                            value={Distributor_data.warehouse_location}
                            onChange={(e) =>
                              handleChange("warehouse_location", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* 5. Contact Person */}
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
                            placeholder="Nguyen Van A"
                            value={Distributor_data.contact_person}
                            onChange={(e) =>
                              handleChange("contact_person", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row></Row>
                  {/* 6. Contact Number */}
                  <Form.Group className="mb-4">
                    <Form.Label>Contact Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faPhone} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="0901 XXX XXX"
                        value={Distributor_data.contact_number}
                        onChange={(e) =>
                          handleChange("contact_number", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Submit */}
                  <Button type="submit" variant="primary" className="w-100">
                    Register Distributor
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

export default Distributor_register;
