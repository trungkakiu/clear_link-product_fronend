import React from "react";

const SystemLogTable = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="ultimate-terminal-wrapper mt-4">
      {/* Header với hiệu ứng Shimmer (Ánh kim lướt qua) */}
      <div className="ultimate-header">
        <div className="header-content">
          <span className="live-indicator"></span>
          <span className="terminal-icon">
            <span className="blink-cursor">_</span>/
          </span>
          <span className="header-title">TRACECHAIN_AUDIT_LOGS</span>
        </div>
        <div className="header-sheen"></div>
      </div>

      <div className="ultimate-table-container">
        <table className="ultimate-table">
          <thead>
            <tr>
              <th>TIME_STAMP</th>
              <th>ACTOR_ID</th>
              <th>ACTION</th>
              <th>DIFF_SCORE</th>
              <th>GEOFENCE</th>
              <th>RISK_LEVEL</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 150).map((log, index) => {
              let actionClass = "action-other";
              if (log.action_type?.includes("CREATE"))
                actionClass = "action-create";
              if (log.action_type?.includes("UPDATE"))
                actionClass = "action-update";
              if (log.action_type?.includes("DELETE"))
                actionClass = "action-delete";

              let riskClass = "risk-low";
              if (log.risk_level === "high") riskClass = "risk-high";
              if (log.risk_level === "critical" || log.payload_diff_score > 0.8)
                riskClass = "risk-critical";

              return (
                <tr
                  key={log.id || index}
                  className="ultimate-row"
                  // Hiệu ứng Cascade: Các hàng lần lượt hiện ra từ trên xuống
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <td className="time-col">
                    <span className="time-text">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="actor-col">
                    {log.actor_id?.substring(0, 15)}...
                  </td>
                  <td>
                    <span className={`ultimate-badge ${actionClass}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="score-col">
                    <div className="score-bar-bg">
                      <div
                        className={`score-bar-fill ${log.payload_diff_score > 0.7 ? "fill-danger" : "fill-safe"}`}
                        style={{
                          width: `${(log.payload_diff_score || 0) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span>
                      {Number(log.payload_diff_score || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="geo-col">
                    {log.is_within_geofence ? (
                      <span className="geo-badge geo-safe">
                        <span className="dot safe-dot"></span> Valid
                      </span>
                    ) : (
                      <span className="geo-badge geo-danger">
                        <span className="dot danger-dot"></span> Breach
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`risk-badge ${riskClass}`}>
                      {log.risk_level ? log.risk_level.toUpperCase() : "LOW"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- CSS BẢN ULTIMATE VỚI ANIMATION SIÊU MƯỢT --- */}
      <style>{`
        .ultimate-terminal-wrapper {
          background-color: #ffffff;
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-radius: 16px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 0 20px rgba(16, 185, 129, 0.02);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          transition: all 0.3s ease;
        }

        .ultimate-terminal-wrapper:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 30px rgba(16, 185, 129, 0.04);
        }

        /* HEADER ANIMATION */
        .ultimate-header {
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .header-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          background: linear-gradient(90deg, #0f172a, #334155);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Hiệu ứng ánh kim lướt qua Header */
        .header-sheen {
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0));
          transform: skewX(-25deg);
          animation: sheen 4s infinite;
          z-index: 1;
        }

        @keyframes sheen {
          0% { left: -150%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        /* Dấu chấm nháy Live (Hệ thống đang chạy) */
        .live-indicator {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulseLive 2s infinite;
        }

        @keyframes pulseLive {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .terminal-icon {
          background-color: #0f172a;
          color: #10b981;
          padding: 4px 10px;
          border-radius: 8px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .blink-cursor { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* TABLE & SCROLLBAR */
        .ultimate-table-container {
          max-height: 420px;
          overflow-y: auto;
          padding-bottom: 10px;
        }

        .ultimate-table-container::-webkit-scrollbar { width: 6px; }
        .ultimate-table-container::-webkit-scrollbar-track { background: transparent; }
        .ultimate-table-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .ultimate-table-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .ultimate-table { width: 100%; border-collapse: separate; border-spacing: 0 4px; padding: 0 12px; }

        .ultimate-table th {
          position: sticky;
          top: 0;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          color: #64748b;
          padding: 16px 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          z-index: 10;
          border-bottom: 1px solid #f1f5f9;
        }

        /* ROW ENTRANCE ANIMATION (Hiệu ứng xếp tầng) */
        .ultimate-row {
          opacity: 0;
          transform: translateY(15px);
          animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          background-color: #ffffff;
          transition: all 0.2s ease;
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* HOVER ROW ANIMATION (Nổi lên khi di chuột) */
        .ultimate-row:hover {
          transform: translateY(-2px) scale(1.005) !important;
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
          background-color: #f8fafc;
          border-radius: 8px;
          z-index: 5;
          position: relative;
        }

        .ultimate-row td {
          padding: 16px 20px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f8fafc;
          font-family: 'Consolas', 'Menlo', monospace;
        }

        .ultimate-row td:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
        .ultimate-row td:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }

        .time-text { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #475569; font-weight: 600; }
        .actor-col { color: #2563eb; font-weight: 600; }

        /* SCORE BAR (Thanh tiến trình thu nhỏ cho điểm Diff) */
        .score-col { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #0f172a; }
        .score-bar-bg { width: 40px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .score-bar-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .fill-safe { background: #3b82f6; }
        .fill-danger { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }

        /* GORGEOUS BADGES */
        .ultimate-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: -apple-system, sans-serif;
          letter-spacing: 0.5px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        }

        .action-create { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; }
        .action-update { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; }
        .action-delete { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #991b1b; }
        .action-other { background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); color: #5b21b6; }

        /* GEOFENCE WITH GLOWING DOTS */
        .geo-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; font-weight: 600; font-family: -apple-system, sans-serif; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .safe-dot { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
        .danger-dot { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; animation: blink 1s infinite; }
        .geo-safe { background-color: #f8fafc; color: #475569; }
        .geo-danger { background-color: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; }

        /* GLOWING RISK BADGES */
        .risk-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .risk-low { color: #10b981; }
        .risk-high { color: #d97706; background-color: #fffbeb; }
        .risk-critical { 
          color: #fff; 
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
          animation: criticalPulse 1.5s infinite;
        }

        @keyframes criticalPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default SystemLogTable;
