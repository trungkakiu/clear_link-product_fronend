import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Dropdown,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faFilter,
  faSearch,
  faAddressCard,
  faIdBadge,
  faUsersCog,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/Manufacture/ProductionStaff.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import AddProductionStaffModal from "../Modal/Manufacture/AddProductionStaffModal";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";

const ProductionStaff = () => {
  const REACT_APP_API_IMAGE_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [modelState, setmodalState] = useState(false);
  const [isload, setisload] = useState(true);
  const [staff, setstaff] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState({});
  const fileRef = useRef({});
  const [partment, setpartment] = useState([]);
  const [staff_filter, setstaff_filter] = useState({
    name: "",
    CCCD: "",
    part: "",
  });
  const { User } = useContext(UserContext);

  function openModel() {
    setmodalState(true);
  }

  function closeModel() {
    setmodalState(false);
    getProductionStaff();
  }

  useEffect(() => {
    getProductionStaff();
  }, []);

  const getProductionStaff = async () => {
    try {
      setisload(true);
      let res = null;
      if (User?.data?.role === "manufacturer") {
        res = await api_request.getProductionStaff(User);
      } else {
        res = await api_request.getStaffs(User);
      }

      if (res && res.RC == 200) {
        setstaff(res.RD.stafflist);
        setpartment(res.RD.department_list);
      }
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setTimeout(() => {
        setisload(false);
      }, 1000);
    }
  };

  const handleChangeRoleLevel = async () => {};

  const handleChangeDepartment = async (staffId, departmentId) => {
    try {
      const prevStaff = [...staff];
      if (departmentId === "-1") {
        return;
      }
      setstaff((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? {
                ...s,
                department_id: departmentId,
                department: partment.find((d) => d.id === departmentId) || null,
              }
            : s,
        ),
      );

      const res = await api_request.changePartment(User, staffId, departmentId);

      if (!res || res.RC !== 200) {
        setstaff(prevStaff);
        toast.error(res?.RM || "Cập nhật bộ phận thất bại");
      }
    } catch (error) {
      toast.error("Lỗi cập nhật bộ phận");
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(avatarPreview).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [avatarPreview]);

  const handleOpenFile = (id) => {
    const input = fileRef.current[id];
    if (input) input.click();
  };

  const handleSelectAvatar = async (staffId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Chỉ được chọn ảnh");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarPreview((prev) => ({
      ...prev,
      [staffId]: previewUrl,
    }));

    e.target.value = "";

    const res = await api_request.pushstaffAvatar(User, staffId, file);
    if (res && res.RC != 200) {
      setAvatarPreview((prev) => ({
        ...prev,
        [staffId]: "",
      }));
    }
  };

  const staff_filter_list = staff.filter((m) => {
    const nameMatch = m.actor_info?.name || m.name;
    const cccdMatch = m.actor_info?.personal_tax_code || m.CCCD;

    if (
      staff_filter.name &&
      !nameMatch?.toLowerCase().includes(staff_filter.name.toLowerCase())
    )
      return false;

    if (staff_filter.CCCD && cccdMatch !== staff_filter.CCCD) return false;

    if (staff_filter.part && m.department?.partname !== staff_filter.part)
      return false;

    return true;
  });

  const renderDynamicRoleOptions = () => {
    const companyRole = User?.role?.toLowerCase();

    if (companyRole === "transporter") {
      return (
        <>
          <option
            value="level_1"
            style={{ background: "#232f3e", color: "#fff" }}
          >
            Lv1: Tài xế thực thi
          </option>
          <option
            value="level_2"
            style={{ background: "#5dade2", color: "#fff" }}
          >
            Lv2: Đội trưởng tài xế
          </option>
          <option
            value="level_3"
            style={{ background: "#58d68d", color: "#fff" }}
          >
            Lv3: Điều phối viên
          </option>
          <option
            value="level_4"
            style={{ background: "#ff9900", color: "#fff" }}
          >
            Lv4: Quản lý đội xe
          </option>
          <option
            value="level_5"
            style={{ background: "#f8f9fa", color: "#333" }}
          >
            Lv5: Giám đốc vận hành
          </option>
        </>
      );
    }

    if (companyRole === "manufacturer") {
      return (
        <>
          <option
            value="level_1"
            style={{ background: "#232f3e", color: "#fff" }}
          >
            Lv1: Nhân viên sản xuất
          </option>
          <option
            value="level_2"
            style={{ background: "#5dade2", color: "#fff" }}
          >
            Lv2: Tổ trưởng (Leader)
          </option>
          <option
            value="level_3"
            style={{ background: "#58d68d", color: "#fff" }}
          >
            Lv3: Quản lý xưởng
          </option>
          <option
            value="level_4"
            style={{ background: "#af7ac5", color: "#fff" }}
          >
            Lv4: Tech Leader / QC
          </option>
          <option
            value="level_5"
            style={{ background: "#ff9900", color: "#fff" }}
          >
            Lv5: Giám đốc vận hành
          </option>
        </>
      );
    }

    return (
      <>
        <option
          value="level_1"
          style={{ background: "#232f3e", color: "#fff" }}
        >
          Lv1: Nhân viên
        </option>
        <option
          value="level_3"
          style={{ background: "#58d68d", color: "#fff" }}
        >
          Lv3: Quản lý kho / CH
        </option>
        <option
          value="level_4"
          style={{ background: "#af7ac5", color: "#fff" }}
        >
          Lv4: Kiểm định viên
        </option>
        <option
          value="level_5"
          style={{ background: "#ff9900", color: "#fff" }}
        >
          Lv5: Điều hành
        </option>
      </>
    );
  };

  if (isload) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          minHeight: "75vh",
        }}
      >
        <RocketLoad />
      </div>
    );
  }

  const getRoleLabel = (staff_role, level) => {
    const role = staff_role?.toLowerCase();

    const labels = {
      driver: "Tài xế",
      production: "Sản xuất",
      technical: "Kỹ thuật",
      qc: "Kiểm định (QC)",
      manager: "Quản lý",
      staff: "Nhân viên",
      leader: "Tổ trưởng",
      director: "Giám đốc",
    };

    const colors = {
      level_1: { bg: "#ebedef", color: "#232f3e" },
      level_2: { bg: "#5dade2", color: "#fff" },
      level_3: { bg: "#58d68d", color: "#fff" },
      level_4: { bg: "#af7ac5", color: "#fff" },
      level_5: { bg: "#ff9900", color: "#fff" },
    };

    return {
      text: `${labels[role] || "Nhân sự"} (${level?.replace("level_", "Lv")})`,
      ...(colors[level] || colors.level_1),
    };
  };

  const MobileStaffCard = ({ s }) => {
    const role = getRoleLabel(s.department?.role_level);
    return (
      <Card className="mb-3 border-0 shadow-sm">
        <Card.Body className="p-3">
          <div className="d-flex align-items-start gap-3">
            <img
              src={
                avatarPreview[s.id] ||
                `${REACT_APP_API_IMAGE_URL}main-card/${s.actor_info?.avatar || s.avatar}`
              }
              className="rounded shadow-sm"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
              alt="avatar"
              onClick={() => handleOpenFile(s.id)}
            />
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="mb-0 fw-bold text-main">
                  {s.actor_info?.name || s.name}
                </h6>
                <Badge bg={s.status === "working" ? "success" : "warning"}>
                  {s.status}
                </Badge>
              </div>

              <div className="mb-1">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faUsersCog} className="me-1" />
                  Cấp bậc:{" "}
                </small>
                <span
                  className="fw-bold small"
                  style={{ color: role.bg === "#f8f9fa" ? "#6c757d" : role.bg }}
                >
                  {role.text}
                </span>
              </div>

              <div>
                <small className="text-muted">
                  <FontAwesomeIcon icon={faBriefcase} className="me-1" />
                  Bộ phận:{" "}
                </small>
                <span className="fw-bold small text-dark">
                  {s.department?.partname || "Chưa phân"}
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="aws-staff-container py-3 px-2">
      <Card className="aws-header shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Row className="gy-3">
            {" "}
            <Col xs={12} lg={4}>
              <div className="d-flex align-items-center">
                <div
                  className="bg-aws-orange p-3 rounded-3 me-3 text-white"
                  style={{ background: "#ff9900" }}
                >
                  <FontAwesomeIcon icon={faIdBadge} size="lg" />
                </div>
                <div>
                  <h4 className="aws-title mb-0 fw-bold text-main">
                    Nhân sự sản xuất
                  </h4>
                  <p className="aws-subtitle text-muted small mb-0">
                    Quản lý {staff.length} hồ sơ nhân sự
                  </p>
                </div>
              </div>
            </Col>
            <Col xs={12} md={8} lg={6}>
              <Row className="g-2">
                <Col xs={6} md={6}>
                  <div className="input-group input-group-sm border rounded bg-white">
                    <span className="input-group-text bg-transparent border-0">
                      <FontAwesomeIcon icon={faSearch} />
                    </span>
                    <Form.Control
                      className="border-0 shadow-none"
                      placeholder="Tên/CCCD..."
                      value={staff_filter.name}
                      onChange={(e) =>
                        setstaff_filter({
                          ...staff_filter,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                </Col>
                <Col xs={6} md={6}>
                  <Form.Select
                    size="sm"
                    className="border shadow-none"
                    value={staff_filter.part}
                    onChange={(e) =>
                      setstaff_filter({ ...staff_filter, part: e.target.value })
                    }
                  >
                    <option value="">-- Bộ phận --</option>
                    {partment.map((d) => (
                      <option key={d.id} value={d.partname}>
                        {d.partname}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={2}>
              <Button
                onClick={openModel}
                className="btn-mobile-full shadow-sm border-0 w-100"
                style={{ background: "#ff9900", color: "white" }}
              >
                <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Thêm mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm d-none d-md-block overflow-hidden">
        <Table
          hover
          responsive
          className="aws-table mb-0 align-middle text-center"
        >
          <thead>
            <tr>
              <th></th>
              <th>Nhân sự</th>
              <th>Liên hệ</th>
              <th>Trạng thái</th>
              <th>Cấp bậc</th>
              <th>Bộ phận công tác</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff_filter_list.map((s) => {
              const roleInfo = getRoleLabel(
                s.staff_role,
                s.department?.role_level || s.level,
              );

              return (
                <tr key={s.id}>
                  <td>
                    <input
                      type="file"
                      hidden
                      ref={(el) => (fileRef.current[s.id] = el)}
                      onChange={(e) => handleSelectAvatar(s.id, e)}
                      accept="image/*"
                    />

                    <div className="d-flex align-items-center justify-content-center">
                      <div
                        className="staff-avatar-wrapper shadow-sm"
                        onClick={() => handleOpenFile(s.id)}
                      >
                        {avatarPreview[s.id] ||
                        s.actor_info?.avatar ||
                        s.avatar ? (
                          <img
                            src={
                              avatarPreview[s.id] ||
                              `${REACT_APP_API_IMAGE_URL}main-card/${s.actor_info?.avatar || s.avatar}`
                            }
                            className="img-staff"
                            alt="avatar"
                            style={{
                              width: "65px",
                              height: "65px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              cursor: "pointer",
                              border: "2px solid #fff",
                            }}
                          />
                        ) : (
                          <div
                            className="no-avatar-placeholder d-flex flex-column align-items-center justify-content-center"
                            style={{
                              width: "65px",
                              height: "65px",
                              borderRadius: "12px",
                              background: "#f3f3f3",
                              border: "2px dashed #dee2e6",
                              color: "#adb5bd",
                              cursor: "pointer",
                              fontSize: "10px",
                            }}
                          >
                            <span className="fw-bold">+ Ảnh</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div
                      className="text-start ps-2"
                      style={{ maxWidth: "200px" }}
                    >
                    
                      <div
                        className="fw-bold text-dark mb-0 text-truncate"
                        style={{ fontSize: "14px", lineHeight: "1.2" }}
                        title={s.actor_info?.name || s.name}
                      >
                        {s.actor_info?.name || s.name}
                      </div>

                      <div className="d-flex align-items-center mt-1">
                        <code
                          className="text-muted bg-light px-1 rounded"
                          style={{ fontSize: "10px", border: "1px solid #eee" }}
                        >
                          ID:{" "}
                          {s.actor_info?.personal_tax_code || s.CCCD || "N/A"}
                        </code>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="text-muted small mb-1">
                      {s.actor_info?.email || s.email}
                    </div>
                    <div className="fw-600 small text-dark">
                      {s.actor_info?.phone_number || s.phonenumber || "---"}
                    </div>
                  </td>

                  <td>
                    <Badge
                      pill
                      style={{ padding: "6px 12px", fontSize: "11px" }}
                      bg={s.status === "working" ? "success" : "warning"}
                    >
                      {s.status === "working" ? "Đang làm việc" : "Nghỉ phép"}
                    </Badge>
                  </td>

                  {/* CỘT CẤP BẬC: Tự động nhảy option theo Role công ty */}
                  <td>
                    <Form.Select
                      size="sm"
                      className="role-select-custom shadow-none mx-auto"
                      style={{
                        backgroundColor: roleInfo.bg,
                        color: roleInfo.color,
                        border: `1px solid ${roleInfo.bg === "#ebedef" ? "#dee2e6" : roleInfo.bg}`,
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "4px 10px",
                        textAlign: "center",
                        width: "170px",
                        cursor: "pointer",
                        appearance: "none",
                      }}
                      value={s.department?.role_level || s.level || ""}
                      onChange={(e) =>
                        handleChangeRoleLevel(s.id, e.target.value)
                      }
                    >
                      <option value="">-- Cấp bậc hệ thống --</option>
                      {renderDynamicRoleOptions()}
                    </Form.Select>
                    <div className="mt-1">
                      <small
                        className="text-muted fw-bold"
                        style={{ fontSize: "9px" }}
                      >
                        VAI TRÒ: {s.staff_role?.toUpperCase() || "STAFF"}
                      </small>
                    </div>
                  </td>

                  {/* CỘT BỘ PHẬN: Hiển thị nổi khối rõ ràng */}
                  <td>
                    <Form.Select
                      size="sm"
                      className="mx-auto border shadow-none fw-bold text-main"
                      style={{
                        width: "190px",
                        fontSize: "13px",
                        borderRadius: "8px",
                        backgroundColor: s.department_id
                          ? "#f1faff"
                          : "#fff7e6",
                        borderColor: s.department_id ? "#d1e9ff" : "#ffe7ba",
                      }}
                      value={s.department_id || ""}
                      onChange={(e) =>
                        handleChangeDepartment(s.id, e.target.value)
                      }
                    >
                      <option value="-1">
                        {s.department?.partname
                          ? `📍 ${s.department.partname}`
                          : "⚠️ Chưa phân bộ phận"}
                      </option>
                      {partment.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.partname}
                        </option>
                      ))}
                    </Form.Select>
                  </td>

                  <td>
                    <Button
                      variant="link"
                      className="text-info p-0 hover-scale"
                      title="Xem hồ sơ chi tiết"
                    >
                      <FontAwesomeIcon icon={faAddressCard} size="lg" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <div className="d-md-none mt-2">
        {staff_filter_list.map((s) => (
          <MobileStaffCard key={s.id} s={s} />
        ))}
      </div>

      <AddProductionStaffModal
        show={modelState}
        onHide={() => setmodalState(false)}
        onHideLoad={() => closeModel()}
      />
    </div>
  );
};

export default ProductionStaff;
