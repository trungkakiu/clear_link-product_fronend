import React, { useState, useRef, useContext } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Image,
  Card,
  Container,
  Breadcrumb,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faCloudUploadAlt,
  faInfoCircle,
  faMapMarkerAlt,
  faChevronLeft,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import "../../scss/volt/components/Transporter/AddVehiclePage.scss";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";

const AddVehiclePage = () => {
  const { User } = useContext(UserContext);
  const history = useHistory();
  const [apiwait, setapiwait] = useState(false);
  const [form, setForm] = useState({
    plate_number: "",
    vin_number: "",
    notes: "",
    vehicle_type: "Xe tải 5 tấn",
    capacity: "",
    vehicle_category: "container",
    capacity_unit: "kg",
    status: "available",
    current_location_name: "",
  });

  const [mainAvatar, setMainAvatar] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [descriptionImages, setDescriptionImages] = useState([]);
  const [descPreviews, setDescPreviews] = useState([]);

  const mainInputRef = useRef();
  const descInputRef = useRef();

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    console.log(name);
    setForm({ ...form, [name]: value });
  };

  const handleMainAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainAvatar(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleDescImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setDescriptionImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setDescPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleSubmit = async () => {
    if (apiwait) return toast.warning("Hãy chờ chút!");

    // 1. Kiểm tra đầu vào
    if (!form.plate_number || !form.capacity) {
      return toast.error("Vui lòng điền Biển số và Trọng tải!");
    }

    setapiwait(true);

    try {
      // 2. Chuẩn hóa dữ liệu trước khi gửi (Tránh phụ thuộc vào State async)
      let finalCapacity = parseFloat(form.capacity);
      let finalUnit = form.capacity_unit;

      if (finalUnit === "ton") {
        finalCapacity = finalCapacity * 1000;
        finalUnit = "kg";

        // Cập nhật lại UI cho đồng bộ (tùy chọn)
        setForm((prev) => ({
          ...prev,
          capacity: finalCapacity,
          capacity_unit: "kg",
        }));
      }

      const formData = new FormData();

      // 3. Append dữ liệu vào FormData
      Object.keys(form).forEach((key) => {
        if (key === "capacity") {
          formData.append(key, finalCapacity);
        } else if (key === "capacity_unit") {
          formData.append(key, finalUnit);
        } else {
          formData.append(key, form[key]);
        }
      });

      if (mainAvatar) formData.append("vehicle_main_avatar", mainAvatar);
      descriptionImages.forEach((file) => {
        formData.append("description_img", file);
      });

      const res = await api_request.createVehicle(User, formData);
      if (res?.RC === 200) {
        toast.success("Đăng ký phương tiện thành công!");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi thêm xe!");
    } finally {
      setapiwait(false);
    }
  };

  return (
    <Container fluid className="aws-page-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Breadcrumb className="aws-breadcrumb">
            <Breadcrumb.Item href="#">Hệ thống</Breadcrumb.Item>
            <Breadcrumb.Item href="#">Phương tiện</Breadcrumb.Item>
            <Breadcrumb.Item active>Đăng ký mới</Breadcrumb.Item>
          </Breadcrumb>
          <h3 className="fw-800 text-main m-0">
            <FontAwesomeIcon icon={faTruck} className="me-2 text-aws-orange" />
            Đăng ký Phương tiện Vận tải
          </h3>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            className="fw-bold shadow-none border-2 px-4"
            onClick={() => history.goBack()}
          >
            Quay lại
          </Button>
          <Button
            disabled={apiwait}
            className="aws-btn-submit px-4 shadow-sm"
            onClick={handleSubmit}
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            LƯU HỒ SƠ
          </Button>
        </div>
      </div>

      <Row className="gy-4 position-relative">
        {" "}
        {/* Thêm position-relative ở đây */}
        {/* CỘT TRÁI: STICKY ẢNH */}
        <Col lg={5} className="aws-sticky-column">
          <div className="sticky-content-box">
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Hình ảnh đại diện</h6>
                <Badge bg="aws-orange" className="text-white">
                  Main Profile
                </Badge>
              </Card.Header>
              <Card.Body>
                <div
                  className="upload-zone-main shadow-inner"
                  onClick={() => mainInputRef.current.click()}
                >
                  {mainPreview ? (
                    <Image src={mainPreview} className="img-preview-full" />
                  ) : (
                    <div className="py-5 text-center text-muted">
                      <FontAwesomeIcon
                        icon={faCloudUploadAlt}
                        size="3x"
                        className="mb-2 text-aws-orange"
                      />
                      <p className="small mb-0 fw-bold">Tải ảnh định danh xe</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  hidden
                  ref={mainInputRef}
                  onChange={handleMainAvatarChange}
                />
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3 border-bottom">
                <h6 className="mb-0 fw-bold">Ảnh chi tiết kỹ thuật</h6>
              </Card.Header>
              <Card.Body>
                <div
                  className="upload-zone-mini mb-3"
                  onClick={() => descInputRef.current.click()}
                >
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="me-2 text-primary"
                  />
                  <span className="small fw-600">
                    Thêm tối đa 10 ảnh mô tả...
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  hidden
                  ref={descInputRef}
                  onChange={handleDescImagesChange}
                />

                <div className="gallery-grid">
                  {descPreviews.map((url, index) => (
                    <div key={index} className="gallery-item-wrapper shadow-xs">
                      <Image src={url} className="gallery-img" />
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
        {/* CỘT PHẢI: STICKY FORM */}
        <Col lg={7} className="aws-sticky-column">
          <div className="sticky-content-box">
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-aws-navy text-white py-3">
                <h6 className="mb-0 d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 text-warning"
                  />
                  Thông số vận hành & Pháp lý
                </h6>
              </Card.Header>
              <Card.Body className="p-4">
                <Form>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Biển số kiểm soát *
                      </Form.Label>
                      <Form.Control
                        name="plate_number"
                        className="aws-input-premium"
                        placeholder="VD: 29H-123.45"
                        onChange={handleTextChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Số khung (VIN)
                      </Form.Label>
                      <Form.Control
                        name="vin_number"
                        className="aws-input-premium"
                        placeholder="VIN Number..."
                        onChange={handleTextChange}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Phân loại phương tiện
                      </Form.Label>
                      <Form.Select
                        name="vehicle_type"
                        className="aws-input-premium"
                        onChange={handleTextChange}
                      >
                        <option>Xe tải nhẹ (Dưới 2.5 tấn)</option>
                        <option>Xe tải trung (5 tấn - 8 tấn)</option>
                        <option>Xe tải nặng (Trên 15 tấn)</option>
                        <option>Xe đầu kéo / Container</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Phân loại phương tiện
                      </Form.Label>
                      <Form.Select
                        name="vehicle_category"
                        className="aws-input-premium"
                        value={form.vehicle_category}
                        onChange={handleTextChange}
                      >
                        <option value="container">Xe đầu kéo</option>
                        <option value="tanker">Xe bồn</option>
                        <option value="refrigerated">Xe tải lạnh</option>
                        <option value="truck_closed">Xe tải thùng kín</option>
                        <option value="truck_open">Xe tải thùng bạt/hở</option>
                        <option value="dump_truck">Xe ben</option>
                        <option value="passenger">Xe khách / Xe du lịch</option>
                        <option value="crane_truck">Xe cẩu tự hành</option>
                        <option value="flatbed">Xe sàn phẳng</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Trọng tải tối đa *
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          name="capacity"
                          type="number"
                          className="aws-input-premium"
                          placeholder="0.00"
                          onChange={handleTextChange}
                        />
                        <Form.Select
                          name="capacity_unit"
                          className="aws-input-premium bg-light"
                          style={{ maxWidth: "100px" }}
                          onChange={handleTextChange}
                        >
                          <option value="kg">KG</option>
                          <option selected value="ton">
                            TẤN
                          </option>
                        </Form.Select>
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Trạng thái ban đầu
                      </Form.Label>
                      <Form.Select
                        name="status"
                        className="aws-input-premium"
                        onChange={handleTextChange}
                      >
                        <option value="available">Sẵn sàng (Available)</option>
                        <option value="under_maintenance">
                          Bảo trì (Maintenance)
                        </option>
                      </Form.Select>
                    </Col>
                    <Col md={12}>
                      <Form.Label className="aws-label">
                        Vị trí bãi đỗ
                      </Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          name="current_location_name"
                          className="aws-input-premium ps-5"
                          placeholder="Địa chỉ bãi đỗ..."
                          onChange={handleTextChange}
                        />
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="position-absolute text-danger"
                          style={{ left: "20px", top: "14px" }}
                        />
                      </div>
                    </Col>
                    <Col md={12}>
                      <Form.Label className="aws-label">
                        Ghi chú vận hành
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        value={form.notes}
                        name="notes"
                        onChange={handleTextChange}
                        rows={4}
                        className="aws-input-premium"
                        placeholder="Mô tả thêm về tình trạng xe..."
                      />
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddVehiclePage;
