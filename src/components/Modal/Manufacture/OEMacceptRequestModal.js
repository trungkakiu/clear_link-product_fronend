import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faLayerGroup,
  faUserCircle,
  faCalendarAlt,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import moment from "moment";
import api_request from "../../../apicontroller/api_request";
import { toast } from "react-toastify";
import { UserContext } from "../../../Context/UserContext";
import Otp_verify_dynamic from "../Otp_verify_dynamic";

const OEMacceptRequestModal = ({ show, close, closeRefresh, data }) => {
  const [department, setdepartment] = useState([]);
  const { User } = useContext(UserContext);
  const [isload, setisload] = useState(false);
  const [apiWait, setapiWait] = useState(false);
  const [modalState, setmodalstate] = useState(false);
  const [batchData, setBatchData] = useState({
    batch_name: "",
    Department_id: "",
    description: "",
    manufacture_date: "",
    expiry_date: "",
    quantity: 0,
  });

  useEffect(() => {
    if (show && data) {
      departMent();

      const productObj = data.product_pinner;
      const quantity = data.Quantity;
      const startDate = data.Start_date;
      const endDate = data.End_date;

      setBatchData({
        batch_name: `BATCH_OEM_${moment().format("YYMMDD")}_${productObj?.name
          ?.substring(0, 5)
          .toUpperCase()}`,
        Department_id: "",
        description: `Gia công OEM cho sản phẩm ${productObj?.name || ""}`,
        quantity: quantity || 0,
        manufacture_date: startDate
          ? moment(startDate).format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD"),
        expiry_date: endDate
          ? moment(endDate).format("YYYY-MM-DD")
          : moment().add(7, "days").format("YYYY-MM-DD"),
      });
    }
  }, [show, data]);

  const departMent = async () => {
    try {
      setisload(true);
      const res = await api_request.departMentOEM(User);
      if (res && res.RC === 200) {
        setdepartment(res.RD);
      }
    } catch (error) {
      toast.error("Lỗi tải danh sách bộ phận!");
    } finally {
      setisload(false);
    }
  };

  const handleAccept = async (challenge_code) => {
    if (!batchData.Department_id) {
      return toast.warning("Vui lòng chọn bộ phận sản xuất!");
    }
    try {
      setapiWait(true);
      const res = await api_request.acceptOEMProduction(User, challenge_code, {
        ...batchData,
        product_id: data?.product_id,
        Pinned_id: data?.id,
        isOEM: true,
        author: User.company_id,
      });

      if (res) {
        return {
          RM: res.RM,
          RC: res.RC,
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
      return {
        RM: "Lỗi Hệ thống!",
        RC: 500,
      };
    } finally {
      setapiWait(false);
    }
  };

  const departmentOptions = department.map((d) => ({
    value: d.id,
    label: d.partname,
    leader: d.leader?.name,
    part: d.part,
  }));

  const formatOptionLabel = ({ label, leader, part }) => (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-bold small">{label}</div>
        <div className="x-small text-muted">
          <FontAwesomeIcon icon={faUserCircle} className="me-1" />
          {leader || "Chưa có quản lý"}
        </div>
      </div>
      <Badge bg="soft-primary" className="text-primary x-small">
        {part}
      </Badge>
    </div>
  );

  return (
    <Modal centered show={show} onHide={close} size="lg" className="aws-modal">
      <Otp_verify_dynamic
        close={() => setmodalstate(false)}
        show={modalState}
        title={"PIN OEM"}
        closeReload={() => {
          setmodalstate(false);
          closeRefresh();
        }}
        message={
          "Bằng việc xác nhận mã PIN, bạn sẽ chấp nhận sản xuất theo đơn yêu cầu!"
        }
        onSuccess={(challen_code) => {
          return handleAccept(challen_code);
        }}
      />
      <Modal.Header className="border-0 p-4 pb-0">
        <Modal.Title className="fw-bold text-main">
          <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
          Xác nhận Gia công & Tạo lô sản xuất
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {data ? (
          <>
            <div className="p-3 bg-light rounded-3 mb-4 border-dashed">
              <Row>
                <Col md={6}>
                  <small className="text-muted d-block">
                    Sản phẩm gia công:
                  </small>
                  <span className="fw-bold text-main">
                    {data.product_pinner?.name}
                  </span>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Số lượng đặt:</small>
                  <span className="fw-bold text-aws-orange">
                    {data.Quantity} cái
                  </span>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Thời hạn gốc:</small>
                  <span className="fw-bold text-dark">
                    {data.End_date
                      ? moment(data.End_date).format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </Col>
              </Row>
            </div>

            <Form>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-bold small">
                    <FontAwesomeIcon icon={faHashtag} className="me-1" />
                    Tên lô hàng (Batch Name)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={batchData.batch_name}
                    onChange={(e) =>
                      setBatchData({ ...batchData, batch_name: e.target.value })
                    }
                    className="aws-input-soft"
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-bold small">
                    <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
                    Bộ phận sản xuất
                  </Form.Label>
                  <Select
                    options={departmentOptions}
                    formatOptionLabel={formatOptionLabel}
                    placeholder="Chọn bộ phận..."
                    onChange={(opt) =>
                      setBatchData({ ...batchData, Department_id: opt.value })
                    }
                    isLoading={isload}
                  />
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-bold small">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                    Ngày bắt đầu sản xuất
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={batchData.manufacture_date}
                    onChange={(e) =>
                      setBatchData({
                        ...batchData,
                        manufacture_date: e.target.value,
                      })
                    }
                    className="aws-input-soft"
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-bold small">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                    Ngày dự kiến hoàn thành
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={batchData.expiry_date}
                    onChange={(e) =>
                      setBatchData({
                        ...batchData,
                        expiry_date: e.target.value,
                      })
                    }
                    className="aws-input-soft"
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small">Mô tả lô hàng</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={batchData.description}
                  onChange={(e) =>
                    setBatchData({ ...batchData, description: e.target.value })
                  }
                  className="aws-input-soft"
                  placeholder="Thông tin thêm về lô hàng này..."
                />
              </Form.Group>
            </Form>
          </>
        ) : (
          <div className="text-center p-4">Đang tải dữ liệu...</div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4 pt-0">
        <Button variant="link" className="text-muted ms-auto" onClick={close}>
          Hủy bỏ
        </Button>
        <Button
          variant="success"
          className="px-4 text-white shadow-sm fw-bold"
          onClick={() => setmodalstate(true)}
          disabled={
            apiWait ||
            !data ||
            !batchData.Department_id ||
            !batchData.batch_name
          }
        >
          {apiWait ? "Đang xử lý..." : "Xác nhận & Bắt đầu sản xuất"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OEMacceptRequestModal;
