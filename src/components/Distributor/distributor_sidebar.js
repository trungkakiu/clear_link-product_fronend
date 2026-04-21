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
  faBoxes,
  faShoppingBag,
  faTruckLoading,
  faExchangeAlt,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, Nav, Badge, Dropdown } from "@themesberg/react-bootstrap";
import { Routes } from "../../routes";

const Distributor_sidebar = ({ level, onCollapse }) => {
  const location = useLocation();
  const { pathname } = location;

  const userLevelNum = parseInt(level?.split("_")[1]) || 0;

  const MENU_STRUCTURE = [
    {
      title: "Quản lí kho",
      eventKey: "warehouse/",
      icon: faBoxes,
      minLevel: 1,
      children: [
        {
          title: "Tổng kho",
          link: Routes.Distributor_inventory.path,
          minLevel: 1,
        },
        {
          title: "Nhập hàng",
          link: Routes.order_trackking.path,
          minLevel: 2,
        },
        {
          title: "Xuất hàng",
          link: Routes.Distributor_export.path,
          minLevel: 2,
        },
      ],
    },
    {
      title: "Quản lí đơn hàng",
      eventKey: "order/",
      icon: faShoppingBag,
      minLevel: 2,
      children: [
        {
          title: "Tạo đơn",
          link: Routes.Distributor_orders_new.path,
          minLevel: 2,
        },
        {
          title: "Đơn hiện hành",
          link: Routes.Distributor_orders_in.path,
          minLevel: 2,
        },
        {
          title: "Phân phối đơn",
          link: Routes.Distributor_orders_out.path,
          minLevel: 3,
        },
        {
          title: "Lịch sử",
          link: Routes.Distributor_order_history.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Giao hàng",
      eventKey: "delivery/",
      icon: faTruckLoading,
      minLevel: 2,
      children: [
        {
          title: "Đơn chờ vận chuyển",
          link: Routes.Distributor_wait_transport.path,
          minLevel: 2,
        },
        {
          title: "Đơn đang giao",
          link: Routes.Distributor_delivery_process.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Giao dịch",
      link: Routes.Distributor_transaction.path,
      icon: faExchangeAlt,
      minLevel: 1,
    },
    {
      title: "Blockchain Records",
      external: true,
      link: "#",
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
        // Kiểm tra level của Menu cha
        if (userLevelNum < menu.minLevel) return null;

        // Nếu có menu con, lọc các menu con theo level
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

        // Menu đơn (không có con)
        return <SidebarItem key={menu.title} {...menu} />;
      })}

      <Dropdown.Divider className="my-3 border-indigo" />
    </Nav>
  );
};

export default Distributor_sidebar;
