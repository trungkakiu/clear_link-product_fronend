import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Modal,
  Table,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-quill/dist/quill.snow.css";
import {
  faShieldAlt,
  faPlus,
  faEye,
  faCheckCircle,
  faFileSignature,
  faFilePdf,
  faCloudUploadAlt,
  faHistory,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/PolicyManagement.scss";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import ReactQuill from "react-quill";

const PolicyManagement = () => {
  const [isload, setisload] = useState(false);
  const [apiwaite, setapiwaite] = useState(false);
  const { User } = useContext(UserContext);
  const [policies, setPolicies] = useState([]);
  const [filePDF, setFilePDF] = useState(null);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [editorData, setEditorData] = useState({
    type: "warranty",
    content: "",
    is_active: true,
  });
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
  ];

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setisload(true);
      const res = await api_request.fecthPolicy(User);
      if (res && res.RC === 200) {
        setPolicies(res.RD);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setisload(false), 800);
    }
  };

  const handleOpenDetail = (policy) => {
    setSelectedPolicy(policy);
    setShowDetail(true);
  };

  const handleSubmit = async () => {
    if (!editorData.content)
      return toast.warning("Vui lòng nhập nội dung điều khoản");
    try {
      setapiwaite(true);
      const formData = new FormData();
      formData.append("type", editorData.type);
      formData.append("content", editorData.content);
      formData.append("is_active", editorData.is_active);
      if (filePDF) formData.append("pdf_file", filePDF);

      const res = await api_request.newPolicy(User, formData);
      if (res && res.RC === 200) {
        toast.success("Công bố điều khoản thành công");
        setEditorData({ type: "warranty", content: "", is_active: true });
        setFilePDF(null);
        fetchPolicy();
      } else {
        toast.error(res?.RM || "Lỗi khi tạo điều khoản");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống khi tạo điều khoản");
    } finally {
      setapiwaite(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return "";
    // Sử dụng DOMParser để bóc tách chữ từ HTML
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  if (isload)
    return (
      <div className="aws-loader-container">
        <RocketLoad />
      </div>
    );

  return (
    <div className="aws-policy-wrapper p-4">
      {/* HEADER SECTION */}
      <div className="aws-page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-primary" />
            Governance & Policies
          </h4>
          <p className="text-muted small mb-0">
            Thiết lập và quản lý các tiêu chuẩn vận hành On-chain của doanh
            nghiệp.
          </p>
        </div>
        <div className="header-stats d-flex gap-3">
          <div className="stat-item">
            <span className="label">Tổng số bản ghi:</span>
            <span className="value">{policies.length}</span>
          </div>
        </div>
      </div>

      <Card className="aws-main-card border-0 shadow-sm mb-5">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold text-dark">
            Danh sách điều khoản hiện hành
          </h6>
          <Badge
            bg="soft-success"
            className="text-success px-3 py-2 rounded-pill"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Verified
            Integrity
          </Badge>
        </Card.Header>
        <div className="table-responsive">
          <Table className="table-centered aws-table mb-0">
            <thead>
              <tr>
                <th style={{ width: "5%" }}>#</th>
                <th style={{ width: "15%" }}>Phân loại</th>
                <th style={{ width: "35%" }}>Nội dung tóm tắt</th>
                <th>Phiên bản</th>
                <th>Trạng thái</th>
                <th>Tài liệu</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {policies.length > 0 ? (
                policies
                  .sort((a, b) => b.is_active - a.is_active)
                  .map((item, index) => (
                    <tr
                      key={item.id}
                      className={item.is_active ? "active-row" : "archived-row"}
                    >
                      <td className="text-muted fw-bold">{index + 1}</td>
                      <td>
                        <Badge bg="outline-primary" className="aws-badge-type">
                          {item.policy_type === "warranty"
                            ? "Bảo hành"
                            : item.policy_type}
                        </Badge>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <div
                          className="policy-preview-wrapper"
                          style={{ maxWidth: "350px" }}
                        >
                          <div className="fw-bold text-dark text-truncate small">
                            {stripHtml(item.content).substring(0, 50)}
                          </div>

                          <div className="text-muted x-small text-truncate">
                            {stripHtml(item.content).substring(50, 150)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faHistory}
                            className="me-2 x-small text-muted"
                          />
                          <span className="fw-bold text-dark">
                            v{item.version}.0
                          </span>
                        </div>
                      </td>
                      <td>
                        {item.is_active ? (
                          <div className="aws-status-pill active">
                            <span className="dot"></span> Đang chạy
                          </div>
                        ) : (
                          <div className="aws-status-pill archived">
                            Đã lưu trữ
                          </div>
                        )}
                      </td>
                      <td>
                        {item.pdf_file_url ? (
                          <Button
                            variant="outline-danger"
                            className="btn-icon-sm"
                            title="Tải văn bản PDF"
                          >
                            <FontAwesomeIcon icon={faFilePdf} />
                          </Button>
                        ) : (
                          <span className="text-muted small">---</span>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant="aws-ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(item)}
                        >
                          <FontAwesomeIcon icon={faEye} className="me-1" /> Chi
                          tiết
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-5 text-muted italic"
                  >
                    Chưa có điều khoản nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* PHẦN 2: TRÌNH SOẠN THẢO */}
      <section className="aws-editor-section">
        <Card className="aws-main-card border-0 shadow-sm">
          <Card.Header className="bg-white py-3 border-bottom d-flex align-items-center">
            <div className="icon-box-sm bg-soft-success me-3">
              <FontAwesomeIcon icon={faPlus} className="text-success" />
            </div>
            <h6 className="mb-0 fw-bold">Cập nhật chính sách mới</h6>
          </Card.Header>
          <Card.Body className="p-4">
            <Form>
              <Row className="g-4">
                <Col lg={4}>
                  <div className="aws-form-panel p-3 rounded bg-light border">
                    <Form.Group className="mb-3">
                      <Form.Label className="aws-label">
                        Phân loại chính sách
                      </Form.Label>
                      <Form.Select
                        className="aws-input"
                        value={editorData.type}
                        onChange={(e) =>
                          setEditorData({ ...editorData, type: e.target.value })
                        }
                      >
                        <option value="warranty">Chính sách Bảo hành</option>
                        <option value="shipping">Chính sách Vận chuyển</option>
                        <option value="payment">Điều khoản Thanh toán</option>
                        <option value="return">Chính sách Đổi trả</option>
                        <option value="option">Chính sách tùy chọn</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="aws-label">
                        Văn bản PDF xác thực
                      </Form.Label>
                      <div className="aws-upload-zone">
                        <input
                          type="file"
                          id="pdfUpload"
                          hidden
                          accept="application/pdf"
                          onChange={(e) => setFilePDF(e.target.files[0])}
                        />
                        <label
                          htmlFor="pdfUpload"
                          className="m-0 cursor-pointer w-100"
                        >
                          <FontAwesomeIcon
                            icon={faCloudUploadAlt}
                            className="text-primary mb-2 d-block"
                            size="lg"
                          />
                          <div className="small fw-bold">
                            {filePDF ? filePDF.name : "Kéo thả hoặc Chọn file"}
                          </div>
                          <div className="x-small text-muted">
                            Max size: 5MB
                          </div>
                        </label>
                      </div>
                    </Form.Group>

                    <Form.Check
                      type="switch"
                      id="active-switch"
                      label="Thiết lập làm hiện hành"
                      checked={editorData.is_active}
                      className="aws-switch"
                      onChange={(e) =>
                        setEditorData({
                          ...editorData,
                          is_active: e.target.checked,
                        })
                      }
                    />
                  </div>
                </Col>

                <Col lg={8}>
                  <Form.Group className="h-100 d-flex flex-column">
                    <div className="aws-quill-editor">
                      <Form.Label className="aws-label d-flex justify-content-between">
                        Nội dung chi tiết
                        <span className="text-muted x-small">
                          Hỗ trợ in đậm, màu sắc và danh sách
                        </span>
                      </Form.Label>
                      <ReactQuill
                        theme="snow"
                        value={editorData.content}
                        onChange={(content) =>
                          setEditorData({ ...editorData, content })
                        }
                        modules={modules}
                        formats={formats}
                        placeholder="Nhập nội dung chính sách với định dạng chuyên nghiệp..."
                        style={{ height: "250px", marginBottom: "50px" }}
                      />
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                      <Button
                        variant="aws-primary"
                        onClick={handleSubmit}
                        disabled={apiwaite}
                        className="px-5 py-2 shadow-sm"
                      >
                        <FontAwesomeIcon
                          icon={faFileSignature}
                          className="me-2"
                        />
                        {apiwaite ? "Đang xử lý..." : "Công bố chính sách"}
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </section>

      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        size="lg"
        centered
        className="aws-modal"
      >
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title className="h6 fw-bold">
            <FontAwesomeIcon icon={faEye} className="me-2 text-primary" />
            Chi tiết điều khoản v{selectedPolicy?.version}.0
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedPolicy && (
            <div className="policy-detail-container">
              <div className="d-flex justify-content-between mb-4">
                <Badge
                  bg="soft-primary"
                  className="text-primary text-uppercase px-3 py-2"
                >
                  {selectedPolicy.policy_type}
                </Badge>
                <div className="text-muted small">
                  Cập nhật lúc:{" "}
                  {new Date(selectedPolicy.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className="policy-full-content policy-content-text">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                />
              </div>
              {selectedPolicy.pdf_file_url && (
                <div className="mt-4 p-3 border rounded bg-light d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="text-danger me-2"
                      size="lg"
                    />
                    <span className="small fw-bold">
                      Văn bản đính kèm chính thức
                    </span>
                  </div>
                  <Button variant="outline-primary" size="sm">
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="me-2"
                    />
                    Xem tài liệu
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="aws-ghost" onClick={() => setShowDetail(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PolicyManagement;
