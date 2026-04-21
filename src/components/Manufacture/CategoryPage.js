import React, { Component, useContext, useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Form,
  Row,
  Col,
  Badge,
} from "@themesberg/react-bootstrap";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/Manufacture/category_page.scss";
import { UserContext } from "../../Context/UserContext";
import Preloader from "../Preloader";
import RocketLoad from "../../Utils/RocketLoad";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoad, setIsLoad] = useState(true);
  const { User } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "available",
  });

  const fetchCategories = async () => {
    try {
      setIsLoad(true);
      const res = await api_request.getCategories(User);
      if (res.RC === 200) setCategories(res.RD);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  };

  const handleChange = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const submitCategory = async () => {
    if (!formData.name) return alert("Tên category không được để trống!");

    const res = await api_request.createCategory(User, formData);
    if (res.RC === 200) {
      fetchCategories();
      setFormData({ name: "", description: "", status: "available" });
      setCategories((prev) => [...prev, res.RD]);
    } else {
      alert(res.RM);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoad) {
    return (
      <div
        style={{
          display: "flex",
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
    <div className="category-page">
      <Row className="gy-4">
        {/* CATEGORY LIST */}
        <Col md={8} data-aos="fade-right">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Danh sách Categories</h5>
            </Card.Header>

            <Card.Body>
              <Table hover responsive className="category-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td>{c.cate_name}</td>
                      <td>{c.description}</td>
                      <td>
                        <Badge
                          bg={c.status === "available" ? "success" : "warning"}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="danger">
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        Chưa có category nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} data-aos="fade-left">
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Thêm Category mới</h5>
            </Card.Header>

            <Card.Body>
              <Form>
                <div className="mb-3">
                  <Form.Label>Tên Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ví dụ: Thời trang, Mỹ phẩm..."
                  />
                </div>

                <div className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Nội dung mô tả category"
                  />
                </div>

                <div className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="pre_order">Pre-order</option>
                    <option value="custom_order">Custom order</option>
                  </Form.Select>
                </div>

                <Button
                  variant="primary"
                  className="w-100"
                  onClick={submitCategory}
                >
                  Thêm Category
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CategoryPage;
