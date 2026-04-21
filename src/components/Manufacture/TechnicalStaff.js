import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
} from "@themesberg/react-bootstrap";
import React, { useContext, useEffect, useRef, useState } from "react";
import "../../scss/volt/components/Manufacture/ProductionStaff.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import AddProductionStaffModal from "../Modal/Manufacture/AddProductionStaffModal";
import { toast } from "react-toastify";
import AddTechnicalStaffModal from "../Modal/Manufacture/AddTechnicalStaffModal";
import RocketLoad from "../../Utils/RocketLoad";

const TechnicalStaff = () => {
  const REACT_APP_API_IMAGE_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [modelState, setmodalState] = useState(false);
  const [isload, setisload] = useState(true);
  const fileRef = useRef({});
  const [staff, setstaff] = useState([]);
  const [partment, setpartment] = useState([]);
  const { User } = useContext(UserContext);
  const [avatarPreview, setAvatarPreview] = useState({});

  const handleOpenFile = (id) => {
    const input = fileRef.current[id];
    if (input) input.click();
  };

  useEffect(() => {
    return () => {
      Object.values(avatarPreview).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [avatarPreview]);

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

  const [staff_filter, setstaff_filter] = useState({
    name: "",
    CCCD: "",
    part: "",
  });
  function openModel() {
    setmodalState(true);
  }
  function closeModel() {
    setmodalState(false);
    getTechnicalStaff();
  }

  useEffect(() => {
    getTechnicalStaff();
  }, []);

  const getTechnicalStaff = async () => {
    try {
      setisload(true);
      const res = await api_request.getTechnicalStaff(User);
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

  const TechnicalStaffTable = ({ staffs = [] }) => {
    return (
      <Table responsive hover className="production-staff-table align-middle">
        <thead>
          <tr style={{ textAlign: "center" }}>
            <th>Avatar</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Bộ phận</th>
          </tr>
        </thead>

        <tbody style={{ textAlign: "center" }}>
          {staffs.map((s) => (
            <tr key={s.id}>
              <td>
                <input
                  type="file"
                  hidden
                  ref={(el) => (fileRef.current[s.id] = el)}
                  onChange={(e) => handleSelectAvatar(s.id, e)}
                />
                {avatarPreview[s.id] ? (
                  <img
                    onClick={() => handleOpenFile(s.id)}
                    src={avatarPreview[s.id]}
                    alt="avatar"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                ) : (
                  <>
                    {!s.avatar ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <span
                          style={{
                            width: "100px",
                            height: "100px",
                          }}
                          className="no_avatar"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenFile(s.id)}
                          >
                            + Avatar
                          </button>
                        </span>
                      </div>
                    ) : (
                      <img
                        onClick={() => handleOpenFile(s.id)}
                        src={`${REACT_APP_API_IMAGE_URL}main-card/${s.avatar}`}
                        alt="avatar"
                        style={{
                          cursor: "pointer",
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                  </>
                )}
              </td>
              <td>
                <div style={{ fontSize: "16px" }} className="fw-semibold">
                  {s.name}
                </div>
                <div style={{ fontSize: "15px" }} className="text-muted small">
                  {s.CCCD}
                </div>
              </td>
              <td style={{ fontSize: "16px" }}>{s.email}</td>

              <td style={{ fontSize: "16px" }}>{s.phonenumber || "-"}</td>
              <td>
                <Badge
                  style={{
                    height: "40px",
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "center",
                    justifyContent: "center",
                    alignContent: "center",
                    fontSize: "18px",
                  }}
                  bg={
                    s.status === "working"
                      ? "success"
                      : s.status === "on_leave"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {s.status}
                </Badge>
              </td>

              <td className="text-end">
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <select
                    className="form-select"
                    style={{
                      width: "220px",
                      height: "42px",
                      borderRadius: "6px",
                      fontSize: "15px",
                    }}
                    value={s.department_id || ""}
                    onChange={(e) =>
                      handleChangeDepartment(s.id, e.target.value)
                    }
                  >
                    <option value="-1">
                      {s.department?.partname || "Chưa phân bộ phận"}
                    </option>

                    {partment.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.partname}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}

          {staffs.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">
                Chưa có nhân viên nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  };

  const staff_filter_list = staff.filter((m) => {
    if (
      staff_filter.name &&
      !m.name?.toLowerCase().includes(staff_filter.name.toLowerCase())
    )
      return false;

    if (staff_filter.CCCD && m.CCCD !== staff_filter.CCCD) return false;

    if (staff_filter.part && m.department?.partname !== staff_filter.part)
      return false;

    return true;
  });

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

  return (
    <>
      <Card className="aws-header mt-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col sm={4}>
              <h4 className="aws-title">Quản lý bộ phận sản xuất</h4>
              <div className="aws-subtitle">
                Quản lí công nhân sản xuất toàn hệ thống
              </div>
            </Col>

            <Col sm={6}>
              <Row className="g-2">
                <Col sm={4}>
                  <Form.Control
                    placeholder="Nhập tên"
                    value={staff_filter.name}
                    onChange={(e) =>
                      setstaff_filter({ ...staff_filter, name: e.target.value })
                    }
                  />
                </Col>

                <Col sm={4}>
                  <Form.Control
                    placeholder="Nhập CCCD"
                    value={staff_filter.CCCD}
                    onChange={(e) =>
                      setstaff_filter({ ...staff_filter, CCCD: e.target.value })
                    }
                  />
                </Col>

                <Col sm={4}>
                  <Form.Select
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

            <Col sm={2} className="text-end">
              <Button onClick={openModel} className="aws-btn-primary">
                + Thêm nhân viên
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card data-aos="fade-up" className="mt-3">
        <Card.Body>
          <TechnicalStaffTable staffs={staff_filter_list} />
        </Card.Body>
      </Card>

      <AddTechnicalStaffModal
        show={modelState}
        onHide={() => setmodalState(false)}
        onHideLoad={() => closeModel()}
      />
    </>
  );
};

export default TechnicalStaff;
