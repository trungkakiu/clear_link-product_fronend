import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Table,
  Modal,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faPlus,
  faTrash,
  faBus,
  faGasPump,
  faWallet,
  faCheckCircle,
  faTimesCircle,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/Transporter/AddFleetPage.scss";

const AddFleetPage = () => {
  const { User } = useContext(UserContext);
  const [form, setForm] = useState({
    fleet_name: "",
    fleet_code: "",
    fleet_type: "dry_cargo",
    manager_name: "",
    manager_phone: "",
    fuel_norm_average: "",
    monthly_budget: "",
    vehicles: "",
    operation_area: [],
  });
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableRegon, setavailbleRegon] = useState([]);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [isload, setLoading] = useState(false);
  const [apiwait, setapiwait] = useState(false);
  const truck_cate = {
    container: "Container",
    tanker: "Xe bồn chứa",
    refrigerated: "Xe lạnh",
    truck_closed: "Xe thùng kín",
    truck_open: "Xe thùng mở",
    dump_truck: "Xe ben",
    passenger: "Xe khách",
    crane_truck: "Xe cẩu tự hành",
    flatbed: "Xe sàn phẳng",
  };
  const REGIONS = [
    {
      label: "Đông Bắc Bộ",
      provinces: [
        "Hà Giang",
        "Cao Bằng",
        "Bắc Kạn",
        "Tuyên Quang",
        "Lào Cai",
        "Yên Bái",
        "Thái Nguyên",
        "Lạng Sơn",
        "Quảng Ninh",
        "Bắc Giang",
        "Phú Thọ",
      ],
    },
    {
      label: "Tây Bắc Bộ",
      provinces: ["Điện Biên", "Lai Châu", "Sơn La", "Hòa Bình"],
    },
    {
      label: "Đồng Bằng Sông Hồng",
      provinces: [
        "Hà Nội",
        "Hải Phòng",
        "Bắc Ninh",
        "Hà Nam",
        "Hải Dương",
        "Hưng Yên",
        "Nam Định",
        "Ninh Bình",
        "Thái Bình",
        "Vĩnh Phúc",
      ],
    },
    {
      label: "Bắc Trung Bộ",
      provinces: [
        "Thanh Hóa",
        "Nghệ An",
        "Hà Tĩnh",
        "Quảng Bình",
        "Quảng Trị",
        "Thừa Thiên Huế",
      ],
    },
    {
      label: "Nam Trung Bộ & Tây Nguyên",
      provinces: [
        "Đà Nẵng",
        "Quảng Nam",
        "Quảng Ngãi",
        "Bình Định",
        "Phú Yên",
        "Khánh Hòa",
        "Ninh Thuận",
        "Bình Thuận",
        "Kon Tum",
        "Gia Lai",
        "Đắk Lắk",
        "Đắk Nông",
        "Lâm Đồng",
      ],
    },
    {
      label: "Đông Nam Bộ",
      provinces: [
        "TP. Hồ Chí Minh",
        "Bà Rịa - Vũng Tàu",
        "Bình Dương",
        "Bình Phước",
        "Đồng Nai",
        "Tây Ninh",
      ],
    },
    {
      label: "Đồng Bằng Sông Cửu Long",
      provinces: [
        "Cần Thơ",
        "An Giang",
        "Bạc Liêu",
        "Bến Tre",
        "Cà Mau",
        "Đồng Tháp",
        "Hậu Giang",
        "Kiên Giang",
        "Long An",
        "Sóc Trăng",
        "Tiền Giang",
        "Trà Vinh",
        "Vĩnh Long",
      ],
    },
  ];

  const handleCreateFleet = async () => {
    try {
      setapiwait(true);
      const res = await api_request.handleCreateFleetAPI(User, form);
      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
          fetchOrphanVehicles();
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setTimeout(() => {
        setapiwait(false);
      }, []);
    }
  };
  const toggleArea = (province) => {
    if (selectedAreas.includes(province)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== province));
    } else {
      setSelectedAreas([...selectedAreas, province]);
    }
  };

  const fetchOrphanVehicles = async () => {
    try {
      setLoading(true);
      const res = await api_request.getOrphanVehicles(User);
      if (res?.RC === 200) {
        setAvailableVehicles(res.RD.orphanVehicles);
        const regonData = res.RD.company_regon?.operation_area;
        const parsedRegon =
          typeof regonData === "string"
            ? JSON.parse(regonData)
            : regonData || [];
        setavailbleRegon(parsedRegon);
      } else toast.error(res.RM);
    } catch (error) {
      toast.error("Lỗi tải thông tin!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrphanVehicles();
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      operation_area: selectedAreas,
      vehicles: selectedVehicles.map((v) => v.id),
    }));
  }, [selectedAreas, selectedVehicles]);

  const handleSelectVehicle = (vehicle) => {
    if (!selectedVehicles.find((v) => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeVehicle = (id) => {
    setSelectedVehicles(selectedVehicles.filter((v) => v.id !== id));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  useEffect(() => {
    if (availableRegon.length > 0) {
      setSelectedAreas(availableRegon);
    }
  }, [availableRegon]);
  return (
    <div className="aws-page-container py-4 px-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-800 text-main m-0">
          <FontAwesomeIcon icon={faSitemap} className="me-2 text-aws-orange" />
          Tạo Đội Xe Mới (Create Fleet)
        </h4>
        <Button
          className="aws-btn-submit px-4"
          onClick={() => handleCreateFleet()}
        >
          XÁC NHẬN TẠO ĐỘI
        </Button>
      </div>

      <Row className="gy-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-aws-navy text-white py-3">
              <h6 className="mb-0 small fw-bold">CẤU HÌNH ĐỘI XE</h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="aws-label">Tên đội xe *</Form.Label>
                  <Form.Control
                    className="aws-input"
                    name="fleet_name"
                    value={form.fleet_name}
                    onChange={handleTextChange}
                    placeholder="VD: Đội xe tải lạnh Miền Bắc"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="aws-label">
                    Mã định danh (Code) *
                  </Form.Label>
                  <Form.Control
                    name="fleet_code"
                    value={form.fleet_code}
                    onChange={handleTextChange}
                    className="aws-input"
                    placeholder="VD: FLEET-HN-01"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="aws-label">Loại đội xe</Form.Label>
                  <Form.Select
                    className="aws-input"
                    name="fleet_type"
                    value={form.fleet_type}
                    onChange={handleTextChange}
                  >
                    <option value="dry_cargo">Hàng khô (Dry Cargo)</option>
                    <option value="cold_chain">Hàng lạnh (Cold Chain)</option>
                    <option value="container">Container</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <Form.Label className="aws-label">
                    Định mức nhiên liệu (L/100km)
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faGasPump} />
                    </span>
                    <Form.Control
                      name="fuel_norm_average"
                      value={form.fuel_norm_average || ""}
                      onChange={handleTextChange}
                      type="number"
                      step="0.01"
                      className="aws-input"
                      placeholder="0.00"
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <Form.Label className="aws-label">
                    Ngân sách vận hành tháng
                  </Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FontAwesomeIcon icon={faWallet} />
                    </span>
                    <Form.Control
                      name="monthly_budget"
                      value={form.monthly_budget}
                      onChange={handleTextChange}
                      type="number"
                      className="aws-input"
                      placeholder="VND"
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-aws-navy text-white py-3">
              <h6 className="mb-0 small fw-bold">
                KHU VỰC VẬN HÀNH (OPERATION AREA)
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Form.Label className="aws-label">
                Các tỉnh/thành phố được phép hoạt động
              </Form.Label>

              <div className="selected-areas-box mb-3 p-3 border rounded">
                {selectedAreas.length === 0 ? (
                  <span className="text-muted small italic">
                    Chưa có khu vực nào được chọn...
                  </span>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedAreas.map((area) => (
                      <Badge
                        key={area}
                        bg="aws-orange text-white"
                        className="area-tag py-2 px-3"
                      >
                        {area}
                        <FontAwesomeIcon
                          style={{ cursor: "pointer" }}
                          icon={faTimesCircle}
                          className="ms-2 cursor-pointer"
                          onClick={() => toggleArea(area)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Row>
                {REGIONS.map((region) => (
                  <Col md={4} key={region.label} className="mb-3">
                    <h6 className="small fw-800 text-aws-navy border-bottom pb-1 mb-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="me-2 text-danger"
                      />
                      {region.label}
                    </h6>
                    <div className="d-flex flex-column gap-1">
                      {region.provinces.map((p) => {
                        const isAvailable = availableRegon.includes(p);

                        return (
                          <Form.Check
                            key={p}
                            type="checkbox"
                            id={`check-${p}`}
                            label={p}
                            disabled={!isAvailable}
                            className={`small fw-500 custom-check ${!isAvailable ? "text-muted opacity-50" : ""}`}
                            checked={selectedAreas.includes(p)}
                            onChange={() => toggleArea(p)}
                            title={
                              !isAvailable
                                ? "Doanh nghiệp chưa đăng ký hoạt động tại vùng này"
                                : ""
                            }
                          />
                        );
                      })}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5} className="aws-sticky-column">
          <div className="sticky-content-box">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <h6 className="mb-0 fw-bold">
                  Xe trong đội ({selectedVehicles.length})
                </h6>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => setShowVehicleModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm xe
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Table
                    responsive
                    className="table-centered table-nowrap mb-0"
                  >
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 small fw-bold">BIỂN SỐ</th>
                        <th className="border-0 small fw-bold">LOẠI</th>
                        <th className="border-0"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVehicles.map((v) => (
                        <tr key={v.id}>
                          <td className="fw-bold">{v.plate_number}</td>
                          <td className="small text-muted">{v.vehicle_type}</td>
                          <td>
                            <Button
                              variant="link"
                              className="text-danger p-0"
                              onClick={() => removeVehicle(v.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        size="lg"
        centered
        className="aws-page-container aws-view-modal"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6">Chọn phương tiện chưa có đội</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
          <Row className="gy-3">
            {availableVehicles.map((v) => {
              const isSelected = selectedVehicles.find((sv) => sv.id === v.id);

              return (
                <Col md={6} key={v.id}>
                  <Card
                    className={`vehicle-selection-card border-0 shadow-xs ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelectVehicle(v)}
                  >
                    <Card.Body className="p-3 d-flex align-items-center">
                      <div className="icon-box me-3">
                        <FontAwesomeIcon icon={faBus} size="lg" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-800 text-main">{v.plate_number}</div>
                        <div className="small text-muted">
                          {v.vehicle_type?.split("(")[0]} - {v.capacity}{" "}
                          {v.capacity_unit} - {truck_cate[v.vehicle_category]}
                        </div>
                      </div>

                      {isSelected && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-aws-orange ms-2 scale-up-animation"
                          size="lg"
                        />
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button
            variant="secondary"
            onClick={() => setShowVehicleModal(false)}
          >
            Hoàn tất
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddFleetPage;
