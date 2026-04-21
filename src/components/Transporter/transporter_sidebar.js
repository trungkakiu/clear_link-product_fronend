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
  faCarSide,
  faUserTie,
  faExchangeAlt,
  faMoneyCheckAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, Nav, Badge, Dropdown } from "@themesberg/react-bootstrap";
import { Routes } from "../../routes";

const Transporter_sidebar = ({ level, onCollapse }) => {
  const location = useLocation();
  const { pathname } = location;

  const userLevelNum = parseInt(level?.split("_")[1]) || 0;
  const MENU_STRUCTURE = [
    {
      title: "Quản lí đơn vận",
      eventKey: "order/",
      icon: faTruck,
      minLevel: 1,
      children: [
        {
          title: "Yêu cầu",
          link: Routes.order_trackking.path,
          minLevel: 2,
        },
        {
          title: "Lịch sử vận chuyển",
          link: Routes.Transporter_history.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Theo dõi lộ trình",
      eventKey: "tracking/",
      icon: faMapMarkedAlt,
      minLevel: 1,
      children: [
        {
          title: "Lộ trình",
          link: Routes.Transporter_map.path,
          minLevel: 1,
        },
        {
          title: "Điểm dừng",
          link: Routes.Transporter_checkpoint.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Quản lý tài xế",
      eventKey: "Users/",
      icon: faUsers,
      minLevel: 3,
      children: [
        {
          title: "Danh sách hiện hành",
          link: Routes.Production_staff.path,
          minLevel: 3,
        },
        { title: "Bộ phận", link: Routes.Department.path, minLevel: 5 },

        {
          title: "Thông báo",
          link: Routes.Staff_notification.path,
          minLevel: 3,
        },
      ],
    },
    {
      title: "Phương tiện",
      eventKey: "Vehicle/",
      icon: faCarSide,
      minLevel: 2,
      children: [
        {
          title: "Danh sách xe",
          link: Routes.Transporter_vehicle_list.path,
          minLevel: 2,
        },
        {
          title: "Thêm phương tiện",
          link: Routes.Transporter_vehicle_add.path,
          minLevel: 3,
        },
        {
          title: "Đội xe",
          link: Routes.Tranporter_fleet_list.path,
          minLevel: 4,
        },
        {
          title: "Thêm đội xe",
          link: Routes.Tranporter_fleet_new.path,
          minLevel: 4,
        },
        {
          title: "Bảo trì & nhật kí",
          link: Routes.Transporter_vehicle_service.path,
          minLevel: 2,
        },
      ],
    },

    {
      title: "Giao dịch",
      link: Routes.Transporter_transaction.path,
      icon: faExchangeAlt,
      minLevel: 1,
    },
    {
      title: "Dơn giá",
      link: Routes.Transporter_price_config.path,
      icon: faMoneyCheckAlt,
      minLevel: 5,
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
      eventKey: "policy/",
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
        {
          title: "Cài đặt",
          link: Routes.Settings.path,
          minLevel: 5,
        },
        {
          title: "Thông tin",
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

export default Transporter_sidebar;
