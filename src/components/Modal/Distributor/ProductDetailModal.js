import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Badge,
  Image,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faShoppingCart,
  faShieldAlt,
  faWeightHanging,
  faExpandAlt,
  faTimes,
  faHistory,
  faLayerGroup,
  faTruckMoving,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../../Context/UserContext";
import CreateOrderModal from "./CreateOrderModal";

import "../../../scss/volt/components/Distributor/ProductDetailModal.scss";

const ProductDetailModal = ({ show, onHide, product, API_URL }) => {
  const { User } = useContext(UserContext);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [zoomImage, setZoomImage] = useState(false);

  const mainImageRef = useRef(null);

  useEffect(() => {
    if (product?.main_cardimage) {
      setActiveImage(`${API_URL}main-card/${product.main_cardimage}`);
    }
  }, [product, API_URL]);

  if (!product) return null;

  // Hiệu ứng Parallax nhẹ cho ảnh chính khi hover
  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } =
      mainImageRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mainImageRef.current.style.transform = `scale(1.05) translate(${x * 10}px, ${y * 10}px)`;
  };

  const handleMouseLeave = () => {
    if (!mainImageRef.current) return;
    mainImageRef.current.style.transform = "scale(1) translate(0px, 0px)";
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="aws-product-wow-modal overflow-hidden"
      >
        <Modal.Body className="p-0">
          <Row className="g-0 h-100">
            {/* CỘT TRÁI: THE IMMERSIVE GALLERY (Nền tối để nổi ảnh) */}
            <Col
              lg={7}
              className="gallery-section position-relative bg-dark-aws p-5"
            >
              <button className="btn-close-custom" onClick={onHide}>
                <FontAwesomeIcon icon={faTimes} />
              </button>

              <div
                className="main-image-viewport mb-4 rounded-4 shadow-lg overflow-hidden border border-gray-700"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Image
                  ref={mainImageRef}
                  src={activeImage}
                  className="img-main-parallax"
                />
                <Badge
                  bg="soft-success"
                  className="chain-badge position-absolute top-3 start-3"
                >
                  On-chain
                </Badge>
                <div
                  className="zoom-trigger-btn"
                  onClick={() => setZoomImage(true)}
                >
                  <FontAwesomeIcon icon={faExpandAlt} /> Phóng to
                </div>
              </div>

              <div className="thumbnail-track d-flex gap-3 justify-content-center px-2">
                {/* Thumb cho ảnh chính */}
                <div
                  className={`thumb-aws ${activeImage.includes("main-card") ? "active" : ""}`}
                  onClick={() =>
                    setActiveImage(
                      `${API_URL}main-card/${product.main_cardimage}`,
                    )
                  }
                >
                  <Image
                    src={`${API_URL}main-card/${product.main_cardimage}`}
                  />
                </div>
                {/* Thumb cho sub-images */}
                {product.sub_images?.map((img) => (
                  <div
                    className={`thumb-aws ${activeImage.includes(img.image_name) ? "active" : ""}`}
                    key={img.id}
                    onClick={() =>
                      setActiveImage(`${API_URL}Sub-image/${img.image_name}`)
                    }
                  >
                    <Image src={`${API_URL}Sub-image/${img.image_name}`} />
                  </div>
                ))}
              </div>
            </Col>

            {/* CỘT PHẢI: THE INFORMATION DASHBOARD (Sạch sẽ, độ tương phản cao) */}
            <Col
              lg={5}
              className="info-section p-5 bg-white d-flex flex-column justify-content-between"
            >
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="sku-label font-monospace text-muted small">
                    AWS-SKU: {product.id}
                  </div>
                  <Badge bg="success" className="stock-badge py-1 px-3">
                    Available / 400 Stock
                  </Badge>
                </div>

                <h1 className="product-title-wow fw-900 text-aws-navy mb-2">
                  {product.name}
                </h1>

                <div className="price-dash mb-4 p-3 rounded-3 bg-light-aws shadow-inner">
                  <label className="d-block extra-small text-uppercase fw-bold text-muted mb-1">
                    Cung ứng / Đơn vị
                  </label>
                  <div className="d-flex align-items-baseline text-danger">
                    <span className="h1 mb-0 fw-900">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="ms-1 fw-bold fs-5">VND</span>
                  </div>
                </div>

                {/* INFO TIẾN TRÌNH (Tạo độ Wow & Tin tưởng) */}
                <div className="progress-timeline mb-4">
                  {[
                    { icon: faCube, text: "Product Created", active: true },
                    {
                      icon: faShieldAlt,
                      text: "Blockchain Hash",
                      active: true,
                    },
                    { icon: faStore, text: "QA & Available", active: true },
                    { icon: faTruckMoving, text: "Order Ready", active: false },
                  ].map((step, i) => (
                    <div
                      className={`step-item ${step.active ? "active" : ""}`}
                      key={i}
                    >
                      <div className="icon-wrap shadow-soft">
                        <FontAwesomeIcon icon={step.icon} />
                      </div>
                      <span className="label extra-small fw-bold">
                        {step.text}
                      </span>
                      {i < 3 && <div className="line" />}
                    </div>
                  ))}
                </div>

                {/* THÔNG SỐ GRID 2x2 (Gọn gàng) */}
                <div className="specs-wow mb-4">
                  <Row className="g-2">
                    {[
                      {
                        icon: faWeightHanging,
                        label: "Trọng lượng",
                        value: `${product.weight} ${product.weight_type}`,
                      },
                      {
                        icon: faLayerGroup,
                        label: "Đóng gói",
                        value: `${product.items_per_box} cái/thùng`,
                      },
                      {
                        icon: faStore,
                        label: "Nhà máy",
                        value: product.manufacturer_info?.company_name,
                      },
                      {
                        icon: faHistory,
                        label: "Cập nhật",
                        value: new Date(product.updatedAt).toLocaleDateString(),
                      },
                    ].map((spec, i) => (
                      <Col xs={6} key={i}>
                        <div className="spec-card-aws p-2 rounded-2 border h-100">
                          <FontAwesomeIcon
                            icon={spec.icon}
                            className="text-secondary opacity-75 me-2"
                            size="sm"
                          />
                          <small className="text-muted fw-bold extra-small text-uppercase">
                            {spec.label}
                          </small>
                          <strong
                            className="d-block text-dark small mt-1 text-truncate"
                            title={spec.value}
                          >
                            {spec.value}
                          </strong>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              {/* ACTIONS CHỐT DƠN (Siêu lớn, siêu đẹp) */}
              <div className="action-hub mt-auto pt-4 border-top">
                <Button
                  className="btn-aws-orange w-100 py-3 mb-3 fw-bold fs-5 shadow-lg d-flex align-items-center justify-content-center"
                  onClick={() => setShowOrderModal(true)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                  BẮT ĐẦU TẠO ĐƠN NGAY
                </Button>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    className="flex-grow-1 small py-2 fw-bold text-uppercase"
                  >
                    Tải hồ sơ Blockchain
                  </Button>
                  <Image
                    src={`${API_URL}Company-logo/${product.manufacturer_info?.logo}`}
                    className="manufacturer-logo border rounded"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* FULLSCREEN ZOOM MODAL */}
      <Modal
        show={zoomImage}
        onHide={() => setZoomImage(false)}
        fullscreen
        centered
        className="fullscreen-zoom-modal"
      >
        <button className="btn-close-zoom" onClick={() => setZoomImage(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <Modal.Body className="p-0 d-flex align-items-center justify-content-center bg-dark">
          <Image src={activeImage} className="img-fs-zoom" />
        </Modal.Body>
      </Modal>

      {/* CREATE ORDER MODAL */}
      <CreateOrderModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        product={product}
        User={User}
        onConfirm={() => setShowOrderModal(false)}
      />
    </>
  );
};

export default ProductDetailModal;
