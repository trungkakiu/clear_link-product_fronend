import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faEnvelope,
  faPhone,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faGithub,
  faGoogle,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  Col,
  Row,
  Form,
  Card,
  Button,
  FormCheck,
  Container,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { Link, useHistory } from "react-router-dom";

import { Routes } from "../../routes";
import BgImage from "../../assets/img/illustrations/signin.svg";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast, ToastContainer } from "react-toastify";

export default () => {
  const [signupData, setsignupData] = useState({
    fullname: "",
    email: "",
    password: "",
    re_password: "",
    phonenumber: "",
  });

  const history = useHistory();

  const handleRegister = async () => {
    try {
      if (
        !signupData.email ||
        !signupData.password ||
        !signupData.re_password ||
        !signupData.phonenumber ||
        !signupData.fullname
      ) {
        toast.warning("Vui lòng cung cấp đầy đủ thông tin");
        return;
      }

      if (signupData.password !== signupData.re_password) {
        toast.error("Mật khẩu không trùng khớp!");
        return;
      }
      const res = await api_request.register(signupData);
      if (res) {
        if (res.RC === 200) {
          toast.success("Đăng ký tài khoản thành công!");
          history.replace("/authen/sign-in");
          return;
        } else {
          toast.error(res.RM);
          return;
        }
      }
    } catch (error) {
      console.error(error);
      return;
    }
  };

  return (
    <main>
      <section
        data-aos="fade-right"
        className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5"
      >
        <Container>
          <p className="text-center">
            <a
              className="text-gray-700 card-link"
              href="http://localhost:3011/"
            >
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back to
              homepage
            </a>
          </p>
          <Row
            className="justify-content-center form-bg-image"
            style={{ backgroundImage: `url(${BgImage})` }}
          >
            <Col
              xs={12}
              className="d-flex align-items-center justify-content-center"
            >
              <div
                className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100"
                style={{ maxWidth: "550px" }}
              >
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Create an account</h3>
                </div>
                <Form className="mt-4">
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        value={signupData.email}
                        onChange={(e) => {
                          const value = e.target.value;
                          setsignupData((prev) => ({
                            ...prev,
                            email: value,
                          }));
                        }}
                        autoFocus
                        required
                        type="email"
                        placeholder="example@company.com"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        value={signupData.fullname}
                        onChange={(e) => {
                          const value = e.target.value;
                          setsignupData((prev) => ({
                            ...prev,
                            fullname: value,
                          }));
                        }}
                        autoFocus
                        required
                        type="text"
                        placeholder="let we know your name"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Your phone number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faPhone} />
                      </InputGroup.Text>
                      <Form.Control
                        value={signupData.phonenumber}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (/^\d*$/.test(value)) {
                            setsignupData((prev) => ({
                              ...prev,
                              phonenumber: value,
                            }));
                          }
                        }}
                        required
                        type="text"
                        placeholder="Phone Number"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group id="password" className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            value={signupData.password}
                            onChange={(e) => {
                              const value = e.target.value;
                              setsignupData((prev) => ({
                                ...prev,
                                password: value,
                              }));
                            }}
                            required
                            type="password"
                            placeholder="Password"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group id="confirmPassword" className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faUnlockAlt} />
                          </InputGroup.Text>
                          <Form.Control
                            value={signupData.re_password}
                            onChange={(e) => {
                              const value = e.target.value;
                              setsignupData((prev) => ({
                                ...prev,
                                re_password: value,
                              }));
                            }}
                            required
                            type="password"
                            placeholder="Confirm Password"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <FormCheck type="checkbox" className="d-flex mb-4">
                    <FormCheck.Input required id="terms" className="me-2" />
                    <FormCheck.Label htmlFor="terms">
                      I agree to the <Card.Link>terms and conditions</Card.Link>
                    </FormCheck.Label>
                  </FormCheck>

                  <Button
                    onClick={() => handleRegister()}
                    variant="primary"
                    className="w-100"
                  >
                    Sign up
                  </Button>
                </Form>

                <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or</span>
                </div>
                <div className="d-flex justify-content-center my-4">
                  <Button
                    variant="outline-light"
                    className="btn-icon-only btn-pill text-facebook me-2"
                  >
                    <FontAwesomeIcon icon={faGoogle} />
                  </Button>
                  <Button
                    variant="outline-light"
                    className="btn-icon-only btn-pill text-twitter me-2"
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                  </Button>
                  <Button
                    variant="outline-light"
                    className="btn-icon-only btn-pil text-dark"
                  >
                    <FontAwesomeIcon icon={faGithub} />
                  </Button>
                </div>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Already have an account?
                    <Card.Link
                      as={Link}
                      to={Routes.Signin.path}
                      className="fw-bold"
                    >
                      {` Login here `}
                    </Card.Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};
