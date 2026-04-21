// src/components/Notification/AWSNotificationBody.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faHandshake,
  faExclamationTriangle,
  faInfoCircle,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import "../scss/volt/pages/AWSNotificationBody.scss";

const AWSNotificationBody = ({ payload }) => {
  const { message, noitfi_level, linkToAction } = payload;

  const config = {
    level_4: {
      label: "Collaboration",
      icon: faHandshake,
      color: "#ec7211",
      bg: "#fff4e5",
    },
    level_5: {
      label: "Urgent",
      icon: faExclamationTriangle,
      color: "#d13212",
      bg: "#fdf3f2",
    },
    level_2: {
      label: "Success",
      icon: faBell,
      color: "#1d8102",
      bg: "#f3f9f1",
    },
    default: {
      label: "System",
      icon: faInfoCircle,
      color: "#0073bb",
      bg: "#f2f8ff",
    },
  }[noitfi_level] || {
    label: "Notice",
    icon: faInfoCircle,
    color: "#0073bb",
    bg: "#f2f8ff",
  };

  return (
    <div className="aws-modern-toast">
      <div
        className="aws-toast-side-accent"
        style={{ backgroundColor: config.color }}
      />

      <div className="aws-toast-main-content">
        <div className="aws-toast-upper">
          <div
            className="aws-toast-icon-wrapper"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            <FontAwesomeIcon icon={config.icon} />
          </div>
          <div className="aws-toast-title-area">
            <span className="aws-toast-label" style={{ color: config.color }}>
              {config.label}
            </span>
            <span className="aws-toast-time">Just now</span>
          </div>
        </div>

        <div className="aws-toast-middle">
          <p className="aws-toast-text">{message}</p>
        </div>

        {linkToAction && (
          <div className="aws-toast-lower">
            <button
              className="btn-aws-modern-action"
              style={{ backgroundColor: config.color }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = linkToAction;
              }}
            >
              <span>Review Detail</span>
              <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSNotificationBody;
