import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Container,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faTrashAlt,
  faSave,
  faCog,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Manufacture/Product_detail.scss";
import api_request from "../../../apicontroller/api_request";
import Otp_vetify from "../Otp_vetify";
import ProductSettingsModal from "./ProductSettingsModal";

const Product_detail = ({ show, product, onClose, closeRefresh }) => {
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [productRawData, setProductRawData] = useState(null);
  const [isloading, setIsloading] = useState(false);
  const [isOTPopen, setisOTPopen] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    show: false,
    title: "",
    data: null,
  });

  const [modalState, setModalState] = useState({
    productsetting: false,
  });

  const [modalData, setModalData] = useState({
    productsetting: null,
  });

  const openModal = (key, data) => {
    try {
      console.log("ca");
      setModalState((prev) => ({
        ...prev,
        [key]: true,
      }));
      setModalData((prev) => ({
        ...prev,
        [key]: data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const closeModal = (key, isRefresh) => {
    try {
      setModalState((prev) => ({
        ...prev,
        [key]: false,
      }));

      if (isRefresh) {
        closeRefresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (product) {
      loadRawData();
    }
  }, [product]);

  const InfoDialog = ({ show, title, data, onClose }) => {
    if (!data) return null;

    const formatKey = (key) => {
      return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <Modal
        show={show}
        onHide={onClose}
        size="lg"
        centered
        className="aws-theme-modal"
      >
        <Modal.Header closeButton className="border-bottom-0 pt-4 px-4">
          <Modal.Title
            className="h6 fw-bold text-primary text-uppercase"
            style={{ letterSpacing: "1px" }}
          >
            {title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pb-4">
          <div className="aws-info-horizontal-grid">
            <Row className="g-3">
              {Object.entries(data).map(([key, value]) => {
                if (typeof value === "object" && value !== null) return null;

                return (
                  <Col md={6} lg={4} key={key} className="aws-info-col">
                    <div className="aws-horizontal-item p-2 rounded border bg-light h-100">
                      <label
                        className="d-block text-muted mb-0"
                        style={{ fontSize: "11px", fontWeight: "600" }}
                      >
                        {formatKey(key)}
                      </label>
                      <div
                        className="text-dark fw-semibold text-truncate"
                        title={String(value)}
                        style={{ fontSize: "13px" }}
                      >
                        {value ? (
                          String(value)
                        ) : (
                          <span className="text-muted fw-normal">N/A</span>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="px-4"
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const loadRawData = async () => {
    try {
      setIsloading(true);
      const res = await api_request.getRawProductData({
        id: product.id,
        author: product.author,
        responsible_person: product.responsible_person,
        category_id: product.category_id,
      });
      if (res && res.RC === 200) setProductRawData(res.RD);
    } catch (error) {
      console.error("Error loading product data:", error);
    } finally {
      setTimeout(() => setIsloading(false), 600);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "down":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "primary";
    }
  };

  const SectionHeader = ({ title }) => (
    <h6 className="aws-section-header text-uppercase small fw-bold mb-3">
      {title}
    </h6>
  );

  const DataField = ({ label, value, onView }) => (
    <div className="aws-data-field mb-3">
      <label className="text-muted small d-block mb-1">{label}</label>
      <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border">
        <span className="fw-semibold text-dark text-truncate">
          {value || "---"}
        </span>
        {onView && (
          <Button
            variant="link"
            size="sm"
            className="p-0 ms-2 text-primary"
            onClick={onView}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="xl"
      centered
      className="aws-theme-modal"
    >
      <Otp_vetify
        show={isOTPopen}
        title="Xác nhận xóa sản phẩm khỏi hệ thống?"
        close={() => setisOTPopen(false)}
        product_id={product?.id}
      />
      <ProductSettingsModal
        show={modalState.productsetting}
        closeRefresh={() => closeModal("productsetting", true)}
        handleClose={() => closeModal("productsetting", false)}
        product={modalData.productsetting}
      />
      <Modal.Header closeButton className="bg-white border-bottom-0 pt-4 px-4">
        <div className="d-flex align-items-start gap-3">
          <div className="aws-icon-box bg-soft-primary p-3 rounded">
            <FontAwesomeIcon icon={faCube} className="text-primary fs-4" />
          </div>
          <div>
            <Modal.Title className="h5 fw-bold mb-1">
              Chi tiết tài sản kỹ thuật
            </Modal.Title>
            <div className="text-muted small">
              Resource ID:{" "}
              <code className="text-primary fw-bold">{product?.id}</code>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        {isloading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" />
            <span className="text-muted animate-pulse">
              Đang ánh xạ dữ liệu từ Blockchain...
            </span>
          </div>
        ) : (
          <Row className="g-4">
            {/* Cột trái: Hình ảnh & Trạng thái */}
            <Col lg={4}>
              <div className="aws-card-glass p-3 mb-4">
                <div className="aws-image-wrapper rounded mb-3">
                  <img
                    src={`${API_URL}main-card/${product?.main_cardimage}`}
                    alt={product?.name}
                    className="img-fluid rounded shadow-sm"
                  />
                </div>
                <div className="aws-status-panel p-3 bg-light rounded border">
                  <SectionHeader title="Trạng thái hệ thống" />
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Vận hành:</span>
                    <Badge bg={getStatusColor(product?.status)}>
                      {product?.status}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Gia Công:</span>
                    <Badge
                      bg={getStatusColor(product?.OEM ? "active" : "down")}
                    >
                      {product?.OEM ? "Cho phép" : "Không"}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small">On-chain:</span>
                    <Badge bg={getStatusColor(product?.chain_status)}>
                      {product?.chain_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>

            {/* Cột phải: Thông tin chi tiết */}
            <Col lg={8}>
              <div className="aws-content-section p-1">
                <div className="mb-4">
                  <h3 className="fw-bold text-dark mb-2">{product?.name}</h3>
                  <div className="display-6 fw-bold text-primary mb-3">
                    {product?.price?.toLocaleString()}₫
                  </div>
                </div>

                <Row>
                  <Col md={6}>
                    <SectionHeader title="Thông tin sở hữu" />
                    <DataField
                      label="Nhà máy / CTY sở hữu"
                      value={productRawData?.author?.factory_name}
                      onView={() =>
                        setDialogConfig({
                          show: true,
                          title: "Chi tiết chủ sở hữu",
                          data: productRawData?.author,
                        })
                      }
                    />
                    <DataField
                      label="Người phụ trách chuyên môn"
                      value={productRawData?.responsible_person?.name}
                      onView={() =>
                        setDialogConfig({
                          show: true,
                          title: "Hồ sơ người phụ trách",
                          data: productRawData?.responsible_person,
                        })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <SectionHeader title="Phân loại & Kho" />
                    <DataField
                      label="Danh mục kỹ thuật"
                      value={productRawData?.category_id?.cate_name}
                      onView={() =>
                        setDialogConfig({
                          show: true,
                          title: "Cấu trúc danh mục",
                          data: productRawData?.category_id,
                        })
                      }
                    />
                    <div className="aws-data-field">
                      <label className="text-muted small d-block mb-1">
                        Số lượng khả dụng
                      </label>
                      <div className="p-2 rounded border bg-soft-info fw-bold text-info">
                        {product?.stock_quantity} đơn vị
                      </div>
                    </div>
                  </Col>
                </Row>

                <hr className="my-4 opacity-10" />

                <SectionHeader title="Mô tả tài sản" />
                <div className="aws-description-box p-3 bg-light rounded border text-muted">
                  {product?.description || "Không có mô tả cho sản phẩm này."}
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light border-top-0 px-4 py-3 d-flex justify-content-between">
        <div className="small text-muted d-none d-sm-block">
          Last synced: {new Date().toLocaleString()}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-dark" size="sm" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button
            onClick={() => openModal("productsetting", product)}
            variant="outline-primary"
            size="sm"
          >
            <FontAwesomeIcon icon={faCog} className="me-2" />
            Cấu hình
          </Button>
          {product?.chain_status !== "down" && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setisOTPopen(true)}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
              Gỡ bỏ
            </Button>
          )}
          <Button variant="primary" size="sm" className="px-4">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Cập nhật
          </Button>
        </div>
      </Modal.Footer>

      <InfoDialog
        show={dialogConfig.show}
        title={dialogConfig.title}
        data={dialogConfig.data}
        onClose={() => setDialogConfig({ ...dialogConfig, show: false })}
      />
    </Modal>
  );
};
export default Product_detail;
