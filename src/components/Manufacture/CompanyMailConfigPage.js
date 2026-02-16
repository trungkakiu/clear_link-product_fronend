import React, { useMemo, useState } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Collapse,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip,
} from "@themesberg/react-bootstrap";

import "../../scss/volt/components/Manufacture/CompanyMailConfigPage.scss";
import api_request from "../../apicontroller/api_request";

export default function CompanyMailConfigPage() {
  const [open, setOpen] = useState(false);
  const [valid_save, setvalidsave] = useState(false);
  const [mailConfig, setMailConfig] = useState({
    company_id: "",
    from_name: "",
    from_email: "",
    reply_to: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_secure: false,
    smtp_username: "",
    smtp_password_encrypted: "",
    provider: "custom",
    is_active: true,
    verified_at: null,
    last_test_status: null,
    last_test_message: "",
  });

  const [template, setTemplate] = useState({
    subject: "",
    html: "",
    text: "",
    category: "notification",
    receiver_type: "single",
    to_email: "",
    roles: [],
    external_emails: "",
  });

  const configReady = useMemo(() => {
    return (
      mailConfig.from_name &&
      mailConfig.from_email &&
      mailConfig.smtp_host &&
      mailConfig.smtp_username &&
      mailConfig.smtp_password_encrypted
    );
  }, [mailConfig]);

  const statusBadge = () => {
    if (!configReady) return <Badge bg="secondary">No Config</Badge>;
    if (!mailConfig.verified_at)
      return <Badge bg="warning">Not Verified</Badge>;
    if (!mailConfig.is_active) return <Badge bg="danger">Inactive</Badge>;
    return <Badge bg="success">Active</Badge>;
  };

  const onConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMailConfig((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onTemplateChange = (e) => {
    const { name, value } = e.target;
    setTemplate((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="company-mail-config mt-3">
      {/* ================= MAIL CONTACT CONFIG ================= */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Mail Contact Configuration</h5>
            {statusBadge()}
          </div>

          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setOpen(!open)}
          >
            {open ? "Thu gọn" : "Mở rộng"}
          </Button>
        </Card.Header>

        <Collapse in={open}>
          <div>
            <Card.Body>
              {/* ===== SENDER IDENTITY ===== */}
              <div>
                <h6 className="section-title">Sender Identity</h6>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Name</Form.Label>
                      <Form.Control
                        name="from_name"
                        value={mailConfig.from_name}
                        onChange={onConfigChange}
                        placeholder="ClearLink System"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="from_email"
                        value={mailConfig.from_email}
                        onChange={onConfigChange}
                        placeholder="noreply@company.com"
                      />
                      <Form.Text className="text-muted">
                        Usually same as SMTP Username
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* ===== SMTP CONFIG ===== */}
              <div className="">
                <h6 className="section-title">SMTP Credentials</h6>

                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>SMTP Host</Form.Label>
                      <Form.Control
                        name="smtp_host"
                        value={mailConfig.smtp_host}
                        onChange={onConfigChange}
                        placeholder="smtp.gmail.com"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Port</Form.Label>
                      <Form.Control
                        type="number"
                        name="smtp_port"
                        value={mailConfig.smtp_port}
                        onChange={onConfigChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Username</Form.Label>
                      <Form.Control
                        name="smtp_username"
                        value={mailConfig.smtp_username}
                        onChange={onConfigChange}
                        placeholder="noreply@company.com"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="smtp_password_encrypted"
                        value={mailConfig.smtp_password_encrypted}
                        onChange={onConfigChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Check
                    type="switch"
                    label="Use Secure Connection (SSL/TLS)"
                    name="smtp_secure"
                    checked={mailConfig.smtp_secure}
                    onChange={onConfigChange}
                  />
                </Form.Group>
              </div>

              {/* ===== OPTIONAL ===== */}
              <div style={{ marginTop: "20px" }} className="mb-4 mt-3">
                <h6 className="section-title">Optional</h6>

                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Reply To</Form.Label>
                      <Form.Control
                        type="email"
                        name="reply_to"
                        value={mailConfig.reply_to}
                        onChange={onConfigChange}
                        placeholder="support@company.com"
                      />
                      <Form.Text className="text-muted">
                        Leave empty if no replies expected
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* ===== ACTION BAR ===== */}
              <div className="action-bar">
                <div className="d-flex gap-2">
                  <Button disabled={!valid_save} variant="primary">
                    Save
                  </Button>
                  <Button variant="outline-secondary" disabled={!configReady}>
                    Test Connection
                  </Button>
                  <Button variant="outline-danger">Deactivate</Button>
                </div>

                <div className="meta">
                  <div>Last test: {mailConfig.last_test_status || "-"}</div>
                  <div>Verified at: {mailConfig.verified_at || "-"}</div>
                </div>
              </div>
            </Card.Body>
          </div>
        </Collapse>
      </Card>

      {/* ================= MAIL TEMPLATE ================= */}
      <Card className="position-relative">
        <Card.Header>
          <h5 className="mb-0">Mail Template & Receiver</h5>
        </Card.Header>

        <Card.Body
          style={{
            opacity: configReady ? 1 : 0.4,
            pointerEvents: configReady ? "auto" : "none",
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Mail Subject</Form.Label>
            <Form.Control
              name="subject"
              value={template.subject}
              onChange={onTemplateChange}
              placeholder="Ví dụ: {company_name} thông báo hệ thống"
            />
          </Form.Group>

          <Tabs className="mb-3">
            <Tab eventKey="html" title="HTML Content">
              <Form.Control
                as="textarea"
                rows={6}
                name="html"
                value={template.html}
                onChange={onTemplateChange}
              />
            </Tab>
            <Tab eventKey="text" title="Plain Text">
              <Form.Control
                as="textarea"
                rows={6}
                name="text"
                value={template.text}
                onChange={onTemplateChange}
              />
            </Tab>
          </Tabs>

          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mail Category</Form.Label>
                <Form.Select
                  name="category"
                  value={template.category}
                  onChange={onTemplateChange}
                >
                  <option value="system">System</option>
                  <option value="notification">Notification</option>
                  <option value="otp">OTP</option>
                  <option value="marketing">Marketing</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Receiver Type</Form.Label>
                <Form.Select
                  name="receiver_type"
                  value={template.receiver_type}
                  onChange={onTemplateChange}
                >
                  <option value="single">Single Email</option>
                  <option value="role">By Role</option>
                  <option value="external">External List</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3">
            {template.receiver_type === "single" && (
              <Form.Control
                placeholder="user@email.com"
                name="to_email"
                value={template.to_email}
                onChange={onTemplateChange}
              />
            )}

            {template.receiver_type === "external" && (
              <Form.Control
                as="textarea"
                rows={3}
                name="external_emails"
                value={template.external_emails}
                onChange={onTemplateChange}
                placeholder="a@x.com, b@y.com"
              />
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary">Send Test Mail</Button>
            <Button variant="success">Save Template</Button>
          </div>
        </Card.Body>

        {!configReady && (
          <div
            className="position-absolute top-50 start-50 translate-middle bg-white p-3 rounded shadow"
            style={{ zIndex: 5 }}
          >
            <strong>Chưa cấu hình Mail Contact</strong>
            <div className="text-muted small mt-1">
              Vui lòng cấu hình SMTP & người gửi để sử dụng phần này
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
