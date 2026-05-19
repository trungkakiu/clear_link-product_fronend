import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  Button,
  InputGroup,
  Form,
  Spinner,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faWarehouse,
  faLayerGroup,
  faServer,
  faSync,
  faBoxOpen,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import "../scss/volt/components/WarehouseManager.scss";
import { toast } from "react-toastify";
import api_request from "../apicontroller/api_request";
import { UserContext } from "../Context/UserContext";

// Khai báo Modal
import StructureGuideModal from "./Modal/StructureGuideModal";
import CreateZoneModal from "./Modal/CreateZoneModal";
import CreateWarehouseModal from "./Modal/CreateWarehouseModal";
import CreateRackModal from "./Modal/CreateRackModal";

const WarehouseManager = () => {
  const { User } = useContext(UserContext);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // FIX LOGIC MODAL: Để mặc định là các cờ (flags) thay vì tháo lắp component
  const [modalstate, setmodalstate] = useState({
    totural: false,
    createwarehouse: false,
    createzone: false,
    createrack: false,
  });

  // STATE ĐÓNG MỞ KHO VÀ KỆ
  const [expandedZones, setExpandedZones] = useState({});
  const [expandedRacks, setExpandedRacks] = useState({}); // <-- State mới cho Racks

  const pollInterval = useRef(null);

  // ==========================================
  // LẤY DỮ LIỆU & SILENT POLLING
  // ==========================================
  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      else setIsSyncing(true);

      try {
        const res = await api_request.getWareHouseApi(User);

        if (res && res.RC === 200) {
          setWarehouses(res.RD || []);
        } else {
          if (!isSilent) toast.error(res?.RM || "Không thể lấy dữ liệu kho");
        }
      } catch (error) {
        if (!isSilent) toast.error("Lỗi kết nối đến máy chủ!");
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
      }
    },
    [User],
  );

  useEffect(() => {
    fetchData();
    pollInterval.current = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(pollInterval.current);
  }, [fetchData]);

  const openModal = (modalName) =>
    setmodalstate((prev) => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) =>
    setmodalstate((prev) => ({ ...prev, [modalName]: false }));

  const toggleZone = (zoneId) =>
    setExpandedZones((prev) => ({ ...prev, [zoneId]: !prev[zoneId] }));
  const toggleRack = (rackId) =>
    setExpandedRacks((prev) => ({ ...prev, [rackId]: !prev[rackId] }));

  const groupSlotsByLevel = (slots) => {
    if (!slots) return {};
    const grouped = {};

    slots.forEach((slot) => {
      const levelMatch = slot.slot_code.match(/-L(\d+)-/i);
      const levelNum = levelMatch ? parseInt(levelMatch[1], 10) : 1;

      if (!grouped[levelNum]) grouped[levelNum] = [];
      grouped[levelNum].push(slot);
    });

    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => b - a)
      .forEach((key) => {
        grouped[key].sort((a, b) => {
          const sA = parseInt(a.slot_code.match(/-S(\d+)$/)?.[1] || 0);
          const sB = parseInt(b.slot_code.match(/-S(\d+)$/)?.[1] || 0);
          return sA - sB;
        });
        sortedGrouped[`TẦNG ${key}`] = grouped[key];
      });

    return sortedGrouped;
  };

  // ==========================================
  // COMPONENT RENDERING: HỘP NƯỚC (SLOT UI)
  // ==========================================
  const renderSlot = (slot) => {
    const maxVol = parseFloat(slot.max_volume) || 1;
    const currentVol = parseFloat(slot.current_volume) || 0;
    const reservedVol = parseFloat(slot.reserved_volume) || 0;
    const totalUsedVol = currentVol + reservedVol;

    const fillPercentage = Math.min((totalUsedVol / maxVol) * 100, 100);

    const hasInventory = slot.inventory && slot.inventory.length > 0;
    const firstItem = hasInventory ? slot.inventory[0] : null;
    const totalQty = hasInventory
      ? slot.inventory.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    const imageUrl = firstItem?.product_info?.main_cardimage
      ? `https://api.clearlink.io.vn/main-card/${firstItem.product_info.main_cardimage}`
      : null;

    const shortCode = slot.slot_code.match(/-S(\d+)$/)?.[1] || "0";

    return (
      <div key={slot.id} className="slot-water-box">
        <div
          className="water-level"
          style={{
            height: `${fillPercentage}%`,
            backgroundColor: fillPercentage > 90 ? "#fecaca" : "#bae6fd",
            borderTop:
              fillPercentage > 0 ? "2px solid rgba(14, 165, 233, 0.4)" : "none",
          }}
        />

        <div className="slot-content">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <Badge bg="dark" className="shadow-sm">
              S{shortCode}
            </Badge>
            <span
              className={`fw-bold ${fillPercentage > 90 ? "text-danger" : "text-primary"}`}
              style={{
                fontSize: "0.65rem",
                background: "rgba(255,255,255,0.85)",
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              {fillPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1">
            {hasInventory ? (
              <>
                <div
                  className="bg-white rounded overflow-hidden shadow-sm d-flex align-items-center justify-content-center mb-1"
                  style={{
                    width: "58px",
                    height: "68px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="SP"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBoxOpen}
                      className="text-secondary"
                    />
                  )}
                </div>
                <div
                  className="text-truncate fw-bold w-100 text-center text-dark"
                  style={{ fontSize: "0.8rem" }}
                >
                  {firstItem.batch_id}
                </div>
                <Badge
                  bg="success"
                  className="mt-1 shadow-sm"
                  style={{ fontSize: "0.6rem" }}
                >
                  {totalQty} SP
                </Badge>
              </>
            ) : reservedVol > 0 ? (
              <span
                className="text-warning fw-bold small text-center"
                style={{ fontSize: "0.65rem", lineHeight: "1.2" }}
              >
                ĐANG CHỜ
                <br />
                NHẬP KHO
              </span>
            ) : (
              <span
                className="text-muted fw-bold opacity-25"
                style={{ fontSize: "0.75rem" }}
              >
                TRỐNG
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wms-dashboard">
      {/* TOOLBAR */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
        <div className="d-flex align-items-center gap-3">
          <h4 className="m-0 fw-bold d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faWarehouse} className="text-primary" />
            Meta Warehouse
          </h4>
          <div
            className={`badge ${isSyncing ? "bg-warning text-dark" : "bg-success"} rounded-pill d-flex align-items-center px-3 py-2 shadow-sm`}
          >
            {isSyncing ? (
              <FontAwesomeIcon icon={faSync} spin className="me-2" />
            ) : (
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#fff",
                  marginRight: "8px",
                  animation: "pulse 2s infinite",
                }}
              ></div>
            )}
            {isSyncing ? "Đang đồng bộ..." : "Live Data"}
          </div>
        </div>
        <div>
          <Button
            variant="primary"
            className="fw-bold px-4 shadow-sm"
            onClick={() => openModal("createwarehouse")}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Thêm khu vực
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted fw-bold">
            Đang tải cấu trúc Không gian Kho...
          </p>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-5">
          <FontAwesomeIcon
            icon={faServer}
            className="text-muted opacity-25 mb-3"
            style={{ fontSize: "4rem" }}
          />
          <h4 className="fw-bold">Hệ thống kho đang trống</h4>
          <p className="text-muted">
            Bạn chưa khởi tạo dữ liệu kho nào trên hệ thống.
          </p>
        </div>
      ) : (
        warehouses.map((wh) => (
          <div key={wh.id} className="wh-card">
            <div className="wh-header bg-primary text-white d-flex justify-content-between align-items-start p-3 rounded-top">
              <div>
                <h5 className="m-0 fw-bold text-white">{wh.warehouse_name}</h5>
                <small className="opacity-75 d-flex align-items-center mt-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />{" "}
                  {wh.location}
                </small>
              </div>
              <Badge bg="light" text="dark" className="px-3 py-2 fw-bold">
                {wh.warehouse_type}
              </Badge>
            </div>

            {wh.zones &&
              wh.zones.map((zone) => (
                <div key={zone.id} className="zone-section">
                  <div
                    className="zone-title"
                    onClick={() => toggleZone(zone.id)}
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="text-primary"
                    />
                    {zone.zone_name}
                    <span className="text-muted fw-normal fs-6">
                      ({zone.storage_method})
                    </span>

                    <div className="ms-auto d-flex align-items-center gap-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("createrack");
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Thêm
                        Kệ
                      </Button>
                      <FontAwesomeIcon
                        icon={
                          expandedZones[zone.id] ? faChevronDown : faChevronUp
                        }
                        className="text-muted"
                      />
                    </div>
                  </div>

                  {!expandedZones[zone.id] && (
                    <div className="row mt-3 align-items-start">
                      {zone.Racks &&
                        zone.Racks.map((rack) => (
                          <div key={rack.id} className="col-12 col-xl-6 mb-3">
                          
                            <div className="rack-container">
                              <div
                                className="rack-header d-flex justify-content-between align-items-center"
                                onClick={() => toggleRack(rack.id)}
                                style={{
                                  cursor: "pointer",
                                  userSelect: "none",
                                  marginBottom: expandedRacks[rack.id]
                                    ? "0"
                                    : "1rem",
                                }}
                              >
                                <span>
                                  <FontAwesomeIcon
                                    icon={faServer}
                                    className="me-2 text-secondary"
                                  />
                                  {rack.rack_code || "Kệ chưa đặt tên"}
                                </span>
                                <div>
                                  <Badge bg="secondary" className="me-3">
                                    {rack.slots?.length || 0} Ô chứa
                                  </Badge>
                                  <FontAwesomeIcon
                                    icon={
                                      expandedRacks[rack.id]
                                        ? faChevronDown
                                        : faChevronUp
                                    }
                                    className="text-muted"
                                  />
                                </div>
                              </div>

                              {!expandedRacks[rack.id] && (
                                <div className="mt-3">
                                  {Object.entries(
                                    groupSlotsByLevel(rack.slots),
                                  ).map(([levelName, slotsInLevel]) => (
                                    <div key={levelName} className="level-row">
                                      <div className="level-indicator">
                                        {levelName}
                                      </div>
                                      <div className="slots-wrapper">
                                        {slotsInLevel.map((slot) =>
                                          renderSlot(slot),
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {(!rack.slots || rack.slots.length === 0) && (
                                    <div className="text-center text-muted small p-3 font-monospace">
                                      -- Kệ này chưa thiết lập Ô chứa --
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))
      )}

      {/* RENDER MODAL AN TOÀN - LUÔN GẮN TRONG DOM ĐỂ HIỆU ỨNG BOOTSTRAP CHẠY ĐÚNG */}
      <StructureGuideModal
        show={modalstate.totural}
        onHide={() => closeModal("totural")}
      />
      <CreateWarehouseModal
        show={modalstate.createwarehouse}
        handleClose={() => closeModal("createwarehouse")}
        LoadData={fetchData}
      />
      <CreateZoneModal
        show={modalstate.createzone}
        handleClose={() => closeModal("createzone")}
        LoadData={fetchData}
      />
      <CreateRackModal
        show={modalstate.createrack}
        handleClose={() => closeModal("createrack")}
        LoadData={fetchData}
        data={warehouses}
      />
    </div>
  );
};

export default WarehouseManager;
