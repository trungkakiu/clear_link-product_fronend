import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Badge,
  Card,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTags,
  faFileUpload,
  faFilePdf,
  faFileWord,
  faFileImage,
  faFileAlt,
  faBoxes,
  faCubes,
  faInfoCircle,
  faDollarSign,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "../../../scss/volt/components/ProductSettingsModal.scss";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";

const ProductSettingsModal = ({ show, handleClose, product, closeRefresh }) => {
  const [formData, setFormData] = useState({
    OEM: false,
    status: "available",
    base_price: 0,
    items_per_box: 1,
    weight: 0,
  });

  const { User } = useContext(UserContext);
  const [instructionFile, setInstructionFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        OEM: product.OEM || false,
        status: product.status || "available",
        base_price: product.price || 0,
        items_per_box: product.items_per_box || 1,
        weight: product.weight || 0,
      });
      setInstructionFile(null);
    }
  }, [product, show]);

  const getFileIcon = (fileName) => {
    if (!fileName) return faFileAlt;
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return faFilePdf;
      case "doc":
      case "docx":
        return faFileWord;
      case "png":
      case "jpg":
      case "jpeg":
        return faFileImage;
      default:
        return faFileAlt;
    }
  };

  const getIconColor = (fileName) => {
    const extension = fileName?.split(".").pop().toLowerCase();
    if (extension === "pdf") return "#e74c3c";
    if (extension === "doc" || extension === "docx") return "#2b579a";
    if (["png", "jpg", "jpeg"].includes(extension)) return "#f39c12";
    return "#95a5a6";
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const finalData = new FormData();
      finalData.append("OEM", formData.OEM);
      finalData.append("status", formData.status);
      finalData.append("base_price", Number(formData.base_price));
      finalData.append("items_per_box", Number(formData.items_per_box));
      finalData.append("weight", Number(formData.weight));

      if (instructionFile) {
        finalData.append("OEM_file", instructionFile);
      }

      const res = await api_request.updateProductSettings(
        User,
        product.id,
        finalData,
      );

      if (res && res.RC === 200) {
        toast.success("Cấu hình sản phẩm thành công!");
        closeRefresh();
      } else {
        toast.error(res.RM || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      className="aws-modern-modal"
    >
      <Modal.Header closeButton className="border-0 px-4 pt-4">
        <Modal.Title className="d-flex align-items-center">
          <div className="icon-shape icon-shape-warning rounded me-3">
            <FontAwesomeIcon icon={faTags} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold text-dark">Cấu hình Vận hành & OEM</h5>
            <p className="small text-muted mb-0">
              Quản lý định mức Logistics và hồ sơ sản phẩm
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4">
        <Form>
          <Row className="g-4">
            {/* CỘT TRÁI: THÔNG SỐ VẬN HÀNH */}
            <Col lg={7}>
              <Card className="border-0 shadow-sm bg-white p-3 mb-3">
                <h6 className="fw-bold mb-3 text-primary d-flex align-items-center">
                  <FontAwesomeIcon icon={faCubes} className="me-2" /> Định mức
                  Logistics
                </h6>

                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">
                      Trọng lượng (Đơn vị)
                    </Form.Label>
                    <InputGroup className="aws-input-group">
                      <InputGroup.Text className="bg-light">
                        <FontAwesomeIcon
                          icon={faWeightHanging}
                          className="text-muted"
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                      />
                      <InputGroup.Text className="bg-white small">
                        {product?.weight_type === "kilogam" ? "kg" : "g"}
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">
                      Số lượng/Thùng (Box)
                    </Form.Label>
                    <InputGroup className="aws-input-group">
                      <InputGroup.Text className="bg-light">
                        <FontAwesomeIcon
                          icon={faBoxes}
                          className="text-aws-orange"
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={formData.items_per_box}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            items_per_box: e.target.value,
                          })
                        }
                        min="1"
                      />
                    </InputGroup>
                  </Col>

                  <Col md={12}>
                    <Form.Label className="small fw-bold text-muted">
                      Giá bán cơ bản
                    </Form.Label>
                    <InputGroup className="aws-input-group">
                      <InputGroup.Text className="bg-light text-success">
                        <FontAwesomeIcon icon={faDollarSign} />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        value={formData.base_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            base_price: e.target.value,
                          })
                        }
                      />
                      <InputGroup.Text className="bg-white">
                        VNĐ
                      </InputGroup.Text>
                    </InputGroup>
                    <Form.Text className="text-muted italic tiny">
                      * Dữ liệu dùng để tính toán giá trị lô hàng và tải trọng
                      xe.
                    </Form.Text>
                  </Col>
                </Row>
              </Card>

              <Card className="border-0 shadow-sm bg-white p-3">
                <h6 className="fw-bold mb-3 text-info d-flex align-items-center">
                  <FontAwesomeIcon icon={faFileUpload} className="me-2" /> Hồ sơ
                  tài liệu
                </h6>

                {(product?.OEMfile || instructionFile) && (
                  <div className="file-preview-box d-flex align-items-center p-2 mb-3 rounded border bg-light">
                    <FontAwesomeIcon
                      icon={getFileIcon(
                        instructionFile
                          ? instructionFile.name
                          : product.OEMfile,
                      )}
                      size="2x"
                      className="me-3"
                      style={{
                        color: getIconColor(
                          instructionFile
                            ? instructionFile.name
                            : product.OEMfile,
                        ),
                      }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="tiny text-muted">
                        {instructionFile ? "Tập tin mới:" : "Tập tin hiện tại:"}
                      </div>
                      <div className="text-truncate small fw-bold">
                        {instructionFile
                          ? instructionFile.name
                          : product.OEMfile}
                      </div>
                    </div>
                    {product?.OEMfile && !instructionFile && (
                      <Badge bg="info" className="ms-2">
                        Saved
                      </Badge>
                    )}
                  </div>
                )}

                <div className="aws-upload-wrapper">
                  <input
                    type="file"
                    id="oem-file-input"
                    hidden
                    onChange={(e) => setInstructionFile(e.target.files[0])}
                  />
                  <Button
                    as="label"
                    htmlFor="oem-file-input"
                    variant="outline-primary"
                    className="w-100 border-dashed py-2 small"
                  >
                    <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                    {instructionFile || product?.OEMfile
                      ? "Thay thế tài liệu khác"
                      : "Chọn tài liệu đính kèm"}
                  </Button>
                </div>
              </Card>
            </Col>

            {/* CỘT PHẢI: STATUS & OEM */}
            <Col lg={5}>
              <Card className="border-0 shadow-sm bg-light-orange p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold text-aws-orange mb-0">Chế độ OEM</h6>
                  <Form.Check
                    type="switch"
                    checked={formData.OEM}
                    onChange={(e) =>
                      setFormData({ ...formData, OEM: e.target.checked })
                    }
                  />
                </div>
                <p className="tiny text-muted mb-2">
                  Kích hoạt sản phẩm gia công ngoài.
                </p>
                {formData.OEM && (
                  <Badge bg="warning" className="text-dark">
                    Cần có hướng dẫn kỹ thuật
                  </Badge>
                )}
              </Card>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                  Trạng thái kinh doanh
                </Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="shadow-none border-2"
                >
                  <option value="available">Sẵn sàng (Available)</option>
                  <option value="out_of_stock">Hết hàng (Out of Stock)</option>
                  <option value="discontinued">Ngừng sản xuất</option>
                  <option value="custom_order">Theo đơn đặt hàng</option>
                </Form.Select>
              </Form.Group>

              <div className="alert alert-soft-info border-0 p-3 mb-0">
                <div className="d-flex">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="me-2 mt-1 text-info"
                  />
                  <div className="tiny text-dark">
                    <strong>Hệ thống:</strong> Định mức Box và Weight sẽ tự động
                    cập nhật vào các lô hàng (Batch) mới để tính toán chi phí
                    Logistics.
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 px-4 pb-4 pt-0">
        <Button
          variant="link"
          className="text-muted fw-bold me-auto"
          onClick={handleClose}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="aws-orange"
          className="btn-aws-primary px-4 shadow-none"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductSettingsModal;
