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
  faStore,
  faMapMarkedAlt,
  faList,
  faUsers,
  faUser,
  faPhone,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import api_request from "../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import MapLocationPicker from "./MapLocationPicker";

const Retailer_register = () => {
  const history = useHistory();
  const { User, updateUserDataField } = useContext(UserContext);
  const [Retailer_data, setRetailerData] = useState({
    store_name: "",
    store_address: "",
    branch_count: "",
    product_lines: "",
    contact_person: "",
    location: "",
    address_detail: "",
    lat: null,
    lng: null,
    contact_phone: "",
  });

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  const handleChange = (key, value) => {
    setRetailerData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocationSelect = (data) => {
    if (data) {
      setRetailerData((prev) => ({
        ...prev,
        location: data.address,
        lat: data.lat,
        lng: data.lng,
      }));
    }
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (
        !Retailer_data.branch_count ||
        !Retailer_data.contact_person ||
        !Retailer_data.contact_phone ||
        !Retailer_data.product_lines ||
        !Retailer_data.store_address ||
        !Retailer_data.address_detail ||
        !Retailer_data.lat ||
        !Retailer_data.lng ||
        !Retailer_data.location ||
        !Retailer_data.store_address ||
        !Retailer_data.store_name
      ) {
        toast.warning("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const res = await api_request.regis_role("Retailer", Retailer_data, User);
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
            <Col xs={12} md={8} lg={8}>
              <div className="bg-white shadow-soft border rounded p-4 p-lg-5">
                <div className="text-center mb-4">
                  <h3 className="mb-0">Retailer Registration</h3>
                </div>

                <Form onSubmit={handleSubmit}>
                  {/* Store Name */}
                  <Form.Group className="mb-4">
                    <Form.Label>Store Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faStore} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="ABC Retail Store"
                        value={Retailer_data.store_name}
                        onChange={(e) =>
                          handleChange("store_name", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Store Address */}
                  <Row className="mb-4">
                    <Col md={12}>
                      <MapLocationPicker
                        label="Vị trí nhà máy (Bản đồ Mapbox)"
                        height="250px"
                        onSelect={handleLocationSelect}
                      />
                      {Retailer_data.location && (
                        <div className="mt-2 p-2 bg-light rounded small border-start border-3 border-aws-orange">
                          <strong>Địa chỉ xác thực:</strong>{" "}
                          {Retailer_data.location}
                        </div>
                      )}
                    </Col>
                  </Row>
                  <Form.Group className="mb-4">
                    <Form.Label>Địa chỉ chi tiết</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        required
                        placeholder="Số nhà / đường"
                        value={Retailer_data.address_detail}
                        onChange={(e) =>
                          handleChange("address_detail", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Form.Group>
                  <Row>
                    {/* Branch Count */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Branch Count</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUsers} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="e.g. 5 branches"
                            value={Retailer_data.branch_count}
                            onChange={(e) =>
                              handleChange("branch_count", e.target.value)
                            }
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    {/* Product Lines */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Product Lines</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faList} />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="MixiShop, Clothing, Accessories…"
                            value={Retailer_data.product_lines}
                            onChange={(e) =>
                              handleChange("product_lines", e.target.value)
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
                            placeholder="Nguyễn Văn D"
                            value={Retailer_data.contact_person}
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
                            value={Retailer_data.contact_phone}
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
                    Register Retailer
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

export default Retailer_register;
