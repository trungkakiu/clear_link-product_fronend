import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Nav,
  Tab,
  Container,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faBusinessTime,
  faEnvelope,
  faPhone,
  faPaperPlane,
  faInbox,
  faPlus,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../../scss/volt/components/Manufacture/aws-collaboration.scss";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import CollaborationDetailModal from "../Modal/Manufacture/CollaborationDetailModal";
import { useLocation } from "react-router-dom";

const CollaborationProposals = () => {
  const [data, setData] = useState({ received: [], sent: [] });
  const [isLoad, setIsLoad] = useState(false);
  const { User } = useContext(UserContext);
  const [modalState, setmodalState] = useState({
    partner: false,
    otp: false,
  });
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const highlineId = query.get("highline");
  const isModalNeeded = query.get("openModal") === "true";
  const [modalData, setmodalData] = useState({
    partner: null,
    isSend: false,
  });
  const [activeTab, setActiveTab] = useState("received");
  useEffect(() => {
    if (
      !isLoad &&
      (data.received.length > 0 || data.sent.length > 0) &&
      highlineId
    ) {
      const targetId = String(highlineId);

      const inReceived = data.received.find((o) => String(o.id) === targetId);
      const inSent = data.sent.find((o) => String(o.id) === targetId);
      const targetItem = inReceived || inSent;

      if (targetItem) {
        if (inSent && activeTab !== "sent") {
          setActiveTab("sent");
        } else if (inReceived && activeTab !== "received") {
          setActiveTab("received");
        }

        setTimeout(() => {
          const element = document.getElementById(`prop-card-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("aws-highline-active");
            setTimeout(
              () => element.classList.remove("aws-highline-active"),
              4000,
            );
          }

          if (isModalNeeded) {
            openModal("partner", targetItem, !!inSent);
          }
        }, 600);
      }
    }
  }, [highlineId, isModalNeeded, data, isLoad]);
  const openModal = (key, data, isSend) => {
    setmodalState((prev) => ({
      ...prev,
      partner: true,
    }));
    setmodalData((prev) => ({
      ...prev,
      partner: data,
      isSend: isSend,
    }));
  };

  const closeModal = (key, reload) => {
    setmodalState((prev) => ({
      ...prev,
      partner: false,
    }));
    setmodalData((prev) => ({
      ...prev,
      partner: null,
      isSend: false,
    }));

    if (reload) {
      fetchData();
    }
  };

  const handleCancelRequest = (id, challen_code) => {
    try {
    } catch (error) {}
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoad(true);
      const res = await api_request.getCollaborationProposals(User);
      if (res?.RC === 200) {
        setData({
          received: res.RD.receiver_CollaborationProposals || [],
          sent: res.RD.sender_CollaborationProposals || [],
        });
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối máy chủ!");
    } finally {
      setIsLoad(false);
    }
  };

  const ProposalCard = ({ item, isSent }) => (
    <Col xs={12} sm={6} lg={4} xxl={3} className="mb-3 px-2">
      <Card
        id={`prop-card-${item.id}`}
        className={`aws-card-compact h-100 border-0 ${String(highlineId) === String(item.id) ? "aws-highline-init" : ""}`}
      >
        <Card.Body className="p-3 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <Badge className={`aws-badge-status ${item.status}`}>
              {item.status.toUpperCase()}
            </Badge>
            <span className="aws-text-muted x-small">
              <FontAwesomeIcon icon={faSync} className="me-1 fa-xs" />
              {moment(item.createdAt).fromNow()}
            </span>
          </div>

          <h6
            className="aws-company-title text-truncate mb-2"
            title={
              isSent
                ? item.receiver_data.receiver_company_name
                : item.sender_data.sender_company_name
            }
          >
            {isSent
              ? item.receiver_data.company_name !== "undefined"
                ? item.receiver_data.company_name
                : "Unknown Company"
              : item.sender_data.company_name}
          </h6>

          <div className="aws-info-row mb-2 d-flex align-items-center">
            <FontAwesomeIcon
              icon={faBusinessTime}
              className="me-2 text-secondary"
            />
            <span className="text-truncate small fw-bold text-dark">
              {item.collaboration_type || "Standard Partnership"}
            </span>
          </div>

          <div className="aws-proposal-preview-box mb-3">
            <p className="aws-proposal-text mb-0 line-clamp-3">
              {item.proposal_message ||
                "No specific proposal message provided for this request."}
            </p>
          </div>

          <div className="mt-auto">
            <div className="aws-divider mb-3" />

            <div className="aws-contact-preview mb-3">
              <div className="contact-item d-flex align-items-center text-truncate mb-1">
                <FontAwesomeIcon icon={faEnvelope} className="me-2 fa-fw" />
                <span className="small text-muted text-truncate">
                  {isSent
                    ? item.receiver_contact_email
                    : item.sender_contact_email}
                </span>
              </div>
              {!isSent && item.sender_contact_phone && (
                <div className="contact-item d-flex align-items-center text-truncate">
                  <FontAwesomeIcon icon={faPhone} className="me-2 fa-fw" />
                  <span className="small text-muted">
                    {item.sender_contact_phone}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline-primary"
              className="aws-btn-action w-100 py-2 fw-bold"
              onClick={() => openModal("partner", item, isSent)}
            >
              <FontAwesomeIcon icon={faEye} className="me-2" />
              {isSent ? "View Details" : "Review Proposal"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="aws-collaboration-wrapper p-0">
      <CollaborationDetailModal
        show={modalState.partner}
        onHide={() => closeModal("partner")}
        proposal={modalData?.partner}
        isSend={modalData?.isSend}
        closeReload={() => closeModal("partner", true)}
      />
      <div className="aws-toolbar shadow-sm">
        <div className="aws-container-limit d-flex flex-column flex-sm-row justify-content-between align-items-sm-center px-3 px-md-4 py-3">
          <div className="text-center text-sm-start mb-3 mb-sm-0">
            <h4 className="aws-page-title mb-1">Collaboration Management</h4>
            <p className="aws-page-subtitle mb-0 d-none d-md-block">
              Manage and track your business partnerships
            </p>
          </div>

          <div className="d-flex justify-content-center justify-content-sm-end gap-2">
            <Button
              variant="white"
              className="aws-btn-icon shadow-sm flex-grow-1 flex-sm-grow-0"
              onClick={fetchData}
            >
              <FontAwesomeIcon icon={faSync} spin={isLoad} />
              <span className="ms-2 d-sm-none">Refresh</span>{" "}
            </Button>

            <Button
              variant="primary"
              className="aws-btn-primary px-3 flex-grow-1 flex-sm-grow-0"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="aws-container-limit px-4 mt-4">
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav
            variant="tabs"
            className="aws-nav-tabs border-bottom-0 flex-nowrap overflow-auto hide-scrollbar"
          >
            <Nav.Item className="flex-shrink-0">
              <Nav.Link eventKey="received" className="px-3 px-md-4 fw-bold">
                <FontAwesomeIcon icon={faInbox} className="me-2" />
                <span className="d-inline-block">Received</span>
                <Badge bg="light" className="ms-2 text-dark border">
                  {data.received.length}
                </Badge>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-shrink-0">
              <Nav.Link eventKey="sent" className="px-3 px-md-4 fw-bold">
                <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                <span className="d-inline-block">Sent Requests</span>
                <Badge bg="light" className="ms-2 text-dark border">
                  {data.sent.length}
                </Badge>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="aws-tab-content p-4 bg-white shadow-sm border rounded-bottom">
            <Tab.Pane eventKey="received">
              <Row className="mx-n2">
                {data.received.length > 0 ? (
                  data.received.map((item) => (
                    <ProposalCard key={item.id} item={item} isSent={false} />
                  ))
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted italic">
                      No incoming requests found.
                    </p>
                  </div>
                )}
              </Row>
            </Tab.Pane>
            <Tab.Pane eventKey="sent">
              <Row className="mx-n2">
                {data.sent.length > 0 ? (
                  data.sent.map((item) => (
                    <ProposalCard key={item.id} item={item} isSent={true} />
                  ))
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted italic">
                      You haven't sent any proposals yet.
                    </p>
                  </div>
                )}
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </Container>
  );
};
export default CollaborationProposals;
