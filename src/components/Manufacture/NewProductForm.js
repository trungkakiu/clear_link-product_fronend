import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "@themesberg/react-bootstrap";

import { faUpload, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../scss/volt/components/Manufacture/NewProductForm.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

export default () => {
  const [ispageload, setispageload] = useState(false);
  const [isload, setisload] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    responsible_person: "",
    author: "",
    description: "",
    type: "",
    stock_quantity: "",
    status: "available",
    category_id: "",
  });
  const onSubmit = async (data) => {
    try {
      setisload(true);
      const res = await api_request.addnewproduct(User, data);
      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setisload(false);
    }
  };
  const { User } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState("");

  const [subImages, setSubImages] = useState([]);
  const [subPreview, setSubPreview] = useState([]);

  const fetchCategories = async () => {
    try {
      setispageload(true);
      const res = await api_request.getCategories(User);
      if (res.RC === 200) setCategories(res.RD);
    } catch (err) {
      console.error(err);
    } finally {
      setispageload(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (key, val) => {
    setProduct((prev) => ({ ...prev, [key]: val }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleSubImages = (e) => {
    const files = Array.from(e.target.files);
    setSubImages((prev) => [...prev, ...files]);

    const previews = files.map((f) => URL.createObjectURL(f));
    setSubPreview((prev) => [...prev, ...previews]);
  };

  const removeSubImg = (index) => {
    const newFiles = [...subImages];
    const newPreview = [...subPreview];

    newFiles.splice(index, 1);
    newPreview.splice(index, 1);

    setSubImages(newFiles);
    setSubPreview(newPreview);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!mainImage) {
      alert("Vui lòng chọn ảnh đại diện!");
      return;
    }

    const formData = new FormData();
    Object.keys(product).forEach((key) => formData.append(key, product[key]));
    formData.append("main_cardimage", mainImage);
    subImages.forEach((item) => formData.append("sub_images", item));
    onSubmit(formData);
  };

  return (
    <Form onSubmit={submitHandler}>
      <Row className="mt-4">
        <Col md={8}>
          <Card className="p-4 shadow-sm border-0">
            <h4 className="mb-3 fw-bold">Thông tin sản phẩm</h4>

            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm"
                value={product.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá bán</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="VD: 120000"
                    value={product.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng tồn kho</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="VD: 500"
                    value={product.stock_quantity}
                    onChange={(e) =>
                      handleChange("stock_quantity", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại sản phẩm</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Đồ uống, Thời trang..."
                    value={product.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={product.category_id}
                    onChange={(e) =>
                      handleChange("category_id", e.target.value)
                    }
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cate_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Mô tả chi tiết sản phẩm..."
                value={product.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={product.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="available">Có sẵn</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="discontinued">Ngừng kinh doanh</option>
                <option value="not_sold">Không bán</option>
                <option value="pre_order">Pre-order</option>
                <option value="back_order">Back-order</option>
                <option value="limited_edition">Limited edition</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3 px-4">
              Tạo sản phẩm
            </Button>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col md={4}>
          {/* MAIN IMAGE */}
          <Card className="p-4 shadow-sm border-0 mb-4">
            <h5 className="fw-bold mb-2">Ảnh đại diện</h5>

            <div className="text-center mb-3">
              {mainPreview ? (
                <img
                  src={mainPreview}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="d-flex flex-column align-items-center justify-content-center"
                  style={{
                    width: "100%",
                    height: 180,
                    background: "#f3f4f6",
                    borderRadius: 12,
                  }}
                >
                  <FontAwesomeIcon icon={faImage} size="3x" color="#9ca3af" />
                  <p className="text-muted mt-2">Chưa chọn ảnh</p>
                </div>
              )}
            </div>

            <Form.Group>
              <Form.Label className="btn btn-outline-primary w-100">
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Chọn ảnh đại diện
                <Form.Control
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleMainImage}
                />
              </Form.Label>
            </Form.Group>
          </Card>

          {/* SUB IMAGES */}
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-2">Ảnh phụ (nhiều ảnh)</h5>

            <Form.Group className="mb-3">
              <Form.Label className="btn btn-outline-secondary w-100">
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Chọn ảnh phụ
                <Form.Control
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleSubImages}
                />
              </Form.Label>
            </Form.Group>

            {/* Preview grid */}
            <Row>
              {subPreview.map((img, idx) => (
                <Col xs={4} key={idx} className="mb-3">
                  <div style={{ position: "relative" }}>
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: "100%",
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />

                    <Button
                      size="sm"
                      variant="danger"
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        padding: "0px 6px",
                        borderRadius: "50%",
                      }}
                      onClick={() => removeSubImg(idx)}
                    >
                      ×
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};
