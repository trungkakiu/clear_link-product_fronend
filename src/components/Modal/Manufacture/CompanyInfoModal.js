import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Image,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faStore,
  faImage,
  faCheckCircle,
  faLink,
  faGlobe,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "../../../scss/volt/components/Manufacture/CompanyInfoModal.scss";
import api_request from "../../../apicontroller/api_request";
import { UserContext } from "../../../Context/UserContext";

const CompanyInfoModal = ({ show, close, closeRefresh, data }) => {
  const [formData, setFormData] = useState({
    slug: "",
    slogan: "",
    description: "",
    logo_url: "",
    banner_url: "",
    is_oem_ready: false,
    is_active_market: true,
    social_links: { website: "", linkedin: "", facebook: "" },
  });
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [files, setFiles] = useState({ logo: null, banner: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { User } = useContext(UserContext);

  useEffect(() => {
    if (data) {
      setFormData({
        slug: data.slug || "",
        slogan: data.slogan || "",
        description: data.description || "",
        logo_url: data.logo_url || "",
        banner_url: data.banner_url || "",
        is_oem_ready: data.is_oem_ready || false,
        is_active_market: data.is_active_market ?? true,
        social_links: data.social_links || {
          website: "",
          linkedin: "",
          facebook: "",
        },
      });
      setPreviews({ logo: data.logo_url, banner: data.banner_url });
    } else {
      resetForm();
    }
  }, [data, show]);

  const resetForm = () => {
    setFormData({
      slug: "",
      slogan: "",
      description: "",
      logo_url: "",
      banner_url: "",
      is_oem_ready: false,
      is_active_market: true,
      social_links: { website: "", linkedin: "", facebook: "" },
    });
    setPreviews({ logo: null, banner: null });
    setFiles({ logo: null, banner: null });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("social_")) {
      const key = name.split("_")[1];
      setFormData((prev) => ({
        ...prev,
        social_links: { ...prev.social_links, [key]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Kích thước ảnh tối đa là 2MB");
      }
      setFiles((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.slug) return toast.warning("Vui lòng nhập định danh Slug");
      setIsSubmitting(true);
      const dataToSend = new FormData();
      dataToSend.append("slug", formData.slug);
      dataToSend.append("slogan", formData.slogan);
      dataToSend.append("description", formData.description);
      dataToSend.append("is_oem_ready", formData.is_oem_ready);
      dataToSend.append("is_active_market", formData.is_active_market);
      dataToSend.append("social_links", JSON.stringify(formData.social_links));

      if (files.logo) dataToSend.append("logo", files.logo);
      if (files.banner) dataToSend.append("banner", files.banner);

      const res = await api_request.saveMarketInfo(User, dataToSend);

      if (res.RC === 200) {
        toast.success("Cập nhật hồ sơ Marketplace thành công!");
        closeRefresh();
      } else {
        toast.error(res.RM || "Lỗi khi lưu thông tin");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      as={Modal.Dialog}
      centered
      show={show}
      onHide={close}
      size="lg"
      className="aws-style-modal"
    >
      <Modal.Header className="border-bottom-0 pb-0">
        <Modal.Title className="h5 fw-bold">
          <FontAwesomeIcon icon={faStore} className="text-primary me-2" />
          Thiết lập hồ sơ Marketplace
        </Modal.Title>
        <Button variant="close" onClick={close} />
      </Modal.Header>

      <Modal.Body className="py-4">
        <Form>
          <Row>
            <Col md={7}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">
                  Đường dẫn (Slug) <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    market/
                  </InputGroup.Text>
                  <Form.Control
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="ten-cong-ty-slug"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">
                  Slogan thương hiệu
                </Form.Label>
                <Form.Control
                  size="sm"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleInputChange}
                  placeholder="Khát vọng vươn xa..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">
                  Mô tả doanh nghiệp
                </Form.Label>
                <Form.Control
                  as="textarea"
                  style={{
                    resize: "vertical",
                    minHeight: "200px",
                    lineHeight: "1.5",
                  }}
                  rows={6}
                  size="sm"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Giới thiệu năng lực sản xuất, lịch sử hình thành và các thành tựu nổi bật..."
                  className="aws-textarea"
                />
              </Form.Group>
            </Col>

            <Col md={5}>
              <div className="upload-section bg-light p-3 rounded border mb-3">
                <h6 className="x-small fw-bold text-uppercase text-muted mb-3">
                  <FontAwesomeIcon icon={faImage} className="me-2" /> Media
                  Assets
                </h6>

                {/* Logo Upload */}
                <div className="mb-3">
                  <Form.Label className="x-small fw-bold">
                    Logo Công ty (1:1)
                  </Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <div className="preview-box logo-preview border rounded overflow-hidden bg-white">
                      {previews.logo || formData.logo_url ? (
                        <Image
                          src={
                            previews.logo && previews.logo.startsWith("blob:")
                              ? previews.logo
                              : `${API_URL}Sector-logo/${formData.logo_url || previews.logo}`
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="no-image">No Logo</div>
                      )}
                    </div>
                    <label className="btn btn-outline-primary btn-sm mb-0 cursor-pointer">
                      <FontAwesomeIcon
                        icon={faCloudUploadAlt}
                        className="me-1"
                      />{" "}
                      Tải Logo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Form.Label className="x-small fw-bold">
                    Banner Profile (16:9)
                  </Form.Label>
                  <div className="preview-box banner-preview border rounded overflow-hidden bg-white mb-2">
                    {previews.banner || formData.banner_url ? (
                      <Image
                        src={
                          previews.banner && previews.banner.startsWith("blob:")
                            ? previews.banner
                            : `${API_URL}Sector-banner/${formData.banner_url || previews.banner}`
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="no-image">No Banner</div>
                    )}
                  </div>
                  <label className="btn btn-outline-primary btn-sm w-100 cursor-pointer">
                    <FontAwesomeIcon icon={faCloudUploadAlt} className="me-1" />{" "}
                    Thay đổi ảnh bìa
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "banner")}
                    />
                  </label>
                </div>
              </div>

              <div className="social-links">
                <h6 className="x-small fw-bold text-uppercase text-muted mb-2">
                  Kết nối
                </h6>
                {["website", "linkedin", "facebook"].map((platform) => (
                  <InputGroup size="sm" className="mb-2" key={platform}>
                    <InputGroup.Text className="bg-white">
                      <FontAwesomeIcon
                        icon={platform === "website" ? faGlobe : faLink}
                        className="text-muted"
                      />
                    </InputGroup.Text>
                    <Form.Control
                      name={`social_${platform}`}
                      value={formData.social_links[platform]}
                      onChange={handleInputChange}
                      placeholder={platform}
                    />
                  </InputGroup>
                ))}
              </div>
            </Col>
          </Row>

          <hr className="my-4" />

          <Row className="align-items-center">
            <Col sm={8}>
              <div className="d-flex gap-4">
                <Form.Check
                  type="switch"
                  label="Hiện trên Market"
                  name="is_active_market"
                  checked={formData.is_active_market}
                  onChange={handleInputChange}
                />
                <Form.Check
                  type="switch"
                  label="Nhận OEM/ODM"
                  name="is_oem_ready"
                  checked={formData.is_oem_ready}
                  onChange={handleInputChange}
                  className="text-primary fw-bold"
                />
              </div>
            </Col>
            <Col sm={4} className="text-end">
              <Button
                variant="link"
                size="sm"
                className="text-muted me-2"
                onClick={close}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Lưu hồ sơ"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyInfoModal;
