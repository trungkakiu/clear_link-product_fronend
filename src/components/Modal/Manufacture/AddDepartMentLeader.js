import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
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
    if (staff_list && staff_list.length > 0) {
      setstaffs(staff_list);
    } else {
      setstaffs([]);
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

      if (res && res.RC === 200) {
        toast.success(res.RM);
        onHideLoad();
      } else {
        toast.error(res?.RM || "Lỗi thiết lập quản lý");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setisload(false);
    }
  };

  const filteredStaffs = staffs.filter((m) => {
    const nameMatch = (m.actor_info?.name || m.name)?.toLowerCase();
    if (filter.name && !nameMatch.includes(filter.name.toLowerCase()))
      return false;
    if (filter.CCCD && !m.CCCD?.includes(filter.CCCD)) return false;
    return true;
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size={staff_list.length === 0 ? "md" : "xl"}
      dialogClassName="add-staff-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Bổ nhiệm quản lý bộ phận</Modal.Title>
      </Modal.Header>

      {staff_list.length === 0 ? (
        <>
          <Modal.Body className="text-center py-5">
            <div className="text-muted">
              Không có nhân viên nào phù hợp để bổ nhiệm!
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" className="text-gray" onClick={onHide}>
              Huỷ
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <div className="modal-search-bar px-4 pt-3">
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  placeholder="Tìm theo tên..."
                  value={filter.name}
                  onChange={(e) =>
                    setFilter({ ...filter, name: e.target.value })
                  }
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  placeholder="Tìm theo CCCD..."
                  value={filter.CCCD}
                  onChange={(e) =>
                    setFilter({ ...filter, CCCD: e.target.value })
                  }
                />
              </Col>
            </Row>
          </div>

          <Modal.Body className="px-4">
            <div className="staff-grid-3">
              {filteredStaffs.map((s) => {
                const avatarSource = s.actor_info?.avatar || s.avatar;
                const finalImgUrl = avatarSource
                  ? `${REACT_APP_API_IMAGE_URL}main-card/${avatarSource}`
                  : "/default-avatar.png";

                return (
                  <div
                    key={s.id}
                    className={`staff-horizontal-card ${
                      selectedStaff?.id === s.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedStaff(s)}
                    style={{
                      border: s.actor_info
                        ? "2px solid #0073bb"
                        : "1px solid #eee",
                      position: "relative",
                    }}
                  >
                    <img
                      src={finalImgUrl}
                      alt="avatar"
                      className="staff-horizontal-avatar"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />

                    <div className="staff-horizontal-info">
                      <div className="staff-horizontal-name">
                        {s.actor_info?.name || s.name}
                        {s.actor_info && (
                          <Badge
                            bg="info"
                            className="ms-2 small"
                            style={{ fontSize: "9px" }}
                          >
                            SYSTEM
                          </Badge>
                        )}
                      </div>

                      <div className="staff-horizontal-meta">
                        <span className="role">
                          {s.actor_info?.role || s.role}
                        </span>
                        <span>•</span>
                        <span>CCCD: {s.CCCD}</span>
                      </div>

                      <div className="staff-horizontal-meta text-primary small fw-bold">
                        {s.department_id ? "Đã có bộ phận" : "Nhân sự tự do"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="link" className="text-gray" onClick={onHide}>
              Huỷ
            </Button>
            <Button
              variant="primary"
              disabled={!selectedStaff || isload}
              onClick={submitManual}
              className="px-4"
            >
              {isload ? "Đang xử lý..." : "Xác nhận bổ nhiệm"}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default AddDepartMentLeader;
