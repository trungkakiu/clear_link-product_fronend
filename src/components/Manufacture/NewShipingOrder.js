import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Container,
  Table,
  InputGroup,
  Dropdown,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faBoxOpen,
  faHistory,
  faSignature,
  faCalculator,
  faRoad,
  faCheckSquare,
  faSquare,
  faCalendarAlt,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/Manufacture/ShippingOrder.scss";
import { UserContext } from "../../Context/UserContext";
import api_request from "../../apicontroller/api_request";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import Otp_verify_dynamic from "../Modal/Otp_verify_dynamic";
import MapDirectionView from "../MapDirectionView";
import MapDirectionPreview from "../MapDirectionPreview";

const NewShipingOrder = () => {
  const { User } = useContext(UserContext);
  const [modalstate, setmodalstate] = useState(false);
  const [isload, setisload] = useState(false);
  const [realDistance, setRealDistance] = useState(0);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [shipinginfo, setshipinginfo] = useState({
    shipping: [],
    MyCompany: {},
    collaboration: [],
    complate_batched: [],
  });

  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [orderId] = useState(`SHIP_${Date.now()}`);

  const [shippingConfig, setShippingConfig] = useState({
    vehicleType: "truck_closed",
    commodityType: "general",
    distance: 100,
    loadingDate: "",
    deliveryDate: "",
  });

  const handleRouteInfo = (data) => {
    if (data && data.distance) {
      setRealDistance(data.distance);
    }
  };

  const getShipingInfo = async () => {
    try {
      setisload(true);
      const res = await api_request.getShipingInfo(User);
      if (res?.RC === 200) {
        setshipinginfo({
          shipping: res.RD.data?.shipping || [],
          collaboration: res.RD.data?.collaboration || [],
          MyCompany: res.RD.data.MyCompany || {},
          complate_batched: res.RD.complate_batched || [],
        });
      }
    } catch (error) {
      toast.error("Lỗi hệ thống kết nối!");
    } finally {
      setTimeout(() => setisload(false), 600);
    }
  };

  useEffect(() => {
    getShipingInfo();
  }, []);

  const getPartnerData = (collab) => {
    return collab?.partner_company || null;
  };

  const toggleBatch = (batch) => {
    const isSelected = selectedBatches.find((b) => b.id === batch.id);
    isSelected
      ? setSelectedBatches(selectedBatches.filter((b) => b.id !== batch.id))
      : setSelectedBatches([...selectedBatches, batch]);
  };

  const calculation = useMemo(() => {
    const defaultValues = {
      totalWeight: 0,
      totalPallets: 0,
      effectiveWeight: 0,
      vehicleCount: 0,
      baseFee: 0,
      commodityFee: 0,
      serviceFee: 0,
      handlingFee: 0,
      fuelSurcharge: 0,
      vatFee: 0,
      finalTotal: 0,
      activeDistance: 0,
      unitPrice: 0, // THÊM TRƯỜNG NÀY ĐỂ UI KHÔNG LỖI
      hasRoadTax: false,
      isBulky: false,
    };

    try {
      if (!selectedBatches || selectedBatches.length === 0)
        return defaultValues;

      const totalWeight = selectedBatches.reduce(
        (sum, b) => sum + (parseFloat(b.total_weight) || 0),
        0,
      );
      const totalPallets = selectedBatches.reduce(
        (sum, b) => sum + (parseInt(b.total_pallet) || 0),
        0,
      );

      const dimensionalWeight = totalPallets * 500;
      const effectiveWeight = Math.max(totalWeight, dimensionalWeight);
      const weightInTons = effectiveWeight / 1000;
      const PALLETS_PER_VEHICLE = 40;
      const vehicleCount = Math.ceil(totalPallets / PALLETS_PER_VEHICLE) || 1;

      let baseFee = 0,
        commodityFee = 0,
        serviceFee = 0,
        handlingFee = 0,
        fuelSurcharge = 0,
        vatFee = 0,
        finalTotal = 0,
        unitPrice = 0;

      const activeDistance =
        realDistance > 0
          ? realDistance
          : parseFloat(shippingConfig.distance) || 0;
      const priceConfig = selectedTransporter?.partner_company?.base_price;

      if (priceConfig && activeDistance > 0) {
        const baseVehiclePrice =
          parseFloat(priceConfig[`${shippingConfig.vehicleType}_base_price`]) ||
          0;
        baseFee = activeDistance * baseVehiclePrice * vehicleCount;

        const commodityRate =
          parseFloat(priceConfig[`${shippingConfig.commodityType}_fee`]) || 0;
        commodityFee = weightInTons * activeDistance * commodityRate;

        // Tính unitPrice để hiển thị UI (Phí sàn + Phí hàng)
        unitPrice =
          baseVehiclePrice +
          commodityRate * (weightInTons / activeDistance || 1);

        serviceFee = (baseFee + commodityFee) * 0.025;
        handlingFee = (totalWeight / 1000) * 30000;

        const subTotal = baseFee + commodityFee + serviceFee + handlingFee;
        const fuelRate =
          parseFloat(priceConfig.fuel_surcharge_percent || 0) / 100;
        fuelSurcharge = subTotal * fuelRate;

        const taxRate = parseFloat(priceConfig.tax_percent || 5) / 100;
        vatFee = (subTotal + fuelSurcharge) * taxRate;
        finalTotal = subTotal + fuelSurcharge + vatFee;

        const minPrice = parseFloat(priceConfig.min_price) || 0;
        if (finalTotal < minPrice) finalTotal = minPrice;
      }

      return {
        totalWeight,
        totalPallets,
        effectiveWeight,
        vehicleCount,
        baseFee,
        commodityFee,
        serviceFee,
        handlingFee,
        fuelSurcharge,
        vatFee,
        finalTotal,
        activeDistance,
        unitPrice, // TRẢ VỀ CHO UI
        hasRoadTax: totalWeight > 10000,
        isBulky: dimensionalWeight > totalWeight,
      };
    } catch (error) {
      console.error(">>> [LOGISTICS CALC ERROR]:", error);
      return defaultValues;
    }
  }, [selectedBatches, selectedTransporter, shippingConfig, realDistance]);

  if (isload)
    return (
      <div className="loader-full">
        <RocketLoad />
      </div>
    );

  return (
    <Container fluid className="aws-shipping-wrapper p-3 pb-5">
      <Otp_verify_dynamic
        show={modalstate}
        close={() => setmodalstate(false)}
        title={"XÁC THỰC VẬN ĐƠN"}
        message={
          "Ký số phê duyệt lệnh vận chuyển và ghi đè dữ liệu lên Blockchain?"
        }
        onSuccess={(code) =>
          api_request.sendShipingREquestAPI(
            User,
            code,
            calculation.unitPrice,
            calculation.finalTotal,
            shippingConfig.commodityType,
            shippingConfig.vehicleType,
            realDistance,
            getPartnerData(selectedTransporter)?.id,
            getPartnerData(selectedReceiver)?.id,
            selectedBatches,
          )
        }
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-aws-navy mb-1 text-uppercase">
            Điều Phối Vận Đơn On-Chain
          </h4>
          <p className="small text-muted mb-0">
            Tính toán quãng đường từ kho của bạn đến đối tác nhận hàng.
          </p>
        </div>
        <Badge bg="dark" className="p-2 fw-bold shadow-sm border-aws-orange">
          ID: {orderId}
        </Badge>
      </div>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3">
              <h6 className="mb-0 text-aws-orange fw-800">
                <FontAwesomeIcon icon={faTruck} className="me-2" /> 1. THÔNG TIN
                VẬN TẢI
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="tiny fw-bold text-muted text-uppercase">
                  CHỌN NHÀ VẬN TẢI
                </Form.Label>
                <Dropdown
                  onSelect={(id) =>
                    setSelectedTransporter(
                      shipinginfo.shipping.find((p) => p.id === id),
                    )
                  }
                >
                  <Dropdown.Toggle
                    as={Button}
                    variant="white"
                    className="aws-select-custom-toggle w-100 d-flex justify-content-between align-items-center shadow-none border text-start"
                  >
                    <div>
                      {selectedTransporter ? (
                        <>
                          <div
                            className="fw-bold text-aws-navy"
                            style={{ fontSize: "13px" }}
                          >
                            {getPartnerData(selectedTransporter)?.company_name}
                          </div>
                          <div
                            className="text-muted extra-small text-truncate"
                            style={{ maxWidth: "220px" }}
                          >
                            {getPartnerData(selectedTransporter)?.location}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted small">
                          -- Chọn nhà vận tải --
                        </span>
                      )}
                    </div>
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="ms-2 text-muted"
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="w-100 shadow-lg border-0 py-0 overflow-auto"
                    style={{ maxHeight: "300px" }}
                  >
                    {shipinginfo.shipping?.map((p) => (
                      <Dropdown.Item
                        key={p.id}
                        eventKey={p.id}
                        className="py-2 border-bottom-light"
                      >
                        <div className="fw-bold text-main small">
                          {getPartnerData(p)?.company_name}
                        </div>
                        <div className="text-muted extra-small">
                          {getPartnerData(p)?.location}
                        </div>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="tiny fw-bold text-muted text-uppercase">
                  CHỌN ĐIỂM ĐẾN (RECEIVER)
                </Form.Label>
                <Dropdown
                  onSelect={(id) =>
                    setSelectedReceiver(
                      shipinginfo.collaboration.find((p) => p.id === id),
                    )
                  }
                >
                  <Dropdown.Toggle
                    as={Button}
                    variant="white"
                    className="aws-select-custom-toggle w-100 d-flex justify-content-between align-items-center shadow-none border text-start"
                  >
                    <div>
                      {selectedReceiver ? (
                        <>
                          <div
                            className="fw-bold text-aws-navy"
                            style={{ fontSize: "13px" }}
                          >
                            {getPartnerData(selectedReceiver)?.company_name}
                          </div>
                          <div
                            className="text-muted extra-small text-truncate"
                            style={{ maxWidth: "220px" }}
                          >
                            {getPartnerData(selectedReceiver)?.location}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted small">
                          -- Chọn đối tác nhận hàng --
                        </span>
                      )}
                    </div>
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="ms-2 text-muted"
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="w-100 shadow-lg border-0 py-0 overflow-auto"
                    style={{ maxHeight: "300px" }}
                  >
                    {shipinginfo.collaboration?.map((p) => (
                      <Dropdown.Item
                        key={p.id}
                        eventKey={p.id}
                        className="py-2 border-bottom-light"
                      >
                        <div className="fw-bold text-main small">
                          {getPartnerData(p)?.company_name}
                        </div>
                        <div className="text-muted extra-small">
                          {getPartnerData(p)?.location}
                        </div>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              <div className="p-3 bg-aws-navy-light rounded mb-4 border-start border-3 border-aws-orange">
                <h6 className="tiny fw-bold text-aws-navy text-uppercase mb-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Lịch
                  trình yêu cầu
                </h6>
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Label className="extra-small fw-bold text-muted text-uppercase">
                      Ngày bốc hàng
                    </Form.Label>
                    <Form.Control
                      type="date"
                      className="form-control-sm border-aws-orange shadow-none"
                      value={shippingConfig.loadingDate}
                      onChange={(e) =>
                        setShippingConfig({
                          ...shippingConfig,
                          loadingDate: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Label className="extra-small fw-bold text-muted text-uppercase">
                      Ngày giao dự kiến
                    </Form.Label>
                    <Form.Control
                      type="date"
                      className="form-control-sm border-aws-orange shadow-none"
                      value={shippingConfig.deliveryDate}
                      onChange={(e) =>
                        setShippingConfig({
                          ...shippingConfig,
                          deliveryDate: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>
              </div>

              {selectedTransporter && (
                <div className="p-3 bg-light rounded border border-dashed">
                  <h6 className="tiny fw-bold text-aws-orange text-uppercase mb-3">
                    <FontAwesomeIcon icon={faCalculator} className="me-1" /> Chi
                    phí vận chuyển
                  </h6>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Label className="tiny text-muted">
                        LOẠI XE
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        className="aws-select-custom py-1"
                        value={shippingConfig.vehicleType}
                        onChange={(e) =>
                          setShippingConfig({
                            ...shippingConfig,
                            vehicleType: e.target.value,
                          })
                        }
                      >
                        <option value="truck_closed">Thùng kín</option>
                        <option value="refrigerated">Xe Lạnh</option>
                        <option value="container">Container</option>
                        <option value="truck_open">Thùng bạt</option>
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Label className="tiny text-muted">
                        LOẠI HÀNG
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        className="aws-select-custom py-1"
                        value={shippingConfig.commodityType}
                        onChange={(e) =>
                          setShippingConfig({
                            ...shippingConfig,
                            commodityType: e.target.value,
                          })
                        }
                      >
                        <option value="general">Phổ thông</option>
                        <option value="garment">May mặc</option>
                        <option value="electronics">Điện tử</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12} className="mt-2">
                      <Form.Label className="tiny text-muted">
                        KHOẢNG CÁCH (KM)
                      </Form.Label>
                      <InputGroup size="sm">
                        <InputGroup.Text className="bg-white border-end-0">
                          <FontAwesomeIcon icon={faRoad} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          className="border-start-0 fw-bold text-aws-navy"
                          value={`${(realDistance || shippingConfig.distance).toLocaleString()} km`}
                          readOnly
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                  <div className="mt-3 pt-2 border-top">
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Đơn giá cơ bản:</span>
                      <span className="fw-bold text-dark">
                        {(calculation?.unitPrice || 0).toLocaleString()}đ/km
                      </span>
                    </div>
                    {calculation.hasRoadTax && (
                      <div className="tiny text-danger italic">
                        * +5% Phí tải trọng đường bộ
                      </div>
                    )}
                    <div className="d-flex h6 mt-1 text-aws-navy fw-800">
                      <span>TỔNG PHÍ:</span>
                      <span className="text-aws-orange ps-2">
                        {calculation.finalTotal.toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-aws-navy fw-800">
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="me-2 text-aws-orange"
                />{" "}
                2. DANH SÁCH LÔ HÀNG KHẢ DỤNG
              </h6>
              <Badge bg="success" className="rounded-pill px-3">
                On-Chain Verified
              </Badge>
            </Card.Header>
            <div className="table-responsive" style={{ maxHeight: "450px" }}>
              <Table hover className="align-middle mb-0 aws-table">
                <thead className="bg-light sticky-top">
                  <tr className="tiny text-muted text-uppercase">
                    <th className="ps-4">Chọn</th>
                    <th>Mã Lô</th>
                    <th>Tên Sản Phẩm</th>
                    <th className="text-center">Trọng Lượng</th>
                    <th className="text-center">QC Pass</th>
                  </tr>
                </thead>
                <tbody>
                  {shipinginfo.complate_batched.map((batch) => {
                    const active = selectedBatches.some(
                      (b) => b.id === batch.id,
                    );
                    return (
                      <tr
                        key={batch.id}
                        onClick={() => toggleBatch(batch)}
                        className={
                          active
                            ? "aws-row-active cursor-pointer"
                            : "cursor-pointer"
                        }
                      >
                        <td className="ps-4">
                          <FontAwesomeIcon
                            icon={active ? faCheckSquare : faSquare}
                            className={
                              active
                                ? "text-aws-orange h5 mb-0"
                                : "text-light-gray h5 mb-0"
                            }
                          />
                        </td>
                        <td>
                          <code className="text-aws-orange fw-bold">
                            {batch.id}
                          </code>
                        </td>
                        <td>
                          <div className="fw-bold text-aws-navy small">
                            {batch.batch_name}
                          </div>
                          <div className="tiny text-muted">
                            <FontAwesomeIcon
                              icon={faHistory}
                              className="me-1"
                            />
                            {new Date(batch.updatedAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </div>
                        </td>
                        <td className="text-center fw-bold">
                          {batch.total_weight} kg
                        </td>
                        <td className="text-center text-success fw-bold">
                          {batch.QC_Pass.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>

      {selectedReceiver &&
        (() => {
          const destInfo = getPartnerData(selectedReceiver);
          const oLng = parseFloat(shipinginfo?.MyCompany?.longitude);
          const oLat = parseFloat(shipinginfo?.MyCompany?.latitude);
          const dLng = parseFloat(destInfo?.longitude);
          const dLat = parseFloat(destInfo?.latitude);

          console.log(oLng, oLat, dLng, dLat);
          const isValidCoords =
            !isNaN(oLng) && !isNaN(oLat) && !isNaN(dLng) && !isNaN(dLat);

          if (!isValidCoords) {
            return (
              <div className="mt-4 p-4 bg-soft-danger rounded border border-danger text-center">
                <p className="small mb-0 text-danger fw-bold">
                  ⚠️ Không thể xác định tọa độ GPS. Vui lòng kiểm tra lại cấu
                  hình vị trí doanh nghiệp!
                </p>
              </div>
            );
          }

          return (
            <div
              className="mt-4 rounded shadow-sm overflow-hidden border border-aws-orange"
              style={{ height: "400px" }}
            >
              <MapDirectionPreview
                origin={[oLng, oLat]}
                destination={[dLng, dLat]}
                onRouteCalculated={handleRouteInfo}
              />
            </div>
          );
        })()}

      <div className="aws-shipping-footer shadow-lg fixed-bottom">
        <Container fluid className="px-4">
          <Row className="align-items-center py-2">
            <Col lg={9} md={12}>
              <div className="d-flex align-items-center flex-wrap gap-3 gap-lg-4 summary-container text-white">
                <div className="summary-item">
                  <span className="label small opacity-50 text-uppercase">
                    Trọng tải
                  </span>
                  <div
                    className={`value ${calculation.isBulky ? "text-danger fw-800" : "text-white"}`}
                  >
                    {(calculation.totalWeight / 1000).toFixed(2)}{" "}
                    <small className="opacity-50">Tấn</small>
                    {calculation.isBulky && (
                      <span className="ms-1 tiny" style={{ fontSize: "10px" }}>
                        (Cồng kềnh)
                      </span>
                    )}
                  </div>
                </div>

                {/* Mới: Bổ sung số lượng Pallet */}
                <div className="summary-item d-none d-sm-block">
                  <span className="label small opacity-50 text-uppercase">
                    Quy cách
                  </span>
                  <div className="value">
                    {calculation.totalPallets}{" "}
                    <small className="opacity-50">Pallet</small>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="label small opacity-50 text-uppercase">
                    Đội xe
                  </span>
                  <div className="value">
                    {calculation.vehicleCount}{" "}
                    <small className="opacity-50">
                      Xe{" "}
                      {shippingConfig.vehicleType.includes("truck")
                        ? "Tải"
                        : "Cont"}
                      {` (Ước lượng, số lượng xe có thể khác thực tế!)`}
                    </small>
                  </div>
                </div>

                <div className="summary-item">
                  <span className="label small opacity-50 text-uppercase">
                    Quãng đường
                  </span>
                  <div className="value">
                    {calculation.activeDistance.toFixed(1)}{" "}
                    <small className="opacity-50">km</small>
                  </div>
                </div>

                {/* Divider nhẹ để ngăn cách với phần tiền */}
                <div
                  className="summary-divider d-none d-lg-block"
                  style={{
                    width: "1px",
                    height: "30px",
                    background: "rgba(255,255,255,0.1)",
                  }}
                ></div>

                <div className="summary-item ms-lg-auto">
                  <span className="label small opacity-50 text-uppercase text-aws-orange">
                    Tổng cước phí On-Chain
                  </span>
                  <div className="value text-aws-orange h5 mb-0 fw-800">
                    {calculation.finalTotal.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </Col>

            <Col
              lg={3}
              md={12}
              className="text-center text-lg-end mt-2 mt-lg-0"
            >
              <Button
                disabled={
                  !selectedTransporter ||
                  !selectedReceiver ||
                  selectedBatches.length === 0
                }
                className="aws-btn-final py-2 px-4 rounded-pill shadow-none w-100 w-lg-auto"
                onClick={() => setmodalstate(true)}
              >
                <FontAwesomeIcon icon={faSignature} className="me-2" /> KÝ DUYỆT
                XUẤT KHO
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </Container>
  );
};

export default NewShipingOrder;
