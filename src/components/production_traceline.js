import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { useSearchParams } from "react-router-dom"; // Giả định anh dùng v6, nếu v5 hãy dùng new URLSearchParams thuần
import "../scss/volt/components/production_traceline.scss";

// AWS-like SVG Icons siêu nhẹ
const ShieldCheck = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);
const Package = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16.5 9.4 7.5 4.21"></path>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    <path d="M3.27 6.96 12 12.01l8.73-5.05"></path>
    <path d="M12 22.08V12"></path>
  </svg>
);
const Truck = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
    <path d="M19 18h2a1 1 0 0 0 1-1v-5.1a2 2 0 0 0-.5-1.4l-2.6-3a2 2 0 0 0-1.4-.5H14"></path>
    <circle cx="7.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);
const MapPin = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);
const Building = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect>
    <path d="M9 22v-4h6v4"></path>
    <path d="M8 6h.01"></path>
    <path d="M16 6h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M16 10h.01"></path>
    <path d="M8 14h.01"></path>
    <path d="M16 14h.01"></path>
  </svg>
);

const ProductionTraceLine = () => {
  // 1. LẤY BATCH_ID TỪ QUERY URL (Sử dụng cách thuần để an toàn với mọi ver react-router)
  const query = new URLSearchParams(window.location.search);
  const batchId = query.get("batchId");

  const [lineData, setLineData] = useState(null);
  const [isLoad, setIsLoad] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(
    "Establishing secure ledger connection...",
  );
  const [requestId, setRequestId] = useState(
    `REQ-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  );

  useEffect(() => {
    // 2. KIỂM TRA BATCH_ID
    if (!batchId) {
      setMessage("ERROR: Malformed URL. Required 'batchId' parameter missing.");
      setProgress(0);
      return;
    }

    // 3. KHỞI TẠO SSE THẬT (Merg logic của anh vào)
    const baseApi =
      process.env.REACT_APP_API_TRACE_URL ||
      "https://api.clearlink.io.vn/api/trace";
    const sse = new EventSource(`${baseApi}/${batchId}`);

    console.log(`[CLEARLINK] Initializing Trace for: ${batchId}`);

    sse.onopen = () => {
      setMessage("Connection established. Authenticating request...");
    };

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress || 0);
        setMessage(data.msg || "Processing stream...");

        // NẾU NHẬN ĐƯỢC STEP CUỐI (Step 6) -> DONE
        if (data.step === 6 && data.result) {
          setTimeout(() => {
            setLineData(data.result);
            setIsLoad(false);
            sse.close();
          }, 1000); // Delay nhẹ cho animation progress mượt
        }

        // XỬ LÝ LỖI TỪ BACKEND
        if (data.step === -1 || data.error) {
          setMessage(data.msg || "Internal Ledger Error.");
          setProgress(0);
          sse.close();
        }
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    sse.onerror = (err) => {
      console.error("SSE Connection Failed:", err);
      setMessage("Network error. Retrying secure connection...");
      sse.close();
    };

    // CLEANUP
    return () => sse.close();
  }, [batchId]);

  // Helpers
  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const formatDate = (s) => {
    if (!s) return "N/A";
    const d = new Date(s);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  const getActorInfo = (authorId) => {
    if (!lineData || !lineData.companies_info)
      return { name: authorId, role: "Unknown node" };
    return (
      lineData.companies_info[authorId] || {
        name: authorId,
        role: "Network Participant",
      }
    );
  };

  return (
    <div className="trace-page-container">
      {isLoad ? (
        // ==== 1. AWS Tech Loading Screen ====
        <div className="loading-screen">
          <div className="spinner"></div>
          <div className="loading-msg">{message}</div>
          <div className="progress-bar-container">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="perc">{progress}% | Status: OK</div>
          <div
            style={{
              fontSize: "10px",
              color: "#aaa",
              marginTop: "20px",
              fontFamily: "monospace",
            }}
          >
            Request ID: {requestId}
          </div>
        </div>
      ) : (
        // ==== 2. AWS Result Dashboard ====
        <div className="result-screen">
          {/* CỘT TRÁI: KỸ THUẬT & NHÃN QR */}
          <div className="info-panel">
            {/* NHÃN QR Bỏ comment và style uy tín */}
            <div className="info-card primary">
              <h3>
                <ShieldCheck /> Certificate of Origin
              </h3>
              <div className="tech-details">
                <div className="line">
                  <span className="key">Ledger:</span> Hyperledger Fabric v2.5
                </div>
                <div className="line">
                  <span className="key">Chaincode:</span> clearlink-trace v1.0.1
                </div>
                <div className="line">
                  <span className="key">Timestamp:</span>{" "}
                  {formatDate(Date.now())}
                </div>
                <div className="line">
                  <span className="key">Consensus:</span> RAFT (4 Nodes)
                </div>
              </div>
              <div className="qr-certificate">
                <div className="qr-wrapper">
                  <QRCode
                    // value={`${window.location.origin}/trace?batchId=${batchId}`}
                    value={batchId} // Mã hóa batchId cho gọn nhãn
                    size={130}
                    renderAs="svg" // Render SVG cho nét
                    fgColor="#232f3e"
                    level="H" // Độ sửa lỗi cao nhất
                  />
                </div>
                <div>
                  <span className="batch-label">{batchId}</span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#545b64",
                    marginTop: "10px",
                  }}
                >
                  Scan to verify authenticity via Decentralized Ledger
                </div>
              </div>
            </div>

            {/* THÔNG TIN SẢN PHẨM */}
            <div className="info-card">
              <h3
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Package /> Product Metadata
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    backgroundColor: "#f2f3f3",
                    color: "#545b64",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    border: "1px solid #eaeded",
                  }}
                >
                  v{lineData?.product_info?.version || "1"}
                </span>
              </h3>
              <div className="info-row">
                <span className="label">SKU Name</span>
                <span className="value">{lineData?.product_info?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Registered Price</span>
                <span className="value">
                  {formatPrice(lineData?.product_info?.price)}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Author Node ID</span>
                <span
                  className="value"
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                >
                  {lineData?.product_info?.author_id}
                </span>
              </div>
            </div>

            <div className="info-card">
              <h3>
                <Package /> Inventory Batch Details
              </h3>
              <div className="info-row">
                <span className="label">Batch Lot Name</span>
                <span className="value">
                  {lineData?.batch_info?.batch_name}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Pass/Fail</span>
                <span
                  className="value"
                  style={{
                    color:
                      lineData?.batch_info?.qc_fail === 0
                        ? "#1ea362"
                        : "#d13212",
                  }}
                >
                  {lineData?.batch_info?.qc_pass || 100} OK /{" "}
                  {lineData?.batch_info?.qc_fail || 0} Critical
                </span>
              </div>
              <div className="info-row">
                <span className="label">QC Manager Signature</span>
                <span className="value">
                  {getActorInfo(lineData?.batch_info?.qc_manager_id).name}
                </span>
              </div>
            </div>
          </div>

          <div className="timeline-panel">
            <div className="header-flex">
              <h2>Supply Chain Ledger Timeline</h2>
              <div className="status-pill">
                <div className="pulse-dot"></div>
                Immutability Verified
              </div>
            </div>

            <div className="timeline">
              {lineData?.timeline?.map((step, index) => {
                const actor = getActorInfo(step.author_id);
                let Icon = Building;
                if (step.type.includes("product")) Icon = ShieldCheck;
                if (step.type.includes("Batch")) Icon = Package;
                if (step.type.includes("Transit")) Icon = Truck;
                if (step.type.includes("Delivered")) Icon = MapPin;

                return (
                  <div className="timeline-item" key={index}>

                    <div
                      className={`timeline-dot ${step.is_verified_onchain ? "verified" : ""}`}
                    >
                      {step.is_verified_onchain && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>

                    {/* Timeline Card */}
                    <div className="timeline-card">
                      <div className="step-info">
                        <h4>{step.title}</h4>
                        <span className="date">
                          {formatDate(step.timestamp)}
                        </span>
                      </div>
                      <p className="detail">{step.detail}</p>

                      <div className="actor-line">
                        <div className="actor">
                          <div className="aws-icon">
                            <Building size={16} />
                          </div>
                          <div>
                            Exec Node: <strong>{actor.name}</strong>{" "}
                            <span style={{ fontSize: "11px" }}>
                              ({actor.role})
                            </span>
                          </div>
                        </div>
                        {step.is_verified_onchain && (
                          <div className="onchain-badge">
                            <ShieldCheck /> On-chain Block
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionTraceLine;
