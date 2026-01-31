import React, { useContext, useEffect, useState } from "react";
import api_request from "../apicontroller/api_request";
import { useHistory } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import "../scss/volt/components/Product_list.scss";
import RocketLoad from "../Utils/RocketLoad";

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Pagination,
} from "@themesberg/react-bootstrap";

import Product_detail from "./Modal/Product_detail";

const Product_list = () => {
  const API_URL = "http://192.168.110.197:5099/";
  const history = useHistory();
  const { User } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [data_state, setData_state] = useState(null);

  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [waitDrop, setWaitDrop] = useState([]);
  const [pairing, setpairing] = useState([]);
  const [waitEdit, setWaitEdit] = useState([]);
  const [drop, setDrop] = useState([]);

  /* ================= DATA MAP ================= */

  const tabMap = {
    pending,
    active,
    "wait-edit": waitEdit,
    "wait-drop": waitDrop,
    down: drop,
    pairing,
  };

  const currentData = tabMap[tab] || [];

  /* ================= PAGING ================= */

  const itemsPerPage = 8;
  const start = (page - 1) * itemsPerPage;
  const pagedData = currentData.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  /* ================= API ================= */

  const getProduct = async () => {
    setLoading(true);
    try {
      const res = await api_request.getProduct(User);
      if (res?.RC === 200) {
        setPending(res.RD.filter((x) => x.chain_status === "pending"));
        setActive(res.RD.filter((x) => x.chain_status === "active"));
        setWaitDrop(res.RD.filter((x) => x.chain_status === "wait-droped"));
        setpairing(res.RD.filter((x) => x.chain_status === "pairing"));
        setWaitEdit(res.RD.filter((x) => x.chain_status === "wait-edit"));
        setDrop(res.RD.filter((x) => x.chain_status === "down"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  /* ================= ACTION ================= */

  const handleViewDetail = (id) => {
    const product = [
      ...pending,
      ...pairing,
      ...active,
      ...waitEdit,
      ...waitDrop,
      ...drop,
      ...pairing,
    ].find((p) => String(p.id) === String(id));
    if (!product) return;
    setData_state(product);
    setIsOpen(true);
  };

  /* ================= UI ================= */

  const Pager = ({ page, total, onChange }) => {
    if (total <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
          />

          {[...Array(total)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === page}
              onClick={() => onChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}

          <Pagination.Next
            disabled={page === total}
            onClick={() => onChange(page + 1)}
          />
        </Pagination>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-center">
        <RocketLoad width={160} height={160} />
      </div>
    );
  }

  return (
    <div className="aws-page py-4">
      {data_state && (
        <Product_detail
          show={isOpen}
          product={data_state}
          onClose={() => {
            setIsOpen(false);
            setData_state(null);
          }}
        />
      )}

      {/* HEADER */}
      <Card className="aws-header mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="aws-title">Quản lý sản phẩm</h4>
            <div className="aws-subtitle">
              Theo dõi trạng thái sản phẩm theo blockchain
            </div>
          </div>

          <div className="d-flex gap-2">
            <Button
              onClick={() => history.push("/Products/New_product")}
              className="aws-btn-primary"
            >
              + Thêm sản phẩm
            </Button>
            <Button className="aws-btn-outline" onClick={getProduct}>
              Làm mới
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* TABS */}
      <Card className="aws-control-panel mb-4">
        <Card.Body>
          <Row className="align-items-center g-3">
            {/* LEFT: Tabs */}
            <Col xs={12} lg="auto">
              <div className="aws-control-left d-flex gap-2 flex-wrap">
                <button
                  className={`aws-tab ${tab === "pending" ? "active" : ""}`}
                  onClick={() => setTab("pending")}
                >
                  Chờ duyệt <span className="count">{pending.length}</span>
                </button>

                <button
                  className={`aws-tab ${tab === "active" ? "active" : ""}`}
                  onClick={() => setTab("active")}
                >
                  Đã on-chain <span className="count">{active.length}</span>
                </button>

                <button
                  className={`aws-tab ${tab === "wait-edit" ? "active" : ""}`}
                  onClick={() => setTab("wait-edit")}
                >
                  Chờ sửa <span className="count">{waitEdit.length}</span>
                </button>

                <button
                  className={`aws-tab ${tab === "wait-drop" ? "active" : ""}`}
                  onClick={() => setTab("wait-drop")}
                >
                  Chờ xóa <span className="count">{waitDrop.length}</span>
                </button>

                <button
                  className={`aws-tab ${tab === "down" ? "active" : ""}`}
                  onClick={() => setTab("down")}
                >
                  Đã xóa <span className="count">{drop.length}</span>
                </button>

                <button
                  className={`aws-tab ${tab === "pairing" ? "active" : ""}`}
                  onClick={() => setTab("pairing")}
                >
                  Đang xử lý <span className="count">{pairing.length}</span>
                </button>
              </div>
            </Col>

            {/* RIGHT: Search */}
            <Col xs={12} lg>
              <InputGroup className="aws-search">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control placeholder="Tìm kiếm sản phẩm..." />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* GRID */}
      <Row className="g-3">
        {pagedData.length === 0 && (
          <div className="text-center text-muted mt-4 w-100">
            Không có sản phẩm nào trong mục này.
          </div>
        )}

        {pagedData.map((p) => (
          <Col xs={12} sm={6} lg={3} key={p.id}>
            <Card className="aws-product-card">
              <div className="aws-product-thumb">
                <img
                  src={`${API_URL}main-card/${p.main_cardimage}`}
                  alt={p.name}
                />

                <span className={`aws-product-status ${p.chain_status}`}>
                  {p.chain_status === "pending" && "Chờ xử lý"}
                  {p.chain_status === "active" && "Hoạt động"}
                  {p.chain_status === "wait-edit" && "Chờ sửa"}
                  {p.chain_status === "wait-droped" && "Chờ xóa"}
                  {p.chain_status === "down" && "Đã xóa"}
                  {p.chain_status === "pairing" && "Đang xử lý"}
                </span>
              </div>

              <Card.Body className="aws-product-body">
                <div className="aws-product-header">
                  <div className="aws-product-name" title={p.name}>
                    {p.name}
                  </div>
                  <div className="aws-product-id">#{p.id}</div>
                </div>

                <div className="aws-product-price">
                  {p.price.toLocaleString()}₫
                </div>

                <button
                  className="aws-product-action"
                  onClick={() => handleViewDetail(p.id)}
                >
                  Xem chi tiết
                </button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* PAGER */}
      <Pager page={page} total={totalPages} onChange={setPage} />
    </div>
  );
};

export default Product_list;
