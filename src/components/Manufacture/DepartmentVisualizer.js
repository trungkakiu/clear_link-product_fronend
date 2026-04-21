import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Container,
  Image,
  Button,
} from "@themesberg/react-bootstrap";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/Manufacture/DepartmentVisualizer.scss";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import { useHistory } from "react-router-dom";
import DepartmentDetailModal from "../Modal/Manufacture/DepartmentDetailModal";

const DepartmentVisualizer = () => {
  const [mockDepartments, setMockDepartments] = React.useState([]);
  const { User } = React.useContext(UserContext);
  const history = useHistory();
  const API_URL = process.env.REACT_APP_API_IMAGE_URL || "";
  const [isLoad, setIsLoad] = useState(true);

  const [selectedDept, setSelectedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowBatches = (dept) => {
    setSelectedDept(dept);
    setShowModal(true);
  };

  const checkExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate).getTime() < new Date().getTime();
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);

    return d.toLocaleDateString("vi-VN");
  };

  const isBatchRunning = (manufactureDate) => {
    if (!manufactureDate) return true;
    const today = new Date().setHours(0, 0, 0, 0);
    const runDate = new Date(manufactureDate).setHours(0, 0, 0, 0);
    return runDate <= today;
  };

  const getMockDepartments = async () => {
    try {
      setIsLoad(true);
      const res = await api_request.get_departments(User);
      if (res.RC === 200) {
        setMockDepartments(res.RD);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  };

  const productBatchState = async (batch, status) => {
    try {
      if (!batch || !status) {
        toast.error(`thiếu thông tin lô hàng hoặc trạng thái!`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      const res = await api_request.set_batch_state(User, batch.id, status);
      if (res.RC === 200) {
        getMockDepartments();
      } else {
        toast.error(
          `Cập nhật trạng thái lô hàng ${batch.batch_name} thất bại!`,
          {
            position: "top-right",
            autoClose: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Failed to update batch state:", error);
      toast.error(
        `Có lỗi xảy ra khi cập nhật trạng thái lô hàng ${batch.batch_name}!`,
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    }
  };

  useEffect(() => {
    getMockDepartments();
  }, []);

  const updateBatchQuantity = async (batchId, newQtt) => {
    try {
      const res = await api_request.updateBatchQuantityApi(
        User,
        batchId,
        newQtt,
      );

      if (res) {
        if (res.RC === 200) {
          toast.success(res.RM);
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    }
  };

  const renderProductionLine = (dept) => (
    <Card border="light" className="shadow-sm mb-4" key={dept.id}>
      <Card.Body>
        <Row className="align-items-center">
          <Col md={3} className="text-center border-end">
            <div className="position-relative d-inline-block mb-2">
              <img
                src={
                  dept.leader?.avatar
                    ? `${API_URL}main-card/${dept.leader.avatar}`
                    : "https://via.placeholder.com/150"
                }
                alt="Leader"
                className="rounded-circle border border-3 border-success p-1 bg-white"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
              <Badge
                bg="success"
                className="position-absolute bottom-0 start-50 translate-middle-x border border-white"
              >
                Leader
              </Badge>
            </div>
            <h6 className="fw-bold mb-0 text-truncate px-2">
              {dept.leader?.name || "Chưa có"}
            </h6>
            <small className="text-muted d-block text-truncate small">
              {dept.partname}
            </small>
          </Col>

          <Col md={9}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-dark">{dept.partname}</span>
              <div>
                <Badge
                  bg={dept.active ? "success" : "warning"}
                  className="me-2"
                >
                  {dept.active ? "Đang Chạy" : "Tạm Dừng"}
                </Badge>
                <Badge bg="primary">{dept.role_level}</Badge>
              </div>
            </div>

            <div className="conveyor-container w-100">
              {dept.batches && dept.batches.length > 0 ? (
                dept.batches.map((batch) => {
                  const running = isBatchRunning(batch.manufacture_date);
                  const expired = checkExpired(batch.expiry_date);
                  const progress = Math.min(
                    Math.round(
                      ((batch.progress_quantity || 0) / batch.quantity) * 100,
                    ),
                    100,
                  );

                  return (
                    <div
                      className={`batch-item-card position-relative ${expired ? "batch-expired-shaking" : ""}`}
                      key={batch.id}
                      onClick={() => handleShowBatches(dept)}
                      style={{
                        opacity: !dept.active || !running ? 0.5 : 1,
                        minWidth: "260px",
                        cursor: "pointer",
                      }}
                    >
                      {batch.isOEM && (
                        <Badge
                          className="position-absolute top-0 end-1 border border-white shadow-sm"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "8px",
                            marginRight: "8px",
                            fontSize: "0.65rem",
                            fontWeight: "800",
                            padding: "4px",
                            borderRadius: "5px",
                            letterSpacing: "0.5px",
                            lineHeight: "1",
                            backgroundColor:
                              batch.status === "completed"
                                ? "#2ecc71"
                                : batch.status === "in_progress"
                                  ? "#0864e5"
                                  : batch.status === "pending"
                                    ? "#f1c40f"
                                    : "#e74c3c",
                            color: "#fff",
                            zIndex: 1,
                            height: "20px",
                          }}
                        >
                          OEM
                        </Badge>
                      )}

                      <Badge
                        className="position-absolute top-0 end-0 border border-white"
                        style={{
                          marginTop: "8px",
                          marginRight: "8px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          padding: 0,
                          display: "block",
                          backgroundColor:
                            batch.status === "completed"
                              ? "#2ecc71"
                              : batch.status === "in_progress"
                                ? "#0864e5"
                                : batch.status === "pending"
                                  ? "#f1c40f"
                                  : "#e74c3c",
                        }}
                        title={
                          batch.status === "completed"
                            ? "Hoàn Thành"
                            : batch.status === "in_progress"
                              ? "Đang Làm"
                              : "Chưa Bắt Đầu"
                        }
                      />
                      {expired && (
                        <div className="expired-overlay">
                          <div
                            className="fw-bold text-danger mb-1"
                            style={{ fontSize: "0.9rem" }}
                          >
                            LÔ HÀNG QUÁ HẠN! {batch.progress_quantity || 0} /{" "}
                            {batch.quantity}
                          </div>
                          <div className="d-flex gap-2 w-100 px-2">
                            <button
                              onClick={() =>
                                productBatchState(batch, "completed")
                              }
                              className="btn btn-success btn-sm flex-fill fw-bold"
                              style={{ fontSize: "0.65rem" }}
                            >
                              HOÀN THÀNH
                            </button>
                            <button
                              onClick={() =>
                                productBatchState(batch, "not_completed")
                              }
                              className="btn btn-danger btn-sm flex-fill fw-bold"
                              style={{ fontSize: "0.65rem" }}
                            >
                              KHÔNG HOÀN THÀNH
                            </button>
                          </div>
                        </div>
                      )}

                      <Row className="g-0 align-items-center">
                        <Col xs={4} className="text-center border-end pe-2">
                          <Image
                            src={
                              batch.product?.main_cardimage
                                ? `${API_URL}main-card/${batch.product.main_cardimage}`
                                : "https://via.placeholder.com/80?text=SP"
                            }
                            rounded
                            style={{
                              width: "100%",
                              height: "60px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80?text=SP";
                            }}
                          />
                          <div
                            className="mt-1 fw-bold text-dark text-truncate"
                            style={{ fontSize: "0.65rem" }}
                          >
                            #{batch.id}
                          </div>
                        </Col>

                        <Col xs={8} className="ps-2">
                          <div
                            className="fw-bold text-dark text-truncate mb-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {batch.batch_name}
                          </div>

                          <div
                            className="d-flex justify-content-between align-items-center extra-small mb-1"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <span className="text-muted">SL:</span>
                            <span className="fw-bold text-primary">
                              {batch.progress_quantity || 0} / {batch.quantity}
                            </span>
                          </div>

                          <div
                            className="progress mb-2"
                            style={{ height: "4px" }}
                          >
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>

                          <div className="d-flex align-items-center">
                            <i
                              className="far fa-clock me-1"
                              style={{
                                fontSize: "0.65rem",
                                color: expired ? "red" : "#0dcaf0",
                              }}
                            ></i>
                            <small
                              className="fw-bold"
                              style={{
                                fontSize: "0.65rem",
                                color: expired ? "red" : "#555",
                              }}
                            >
                              {expired ? "Quá hạn: " : "Hạn: "}
                              {formatDateShort(batch.expiry_date)}
                            </small>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                })
              ) : (
                <div className="text-muted w-100 text-center fw-bold opacity-50 small">
                  (Băng chuyền trống)
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderTechnicalLine = (dept) => (
    <Card border="light" className="shadow-sm mb-4 bg-light" key={dept.id}>
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col
            xs={12}
            md={3}
            className="text-center border-md-end mb-3 mb-md-0 pb-2"
          >
            <Image
              src={
                dept.leader?.avatar
                  ? `${API_URL}main-card/${dept.leader.avatar}`
                  : "https://via.placeholder.com/150"
              }
              roundedCircle
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
              className="border border-3 border-secondary p-1 bg-white"
            />
            <div className="fw-bold small mt-1">
              {dept.leader?.name || "Chưa có"}
            </div>
            <Badge bg="secondary" style={{ fontSize: "0.6rem" }}>
              Tech Lead
            </Badge>
          </Col>

          <Col
            xs={12}
            md={9}
            className="ps-md-4 d-flex justify-content-between align-items-center"
          >
            <div>
              <h5 className="fw-bold text-dark mb-1">{dept.partname}</h5>
              <div
                className={
                  dept.active
                    ? "text-success small fw-bold"
                    : "text-danger small"
                }
              >
                ● {dept.active ? "Hệ thống đang trực" : "Hệ thống nghỉ"}
              </div>
            </div>
            <div
              className="d-flex align-items-center gap-2"
              style={{ opacity: dept.active ? 1 : 0.3 }}
            >
              <div className="gear-icon">⚙️</div>
              <div className="gear-icon gear-reverse">⚙️</div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  if (isLoad) {
    return (
      <div
        style={{
          width: "100%",
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
    <Container className="p-0 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-gray-800 mb-0">
          Sơ Đồ Phân Xưởng (Factory Layout)
        </h4>
        {/* Nút thêm mới nhanh luôn hiển thị ở góc trên nếu đã có dữ liệu */}
        {mockDepartments.length > 0 && (
          <Button variant="primary" size="sm" className="shadow-sm">
            <i className="fas fa-plus me-2"></i>Thêm Bộ Phận
          </Button>
        )}
      </div>

      {mockDepartments.length > 0 ? (
        mockDepartments
          .filter(
            (dept) => dept.part === "production" || dept.part === "technical",
          )
          .map((dept, index) => (
            <div key={dept.id} data-aos="fade-left" data-aos-delay={index * 50}>
              {dept.part === "production"
                ? renderProductionLine(dept)
                : renderTechnicalLine(dept)}
            </div>
          ))
      ) : (
        <Card className="aws-empty-state-card" style={{ minHeight: "60vh" }}>
          <Card.Body className="d-flex flex-column justify-content-center align-items-center">
            <div className="aws-icon-container mb-4">
              <i className="fas fa-industry"></i>
            </div>

            <h4 className="aws-title mb-2">
              Chưa có bộ phận nào được thiết lập
            </h4>

            <p className="aws-description mb-4">
              Hệ thống chưa ghi nhận cấu trúc phân xưởng của bạn. Hãy bắt đầu
              bằng cách thiết lập các đơn vị vận hành để kích hoạt giám sát quy
              trình On-chain.
            </p>

            <div className="d-flex gap-2">
              <Button
                onClick={() => history.push("/Users/department")}
                className="aws-btn-primary"
              >
                Thêm Bộ Phận Mới
              </Button>
              <Button className="aws-btn-secondary">
                Nhập dữ liệu từ file
              </Button>
            </div>

            <div className="mt-4">
              <a href="#docs" className="aws-link small">
                Tìm hiểu thêm về cấu trúc phân xưởng{" "}
                <i className="fas fa-external-link-alt ms-1"></i>
              </a>
            </div>
          </Card.Body>
        </Card>
      )}

      <DepartmentDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        department={selectedDept}
        API_URL={API_URL}
        onUpdateQuantity={(batchId, newQty) => {
          updateBatchQuantity(batchId, newQty);
        }}
      />
    </Container>
  );
};

export default DepartmentVisualizer;
