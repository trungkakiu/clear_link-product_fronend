import { Modal, Button, Form } from "@themesberg/react-bootstrap";
import React, { useContext, useState, useEffect } from "react";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faShieldAlt,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

const AddDepartmentModal = ({ show, onHide, onHideReload }) => {
  const { User } = useContext(UserContext);

  const roleMapping = {
    manufacturer: [
      { value: "technical", label: "Kỹ thuật viên" },
      { value: "production", label: "Sản xuất viên" },
    ],
    transporter: [
      { value: "driver", label: "Tài xế vận chuyển" },
      { value: "manager", label: "Kỹ thuật viên điều phối" },
    ],
    distributor: [{ value: "staff", label: "Nhân viên kho vận" }],
    retailer: [{ value: "staff", label: "Nhân viên bán hàng" }],
  };

  const currentOptions = roleMapping[User?.data?.role] || [
    { value: "staff", label: "Nhân viên" },
  ];

  const [form, setForm] = useState({
    partname: "",
    role_level: "level_1",
    isRead: true,
    part: currentOptions[0].value,
    isExcute: false,
  });

  useEffect(() => {
    if (show) {
      setForm((prev) => ({
        ...prev,
        part: currentOptions[0].value,
      }));
    }
  }, [show, User?.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await api_request.createdepartment(User, form);
      if (res && res.RC == 200) {
        toast.success(res.RM);
        onHideReload();
      } else {
        toast.error(res.RM || "Lỗi khi tạo bộ phận");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối hệ thống");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="aws-oem-wrapper">
      <Modal.Header closeButton className="bg-aws-navy">
        <Modal.Title className="h6">
          <FontAwesomeIcon icon={faSitemap} className="me-2 text-warning" />
          Thiết lập cấu trúc bộ phận mới
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light p-4">
        <Form>
          {/* Chọn bộ phận đặc thù theo Role */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              Loại hình nhân sự đặc thù
            </Form.Label>
            <Form.Select
              name="part"
              value={form.part}
              onChange={handleChange}
              className="aws-input-soft shadow-none"
            >
              {currentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              Tên bộ phận / Tổ nhóm
            </Form.Label>
            <Form.Control
              name="partname"
              value={form.partname}
              onChange={handleChange}
              placeholder="Ví dụ: Tổ lái xe 01, Xưởng lắp ráp..."
              className="aws-input-soft shadow-none"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small text-muted">
              <FontAwesomeIcon
                icon={faLayerGroup}
                className="me-1 text-aws-orange"
              />{" "}
              Cấp bậc truy cập (Role Level)
            </Form.Label>
            <Form.Select
              name="role_level"
              value={form.role_level}
              onChange={handleChange}
              className="aws-input-soft shadow-none"
            >
              <option value="level_1">Cấp 1: Nhân viên, CTV, thực tập</option>
              <option value="level_2">Cấp 2: viên chính thức</option>
              <option value="level_3">Cấp 3: Trưởng bộ phận Nhân </option>
              <option value="level_4">Cấp 4: Giám sát viên</option>
              <option disabled={User.data?.level !== "level_5"} value="level_5">
                Cấp 5: Quản lí cấp cao
              </option>
            </Form.Select>
          </Form.Group>

          <div className="bg-white p-3 rounded-3 shadow-xs border">
            <Form.Label className="fw-bold small text-dark mb-3">
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="me-1 text-success"
              />{" "}
              Phân quyền hệ thống
            </Form.Label>

            <Form.Check
              type="switch"
              label="Quyền xem dữ liệu (Read-only)"
              name="isRead"
              id="switch-read"
              checked={form.isRead}
              onChange={handleChange}
              className="aws-switch-orange mb-2 small fw-600"
            />

            <Form.Check
              type="switch"
              label="Quyền thao tác & Thực thi (Full Access)"
              name="isExcute"
              id="switch-execute"
              checked={form.isExcute}
              onChange={handleChange}
              className="aws-switch-orange small fw-600"
            />
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="bg-white border-0">
        <Button
          variant="link"
          className="text-muted text-decoration-none small fw-bold"
          onClick={onHide}
        >
          Hủy bỏ
        </Button>
        <Button
          className="btn-aws-orange px-4 py-2 shadow-sm"
          onClick={handleSubmit}
        >
          Xác nhận thêm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddDepartmentModal;
