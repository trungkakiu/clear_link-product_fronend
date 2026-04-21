import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faEnvelope,
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
  const { User, loginWithoutStore, login } = useContext(UserContext);
  const [apiwait, setapiwait] = useState(false);
  const history = useHistory();
  const isMounted = useRef(true);
  const [loginData, setloginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function handelogin() {
    try {
      setapiwait(true);
      const res = await api_request.login(loginData);

      if (res && res.RC == 200) {
        toast.success(`Chào mừng trở lại ${res.RD.User.name}`);

        if (loginData.remember) {
          await login(res.RD, res.RD.Token);
        } else {
          loginWithoutStore(res.RD, res.RD.Token);
        }

        if (res.RD.User.role_active === true) {
          history.replace("/dashboard/overview");
        } else {
          history.replace("/user/active_role");
        }
      } else {
        if (isMounted.current) {
          toast.error(res ? res.RM : "Đăng nhập thất bại");
          setapiwait(false);
        }
      }
    } catch (error) {
      console.error(error);
      if (isMounted.current) setapiwait(false);
    } finally {
      if (isMounted.current) {
        setTimeout(() => {
          if (isMounted.current) setapiwait(false);
        }, 500);
      }
    }
  }

  return (
    <main>
      <section
        data-aos="fade-left"
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
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Sign in to our platform</h3>
                </div>
                <Form className="mt-4">
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        autoFocus
                        onChange={(e) => {
                          const value = e.target.value;
                          setloginData((prev) => ({
                            ...prev,
                            email: value,
                          }));
                        }}
                        value={loginData.email}
                        required
                        type="email"
                        placeholder="example@company.com"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Group id="password" className="mb-4">
                      <Form.Label>Your Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control
                          required
                          onChange={(e) => {
                            const value = e.target.value;
                            setloginData((prev) => ({
                              ...prev,
                              password: value,
                            }));
                          }}
                          value={loginData.password}
                          type="password"
                          placeholder="Password"
                        />
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check type="checkbox">
                        <FormCheck.Input
                          checked={loginData.remember}
                          onChange={(e) => {
                            const value = e.target.value;
                            setloginData((prev) => ({
                              ...prev,
                              remember: value,
                            }));
                          }}
                          id="defaultCheck5"
                          className="me-2"
                        />
                        <FormCheck.Label
                          htmlFor="defaultCheck5"
                          className="mb-0"
                        >
                          Remember me
                        </FormCheck.Label>
                      </Form.Check>
                      <Card.Link
                        onClick={() => history.push(Routes.ForgotPassword.path)}
                        className="small text-end"
                      >
                        Lost password?
                      </Card.Link>
                    </div>
                  </Form.Group>
                  <Button
                    onClick={() => handelogin()}
                    variant="primary"
                    disabled={apiwait}
                    className="w-100"
                  >
                    {apiwait ? "Processing..." : "Sign in"}
                  </Button>
                </Form>

                <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or login with</span>
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
                    Not registered?
                    <Card.Link
                      as={Link}
                      to={Routes.Signup.path}
                      className="fw-bold"
                    >
                      {` Create account `}
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
