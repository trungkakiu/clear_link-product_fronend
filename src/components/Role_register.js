import React, { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Distributor_register from "./Distributor_register";
import Manufacturer_register from "./Manufacture/Manufacturer_register";
import Retailer_register from "./Retailer_register";
import Transporter_register from "./Transporter_register";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../Context/UserContext";

const Role_register = () => {
  const history = useHistory();
  const location = useLocation();
  const role = location.state?.role;
  const { User, logout } = useContext(UserContext);

  useEffect(() => {
    if (User.data?.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  useEffect(() => {
    if (
      !role ||
      ![
        "Manufacturer",
        "Distributor",
        "Retailer",
        "Transporter",
        "customer",
      ].includes(role)
    ) {
      history.goBack();
    }
  }, [role]);

  return (
    <div>
      <div className="logout-btn" onClick={logout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
      </div>

      <style>
        {`.logout-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #dc3545; /* đỏ */
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: all 0.2s ease-in-out;
          z-index: 9999;
        }

        .logout-btn:hover {
          background: #bb2d3b;
          transform: scale(1.08);
        }
        `}
      </style>
      {role === "Manufacturer" && (
        <>
          <Manufacturer_register />
        </>
      )}
      {role === "Distributor" && (
        <>
          <Distributor_register />
        </>
      )}
      {role === "Retailer" && (
        <>
          <Retailer_register />
        </>
      )}
      {role === "Transporter" && (
        <>
          <Transporter_register />
        </>
      )}
      {role === "Customer" && <></>}
    </div>
  );
};

export default Role_register;
