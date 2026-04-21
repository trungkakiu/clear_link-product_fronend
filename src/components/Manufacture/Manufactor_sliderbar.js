import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faTable,
  faLayerGroup,
  faUsers,
  faHandshake,
  faTruck,
  faInbox,
  faCalendarAlt,
  faFolderOpen,
  faCog,
  faMapMarkedAlt,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, Nav, Badge, Dropdown } from "@themesberg/react-bootstrap";
import { Routes } from "../../routes";

const ManufacturerSidebar = ({ level, onCollapse }) => {
  const location = useLocation();
  const { pathname } = location;

  const userLevelNum = parseInt(level?.split("_")[1]) || 0;

  const MENU_STRUCTURE = [
    {
      title: "QR Scanner",
      eventKey: "/qr-scanner",
      link: Routes.Qr_scanner.path,
      icon: faQrcode,
      minLevel: 3,
    },
    {
      title: "Quản lý sản phẩm",
      eventKey: "Products/",
      icon: faTable,
      minLevel: 4,
      children: [
        { title: "DS sản phẩm", link: Routes.Product_list.path, minLevel: 4 },
        { title: "Thêm sản phẩm", link: Routes.New_product.path, minLevel: 4 },
        { title: "Danh mục", link: Routes.ProductCategory.path, minLevel: 4 },
        { title: "Bao bì", link: Routes.Product_box.path, minLevel: 4 },
      ],
    },
    {
      title: "Quản lý sản xuất",
      eventKey: "Manufacturer/",
      icon: faLayerGroup,
      minLevel: 2,
      children: [
        { title: "Tạo mới", link: Routes.Manufacturer_new.path, minLevel: 3 },
        {
          title: "Yêu cầu sản xuất",
          link: Routes.Manufacturer_ORM.path,
          minLevel: 4,
        },
        {
          title: "Đang sản xuất",
          link: Routes.Manufacturer_process.path,
          minLevel: 2,
        },
        { title: "QC Phản hồi", link: Routes.Manufacture_qc.path, minLevel: 3 },
        {
          title: "Kho thành phẩm",
          link: Routes.Manufacturer_complate.path,
          minLevel: 4,
        },
      ],
    },
    {
      title: "Quản lý nhân viên",
      eventKey: "Users/",
      icon: faUsers,
      minLevel: 4,
      children: [
        {
          title: "Kỹ thuật viên",
          link: Routes.Technical_staff.path,
          minLevel: 4,
        },
        {
          title: "Sản xuất viên",
          link: Routes.Production_staff.path,
          minLevel: 4,
        },
        { title: "Bộ phận", link: Routes.Department.path, minLevel: 5 },
        {
          title: "Thông báo",
          link: Routes.Staff_notification.path,
          minLevel: 4,
        },
      ],
    },
    {
      title: "Quản lý vận chuyển",
      eventKey: "order/",
      icon: faTruck,
      minLevel: 2,
      children: [
        { title: "Tạo yêu cầu", link: Routes.new_order.path, minLevel: 3 },
        {
          title: "Đơn hiện hành",
          link: Routes.order_trackking.path,
          minLevel: 1,
        },
        {
          title: "Lịch sử đơn vận",
          link: Routes.order_history.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Quản lý giao dịch",
      link: Routes.transaction.path,
      icon: faInbox,
      minLevel: 1,
    },
    {
      title: "Blockchain Records",
      external: true,
      link: "https://etherscan.io",
      target: "_blank",
      icon: faCalendarAlt,
      minLevel: 1,
    },
    {
      title: "Hồ sơ pháp lý",
      icon: faFolderOpen,
      eventKey: "/policy",
      minLevel: 4,
      children: [
        {
          title: "điều khoản",
          link: Routes.Manufacturer_policy.path,
          minLevel: 4,
        },
        {
          title: "Yêu cầu hợp tác",
          link: Routes.Manufacturer_contact_request.path,
          minLevel: 4,
        },
        {
          title: "Hợp đồng",
          link: Routes.Manufacturer_contractfile.path,
          minLevel: 4,
        },
      ],
    },
    {
      title: "Sàn giao dịch nội bộ",
      external: true,
      link: Routes.Internal_marketplace.path,
      icon: faMapMarkedAlt,
      minLevel: 5,
    },
    {
      title: "Hệ thống",
      eventKey: "system/",
      icon: faCog,
      minLevel: 4,
      children: [
        { title: "Cài đặt", link: Routes.Settings.path, minLevel: 4 },
        {
          title: "Doanh nghiệp",
          link: Routes.Infomations.path,
          minLevel: 1,
        },
      ],
    },
  ];

  const SidebarItem = (props) => {
    const {
      title,
      link,
      icon,
      badgeText,
      badgeBg = "secondary",
      badgeColor = "primary",
      external,
      target,
    } = props;
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName}>
        <Nav.Link
          {...linkProps}
          onClick={() => onCollapse()}
          target={target}
          className={
            badgeText ? "d-flex justify-content-between align-items-center" : ""
          }
        >
          <span>
            {icon && (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />
              </span>
            )}
            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText && (
            <Badge
              pill
              bg={badgeBg}
              text={badgeColor}
              className="badge-md ms-2"
            >
              {badgeText}
            </Badge>
          )}
        </Nav.Link>
      </Nav.Item>
    );
  };

  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children } = props;
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
                <FontAwesomeIcon icon={icon} />
              </span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column" style={{ marginLeft: "10px" }}>
              {children}
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <Nav className="flex-column pt-3 pt-md-0">
      {MENU_STRUCTURE.map((menu) => {
        if (userLevelNum < menu.minLevel) return null;
        if (menu.children) {
          const filteredChildren = menu.children.filter(
            (child) => userLevelNum >= child.minLevel,
          );
          if (filteredChildren.length === 0) return null;

          return (
            <CollapsableNavItem key={menu.eventKey} {...menu}>
              {filteredChildren.map((child, idx) => (
                <SidebarItem key={idx} {...child} icon={faCaretRight} />
              ))}
            </CollapsableNavItem>
          );
        }

        return <SidebarItem key={menu.title} {...menu} />;
      })}

      <Dropdown.Divider className="my-3 border-indigo" />
    </Nav>
  );
};

export default ManufacturerSidebar;
