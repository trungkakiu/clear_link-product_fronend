import React, { useState } from "react";
import {
  Modal,
  Button,
  Table,
  Form,
  InputGroup,
  Badge,
  Image,
  Row,
  Col,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../scss/volt/components/BatchDetailModal.scss";
import {
  faBoxOpen,
  faSave,
  faSyncAlt,
  faHistory,
  faUserCheck,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

const DepartmentDetailModal = ({
  show,
  onHide,
  department,
  API_URL,
  onUpdateQuantity,
}) => {
  const [editingQuantities, setEditingQuantities] = useState({});

  const handleInputChange = (batchId, value) => {
    setEditingQuantities({
      ...editingQuantities,
      [batchId]: value,
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="aws-batch-modal"
    >
      <Modal.Header closeButton className="bg-aws-navy text-white">
        <Modal.Title className="h6 d-flex align-items-center">
          <FontAwesomeIcon icon={faBoxOpen} className="me-2 text-aws-orange" />
          Giám sát dây chuyền:{" "}
          <span className="ms-2 fw-bold text-white text-uppercase">
            {department?.partname}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light">
        {/* TOP BAR: THÔNG TIN TRƯỞNG CA */}
        <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center">
            <div
              className="avatar-placeholder me-3 bg-light rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <FontAwesomeIcon icon={faUserCheck} className="text-muted" />
            </div>
            <div>
              <small
                className="text-muted d-block text-uppercase fw-bold"
                style={{ fontSize: "10px" }}
              >
                Trưởng ca vận hành
              </small>
              <span className="fw-bold text-aws-navy">
                {department?.leader?.name || "N/A"}
              </span>
            </div>
          </div>
          <Badge bg="dark" className="p-2 aws-badge-count">
            HỆ THỐNG ĐANG QUẢN LÝ: {department?.batches?.length || 0} LÔ
          </Badge>
        </div>

        <div className="table-responsive">
          <Table hover className="mb-0 bg-white">
            <thead className="small text-uppercase bg-light border-bottom">
              <tr>
                <th className="ps-4 py-3">Sản phẩm / Định danh</th>
                <th>Thông tin QC & Phê duyệt</th> <th>Tiến độ</th>
                <th style={{ width: "180px" }}>Cập nhật thực tế</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {department?.batches?.map((batch) => (
                <tr key={batch.id} className="align-middle border-bottom">
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      <Image
                        src={
                          batch.product?.main_cardimage
                            ? `${API_URL}main-card/${batch.product.main_cardimage}`
                            : "https://via.placeholder.com/45"
                        }
                        rounded
                        className="me-3 border shadow-xs"
                        width={45}
                        height={45}
                        style={{ objectFit: "cover" }}
                      />
                      <div>
                        <div
                          className="text-aws-navy mb-0"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {batch.batch_name}
                        </div>
                        <code
                          className="text-aws-orange fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {batch.id}
                        </code>
                      </div>
                    </div>
                  </td>

                  <td>
                    {/* CHỈ HIỂN THỊ NẾU CÓ QC_MANAGER */}
                    {batch.QC_manager ? (
                      <div className="aws-manager-verified p-2 rounded">
                        <div className="d-flex align-items-center text-success mb-1">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="me-1"
                          />
                          <span className="fw-bold extra-small text-uppercase">
                            Đã phê duyệt (Lv4)
                          </span>
                        </div>
                        <div className="small fw-bold">
                          {batch.QC_manager.name}
                        </div>
                        <div className="extra-small text-muted">
                          {batch.QC_manager.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted italic small">
                        Đang chờ quản lý...
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="small mb-1 fw-bold">
                      {batch.progress_quantity}{" "}
                      <span className="text-muted fw-normal">
                        / {batch.quantity}
                      </span>
                    </div>
                    <div
                      className="progress rounded-pill"
                      style={{ height: "6px", width: "100px" }}
                    >
                      <div
                        className="progress-bar bg-aws-orange"
                        style={{
                          width: `${(batch.progress_quantity / batch.quantity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </td>

                  <td>
                    <InputGroup size="sm" className="aws-input-group-premium">
                      <Form.Control
                        type="number"
                        placeholder={batch.progress_quantity}
                        value={editingQuantities[batch.id] || ""}
                        onChange={(e) =>
                          handleInputChange(batch.id, e.target.value)
                        }
                      />
                      <InputGroup.Text className="bg-light small">
                        / {batch.quantity}
                      </InputGroup.Text>
                    </InputGroup>
                  </td>

                  <td className="text-end pe-4">
                    <Button
                      variant="none"
                      size="sm"
                      className="aws-btn-save-sm"
                      onClick={() =>
                        onUpdateQuantity(batch.id, editingQuantities[batch.id])
                      }
                      disabled={!editingQuantities[batch.id]}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-white border-top shadow-sm">
        <Button
          variant="link"
          className="text-muted small text-decoration-none"
          onClick={onHide}
        >
          Đóng giám sát
        </Button>
        <Button variant="none" className="aws-btn-outline-navy btn-sm">
          <FontAwesomeIcon icon={faHistory} className="me-2" /> Nhật ký vận hành
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DepartmentDetailModal;
