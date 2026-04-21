import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Image,
  Badge,
  Card,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileSignature,
  faBox,
  faStore,
  faHandHoldingUsd,
  faClock,
  faSpinner,
  faInfoCircle,
  faSearch,
  faReceipt,
  faBarcode,
  faWallet,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import "../../../scss/volt/components/Distributor/CreateOrderModal.scss";
import COD_icon from "../../../assets/icon/COD.jpg";
import VietQR from "../../../assets/icon/OIP_(40).jpg";
import BIDV from "../../../assets/icon/OIP_(39).jpg";
import VCB from "../../../assets/icon/OIP_(41).jpg";
import Otp_verify_dynamic from "../Otp_verify_dynamic";
import { toast } from "react-toastify";
import api_request from "../../../apicontroller/api_request";
import FlexibleModal from "../FlexibleModal";
import ProductSummary from "./ProductSummary";
import QRScreen from "./QRScreen";
import OrderForm from "./OrderForm";
import PaymentMethods from "./PaymentMethods";

const CreateOrderModal = ({
  show,
  onHide,
  product,
  User,
  onConfirm,
  closeReload,
}) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
    payment_method: "COD",
    Depost_amount: 0,
  });

  const [otpmodal, setotpmodal] = useState(false);
  const [showQRScreen, setShowQRScreen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const API_URL = process.env.REACT_APP_API_IMAGE_URL || "";
  const [paymentstatus, setpaymentstatus] = useState(null);

  const [flexmodal, setflexmodal] = useState(false);
  const [flexload, setflextload] = useState(false);

  const handleCheckpayment = async () => {
    try {
      setflextload(true);
      const res = await api_request.checkpaymentstatus(User, createdOrder);
      if (res) {
        if (res.RC === 200) {
          setpaymentstatus(res.RD);
        } else {
          toast.error(res.RM);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống!");
    } finally {
      setTimeout(() => {
        setflextload(false);
      }, 500);
    }
  };

  useEffect(() => {
    let interval;
    if (flexmodal === false && createdOrder) {
      interval = setInterval(() => {
        handleCheckpayment();
      }, 20000);
    }
    return () => clearInterval(interval);
  }, [createdOrder]);

  useEffect(() => {
    if (show) {
      setFormData({
        quantity: 1,
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        notes: "",
        payment_method: "COD",
      });
      setShowQRScreen(false);
      setCreatedOrder(null);
    }
  }, [show]);

  const handleSubmit = async (challen_code) => {
    const payload = {
      product_id: product.id,
      owner_id: product.author,
      pinner_id: User.company_id,
      pinner_role: User.role,
      Quantity: formData.quantity,
      total_price: formData.quantity * (product.price || 0),
      Start_date: formData.start_date,
      End_date: formData.end_date,
      notes: formData.notes,
      payment_method: formData.payment_method,
      status:
        formData.payment_method === "BANK"
          ? "BANK_awaiting_payment"
          : formData.payment_method === "COD"
            ? "COD_wait"
            : "BANK_partially_payment",
    };

    const response = await onConfirm(payload, challen_code);

    if (response?.RC === 200) {
      if (formData.payment_method !== "COD") {
        setCreatedOrder(response.RD);
        setShowQRScreen(true);
      }

      return {
        RC: 200,
        RM: response.RM,
      };
    } else if (response?.RC !== 200) {
      return {
        RC: 400,
        RM: response.RM || "Có lỗi xảy ra",
      };
    }
  };

  const calculatePayment = () => {
    const total = formData.quantity * (product?.price || 0);
    let payNow = total;
    let remaining = 0;
    let percent = 100;

    if (formData.payment_method === "COD") {
      payNow = total;
      remaining = 0;
      percent = 0;
    } else if (formData.payment_method.startsWith("DEPOSIT_")) {
      percent = parseInt(formData.payment_method.split("_")[1]);
      payNow = (total * percent) / 100;
      remaining = total - payNow;
    }

    return { total, payNow, remaining, percent };
  };

  const { total, payNow, remaining, percent } = calculatePayment();

  if (!product) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      className="aws-order-modal"
    >
      <Otp_verify_dynamic
        show={otpmodal}
        close={() => setotpmodal(false)}
        onSuccess={(code) => handleSubmit(code)}
        message="Xác nhận mã PIN để tạo đơn hàng!"
      />

      <Modal.Header closeButton>
        <Modal.Title className="h6 fw-bold">
          {showQRScreen ? "Thanh toán VietQR" : "Tạo đơn hàng cung ứng"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!showQRScreen ? (
          <>
            <Row>
              <ProductSummary product={product} API_URL={API_URL} />
              <OrderForm
                formData={formData}
                setFormData={setFormData}
                total={total}
                payNow={payNow}
                remaining={remaining}
                percent={percent}
              />
            </Row>
            <PaymentMethods
              method={formData.payment_method}
              setFormData={setFormData}
              icons={{ COD_icon, VietQR, BIDV, VCB }}
            />
          </>
        ) : (
          <QRScreen
            createdOrder={createdOrder}
            payNow={payNow}
            flexmodal={flexmodal}
            paymentstatus={paymentstatus}
            flexload={flexload}
            setflexmodal={setflexmodal}
            handleCheckpayment={handleCheckpayment}
          />
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="link" onClick={onHide}>
          {showQRScreen ? "Đóng" : "Hủy bỏ"}
        </Button>
        {!showQRScreen && (
          <Button
            className="btn-warning text-white"
            onClick={() => setotpmodal(true)}
            disabled={!formData.end_date}
          >
            Xác nhận tạo đơn
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrderModal;
