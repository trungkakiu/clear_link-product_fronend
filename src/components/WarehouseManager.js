import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  InputGroup,
  Form,
  Spinner,
  Navbar,
  Container,
  Nav,
  Badge,
  Col,
  Row,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faWarehouse,
  faBoxOpen,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "../scss/volt/components/WarehouseManager.scss";
import { toast } from "react-toastify";
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";
import StructureGuideModal from "./Modal/StructureGuideModal";
import CreateZoneModal from "./Modal/CreateZoneModal";
import CreateWarehouseModal from "./Modal/CreateWarehouseModal";
import CreateRackModal from "./Modal/CreateRackModal";

const WarehouseManager = () => {
  const [dbData, setdbData] = useState([]);
  const { User } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedZones, setExpandedZones] = useState({});
  const [isload, setisload] = useState(false);
  const [modalstate, setmodalstate] = useState({
    totural: false,
    createzone: false,
    createwarehouse: false,
    createRacks: false,
  });
  const [modalData, setmodalData] = useState();

  const openModal = (key, data) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: true,
    }));
    if (data) {
      setmodalData(data);
    }
  };

  const [expandedRacks, setExpandedRacks] = useState({});

  const toggleRack = (rackId) => {
    setExpandedRacks((prev) => ({ ...prev, [rackId]: !prev[rackId] }));
  };

  const closeModal = (key) => {
    setmodalstate((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const getWareHouse = async () => {
    try {
      setisload(true);
      const res = await api_request.getWareHouseApi(User);
      if (res && res.RC === 200) {
        setdbData(res.RD);
      } else {
        toast.error(res?.RM || "Không thể lấy dữ liệu kho");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống kết nối Meta Node!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    if (User) getWareHouse();
  }, [User]);

  const toggleZone = (id) => {
    setExpandedZones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="warehouse-container p-3">
      <StructureGuideModal
        handleClose={() => closeModal("totural")}
        show={modalstate.totural}
      />

      <CreateRackModal
        getWareHouse={modalstate.createRacks}
        handleClose={() => closeModal("createRacks")}
        show={modalstate.createRacks}
        zone={modalData}
      />

      <CreateZoneModal
        handleClose={() => closeModal("createzone")}
        show={modalstate.createzone}
        warehouse={modalData}
        index={modalData}
      />

      <CreateWarehouseModal
        handleClose={() => closeModal("createwarehouse")}
        closeReload={() => {
          closeModal("createwarehouse");
          getWareHouse();
        }}
        show={modalstate.createwarehouse}
      />
      <Navbar
        variant="light"
        className="warehouse-header-wrapper shadow-sm mb-4"
      >
        <Container fluid className="px-4">
          <Nav className="me-auto d-flex flex-column">
            <Navbar.Brand className="d-flex align-items-center mb-0">
              <FontAwesomeIcon
                icon={faWarehouse}
                className="text-primary me-3"
                size="lg"
              />
              <span className="main-title fw-extrabold">
                Quản lý Kho hàng TraceChain
              </span>
            </Navbar.Brand>
            <div className="sub-status d-flex align-items-center">
              <span className="status-indicator me-2"></span>
              Meta Node: System Operational
            </div>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            {isload && (
              <Nav.Item className="loading-tag-wrapper d-none d-lg-flex align-items-center px-3 py-1 rounded-pill">
                <Spinner
                  animation="grow"
                  size="sm"
                  className="text-primary me-2"
                />
                <small className="text-primary fw-bold">SYNCING</small>
              </Nav.Item>
            )}

            <Form className="d-flex gap-2 align-items-center">
              <InputGroup className="custom-input-group border-0 shadow-sm">
                <InputGroup.Text className="bg-white border-0">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="border-0"
                  placeholder="Tìm mã kệ hoặc vị trí..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Form.Select
                className="custom-select border-0 shadow-sm fw-bold text-gray-700"
                style={{ width: "200px" }}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">⚡ Tất cả phân loại</option>
                <option value="RACKING">📦 Kệ tầng</option>
                <option value="BULK_STORAGE">🏠 Hàng tập trung</option>
              </Form.Select>
            </Form>
          </div>
        </Container>
      </Navbar>

      {dbData && dbData.length > 0 ? (
        dbData.map((warehouse) => (
          <div key={warehouse.id} className="warehouse-section mb-5">
            <div className="warehouse-title-bar mb-3 d-flex align-items-center border-bottom pb-2">
              <h5 className="mb-0 fw-bold text-primary">
                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                {warehouse.warehouse_name}
                <small
                  className="ms-2 text-muted fw-normal"
                  style={{ fontSize: "0.8rem" }}
                >
                  ({warehouse.location})
                </small>
              </h5>
            </div>

            {warehouse.zones && warehouse.zones.length > 0 ? (
              warehouse.zones
                .filter(
                  (z) =>
                    filterType === "all" || z.storage_method === filterType,
                )
                .map((zone) => (
                  <div key={zone.id} className="zone-card mb-4">
                    <div
                      className="zone-header d-flex justify-content-between align-items-center"
                      onClick={() => toggleZone(zone.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center">
                        <span
                          className={`badge me-3 ${zone.storage_method === "RACKING" ? "bg-info" : "bg-success"}`}
                        >
                          {zone.storage_method}
                        </span>
                        <span className="fw-bold text-navy">
                          {zone.zone_name}
                        </span>
                        {zone.is_expirable && (
                          <span
                            className="ms-2 text-danger small"
                            style={{ fontSize: "0.65rem" }}
                          >
                            • Có hạn dùng
                          </span>
                        )}
                      </div>
                      {(() => {
                        switch (zone?.storage_method) {
                          case "RACKING":
                            return (
                              <div className="d-flex align-items-center gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal("createRacks", zone);
                                  }}
                                  size="sm"
                                  variant="outline-primary"
                                  className="border-0 shadow-none"
                                >
                                  <FontAwesomeIcon
                                    icon={faPlus}
                                    className="me-1"
                                  />{" "}
                                  Thêm Rack
                                </Button>
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  className={`ms-2 text-muted transition-300 ${expandedZones[zone.id] ? "rotate-180" : ""}`}
                                />
                              </div>
                            );
                          case "BULK_STORAGE":
                            return (
                              <div className="d-flex align-items-center gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal("createSlot", zone);
                                  }}
                                  size="sm"
                                  variant="outline-success"
                                  className="border-0 shadow-none"
                                >
                                  <FontAwesomeIcon
                                    icon={faPlus}
                                    className="me-1"
                                  />{" "}
                                  Thêm hàng hóa
                                </Button>
                                <FontAwesomeIcon
                                  icon={faChevronDown}
                                  className={`ms-2 text-muted transition-300 ${expandedZones[zone.id] ? "rotate-180" : ""}`}
                                />
                              </div>
                            );
                          default:
                            return null;
                        }
                      })()}{" "}
                    </div>

                    <div
                      className={`zone-collapse-content ${expandedZones[zone.id] ? "show" : "hide"}`}
                    >
                      <Row className="racks-grid-system g-3 pd-2">
                        {zone?.storage_method === "BULK_STORAGE" && <></>}
                        {zone?.storage_method !== "BULK_STORAGE" && (
                          <>
                            {zone.Racks && zone.Racks.length > 0 ? (
                              zone.Racks.map((rack) => (
                                <Col xs={12} key={rack.id}>
                                  <div
                                    className={`rack-row-card ${expandedRacks[rack.id] ? "is-expanded" : ""}`}
                                  >
                                    <div
                                      className="rack-header-action"
                                      onClick={() => toggleRack(rack.id)}
                                    >
                                      <Row className="align-items-center w-100 g-0">
                                        <Col
                                          xs={8}
                                          md={6}
                                          className="d-flex align-items-center gap-3 ps-3"
                                        >
                                          <div className="rack-status-pill"></div>
                                          <span className="rack-id-text">
                                            {rack.rack_code}
                                          </span>
                                          <Badge
                                            bg="dark"
                                            className="rack-stats-badge d-none d-sm-inline-block"
                                          >
                                            {rack.num_levels} Tầng •{" "}
                                            {rack.slots?.length || 0} Ô
                                          </Badge>
                                        </Col>
                                        <Col
                                          xs={4}
                                          md={6}
                                          className="d-flex align-items-center justify-content-end pe-3 gap-4"
                                        >
                                          <div className="occupancy-stats d-none d-lg-flex align-items-center gap-2">
                                            <small className="fw-bold opacity-50">
                                              LOAD:
                                            </small>
                                            <div className="mini-progress">
                                              <div
                                                className="fill"
                                                style={{ width: "65%" }}
                                              ></div>
                                            </div>
                                          </div>
                                          <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className={`collapse-icon ${expandedRacks[rack.id] ? "rotate-180" : ""}`}
                                          />
                                        </Col>
                                      </Row>
                                    </div>

                                    <div className="rack-body-content">
                                      <div className="p-4">
                                        {(() => {
                                          const levelsMap =
                                            rack.slots?.reduce((acc, slot) => {
                                              const match =
                                                slot.slot_code.match(
                                                  /-L(\d+)-/,
                                                );
                                              const lv = match
                                                ? parseInt(match[1])
                                                : 1;
                                              if (!acc[lv]) acc[lv] = [];
                                              acc[lv].push(slot);
                                              return acc;
                                            }, {}) || {};

                                          Object.keys(levelsMap).forEach(
                                            (lv) => {
                                              levelsMap[lv].sort((a, b) => {
                                                const matchA =
                                                  a.slot_code.match(/-S(\d+)$/);
                                                const matchB =
                                                  b.slot_code.match(/-S(\d+)$/);
                                                return (
                                                  (matchA
                                                    ? parseInt(matchA[1])
                                                    : 0) -
                                                  (matchB
                                                    ? parseInt(matchB[1])
                                                    : 0)
                                                );
                                              });
                                            },
                                          );

                                          const sortedLevels = Object.keys(
                                            levelsMap,
                                          ).sort((a, b) => b - a);

                                          return sortedLevels.map((lv) => (
                                            <div
                                              key={`level-${lv}`}
                                              className="rack-level-row mb-4"
                                            >
                                              <div className="level-label-anchor d-flex align-items-center gap-2 mb-3">
                                                <Badge
                                                  bg="primary"
                                                  className="px-3 py-2 shadow-sm"
                                                  style={{
                                                    fontSize: "0.7rem",
                                                    letterSpacing: "1px",
                                                  }}
                                                >
                                                  LEVEL_0{lv}
                                                </Badge>
                                                <div
                                                  className="h-line flex-grow-1"
                                                  style={{
                                                    height: "1px",
                                                    background:
                                                      "rgba(0,0,0,0.05)",
                                                  }}
                                                ></div>
                                              </div>

                                              <Row className="g-3 flex-nowrap overflow-auto pb-3 custom-scrollbar">
                                                {levelsMap[lv].map((slot) => (
                                                  <Col xs="auto" key={slot.id}>
                                                    <div
                                                      className={`slot-box-premium ${slot.status !== "EMPTY" ? "active" : ""}`}
                                                      style={{ width: "130px" }}
                                                    >
                                                      <div className="slot-meta">
                                                        <span className="idx">
                                                          S
                                                          {slot.slot_code.match(
                                                            /-S(\d+)$/,
                                                          )?.[1] || "0"}
                                                        </span>
                                                        <div className="pulse-dot"></div>
                                                      </div>
                                                      {slot.status !==
                                                      "EMPTY" ? (
                                                        <div className="cargo-info">
                                                          <FontAwesomeIcon
                                                            icon={faBoxOpen}
                                                            className="icon"
                                                          />
                                                          <div className="sku">
                                                            SKU-TRACE
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <div className="vacant-text d-flex align-items-center justify-content-center flex-grow-1 w-100">
                                                          EMPTY
                                                        </div>
                                                      )}
                                                    </div>
                                                  </Col>
                                                ))}
                                                <Col xs="auto">
                                                  <div
                                                    className="slot-box-premium add-trigger"
                                                    style={{ width: "60px" }}
                                                  >
                                                    <FontAwesomeIcon
                                                      icon={faPlus}
                                                    />
                                                  </div>
                                                </Col>
                                              </Row>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              ))
                            ) : (
                              <Col xs={12}>
                                <div className="empty-zone-placeholder text-center py-5 border-dashed">
                                  <p className="mb-0 text-muted">
                                    Hệ thống Meta Node chưa ghi nhận Dãy kệ
                                    (Rack) tại Zone này.
                                  </p>
                                </div>
                              </Col>
                            )}
                          </>
                        )}
                      </Row>
                    </div>
                  </div>
                ))
            ) : (
              <Button
                onClick={() => openModal("createzone", warehouse)}
                variant="outline-primary"
                className="add-btn-dashed w-100 py-3"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> TRỐNG - THÊM
                KHU VỰC (ZONE) CHO KHO NÀY
              </Button>
            )}

            <Button
              onClick={() => {
                openModal("createzone", warehouse);
              }}
              variant="outline-primary"
              className="add-btn-dashed w-100 py-3 mt-3"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              THÊM KHU VỰC (ZONE)
            </Button>
          </div>
        ))
      ) : (
        <div className="empty-warehouse-placeholder mt-5">
          <div className="illustration-wrapper">
            <svg
              width="180"
              height="180"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9L12 3L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#0061ff"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.2"
              />
              <path
                d="M9 22V12H15V22"
                stroke="#ff9900"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="#0061ff"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>

          <div className="content-wrapper">
            <h2 className="text-navy">Sẵn sàng khởi tạo Meta Node?</h2>
            <p>
              Hệ thống TraceChain hiện chưa ghi nhận cấu trúc kho hàng của bạn.
              Hãy bắt đầu xây dựng các Zone, Rack và Slot để quản lý quy trình
              quản lý tồn kho ngay bây giờ.
            </p>

            <div className="d-flex justify-content-center gap-3">
              <Button
                onClick={() => openModal("createwarehouse")}
                className="btn-initialize"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Khởi tạo Kho
                hàng ngay
              </Button>
              <Button
                onClick={() => openModal("totural")}
                variant="outline-secondary"
                style={{ borderRadius: "12px" }}
              >
                Xem hướng dẫn cấu trúc
              </Button>
            </div>
          </div>

          <div className="position-absolute bottom-0 end-0 p-3 text-muted opacity-25 font-mono small">
            TRACECHAIN_PROTO_V2.0 // WAREHOUSE_NULL
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManager;
