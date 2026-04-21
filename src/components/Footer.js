import React from "react";
import moment from "moment-timezone";
import { Row, Col, Card, Container } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faFingerprint,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";

export default (props) => {
  const currentYear = moment().get("year");

  return (
    <footer className="footer-ultra-clean py-4 py-lg-5">
      <Container>
        <div className="main-content-footer p-3 p-md-4 p-lg-5">
          <Row>
            {/* Cột 1: Brand - Luôn ưu tiên hàng đầu */}
            <Col
              xs={12}
              lg={5}
              className="text-center text-lg-start mb-4 mb-lg-0"
            >
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3">
                <div className="icon-wrap-ultra me-3">
                  <FontAwesomeIcon
                    icon={faFingerprint}
                    className="text-primary"
                  />
                </div>
                <div>
                  <h4 className="m-0 text-white fw-extrabold tracking-tight">
                    TraceChain
                  </h4>
                  <div className="d-flex align-items-center mt-1 justify-content-center justify-content-lg-start">
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-success dot-blink me-2"
                      style={{ fontSize: "7px" }}
                    />
                    <span className="font-mono x-small text-white-50">
                      NODE_CONNECTED
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-white-50 small px-2 px-lg-0 pe-lg-5">
                Hạ tầng chuỗi cung ứng phi tập trung. Bảo mật hóa dữ liệu và bọc
                thép quy trình vận hành toàn cầu.
              </p>
            </Col>

            {/* Cột 2: Stats - Tự động xuống hàng trên Mobile */}
            <Col xs={12} lg={4} className="mb-4 mb-lg-0">
              <div className="stats-container-responsive">
                <div className="stat-card">
                  <div className="label">LATENCY</div>
                  <div className="value">24ms</div>
                </div>
                <div className="stat-card">
                  <div className="label">UPTIME</div>
                  <div className="value">99.9%</div>
                </div>
                <div className="stat-card">
                  <div className="label">NET</div>
                  <div className="value">W-01</div>
                </div>
              </div>
            </Col>

            {/* Cột 3: Links - Gọn gàng cuối cùng */}
            <Col xs={12} lg={3} className="text-center text-lg-end">
              <div className="d-flex flex-column gap-2">
                <Card.Link href="#" className="footer-link-ultra">
                  Documentation
                </Card.Link>
                <Card.Link href="#" className="footer-link-ultra">
                  Security Audit
                </Card.Link>
                <Card.Link href="#" className="footer-link-ultra">
                  Node Admin
                </Card.Link>
              </div>
            </Col>
          </Row>
        </div>

        {/* Bottom Bar: Chống đè chữ trên mobile */}
        <div className="footer-bottom-ultra mt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 px-2">
          <div className="font-mono x-small text-white-25 text-center">
            © {currentYear} ClearLink Labs
          </div>
          <div className="font-mono x-small text-white-25 d-flex align-items-center">
            <FontAwesomeIcon icon={faTerminal} className="me-2" />
            <span className="d-none d-sm-inline">PROTOCOL_STABLE</span>
            <span className="d-inline d-sm-none">STABLE</span>
          </div>
        </div>
      </Container>

      <style>
        {`
          .footer-ultra-clean { background-color: #262B40; overflow: hidden; }
          
          .main-content-footer {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }

          .icon-wrap-ultra {
            width: 40px; height: 40px;
            background: rgba(45, 156, 219, 0.1);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem;
          }

          /* Vít ga Responsive cho Stats Grid */
          .stats-container-responsive {
            display: flex;
            justify-content: space-between;
            gap: 10px;
          }

          .stat-card {
            flex: 1;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.03);
            padding: 10px 5px;
            border-radius: 12px;
            text-align: center;
            min-width: 0; /* Chống tràn text */
          }

          .stat-card .label {
            font-size: 0.55rem;
            color: rgba(255, 255, 255, 0.3);
            font-weight: 800;
            letter-spacing: 0.5px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }

          .stat-card .value {
            font-family: 'SFMono-Regular', monospace;
            font-size: 0.8rem;
            color: #2D9CDB;
            font-weight: 700;
          }

          .footer-link-ultra {
            color: rgba(255, 255, 255, 0.5) !important;
            text-decoration: none !important;
            font-size: 0.8rem;
            transition: all 0.2s;
          }

          .footer-link-ultra:hover { color: #fff !important; }

          .font-mono { font-family: 'SFMono-Regular', monospace; }
          .x-small { font-size: 0.65rem; }
          .text-white-25 { color: rgba(255, 255, 255, 0.25); }
          
          @media (max-width: 991px) {
            .stats-container-responsive { max-width: 400px; margin: 0 auto; }
            .main-content-footer { border-radius: 15px; }
          }

          .dot-blink { animation: blink 2s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}
      </style>
    </footer>
  );
};
