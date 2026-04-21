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
  faCartArrowDown,
  faBoxes,
  faCashRegister,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, Nav, Badge, Dropdown } from "@themesberg/react-bootstrap";
import { Routes } from "../../routes";

const Retailer_sideber = ({ level, onCollapse }) => {
  const location = useLocation();
  const { pathname } = location;

  const userLevelNum = parseInt(level?.split("_")[1]) || 0;
  const MENU_STRUCTURE = [
    {
      title: "Nhập hàng",
      eventKey: "import/",
      icon: faCartArrowDown,
      minLevel: 1,
      children: [
        {
          title: "Đơn nhận hàng",
          link: Routes.Retailer_import_request.path,
          minLevel: 1,
        },
        {
          title: "Lịch sử nhập",
          link: Routes.Retailer_import_history.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Tồn kho",
      eventKey: "inventory/",
      icon: faBoxes,
      minLevel: 1,
      children: [
        {
          title: "Danh sách hàng hóa",
          link: Routes.Retailer_inventory.path,
          minLevel: 1,
        },
        {
          title: "Kiểm tra sản phẩm",
          link: Routes.Retailer_check_item.path,
          minLevel: 1,
        },
      ],
    },
    {
      title: "Bán hàng",
      eventKey: "sale/",
      icon: faCashRegister,
      minLevel: 2,
      children: [
        {
          title: "Tạo hóa đơn",
          link: Routes.Retailer_new_invoice.path,
          minLevel: 2,
        },
        {
          title: "Hóa đơn gần đây",
          link: Routes.Retailer_invoice_history.path,
          minLevel: 3,
        },
      ],
    },
    {
      title: "Giao dịch",
      link: Routes.Retailer_transaction.path,
      icon: faExchangeAlt,
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

export default Retailer_sideber;
