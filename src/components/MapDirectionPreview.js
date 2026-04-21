import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;
const MapDirectionPreview = ({ origin, destination, onRouteCalculated }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  const getRoute = async (start, end) => {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      );
      const json = await query.json();
      if (!json.routes || json.routes.length === 0) return;

      const data = json.routes[0];
      if (onRouteCalculated) {
        onRouteCalculated({
          distance: parseFloat((data.distance / 1000).toFixed(2)),
          duration: Math.floor(data.duration / 60),
        });
      }

      const geojson = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: data.geometry.coordinates,
        },
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
            "line-color": "#ff9900",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }
      map.current.fitBounds(
        new mapboxgl.LngLatBounds().extend(start).extend(end),
        { padding: 50 },
      );
    } catch (e) {
      console.error("Mapbox Route Error:", e);
    }
  };

  const renderMarkers = (start, end) => {
    // Xóa markers cũ để tránh rác WebGL
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [
      new mapboxgl.Marker({ color: "#00ff00" })
        .setLngLat(start)
        .addTo(map.current),
      new mapboxgl.Marker({ color: "#ff0000" })
        .setLngLat(end)
        .addTo(map.current),
    ];
  };

  useEffect(() => {
    if (!origin || !destination || isNaN(origin[0]) || isNaN(destination[0]))
      return;

    // CHỐT CHẶN: Chỉ khởi tạo map nếu chưa tồn tại
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: origin,
        zoom: 12,
      });

      map.current.on("load", () => {
        getRoute(origin, destination);
        renderMarkers(origin, destination);
      });
    } else {
      // Nếu map đã có, chỉ cập nhật dữ liệu chứ không tạo mới
      getRoute(origin, destination);
      renderMarkers(origin, destination);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <div
      ref={mapContainer}
      className="w-100 h-100 shadow-inner"
      style={{ minHeight: "350px", borderRadius: "8px", background: "#f8f9fa" }}
    />
  );
};

export default MapDirectionPreview;
