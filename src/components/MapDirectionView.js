import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useParams, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationArrow,
  faChevronLeft,
  faRoute,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;

const MapNavigation = () => {
  const { lng_start, lat_start, lng_end, lat_end } = useParams();
  const history = useHistory();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

  const sLng = parseFloat(lng_start);
  const sLat = parseFloat(lat_start);
  const eLng = parseFloat(lng_end);
  const eLat = parseFloat(lat_end);

  const getRoute = async (start, end) => {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      );
      const json = await query.json();
      if (!json.routes || json.routes.length === 0) return;

      const data = json.routes[0];
      const route = data.geometry.coordinates;

      setRouteInfo({
        distance: (data.distance / 1000).toFixed(2),
        duration: Math.floor(data.duration / 60),
      });

      const geojson = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: route },
      };

      if (map.current.getSource("route")) {
        map.current.getSource("route").setData(geojson);
      } else {
        map.current.addLayer({
          id: "route",
          type: "line",
          source: { type: "geojson", data: geojson },
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#0050d1",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }

      const bounds = new mapboxgl.LngLatBounds().extend(start).extend(end);
      map.current.fitBounds(bounds, { padding: 80 });
    } catch (error) {
      console.error("Lỗi tính toán lộ trình:", error);
    }
  };

  useEffect(() => {
    if (isNaN(sLng) || isNaN(sLat) || isNaN(eLng) || isNaN(eLat)) {
      console.error("Lỗi: Tọa độ đầu vào không hợp lệ (NaN).", {
        sLng,
        sLat,
        eLng,
        eLat,
      });
      return;
    }

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [sLng, sLat],
        zoom: 12,
      });

      map.current.on("load", () => {
        getRoute([sLng, sLat], [eLng, eLat]);

        new mapboxgl.Marker({ color: "#00FF00" })
          .setLngLat([sLng, sLat])
          .addTo(map.current);
        new mapboxgl.Marker({ color: "#FF0000" })
          .setLngLat([eLng, eLat])
          .addTo(map.current);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [sLng, sLat, eLng, eLat]);

  return (
    <div
      className="position-relative"
      style={{
        height: "100dvh",
        width: "100vw",
        background: "#eee",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => history.goBack()}
        className="btn btn-dark position-absolute top-0 start-0 m-3 shadow"
        style={{ zIndex: 10 }}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <div
        className="position-absolute top-0 end-0 m-3 p-3 bg-white shadow rounded border-start border-4 border-primary"
        style={{ zIndex: 10, width: "250px" }}
      >
        <h6 className="fw-bold mb-2">LỘ TRÌNH VẬN CHUYỂN</h6>
        <div className="small mb-1 text-dark">
          <FontAwesomeIcon icon={faRoute} className="me-2 text-primary" />
          Quãng đường: <strong>{routeInfo.distance} km</strong>
        </div>
        <div className="small text-dark">
          <FontAwesomeIcon icon={faClock} className="me-2 text-primary" />
          Dự kiến: <strong>{routeInfo.duration} phút</strong>
        </div>
      </div>

      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <div
        className="position-absolute bottom-0 start-50 translate-middle-x mb-4"
        style={{ zIndex: 10 }}
      >
        <button className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg fw-bold">
          <FontAwesomeIcon icon={faLocationArrow} className="me-2" />
          BẮT ĐẦU VẬN CHUYỂN
        </button>
      </div>
    </div>
  );
};

export default MapNavigation;
