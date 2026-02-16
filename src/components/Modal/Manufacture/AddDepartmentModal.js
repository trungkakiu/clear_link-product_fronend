import { Modal, Button, Form } from "@themesberg/react-bootstrap";
import React, { useContext, useState } from "react";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import "../../../scss/volt/components/Manufacture/AddDepartmentModal.scss";

const AddDepartmentModal = ({ show, onHide, onHideReload }) => {
  const [form, setForm] = useState({
    partname: "",
    role_level: "level_1",
    isRead: true,
    part: "technical",
    isExcute: false,
  });

  const { User } = useContext(UserContext);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(value);
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
        toast.error(res.RM);
        onHide();
      }
    } catch (error) {
      console.log(error);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm bộ phận</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Bộ phận chính</Form.Label>
            <Form.Select name="part" value={form.part} onChange={handleChange}>
              <option value="technical">Kỹ thuật viên</option>
              <option value="production">Sản xuất viên</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tên bộ phận</Form.Label>
            <Form.Control
              name="partname"
              value={form.partname}
              onChange={handleChange}
              placeholder="VD: Kế toán"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role level</Form.Label>
            <Form.Select
              name="role_level"
              value={form.role_level}
              onChange={handleChange}
            >
              <option value="level_1">Level 1</option>
              <option value="level_2">Level 2</option>
              <option value="level_3">Level 3</option>
              <option value="level_4">Level 4</option>
              <option value="level_5">Level 5</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="switch"
            label="Quyền đọc (Read)"
            name="isRead"
            checked={form.isRead}
            onChange={handleChange}
            className="mb-2"
          />

          <Form.Check
            type="switch"
            label="Quyền thực thi (Execute)"
            name="isExcute"
            checked={form.isExcute}
            onChange={handleChange}
          />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Thêm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddDepartmentModal;
