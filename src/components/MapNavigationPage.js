import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Modal } from "@themesberg/react-bootstrap";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;

const MapNavigationModal = ({
  show = false,
  onClose,
  fleetCurrentLocations = {},
  fleetRouteHistories = {},
  fleetAssignments = [],
  startPoint = [106.19939526, 21.27824406],
  destination = [105.85339638, 21.03219737],
  orderId = "TRACKING_001",
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isOfflineOpen, setIsOfflineOpen] = useState(false);
  const vehicleMarkers = useRef({});
  const [isMapReady, setIsMapReady] = useState(false);

  const safeStart = useMemo(
    () => [Number(startPoint[0]), Number(startPoint[1])],
    [startPoint],
  );
  const safeDest = useMemo(
    () => [Number(destination[0]), Number(destination[1])],
    [destination],
  );

  const processedFleet = useMemo(() => {
    const active = [];
    const offlineWithPos = [];
    const noSignal = [];
    const colors = ["#2dce89", "#5e72e4", "#11cdef", "#fb6340", "#f5365c"];
    const now = new Date().getTime();
    const TEN_MINUTES = 5 * 60 * 1000;
    const usedCoords = {};

    if (fleetAssignments) {
      fleetAssignments.forEach((assign, index) => {
        const pos = fleetCurrentLocations[assign.vehicle_id];
        const history = fleetRouteHistories?.[assign.vehicle_id] || [];
        const lastUpdate = pos?.updatedAt
          ? new Date(pos.updatedAt).getTime()
          : 0;

        const hasCoords = pos && pos.lat && pos.lng;
        const isOnline = hasCoords && now - lastUpdate < TEN_MINUTES;

        let displayLat = hasCoords ? Number(pos.lat) : null;
        let displayLng = hasCoords ? Number(pos.lng) : null;

        if (displayLat && displayLng) {
          const coordKey = `${displayLat.toFixed(6)}_${displayLng.toFixed(6)}`;

          if (usedCoords[coordKey]) {
            const offset = usedCoords[coordKey] * 0.00004;
            displayLat += offset;
            displayLng += offset;
            usedCoords[coordKey] += 1;
          } else {
            usedCoords[coordKey] = 1;
          }
        }

        const vehicleData = {
          ...assign,
          lat: displayLat,
          lng: displayLng,
          history: history.map((h) => ({
            lat: Number(h.lat),
            lng: Number(h.lng),
          })),
          color: colors[index % colors.length],
          isOffline: !isOnline && hasCoords,
        };

        if (isOnline) active.push(vehicleData);
        else if (hasCoords) offlineWithPos.push(vehicleData);
        else noSignal.push(vehicleData);
      });
    }
    return { active, offlineWithPos, noSignal };
  }, [fleetCurrentLocations, fleetRouteHistories, fleetAssignments]);

  const getMarkerHTML = (vehicle) => {
    const offlineTag = vehicle.isOffline
      ? `<div style="background: #ff4757; color: white; padding: 1px 5px; border-radius: 3px; font-weight: 800; font-size: 8px; margin-bottom: 2px; text-transform: uppercase;">NGOẠI TUYẾN</div>`
      : "";
    return `
      <div style="display: flex; flex-direction: column; align-items: center; opacity: ${vehicle.isOffline ? "0.7" : "1"}">
        ${offlineTag}
        <div style="background: white; color: black; padding: 2px 6px; border-radius: 4px; font-weight: 900; font-size: 10px; margin-bottom: 2px; border: 2px solid ${vehicle.isOffline ? "#6c757d" : vehicle.color}; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
          ${vehicle.plate_number}
        </div>
        <div style="font-size: 30px; line-height: 1; filter: ${vehicle.isOffline ? "grayscale(1)" : "none"} drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🚚</div>
      </div>
    `;
  };

  const drawMainRoute = useCallback(async () => {
    if (!map.current) return;
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${safeStart[0]},${safeStart[1]};${safeDest[0]},${safeDest[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]) {
        const sourceId = "main-route";
        if (map.current.getSource(sourceId)) {
          map.current
            .getSource(sourceId)
            .setData({ type: "Feature", geometry: data.routes[0].geometry });
        } else {
          map.current.addSource(sourceId, {
            type: "geojson",
            data: { type: "Feature", geometry: data.routes[0].geometry },
          });
          map.current.addLayer({
            id: sourceId,
            type: "line",
            source: sourceId,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#FFD700",
              "line-width": 7,
              "line-opacity": 0.8,
            },
          });
        }
      }
    } catch (e) {
      console.error("Lỗi vẽ đường:", e);
    }
  }, [safeStart, safeDest]);

  useEffect(() => {
    if (show && !map.current) {
      setTimeout(() => {
        if (!mapContainer.current) return;
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/navigation-night-v1",
          center: safeStart,
          zoom: 10,
          pitch: 45,
        });
        map.current.on("load", () => {
          setIsMapReady(true);
          drawMainRoute();
          new mapboxgl.Marker({ color: "#2dce89" })
            .setLngLat(safeStart)
            .addTo(map.current);
          new mapboxgl.Marker({ color: "#f5365c" })
            .setLngLat(safeDest)
            .addTo(map.current);
          map.current.resize();
        });
      }, 400);
    }
    return () => {
      if (!show && map.current) {
        map.current.remove();
        map.current = null;
        vehicleMarkers.current = {};
        setIsMapReady(false);
      }
    };
  }, [show]);

  useEffect(() => {
    if (!isMapReady || !map.current) return;

    const allVisible = [
      ...processedFleet.active,
      ...processedFleet.offlineWithPos,
    ];
    const visibleIds = allVisible.map((v) => v.vehicle_id);

    Object.keys(vehicleMarkers.current).forEach((id) => {
      if (!visibleIds.includes(id)) {
        vehicleMarkers.current[id].remove();
        delete vehicleMarkers.current[id];
      }
    });

    allVisible.forEach((v) => {
      const coords = [v.lng, v.lat];

      if (vehicleMarkers.current[v.vehicle_id]) {
        vehicleMarkers.current[v.vehicle_id].setLngLat(coords);
        const markerEl = vehicleMarkers.current[v.vehicle_id].getElement();
        if (markerEl) markerEl.innerHTML = getMarkerHTML(v);
      } else {
        const el = document.createElement("div");
        el.className = "vehicle-marker-v6";
        el.style.width = "70px";
        el.style.height = "80px";
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = getMarkerHTML(v);

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(coords)
          .addTo(map.current);
        vehicleMarkers.current[v.vehicle_id] = marker;
      }

      const histId = `history-${v.vehicle_id}`;
      const historyCoords = [...v.history.map((p) => [p.lng, p.lat]), coords];

      if (map.current.getSource(histId)) {
        map.current.getSource(histId).setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: historyCoords },
        });
      } else {
        map.current.addSource(histId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: historyCoords },
          },
        });
        map.current.addLayer({
          id: histId,
          type: "line",
          source: histId,
          paint: {
            "line-color": v.isOffline ? "#6c757d" : "#f1c40f",
            "line-width": 3,
            "line-dasharray": [2, 1],
          },
        });
      }
    });
  }, [processedFleet, isMapReady]);

  const flyToVehicle = (lng, lat) => {
    if (map.current)
      map.current.flyTo({
        center: [Number(lng), Number(lat)],
        zoom: 15,
        speed: 1.2,
      });
  };

  return (
    <Modal show={show} onHide={onClose} fullscreen={true}>
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          background: "#0b0e14",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "20px 30px",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                background: "#FFD700",
                color: "black",
                padding: "4px 12px",
                borderRadius: "4px",
                fontWeight: "800",
                fontSize: "12px",
              }}
            >
              TRACECHAIN LIVE
            </div>
            <h5 className="mb-0 text-white ms-3">Giám sát đơn: {orderId}</h5>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "40px",
              cursor: "pointer",
              lineHeight: 0.5,
            }}
          >
            ×
          </button>
        </div>

        {/* Fleet Panel Container */}
        <div
          className="fleet-panel-container"
          style={{
            position: "absolute",
            top: "100px",
            left: "20px",
            zIndex: 100,
            width: "260px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              background: "rgba(15, 17, 23, 0.9)",
              borderRadius: "12px",
              padding: "15px",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h6
              style={{
                fontSize: "10px",
                fontWeight: "800",
                color: "#2dce89",
                marginBottom: "12px",
                letterSpacing: "1px",
              }}
            >
              ĐANG DI CHUYỂN ({processedFleet.active?.length || 0})
            </h6>
            {processedFleet.active?.map((v) => (
              <div
                key={v.vehicle_id}
                onClick={() => flyToVehicle(v.lng, v.lat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                  padding: "8px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: v.color,
                    boxShadow: `0 0 8px ${v.color}`,
                  }}
                ></div>
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    {v.plate_number}
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}
                  >
                    {v.driver_name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(15, 17, 23, 0.8)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              onClick={() => setIsOfflineOpen(!isOfflineOpen)}
              style={{
                padding: "12px 15px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <h6
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  color: "#6c757d",
                  margin: 0,
                  letterSpacing: "1px",
                }}
              >
                NGOẠI TUYẾN / CHƯA CHẠY (
                {processedFleet.offlineWithPos?.length +
                  processedFleet.noSignal?.length}
                )
              </h6>
              <span style={{ color: "white", fontSize: "10px" }}>
                {isOfflineOpen ? "▲" : "▼"}
              </span>
            </div>
            {isOfflineOpen && (
              <div
                style={{
                  padding: "0 15px 15px 15px",
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {processedFleet.offlineWithPos?.map((v) => (
                  <div
                    key={v.vehicle_id}
                    onClick={() => flyToVehicle(v.lng, v.lat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#ff4757",
                      }}
                    ></div>
                    <div>
                      <div
                        style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                      >
                        {v.plate_number}
                      </div>
                      <div style={{ color: "#ff4757", fontSize: "9px" }}>
                        Mất tín hiệu
                      </div>
                    </div>
                  </div>
                ))}
                {processedFleet.noSignal?.map((v) => (
                  <div
                    key={v.vehicle_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "12px",
                      opacity: 0.5,
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#6c757d",
                      }}
                    ></div>
                    <div>
                      <div
                        style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                      >
                        {v.plate_number}
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "9px",
                        }}
                      >
                        Chưa có tọa độ GPS
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>
      <style>{`
        .modal-content { background: #0b0e14 !important; border: none !important; }
        .mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right { display: none !important; }
        .mapboxgl-marker { visibility: visible !important; opacity: 1 !important; z-index: 99; }
      `}</style>
    </Modal>
  );
};

export default React.memo(MapNavigationModal);
