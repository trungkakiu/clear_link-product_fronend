import React, { useState, useRef, useContext, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Button,
  Modal,
  Spinner,
  Badge,
  Card,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSync,
  faCheckCircle,
  faMobileAlt,
  faSatellite,
  faMicrochip,
  faTimesCircle,
  faExclamationTriangle,
  faInfoCircle,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { isMobile, isTablet } from "react-device-detect";
import api_request from "../../apicontroller/api_request";
import "../../scss/volt/components/Manufacture/QrScannerPage.scss";
import { UserContext } from "../../Context/UserContext";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { now } from "moment-timezone";

const QrScannerPage = () => {
  const history = useHistory();
  const { User } = useContext(UserContext);
  const scannerRef = useRef(null);
  const cameraId = "reader";
  const lastScannedCode = useRef("");
  const lastScannedTime = useRef(0);
  const [isLocked, setisLocked] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const cachedPos = useRef(null);
  const lastGpsTime = useRef(0);
  const isProcessing = useRef(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [permissionModal, setPermissionModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current
            .stop()
            .then(() => {
              scannerRef.current.clear();
            })
            .catch(console.error);
        } else {
          scannerRef.current.clear();
        }
      }
    };
  }, []);

  const scannerInstance = useRef(null);

  useEffect(() => {
    return () => {
      const stopAndClear = async () => {
        if (scannerInstance.current) {
          try {
            if (scannerInstance.current.isScanning) {
              await scannerInstance.current.stop();
            }
            await scannerInstance.current.clear();
            scannerInstance.current = null;
          } catch (e) {
            console.error("Cleanup Error:", e);
          }
        }
      };
      stopAndClear();
    };
  }, []);

  const playFeedback = (isSuccess) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(isSuccess ? 880 : 220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
    if (navigator.vibrate) navigator.vibrate(isSuccess ? 150 : [100, 50, 100]);
  };

  const requestPermissions = async () => {
    if (loading || scanning) return;

    try {
      setLoading(true);
      setisLocked(true);

      if (!scannerInstance.current) {
        scannerInstance.current = new Html5Qrcode(cameraId);
      }

      if (scannerInstance.current.isScanning) {
        await scannerInstance.current.stop();
      }

      const config = {
        fps: 40,

        aspectRatio: window.innerHeight / window.innerWidth,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Bắt đầu quét
      await scannerInstance.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
      );

      // Cập nhật State đồng bộ
      setScanning(true);
      setPermissionModal(false);

      // Lấy GPS song song (không await để cam lên trước)
      navigator.geolocation.getCurrentPosition(
        (p) => {
          cachedPos.current = p;
          lastGpsTime.current = Date.now();
        },
        null,
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } catch (err) {
      console.error("Lỗi Camera:", err);
      setErrorMsg(
        "Không thể truy cập Camera. Vui lòng kiểm tra quyền ứng dụng.",
      );
      setPermissionModal(true);
      setScanning(false);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setisLocked(false);
      }, 1000);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance.current) {
      try {
        setLoading(true);
        if (scannerInstance.current.isScanning) {
          await scannerInstance.current.stop();
        }
        // Quan trọng: Phải clear để giải phóng sensor hoàn toàn
        await scannerInstance.current.clear();
        setScanning(false);
      } catch (e) {
        console.error("Lỗi khi dừng cam:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    const currentTime = Date.now();
    if (isProcessing.current || isLocked || loading) return;
    if (isLocked || loading) return;

    if (
      decodedText === lastScannedCode.current &&
      currentTime - lastScannedTime.current < 5000
    ) {
      return;
    }
    isProcessing.current = true;
    setisLocked(true);
    setLoading(true);
    playFeedback(true);
    lastScannedCode.current = decodedText;
    lastScannedTime.current = currentTime;
    try {
      const now = Date.now();
      let finalLat = 0;
      let finalLng = 0;

      if (cachedPos.current && now - lastGpsTime.current < 30000) {
        finalLat = cachedPos.current.coords.latitude;
        finalLng = cachedPos.current.coords.longitude;
      }

      if (finalLat === 0 || finalLng === 0) {
        try {
          const p = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, {
              enableHighAccuracy: true,
              timeout: 5000,
            });
          });
          cachedPos.current = p;
          lastGpsTime.current = Date.now();
          finalLat = p.coords.latitude;
          finalLng = p.coords.longitude;
        } catch (gpsErr) {
          playFeedback(false);
          setErrorModal(true);
          setErrorMsg(
            "Không thể lấy tọa độ GPS. Vui lòng bật vị trí và thử lại.",
          );
          isProcessing.current = false;
          setLoading(false);
          return;
        }
      }

      if (finalLat === 0 || finalLng === 0) {
        playFeedback(false);
        setErrorMsg(
          "Thiết bị chưa phản hồi tọa độ GPS. Vui lòng bật vị trí và thử lại.",
        );
        setErrorModal(true);
        setLoading(false);
        return;
      }
      const parts = decodedText.split("|");
      const res = await api_request.QR_batchverifyAPI(
        User,
        parts[0],
        parts[1],
        finalLat,
        finalLng,
      );

      if (res?.RC === 200) {
        setScannedData(res.RD);
        setSuccessModal(true);
        setTimeout(() => {
          setSuccessModal(false);
          setLoading(false);
          isProcessing.current = false;
          setTimeout(() => {
            setisLocked(false);
          }, 2000);
        }, 1000);
      } else {
        playFeedback(false);
        setErrorMsg(res?.RM || "Mã không hợp lệ hoặc lỗi chữ ký số.");
        setErrorModal(true);
        setLoading(false);
      }
    } catch (e) {
      setErrorMsg("Máy chủ Node không phản hồi.");
      playFeedback(false);
      setErrorModal(true);
      setLoading(false);
    }
  };

  if (!isMobile && !isTablet) {
    return (
      <div className="aws-desktop-portal d-flex align-items-center justify-content-center">
        <Card
          className="border-0 shadow-lg p-5 text-center"
          style={{ maxWidth: "500px" }}
        >
          <FontAwesomeIcon
            icon={faMicrochip}
            size="5x"
            className="mb-4 text-warning"
          />
          <h2 className="fw-bold">TERMINAL ACCESS ONLY</h2>
          <p className="text-muted">
            Giao diện quét định danh yêu cầu cảm biến GPS vật lý. Vui lòng sử
            dụng thiết bị di động.
          </p>
          <Badge bg="dark" className="p-2">
            TRACECHAIN PROTOCOL v2.5
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="aws-mobile-scanner d-flex flex-column">
      <div className="scanner-header p-3 d-flex justify-content-between align-items-center bg-dark text-white">
        <Button
          variant="link"
          className="text-white p-0"
          onClick={() => history.push("/dashboard/overview")}
        >
          <FontAwesomeIcon icon={faHome} size="lg" />
        </Button>
        <div className="fw-bold">
          TC-NODESCAN <span className="text-warning">v2.5</span>
        </div>
        <Badge bg={scanning && !loading ? "success" : "danger"}>
          {scanning && !loading ? "LIVE" : "WAIT"}
        </Badge>
      </div>

      <div className="viewport-container flex-grow-1 position-relative bg-black d-flex align-items-center justify-content-center">
        <div id={cameraId} className="camera-view w-100 h-100"></div>
        {scanning && (
          <div
            className={`overlay-fixed ${isLocked || loading ? "opacity-50" : "opacity-100"}`}
          >
            <div className="scan-region">
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>
             
              {!isLocked && !loading && <div className="laser-line"></div>}
            </div>
            <div className="hint-text mt-4">
              {isLocked || loading
                ? "ĐANG XỬ LÝ..."
                : "VUI LÒNG CĂN GIỮA MÃ QR"}
            </div>
          </div>
        )}

        {loading && (
          <div className="status-overlay-fixed d-flex flex-column align-items-center justify-content-center">
            <Spinner
              animation="border"
              variant="warning"
              style={{ width: "3.5rem", height: "3.5rem" }}
            />
            <h5 className="text-warning mt-4 fw-bold">
              XÁC THỰC BLOCKCHAIN...
            </h5>
            <p className="text-white-50 small">
              Đang truy vấn Node & Toạ độ GPS
            </p>
          </div>
        )}

        {!scanning && !loading && (
          <div className="start-prompt" onClick={requestPermissions}>
            <div className="btn-pulse mb-3">
              <FontAwesomeIcon
                icon={faCamera}
                size="2x"
                className="text-white"
              />
            </div>
            <h6 className="text-white fw-bold">CHẠM ĐỂ KÍCH HOẠT SENSOR</h6>
          </div>
        )}
      </div>

      <div className="scanner-footer p-3 bg-white border-top">
        <div className="d-flex justify-content-around mb-3">
          <small className="text-muted">
            <FontAwesomeIcon icon={faSatellite} className="text-success me-1" />{" "}
            GPS READY
          </small>
          <small className="text-muted">
            <FontAwesomeIcon icon={faSync} className="text-info me-1" />{" "}
            ON-CHAIN SYNC
          </small>
        </div>
        <Button
          variant={scanning ? "outline-danger" : "warning"}
          onClick={scanning ? stopScanner : requestPermissions}
          className="w-100 fw-bold py-3 shadow-sm"
        >
          {scanning ? "DỪNG CẢM BIẾN CAMERA" : "KÍCH HOẠT QUYỀN TRUY CẬP"}
        </Button>
      </div>

      <Modal
        show={successModal}
        centered
        size="sm"
        className="modal-result success"
      >
        <Modal.Body className="text-center p-4">
          <div className="icon-circle bg-success-soft mb-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="3x"
              className="text-success"
            />
          </div>
          <h4 className="fw-bold">XÁC THỰC THÀNH CÔNG</h4>
          <p className="text-muted mb-0">
            Lô hàng:{" "}
            <span className="fw-bold text-dark">{scannedData?.batch_id}</span>
          </p>
          <hr />
          <Badge bg="success" className="w-100 py-2">
            DỮ LIỆU ĐÃ GHI VÀO BLOCK
          </Badge>
        </Modal.Body>
      </Modal>

      <Modal
        show={errorModal}
        centered
        size="sm"
        className="modal-result error"
      >
        <Modal.Body className="text-center p-4">
          <div className="icon-circle bg-danger-soft mb-3">
            <FontAwesomeIcon
              icon={faTimesCircle}
              size="3x"
              className="text-danger"
            />
          </div>
          <h4 className="fw-bold text-danger">XÁC THỰC THẤT BẠI</h4>
          <p className="small text-muted">{errorMsg}</p>
          <Button
            variant="danger"
            className="w-100 mt-2"
            onClick={() => {
              setErrorModal(false);
              setLoading(false);
              setTimeout(() => {
                lastScannedCode.current = "";
                isProcessing.current = false;
                setisLocked(false);
                console.log("Scanner Ready!");
              }, 500);
            }}
          >
            QUÉT LẠI MÃ KHÁC
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={permissionModal} centered size="sm">
        <Modal.Body className="text-center p-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="3x"
            className="text-warning mb-3"
          />
          <h5 className="fw-bold">THIẾU QUYỀN TRUY CẬP</h5>
          <p className="text-muted small">{errorMsg}</p>
          <Button variant="dark" className="w-100" onClick={requestPermissions}>
            THỬ LẠI
          </Button>
        </Modal.Body>
      </Modal>

      <style>{`
        /* Giữ nguyên CSS cũ của anh */
        .viewport-container { min-height: 60vh; position: relative; }
        .start-prompt { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 20; text-align: center; width: 100%; cursor: pointer; }
        .camera-view video { object-fit: cover !important; }
        .overlay-fixed, .status-overlay-fixed { position: absolute; inset: 0; z-index: 10; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .status-overlay-fixed { background: rgba(0,0,0,0.85); pointer-events: all; }
        .scan-region { 
          width: 260px; 
          height: 260px; 
          position: relative; 
          /* Thêm một lớp nền mờ nhẹ để nổi bật vùng quét */
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px; 
        }

        /* 4 Góc khung quét - Làm dày và bo góc */
        .corner { 
          position: absolute; 
          width: 40px;  /* Tăng độ dài cạnh từ 25 lên 40 */
          height: 40px; 
          border: 6px solid #ff6f00; /* Tăng độ dày viền từ 4 lên 6 */
          z-index: 5;
        }

        .tl { 
          top: -3px; left: -3px; 
          border-right: 0; border-bottom: 0; 
          border-top-left-radius: 15px; /* Bo góc cho mượt */
        }

        .tr { 
          top: -3px; right: -3px; 
          border-left: 0; border-bottom: 0; 
          border-top-right-radius: 15px; 
        }

        .bl { 
          bottom: -3px; left: -3px; 
          border-right: 0; border-top: 0; 
          border-bottom-left-radius: 15px; 
        }

        .br { 
          bottom: -3px; right: -3px; 
          border-left: 0; border-top: 0; 
          border-bottom-right-radius: 15px; 
        }

        /* Tia laser - Cho nó đậm đà hơn tí */
        .laser-line { 
          position: absolute; 
          width: 90%; 
          left: 5%;
          height: 3px; 
          background: linear-gradient(to right, transparent, #ff6f00, transparent); 
          box-shadow: 0 0 15px #ff6f00; 
          animation: scan-anim 2s infinite ease-in-out; 
        }
        @keyframes scan-anim { 0% { top: 0; } 100% { top: 100%; } }
        .hint-text { color: white; font-weight: bold; font-size: 13px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
        .btn-pulse { width: 80px; height: 80px; background: #ff6f00; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse-orange 2s infinite; margin: 0 auto; }
        @keyframes pulse-orange { 0% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0.7); } 70% { box-shadow: 0 0 0 20px rgba(255, 111, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 111, 0, 0); } }
        .icon-circle { width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .bg-success-soft { background: #e8f5e9; }
        .bg-danger-soft { background: #ffebee; }
        .modal-result .modal-content { border: none; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
};

export default QrScannerPage;
