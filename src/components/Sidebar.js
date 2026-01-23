import React, { useContext, useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
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

export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const { User } = useContext(UserContext);
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

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
  console.log("New product path:", Routes.New_product.path);
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
        <Nav.Link {...linkProps} target={target} className={classNames}>
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
              <NavItem
                title="Overview"
                link={Routes.DashboardOverview.path}
                icon={faChartPie}
              />

              {User.data.role === "manufacturer" && (
                <>
                  <CollapsableNavItem
                    eventKey="Products/"
                    title="Quản lí sản phẩm"
                    icon={faTable}
                  >
                    <NavItem
                      title="DS sản phẩm"
                      icon={faCaretRight}
                      link={Routes.Product_list.path}
                    />
                    <NavItem
                      title="Thêm sản phẩm"
                      icon={faCaretRight}
                      link={Routes.New_product.path}
                    />
                    <NavItem
                      title="Danh mục"
                      icon={faCaretRight}
                      link={Routes.ProductCategory.path}
                    />
                  </CollapsableNavItem>

                  <CollapsableNavItem
                    eventKey="Manufacturer/"
                    title="Quản lí sản xuất"
                    icon={faLayerGroup}
                  >
                    <NavItem
                      title="Tạo mới"
                      icon={faCaretRight}
                      link={Routes.Manufacturer_new.path}
                    />
                    <NavItem
                      title="Đang sản xuất"
                      icon={faCaretRight}
                      link={Routes.Manufacturer_process.path}
                    />
                    <NavItem
                      title="Đã hoàn thành"
                      icon={faCaretRight}
                      link={Routes.Manufacturer_complate.path}
                    />

                    <NavItem
                      title="QC Phản hồi"
                      icon={faCaretRight}
                      link={Routes.QCquantity.path}
                    />
                  </CollapsableNavItem>

                  <CollapsableNavItem
                    eventKey="bill/"
                    title="Quản lí phân phối"
                    icon={faHandshake}
                  >
                    <NavItem
                      title="Đơn yêu cầu"
                      icon={faCaretRight}
                      link={Routes.bill_request.path}
                    />
                    <NavItem
                      title="Đơn hiện hành"
                      icon={faCaretRight}
                      link={Routes.bill_process.path}
                    />
                    <NavItem
                      title="Lịch sử"
                      icon={faCaretRight}
                      link={Routes.bill_history.path}
                    />
                  </CollapsableNavItem>

                  <CollapsableNavItem
                    eventKey="order/"
                    title="Quản lị vận chuyển"
                    icon={faTruck}
                  >
                    <NavItem
                      title="Tạo yêu cầu"
                      icon={faCaretRight}
                      link={Routes.new_order.path}
                    />

                    <NavItem
                      title="Theo dõi lộ trình"
                      icon={faCaretRight}
                      link={Routes.order_trackking.path}
                    />
                    <NavItem
                      title="Lịch sử đơn vận"
                      icon={faCaretRight}
                      link={Routes.order_history.path}
                    />
                  </CollapsableNavItem>

                  <NavItem
                    title="Quản lí giao dịch"
                    icon={faInbox}
                    link={Routes.transaction.path}
                  />

                  <NavItem
                    external
                    title="Blockchain Records"
                    target="_blank"
                    icon={faCalendarAlt}
                  />

                  <NavItem
                    external
                    title="Hồ sơ pháp lí"
                    target="_blank"
                    icon={faFolderOpen}
                  />

                  <CollapsableNavItem
                    eventKey="tables/"
                    title="Hệ thống"
                    icon={faCog}
                  >
                    <NavItem title="Cài đặt" link={Routes.Settings.path} />
                    <NavItem title="Thông tin" link={Routes.Infomations.path} />
                  </CollapsableNavItem>

                  <Dropdown.Divider className="my-3 border-indigo" />
                </>
              )}

              {User.data.role === "transporter" && (
                <>
                  <CollapsableNavItem
                    eventKey="transport-order/"
                    title="Quản lí đơn vận"
                    icon={faTruck}
                  >
                    <NavItem
                      title="Nhận yêu cầu"
                      icon={faCaretRight}
                      link={Routes.Transporter_request.path}
                    />
                    <NavItem
                      title="Đơn đang giao"
                      icon={faCaretRight}
                      link={Routes.Transporter_process.path}
                    />
                    <NavItem
                      title="Lịch sử vận chuyển"
                      icon={faCaretRight}
                      link={Routes.Transporter_history.path}
                    />
                  </CollapsableNavItem>
                  <CollapsableNavItem
                    eventKey="tracking/"
                    title="Theo dõi lộ trình"
                    icon={faMapMarkedAlt}
                  >
                    <NavItem
                      title="Bản đồ lộ trình"
                      icon={faCaretRight}
                      link={Routes.Transporter_map.path}
                    />
                    <NavItem
                      title="Điểm dừng"
                      icon={faCaretRight}
                      link={Routes.Transporter_checkpoint.path}
                    />
                  </CollapsableNavItem>
                  <CollapsableNavItem
                    eventKey="vehicle/"
                    title="Phương tiện"
                    icon={faCarSide}
                  >
                    <NavItem
                      title="Danh sách xe"
                      icon={faCaretRight}
                      link={Routes.Transporter_vehicle_list.path}
                    />
                    <NavItem
                      title="Thêm phương tiện"
                      icon={faCaretRight}
                      link={Routes.Transporter_vehicle_add.path}
                    />
                    <NavItem
                      title="Bảo trì & nhật kí"
                      icon={faCaretRight}
                      link={Routes.Transporter_vehicle_service.path}
                    />
                  </CollapsableNavItem>

                  <CollapsableNavItem
                    eventKey="driver/"
                    title="Tài xế"
                    icon={faUserTie}
                  >
                    <NavItem
                      title="Danh sách tài xế"
                      icon={faCaretRight}
                      link={Routes.Transporter_driver_list.path}
                    />
                    <NavItem
                      title="Thêm tài xế"
                      icon={faCaretRight}
                      link={Routes.Transporter_driver_add.path}
                    />
                  </CollapsableNavItem>
                  <NavItem
                    title="Giao dịch"
                    icon={faExchangeAlt}
                    link={Routes.Transporter_transaction.path}
                  />

                  <NavItem
                    external
                    title="Blockchain Records"
                    target="_blank"
                    link={"#"}
                    icon={faCalendarAlt}
                  />

                  {/* Hồ sơ pháp lý */}
                  <NavItem
                    external
                    title="Hồ sơ pháp lí"
                    target="_blank"
                    link={"#"}
                    icon={faFolderOpen}
                  />

                  <CollapsableNavItem
                    eventKey="system/"
                    title="Hệ thống"
                    icon={faCog}
                  >
                    <NavItem title="Cài đặt" link={Routes.Settings.path} />
                    <NavItem title="Thông tin" link={Routes.Infomations.path} />
                  </CollapsableNavItem>

                  <Dropdown.Divider className="my-3 border-indigo" />
                </>
              )}

              {User.data.role === "distributor" && (
                <>
                  <CollapsableNavItem
                    eventKey="warehouse/"
                    title="Quản lí kho"
                    icon={faBoxes}
                  >
                    <NavItem
                      title="Tồn kho"
                      icon={faCaretRight}
                      link={Routes.Distributor_inventory.path}
                    />
                    <NavItem
                      title="Nhập hàng"
                      icon={faCaretRight}
                      link={Routes.Distributor_import.path}
                    />
                    <NavItem
                      title="Xuất hàng"
                      icon={faCaretRight}
                      link={Routes.Distributor_export.path}
                    />
                  </CollapsableNavItem>

                  {/* Đơn hàng */}
                  <CollapsableNavItem
                    eventKey="order/"
                    title="Quản lí đơn hàng"
                    icon={faShoppingBag}
                  >
                    <NavItem
                      title="Đơn từ Manufacturer"
                      icon={faCaretRight}
                      link={Routes.Distributor_orders_in.path}
                    />
                    <NavItem
                      title="Đơn gửi Retailer"
                      icon={faCaretRight}
                      link={Routes.Distributor_orders_out.path}
                    />
                    <NavItem
                      title="Lịch sử"
                      icon={faCaretRight}
                      link={Routes.Distributor_order_history.path}
                    />
                  </CollapsableNavItem>

                  {/* Lộ trình và giao hàng */}
                  <CollapsableNavItem
                    eventKey="delivery/"
                    title="Giao hàng"
                    icon={faTruckLoading}
                  >
                    <NavItem
                      title="Đơn chờ vận chuyển"
                      icon={faCaretRight}
                      link={Routes.Distributor_wait_transport.path}
                    />
                    <NavItem
                      title="Đơn đang giao"
                      icon={faCaretRight}
                      link={Routes.Distributor_delivery_process.path}
                    />
                  </CollapsableNavItem>

                  {/* Tài chính */}
                  <NavItem
                    title="Giao dịch"
                    icon={faExchangeAlt}
                    link={Routes.Distributor_transaction.path}
                  />

                  <NavItem
                    external
                    title="Blockchain Records"
                    target="_blank"
                    link={"#"}
                    icon={faCalendarAlt}
                  />

                  <CollapsableNavItem
                    eventKey="system/"
                    title="Hệ thống"
                    icon={faCog}
                  >
                    <NavItem title="Cài đặt" link={Routes.Settings.path} />
                    <NavItem title="Thông tin" link={Routes.Infomations.path} />
                  </CollapsableNavItem>

                  <Dropdown.Divider className="my-3 border-indigo" />
                </>
              )}

              {User.data.role === "retailer" && (
                <>
                  {/* Nhập hàng */}
                  <CollapsableNavItem
                    eventKey="import/"
                    title="Nhập hàng"
                    icon={faCartArrowDown}
                  >
                    <NavItem
                      title="Đơn nhận hàng"
                      icon={faCaretRight}
                      link={Routes.Retailer_import_request.path}
                    />
                    <NavItem
                      title="Lịch sử nhập"
                      icon={faCaretRight}
                      link={Routes.Retailer_import_history.path}
                    />
                  </CollapsableNavItem>

                  {/* Tồn kho */}
                  <CollapsableNavItem
                    eventKey="inventory/"
                    title="Tồn kho"
                    icon={faBoxes}
                  >
                    <NavItem
                      title="Danh sách hàng hóa"
                      icon={faCaretRight}
                      link={Routes.Retailer_inventory.path}
                    />
                    <NavItem
                      title="Kiểm tra sản phẩm"
                      icon={faCaretRight}
                      link={Routes.Retailer_check_item.path}
                    />
                  </CollapsableNavItem>

                  {/* Bán hàng */}
                  <CollapsableNavItem
                    eventKey="sale/"
                    title="Bán hàng"
                    icon={faCashRegister}
                  >
                    <NavItem
                      title="Tạo hóa đơn"
                      icon={faCaretRight}
                      link={Routes.Retailer_new_invoice.path}
                    />
                    <NavItem
                      title="Hóa đơn gần đây"
                      icon={faCaretRight}
                      link={Routes.Retailer_invoice_history.path}
                    />
                  </CollapsableNavItem>

                  {/* Giao dịch */}
                  <NavItem
                    title="Giao dịch"
                    icon={faExchangeAlt}
                    link={Routes.Retailer_transaction.path}
                  />

                  {/* Blockchain Explorer */}
                  <NavItem
                    external
                    title="Blockchain Records"
                    link={"#"}
                    target="_blank"
                    icon={faCalendarAlt}
                  />

                  <CollapsableNavItem
                    eventKey="system/"
                    title="Hệ thống"
                    icon={faCog}
                  >
                    <NavItem title="Cài đặt" link={Routes.Settings.path} />
                    <NavItem title="Thông tin" link={Routes.Infomations.path} />
                  </CollapsableNavItem>

                  <Dropdown.Divider className="my-3 border-indigo" />
                </>
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
