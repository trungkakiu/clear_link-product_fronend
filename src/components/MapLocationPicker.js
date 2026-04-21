import React, { useState, useEffect, useRef } from "react";
import { Form, ListGroup, InputGroup, Card } from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMapMarkerAlt,
  faTimes,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_SCRETTOKEN;

const MapLocationPicker = ({
  label = "Vị trí xác thực",
  placeholder = "Tìm kiếm địa chỉ nhà kho, nhà máy...",
  width = "100%",
  height = "350px",
  onSelect,
  initialCoords = null,
  defaultCenter = [105.8542, 21.0285],
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // 1. Hàm Reverse Geocode (Dịch tọa độ ra địa chỉ chữ)
  const reverseGeocode = async (lng, lat, isInitial = false) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&country=vn&language=vi`,
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const bestMatch = data.features[0];
        const locationData = {
          address: bestMatch.place_name,
          lng: lng,
          lat: lat,
        };

        setSearchValue(bestMatch.place_name);
        setSelectedInfo(locationData);

        if (marker.current) marker.current.remove();
        marker.current = new mapboxgl.Marker({ color: "#ff9900" })
          .setLngLat([lng, lat])
          .addTo(map.current);

        if (!isInitial && onSelect) onSelect(locationData);
      }
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
    }
  };

  useEffect(() => {
    if (map.current) return;

    // Xác định tâm map ban đầu: Ưu tiên tọa độ truyền vào
    const startCenter =
      initialCoords && initialCoords.lng && initialCoords.lat
        ? [parseFloat(initialCoords.lng), parseFloat(initialCoords.lat)]
        : defaultCenter;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: startCenter,
      zoom: initialCoords ? 16 : 13,
    });

    // Thêm control điều hướng
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Sự kiện Click chọn vị trí
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      reverseGeocode(lng, lat);
    });

    // XỬ LÝ TỌA ĐỘ CÓ SẴN KHI LOAD
    map.current.on("load", () => {
      if (initialCoords && initialCoords.lng && initialCoords.lat) {
        reverseGeocode(
          parseFloat(initialCoords.lng),
          parseFloat(initialCoords.lat),
          true,
        );
      }
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, []); // Luôn để mảng rỗng để map không bị reset khi cha re-render

  const handleSearch = async (query) => {
    setSearchValue(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=vn&language=vi`,
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Mapbox Search Error:", error);
    }
  };

  const onConfirmSelect = (item) => {
    const [lng, lat] = item.center;
    const locationData = {
      address: item.place_name,
      lng: lng,
      lat: lat,
      context: item.context,
    };

    setSearchValue(item.place_name);
    setSelectedInfo(locationData);
    setSuggestions([]);

    map.current.flyTo({ center: [lng, lat], zoom: 16 });

    if (marker.current) marker.current.remove();
    marker.current = new mapboxgl.Marker({ color: "#ff9900" })
      .setLngLat([lng, lat])
      .addTo(map.current);

    if (onSelect) onSelect(locationData);
  };

  const clearSelection = () => {
    setSearchValue("");
    setSelectedInfo(null);
    setSuggestions([]);
    if (marker.current) marker.current.remove();
    if (onSelect) onSelect(null);
  };

  return (
    <div className="location-picker-container mb-4">
      <Form.Label className="small fw-800 text-aws-navy text-uppercase mb-2 d-flex align-items-center">
        <FontAwesomeIcon
          icon={faLocationArrow}
          className="me-2 text-aws-orange"
        />
        {label}
      </Form.Label>

      <div className="search-wrapper position-relative">
        <InputGroup
          className={`custom-search-group ${isFocused ? "focused" : ""} shadow-sm`}
        >
          <InputGroup.Text className="bg-white border-end-0 px-3">
            <FontAwesomeIcon
              icon={faSearch}
              className={isFocused ? "text-aws-orange" : "text-muted"}
            />
          </InputGroup.Text>
          <Form.Control
            placeholder={placeholder}
            value={searchValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-start-0 border-end-0 shadow-none py-2"
          />
          {searchValue && (
            <InputGroup.Text
              className="bg-white border-start-0 px-3"
              onClick={clearSelection}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-danger hover-scale"
              />
            </InputGroup.Text>
          )}
        </InputGroup>

        {suggestions.length > 0 && isFocused && (
          <ListGroup className="suggestion-dropdown shadow-lg">
            {suggestions.map((item) => (
              <ListGroup.Item
                key={item.id}
                action
                className="d-flex align-items-start border-0 py-3 px-3 suggestion-item"
                onClick={() => onConfirmSelect(item)}
              >
                <div className="icon-wrapper me-3 mt-1">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-aws-orange"
                  />
                </div>
                <div className="text-content">
                  <div className="place-name fw-bold small text-aws-navy">
                    {item.text_vi || item.text}
                  </div>
                  <div
                    className="full-address tiny text-muted text-truncate"
                    style={{ maxWidth: "300px" }}
                  >
                    {item.place_name}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      <div
        ref={mapContainer}
        className="map-frame rounded shadow-inner mt-2"
        style={{ width: width, height: height }}
      />

      {selectedInfo && (
        <Card className="mt-2 border-0 bg-aws-navy-light coordinate-badge">
          <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
            <span className="tiny text-aws-navy fw-bold">GPS VERIFIED:</span>
            <span className="extra-small font-monospace text-dark">
              {selectedInfo.lng.toFixed(5)} , {selectedInfo.lat.toFixed(5)}
            </span>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MapLocationPicker;
