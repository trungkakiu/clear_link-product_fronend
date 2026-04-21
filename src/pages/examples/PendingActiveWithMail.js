import React, { useContext, useEffect, useState } from "react";
import BgImage from "../../assets/img/bgr_active_role.jpg";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faEnvelope,
  faHeadset,
  faPaperPlane,
  faSignOutAlt,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const PendingActiveWithMail = () => {
  const [mailData, setMailData] = useState({
    email: "",
    subject: "",
    content: "",
  });
  const [isSending, setIsSending] = useState(false);
  const { User, logout } = useContext(UserContext);
  const [cooldown, setCooldown] = useState(0);
  const history = useHistory();
  useEffect(() => {
    if (User?.data?.role_active === "active") {
      history.push("/");
    }
  }, [User]);

  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (key, value) => {
    setMailData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSendMail = async () => {
    try {
      if (isSending) return;
      if (cooldown > 0) {
        toast.info(`Vui lòng chờ ${cooldown}s để gửi lại`);
        return;
      }

      if (!mailData.email || !mailData.subject || !mailData.content) {
        return alert("Vui lòng điền đầy đủ thông tin email!");
      }
      setIsSending(true);
      setCooldown(10);
      const res = await api_request.sensupportmail(mailData);
      if (res) {
        if (res.RC === 200) {
          alert(
            "Gửi mail thành công, chúng tôi sẽ thông báo cho bạn sớm nhất!",
          );
        } else {
          alert(res.RM);
        }
      }
    } catch (error) {
      alert("Có lỗi bất định vui lòng thử lại sau");
      return;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main
      className="py-4"
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url(${BgImage})`,
      }}
    >
      <Container style={{ position: "relative" }}>
        <Row className="g-4 py-4">
          <div className="logout-btn" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>

          <style>
            {`.logout-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545; /* đỏ */
            color: white;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            transition: all 0.2s ease-in-out;
            z-index: 9999;
          }

          .logout-btn:hover {
            background: #bb2d3b;
            transform: scale(1.08);
          }
          `}
          </style>
          <Col xs={12} lg={6}>
            <Card className="shadow-lg border-light p-4 mb-4 text-center">
              <div className="d-flex flex-column align-items-center mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                  style={{ width: 60, height: 60, fontSize: 28 }}
                >
                  <FontAwesomeIcon icon={faUserClock} />
                </div>
                <h4 className="mb-2 fw-bold">Tài Khoản Đang Chờ Duyệt</h4>
              </div>

              <p className="text-muted mb-3" style={{ fontSize: "0.95rem" }}>
                Cảm ơn bạn đã đăng ký tham gia hệ thống Chuỗi Cung Ứng.
              </p>

              <p className="text-muted" style={{ fontSize: "0.95rem" }}>
                Hồ sơ của bạn đang được xác thực bởi quản trị viên.
                <br />
                Chúng tôi sẽ gửi thông báo ngay khi tài khoản được kích hoạt.
              </p>
            </Card>

            <Card className="shadow-lg border-light p-4">
              <h5 className="mb-4 d-flex align-items-center">
                <span
                  className="icon icon-xs bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: 28, height: 28 }}
                >
                  <FontAwesomeIcon icon={faHeadset} />
                </span>
                Thông Tin Liên Hệ
              </h5>

              <ul className="list-unstyled mb-0">
                <li className="mb-3 d-flex align-items-center">
                  <span
                    className="icon icon-sm bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: 36, height: 36 }}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <div>
                    <small className="text-muted d-block">Email hỗ trợ</small>
                    <strong className="text-dark">trungkakiu@gmail.com</strong>
                  </div>
                </li>

                <li className="mb-3 d-flex align-items-center">
                  <span
                    className="icon icon-sm bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: 36, height: 36 }}
                  >
                    <FontAwesomeIcon icon={faHeadset} />
                  </span>
                  <div>
                    <small className="text-muted d-block">Hotline</small>
                    <strong className="text-dark">0393 380 603</strong>
                  </div>
                </li>

                <li className="d-flex align-items-center">
                  <span
                    className="icon icon-sm bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: 36, height: 36 }}
                  >
                    <FontAwesomeIcon icon={faClock} />
                  </span>
                  <div>
                    <small className="text-muted d-block">Giờ làm việc</small>
                    <strong className="text-dark">
                      8:00 – 17:00 (T2 – T7)
                    </strong>
                  </div>
                </li>
              </ul>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="shadow-lg border-light p-4 h-100">
              <h5 className="mb-3">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Gửi Mail Hỗ Trợ
              </h5>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={mailData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tiêu đề email"
                    value={mailData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Nội dung</Form.Label>
                  <Form.Control
                    style={{ minHeight: "212px" }}
                    as="textarea"
                    rows={6}
                    placeholder="Mô tả vấn đề của bạn..."
                    value={mailData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                  />
                </Form.Group>

                <Button
                  className="w-100"
                  variant="primary"
                  disabled={isSending}
                  onClick={handleSendMail}
                >
                  {isSending ? (
                    "Đang gửi..."
                  ) : (
                    <>
                      {cooldown > 0 ? (
                        `Xin chờ ${cooldown} giây để gửi lại!`
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="me-2"
                          />
                          Gửi Email
                        </>
                      )}
                    </>
                  )}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default PendingActiveWithMail;
