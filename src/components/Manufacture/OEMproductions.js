import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import Select, { components } from "react-select";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Image,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faIndustry,
  faMicrochip,
  faFileContract,
  faExternalLinkAlt,
  faTools,
  faFilePdf,
  faFileWord,
  faFileImage,
  faFileAlt,
  faFileUpload,
  faSpinner,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "../../scss/volt/components/Manufacture/OEMproductions.scss";
import OEMacceptRequestModal from "../Modal/Manufacture/OEMacceptRequestModal";
import OrderDetailModal from "../Modal/Manufacture/OrderDetailModal";
import { useLocation } from "react-router-dom";

const OEMproductions = () => {
  const [OEMs, setOEMs] = useState([]);
  const { User } = useContext(UserContext);

  const [isload, setisload] = useState(false);
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const highlineId = query.get("highline");
  const isModalNeeded = query.get("openModal") === "true";
  const [newOEM, setNewOEM] = useState({
    product_id: "",
    partner_id: "",
    notes: "",
    Quantity: 1,
    Start_date: moment().format("YYYY-MM-DD"),
    End_date: moment().add(7, "days").format("YYYY-MM-DD"),
  });
  const [rawPartner, setrawPartner] = useState([]);
  const [Productions, setProductions] = useState([]);
  const fetchOEMs = async () => {
    try {
      setisload(true);
      const res = await api_request.fecthORMs(User);
      if (res && res.RC === 200) {
        setOEMs(res.RD.OEMs);
        setProductions(res.RD.productions);
        setrawPartner(res.RD.rawPartners);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setisload(false);
    }
  };
  const [modalstate, setmodalstate] = useState({
    OEMacp: false,
    detail: false,
  });
  const [modaldata, setmodaldata] = useState({
    OEMacp: null,
    detail: null,
  });
  const [apiwait, setapiwait] = useState(false);
  useEffect(() => {
    fetchOEMs();
  }, []);

  const openModal = (key, data) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: true,
    }));
    setmodaldata((prev) => ({
      ...prev,
      [key]: data,
    }));
  };
  useEffect(() => {
    console.log("data: ", modaldata.OEMacp);
  }, [modaldata.OEMacp]);

  const closeModal = (key, isrefresh) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: false,
    }));
    setmodaldata((prev) => ({
      ...prev,
      [key]: null,
    }));
    if (isrefresh) {
      fetchOEMs();
    }
  };

  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="d-flex align-items-center p-2 border-bottom"
        style={{
          cursor: "pointer",
          backgroundColor: props.isFocused ? "#f1faff" : "white",
        }}
      >
        <img
          src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${data.main_cardimage}`}
          alt={data.label}
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "6px",
          }}
          className="me-3 shadow-sm"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/40";
          }}
        />
        <div>
          <div className="fw-bold small text-main">{data.label}</div>
          <div className="text-aws-orange x-small font-weight-bold">
            {data.price?.toLocaleString()} VNĐ
          </div>
        </div>
      </div>
    );
  };

  const CustomSingleValue = (props) => {
    const { data } = props;
    return (
      <div className="d-flex align-items-center">
        <img
          src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${data.main_cardimage}`}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "4px",
            border: "1px solid black",
          }}
          className="me-2"
        />
        <span className="small">{data.label}</span>
      </div>
    );
  };

  const productOptions = Productions.map((prd) => ({
    value: prd.id,
    label: prd.name,
    main_cardimage: prd.main_cardimage,
    price: prd.price,
  }));
  const partnerOptions = rawPartner.map((item) => ({
    value: item.partner_info?.id,
    label: item.partner_info?.company_name,
    logo: item.partner_info?.logo,
    collaboration_id: item.collaboration_id,
  }));

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "10px",
      border: "1px solid transparent",
      backgroundColor: "#f8f9fa",
      padding: "4px",
      boxShadow: "none",
      "&:hover": { borderColor: "#ff9900" },
    }),
    option: (base) => ({ ...base, padding: 0 }),
  };

  const CustomOptionPartner = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="d-flex align-items-center p-2 border-bottom"
        style={{
          cursor: "pointer",
          backgroundColor: props.isFocused ? "#fff7e6" : "white",
        }}
      >
        <div
          className="me-3 d-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
            backgroundColor: "#f8f9fa",
            border: "1px solid #eee",
            overflow: "hidden",
          }}
        >
          {data.logo ? (
            <img
              src={`${process.env.REACT_APP_API_IMAGE_URL}Company-logo/${data.logo}`}
              alt="logo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <FontAwesomeIcon icon={faIndustry} className="text-muted" />
          )}
        </div>
        <div>
          <div className="fw-bold small text-main">{data.label}</div>
          <Badge bg="transparent" className="p-0 text-muted x-small fw-normal">
            ID: {data.value}
          </Badge>
        </div>
      </div>
    );
  };

  const CustomSingleValuePartner = (props) => {
    const { data } = props;
    return (
      <div className="d-flex align-items-center">
        <FontAwesomeIcon
          icon={faIndustry}
          className="text-aws-orange me-2"
          size="sm"
        />
        <span className="small fw-bold">{data.label}</span>
      </div>
    );
  };

  const OEM_order = async () => {
    try {
      setapiwait(true);
      if (!newOEM.partner_id || !newOEM.product_id || !newOEM.Quantity) {
        toast.warning("Vui lòng điền đầy đủ thông tin số lượng và đối tác!");
        return;
      }

      const res = await api_request.OEM_order(User, newOEM);
      if (res && res.RC === 200) {
        toast.success(res.RM);
        setNewOEM({
          product_id: "",
          partner_id: "",
          notes: "",
          Quantity: 1,
          Start_date: moment().format("YYYY-MM-DD"),
          End_date: moment().add(7, "days").format("YYYY-MM-DD"),
        });
        fetchOEMs();
      } else {
        toast.error(res?.RM || "Lỗi khi gửi yêu cầu");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setapiwait(false);
    }
  };

  const getFileIconConfig = (fileName) => {
    if (!fileName) return { icon: faFileAlt, color: "#6c757d" };
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return { icon: faFilePdf, color: "#e74c3c" };
      case "doc":
      case "docx":
        return { icon: faFileWord, color: "#2b579a" };
      case "png":
      case "jpg":
      case "jpeg":
        return { icon: faFileImage, color: "#f39c12" };
      default:
        return { icon: faFileAlt, color: "#6c757d" };
    }
  };

  const getStatusConfig = (status, isReceiver) => {
    switch (status) {
      case "pending":
        return {
          text: isReceiver ? "Cần xác nhận" : "Đang chờ phản hồi",
          variant: "warning",
          icon: faTools,
          bg: "#fff7e6",
          color: "#ffa000",
        };
      case "active":
        return {
          text: "Đang hoạt động",
          variant: "success",
          icon: faMicrochip,
          bg: "#e6fffa",
          color: "#00a854",
        };
      case "rejected":
        return {
          text: "Bị từ chối",
          variant: "danger",
          icon: faFileContract,
          bg: "#fff1f0",
          color: "#f5222d",
        };
      default:
        return {
          text: status,
          variant: "secondary",
          icon: faSearch,
          bg: "#f5f5f5",
          color: "#8c8c8c",
        };
    }
  };

  useEffect(() => {
    if (OEMs.length > 0 && highlineId) {
      const targetId = String(highlineId);

      const targetOrder = OEMs.find((item) => String(item.id) === targetId);

      if (targetOrder) {
        setTimeout(() => {
          const element = document.getElementById(`order-card-${targetId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            element.classList.add("aws-highline-active");
            setTimeout(
              () => element.classList.remove("aws-highline-active"),
              4000,
            );
          }
          if (isModalNeeded) {
            if (targetOrder.status === "pending" && targetOrder.is_my_order) {
              openModal("OEMacp", targetOrder);
            } else {
              openModal("detail", targetOrder);
            }
          }
        }, 500);
      }
    }
  }, [highlineId, isModalNeeded, OEMs]);

  if (isload) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          minHeight: "75vh",
        }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <div className="aws-oem-wrapper">
      {/* Modals điều hướng */}
      <OEMacceptRequestModal
        show={modalstate.OEMacp}
        close={() => closeModal("OEMacp", false)}
        closeRefresh={() => closeModal("OEMacp", true)}
        data={modaldata.OEMacp}
      />
      <OrderDetailModal
        show={modalstate.detail}
        onHide={() => closeModal("detail", false)}
        data={modaldata.detail}
        onAccept={() => {
          closeModal("detail", false);
          openModal("OEMacp", modaldata.detail);
        }}
      />

      <Container fluid className="px-4 pb-5">
        {/* Header Page */}
        <Row className="py-4">
          <Col xs={12}>
            <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm">
              <div className="icon-badge-aws me-3 shadow-soft">
                <FontAwesomeIcon icon={faIndustry} />
              </div>
              <div>
                <h3 className=" text-aws-navy m-0">Production Hub</h3>
                <p className="text-muted mb-0 small text-uppercase fw-bold tracking-wider">
                  <FontAwesomeIcon
                    icon={faMicrochip}
                    className="me-2 text-aws-orange"
                  />
                  Manufacturing & Subcontracting Control Center
                </p>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {/* CỘT TRÁI: ASSIGNMENTS LIST (Scrollable) */}
          <Col xl={8} lg={7}>
            <Card className="aws-main-card border-0 shadow-sm">
              <Card.Header className="bg-white border-0 p-4 pb-2">
                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <h5 className=" m-0 text-aws-navy">Assignments List</h5>
                    <div className="aws-divider-sm my-2"></div>
                    <small className="text-muted d-block mt-1">
                      Quản lý tiến độ gia công và tệp kỹ thuật đồng bộ trên hệ
                      thống
                    </small>
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    className="rounded-pill px-3 fw-bold text-muted border"
                  >
                    <FontAwesomeIcon icon={faFileContract} className="me-2" />{" "}
                    View Logs
                  </Button>
                </div>
              </Card.Header>

              <Card.Body className="p-4 pt-0">
                <Row className="g-3">
                  {OEMs && OEMs.length > 0 ? (
                    OEMs.map((item) => {
                      const isReceiver = item.is_my_order;
                      const statusStyle = getStatusConfig(
                        item.status,
                        isReceiver,
                      );
                      const fileInfo = getFileIconConfig(
                        item.product_pinner?.OEMfile,
                      );

                      return (
                        <Col md={12} xl={6} className="mb-2" key={item.id}>
                          <Card
                            id={`order-card-${item.id}`}
                            className={`aws-item-card h-100 border-light shadow-xs ${String(highlineId) === String(item.id) ? "aws-highline-init" : ""}`}
                          >
                            <Card.Body className="p-3">
                              {/* Card Header: Trạng thái & Vai trò */}
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <Badge
                                  className="aws-badge-status border-0"
                                  style={{
                                    backgroundColor: statusStyle.bg,
                                    color: statusStyle.color,
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={statusStyle.icon}
                                    className="me-2 x-small"
                                  />
                                  {statusStyle.text}
                                </Badge>
                                <div className="d-flex gap-1">
                                  <Badge
                                    bg={
                                      isReceiver ? "soft-info" : "soft-primary"
                                    }
                                    className="small fw-bold text-uppercase p-1 px-2"
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    {isReceiver ? "Bên Nhận" : "Bên Gửi"}
                                  </Badge>
                                  {item.is_OEM && (
                                    <Badge
                                      bg="warning"
                                      className="text-white p-1 px-2"
                                      style={{ fontSize: "0.6rem" }}
                                    >
                                      OEM
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Thông tin sản phẩm chính */}
                              <div className="d-flex gap-3 mb-3">
                                <div className="product-img-wrapper shadow-sm border rounded-3 overflow-hidden bg-white">
                                  <Image
                                    src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${item.product_pinner?.main_cardimage}`}
                                    alt={item.product_pinner?.name}
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                </div>
                                <div className="flex-grow-1 overflow-hidden text-start">
                                  <h6 className="text-aws-navy text-truncate mb-0">
                                    {item.product_pinner?.name}
                                  </h6>
                                  <div className="d-flex align-items-center mb-1">
                                    <code
                                      className="x-small text-muted text-truncate"
                                      style={{ maxWidth: "120px" }}
                                    >
                                      ID: {item.product_id}
                                    </code>
                                  </div>

                                  {/* File OEM - Cắt chữ nếu quá dài */}
                                  <div className="d-flex align-items-center mb-1 text-truncate">
                                    <FontAwesomeIcon
                                      icon={fileInfo.icon}
                                      style={{ color: fileInfo.color }}
                                      className="me-1 x-small"
                                    />
                                    <span
                                      className="x-small text-muted text-truncate"
                                      title={
                                        item.product_pinner?.OEMfile ||
                                        "No file"
                                      }
                                    >
                                      {item.product_pinner?.OEMfile ||
                                        "No documents"}
                                    </span>
                                  </div>

                                  <div className="text-aws-orange fw-bold small">
                                    {Number(
                                      item.product_pinner?.price || 0,
                                    ).toLocaleString()}{" "}
                                    <small className="fw-normal">VND</small>
                                  </div>
                                </div>
                              </div>

                              {/* Thông số kỹ thuật nhanh */}
                              <div className="aws-data-row p-2 rounded-3 bg-light mb-3">
                                <Row className="g-0">
                                  <Col
                                    xs={6}
                                    className="border-end text-center"
                                  >
                                    <div
                                      className="extra-small text-muted text-uppercase fw-bold"
                                      style={{ fontSize: "0.6rem" }}
                                    >
                                      Số lượng
                                    </div>
                                    <div className="small text-aws-navy">
                                      {item.Quantity?.toLocaleString()} sp
                                    </div>
                                  </Col>
                                  <Col xs={6} className="text-center">
                                    <div
                                      className="extra-small text-muted text-uppercase fw-bold"
                                      style={{ fontSize: "0.6rem" }}
                                    >
                                      Hết hạn
                                    </div>
                                    <div className="small text-aws-navy">
                                      {moment(item.End_date).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </div>
                                  </Col>
                                </Row>
                              </div>

                              {/* Nút hành động */}
                              <div className="d-flex gap-2">
                                <Button
                                  variant="white"
                                  size="sm"
                                  className="w-100 border text-muted fw-bold shadow-none"
                                  onClick={() => openModal("detail", item)}
                                >
                                  Xem hồ sơ
                                </Button>
                                {item.status === "pending" && isReceiver && (
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    className="w-100 btn-aws-orange shadow-sm fw-bold border-0"
                                    onClick={() => openModal("OEMacp", item)}
                                  >
                                    Phê duyệt
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                            <div className="card-footer bg-transparent border-0 pt-0 text-end pe-3 pb-2">
                              <small
                                className="text-muted italic"
                                style={{ fontSize: "0.6rem" }}
                              >
                                Updated {moment(item.updatedAt).fromNow()}
                              </small>
                            </div>
                          </Card>
                        </Col>
                      );
                    })
                  ) : (
                    <Col xs={12} className="text-center py-5">
                      <div className="opacity-20 mb-3">
                        <FontAwesomeIcon icon={faSearch} size="3x" />
                      </div>
                      <h6 className="text-muted">No assignments found</h6>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* CỘT PHẢI: ASSIGN FORM (Sticky Sidebar) */}
          <Col xl={4} lg={5} className="aws-sticky-sidebar">
            <Card className="aws-card-form border-0 shadow-lg overflow-hidden">
              <div className="form-header-aws p-4 text-white">
                <div className="d-flex align-items-center mb-1">
                  <FontAwesomeIcon
                    icon={faFileUpload}
                    className="me-2 text-aws-orange"
                  />
                  <h5 className=" m-0">Assign Production</h5>
                </div>
                <small className="opacity-75 small">
                  Khởi tạo yêu cầu gia công cho đối tác
                </small>
              </div>

              <Card.Body className="p-4 bg-white">
                <Form>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label className="aws-label">
                      Product Catalog
                    </Form.Label>
                    <Select
                      options={productOptions}
                      components={{
                        Option: CustomOption,
                        SingleValue: CustomSingleValue,
                      }}
                      styles={customStyles}
                      placeholder="Select a product..."
                      isSearchable={true}
                      onChange={(selected) =>
                        setNewOEM({ ...newOEM, product_id: selected.value })
                      }
                      value={productOptions.find(
                        (opt) => opt.value === newOEM.product_id,
                      )}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label className="aws-label">
                      Target Manufacturer
                    </Form.Label>
                    <Select
                      options={partnerOptions}
                      components={{
                        Option: CustomOptionPartner,
                        SingleValue: CustomSingleValuePartner,
                      }}
                      styles={customStyles}
                      placeholder="Choose partner..."
                      isSearchable={true}
                      onChange={(selected) =>
                        setNewOEM({ ...newOEM, partner_id: selected.value })
                      }
                      value={partnerOptions.find(
                        (opt) => opt.value === newOEM.partner_id,
                      )}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label className="aws-label">
                      Order Quantity
                    </Form.Label>
                    <InputGroup className="aws-input-group border rounded-3 overflow-hidden bg-light">
                      <Form.Control
                        type="number"
                        min="1"
                        className="bg-transparent border-0 p-2 shadow-none"
                        value={newOEM.Quantity}
                        onChange={(e) =>
                          setNewOEM({ ...newOEM, Quantity: e.target.value })
                        }
                      />
                      <InputGroup.Text className="bg-white border-0 small fw-bold text-muted px-3">
                        PCS
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Row className="mb-3">
                    <Col md={6} className="text-start">
                      <Form.Label className="aws-label">Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        className="aws-input-soft py-2"
                        value={newOEM.Start_date}
                        onChange={(e) =>
                          setNewOEM({ ...newOEM, Start_date: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={6} className="text-start">
                      <Form.Label className="aws-label">Deadline</Form.Label>
                      <Form.Control
                        type="date"
                        className="aws-input-soft py-2 border-danger-soft"
                        value={newOEM.End_date}
                        onChange={(e) =>
                          setNewOEM({ ...newOEM, End_date: e.target.value })
                        }
                      />
                    </Col>
                  </Row>

                  <Form.Group className="mb-4 text-start">
                    <Form.Label className="aws-label">
                      Technical Notes
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      className="aws-input-soft"
                      placeholder="Special requirements for this batch..."
                      value={newOEM.notes}
                      onChange={(e) =>
                        setNewOEM({ ...newOEM, notes: e.target.value })
                      }
                    />
                  </Form.Group>

                  <Button
                    onClick={OEM_order}
                    disabled={
                      apiwait || !newOEM.partner_id || !newOEM.product_id
                    }
                    className="btn-aws-orange w-100 py-3 mt-2 shadow-soft fw-bold d-flex align-items-center justify-content-center"
                  >
                    {apiwait ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="me-2"
                        />{" "}
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> SEND
                        PRODUCTION REQUEST
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>

              <div className="bg-aws-navy p-3 text-center">
                <small className="text-white opacity-50 italic">
                  <FontAwesomeIcon icon={faShieldAlt} className="me-1" /> Data
                  will be hashed on TraceChain
                </small>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default OEMproductions;
