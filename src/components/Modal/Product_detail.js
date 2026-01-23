import React, { use, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Container,
} from "@themesberg/react-bootstrap";
import "../scss/volt/components/Product_detail.scss";
import api_request from "../../apicontroller/api_request";
import Otp_vetify from "./Otp_vetify";

const Product_detail = ({ show, product, onClose }) => {
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [productRawData, setProductRawData] = React.useState(null);
  const [productData, setProductData] = React.useState(product);
  const [authorOpen, setAuthorOpen] = useState(false);
  const [responsibleOpen, setResponsibleOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [OTPstate, setOTPstate] = useState();
  const [isOTPopen, setisOTPopen] = useState(false);
  useEffect(() => {
    if (product) {
      setProductData(product);
      loadRawData();
    } else {
      onClose();
    }
  }, [product]);

  const loadRawData = async () => {
    try {
      setIsloading(true);
      const res = await api_request.getRawProductData({
        id: product.id,
        author: product.author,
        responsible_person: product.responsible_person,
        category_id: product.category_id,
      });
      if (res && res.RC == 200) {
        setProductRawData(res.RD);
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      return;
    } finally {
      setTimeout(() => {
        setIsloading(false);
      }, 1000);
    }
  };
  const onSave = () => {
    // Implement save functionality here
  };

  const onOpenSetting = () => {
    // Implement open settings functionality here
  };

  const onDelete = (id) => {
    setOTPstate(id);
    setisOTPopen(true);
  };

  const DetailRow = ({ label, value, onView }) => (
    <div className="aws-detail-row">
      <span className="label">{label}</span>

      <div className="value-with-action">
        <span className="value">{value}</span>

        {onView && (
          <button className="view-btn" onClick={onView}>
            {`>=`}
          </button>
        )}
      </div>
    </div>
  );

  const InfoDialog = ({ show, title, data, onClose }) => {
    if (!data) return null;

    return (
      <Modal show={show} onHide={onClose} size="lg" centered>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="info-dialog info-grid">
            {Object.entries(data).map(([key, value]) => (
              <div className="info-row" key={key}>
                <span className="label">{key}</span>
                <span className="value">{String(value)}</span>
              </div>
            ))}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      {/* HEADER */}
      <Otp_vetify
        show={isOTPopen}
        title={"Bạn chắn chắn muốn xóa sản phẩm này?"}
        close={() => setisOTPopen(false)}
        product_id={OTPstate}
      />
      <InfoDialog
        show={authorOpen}
        title="Công ty sở hữu"
        data={productRawData?.author}
        onClose={() => setAuthorOpen(false)}
      />

      <InfoDialog
        show={responsibleOpen}
        title="Người phụ trách"
        data={productRawData?.responsible_person}
        onClose={() => setResponsibleOpen(false)}
      />

      <InfoDialog
        show={categoryOpen}
        title="Danh mục"
        data={productRawData?.category_id}
        onClose={() => setCategoryOpen(false)}
      />

      <Modal.Header className="aws-detail-header">
        <Container fluid>
          <Row className="align-items-center g-3">
            {/* LEFT: Title */}
            <Col xs={12} md>
              <Modal.Title className="aws-detail-title">
                Chi tiết sản phẩm
              </Modal.Title>
              <div className="aws-detail-subtitle">
                Mã sản phẩm: <strong>{product.id}</strong>
              </div>
            </Col>

            {/* RIGHT: Actions */}
            <Col xs={12} md="auto">
              <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                <Button size="sm" variant="secondary" onClick={onOpenSetting}>
                  Cài đặt
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(product.id)}
                >
                  Xóa
                </Button>

                <Button size="sm" variant="primary" onClick={onSave}>
                  Lưu
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Header>

      {/* BODY */}
      {isloading ? (
        <>
          <Modal.Body
            style={{
              height: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="aws-detail-body loading-center"
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Modal.Body>
        </>
      ) : (
        <Modal.Body className="aws-detail-body">
          <div className="row g-4">
            {/* IMAGE */}
            <div className="col-md-5">
              <div className="aws-detail-image">
                <img
                  src={`${API_URL}main-card/${product.main_cardimage}`}
                  alt={product.name}
                />
              </div>
            </div>

            {/* INFO */}
            <div className="col-md-7">
              {/* MAIN INFO */}
              <div className="aws-detail-main">
                <div className="aws-detail-name">{product.name}</div>

                <div className="aws-detail-price">
                  {product.price.toLocaleString()}₫
                </div>
              </div>

              {/* GRID INFO */}
              <div className="aws-detail-grid">
                <DetailRow
                  label="CTY sở hữu"
                  value={productRawData?.author?.factory_name}
                  onView={() => setAuthorOpen(true)}
                />

                <DetailRow
                  label="Người phụ trách"
                  value={productRawData?.responsible_person?.name}
                  onView={() => setResponsibleOpen(true)}
                />

                <DetailRow
                  label="Danh mục"
                  value={productRawData?.category_id?.cate_name}
                  onView={() => setCategoryOpen(true)}
                />

                <DetailRow
                  label="Số lượng tồn"
                  value={product.stock_quantity}
                />
                <DetailRow label="Trạng thái" value={product.status} />
                <DetailRow
                  label="Trạng thái chuỗi"
                  value={product.chain_status}
                />
              </div>

              {/* DESCRIPTION */}
              <div className="aws-detail-desc">
                <div className="label">Mô tả sản phẩm</div>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </Modal.Body>
      )}

      {/* FOOTER */}
      <Modal.Footer className="aws-detail-footer">
        <span>© 2025 Công Ty A</span>
        <span>www.example.com</span>
      </Modal.Footer>
    </Modal>
  );
};

export default Product_detail;
