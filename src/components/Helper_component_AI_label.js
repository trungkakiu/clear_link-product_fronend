import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import "../scss/volt/components/Helper_component_AI_label.scss";

import {
  faBoxOpen,
  faHashtag,
  faInfoCircle,
  faMapMarkerAlt,
  faCalendarAlt,
  faLink,
  faCheckCircle,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Col, Row } from "@themesberg/react-bootstrap";

const ShipmentCard = ({ data }) => {
  const orderId = data["Mã đơn hàng"] || data.ID || "N/A";
  const status = data["Trạng thái"] || data.Status || "Unknown";
  const destination = data["Điểm đến"] || data["Đến"] || "Chưa cập nhật";
  const createdAt = data["Ngày tạo"] || data["Ngày"];
  const blockchain = data["Blockchain"];

  const getStatusStyle = (s) => {
    const str = s?.toLowerCase() || "";
    if (str.includes("delivered") || str.includes("thành công"))
      return "success";
    if (str.includes("in_progress") || str.includes("đang giao"))
      return "warning";
    return "default";
  };

  return (
    <div className="shipment-card-dark">
      <div className="card-top">
        <div className="id-block">
          <FontAwesomeIcon icon={faBox} className="icon-box" />
          <span className="id-text">#{orderId}</span>
        </div>
      </div>
      <div className="card-info">
        <div className="info-item dest" title={destination}>
          <FontAwesomeIcon icon={faMapMarkerAlt} className="fa-fw" />{" "}
          {destination}
        </div>
        <div className="info-item date">
          <FontAwesomeIcon icon={faCalendarAlt} className="fa-fw" />
          {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : "N/A"}
        </div>
      </div>

      {blockchain && (
        <Row className="mt-3 pt-2 border-top align-items-center">
          <Col xs={7}>
            {blockchain && (
              <div
                className="text-success fw-bold d-flex align-items-center"
                style={{ fontSize: "0.75rem", gap: "6px" }}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                {blockchain === "delivery_signed"
                  ? "Đã ký On-chain"
                  : blockchain}
              </div>
            )}
          </Col>

          <Col xs={5} className="text-end">
            <Badge
              bg={
                status?.toLowerCase().includes("delivered")
                  ? "success"
                  : status?.toLowerCase().includes("in_progress")
                    ? "warning"
                    : "secondary"
              }
              className="px-2 py-1 text-uppercase shadow-sm"
            >
              {status}
            </Badge>
          </Col>
        </Row>
      )}
    </div>
  );
};

const ProfileCard = ({ data }) => (
  <div className="card-profile">
    <div className="card-header">
      <h4>👤 Hồ sơ TraceChain</h4>
      <span className={`badge ${data["Trạng thái"]}`}>
        {data["Trạng thái"]}
      </span>
    </div>

    <div className="profile-grid">
      <div className="info-item">
        <strong>Tên:</strong> <span>{data["Tên"]}</span>
      </div>
      <div className="info-item">
        <strong>Email:</strong> <span>{data["Email"]}</span>
      </div>
      <div className="info-item">
        <strong>Số điện thoại:</strong> <span>{data["Số điện thoại"]}</span>
      </div>
      <div className="info-item">
        <strong>Vai trò:</strong> <span>{data["Vai trò"]}</span>
      </div>
      <div className="info-item full-width">
        <strong>Địa chỉ:</strong> <span>{data["Địa chỉ"]}</span>
      </div>
      <div className="info-item full-width blockchain-info">
        <strong>Ví Blockchain:</strong>
        <code title={data["Ví Blockchain (Public Key)"]}>
          {data["Ví Blockchain (Public Key)"]?.slice(0, 15)}...
          {data["Ví Blockchain (Public Key)"]?.slice(-10)}
        </code>
      </div>
    </div>
  </div>
);

export const MessageRenderer = ({ msg }) => {
  if (msg.contentType === "general_text" || msg.id === "streaming") {
    console.log(msg.contentType);
    return <div className="text-content">{msg.text}</div>;
  }
  try {
    const jsonData = JSON.parse(msg.text);
    console.log(msg.contentType);
    switch (msg.contentType) {
      case "shipping_card":
        return (
          <ShipmentCard
            data={Array.isArray(jsonData) ? jsonData[0] : jsonData}
          />
        );

      case "shipping_list":
        const safeDataList = Array.isArray(jsonData) ? jsonData : [jsonData];

        return (
          <div className="shipping-list">
            {safeDataList.map((item, index) => (
              <ShipmentCard key={item.ID || index} data={item} />
            ))}
          </div>
        );

      case "profile_card":
        return <ProfileCard data={jsonData} />;

      default:
        return <div className="text-content">{msg.text}</div>;
    }
  } catch (e) {
    return <div className="text-content">{msg.text}</div>;
  }
};
