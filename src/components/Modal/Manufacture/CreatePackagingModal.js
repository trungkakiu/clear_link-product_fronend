import React, { useContext, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faCube,
  faImage,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import "../../../scss/volt/components/Manufacture/CreatePackagingModal.scss";
import { toast } from "react-toastify";

const CreatePackagingModal = ({ show, handleClose, closeReload }) => {
  const { User } = useContext(UserContext);
  const [formData, setFormData] = useState({
    pack_code: "",
    material: "Carton",
    length: 0,
    width: 0,
    height: 0,
    max_weight: 0,
    image_printer: null,
    decription_image: null,
  });

  const [temp, settemp] = useState();
  const [previews, setPreviews] = useState({ printer: null, desc: null });
  const [modalState, setmodalstate] = useState(false);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [type === "image_printer" ? "printer" : "desc"]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateVolume = () => {
    const { length, width, height } = formData;

    if (!length || !width || !height) return "0.0000";

    const vol =
      (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 1000000;

    return vol.toFixed(4);
  };

  const handleSubmit = () => setmodalstate(true);

  const newBox = async (challenge_code) => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("challenge_code", challenge_code);

      const res = await api_request.createBox(User, challenge_code, data);
      if (res) {
        if (res.RC === 200) {
          settemp(res.RD);
        }
        return { RM: res?.RM, RC: res?.RC };
      }
    } catch (error) {
      return { RM: "Lỗi kết nối Server!", RC: 500 };
    }
  };

  return (
    <>
      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => {
          closeReload(temp);
          setmodalstate(false);
        }}
        message={"Xác nhận mã PIN để tạo cấu trúc bao bì"}
        onSuccess={newBox}
        show={modalState}
        title={"BLOCKCHAIN SECURITY VERIFY"}
      />

      <Modal
        as={Modal.Dialog}
        centered
        show={show}
        onHide={handleClose}
        size="xl"
      >
        {" "}
        {/* Tăng size lên XL */}
        <Modal.Header className="border-bottom px-4">
          <Modal.Title className="text-navy fw-bolder">
            <FontAwesomeIcon icon={faCube} className="me-2 text-primary" />
            THIẾT LẬP CẤU TRÚC BAO BÌ QUY MÔ LỚN
          </Modal.Title>
          <Button variant="close" onClick={handleClose} />
        </Modal.Header>
        <Modal.Body className="p-4 bg-light-soft">
          <Row>
            {/* CỘT TRÁI: THÔNG SỐ VẬT LÝ */}
            <Col lg={7}>
              <Card border="light" className="shadow-sm p-4 mb-4 border-0">
                <h6 className="mb-4 text-primary text-uppercase fw-bold small">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Cấu hình kỹ thuật
                </h6>

                <Row>
                  <Col md={7} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">
                      Mã loại bao bì
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: CARTON-A1"
                      className="form-control-compact fw-bold"
                      onChange={(e) =>
                        setFormData({ ...formData, pack_code: e.target.value })
                      }
                    />
                  </Col>
                  <Col md={5} className="mb-3">
                    <Form.Label className="small fw-bold text-muted">
                      Chất liệu
                    </Form.Label>
                    <Form.Select
                      className="form-select-compact"
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                    >
                      <option value="Carton">Giấy Carton</option>
                      <option value="Nhựa">Nhựa HDPE</option>
                      <option value="Gỗ">Gỗ (Pallet)</option>
                      <option value="Kim loại">Hợp kim Thép</option>
                    </Form.Select>
                  </Col>
                </Row>

                <div className="dimension-grid mt-3 p-3 bg-light rounded-3">
                  <Row>
                    <Col md={4}>
                      <Form.Label className="tiny-label">Dài (L)</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          className="text-end fw-bold"
                          onChange={(e) =>
                            setFormData({ ...formData, length: e.target.value })
                          }
                        />
                        <InputGroup.Text className="bg-white small">
                          cm
                        </InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="tiny-label">Rộng (W)</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          className="text-end fw-bold"
                          onChange={(e) =>
                            setFormData({ ...formData, width: e.target.value })
                          }
                        />
                        <InputGroup.Text className="bg-white small">
                          cm
                        </InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="tiny-label">Cao (H)</Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="number"
                          className="text-end fw-bold border-primary"
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                        />
                        <InputGroup.Text className="bg-primary text-white small">
                          cm
                        </InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                </div>

                <Row className="mt-4 align-items-center">
                  <Col md={5}>
                    <Form.Label className="small fw-bold text-muted">
                      Tải trọng tối đa
                    </Form.Label>
                    <InputGroup size="sm">
                      <Form.Control
                        type="number"
                        placeholder="0.00"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_weight: e.target.value,
                          })
                        }
                      />
                      <InputGroup.Text>kg</InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col md={7}>
                    <div className="volume-display-hero-compact mt-2">
                      <div className="d-flex justify-content-between align-items-center px-3">
                        <span className="small fw-bold opacity-70">
                          TỔNG THỂ TÍCH:
                        </span>
                        <span className="h4 fw-black mb-0">
                          {calculateVolume()} m³
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col lg={5}>
              <Card border="light" className="shadow-sm p-4 h-100 border-0">
                <h6 className="mb-4 text-muted text-uppercase fw-bold small">
                  Hình ảnh đính kèm
                </h6>
                {/* Giữ nguyên logic upload ảnh nhưng bóp nhỏ khung preview */}
                <Row>
                  <Col xs={12} className="mb-3">
                    <span className="tiny-label mb-2 d-block">
                      Mẫu in nhãn dán
                    </span>
                    <div className="preview-container-sm border-dashed">
                      {previews.printer ? (
                        <img src={previews.printer} />
                      ) : (
                        <div className="text-center small">
                          <FontAwesomeIcon icon={faCloudUploadAlt} />
                          <br />
                          In ấn
                        </div>
                      )}
                      <input
                        type="file"
                        className="file-input-overlay"
                        onChange={(e) => handleImageChange(e, "image_printer")}
                      />
                    </div>
                  </Col>
                  <Col xs={12}>
                    <span className="tiny-label mb-2 d-block">
                      Ảnh thực tế bao bì
                    </span>
                    <div className="preview-container-sm border-dashed">
                      {previews.desc ? (
                        <img src={previews.desc} />
                      ) : (
                        <div className="text-center small">
                          <FontAwesomeIcon icon={faImage} />
                          <br />
                          Thực tế
                        </div>
                      )}
                      <input
                        type="file"
                        className="file-input-overlay"
                        onChange={(e) =>
                          handleImageChange(e, "decription_image")
                        }
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-top px-4 py-3">
          <Button
            variant="link"
            className="text-danger fw-bold"
            onClick={handleClose}
          >
            Huỷ thao tác
          </Button>
          <Button
            variant="primary"
            className="px-5 py-2 shadow fw-bold"
            onClick={() => {
              const requiredFields = {
                pack_code: "pack_code",
                material: "Carton",
                length: "length",
                width: "width",
                height: "height",
                max_weight: "max_weight",
                image_printer: "image_printer",
                decription_image: "decription_image",
              };
              for (const [key, label] of Object.entries(requiredFields)) {
                if (!formData[key] || formData[key].toString().trim() === "") {
                  return toast.error(`Trường [${label}] không được để trống!`);
                }
              }

              handleSubmit();
            }}
          >
            XÁC NHẬN TẠO
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreatePackagingModal;
