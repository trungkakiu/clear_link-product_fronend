import {
  Modal,
  Button,
  Form,
  Tabs,
  Tab,
  Row,
  Col,
} from "@themesberg/react-bootstrap";

import React, { useContext, useState, useRef, useEffect } from "react";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";

const AddProductionStaffModal = ({ show, onHide, onHideLoad }) => {
  const { User } = useContext(UserContext);
  const [tab, setTab] = useState("manual");
  const [hasAccount, setHasAccount] = useState(false);

  const [ltp, setLtp] = useState(new Array(6).fill(""));
  const [confirmLtp, setConfirmLtp] = useState(new Array(6).fill(""));

  const ltpRefs = useRef([]);
  const confirmLtpRefs = useRef([]);

  const getRoleOptions = () => {
    const role = User?.data?.role?.toLowerCase();
    if (role === "transporter") {
      return [
        { level: "level_1", role: "driver", label: "Tài xế thực thi (Lv1)" },
        { level: "level_2", role: "driver", label: "Tổ trưởng tài xế (Lv2)" },
        { level: "level_3", role: "driver", label: "Điều phối viên (Lv3)" },
        { level: "level_4", role: "manager", label: "Quản lý đội xe (Lv4)" },
        { level: "level_5", role: "manager", label: "Giám đốc vận hành (Lv5)" },
      ];
    }
    if (role === "manufacturer") {
      return [
        {
          level: "level_1",
          role: "production",
          label: "Nhân viên sản xuất (Lv1)",
        },
        { level: "level_2", role: "production", label: "Leader (Lv2)" },
        { level: "level_3", role: "production", label: "Sub leader (Lv3)" },
        { level: "level_4", role: "technical", label: "Tech leader (Lv4)" },
        {
          level: "level_5",
          role: "technical",
          label: "Giám đốc vận hành (Lv5)",
        },
      ];
    }

    return [
      { level: "level_1", role: "staff", label: "Nhân viên (Lv1)" },
      { level: "level_4", role: "qc", label: "Kiểm định viên (QC)" },
      { level: "level_5", role: "manager", label: "Quản lý (Lv5)" },
    ];
  };

  const options = getRoleOptions();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    address_1: "",
    CCCD: "",
    banking_code: "",
    banking_brand: "",
    staff_role: "staff", 
    level: "level_1",
    password: "",
    status: "pending",
  });

  useEffect(() => {
    if (show && options.length > 0) {
      setForm((prev) => ({
        ...prev,
        level: options[0].level,
        staff_role: options[0].role,
      }));
    }
  }, [show, User?.role]);

  const VIETNAM_BANKS = [
    "Vietcombank (VCB)",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "Sacombank",
    "VPBank",
    "TPBank",
    "VIB",
    "HDBank",
    "SHB",
    "Eximbank",
    "MSB",
    "OCB",
    "LienVietPostBank",
    "SeABank",
    "Bac A Bank",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOtpChange = (e, index, state, setState, refs) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newState = [...state];
    newState[index] = value.slice(-1);
    setState(newState);
    if (value && index < 5) {
      setTimeout(() => {
        refs.current[index + 1].focus();
      }, 10);
    }
  };

  const handleKeyDown = (e, index, state, refs) => {
    if (e.key === "Backspace" && !state[index] && index > 0) {
      setTimeout(() => {
        refs.current[index - 1].focus();
      }, 10);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    toast.warning("Bảo mật: Vui lòng nhập trực tiếp mã LTP.");
  };

  const submitManual = async () => {
    const ltpString = ltp.join("");
    const confirmLtpString = confirmLtp.join("");

    if (hasAccount) {
      if (ltpString.length < 6) return toast.error("Mã LTP phải đủ 6 số.");
      if (ltpString !== confirmLtpString)
        return toast.error("Mã xác nhận LTP không khớp.");
      if (!form.password)
        return toast.error("Vui lòng thiết lập mật khẩu hệ thống.");
      if (!form.staff_role) return toast.error("Vui lòng chọn vai trò cụ thể.");
    }

    const payload = {
      ...form,
      hasAccount,
      ltpCode: hasAccount ? ltpString : null,
    };

    const res = await api_request.createProductionStaff(User, payload);
    if (res?.RC === 200) {
      toast.success("Hồ sơ nhân viên đã được tạo thành công!");
      onHideLoad();
    } else {
      toast.error(res?.RM || "Lỗi hệ thống");
    }
  };

  const OtpGroup = ({ state, setState, refs, label }) => (
    <div className="mb-3">
      <Form.Label className="small fw-bold text-dark">{label}</Form.Label>
      <div className="d-flex gap-1 justify-content-between">
        {state.map((data, index) => (
          <input
            key={index}
            ref={(el) => (refs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            className="form-control text-center fw-bold shadow-none ltp-box"
            value={data}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(e, index, state, refs)}
            onChange={(e) => handleOtpChange(e, index, state, setState, refs)}
            style={{
              width: "14%",
              height: "45px",
              border: "1px solid #d5dada",
              borderRadius: "4px",
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light px-4 border-0">
        <Modal.Title className="fw-bold h5 mb-0">
          Thiết lập nhân sự & Hệ thống
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-aws-white">
        <Tabs
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          className="aws-tabs mb-4"
        >
          <Tab eventKey="manual" title="NHẬP THỦ CÔNG">
            <Form>
              <h6 className="text-primary fw-bold extra-small text-uppercase mb-3 tracking-wider">
                1. Thông tin định danh & Ngân hàng
              </h6>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Label className="small fw-bold">
                    Họ tên nhân viên *
                  </Form.Label>
                  <Form.Control
                    name="name"
                    onChange={handleChange}
                    placeholder="VD: Nguyễn Văn A"
                    className="shadow-none border-gray-300"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold">
                    Email liên hệ *
                  </Form.Label>
                  <Form.Control
                    name="email"
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="shadow-none border-gray-300"
                  />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold">
                    Số điện thoại
                  </Form.Label>
                  <Form.Control name="phone_number" onChange={handleChange} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold">Số CCCD</Form.Label>
                  <Form.Control name="CCCD" onChange={handleChange} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">
                    Cấp độ gốc (Hệ thống)
                  </Form.Label>
                  <Form.Control
                    value={form.level}
                    disabled
                    className="bg-light"
                  />
                </Col>
                <Col md={12}>
                  <Form.Label className="small fw-bold">Địa chỉ</Form.Label>
                  <Form.Control name="address_1" onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold">
                    Số tài khoản ngân hàng
                  </Form.Label>
                  <Form.Control name="banking_code" onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-bold">Ngân hàng</Form.Label>
                  <Form.Control
                    name="banking_brand"
                    onChange={handleChange}
                    list="bankList"
                    placeholder="Chọn ngân hàng..."
                  />
                  <datalist id="bankList">
                    {VIETNAM_BANKS.map((bank, index) => (
                      <option key={index} value={bank} />
                    ))}
                  </datalist>
                </Col>
              </Row>

              <div className="p-3 mb-4 rounded border bg-light">
                <Form.Check
                  type="switch"
                  id="account-activation"
                  label={
                    <span className="fw-bold text-dark">
                      Kích hoạt tài khoản hệ thống (On-Chain Access)
                    </span>
                  }
                  checked={hasAccount}
                  onChange={(e) => setHasAccount(e.target.checked)}
                />

                {hasAccount && (
                  <div className="mt-4 pt-3 border-top border-2 border-white">
                    <Row>
                      <Col lg={6}>
                        <OtpGroup
                          state={ltp}
                          setState={setLtp}
                          refs={ltpRefs}
                          label="Thiết lập mã LTP (6 số)"
                        />
                      </Col>
                      <Col lg={6}>
                        <OtpGroup
                          state={confirmLtp}
                          setState={setConfirmLtp}
                          refs={confirmLtpRefs}
                          label="Xác nhận lại mã LTP"
                        />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col md={6}>
                        <Form.Label className="small fw-bold text-danger">
                          Mật khẩu đăng nhập *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          onChange={handleChange}
                          className="shadow-none"
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small fw-bold text-primary">
                          Vai trò & Cấp độ hệ thống *
                        </Form.Label>
                        <Form.Select
                          name="role_level_mapping"
                          value={form.level}
                          onChange={(e) => {
                            const selectedLevel = e.target.value;
                            const selectedOption = options.find(
                              (opt) => opt.level === selectedLevel,
                            );
                            if (selectedOption) {
                              setForm({
                                ...form,
                                level: selectedOption.level,
                                staff_role: selectedOption.role,
                              });
                            }
                          }}
                          className="shadow-none border-gray-300"
                        >
                          <option value="">-- Chọn vị trí --</option>
                          {options.map((opt) => (
                            <option key={opt.level} value={opt.level}>
                              {opt.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3">
                <Button
                  variant="link"
                  className="text-gray-500 fw-bold text-decoration-none"
                  onClick={onHide}
                >
                  HỦY BỎ
                </Button>
                <Button
                  variant="primary"
                  className="aws-btn-main px-4 shadow-none fw-bold"
                  onClick={submitManual}
                >
                  LƯU DỮ LIỆU
                </Button>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AddProductionStaffModal;
