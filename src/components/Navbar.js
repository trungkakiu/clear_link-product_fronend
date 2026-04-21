import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import {
  faArrowRight,
  faBell,
  faCheckDouble,
  faChevronRight,
  faCog,
  faEnvelopeOpen,
  faMicrochip,
  faSearch,
  faSignOutAlt,
  faTruck,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {
  Row,
  Col,
  Nav,
  Form,
  Image,
  Navbar,
  Dropdown,
  Container,
  ListGroup,
  InputGroup,
  Badge,
} from "@themesberg/react-bootstrap";

import Profile3 from "../assets/img/team/profile-picture-3.jpg";
import { UserContext } from "../Context/UserContext";
import moment from "moment-timezone";
import { useHistory } from "react-router-dom";
import { Routes } from "../routes";
import { SocketContext } from "../Context/SocketProvider";

export default (props) => {
  const history = useHistory();
  const { notifications, markAsRead, markAllAsRead } =
    useContext(SocketContext);
  const { User, logout } = useContext(UserContext);
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const unreadNotifications = notifications.filter((n) => !n.read);
  const areNotificationsRead = unreadNotifications.length === 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const Notification = (props) => {
    const {
      id,
      linkToAction,
      message,
      status,
      createdAt,
      isSystemNotification,
      noitfi_level,
    } = props;

    const { markAsRead } = useContext(SocketContext);
    const history = useHistory();

    const isRead = status === "seen" || status === "read";
    const isUrgent = ["level_4", "level_5"].includes(noitfi_level);

    return (
      <>
        <style>
          {`
          .noti-wrapper {
            margin: 6px 10px;
            perspective: 1000px;
          }
          .noti-card {
            background: #ffffff;
            border-radius: 10px;
            border: 1px solid #edf2f7;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .noti-card.unread {
            background: linear-gradient(145deg, #ffffff, #f0f4ff);
            border-color: #dce4f7;
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.08);
          }
          .noti-card.urgent-unread {
            border-left: 3px solid #f02849;
            background: linear-gradient(145deg, #ffffff, #fff5f6);
          }
          .noti-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
            border-color: #cbd5e0;
          }
          .icon-visual {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 8px;
            background: #f7fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
          }
          .unread .icon-visual {
            background: #fff;
            box-shadow: inset 0 0 0 1px #e2e8f0;
          }
          .urgent-unread .icon-visual {
            background: #f02849;
            color: #fff !important;
          }
          .text-msg {
            font-size: 0.78rem;
            line-height: 1.25;
            color: #2d3748;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .read .text-msg { color: #718096; }
          
          @keyframes border-glow {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          .urgent-glow {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border: 1.5px solid #f02849;
            border-radius: 10px;
            animation: border-glow 2s infinite;
            pointer-events: none;
          }
        `}
        </style>

        <div className="noti-wrapper" style={{ cursor: "pointer" }}>
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              markAsRead(id);

              if (linkToAction) {
                history.push(linkToAction);
              }
            }}
          >
            <div
              className={`noti-card p-2 d-flex align-items-center cursor-pointer ${!isRead ? "unread" : "read"} ${isUrgent && !isRead ? "urgent-unread" : ""}`}
            >
              {isUrgent && !isRead && <div className="urgent-glow" />}

              <div
                className={`icon-visual me-2 ${isUrgent && !isRead ? "" : "text-primary"}`}
              >
                <FontAwesomeIcon
                  icon={isSystemNotification ? faMicrochip : faTruck}
                />
              </div>

              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex justify-content-between align-items-baseline">
                  <span
                    style={{ fontSize: "0.6rem", letterSpacing: "0.05em" }}
                    className={`fw-bold text-uppercase ${isUrgent && !isRead ? "text-danger" : "text-muted"}`}
                  >
                    {isSystemNotification ? "Core" : "Logistics"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    className="text-muted fw-bold ms-2"
                  >
                    {(() => {
                      if (!createdAt) return "Now";
                      const diff = moment().diff(moment(createdAt), "minutes");
                      if (diff < 1) return "Now";
                      if (diff < 60) return `${diff}m`;
                      if (diff < 1440) return `${Math.floor(diff / 60)}h`;
                      return `${Math.floor(diff / 1440)}d`;
                    })()}
                  </span>
                </div>

                <div className="text-msg my-1">{message}</div>

                <div
                  className="d-flex align-items-center justify-content-between"
                  style={{ height: "14px" }}
                >
                  <div className="d-flex align-items-center">
                    {!isRead && (
                      <Badge
                        bg={isUrgent ? "danger" : "primary"}
                        style={{ fontSize: "0.5rem", padding: "2px 5px" }}
                        className="me-2"
                      >
                        NEW
                      </Badge>
                    )}
                    {linkToAction && (
                      <span
                        style={{ fontSize: "0.6rem" }}
                        className="text-primary fw-bold"
                      >
                        View{" "}
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          style={{ fontSize: "0.45rem" }}
                        />
                      </span>
                    )}
                  </div>
                  {isRead && (
                    <FontAwesomeIcon
                      icon={faCheckDouble}
                      className="text-success"
                      style={{ fontSize: "0.6rem", opacity: 0.5 }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  };

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between w-100">
          <div className="d-flex align-items-center">
            <Form className="navbar-search">
              <Form.Group id="topbarSearch">
                <InputGroup className="input-group-merge search-bar">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control type="text" placeholder="Search" />
                </InputGroup>
              </Form.Group>
            </Form>
          </div>
          <Nav className="align-items-center">
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                as={Nav.Link}
                className="text-dark icon-notifications me-lg-3"
              >
                <span className="icon icon-sm position-relative">
                  <FontAwesomeIcon
                    icon={faBell}
                    className={!areNotificationsRead ? "bell-shake" : ""}
                  />

                  {!areNotificationsRead && (
                    <span className="icon-badge rounded-circle unread-notifications" />
                  )}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dashboard-dropdown notifications-dropdown dropdown-menu-lg dropdown-menu-center mt-2 py-0">
                <ListGroup className="list-group-flush">
                  <Nav.Link
                    href="#"
                    className="text-center text-primary fw-bold border-bottom border-light py-3"
                  >
                    Notifications
                  </Nav.Link>

                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <Notification key={`notification-${n.id}`} {...n} />
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted small">
                        Không có thông báo mới
                      </div>
                    )}
                  </div>
                  <div className="d-flex border-top">
                    <Dropdown.Item
                      className="text-center text-primary fw-bold py-3 border-end"
                      onClick={() => markAllAsRead()}
                      style={{ fontSize: "0.75rem" }}
                    >
                      <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
                      Đọc tất cả
                    </Dropdown.Item>

                    <Dropdown.Item
                      className="text-center text-primary fw-bold py-3"
                      onClick={() => history.push("/#")}
                      style={{ fontSize: "0.75rem" }}
                    >
                      View all
                    </Dropdown.Item>
                  </div>
                </ListGroup>
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-2">
                <div className="media d-flex align-items-center">
                  <Image
                    style={{ border: "2px solid grey" }}
                    src={
                      User?.data?.avatar
                        ? `${API_URL}User-avatar/${User?.data?.avatar}`
                        : Profile3
                    }
                    className="user-avatar md-avatar rounded-circle"
                  />
                  <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">
                      {User?.data?.name}
                    </span>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                <Dropdown.Item
                  onClick={() => {
                    if (Routes && Routes.User_profile) {
                      history.push(Routes.User_profile.path);
                    } else {
                      console.error(
                        "Cấu hình Routes.User_profile chưa tồn tại!",
                      );

                      history.push("/user/my");
                    }
                  }}
                  className="fw-bold"
                >
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> My
                  Profile
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faCog} className="me-2" /> Settings
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faEnvelopeOpen} className="me-2" />{" "}
                  Messages
                </Dropdown.Item>
                <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faUserShield} className="me-2" />{" "}
                  Support
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={() => handleLogout()}
                  className="fw-bold"
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-danger me-2"
                  />{" "}
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};
