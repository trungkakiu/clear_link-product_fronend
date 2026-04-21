import React, { useContext, useEffect, useState } from "react";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  InputGroup,
  Container,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faBoxOpen,
  faGasPump,
  faPercentage,
  faSave,
  faWallet,
  faTools,
  faCalculator,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/Transporter/ShippingPriceSettings.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import Otp_verify_dynamic from "../Modal/Otp_verify_dynamic";

const PriceInput = ({
  label,
  name,
  icon,
  config,
  handleInputChange,
  unit = "VNĐ/Km",
}) => (
  <Form.Group className="mb-3">
    <Form.Label className="tiny fw-bold text-uppercase text-muted mb-1">
      {label}
    </Form.Label>
    <InputGroup className="aws-input-group shadow-none">
      <InputGroup.Text className="bg-light border-end-0 py-1">
        <FontAwesomeIcon icon={icon} className="text-aws-orange small" />
      </InputGroup.Text>
      <Form.Control
        type="number"
        name={name}
        value={config[name] !== undefined ? config[name] : 0}
        onChange={handleInputChange}
        className="fw-bold border-start-0 ps-1 py-1 text-aws-navy"
      />
      <InputGroup.Text className="bg-white border-start-0 tiny text-muted fw-bold">
        {unit}
      </InputGroup.Text>
    </InputGroup>
  </Form.Group>
);

const ShippingPriceSettings = () => {
  const [config, setConfig] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [modalstate, setmodalstate] = useState(false);

  useEffect(() => {
    getPricedata();
  }, []);

  const getPricedata = async () => {
    try {
      setisload(true);
      const res = await api_request.getPricedataAPI(User);
      if (res && res.RC === 200) {
        setConfig(res.RD);
      } else {
        toast.error(res?.RM || "Không thể tải bảng giá");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối API!");
    } finally {
      setisload(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value === "" ? "" : parseFloat(value) });
  };

  const set_price_data = async (challange_code) => {
    try {
      setIsUpdating(true);
      const res = await api_request.set_new_shipping(
        User,
        challange_code,
        config,
      );
      if (res) {
        if (res.RC === 200) {
          setConfig(res.RD);
          setmodalstate(false);
        } else {
          toast.error(res?.RM || "Cập nhật thất bại");
        }
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống khi lưu dữ liệu!");
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container className="py-4 aws-shipping-config">
      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => setmodalstate(false)}
        message={
          "Xác nhận thay đổi đơn giá vận chuyển? Hành động này sẽ được ghi vết trên Blockchain."
        }
        onSuccess={(challange_code) => {
          return set_price_data(challange_code);
        }}
        show={modalstate}
        title={"XÁC THỰC GIAO DỊCH"}
      />

      <Row className="mb-4 align-items-end">
        <Col>
          <div className="d-flex align-items-center mb-1">
            <div className="aws-icon-box me-3">
              <FontAwesomeIcon icon={faTools} />
            </div>
            <div>
              <h4 className="fw-800 text-aws-navy mb-0">
                Ma trận Đơn giá Vận tải
              </h4>
              <p className="text-muted small mb-0">
                Cấu hình đơn giá theo Km cho phương tiện và loại hàng hóa.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* CỘT 1: ĐƠN GIÁ THEO XE */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom border-light p-4">
              <h6 className="fw-bold text-aws-navy mb-0">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="me-2 text-aws-orange"
                />
                Đơn giá theo Phương tiện
              </h6>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col sm={6}>
                  <PriceInput
                    label="Container"
                    name="container_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Bồn"
                    name="tanker_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Lạnh"
                    name="refrigerated_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Thùng Kín"
                    name="truck_closed_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Thùng Bạt"
                    name="truck_open_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                </Col>
                <Col sm={6}>
                  <PriceInput
                    label="Xe Ben"
                    name="dump_truck_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Khách"
                    name="passenger_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Cẩu"
                    name="crane_truck_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <PriceInput
                    label="Xe Sàn"
                    name="flatbed_base_price"
                    icon={faTruck}
                    config={config}
                    handleInputChange={handleInputChange}
                  />
                  <div className="bg-light rounded p-3 text-center mt-2 border border-dashed">
                    <div className="tiny text-muted fw-bold text-uppercase">
                      Tình trạng hệ thống
                    </div>
                    <div className="small fw-bold text-success mt-1">
                      ● Đã kết nối On-chain
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            {/* NÚT LƯU ĐẶT Ở ĐÂY ĐỂ CÂN BẰNG CARD */}
            <Card.Footer className="bg-gray-50 border-top border-light py-3 px-4 d-flex justify-content-end align-items-center">
              <small className="text-muted me-3 italic">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                Thay đổi sẽ có hiệu lực ngay lập tức trên TraceChain
              </small>
              <Button
                variant="aws-orange"
                className="px-5 shadow-sm fw-bold rounded-pill btn-loading-transition"
                onClick={() => setmodalstate(true)}
                disabled={isUpdating}
                style={{ minWidth: "200px" }}
              >
                {isUpdating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang đồng bộ...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Cập nhật bảng giá
                  </>
                )}
              </Button>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={6}>
          <div className="d-flex flex-column h-100">
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white border-bottom border-light p-4">
                <h6 className="fw-bold text-aws-navy mb-0">
                  <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="me-2 text-aws-orange"
                  />
                  Phụ phí theo Loại hàng (VNĐ/Km)
                </h6>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col sm={6}>
                    <PriceInput
                      label="Hàng điện tử"
                      name="electronics_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                    <PriceInput
                      label="Thực phẩm"
                      name="food_beverage_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                    <PriceInput
                      label="Hóa chất"
                      name="chemicals_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                  </Col>
                  <Col sm={6}>
                    <PriceInput
                      label="Hàng y tế"
                      name="medical_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                    <PriceInput
                      label="Vật liệu XD"
                      name="construction_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                    <PriceInput
                      label="Hàng may mặc"
                      name="garment_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                  </Col>
                  <Col sm={12}>
                    <PriceInput
                      label="Hàng thường"
                      name="general_fee"
                      icon={faBoxOpen}
                      config={config}
                      handleInputChange={handleInputChange}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm bg-aws-navy text-white flex-grow-1">
              <Card.Body className="p-4 d-flex flex-column justify-content-center">
                <h6
                  className="fw-bold mb-4 text-aws-orange border-bottom border-secondary pb-2 text-uppercase tiny"
                  style={{ letterSpacing: "1px" }}
                >
                  <FontAwesomeIcon icon={faPercentage} className="me-2" />
                  Tham số điều chỉnh hệ thống
                </h6>
                <Row className="g-4">
                  <Col xs={6}>
                    <Form.Label className="tiny fw-bold text-uppercase opacity-7">
                      Phụ phí xăng dầu
                    </Form.Label>
                    <InputGroup className="aws-dark-input shadow-none">
                      <InputGroup.Text className="bg-transparent border-0 text-aws-orange">
                        <FontAwesomeIcon icon={faGasPump} />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        className="bg-transparent border-0 text-white fw-bold"
                        name="fuel_surcharge_percent"
                        value={config.fuel_surcharge_percent || 0}
                        onChange={handleInputChange}
                      />
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        %
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col xs={6}>
                    <Form.Label className="tiny fw-bold text-uppercase opacity-7">
                      Thuế VAT
                    </Form.Label>
                    <InputGroup className="aws-dark-input shadow-none">
                      <InputGroup.Text className="bg-transparent border-0 text-aws-orange">
                        <FontAwesomeIcon icon={faWallet} />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        className="bg-transparent border-0 text-white fw-bold"
                        name="tax_percent"
                        value={config.tax_percent || 0}
                        onChange={handleInputChange}
                      />
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        %
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col xs={12}>
                    <Form.Label className="tiny fw-bold text-uppercase opacity-7">
                      {`Phí mở sàn ( < ${config.min_distance} KM )`}
                    </Form.Label>
                    <InputGroup className="aws-dark-input shadow-none">
                      <InputGroup.Text className="bg-transparent border-0 text-aws-orange">
                        <FontAwesomeIcon icon={faWallet} />
                      </InputGroup.Text>
                      <Form.Control
                        type="number"
                        className="bg-transparent border-0 text-white fw-bold"
                        name="min_price"
                        value={config.min_price || 0}
                        onChange={handleInputChange}
                      />
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        VNĐ/LẦN
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                </Row>

                <div className="mt-4 p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center small">
                    <FontAwesomeIcon
                      icon={faCalculator}
                      className="me-2 text-aws-orange"
                    />
                    <span
                      className="opacity-75 italic text-uppercase tiny"
                      style={{ fontSize: "10px" }}
                    >
                      Công thức: (Đơn giá xe + Phụ phí hàng) × Km × Xăng dầu ×
                      Thuế
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ShippingPriceSettings;
