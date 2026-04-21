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
  InputGroup,
  ProgressBar,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-quill/dist/quill.snow.css";
import {
  faShieldAlt,
  faPlus,
  faEye,
  faSearch,
  faToggleOn,
  faTrashAlt,
  faFileContract,
  faSync,
  faFilePdf,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/ContractManagement.scss";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import ReactQuill from "react-quill";

const ContractManagement = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [isload, setisload] = useState(false);
  const [apiwaite, setapiwaite] = useState(false);
  const [textValid, setTextValid] = useState(false);
  const { User } = useContext(UserContext);
  const [policies, setPolicies] = useState([]);
  const [filePDF, setFilePDF] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [editorData, setEditorData] = useState({
    name: "",
    type: "MANUFACTURER",
    content: "",
    is_active: true,
  });

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "clean"],
    ],
  };

  const VARIABLE_SYSTEM = [
    {
      key: "{SENDER_COMPANY_NAME}",
      label: "Tên công ty bên gửi",
      desc: "Tên pháp lý của doanh nghiệp khởi tạo yêu cầu.",
    },
    {
      key: "{SENDER_CONTACT_NAME}",
      label: "Người đại diện bên gửi",
      desc: "Họ tên người liên hệ chính của bên gửi.",
    },
    {
      key: "{SENDER_CONTACT_EMAIL}",
      label: "Email bên gửi",
      desc: "Địa chỉ email dùng để đối soát giao dịch.",
    },
    {
      key: "{SENDER_CONTACT_PHONE}",
      label: "SĐT bên gửi",
      desc: "Số điện thoại liên lạc của doanh nghiệp gửi.",
    },
    {
      key: "{SENDER_TYPE}",
      label: "Vai trò bên gửi",
      desc: "Loại hình (Manufacturer, Distributor, v.v.)",
    },

    {
      key: "{RECEIVER_COMPANY_NAME}",
      label: "Tên công ty bên nhận",
      desc: "Tên pháp lý của đối tác nhận yêu cầu.",
    },
    {
      key: "{RECEIVER_CONTACT_EMAIL}",
      label: "Email bên nhận",
      desc: "Địa chỉ email của đối tác.",
    },
    {
      key: "{RECEIVER_TYPE}",
      label: "Vai trò bên nhận",
      desc: "Vai trò của đối tác trong chuỗi cung ứng.",
    },

    {
      key: "{COLLABORATION_TYPE}",
      label: "Loại hợp tác",
      desc: "Phương thức cộng tác đã chọn trên hệ thống.",
    },
    {
      key: "{PROPOSAL_MESSAGE}",
      label: "Lời nhắn đính kèm",
      desc: "Nội dung ghi chú riêng giữa hai bên.",
    },
    {
      key: "{NDA_HASH}",
      label: "Mã băm bảo mật (Hash)",
      desc: "Dấu vân tay số đảm bảo tính bất biến (Bắt buộc).",
    },

    {
      key: "{DATE_TO_SIGN}",
      label: "Ngày ký",
      desc: "Ngày thực hiện việc công bố và ký kết.",
    },
    {
      key: "{ACCEPTED_AT}",
      label: "Ngày chấp nhận",
      desc: "Thời điểm bên nhận phê duyệt yêu cầu.",
    },
    {
      key: "{BLOCKCHAIN_TX}",
      label: "Mã giao dịch (TxID)",
      desc: "ID giao dịch thực tế trên Blockchain.",
    },
  ];

  const handleCheckVariables = () => {
    const content = editorData.content;
    const missing = VARIABLE_SYSTEM.filter((v) => !content.includes(v.key));
    const found = VARIABLE_SYSTEM.filter((v) => content.includes(v.key));

    if (found.length === 0) {
      toast.error("Nội dung chưa chứa bất kỳ biến động nào!");
    } else if (missing.length > 0) {
      const criticalMissing = missing.filter(
        (v) => v.key === "{NDA_HASH}" || v.key === "{SENDER_COMPANY_NAME}",
      );
      if (criticalMissing.length > 0) {
        toast.error(
          `Thiếu biến quan trọng: ${criticalMissing.map((v) => v.label).join(", ")}`,
        );
      } else {
        toast.warning(
          `Tìm thấy ${found.length} biến. Còn thiếu: ${missing.length} biến khác.`,
        );
      }
    } else {
      setTextValid(true);
      toast.success("Tất cả biến động đã hợp lệ!");
    }
  };
  const handleExtractPdf = async (file) => {
    try {
      setIsScanning(true);
      setScanProgress(20);
      const formData = new FormData();
      formData.append("pdf_file", file);

      const progressInterval = setInterval(() => {
        setScanProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 300);

      const res = await api_request.extractPdftoText(User, formData);
      clearInterval(progressInterval);
      setScanProgress(100);

      if (res && res.RC === 200) {
        setEditorData((prev) => ({ ...prev, content: res.RD }));
        toast.success("Trích xuất dữ liệu thành công!");
        handleCheckVariables(res.RD);
      } else {
        toast.error(res?.RM || "Backend lỗi phân tích.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server!");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 600);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setFilePDF(file);
        handleExtractPdf(file);
      } else {
        toast.warning("Vui lòng chọn file PDF");
      }
    }
  };

  useEffect(() => {
    handlefetchContract();
  }, []);

  const handlefetchContract = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchContract(User);
      if (res && res.RC === 200) setPolicies(res.RD);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setisload(false), 600);
    }
  };

  const handleSubmit = async () => {
    if (!editorData.name || (!editorData.content && !filePDF))
      return toast.warning("Vui lòng điền đủ thông tin");
    try {
      if (!textValid) {
        return toast.warning("Vui lòng đáp ứng đủ điều kiện tạo hợp đồng!");
      }
      setapiwaite(true);
      const formData = new FormData();
      formData.append("template_name", editorData.name);
      formData.append("collaboration_type", editorData.type);
      formData.append("content_html", editorData.content);
      formData.append("is_active", editorData.is_active);
      if (filePDF) formData.append("pdf_file", filePDF);

      const res = await api_request.newContract(User, formData);
      if (res && res.RC === 200) {
        toast.success("Đã công bố mẫu!");
        setEditorData({
          name: "",
          type: "MANUFACTURER",
          content: "",
          is_active: true,
        });
        setFilePDF(null);
        handlefetchContract();
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setapiwaite(false);
    }
  };

  if (isload)
    return (
      <div className="aws-loader-container">
        <RocketLoad />
      </div>
    );

  return (
    <div className="aws-policy-wrapper p-2 p-md-4">
      <header className="aws-tech-header p-3 p-md-4 mb-3 rounded shadow-sm">
        <Row className="align-items-center g-3">
          <Col xs={12} md={7}>
            <div className="d-flex align-items-center">
              <div className="aws-icon-orb me-3 d-none d-sm-flex">
                <FontAwesomeIcon icon={faFileContract} />
              </div>
              <div>
                <h4 className="fw-bold mb-1 fs-5 fs-md-4">
                  Contract governance
                </h4>
                <p className="text-muted small mb-0 d-none d-sm-block">
                  Quản lý điều khoản cung ứng trên Blockchain.
                </p>
              </div>
            </div>
          </Col>
          <Col
            xs={12}
            md={5}
            className="text-md-end d-flex gap-2 justify-content-md-end"
          >
            <Badge bg="soft-success" className="p-2">
              Active: {policies.filter((p) => p.is_active).length}
            </Badge>
            <Badge bg="soft-warning" className="p-2">
              Drafts: {policies.filter((p) => !p.is_active).length}
            </Badge>
          </Col>
        </Row>
      </header>

      <Row className="g-4">
        <Col xs={12} lg={5} className="order-2 order-lg-1">
          <Card className="aws-card h-100">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <h6 className="mb-0 fw-bold">Hiện có ({policies.length})</h6>
                <InputGroup className="aws-search-group">
                  <InputGroup.Text className="bg-light border-0">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Tìm..."
                    className="bg-light border-0 small"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>
            </Card.Header>
           
            <div className="table-responsive">
              <Table className="aws-tech-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tên mẫu</th>
                    <th className="d-none d-sm-table-cell">Loại</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies
                    .filter((p) =>
                      p.template_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((item) => (
                      <tr key={item.id}>
                        <td className="fw-bold text-dark small">
                          {item.template_name}
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <Badge bg="light" className="text-primary border">
                            {item.collaboration_type.substring(0, 5)}..
                          </Badge>
                        </td>
                        <td>
                          <div
                            className={`aws-status-toggle ${item.is_active ? "active" : ""}`}
                          >
                            <FontAwesomeIcon icon={faToggleOn} size="lg" />
                          </div>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="link"
                            className="text-info p-1"
                            onClick={() => {
                              setSelectedPolicy(item);
                              setShowDetail(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>

        <Col xs={12} lg={7} className="order-1 order-lg-2">
          <Card className="aws-card shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h6 className="mb-0 fw-bold text-orange">
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo mẫu mới
              </h6>
            </Card.Header>
            <Card.Body>
              <Form className="d-grid gap-3">
                <Form.Group>
                  <Form.Label className="aws-tech-label">
                    Tên mẫu hợp đồng
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={editorData.name}
                    onChange={(e) =>
                      setEditorData({ ...editorData, name: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="aws-tech-label">
                    Loại đối tác
                  </Form.Label>
                  <Form.Select
                    value={editorData.type}
                    onChange={(e) =>
                      setEditorData({ ...editorData, type: e.target.value })
                    }
                  >
                    <option value="MANUFACTURER">Manufacturer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="TRANSPORTER">Transporter</option>
                    <option value="RETAILER">Retailer</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="aws-tech-label d-flex justify-content-between align-items-center">
                    <div>
                      Nội dung hợp đồng
                      <Badge
                        bg="soft-info"
                        className="ms-2 text-primary cursor-pointer"
                        onClick={() => setShowGuide(true)}
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" /> Xem
                        danh sách biến
                      </Badge>
                    </div>
                    <small className="text-muted d-none d-sm-inline">
                      Cần ít nhất 3 biến động
                    </small>
                  </Form.Label>

                  <ReactQuill
                    theme="snow"
                    value={editorData.content}
                    onChange={(content) =>
                      setEditorData({ ...editorData, content })
                    }
                    modules={modules}
                    className="aws-quill-responsive mb-2"
                  />

                  <div className="d-flex gap-2 mb-3 mt-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="fw-bold px-3"
                      onClick={handleCheckVariables}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />{" "}
                      KIỂM TRA BIẾN
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-muted text-decoration-none small"
                      onClick={() => setShowGuide(true)}
                    >
                      <FontAwesomeIcon icon={faShieldAlt} className="me-1" />{" "}
                      Hướng dẫn chi tiết
                    </Button>
                  </div>
                </Form.Group>

                <div className="aws-scan-notice p-2 rounded border-start border-3 border-warning bg-soft-warning mb-3">
                  <h6 className="x-small fw-bold mb-1 text-dark">
                    Quy định hợp đồng động:
                  </h6>
                  <ul className="mb-0 x-small text-muted ps-3">
                    <li>
                      Văn bản phải chứa các thẻ định dạng trong ngoặc nhọn `
                      {"{ }"}`.
                    </li>
                    <li>
                      Mã <span className="text-danger">{"{NDA_HASH}"}</span> bắt
                      buộc có để bảo chứng Blockchain.
                    </li>
                  </ul>
                </div>

                <div className="aws-upload-v2 p-3 border rounded bg-light">
                  {isScanning ? (
                    <div className="py-2">
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="fw-bold text-orange">
                          Đang quét...
                        </span>
                        <span>{scanProgress}%</span>
                      </div>
                      <ProgressBar
                        now={scanProgress}
                        variant="warning"
                        className="progress-xs"
                        animated
                      />
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faFilePdf}
                          className="text-danger me-2"
                          size="lg"
                        />
                        <div
                          className="text-truncate"
                          style={{ maxWidth: "120px" }}
                        >
                          <small className="d-block fw-bold">
                            {filePDF ? filePDF.name : "Đính kèm PDF"}
                          </small>
                        </div>
                      </div>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() =>
                          document.getElementById("pdf-input").click()
                        }
                      >
                        Tải lên
                      </Button>
                      <input
                        type="file"
                        id="pdf-input"
                        hidden
                        accept=".pdf"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>

                <Modal
                  show={showGuide}
                  onHide={() => setShowGuide(false)}
                  size="lg"
                  centered
                >
                  <Modal.Header closeButton className="border-0">
                    <Modal.Title className="h5 fw-bold text-primary">
                      <FontAwesomeIcon icon={faShieldAlt} className="me-2" /> Hệ
                      thống biến động (Blockchain Variables)
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="pt-0">
                    <p className="text-muted small mb-3">
                      Vui lòng sao chép chính xác các thẻ (Tag) dưới đây vào nội
                      dung hợp đồng. Hệ thống sẽ tự động thay thế bằng dữ liệu
                      thực tế khi thực hiện giao dịch.
                    </p>
                    <div
                      className="table-responsive"
                      style={{ maxHeight: "400px" }}
                    >
                      <Table hover className="aws-tech-table border mb-0">
                        <thead className="bg-light sticky-top">
                          <tr>
                            <th style={{ width: "30%" }}>Mã biến (Key)</th>
                            <th style={{ width: "25%" }}>Tên dữ liệu</th>
                            <th>Mô tả / Giải thích</th>
                          </tr>
                        </thead>
                        <tbody>
                          {VARIABLE_SYSTEM.map((v) => (
                            <tr key={v.key}>
                              <td>
                                <code
                                  className="text-danger fw-bold cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(v.key);
                                    toast.info(`Đã chép: ${v.key}`, {
                                      autoClose: 1000,
                                    });
                                  }}
                                >
                                  {v.key}
                                </code>
                              </td>
                              <td className="fw-bold text-dark small">
                                {v.label}
                              </td>
                              <td className="text-muted x-small">{v.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="bg-light border-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowGuide(false)}
                    >
                      Đóng
                    </Button>
                  </Modal.Footer>
                </Modal>

                <div className="aws-scan-notice p-2 rounded border-start border-3 border-warning bg-soft-warning">
                  <h6 className="x-small fw-bold mb-1 text-dark">Lưu ý:</h6>
                  <ul className="mb-0 x-small text-muted ps-3">
                    <li>Chỉ hỗ trợ file PDF gốc có lớp văn bản.</li>
                    <li>Kiểm tra lại nội dung sau khi quét.</li>
                  </ul>
                </div>

                <Button
                  variant="aws-orange"
                  className="w-100 py-2 fw-bold shadow-sm mt-2"
                  onClick={handleSubmit}
                  disabled={apiwaite || isScanning || !textValid}
                >
                  {apiwaite ? (
                    <>
                      <FontAwesomeIcon icon={faSync} spin className="me-2" />{" "}
                      Đang lưu...
                    </>
                  ) : (
                    "CÔNG BỐ MẪU"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showDetail}
        onHide={() => setShowDetail(false)}
        size="lg"
        centered
        className="aws-tech-modal"
        fullscreen="sm-down"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h6 fw-bold">Review Contract</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-2 p-md-4">
          <div className="preview-paper shadow-sm p-3 p-md-5 bg-white mx-auto">
            <h5 className="text-center fw-bold text-uppercase mb-4 fs-6 fs-md-5">
              {selectedPolicy?.template_name}
            </h5>
            <div
              className="contract-content small"
              dangerouslySetInnerHTML={{
                __html: selectedPolicy?.content_html || selectedPolicy?.content,
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button
            variant="link"
            className="text-dark"
            onClick={() => setShowDetail(false)}
          >
            Đóng
          </Button>
          <Button variant="aws-green" className="text-white">
            <FontAwesomeIcon icon={faFilePdf} className="me-2" /> Xuất nháp
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContractManagement;
