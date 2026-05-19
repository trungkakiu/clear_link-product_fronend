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
import Driver_dashbroad from "./Driver_dashbroad";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import { Prev } from "@themesberg/react-bootstrap/lib/esm/PageItem";
import SystemLogTable from "../../components/SystemLogTable";

const canAccessDriverDashboard = (User) => {
  const data = User?.data;
  return !!(
    data &&
    data.role === "transporter" &&
    data.level === "level_1" &&
    data.status === "active"
  );
};

const ProtectedDriverRoute = ({ user, children }) => {
  const history = useHistory();

  useEffect(() => {
    if (!canAccessDriverDashboard(user)) {
      console.error(
        "[SECURITY] Unauthorized access attempt to Driver Dashboard",
      );

      window.location.replace("/");
    }
  }, [user]);

  if (!canAccessDriverDashboard(user)) return null;
  return children;
};

export default () => {
  const [dashboarddata, setdashborddata] = useState({});
  const history = useHistory();
  const { User } = useContext(UserContext);
  const isMounted = useRef(true);
  const [isload, setIsLoad] = useState(false);

  const [dashbroad, setdashbroad] = useState({
    performanceData: [],
    securityData: [],
    formattedActivityData: [],
    behaviorData: [],
    rawData: [],
  });

  const processDashboardData = (rawData) => {
    if (!rawData || rawData.length === 0)
      return {
        performanceData: [],
        securityData: [],
        actionTypeData: [],
        behaviorData: [],
      };

    const performanceData = rawData
      .map((item) => ({
        time: new Date(item.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        responseTime: item.response_time_ms,
        action: item.action_type,
      }))
      .reverse();

    const securityData = rawData.map((item) => ({
      id: item.id.substring(0, 8),
      diffScore: item.payload_diff_score,
      color: item.payload_diff_score > 0.7 ? "#ef4444" : "#3b82f6", 
      isWithinGeofence: item.is_within_geofence ? 1 : 0,
      riskLevel: item.risk_level || "low",
    }));

    const actionTypeData = rawData.reduce((acc, item) => {
      const type = item.action_type || "OTHER";
      const found = acc.find((d) => d.name === type);
      if (found) {
        found.value++;
      } else {
        acc.push({ name: type, value: 1 });
      }
      return acc;
    }, []);

    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      count: 0,
    }));
    rawData.forEach((item) => {
      if (item.hour_of_day !== null) hourly[item.hour_of_day].count++;
    });

    return {
      performanceData,
      securityData,
      actionTypeData, 
      behaviorData: hourly,
    };
  };

  const get_dashboard_overview = async (isFirstLoad = false) => {
    try {
      const userRole = User?.data?.level;
      if (!["level_4", "level_5"].includes(userRole)) {
        return;
      }

      if (isFirstLoad) setIsLoad(true);

      const res = await api_request.getDailyLogs(User);

      if (res && res.RC === 200) {
        const processedData = processDashboardData(res.RD);
        setdashbroad(processedData);
        setdashbroad((Prev) => ({
          ...Prev,
          rawData: res.RD,
        }));
      }
    } catch (error) {
      console.error("Lỗi load Dashboard:", error);
    } finally {
      if (isFirstLoad) setIsLoad(false);
    }
  };

  useEffect(() => {
    if (User?.data?.id) {
      get_dashboard_overview(true);
    }
  }, [User?.data?.id]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!User.Authen) {
      isMounted.current = false;
      history.replace("/authen/sign-in");
    } else if (
      User?.data?.level !== "level_1" &&
      User?.data?.role !== "transporter"
    ) {
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

  if (User?.data?.level === "level_1" && User?.data?.role === "transporter") {
    return (
      <ProtectedDriverRoute user={User}>
        <Driver_dashbroad />
      </ProtectedDriverRoute>
    );
  }

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

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

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

      {/* --- CÁC WIDGET KPI (GIỮ NGUYÊN) --- */}
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

      {/* --- PHẦN MỚI: BỘ 4 BIỂU ĐỒ AI LOGS --- */}

      <Row className="g-4 charts-row mb-4">
        <Col md={7}>
          <div
            className="chart-card chart-wrapper"
            style={{
              minHeight: "400px",
              padding: "25px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="chart-header mb-4">
              <h5 style={{ fontWeight: "700", color: "#1f2937" }}>
                Hiệu năng Phản hồi (Response Time)
              </h5>
              <small style={{ color: "#6b7280" }}>
                Đo lường độ trễ hệ thống theo thời gian thực (ms)
              </small>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashbroad.performanceData}>
                <defs>
                  <linearGradient
                    id="colorResponse"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="time"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#10b981" }}
                />
                <Area
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorResponse)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
                  name="Thời gian (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col md={5}>
          <div
            className="chart-card chart-wrapper"
            style={{
              minHeight: "400px",
              padding: "25px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="chart-header mb-4">
              <h5 style={{ fontWeight: "700", color: "#1f2937" }}>
                Chỉ số Sai lệch (Integrity Score)
              </h5>
              <small style={{ color: "#6b7280" }}>
                Mức độ rủi ro bị can thiệp dữ liệu
              </small>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashbroad.securityData} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="id"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={[0, 1]}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                {/* Vẽ Bar xịn xò bo góc 4 phía */}
                <Bar
                  dataKey="diffScore"
                  radius={[6, 6, 6, 6]}
                  name="Mức sai lệch"
                >
                  {dashbroad.securityData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.diffScore > 0.7 ? "#ef4444" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>

      {/* Hàng 2: Pie Chart (Donut) & Bar Chart */}
      <Row className="g-4 charts-row mb-4">
        <Col md={5}>
          <div
            className="chart-card chart-wrapper"
            style={{
              minHeight: "350px",
              padding: "25px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="chart-header mb-4 text-center">
              <h5 style={{ fontWeight: "700", color: "#1f2937" }}>
                Tỷ lệ Loại tác động (CRUD)
              </h5>
              <small style={{ color: "#6b7280" }}>
                Phân bổ các hành động trên hệ thống
              </small>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashbroad.actionTypeData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dashbroad.actionTypeData?.map((entry, index) => {
                    // Set màu "phong thủy" cho từng loại CRUD
                    let color = "#3b82f6"; // Mặc định Blue
                    if (entry.name.includes("CREATE")) color = "#10b981"; // Green cho Create
                    if (entry.name.includes("UPDATE")) color = "#f59e0b"; // Orange cho Update
                    if (entry.name.includes("DELETE")) color = "#ef4444"; // Red cho Delete
                    if (entry.name.includes("BC_PUSH")) color = "#8b5cf6"; // Purple cho Blockchain

                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>

        <Col md={7}>
          <div
            className="chart-card chart-wrapper"
            style={{
              minHeight: "350px",
              padding: "25px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f3f4f6",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="chart-header mb-4">
              <h5 style={{ fontWeight: "700", color: "#1f2937" }}>
                Hoạt động theo Khung giờ
              </h5>
              <small style={{ color: "#6b7280" }}>
                Tần suất thao tác trên hệ thống
              </small>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dashbroad.behaviorData}>
                <defs>
                  <linearGradient
                    id="colorBehavior"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="hour"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorBehavior)"
                  activeDot={{ r: 8, fill: "#f59e0b", strokeWidth: 0 }}
                  name="Số lần thao tác"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col xs={12}>
          <SystemLogTable logs={dashbroad?.rawData} />
        </Col>
      </Row>
      {/* --- PHẦN COMPANY OVERVIEW (GIỮ NGUYÊN) --- */}
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
                  {manu.production_capacity?.toLocaleString()} units/day
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
