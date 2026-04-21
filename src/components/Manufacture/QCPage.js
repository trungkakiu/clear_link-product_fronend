import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Image,
  Container,
} from "@themesberg/react-bootstrap";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import "../../scss/volt/components/Manufacture/QCPage.scss";
import RocketLoad from "../../Utils/RocketLoad";
import { useHistory } from "react-router-dom";
import QCReportModal from "../Modal/Manufacture/QCReportModal";

const QCPage = () => {
  const { User } = useContext(UserContext);
  const history = useHistory();
  const [qcBatches, setQcBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoad, setIsLoad] = useState(true);
  const [modalstate, setmodalstate] = useState(false);
  const [modaldata, setmodaldata] = useState(null);
  const API_URL =
    process.env.REACT_APP_API_IMAGE_URL || "http://localhost:5000/";

  const getQCData = async () => {
    try {
      const res = await api_request.getQCreadyStatus(User);
      if (res.RC === 200) {
        setQcBatches(res.RD || res.data || []);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu QC");
    } finally {
      setTimeout(() => {
        setIsLoad(false);
      }, 1000);
    }
  };

  useEffect(() => {
    getQCData();
  }, []);

  const filteredList = qcBatches.filter(
    (batch) =>
      batch.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.id?.toString().includes(searchTerm),
  );

  const getStatusConfig = (status) => {
    switch (status) {
      case "QC_passed":
        return {
          label: "ĐẠT CHUẨN",
          color: "success",
          progress: 100,
          icon: "fa-check-circle",
        };
      case "QC_failed":
        return {
          label: "LỖI / HỦY",
          color: "danger",
          progress: 100,
          icon: "fa-times-circle",
        };
      case "QC_checking":
        return {
          label: "ĐANG KIỂM TRA",
          color: "warning",
          progress: 45,
          icon: "fa-spinner fa-spin",
        };
      default:
        return {
          label: "CHỜ XỬ LÝ",
          color: "secondary",
          progress: 0,
          icon: "fa-clock",
        };
    }
  };

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
    <div className="aws-dashboard-wrapper p-3">
      <Card className="aws-header mb-4 shadow-sm border-0">
        <Card.Body
          className="d-flex align-items-center justify-content-between py-2 px-4"
          style={{ height: "80px" }}
        >
          <div className="d-flex align-items-center flex-shrink-0">
            <div className="bg-primary-soft p-2 rounded me-3 text-primary">
              <i className="fas fa-shield-check fa-lg"></i>
            </div>
            <div>
              <h4 className="aws-title mb-0 fw-bold">
                Giám Sát Chất Lượng Cao Cấp
              </h4>
              <div className="aws-subtitle d-none d-lg-block text-muted small">
                Báo cáo tình trạng QC theo thời gian thực
              </div>
            </div>
          </div>

          <div className="flex-grow-1 mx-4" style={{ maxWidth: "450px" }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 shadow-none"
                placeholder="Tìm mã lô hoặc tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-gray-300"
              className="aws-btn-outline btn-sm"
              onClick={getQCData}
            >
              <i className="fas fa-sync-alt me-1"></i> Làm mới
            </Button>
            <div className="bg-light px-3 py-1 rounded border small fw-bold">
              Tổng: {filteredList.length}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Container fluid className="px-0">
        <Row className="g-3">
          {filteredList.length > 0 ? (
            <>
              {filteredList.map((batch) => {
                const config = getStatusConfig(batch.status);
                return (
                  <Col xs={12} md={6} xl={4} key={batch.id}>
                    <Card
                      data-aos="fade-up"
                      className="aws-batch-card border-0 shadow-sm h-100 shadow-hover"
                    >
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center">
                            <Image
                              src={
                                batch.product?.main_cardimage
                                  ? `${API_URL}main-card/${batch.product.main_cardimage}`
                                  : "https://via.placeholder.com/60"
                              }
                              rounded
                              className="me-2 border shadow-xs"
                              style={{
                                width: "55px",
                                height: "55px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <div
                                className="fw-extrabold text-dark small text-truncate"
                                style={{ maxWidth: "160px" }}
                              >
                                {batch.batch_name ||
                                  batch.product?.name ||
                                  "Lô sản phẩm"}
                              </div>
                              <div className="aws-id-badge text-primary">
                                ID: {batch.id}
                              </div>
                            </div>
                          </div>
                          <Badge
                            bg={config.color}
                            className={
                              batch.status === "QC_checking"
                                ? "animate-pulse"
                                : ""
                            }
                          >
                            <i className={`fas ${config.icon} me-1`}></i>{" "}
                            {config.label}
                          </Badge>
                        </div>

                        <div className="bg-light p-2 rounded mb-3 border">
                          <div className="d-flex justify-content-between extra-small mb-1 fw-bold">
                            <span className="text-muted text-uppercase">
                              Tình trạng kiểm tra:
                            </span>
                            <span className={`text-${config.color}`}>
                              {config.progress}%
                            </span>
                          </div>
                          <div
                            className="progress shadow-sm"
                            style={{ height: "8px" }}
                          >
                            <div
                              className={`progress-bar bg-${config.color} ${batch.status === "QC_checking" ? "progress-bar-animated progress-bar-striped" : ""}`}
                              style={{ width: `${config.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center extra-small mt-2">
                          <div className="text-muted">
                            <i className="fas fa-layer-group me-1"></i> SL:{" "}
                            <strong>{batch.quantity?.toLocaleString()}</strong>
                          </div>
                          <div className="text-muted">
                            <i className="fas fa-calendar-alt me-1"></i> Hạn:{" "}
                            <strong>
                              {new Date(batch.expiry_date).toLocaleDateString(
                                "vi-VN",
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className="mt-3 d-grid">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setmodalstate(true);
                              setmodaldata(batch);
                            }}
                            className="fw-bold aws-btn-sm py-2"
                          >
                            <i className="fas fa-file-medical-alt me-2"></i>
                            BÁO CÁO CHI TIẾT
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </>
          ) : (
            <div className="aws-empty-state-wrapper">
              <Card className="aws-empty-card border-dashed">
                <Card.Body className="text-center py-5">
                  <div className="aws-empty-icon-container mb-4">
                    <i className="fas fa-boxes text-muted"></i>
                  </div>
                  <h5 className="aws-empty-title">
                    Không có lô hàng nào cần xử lý
                  </h5>
                  <p className="aws-empty-description mx-auto">
                    Hiện tại hệ thống không ghi nhận lô hàng nào đang trong
                    trạng thái chờ hoặc kiểm tra. Vui lòng thay đổi bộ lọc hoặc
                    khởi tạo lô hàng mới từ bộ phận sản xuất.
                  </p>
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <Button
                      onClick={() =>
                        history.push("/Products/Manufacturer/new-post")
                      }
                      className="aws-btn-orange px-4"
                    >
                      <i className="fas fa-plus me-2"></i> Khởi tạo lô hàng
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="aws-btn-ghost px-4"
                      onClick={() =>
                        history.push("/Products/Manufacturer/process")
                      }
                    >
                      Kiểm tra sản xuất
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Row>
      </Container>
      <QCReportModal
        onHide={() => setmodalstate(false)}
        show={modalstate}
        batchData={modaldata}
        closeReload={() => {
          setmodalstate(false);
          getQCData();
        }}
      />
    </div>
  );
};

export default QCPage;
