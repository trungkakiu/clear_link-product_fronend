import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Badge,
  InputGroup,
  Form,
  Nav,
  Tab,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faSearch,
  faStore,
  faHistory,
  faCheckCircle,
  faStar,
  faFilter,
  faRocket,
  faBoxOpen,
  faGlobe,
  faHandHoldingUsd,
  faCube,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../scss/volt/components/Market/InternalMarket.scss";
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";
import { toast } from "react-toastify";
import CompanyInfoModal from "./Modal/Manufacture/CompanyInfoModal";
import PartnerDetailModal from "./Modal/Manufacture/PartnerDetailModal";
import SendProposalModal from "./Modal/Manufacture/SendProposalModal";

const InternalMarketplace = () => {
  const API_URL = process.env.REACT_APP_API_IMAGE_URL;
  const [isload, setIsLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [marketData, setMarketData] = useState({
    company_Sectors: [],
    myProfile: null,
    partners: [],
  });

  const [modalState, setModalState] = useState({
    myCompanyinfo: false,
    yourCompanyinfo: false,
    senproposalrequest: false,
  });

  const [modalData, setModalData] = useState({
    myCompanyinfo: null,
    senproposalrequest: null,
    partnerinfo: null,
    yourCompanyinfo: null,
  });

  const openModal = (key, data) => {
    try {
      setModalState((prev) => ({
        ...prev,
        [key]: true,
      }));
      setModalData((prev) => ({
        ...prev,
        [key]: data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const closeModal = (key, isRefresh) => {
    try {
      setModalState((prev) => ({
        ...prev,
        [key]: false,
      }));

      if (isRefresh) {
        getMarketplaceInfo();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const { User } = useContext(UserContext);

  useEffect(() => {
    getMarketplaceInfo();
  }, []);

  const getMarketplaceInfo = async () => {
    try {
      setIsLoad(true);
      const res = await api_request.getInternalMarketplaceInfo(User);

      if (res && res.RC === 200 && res.RD) {
        setMarketData({
          company_Sectors: res.RD.company_Sectors || [],
          myProfile: res.RD.myProfile || null,
          partners: res.RD.partners || [],
        });
      } else {
        toast.error("Không thể tải thông tin thị trường");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thị trường:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoad(false);
    }
  };

  const getInfo = (p) =>
    p?.manufacturer_info ||
    p?.distributor_info ||
    p?.retailer_info ||
    p?.transporter_info;

  const verifiedPartners =
    marketData.partners?.filter((partner) => {
      const info = getInfo(partner);

      return info?.chain_status?.toString().trim().toLowerCase() === "active";
    }) || [];

  return (
    <div className="internal-market-wrapper p-3">
      <section
        className="market-hero-banner mb-4 p-4 rounded-3 shadow-sm text-white"
        data-aos="zoom-in"
      >
        <SendProposalModal
          show={modalState.senproposalrequest}
          close={() => closeModal("senproposalrequest", false)}
          senderInfo={modalData.yourCompanyinfo}
          partner={modalData.senproposalrequest}
        />
        <PartnerDetailModal
          API_URL={API_URL}
          close={() => closeModal("yourCompanyinfo", false)}
          partner={modalData.yourCompanyinfo}
          show={modalState.yourCompanyinfo}
        />
        <CompanyInfoModal
          close={() => closeModal("myCompanyinfo", false)}
          show={modalState.myCompanyinfo}
          closeRefresh={() => closeModal("myCompanyinfo", true)}
          data={modalData.myCompanyinfo}
        />
        <Row className="align-items-center">
          <Col md={8}>
            <Badge bg="warning" className="text-dark mb-2">
              MỚI: Tính năng đấu thầu On-chain
            </Badge>
            <h2 className="fw-bold">
              Chào mừng,{" "}
              {getInfo(marketData.myProfile)?.company_name || "Thành viên"}
            </h2>
            <p className="opacity-75">
              Tìm kiếm đối tác sản xuất, phân phối và ký kết hợp đồng thông minh
              chỉ trong vài giây.
            </p>
            <div className="d-flex gap-2">
              <Button variant="light" size="sm">
                Đăng ký đối tác VIP
              </Button>
              <Button variant="outline-light" size="sm">
                Tài liệu hướng dẫn
              </Button>
            </div>
          </Col>
          <Col md={4} className="text-end d-none d-md-block">
            <div className="display-4 fw-bold">
              {marketData.partners?.length || 0}
            </div>
            <div className="small opacity-75">Đối tác khả dụng</div>
          </Col>
        </Row>
      </section>

      <Card className="border-0 shadow-sm mb-4 px-3 py-2">
        <Row className="align-items-center">
          <Col lg={5}>
            <InputGroup className="market-search-bar">
              <InputGroup.Text className="bg-white border-end-0">
                <FontAwesomeIcon icon={faSearch} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm tên công ty, mã vận đơn, loại linh kiện..."
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          <Col lg={7} className="mt-3 mt-lg-0">
            <div className="d-flex gap-2 overflow-auto pb-1 custom-scrollbar">
              <Button variant="soft-primary" size="sm" className="text-nowrap">
                <FontAwesomeIcon icon={faGlobe} className="me-1" /> Toàn quốc
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="text-nowrap"
              >
                <FontAwesomeIcon icon={faRocket} className="me-1" /> Giao nhanh
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="text-nowrap"
              >
                <FontAwesomeIcon icon={faShieldAlt} className="me-1" /> Bảo hiểm
                On-chain
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="text-nowrap"
              >
                <FontAwesomeIcon icon={faFilter} className="me-1" /> Lọc thêm
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row>
        <Col lg={9}>
          <div className="market-section-title mb-3 d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faBoxOpen} className="text-primary" />
            <h6 className="fw-bold text-dark mb-0 text-uppercase">
              Danh mục ngành hàng
            </h6>
          </div>

          <Row className="mb-4 g-3">
            {marketData.company_Sectors &&
            marketData.company_Sectors.length > 0 ? (
              marketData.company_Sectors.map((cat, i) => (
                <Col xs={6} md={3} key={cat.id}>
                  <Card className="category-mini-card text-center border-0 shadow-sm py-3 h-100 hover-up cursor-pointer">
                    <div
                      className="icon-circle mx-auto mb-2"
                      style={{
                        backgroundColor: cat.color || "#0d6efd",
                        color: "#fff",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={
                          cat.icon && cat.icon !== "null" ? cat.icon : faCube
                        }
                      />
                    </div>
                    <span className="small fw-bold">{cat.name}</span>
                    <div className="text-muted" style={{ fontSize: "10px" }}>
                      Khám phá ngay
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-muted small italic">
                  Đang cập nhật danh mục...
                </p>
              </Col>
            )}
          </Row>

          <Tab.Container defaultActiveKey="trending">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Nav variant="pills" className="market-pills">
                <Nav.Item>
                  <Nav.Link eventKey="trending">Xu hướng</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="nearby">Gần bạn</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="verified">Đã xác thực</Nav.Link>
                </Nav.Item>
              </Nav>
              <Button variant="link" size="sm">
                Tất cả đối tác ({marketData.partners?.length || 0}) &rarr;
              </Button>
            </div>

            <Tab.Content>
              <Tab.Pane eventKey="trending">
                <Row className="g-3">
                  {marketData.partners && marketData.partners.length > 0 ? (
                    marketData.partners.map((partner) => {
                      const info = getInfo(partner);
                      const name = info?.company_name || "Doanh nghiệp mới";
                      const location = info?.location || "Toàn quốc";
                      const isVerified =
                        info?.chain_status?.toString().trim().toLowerCase() ===
                        "active";
                      const isOEM = partner.is_oem_ready;
                      const market_active = partner.is_active_market;

                      return (
                        <Col md={6} xl={4} key={partner.id}>
                          <Card className="partner-card-v2 border-0 shadow-sm overflow-hidden h-100">
                            <div
                              className={`status-stripe bg-${partner.company_type === "manufacturer" ? "primary" : "info"}`}
                            ></div>
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <Badge
                                    bg={
                                      isVerified
                                        ? "soft-success"
                                        : "soft-warning"
                                    }
                                    className={`${isVerified ? "text-success" : "text-danger"} small`}
                                  >
                                    {isVerified ? "Verified" : "Not Verified"}
                                  </Badge>
                                  {isOEM && (
                                    <Badge
                                      bg={"soft-success"}
                                      className={"text-success"}
                                    >
                                      OEM Ready
                                    </Badge>
                                  )}
                                </div>

                                <FontAwesomeIcon
                                  icon={faExternalLinkAlt}
                                  className="text-muted small cursor-pointer"
                                  onClick={() =>
                                    openModal("yourCompanyinfo", partner)
                                  }
                                />
                              </div>

                              <div className="d-flex gap-3 mt-3">
                                <img
                                  src={
                                    partner.logo_url
                                      ? `${API_URL}Sector-logo/${partner.logo_url}`
                                      : `https://ui-avatars.com/api/?name=${name}&background=f1f6ff&color=0D6EFD`
                                  }
                                  className="rounded shadow-sm"
                                  width="50"
                                  height="50"
                                  style={{ objectFit: "cover" }}
                                />
                                <div className="overflow-hidden">
                                  <h6 className="fw-bold mb-0 text-truncate">
                                    {name}
                                  </h6>
                                  <div className="text-muted small">
                                    <FontAwesomeIcon
                                      icon={faGlobe}
                                      className="me-1"
                                    />{" "}
                                    {location}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="mt-3 p-2 bg-light rounded"
                                style={{
                                  fontSize: "11px",
                                  fontStyle: "italic",
                                  color: "#555",
                                }}
                              >
                                <strong>Slogan:</strong>{" "}
                                {partner.slogan ||
                                  "Chưa cập nhật phương châm kinh doanh."}
                              </div>

                              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <span className="fw-bold text-primary">
                                  {partner.rating_avg}{" "}
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="text-warning ms-1"
                                  />
                                  <small
                                    className="text-muted ms-2"
                                    style={{ fontSize: "10px" }}
                                  >
                                    ({partner.total_deals} deals)
                                  </small>
                                </span>
                                <Button
                                  onClick={() =>
                                    openModal("senproposalrequest", partner)
                                  }
                                  variant={
                                    partner.company_id === User.data.company_id
                                      ? "outline-secondary"
                                      : "primary"
                                  }
                                  size="sm"
                                  disabled={
                                    partner.company_id === User.data.company_id
                                  }
                                >
                                  {partner.company_id === User.data.company_id
                                    ? "Của bạn"
                                    : "Kết nối"}
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })
                  ) : (
                    <Col className="text-center py-5 text-muted">
                      Hiện chưa có đối tác nào trên sàn.
                    </Col>
                  )}
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="verified">
                <Row className="g-3">
                  {verifiedPartners.partners &&
                  verifiedPartners.partners.length > 0 ? (
                    verifiedPartners.partners.map((partner) => {
                      const info = getInfo(partner);
                      const name = info?.company_name || "Doanh nghiệp mới";
                      const location = info?.location || "Toàn quốc";
                      const isVerified =
                        info?.chain_status?.toString().trim().toLowerCase() ===
                        "active";
                      const isOEM = partner.is_oem_ready;
                      const market_active = partner.is_active_market;

                      return (
                        <Col md={6} xl={4} key={partner.id}>
                          <Card className="partner-card-v2 border-0 shadow-sm overflow-hidden h-100">
                            <div
                              className={`status-stripe bg-${partner.company_type === "manufacturer" ? "primary" : "info"}`}
                            ></div>
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <div>
                                  <Badge
                                    bg={
                                      isVerified
                                        ? "soft-success"
                                        : "soft-warning"
                                    }
                                    className={`${isVerified ? "text-success" : "text-danger"} small`}
                                  >
                                    {isVerified ? "Verified" : "Not Verified"}
                                  </Badge>
                                  {isOEM && (
                                    <Badge
                                      bg={"soft-success"}
                                      className={"text-success"}
                                    >
                                      OEM Ready
                                    </Badge>
                                  )}
                                </div>

                                <FontAwesomeIcon
                                  icon={faExternalLinkAlt}
                                  className="text-muted small cursor-pointer"
                                  onClick={() =>
                                    openModal("yourCompanyinfo", partner)
                                  }
                                />
                              </div>

                              <div className="d-flex gap-3 mt-3">
                                <img
                                  src={
                                    partner.logo_url
                                      ? `${API_URL}Sector-logo/${partner.logo_url}`
                                      : `https://ui-avatars.com/api/?name=${name}&background=f1f6ff&color=0D6EFD`
                                  }
                                  className="rounded shadow-sm"
                                  width="50"
                                  height="50"
                                  style={{ objectFit: "cover" }}
                                />
                                <div className="overflow-hidden">
                                  <h6 className="fw-bold mb-0 text-truncate">
                                    {name}
                                  </h6>
                                  <div className="text-muted small">
                                    <FontAwesomeIcon
                                      icon={faGlobe}
                                      className="me-1"
                                    />{" "}
                                    {location}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="mt-3 p-2 bg-light rounded"
                                style={{
                                  fontSize: "11px",
                                  fontStyle: "italic",
                                  color: "#555",
                                }}
                              >
                                <strong>Slogan:</strong>{" "}
                                {partner.slogan ||
                                  "Chưa cập nhật phương châm kinh doanh."}
                              </div>

                              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <span className="fw-bold text-primary">
                                  {partner.rating_avg}{" "}
                                  <FontAwesomeIcon
                                    icon={faStar}
                                    className="text-warning ms-1"
                                  />
                                  <small
                                    className="text-muted ms-2"
                                    style={{ fontSize: "10px" }}
                                  >
                                    ({partner.total_deals} deals)
                                  </small>
                                </span>
                                <Button
                                  onClick={() =>
                                    openModal("senproposalrequest", partner)
                                  }
                                  variant={
                                    partner.company_id === User.data.company_id
                                      ? "outline-secondary"
                                      : "primary"
                                  }
                                  size="sm"
                                  disabled={
                                    partner.company_id === User.data.company_id
                                  }
                                >
                                  {partner.company_id === User.data.company_id
                                    ? "Của bạn"
                                    : "Kết nối"}
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })
                  ) : (
                    <Col className="text-center py-5 text-muted">
                      Hiện chưa có đối tác nào trên sàn.
                    </Col>
                  )}
                </Row>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>

        <Col lg={3}>
          <div className="market-section-title mb-3">
            <h6 className="fw-bold text-dark mb-0 text-uppercase">
              Bảng xếp hạng uy tín
            </h6>
          </div>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-2">
              {[1, 2, 3].map((pos) => (
                <div
                  className="d-flex align-items-center gap-2 p-2 mb-2 rounded border-bottom-dashed"
                  key={pos}
                >
                  <div className={`rank-number ${pos === 1 ? "gold" : ""}`}>
                    {pos}
                  </div>
                  <img
                    src={`https://ui-avatars.com/api/?name=C${pos}`}
                    className="rounded-circle"
                    width="30"
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="small fw-bold text-truncate">
                      Global Logis {pos}
                    </div>
                    <div className="text-muted" style={{ fontSize: "9px" }}>
                      Score: 9.9/10
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-warning small"
                  />
                </div>
              ))}
            </Card.Body>
          </Card>

          <div className="market-section-title mb-3">
            <h6 className="fw-bold text-dark mb-0 text-uppercase">
              Thao tác nhanh
            </h6>
          </div>
          <div className="d-grid gap-2 mb-4">
            <Button
              onClick={() => openModal("myCompanyinfo", marketData.myProfile)}
              variant="soft-success"
              className="text-start p-3 border-0 shadow-sm"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Thông tin quảng bá cá nhân
            </Button>
            <Button
              variant="soft-success"
              className="text-start p-3 border-0 shadow-sm"
            >
              <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" /> Đăng
              yêu cầu mua hàng
            </Button>
            <Button
              variant="soft-info"
              className="text-start p-3 border-0 shadow-sm"
            >
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" /> Kiểm tra
              chứng chỉ đối tác
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-sm">
            <Card.Header className="bg-soft-primary border-0 small fw-bold">
              BLOCKCHAIN TICKER
            </Card.Header>
            <Card.Body className="p-0">
              <div className="ticker-wrapper">
                {[1, 2, 3, 4].map((i) => (
                  <div className="ticker-item p-2 small border-bottom" key={i}>
                    <Badge bg="dark" className="me-2">
                      #0x{Math.floor(Math.random() * 1000)}
                    </Badge>
                    <span className="text-muted">TX Verified...</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InternalMarketplace;
