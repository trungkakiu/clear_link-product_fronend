import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faLocationArrow,
  faStop,
  faCrosshairs,
  faClock,
  faRoute,
  faExpand,
  faLongArrowAltUp,
} from "@fortawesome/free-solid-svg-icons";
import api_request from "../../apicontroller/api_request";
import { UserContext } from "../../Context/UserContext";
import AWSActionModal from "../Modal/AWSActionModal";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;

const DriverNavigation = () => {
  const { lng_start, lat_start, lng_end, lat_end, order } = useParams();
  const history = useHistory();
  const location = useLocation();
  const { User } = useContext(UserContext);

  const warehouseNode = useMemo(
    () => [parseFloat(lng_start), parseFloat(lat_start)],
    [lng_start, lat_start],
  );
  const customerNode = useMemo(
    () => [parseFloat(lng_end), parseFloat(lat_end)],
    [lng_end, lat_end],
  );

  const [isNavigating, setIsNavigating] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalstate, setmodalstate] = useState(false);
  const [driverStatus, setDriverStatus] = useState(
    location.state?.DriverStatus || "waiting",
  );
  const hasTriggeredArrival = useRef(false);
  const vehicle_id = location.state?.vehicle_id;
  const isTrackingRef = useRef(true);
  const lastUpdateRef = useRef(0);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const watchId = useRef(null);
  const lastPosRef = useRef({
    lng: warehouseNode[0],
    lat: warehouseNode[1],
    heading: 0,
  });
  const arriverPosRef = useRef({
    lng: customerNode[0],
    lat: customerNode[1],
    heading: 0,
  });

  const isNearDestination = (pos, dest, threshold = 0.0005) => {
    if (!pos || !dest) return false;
    const dist = Math.sqrt(
      Math.pow(pos.lng - dest[0], 2) + Math.pow(pos.lat - dest[1], 2),
    );
    return dist < threshold;
  };

  const handleArrivedAction = useCallback(() => {
    setModalContent({
      message: "Đã đến đích?",
      actionText: "XÁC NHẬN",
      action: async () => {
        const res = await api_request.VehicleArrived(
          User,
          lastPosRef.current.lat,
          lastPosRef.current.lng,
          order,
          vehicle_id,
        );
        if (res?.RC === 200) {
          setDriverStatus("arrived");
        }
        return res;
      },
    });
    setmodalstate(true);
  }, [User, order, vehicle_id]);

  const handleArrivedArriverAction = useCallback(() => {
    setModalContent({
      message: "Đã đã đến kho trả hàng?",
      actionText: "XÁC NHẬN",
      action: async () => {
        const res = await api_request.VehicleArrivedArrviver(
          User,
          order,
          vehicle_id,
        );
        if (res?.RC === 200) {
          setDriverStatus("arrived");
        }
        return res;
      },
    });
    setmodalstate(true);
  }, [User, order, vehicle_id]);

  useEffect(() => {
    hasTriggeredArrival.current = false;
    console.log(
      ">>> [SYSTEM] Reset Geofence cho trạng thái mới:",
      driverStatus,
    );
  }, [driverStatus]);

  useEffect(() => {
    if (driverStatus !== "delivering") return;

    const checkArrival = () => {
      if (hasTriggeredArrival.current || !isNavigating) return;

      const currentPos = lastPosRef.current;
      const arrived = isNearDestination(
        { lat: currentPos.lat, lng: currentPos.lng },
        customerNode,
        0.0004,
      );

      if (arrived) {
        hasTriggeredArrival.current = true;
        console.log(`>>> [GEOFENCE] Đã đến nhà KHÁCH: ${order}`);
        handleArrivedArriverAction();
      }
    };

    const arrivalTimer = setInterval(checkArrival, 3000);
    return () => clearInterval(arrivalTimer);
  }, [customerNode, order, isNavigating, driverStatus, handleArrivedAction]);

  useEffect(() => {
    if (driverStatus !== "return" && driverStatus !== "ship_start") return;

    const checkArrival = () => {
      if (hasTriggeredArrival.current || !isNavigating) return;

      const currentPos = lastPosRef.current;
      const arrived = isNearDestination(
        { lat: currentPos.lat, lng: currentPos.lng },
        warehouseNode,
        0.0004,
      );

      if (arrived) {
        hasTriggeredArrival.current = true;
        console.log(`>>> [GEOFENCE] Đã quay về KHO: ${order}`);
        handleArrivedAction();
      }
    };

    const arrivalTimer = setInterval(checkArrival, 3000);
    return () => clearInterval(arrivalTimer);
  }, [
    warehouseNode,
    order,
    isNavigating,
    driverStatus,
    handleArrivedArriverAction,
  ]);

  const fetchRoute = useCallback(async (start, end, id, color) => {
    if (!map.current) return null;
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!data.routes?.[0]) return null;

      const route = data.routes[0];
      const sourceId = `source-${id}`;

      if (map.current.getSource(sourceId)) {
        map.current
          .getSource(sourceId)
          .setData({ type: "Feature", geometry: route.geometry });
      } else {
        map.current.addSource(sourceId, {
          type: "geojson",
          data: { type: "Feature", geometry: route.geometry },
        });
        map.current.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": color, "line-width": 6, "line-opacity": 0.8 },
        });
      }
      return route;
    } catch (e) {
      return null;
    }
  }, []);

  const updateGlobalStats = useCallback(
    async (currentPos) => {
      const [leg1, leg2] = await Promise.all([
        fetchRoute(currentPos, warehouseNode, "leg1", "#f59e0b"),
        fetchRoute(warehouseNode, customerNode, "leg2", "#38bdf8"),
      ]);
      if (leg1 && leg2) {
        setRouteInfo({
          distance: ((leg1.distance + leg2.distance) / 1000).toFixed(1),
          duration: Math.floor((leg1.duration + leg2.duration) / 60),
        });
      }
    },
    [fetchRoute, warehouseNode, customerNode],
  );

  const calculateBearing = (prev, curr) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLng = toRad(curr.lng - prev.lng);
    const lat1 = toRad(prev.lat),
      lat2 = toRad(curr.lat);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: warehouseNode,
      zoom: 15,
      pitch: 45,
      antialias: true,
    });

    map.current.on("dragstart", () => setIsTracking(false));
    map.current.on("load", () => {
      updateGlobalStats(warehouseNode);
      new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat(warehouseNode)
        .addTo(map.current);
      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(customerNode)
        .addTo(map.current);

      const el = document.createElement("div");
      el.className = "driver-marker-v3";
      el.innerHTML = `
        <div class="navigation-arrow">
          <i class="fas fa-long-arrow-alt-up"></i>
        </div>
      `;

      markerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat(warehouseNode)
        .addTo(map.current);
    });

    return () => map.current?.remove();
  }, [warehouseNode, customerNode, updateGlobalStats]);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
    setIsTracking(true);

    if (map.current) {
      map.current.flyTo({
        center: lastPosRef.current,
        zoom: 18,
        pitch: 60,
        duration: 2000,
      });
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { longitude: lng, latitude: lat } = pos.coords;
        const prev = lastPosRef.current;
        const now = Date.now();

        const hasMoved = prev
          ? Math.abs(lat - prev.lat) > 0.0001 ||
            Math.abs(lng - prev.lng) > 0.0001
          : true;

        const heading = hasMoved
          ? calculateBearing(prev, { lng, lat })
          : prev?.heading || 0;
        const newPos = { lng, lat, heading };

        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
          if (hasMoved) markerRef.current.setRotation(heading);
        }

        if (isTrackingRef.current && map.current && hasMoved) {
          map.current.easeTo({
            center: [lng, lat],
            bearing: heading,
            duration: 1000,
          });
        }

        const timeSinceLastUpdate = now - lastUpdateRef.current;

        const SHOULD_SEND_API = hasMoved
          ? timeSinceLastUpdate > 15000
          : timeSinceLastUpdate > 180000;

        if (SHOULD_SEND_API) {
          updateGlobalStats([lng, lat]);

          api_request.updateGpsLocation(User, lat, lng, order, vehicle_id, {
            isMoving: hasMoved,
            lastUpdate: now,
          });

          lastUpdateRef.current = now;
          if (hasMoved) lastPosRef.current = newPos;
        }
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );
  }, [User, order, vehicle_id, updateGlobalStats]);

  const [modalContent, setModalContent] = useState({
    message: "",
    actionText: "Xác nhận",
    action: null,
  });

  const confirmStart = async () => {
    console.log("Call");
    const res = await api_request.confirmStartApi(User, order, vehicle_id);
    if (res?.RC === 200) {
      setDriverStatus("ship_start");
      setTimeout(startNavigation, 800);
    }
    return res;
  };

  const recenter = () => {
    setIsTracking(true);
    if (map.current) {
      map.current.flyTo({
        center: [lastPosRef.current.lng, lastPosRef.current.lat],
        zoom: 18,
        pitch: 60,
        bearing: lastPosRef.current.heading,
        essential: true,
      });
    }
  };

  return (
    <div className="nav-wrapper">
      <div className={`nav-header-v2 ${isNavigating ? "active" : ""}`}>
        <AWSActionModal
          action={modalContent.action}
          message={modalContent.message}
          onHide={() => setmodalstate(false)}
          show={modalstate}
          actionText={modalContent.actionText}
        />

        <button onClick={() => history.goBack()} className="btn-back-v2">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div className="route-meta">
          <span className="type">TRACECHAIN</span>
          <p className="status">{isNavigating ? "DI CHUYỂN" : "LỘ TRÌNH"}</p>
        </div>

        {isNavigating && (
          <div className="stats-pill-v2">
            <span className="val">{routeInfo.distance}km</span>
            <span className="divider">|</span>
            <span className="val">{routeInfo.duration}'</span>
          </div>
        )}

        <button
          onClick={() =>
            !document.fullscreenElement
              ? document.documentElement
                  .requestFullscreen()
                  .catch((e) => console.error(e))
              : document.exitFullscreen()
          }
          className="btn-fullscreen-v2 ms-auto"
        >
          <FontAwesomeIcon icon={faExpand} />
        </button>
      </div>

      {!isTracking && isNavigating && (
        <button className="fab-recenter-v2" onClick={recenter}>
          <FontAwesomeIcon icon={faCrosshairs} />
        </button>
      )}

      <div ref={mapContainer} className="map-view" />

      <div className="bottom-interface-v2">
        {!isNavigating ? (
          <div className="info-card-v3 shadow-lg">
            <div className="summary-row-v2">
              <div className="item">
                <small>KHOẢNG CÁCH</small>
                <p>{routeInfo.distance} km</p>
              </div>
              <div className="item">
                <small>DỰ KIẾN</small>
                <p>{routeInfo.duration} phút</p>
              </div>
            </div>
            <button
              className="btn-vít-ga-v2"
              onClick={() => {
                if (driverStatus === "waiting") {
                  setModalContent({
                    message: "Xác nhận bắt đầu vận đơn và kích hoạt định vị?",
                    actionText: "BẮT ĐẦU",
                    action: confirmStart,
                  });
                  setmodalstate(true);
                } else startNavigation();
              }}
            >
              <FontAwesomeIcon icon={faLocationArrow} className="me-2" />
              BẮT ĐẦU DẪN ĐƯỜNG
            </button>
          </div>
        ) : (
          <div className="stop-container">
            <button
              className="btn-stop-v3"
              onClick={() => window.location.reload()}
            >
              <FontAwesomeIcon icon={faStop} className="me-2" /> KẾT THÚC
            </button>
          </div>
        )}
      </div>

      <style>{`
        .nav-wrapper { position: relative; height: 100dvh; width: 100vw; background: #0b0e14; overflow: hidden; font-family: 'Inter', sans-serif; }
        .map-view { height: 100%; width: 100%; }
        
        /* --- MŨI TÊN DẪN ĐƯỜNG V3 --- */
        .driver-marker-v3 {
          display: flex;
          justify-content: center;
          align-items: center;
          filter: drop-shadow(0 0 10px rgba(45, 206, 137, 0.6));
          z-index: 100;
        }

        .navigation-arrow {
          background: #2dce89;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .navigation-arrow i {
          font-size: 24px;
          /* Mũi tên fa-long-arrow-alt-up mặc định chỉ lên trên */
          transform: rotate(0deg) !important;
          display: block;
          margin-top: -2px;
        }

        /* Optimized Header */
        .nav-header-v2 { position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; display: flex; align-items: center; background: rgba(26, 29, 35, 0.9); padding: 8px 12px; border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); color: white; }
        .nav-header-v2.active { top: 0; left: 0; right: 0; border-radius: 0; border: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
        
        .btn-back-v2 { width: 36px; height: 36px; border-radius: 10px; border: none; background: #2dce89; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        
        .route-meta { margin-left: 12px; flex-shrink: 0; }
        .route-meta .type { font-size: 9px; font-weight: 900; color: #2dce89; display: block; line-height: 1; margin-bottom: 2px; }
        .route-meta .status { margin: 0; font-size: 13px; font-weight: 700; color: white; line-height: 1; }
        
        .stats-pill-v2 { background: rgba(45, 206, 137, 0.2); border: 1px solid #2dce89; color: #2dce89; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 12px; margin-left: auto; display: flex; align-items: center; gap: 6px; }
        .stats-pill-v2 .divider { opacity: 0.5; }
        
        .btn-fullscreen-v2 { background: none; border: none; color: white; padding: 8px; font-size: 16px; opacity: 0.7; }
        
        .fab-recenter-v2 { position: absolute; bottom: 100px; right: 20px; z-index: 10; width: 44px; height: 44px; border-radius: 12px; background: #1a1d23; color: #2dce89; font-size: 18px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }

        .bottom-interface-v2 { position: absolute; bottom: 0; width: 100%; z-index: 10; display: flex; justify-content: center; padding-bottom: 25px; pointer-events: none; }
        .bottom-interface-v2 > * { pointer-events: auto; }

        /* Start Card */
        .info-card-v3 { background: #1a1d23; border-radius: 20px; padding: 18px; width: 90%; border: 1px solid rgba(255,255,255,0.1); }
        .summary-row-v2 { display: flex; justify-content: space-around; margin-bottom: 15px; }
        .summary-row-v2 .item { text-align: center; }
        .summary-row-v2 .item small { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 700; letter-spacing: 1px; }
        .summary-row-v2 .item p { margin: 0; font-size: 18px; font-weight: 800; color: #2dce89; }
        .btn-vít-ga-v2 { width: 100%; background: #2dce89; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 15px; }

        /* Centered Stop Button */
        .stop-container { width: 100%; display: flex; justify-content: center; }
        .btn-stop-v3 { background: #f5365c; color: white; border: none; padding: 12px 35px; border-radius: 50px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(245, 54, 92, 0.4); text-transform: uppercase; letter-spacing: 1px; }
      `}</style>
    </div>
  );
};

export default React.memo(DriverNavigation);
