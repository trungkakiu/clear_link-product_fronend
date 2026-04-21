import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;

const MapPreview = ({
  lat,
  lng,
  address = "Vị trí đã xác thực",
  height = "250px",
  zoom = 15,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
      interactive: true,
    });

    new mapboxgl.Marker({ color: "#ff9900" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<b class="text-aws-navy">${address}</b>`,
        ),
      )
      .addTo(map.current);

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => map.current && map.current.remove();
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div className="text-center p-4 bg-light rounded border border-dashed">
        <p className="small text-muted mb-0">Chưa có dữ liệu vị trí GPS</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="position-relative">
        {/* Bản đồ */}
        <div ref={mapContainer} style={{ width: "100%", height: height }} />
        <div
          className="position-absolute bottom-0 start-0 end-0 p-2 bg-white-90"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center px-2">
            <div className="text-truncate me-2">
              <FontAwesomeIcon
                icon={faMapMarkedAlt}
                className="text-aws-orange me-2"
              />
              <span className="extra-small fw-bold text-aws-navy text-uppercase">
                Địa chỉ:{" "}
              </span>
              <span className="extra-small text-dark">{address}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-link p-0 text-aws-orange"
              title="Mở Google Maps"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MapPreview;
