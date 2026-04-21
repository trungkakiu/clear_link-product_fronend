import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  Badge,
  Image,
  InputGroup,
  Form,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBox,
  faWeightHanging,
  faDrawPolygon,
  faExpandArrowsAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import CreatePackagingModal from "../Modal/Manufacture/CreatePackagingModal";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/Manufacture/PackagingManager.scss";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";

const PackagingManager = () => {
  const [packagings, setPackagings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { User } = useContext(UserContext);

  const loadData = async () => {
    try {
      const res = await api_request.getBox(User);
      if (res && res.RC === 200) setPackagings(res.RD);
    } catch (error) {
      toast.error("Lỗi đồng bộ dữ liệu!");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="packaging-manager-container p-4">
      <div className="aws-console-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Packaging Inventory</h3>
          <p className="text-muted small">
            Quản lý và định nghĩa cấu trúc bao bì Blockchain
          </p>
        </div>
        <Button
          variant="aws"
          onClick={() => setShowModal(true)}
          className="btn-aws-primary"
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Create New Standard
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4}>
          <InputGroup className="input-group-merge shadow-sm">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control type="text" placeholder="Tìm kiếm mã bao bì..." />
          </InputGroup>
        </Col>
      </Row>

      <Row className="g-4">
        {packagings.length > 0 ? (
          packagings.map((pkg) => (
            <Col key={pkg.id} xs={12} sm={6} lg={4} xl={3}>
              <Card className="aws-packaging-card h-100 border-0 shadow-sm">
                <div className="card-image-wrapper">
                  <Badge
                    bg={pkg.status === "active" ? "success" : "danger"}
                    className="status-badge"
                  >
                    {pkg.status === "active" ? "Active" : "Disabled"}
                  </Badge>
                  <Image
                    src={
                      `${process.env.REACT_APP_API_IMAGE_URL}box-card/${pkg.image_printer}` ||
                      "/assets/img/no-image.png"
                    }
                    className="main-packaging-img"
                  />
                  <div className="image-overlay-info">
                    <span>{pkg.material}</span>
                  </div>
                </div>

                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="pack-code text-navy fw-bold mb-0">
                      {pkg.pack_code}
                    </h5>
                    <div className="volume-tag">{pkg.volume} m³</div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-item">
                      <FontAwesomeIcon
                        icon={faExpandArrowsAlt}
                        className="aws-orange"
                      />
                      <span>
                        {pkg.length}x{pkg.width}x{pkg.height} <small>cm</small>
                      </span>
                    </div>
                    <div className="spec-item">
                      <FontAwesomeIcon
                        icon={faWeightHanging}
                        className="aws-orange"
                      />
                      <span>
                        Max: {pkg.max_weight_capacity} <small>kg</small>
                      </span>
                    </div>
                  </div>

                  <hr className="my-2 opacity-10" />

                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="real-preview d-flex align-items-center">
                      <div className="mini-thumb me-2">
                        <Image
                          src={`${process.env.REACT_APP_API_IMAGE_URL}box-card/${pkg.decription_image}`}
                        />
                      </div>
                      <span className="text-muted tiny-text">Ảnh thực địa</span>
                    </div>
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="btn-view-detail"
                    >
                      Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center py-5">
            <div className="empty-state p-5 bg-white rounded shadow-sm">
              <FontAwesomeIcon
                icon={faBox}
                size="3x"
                className="text-gray-200 mb-3"
              />
              <p className="text-muted">Chưa có bao bì nào được định nghĩa.</p>
            </div>
          </Col>
        )}
      </Row>

      <CreatePackagingModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        closeReload={(res) => {
          if (res) {
            const actualBoxData = res;

            setPackagings((prev) => [actualBoxData, ...prev]);
          } else {
            loadData();
          }
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default PackagingManager;
