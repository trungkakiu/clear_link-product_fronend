import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Container,
  Dropdown,
  Image,
  Badge,
} from "@themesberg/react-bootstrap";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import "../../scss/volt/components/Manufacture/CreateBatchForm.scss";

const CreateBatchForm = () => {
  const { User } = useContext(UserContext);
  const [isLoad, setIsLoad] = useState(true);
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const API_URL_2 = process.env.REACT_APP_API_URL_2;
  const [apiwait, setapiwait] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    batch_name: "",
    product_id: "",
    Department_id: "",
    packaging_id: "",
    description: "",
    manufacture_date: "",
    expiry_date: "",
    quantity: "",
  });

  const [boxOptions, setBoxOptions] = useState([]);
  const [searchBoxTerm, setSearchBoxTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDeptTerm, setSearchDeptTerm] = useState("");

  const fetchData = async () => {
    try {
      setIsLoad(true);
      const [productRes, deptRes, boxRes] = await Promise.all([
        api_request.getProductValid(User),
        api_request.getDepartment(User),
        api_request.getBox(User),
      ]);

      if (productRes.RC === 200) {
        setProductOptions(productRes.RD);
      } else {
        console.error("Failed to fetch products:", productRes.RM);
      }

      if (deptRes.RC === 200) {
        setDepartmentOptions(deptRes.RD);
      } else {
        console.error("Failed to fetch departments:", deptRes.RM);
      }

      if (boxRes.RC === 200) setBoxOptions(boxRes.RD);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  };

  const filteredBoxes = boxOptions.filter((box) => {
    return (
      box.pack_code.toLowerCase().includes(searchBoxTerm.toLowerCase()) ||
      box.material.toLowerCase().includes(searchBoxTerm.toLowerCase())
    );
  });

  const selectedBox = boxOptions.find((b) => b.id === formData.packaging_id);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    try {
      setapiwait(true);
      e.preventDefault();

      if (
        !formData.product_id ||
        !formData.quantity ||
        !formData.manufacture_date ||
        !formData.Department_id
      ) {
        toast.warning(
          "Vui lòng điền đầy đủ các trường bắt buộc có dấu sao đỏ!",
        );
        return;
      }

      const res = await api_request.createBatch(User, formData);
      if (res.RC === 200) {
        toast.success("Kế hoạch lô hàng đã được tạo thành công!");
        setFormData({
          id: "",
          batch_name: "",
          product_id: "",
          Department_id: "",
          description: "",
          manufacture_date: "",
          expiry_date: "",
          quantity: "",
        });
      } else {
        toast.error(res.RM || "Đã có lỗi xảy ra khi tạo kế hoạch lô hàng.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setapiwait(false);
    }
  };

  const filteredProducts = productOptions.filter((product) => {
    const productName = product.name || product.product_name || "";
    const productId = product.id || "";
    return (
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const selectedProduct = productOptions.find(
    (p) => p.id === formData.product_id,
  );

  const filteredDepartments = departmentOptions.filter((dept) => {
    const deptName = dept.partname || "";
    const deptId = dept.id || "";
    const leaderName = dept.leader?.name || "";
    return (
      deptName.toLowerCase().includes(searchDeptTerm.toLowerCase()) ||
      deptId.toLowerCase().includes(searchDeptTerm.toLowerCase()) ||
      leaderName.toLowerCase().includes(searchDeptTerm.toLowerCase())
    );
  });

  const selectedDept = departmentOptions.find(
    (d) => d.id === formData.Department_id,
  );

  const defaultImage =
    "https://via.placeholder.com/150/e0e0e0/808080?Text=No+Image";

  if (isLoad) {
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
    <div className="create-batch-container">
      <Container data-aos="fade-in" className="p-0 mt-3">
        <Card border="light" className="bg-white shadow-sm mb-4">
          <Card.Header className="bg-primary text-white border-bottom border-light border-2 pt-3 pb-3">
            <h5 className="mb-0">Khởi Tạo Kế Hoạch Lô Hàng</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group id="id">
                    <Form.Label className="fw-bold">
                      Mã lô hàng <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="id"
                      placeholder="VD: BATCH_2026_001"
                      value={formData.id}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group id="batch_name">
                    <Form.Label className="fw-bold">Tên lô hàng</Form.Label>
                    <Form.Control
                      type="text"
                      name="batch_name"
                      placeholder="VD: Lô sản phẩm tháng 3"
                      value={formData.batch_name}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4 g-4">
                <Col xs={12} xl={6}>
                  <Form.Group id="product_id">
                    <Form.Label className="fw-bold text-dark">
                      Sản phẩm <span className="text-danger">*</span>
                    </Form.Label>

                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        as={Button}
                        variant="outline-gray-300"
                        className="w-100 d-flex justify-content-between align-items-center bg-white shadow-none text-start px-3"
                        style={{ height: "auto", minHeight: "50px" }}
                      >
                        {selectedProduct ? (
                          <div className="d-flex align-items-center overflow-hidden">
                            <Image
                              src={
                                selectedProduct.main_cardimage
                                  ? `${process.env.REACT_APP_API_IMAGE_URL}main-card/${selectedProduct.main_cardimage}`
                                  : defaultImage
                              }
                              className="flex-shrink-0 rounded me-2"
                              style={{
                                width: "28px",
                                height: "28px",
                                objectFit: "cover",
                              }}
                            />
                            <span className="text-truncate fw-normal small text-dark">
                              {selectedProduct.name ||
                                selectedProduct.product_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted small fw-normal">
                            -- Chọn sản phẩm tham chiếu --
                          </span>
                        )}
                        <i className="fas fa-chevron-down ms-2 text-gray-400 small" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu
                        className="w-100 shadow-lg border-0 p-3"
                        style={{ minWidth: "320px", maxWidth: "95vw" }}
                      >
                        <Form.Control
                          type="text"
                          placeholder="🔍 Tìm tên hoặc mã..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-3 shadow-none"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div
                          style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
                        >
                          <Row className="g-2 m-0">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => (
                                <Col xs={12} sm={6} key={product.id}>
                                  <div
                                    className={`p-2 border rounded cursor-pointer h-100 d-flex align-items-center transition-300 ${
                                      formData.product_id === product.id
                                        ? "border-primary bg-soft-primary"
                                        : "border-gray-100 bg-white"
                                    }`}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        product_id: product.id,
                                      });
                                      setSearchTerm("");
                                    }}
                                  >
                                    <Image
                                      src={
                                        product.main_cardimage
                                          ? `${API_URL}main-card/${product.main_cardimage}`
                                          : defaultImage
                                      }
                                      className="rounded flex-shrink-0"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div className="ms-2 overflow-hidden text-start">
                                      <div
                                        className="fw-bold text-dark text-truncate small"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        {product.name || product.product_name}
                                      </div>
                                      <div className="text-muted extra-small">
                                        ID: #{product.id}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              ))
                            ) : (
                              <div className="text-center w-100 py-3 text-muted small">
                                Không có dữ liệu!
                              </div>
                            )}
                          </Row>
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>

                {/* --- CỘT 2: BỘ PHẬN --- */}
                <Col xs={12} xl={6}>
                  <Form.Group id="Department_id">
                    <Form.Label className="fw-bold text-dark">
                      Bộ phận / Phân xưởng sản xuất{" "}
                      <span className="text-danger">*</span>
                    </Form.Label>

                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        as={Button}
                        variant="outline-gray-300"
                        className="w-100 d-flex justify-content-between align-items-center bg-white shadow-none text-start px-3"
                        style={{ height: "auto", minHeight: "50px" }}
                      >
                        {selectedDept ? (
                          <div className="d-flex flex-column text-start overflow-hidden">
                            <span
                              className="fw-bold text-dark small text-truncate"
                              style={{ lineHeight: "1.2" }}
                            >
                              {selectedDept.partname}
                            </span>
                            <span className="text-muted extra-small mt-1">
                              #{selectedDept.id} • 👤{" "}
                              {selectedDept.leader?.name || "Chưa phân công"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted small fw-normal">
                            -- Chọn bộ phận phụ trách --
                          </span>
                        )}
                        <i className="fas fa-chevron-down ms-2 text-gray-400 small" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu
                        className="w-100 shadow-lg border-0 p-2"
                        style={{ minWidth: "320px", maxWidth: "95vw" }}
                      >
                        <div className="p-2 sticky-top bg-white">
                          <Form.Control
                            type="text"
                            placeholder="🔍 Tìm bộ phận, mã hoặc quản lý..."
                            value={searchDeptTerm}
                            onChange={(e) => setSearchDeptTerm(e.target.value)}
                            className="shadow-none border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept) => (
                              <Dropdown.Item
                                key={dept.id}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    Department_id: dept.id,
                                  });
                                  setSearchDeptTerm("");
                                }}
                                className={`rounded mb-1 px-3 py-2 ${
                                  formData.Department_id === dept.id
                                    ? "bg-soft-primary border-start border-primary border-3"
                                    : ""
                                }`}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <div className="fw-bold text-dark small">
                                      {dept.partname}
                                    </div>
                                    <div className="text-muted extra-small">
                                      <span className="text-primary me-2">
                                        #{dept.id}
                                      </span>
                                      <i className="fas fa-user-tie me-1" />{" "}
                                      {dept.leader?.name || "N/A"}
                                    </div>
                                  </div>
                                  {formData.Department_id === dept.id && (
                                    <i className="fas fa-check text-primary small" />
                                  )}
                                </div>
                              </Dropdown.Item>
                            ))
                          ) : (
                            <div className="text-center py-3 text-muted small">
                              Không tìm thấy bộ phận!
                            </div>
                          )}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group id="quantity">
                    <Form.Label className="fw-bold">
                      Số lượng sản xuất <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="quantity"
                      min="1"
                      placeholder="Nhập số lượng"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group id="manufacture_date">
                    <Form.Label className="fw-bold">
                      Ngày sản xuất <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="date"
                      name="manufacture_date"
                      value={formData.manufacture_date}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group id="expiry_date">
                    <Form.Label className="fw-bold">
                      Hạn sản xuất<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col sm={12}>
                  <Form.Group id="description">
                    <Form.Label className="fw-bold">
                      Ghi chú / Mô tả chi tiết
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      name="description"
                      placeholder="Nhập quy cách đóng gói, điều kiện bảo quản..."
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-none"
                    />
                  </Form.Group>
                </Col>
              </Row>
              {/* --- CỘT 3: QUY CÁCH ĐÓNG GÓI (BOX) --- */}
              <Row className="mb-4">
                <Col xs={12}>
                  <Form.Group id="packaging_id">
                    <Form.Label className="fw-bold text-dark">
                      Quy cách đóng gói (Bao bì){" "}
                      <span className="text-danger">*</span>
                    </Form.Label>

                    <Dropdown className="w-100">
                      <Dropdown.Toggle
                        as={Button}
                        variant="outline-gray-300"
                        className="w-100 d-flex justify-content-between align-items-center bg-white shadow-none text-start px-3"
                        style={{
                          height: "auto",
                          minHeight: "60px",
                          border: "1px solid #d1d9e6",
                        }}
                      >
                        {selectedBox ? (
                          <div className="d-flex align-items-center w-100">
                            <div className="flex-shrink-0 bg-light rounded p-1 me-3 border">
                              <Image
                                src={
                                  selectedBox.image_printer
                                    ? `${process.env.REACT_APP_API_IMAGE_URL}box-card/${selectedBox.image_printer}`
                                    : defaultImage
                                }
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold text-primary mb-0">
                                  {selectedBox.pack_code}
                                </span>
                                <Badge
                                  bg="soft-warning"
                                  className="text-warning small"
                                >
                                  {selectedBox.volume} m³
                                </Badge>
                              </div>
                              <div className="text-muted extra-small">
                                {selectedBox.material} •{" "}
                                {parseFloat(selectedBox.length)}x
                                {parseFloat(selectedBox.width)}x
                                {parseFloat(selectedBox.height)} cm
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted small fw-normal">
                            -- Chọn loại hộp/pallet đóng gói --
                          </span>
                        )}
                        <i className="fas fa-box-open ms-2 text-gray-400" />
                      </Dropdown.Toggle>

                      <Dropdown.Menu
                        className="w-100 shadow-lg border-0 p-3"
                        style={{
                          minWidth: "650px",
                          maxHeight: "450px",
                          overflowY: "auto",
                        }}
                      >
                        <div className="p-2 sticky-top bg-white border-bottom mb-3">
                          <Form.Control
                            type="text"
                            placeholder="🔍 Tìm mã hộp hoặc chất liệu..."
                            value={searchBoxTerm}
                            onChange={(e) => setSearchBoxTerm(e.target.value)}
                            className="shadow-none border-gray-200"
                          />
                        </div>

                        <Row className="g-3 m-0">
                          {filteredBoxes.length > 0 ? (
                            filteredBoxes.map((box) => (
                              <Col xs={12} md={6} lg={4} key={box.id}>
                                <div
                                  className={`packaging-grid-item ${formData.packaging_id === box.id ? "selected" : ""}`}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      packaging_id: box.id,
                                    });
                                    setSearchBoxTerm("");
                                  }}
                                >
                                  {/* Phần Header chứa Ảnh & Badge Thể tích */}
                                  <div className="item-image-header">
                                    <Badge bg="warning" className="vol-badge">
                                      {box.volume} m³
                                    </Badge>
                                    <Image
                                      src={
                                        box.image_printer
                                          ? `${process.env.REACT_APP_API_IMAGE_URL}box-card/${box.image_printer}`
                                          : defaultImage
                                      }
                                      className="img-content"
                                    />
                                  </div>

                                  {/* Phần Body chứa Thông tin Kỹ thuật */}
                                  <div className="item-body p-3">
                                    <div className="fw-bold text-dark h6 mb-1">
                                      {box.pack_code}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <Badge
                                        pill
                                        bg="light"
                                        className="text-dark border small fw-normal"
                                      >
                                        {box.material}
                                      </Badge>
                                      <span className="text-muted extra-small">
                                        {parseFloat(box.length)}x
                                        {parseFloat(box.width)}x
                                        {parseFloat(box.height)} cm
                                      </span>
                                    </div>

                                    {/* Phần Footer chứa Tải trọng - Grid Structure */}
                                    <div className="item-spec-footer border-top pt-2 mt-auto">
                                      <Row className="g-0 extra-small">
                                        <Col xs={6} className="text-muted">
                                          Tải tối đa:
                                        </Col>
                                        <Col
                                          xs={6}
                                          className="text-navy fw-bold text-end"
                                        >
                                          {parseFloat(box.max_weight_capacity)}{" "}
                                          kg
                                        </Col>
                                      </Row>
                                    </div>
                                  </div>
                                </div>
                              </Col>
                            ))
                          ) : (
                            <div className="text-center w-100 py-4 text-muted small">
                              Không tìm thấy bao bì phù hợp!
                            </div>
                          )}
                        </Row>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end border-top pt-4 mt-2">
                <Button
                  variant="outline-gray-500"
                  type="button"
                  className="me-3"
                  onClick={() =>
                    setFormData({
                      id: "",
                      batch_name: "",
                      product_id: "",
                      Department_id: "",
                      description: "",
                      manufacture_date: "",
                      expiry_date: "",
                      quantity: "",
                    })
                  }
                >
                  Làm mới
                </Button>
                <Button disabled={apiwait} variant="primary" type="submit">
                  Lưu Kế Hoạch Nội Bộ
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CreateBatchForm;
