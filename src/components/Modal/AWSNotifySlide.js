import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/pages/AWSNotifySlide.scss";

const AWSNotifySlide = ({ type = "success", message }) => {
  const [internalShow, setInternalShow] = useState(true);

  if (!internalShow) return null;

  return (
    <div className={`aws-slide-notify ${type} slide-in`}>
      <div className="notify-icon">
        <FontAwesomeIcon
          icon={type === "success" ? faCheckCircle : faTimesCircle}
        />
      </div>

      <div className="notify-body">
        <h6 className="notify-title">
          {type === "success" ? "Thành công" : "Thất bại"}
        </h6>
        <p className="notify-message">{message}</p>
      </div>

      <button className="notify-close" onClick={() => setInternalShow(false)}>
        <FontAwesomeIcon icon={faTimes} />
      </button>

      <div className="notify-progress-bar" />
    </div>
  );
};

export default AWSNotifySlide;
