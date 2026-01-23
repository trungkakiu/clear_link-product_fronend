import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUserShield,
  faRocket,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { Col, Row, Button } from "@themesberg/react-bootstrap";

import { SalesValueWidget, BarChartWidget } from "../../components/Widgets";

import { totalOrders } from "../../data/charts";
import "../../scss/volt/components/Dashboard.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

export default () => {
  const [dashboarddata, setdashborddata] = useState({});
  const history = useHistory();
  const { User } = useContext(UserContext);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!User.Authen) {
      isMounted.current = false;
      history.replace("/authen/sign-in");
      return;
    } else {
      getdashborddata();
    }
  }, [User]);

  const getdashborddata = async () => {
    try {
      const res = await api_request.getdashboard(User);
      if (!isMounted.current) return;
      if (res?.RC === 200) {
        setdashborddata(res.RD);
      } else {
        toast.error(res?.RM || "Error");
      }
    } catch {
      toast.error("Internal server error");
    }
  };

  const dist = dashboarddata.distributors?.[0] || null;
  const trans = dashboarddata.Transporters?.[0] || null;
  const manu = dashboarddata.manufacturers?.[0] || null;
  const title =
    dashboarddata.distributors?.length > 0
      ? "Distributors"
      : dashboarddata.Transporters?.length > 0
      ? "Transporters"
      : dashboarddata.retailers?.length > 0
      ? "Retailers"
      : "Manufacturers";

  const title_btn =
    dashboarddata.distributors?.length > 0
      ? "Thêm đơn hàng"
      : dashboarddata.Transporters?.length > 0
      ? "Thêm đơn hàng"
      : dashboarddata.retailers?.length > 0
      ? "Thêm sản phẩm"
      : "Thêm lô sản xuất";

  return (
    <>
      <div className="header-pro mb-4 mt-3">
        <div className="left-area">
          <h2 className="dash-title">{title} Dashboard</h2>
          <p className="dash-subtitle">Welcome back, {dashboarddata.name}</p>
        </div>

        <Button className="btn-create-pro">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {title_btn}
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <div className="kpi-pro">
            <div className="kpi-icon-pro blue">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="kpi-value-pro">128</div>
            <div className="kpi-label-pro">Total Orders</div>
          </div>
        </Col>

        <Col md={4}>
          <div className="kpi-pro">
            <div className="kpi-icon-pro green">
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className="kpi-value-pro">16</div>
            <div className="kpi-label-pro">Linked Retailers</div>
          </div>
        </Col>

        <Col md={4}>
          <div className="kpi-pro">
            <div className="kpi-icon-pro yellow">
              <FontAwesomeIcon icon={faRocket} />
            </div>
            <div className="kpi-value-pro">97%</div>
            <div className="kpi-label-pro">Delivery Success Rate</div>
          </div>
        </Col>
      </Row>

      <Row className="g-4 charts-row mb-4">
        <Col md={7}>
          <div
            className="chart-card chart-wrapper"
            style={{ minHeight: "550px" }}
          >
            <div className="chart-header mb-4">
              <h5>Order Volume (Monthly)</h5>
              <span className="chart-badge">+6.2%</span>
            </div>

            <div className="chart-body">
              <SalesValueWidget height={100} value="58,200" percentage={6.2} />
            </div>
          </div>
        </Col>

        <Col md={5}>
          <div
            className="chart-card chart-wrapper"
            style={{ minHeight: "550px" }}
          >
            <div className="chart-header mb-4">
              <h5>Weekly Order Count</h5>
              <span className="chart-badge warning">+18.2%</span>
            </div>

            <div className="chart-body">
              <BarChartWidget
                value={452}
                percentage={18.2}
                data={totalOrders}
              />
            </div>
          </div>
        </Col>
      </Row>

      {dist && (
        <div className="company-pro mb-4">
          <h4 className="company-pro-title">Company Overview</h4>

          <Row className="gy-4 mt-2">
            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Company Name</span>
                <span className="info-value">{dist.company_name}</span>
              </div>

              <div className="info-box">
                <span className="info-label">License Number</span>
                <span className="info-value">{dist.license_number}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Warehouse Location</span>
                <span className="info-value">{dist.warehouse_location}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Delivery Capacity</span>
                <span className="info-value">{dist.delivery_capacity}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Contact Person</span>
                <span className="info-value">{dist.contact_person}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{dist.contact_number}</span>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {trans && (
        <div className="company-pro mb-4">
          <h4 className="company-pro-title">Company Overview</h4>

          <Row className="gy-4 mt-2">
            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Company Name</span>
                <span className="info-value">{trans.company_name}</span>
              </div>

              <div className="info-box">
                <span className="info-label">License Number</span>
                <span className="info-value">{trans.license_number}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Fleet count</span>
                <span className="info-value">{trans.fleet_count}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Operation area</span>
                <span className="info-value">{trans.operation_area}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Contact Person</span>
                <span className="info-value">{trans.contact_manager}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{trans.contact_phone}</span>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {manu && (
        <div className="company-pro mb-4">
          <h4 className="company-pro-title mb-3">Factory Overview</h4>

          <Row className="gy-4 mt-2">
            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Tên nhà máy</span>
                <span className="info-value">{manu.factory_name}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Mã số thuế</span>
                <span className="info-value">{manu.tax_code}</span>
              </div>

              <div className="info-box">
                <span className="info-label">License Number</span>
                <span className="info-value">{manu.license_number}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Vị trí nhà máy</span>
                <span className="info-value">{manu.location}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Production Capacity</span>
                <span className="info-value">
                  {manu.production_capacity.toLocaleString()} units/day
                </span>
              </div>

              <div className="info-box">
                <span className="info-label">Certifications</span>
                <span className="info-value">{manu.certifications}</span>
              </div>
            </Col>

            <Col md={4}>
              <div className="info-box">
                <span className="info-label">Contact Person</span>
                <span className="info-value">{manu.contact_person}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Phone Number</span>
                <span className="info-value">{manu.contact_phone}</span>
              </div>

              <div className="info-box">
                <span className="info-label">Trạng thái tài khoản</span>
                <span
                  className={`info-status ${
                    manu.status === "active" ? "active" : "inactive"
                  }`}
                >
                  {manu.status === "active"
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};
