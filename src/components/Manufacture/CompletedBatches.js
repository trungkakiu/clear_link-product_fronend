import React, { useEffect, useState, useContext } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Image,
  Container,
  Form,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faLink,
  faCheckDouble,
  faCertificate,
  faSearch,
  faSyncAlt,
  faInbox,
} from "@fortawesome/free-solid-svg-icons";
import "../../scss/volt/components/Manufacture/CompletedBatches.scss";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import RocketLoad from "../../Utils/RocketLoad";
import { toast } from "react-toastify";
import Otp_verify_dynamic from "../Modal/Otp_verify_dynamic";
import BatchDetailModal from "../Modal/Manufacture/DepartmentDetailModal";
import BatchViewDetailModal from "../Modal/Manufacture/BatchViewDetailModal";

const CompletedBatches = () => {
  const { User } = useContext(UserContext);
  const [isLoad, setIsLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("qc_passed");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedbatch, setselectedbatch] = useState(null);
  const [batchData, setBatchData] = useState({
    pending: [],
    pairing: [],
    completed: [],
    qc_passed: [],
  });

  const [modalstate, setmodalstate] = useState(false);
  const [detailbatch, setdetailbatch] = useState(false);

  const complateBatched = async (challen_code) => {
    try {
      const res = await api_request.complateBatchedAPI(
        User,
        challen_code,
        selectedbatch,
      );
      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        RM: "Lỗi hệ thống!",
        RC: 500,
      };
    }
  };
  const fetchAllBatches = async () => {
    try {
      setIsLoad(true);
      const res = await api_request.getCompletedBatches(User);
      if (res.RC === 200) setBatchData(res.RD);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setIsLoad(false), 600);
    }
  };

  useEffect(() => {
    fetchAllBatches();
  }, []);

  const statusConfigs = [
    {
      key: "qc_passed",
      label: "Chờ Xác Nhận",
      icon: faCheckDouble,
      color: "#ff9900",
    },
    { key: "pending", label: "Chờ Lên Chain", icon: faClock, color: "#007bff" },
    { key: "pairing", label: "Đang Đồng Bộ", icon: faLink, color: "#17a2b8" },
    {
      key: "completed",
      label: "Đã Hoàn Thành",
      icon: faCertificate,
      color: "#28a745",
    },
  ];

  const currentList =
    batchData[activeTab]?.filter(
      (b) =>
        b.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.includes(searchTerm),
    ) || [];

  if (isLoad)
    return (
      <div className="loader-container">
        <RocketLoad />
      </div>
    );

  return (
    <div className="aws-warehouse-wrapper p-3">
      <BatchViewDetailModal
        batch={selectedbatch}
        onHide={() => setdetailbatch(false)}
        show={detailbatch}
        closeReload={() => {
          setdetailbatch(false);
          fetchAllBatches();
        }}
      />
      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        closeReload={() => {
          setmodalstate(false);
          fetchAllBatches();
        }}
        message={
          "Xác nhận mã PIN để đưa sản phẩm lên hệ thống, lưu ý sản phẩm on-chain không thể thay đổi!"
        }
        onSuccess={(chllange_code) => {
          return complateBatched(chllange_code);
        }}
        show={modalstate}
        title={"PIN VERIFY"}
      />
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h4 className="fw-bold text-aws-navy m-0 border-start border-4 border-aws-orange ps-3">
          Kho Tổng Hợp
        </h4>
        <div className="d-flex gap-2 w-100 w-md-auto">
          <InputGroup className="aws-search-bar shadow-sm">
            <InputGroup.Text className="bg-white border-0">
              <FontAwesomeIcon icon={faSearch} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm kiếm nhanh..."
              className="border-0 shadow-none py-2"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button
            variant="white"
            className="border shadow-sm"
            onClick={fetchAllBatches}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4 flex-nowrap overflow-auto pb-2 scrollbar-hidden">
        {statusConfigs.map((status) => (
          <Col xs={8} md={3} key={status.key}>
            <div
              className={`aws-status-tab ${activeTab === status.key ? "active" : ""}`}
              onClick={() => setActiveTab(status.key)}
            >
              <div className="tab-icon" style={{ color: status.color }}>
                <FontAwesomeIcon icon={status.icon} />
              </div>
              <div className="tab-content">
                <div className="tab-label small fw-bold text-muted">
                  {status.label}
                </div>
                <div className="tab-count h5 fw-800 m-0">
                  {batchData[status.key]?.length || 0}
                </div>
              </div>
              {activeTab === status.key && (
                <div
                  className="active-indicator"
                  style={{ backgroundColor: status.color }}
                ></div>
              )}
            </div>
          </Col>
        ))}
      </Row>

      <div className="aws-content-area">
        <Row className="g-3">
          {currentList.length > 0 ? (
            currentList.map((batch) => (
              <Col xs={12} sm={6} lg={4} xxl={3} key={batch.id}>
                <Card className="aws-batch-card border-0 shadow-sm h-100">
                  <Card.Body className="p-3">

                    <div className="d-flex gap-3 align-items-start mb-3">
                      <Image
                        src={`${process.env.REACT_APP_API_IMAGE_URL}main-card/${batch.product?.main_cardimage}`}
                        className="batch-thumbnail rounded border"
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <div
                          className="small fw-bold text-aws-orange text-truncate"
                          style={{ maxWidth: "160px" }} 
                          title={batch.id} 
                        >
                          #{batch.id}
                        </div>
                        <div
                          title={batch.product?.name || "N/A"}
                          className="fw-bold text-aws-navy text-truncate"
                        >
                          {batch.product?.name || "N/A"}
                        </div>
                        <Badge
                          bg="light"
                          className="text-muted border extra-small"
                        >
                          {batch.Department?.partname}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-light p-2 rounded mb-3">
                      <div className="d-flex justify-content-between small">
                        <span>Sản phẩm đạt:</span>
                        <span className="fw-bold text-success">
                          {batch.QC_Pass}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span>Sản phẩm lỗi:</span>
                        <span className="fw-bold text-danger">
                          {batch.QC_Failed}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {" "}
                      {activeTab === "qc_passed" && (
                        <>
                          <Button
                            variant="outline-gray-500"
                            className="aws-btn-sm-outline fw-bold py-2 flex-grow-1"
                            onClick={() => {
                              setdetailbatch(true);
                              setselectedbatch(batch);
                            }}
                          >
                            <i className="fas fa-eye me-1"></i> CHI TIẾT
                          </Button>
                          <Button
                            className="aws-btn-sm fw-bold border-0 btn-warning text-white py-2 flex-grow-1"
                            onClick={() => {
                              setmodalstate(true);
                              setselectedbatch(batch.id);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCheckDouble}
                              className="me-1"
                            />{" "}
                            XÁC NHẬN
                          </Button>
                        </>
                      )}
                      {activeTab === "pending" && (
                        <>
                          <Button
                            variant="outline-gray-500"
                            className="aws-btn-sm-outline fw-bold py-2 flex-grow-1"
                            onClick={() => {
                              setdetailbatch(true);
                              setselectedbatch(batch);
                            }}
                          >
                            <i className="fas fa-eye me-1"></i> CHI TIẾT
                          </Button>
                          <Button
                            disabled
                            className="aws-btn-sm fw-bold border-0 btn-secondary py-2 flex-grow-1"
                          >
                            <i className="fas fa-hourglass-half me-1"></i> ĐỢI
                            QUEUE
                          </Button>
                        </>
                      )}
                      {activeTab === "pairing" && (
                        <>
                          <Button
                            variant="outline-gray-500"
                            className="aws-btn-sm-outline fw-bold py-2 flex-grow-1"
                            onClick={() => {
                              setdetailbatch(true);
                              setselectedbatch(batch);
                            }}
                          >
                            <i className="fas fa-eye me-1"></i> CHI TIẾT
                          </Button>
                          <Button
                            disabled
                            className="aws-btn-sm fw-bold border-0 btn-info text-white py-2 flex-grow-1"
                          >
                            <i className="fas fa-sync fa-spin me-1"></i> ĐANG
                            KÝ...
                          </Button>
                        </>
                      )}
                      {activeTab === "completed" && (
                        <Button
                          onClick={() => {
                            setdetailbatch(true);
                            setselectedbatch(batch);
                          }}
                          className="aws-btn-sm fw-bold border-0 btn-success py-2 w-100" 
                        >
                          <FontAwesomeIcon
                            icon={faCertificate}
                            className="me-2"
                          />{" "}
                          CHỨNG CHỈ BLOCKCHAIN
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5 bg-white rounded border border-dashed">
                <FontAwesomeIcon
                  icon={faInbox}
                  size="3x"
                  className="text-gray-200 mb-3"
                />
                <h6 className="text-muted">
                  Không có lô hàng nào "
                  {statusConfigs.find((s) => s.key === activeTab).label}"
                </h6>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default CompletedBatches;
