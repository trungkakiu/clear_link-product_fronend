import {
  Modal,
  Button,
  Form,
  Tabs,
  Tab,
  Row,
  Col,
} from "@themesberg/react-bootstrap";
import React, { useContext, useEffect, useState } from "react";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import "../../../scss/volt/components/Manufacture/AddDepartMentLeader.scss";
import { UserContext } from "../../../Context/UserContext";

const AddDepartMentLeader = ({
  show,
  onHide,
  onHideLoad,
  staff_list = [],
  department_id,
}) => {
  const { User } = useContext(UserContext);
  const [staffs, setstaffs] = useState([]);
  const [isload, setisload] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState();
  const REACT_APP_API_IMAGE_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [filter, setFilter] = useState({
    name: "",
    CCCD: "",
  });

  useEffect(() => {
    if (staff_list.length === 0 || !department_id) {
      console.log(staff_list);
    } else {
      setstaffs(staff_list);
    }
  }, [staff_list]);

  const submitManual = async () => {
    try {
      setisload(true);
      const res = await api_request.newLeaderDepartment(
        User,
        department_id,
        selectedStaff.id,
      );

      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
          onHideLoad();
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setisload(false);
    }
  };
  const filteredStaffs = staffs.filter((m) => {
    if (
      filter.name &&
      !m.name?.toLowerCase().includes(filter.name.toLowerCase())
    )
      return false;

    if (filter.CCCD && !m.CCCD?.includes(filter.CCCD)) return false;

    return true;
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size={staff_list.length === 0 ? "nm" : "xl"}
      dialogClassName="add-staff-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Thêm quản lí bộ phận</Modal.Title>
      </Modal.Header>

      {staff_list.length === 0 ? (
        <>
          <Modal.Body>
            <span className="no_staffs">
              <div>Không có nhân viên nào phù hợp!</div>
            </span>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Huỷ
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <div className="modal-search-bar px-3 pb-3">
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  placeholder="Tìm theo tên"
                  value={filter.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter((prev) => ({
                      ...prev,
                      name: value,
                    }));
                  }}
                />
              </Col>

              <Col md={6}>
                <Form.Control
                  placeholder="Tìm theo CCCD"
                  value={filter.CCCD}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilter((prev) => ({
                      ...prev,
                      CCCD: value,
                    }));
                  }}
                />
              </Col>
            </Row>
          </div>

          <Modal.Body>
            <div className="staff-grid-3">
              {filteredStaffs.map((s) => (
                <div
                  key={s.id}
                  className={`staff-horizontal-card ${
                    selectedStaff?.id === s.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedStaff(s)}
                >
                  <img
                    src={
                      s.avatar
                        ? `${REACT_APP_API_IMAGE_URL}main-card/${s.avatar}`
                        : "/default-avatar.png"
                    }
                    alt="avatar"
                    className="staff-horizontal-avatar"
                  />

                  <div className="staff-horizontal-info">
                    <div className="staff-horizontal-name">{s.name}</div>

                    <div className="staff-horizontal-meta">
                      <span className="role">{s.role}</span>
                      <span>•</span>
                      <span>CCCD: {s.CCCD}</span>
                    </div>

                    <div className="staff-horizontal-meta">
                      {s.department_id
                        ? "Trực thuộc bộ phận này"
                        : "Chưa phân bộ phận"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Huỷ
            </Button>
            <Button
              variant="primary"
              disabled={!selectedStaff && !isload}
              onClick={submitManual}
            >
              {isload ? "Đang thực thi" : "Xác nhận"}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default AddDepartMentLeader;
