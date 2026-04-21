import React, { useContext, useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation } from "react-router-dom";

import { CSSTransition } from "react-transition-group";
import Manufacturer_sliderbar from "./Manufacture/Manufactor_sliderbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBoxOpen,
  faChartPie,
  faCog,
  faFileAlt,
  faHandHoldingUsd,
  faSignOutAlt,
  faTable,
  faTimes,
  faCalendarAlt,
  faMapPin,
  faInbox,
  faRocket,
  faHandshake,
  faLayerGroup,
  faTractor,
  faTruck,
  faFolderOpen,
  faCaretRight,
  faMapMarkedAlt,
  faCarSide,
  faUserTie,
  faExchangeAlt,
  faShoppingBag,
  faBoxes,
  faTruckLoading,
  faCartArrowDown,
  faCashRegister,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  Nav,
  Badge,
  Image,
  Button,
  Dropdown,
  Accordion,
  Navbar,
} from "@themesberg/react-bootstrap";
import { Link } from "react-router-dom";

import { Routes } from "../routes";
import ThemesbergLogo from "../assets/img/themesberg.svg";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import { UserContext } from "../Context/UserContext";
import Transporter_sidebar from "./Transporter/transporter_sidebar";
import Retailer_sideber from "./Retailer/Retailer_sideber";
import Distributor_sidebar from "./Distributor/distributor_sidebar";

export default (props = {}) => {
  const location = useLocation();
  const { User } = useContext(UserContext);

  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";
  const { pathname } = location;

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children = null } = props;
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button
            as={Nav.Link}
            className="d-flex justify-content-between align-items-center"
          >
            <span>
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav
              style={{ transform: "translateX(-20px)" }}
              className="flex-column"
            >
              {children}
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = (props) => {
    const {
      title,
      link,
      external,
      target,
      icon,
      image,
      badgeText,
      badgeBg = "secondary",
      badgeColor = "primary",
    } = props;
    const classNames = badgeText
      ? "d-flex justify-content-start align-items-center justify-content-between"
      : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link
          {...linkProps}
          to={"#"}
          target={target}
          className={classNames}
        >
          <span>
            {icon ? (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
            ) : null}
            {image ? (
              <Image
                src={image}
                width={20}
                height={20}
                className="sidebar-icon svg-icon"
              />
            ) : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge
              pill
              bg={badgeBg}
              text={badgeColor}
              className="badge-md notification-count ms-2"
            >
              {badgeText}
            </Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  const UserLevelBox = ({ level }) => {
    const levelNum = level?.split("_")[1] || "0";

    const rankNames = {
      1: "Staff",
      2: "Lead",
      3: "Manager",
      4: "Inspector",
      5: "Director",
    };

    return (
      <div className="user-level-container">
        <span className="level-label">Clearlink Authority</span>
        <div className="level-value-wrapper">
          <div className="level-indicator"></div>
          <span className="level-value">{rankNames[levelNum] || "Guest"}</span>
        </div>

        <div className="mt-3" style={{ position: "relative" }}>
          <div
            style={{
              height: "3px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(parseInt(levelNum) / 5) * 100}%`,
                background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)",
                transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span style={{ fontSize: "9px", color: "#4b5563" }}>LV.0</span>
            <span
              style={{ fontSize: "9px", color: "#fbbf24", fontWeight: "bold" }}
            >
              LV.{levelNum}
            </span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand
          className="me-lg-5"
          as={Link}
          to={Routes.DashboardOverview.path}
        >
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle
          as={Button}
          aria-controls="main-navbar"
          onClick={onCollapse}
        >
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>

      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}
        >
          <div className="sidebar-inner px-4 pt-3">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button
                    as={Link}
                    variant="secondary"
                    size="xs"
                    to={Routes.Signin.path}
                    className="text-dark"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />{" "}
                    Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link
                className="collapse-close d-md-none"
                onClick={onCollapse}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>

            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title="Clearlink Controll" image={ReactHero} />
              <UserLevelBox level={User?.data?.level} />
              <NavItem
                title="Overview"
                onClick={() => {
                  console.log("Navigating to Dashboard Overview");
                }}
                link={Routes.DashboardOverview.path}
                icon={faChartPie}
              />

              {User?.data.role === "manufacturer" && (
                <Manufacturer_sliderbar
                  level={User.data.level}
                  onCollapse={() => setShow(false)}
                />
              )}

              {User?.data.role === "transporter" && (
                <Transporter_sidebar
                  level={User.data.level}
                  onCollapse={() => setShow(false)}
                />
              )}

              {User?.data.role === "distributor" && (
                <Distributor_sidebar
                  level={User.data.level}
                  onCollapse={() => setShow(false)}
                />
              )}

              {User?.data.role === "retailer" && (
                <Retailer_sideber
                  level={User.data.level}
                  onCollapse={() => setShow(false)}
                />
              )}

              <NavItem
                external
                title="Themesberg"
                target="_blank"
                link={"#"}
                image={ThemesbergLogo}
              />
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
