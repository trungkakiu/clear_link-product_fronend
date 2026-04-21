import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Modal,
  Table,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSitemap,
  faTruck,
  faGasPump,
  faWallet,
  faMapMarkedAlt,
  faUserTie,
  faCalendarAlt,
  faInfoCircle,
  faChevronRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import RocketLoad from "../../Utils/RocketLoad";
import "../../scss/volt/components/Transporter/FleetsPage.scss";

const FleetsPage = () => {
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [fleets, setfleets] = useState([]);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const truck_cate = {
    container: "Container",
    tanker: "Xe bồn chứa",
    refrigerated: "Xe lạnh",
    truck_closed: "Xe thùng kín",
    truck_open: "Xe thùng mở",
    dump_truck: "Xe ben",
    passenger: "Xe khách",
    crane_truck: "Xe cẩu tự hành",
    flatbed: "Xe sàn phẳng",
  };
  const fetchFleet = async () => {
    try {
      setisload(true);
      const res = await api_request.fetchFleets(User);
      if (res?.RC === 200) setfleets(res.RD);
    } catch (error) {
      toast.error("Lỗi hệ thống!");
    } finally {
      setisload(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleOpenDetail = (fleet) => {
    setSelectedFleet(fleet);
    setShowModal(true);
  };

  if (isload) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "75vh" }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <div className="aws-fleets-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 px-3">
        <h4 className="fw-800 text-aws-navy m-0">
          <FontAwesomeIcon icon={faSitemap} className="me-2 text-aws-orange" />
          Quản lý Đội xe ({fleets.length})
        </h4>
        <Button className="aws-btn-orange">
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Tạo Đội Xe
        </Button>
      </div>

      <Row className="px-2">
        {fleets.map((fleet) => (
          <Col key={fleet.id} xl={4} md={6} className="mb-4">
            <Card className="fleet-preview-card border-0 shadow-sm h-100">
              <Card.Header className="bg-aws-navy text-white d-flex justify-content-between align-items-center border-0">
                <span className="fw-bold small">{fleet.fleet_code}</span>
                <Badge bg="aws-orange" className="text-white">
                  {fleet.fleet_type === "dry_cargo" ? "Hàng khô" : "Đặc biệt"}
                </Badge>
              </Card.Header>
              <Card.Body className="p-3">
                <h5 className="fw-800 text-main mb-3">{fleet.fleet_name}</h5>

                <div className="fleet-stats-grid mb-3">
                  <div className="stat-item">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-muted me-2"
                    />
                    <span>
                      <strong>{fleet.Vehicles?.length || 0}</strong> xe
                    </span>
                  </div>
                  <div className="stat-item text-end">
                    <FontAwesomeIcon
                      icon={faGasPump}
                      className="text-muted me-2"
                    />
                    <span>
                      <strong>{fleet.fuel_norm_average}</strong> L/100km
                    </span>
                  </div>
                </div>

                <div className="operation-area-preview mb-3">
                  <div className="aws-label mb-1">Khu vực vận hành:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {fleet.operation_area?.slice(0, 3).map((area) => (
                      <Badge key={area} bg="light" className="text-dark border">
                        {area}
                      </Badge>
                    ))}
                    {fleet.operation_area?.length > 3 && (
                      <span className="small text-muted">
                        +{fleet.operation_area.length - 3}...
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <div>
                    <div className="aws-label">Ngân sách tháng</div>
                    <div className="fw-bold text-success">
                      {new Intl.NumberFormat("vi-VN").format(
                        fleet.monthly_budget,
                      )}{" "}
                      VNĐ
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="text-aws-orange p-0 fw-bold text-decoration-none"
                    onClick={() => handleOpenDetail(fleet)}
                  >
                    Chi tiết{" "}
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="ms-1 small"
                    />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MODAL CHI TIẾT ĐỘI XE */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="aws-modal"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6 fw-bold">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            Chi tiết Đội xe: {selectedFleet?.fleet_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-0">
          <div className="p-4 bg-white border-bottom">
            <Row>
              <Col md={6}>
                <p className="small mb-1 text-muted">
                  Mã định danh: <strong>{selectedFleet?.fleet_code}</strong>
                </p>
                <p className="small mb-1 text-muted">
                  Quản lý:{" "}
                  <strong>
                    {selectedFleet?.manager_name || "Chưa cập nhật"}
                  </strong>
                </p>
              </Col>
              <Col md={6} className="text-md-end">
                <p className="small mb-1 text-muted">
                  Ngày tạo:{" "}
                  {new Date(selectedFleet?.createdAt).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>
                <Badge bg="success">Đang hoạt động</Badge>
              </Col>
            </Row>
          </div>

          <div className="p-4">
            <h6 className="fw-800 mb-3 text-aws-navy">
              Danh sách phương tiện ({selectedFleet?.Vehicles?.length})
            </h6>
            <div className="table-responsive bg-white rounded shadow-sm">
              <Table className="table-centered table-nowrap mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 small fw-bold">BIỂN SỐ</th>
                    <th className="border-0 small fw-bold">LOẠI XE</th>
                    <th className="border-0 small fw-bold">DANH MỤC</th>
                    <th className="border-0 small fw-bold">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFleet?.Vehicles?.map((v) => (
                    <tr key={v.id}>
                      <td className="fw-bold text-aws-orange">
                        {v.plate_number}
                      </td>
                      <td className="small text-uppercase">
                        {truck_cate[v.vehicle_category]}
                      </td>
                      <td className="small text-uppercase">{v.vehicle_type}</td>
                      <td>
                        <Badge bg="success" pill>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button className="aws-btn-orange">Chỉnh sửa đội xe</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FleetsPage;
