import {
  Modal,
  Button,
  Form,
  Tabs,
  Tab,
  Row,
  Col,
} from "@themesberg/react-bootstrap";
import React, { useContext, useState } from "react";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import "../../../scss/volt/components/Manufacture/AddProductionStaffModal.scss";
import { UserContext } from "../../../Context/UserContext";

const AddTechnicalStaffModal = ({ show, onHide, onHideLoad }) => {
  const [tab, setTab] = useState("manual");
  const { User } = useContext(UserContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phonenumber: "",
    address: "",
    CCCD: "",
    banking_code: "",
    banking_brand: "",
    status: "working",
  });

  const [csvFile, setCsvFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const BANK_LIST = [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "Sacombank",
    "VPBank",
    "SHB",
    "TPBank",
    "HDBank",
    "OCB",
    "SeABank",
    "VIB",
  ];

  const submitManual = async () => {
    const res = await api_request.createTechnicalStaff(User, form);
    if (res?.RC === 200) {
      toast.success("Thêm nhân viên thành công");
      onHideLoad();
    } else {
      toast.error(res?.RM || "Lỗi thêm nhân viên");
    }
  };

  const submitCSV = async () => {
    if (!csvFile) {
      toast.warning("Chưa chọn file CSV");
      return;
    }

    const fd = new FormData();
    fd.append("file", csvFile);

    const res = await api_request.importProductionStaffCSV(fd);
    if (res?.RC === 200) {
      toast.success("Import CSV thành công");
      onHide();
    } else {
      toast.error(res?.RM || "Import thất bại");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="add-staff-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Thêm nhân viên kỹ thuật</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs activeKey={tab} onSelect={(k) => setTab(k)}>
          {/* ===== TAB MANUAL ===== */}
          <Tab eventKey="manual" title="Thêm thủ công">
            <Form className="pt-3">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    name="phonenumber"
                    value={form.phonenumber}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>CCCD</Form.Label>
                  <Form.Control
                    name="CCCD"
                    value={form.CCCD}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={12}>
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Mã ngân hàng</Form.Label>
                  <Form.Control
                    name="banking_code"
                    value={form.banking_code}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Ngân hàng</Form.Label>
                  <Form.Control
                    name="banking_brand"
                    list="bank-list"
                    value={form.banking_brand}
                    onChange={handleChange}
                    placeholder="Nhập tên ngân hàng"
                  />

                  <datalist id="bank-list">
                    {BANK_LIST.map((bank) => (
                      <option key={bank} value={bank} />
                    ))}
                  </datalist>
                </Col>
              </Row>

              <div className="text-end mt-3">
                <Button onClick={submitManual}>Thêm nhân viên</Button>
              </div>
            </Form>
          </Tab>

          {/* ===== TAB CSV ===== */}
          <Tab eventKey="csv" title="Import CSV">
            <div className="pt-4 csv-upload-box">
              <Form.Group>
                <Form.Label>File CSV</Form.Label>
                <Form.Control
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
              </Form.Group>

              <div className="csv-note mt-2">
                File CSV phải có các cột:
                <br />
                <code>
                  name,email,phonenumber,address,CCCD,banking_code,banking_brand,status
                </code>
              </div>

              <div className="text-end mt-3">
                <Button onClick={submitCSV}>Import CSV</Button>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AddTechnicalStaffModal;
