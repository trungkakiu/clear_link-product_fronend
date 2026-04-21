import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Badge,
  Row,
  Col,
  Form,
} from "@themesberg/react-bootstrap";
import "../../scss/volt/components/Manufacture/DepartmentCard.scss";
import AddDepartmentModal from "../Modal/Manufacture/AddDepartmentModal.js";
import api_request from "../../apicontroller/api_request.js";
import { UserContext } from "../../Context/UserContext.jsx";
import AddDepartMentLeader from "../Modal/Manufacture/AddDepartMentLeader.js";
import RocketLoad from "../../Utils/RocketLoad.js";

const DepartmentCardList = () => {
  const REACT_APP_API_IMAGE_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [isload, setisload] = useState(true);
  const { User } = useContext(UserContext);
  const [departments, setdepartments] = useState([]);
  const [showModal, setShowModal] = useState({
    newDepart: false,
    newLeader: false,
  });
  const [staffs, setstaffs] = useState([]);
  const [modelestate, setmodalstate] = useState({
    staffs: [],
    department_id: "",
  });

  async function loadDepartMent() {
    try {
      setisload(true);

      const res = await api_request.getDepartments(User);

      if (res && res.RC === 200) {
        setdepartments(res.RD.department_list || []);
        setstaffs(res.RD.staff_list || []);
      } else {
        setdepartments([]);
      }
    } catch (error) {
      console.error("loadDepartMent error:", error);
      setdepartments([]);
    } finally {
      setTimeout(() => {
        setisload(false);
      }, 1000);
    }
  }

  function openModel(data, type, role) {
    if (type !== "newLeader") return;

    setmodalstate((prev) => ({
      ...prev,
      staffs: staffs.filter((m) => {
        if (m.role !== role) return false;
        if (m.id === data.leader_id) return false;

        return (
          m.department_id === null || m.department_id === data.department_id
        );
      }),
      department_id: data.department_id,
    }));

    setShowModal((prev) => ({ ...prev, newLeader: true }));
  }

  function closeModel() {
    setShowModal(false);
    loadDepartMent();
  }

  useEffect(() => {
    loadDepartMent();
  }, []);

  const handleTogglePermission = async (id, field, value) => {
    setdepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );

    const res = await api_request.updateDepartmentPermission(User, id, {
      [field]: value,
    });

    if (!res || res.RC !== 200) {
      setdepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: !value } : d)),
      );
    }
  };

  const DepartmentCard = ({ department }) => {
    const [isEdit, setisEdit] = useState(false);
    const [partname, setpartname] = useState(department.partname);

    return (
      <Card className="department-card">
        <Card.Body>
          <div className={`${isEdit && "editable"} department-header`}>
            <span className={`aws-part-status ${department.part}`}>
              {department.part === "production" && "SẢN XUẤT"}
              {department.part === "technical" && "KỸ THUẬT"}
            </span>
            <input
              onChange={(event) => setpartname(event.target.value)}
              onBlur={() =>
                handleTogglePermission(department.id, "partname", partname)
              }
              style={{
                width: "100%",
                outline: "none",
                textAlign: "center",
                height: "100%",
                fontSize: "24px",
                backgroundColor: "white",
                border: "0px",
              }}
              value={partname}
              disabled={!isEdit}
            />
          </div>

          <Row className="permission-row">
            <Col xs={6}>
              {department.leader ? (
                <>
                  <img
                    onClick={() =>
                      openModel(
                        {
                          department_id: department.id,
                          leader_id: department.leader_id,
                        },
                        "newLeader",
                        department.part,
                      )
                    }
                    src={`${REACT_APP_API_IMAGE_URL}main-card/${department.leader.actor_info?.avatar || department.leader.avatar}`}
                    alt="banner"
                    style={{
                      cursor: "pointer",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="no_leader">
                    <button
                      onClick={() =>
                        openModel(
                          {
                            department_id: department.id,
                            leader_id: department.leader_id,
                          },
                          "newLeader",
                          department.part,
                        )
                      }
                    >
                      + leader
                    </button>
                  </div>
                </>
              )}
            </Col>
            <Col xs={6}>
              <Col xs={12}>
                <div className="permission-item">
                  <span>Read</span>
                  <Form.Check
                    type="switch"
                    checked={department.isRead}
                    onChange={() =>
                      handleTogglePermission(
                        department.id,
                        "isRead",
                        !department.isRead,
                      )
                    }
                  />
                </div>
              </Col>

              <Col xs={12}>
                <div className="permission-item mt-3">
                  <span>Execute</span>
                  <Form.Check
                    type="switch"
                    checked={department.isExcute}
                    onChange={() =>
                      handleTogglePermission(
                        department.id,
                        "isExcute",
                        !department.isExcute,
                      )
                    }
                  />
                </div>
              </Col>
              <Col xs={12} className="mt-3">
                <div className="permission-item">
                  <span>Active</span>
                  <Form.Check
                    type="switch"
                    checked={department.active}
                    onChange={() =>
                      handleTogglePermission(
                        department.id,
                        "active",
                        !department.active,
                      )
                    }
                  />
                </div>
              </Col>
            </Col>
          </Row>

          <div className="level-row">
            <Form.Select
              size="sm"
              value={department.role_level}
              onChange={(e) =>
                handleTogglePermission(
                  department.id,
                  "role_level",
                  e.target.value,
                )
              }
            >
              <option value="level_1">Level 1</option>
              <option value="level_2">Level 2</option>
              <option value="level_3">Level 3</option>
              <option value="level_4">Level 4</option>
              <option value="level_5">Level 5</option>
            </Form.Select>
          </div>
        </Card.Body>
        <Card.Footer className="department-footer">
          <Card.Body>
            <Row>
              <Col xl={6} md={6} xs={12}>
                <Button variant="outline-danger" className="w-100" size="sm">
                  Remove
                </Button>
              </Col>

              <Col xl={6} md={6} xs={12}>
                <Button
                  onClick={() => setisEdit(!isEdit)}
                  variant={`${!isEdit ? "primary" : "secondary"}`}
                  className="w-100"
                  size="sm"
                >
                  Edit
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card.Footer>
      </Card>
    );
  };

  if (isload) {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
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
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="aws-title">Quản lý bộ phận</h4>
            <div className="aws-subtitle">
              Theo dõi trạng thái sản phẩm theo blockchain
            </div>
          </div>

          <div className="d-flex gap-2">
            <Button
              onClick={() =>
                setShowModal((prev) => ({ ...prev, newDepart: true }))
              }
              className="aws-btn-primary"
            >
              + Thêm bộ phận
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row>
        {departments.map((d, index) => (
          <Col key={d.id} xl={3} lg={4} md={6} className="mb-3 mt-3">
            <div data-aos="fade-up" data-aos-delay={index * 100}>
              <DepartmentCard department={d} />
            </div>
          </Col>
        ))}

        {departments.length === 0 && (
          <Col>
            <div className="text-muted text-center py-4">
              Chưa có bộ phận nào
            </div>
          </Col>
        )}
      </Row>

      <AddDepartmentModal
        show={showModal.newDepart}
        onHide={() => setShowModal((prev) => ({ ...prev, newDepart: false }))}
        onHideReload={() => closeModel()}
      />
      <AddDepartMentLeader
        show={showModal.newLeader}
        onHide={() => setShowModal((prev) => ({ ...prev, newLeader: false }))}
        onHideLoad={() => closeModel()}
        staff_list={modelestate.staffs}
        department_id={modelestate.department_id}
      />
    </>
  );
};

export default DepartmentCardList;
