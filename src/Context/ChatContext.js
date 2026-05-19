import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";
import { UserContext } from "./UserContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Em là TraceChain AI, em đã sẵn sàng để giúp Anh ạ!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentContentType, setCurrentContentType] = useState("general_text");

  const socketRef = useRef(null);
  const startTimeRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const { User } = useContext(UserContext);

  const connect = () => {
    if (!User?.data?.id || !User?.data?.company_id) return;

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    )
      return;

    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    let wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
    // Avoid invalid/IPv6-prone hosts on some Windows setups
    if (wsHost === "0.0.0.0") wsHost = "127.0.0.1";
    if (wsHost === "localhost") wsHost = "127.0.0.1";
    const wsPort = process.env.REACT_APP_WS_PORT || "8000";
    const wsBaseUrl =
      process.env.REACT_APP_WS_BASE_URL || `${wsScheme}://${wsHost}:${wsPort}`;
    const wsUrl = `${wsBaseUrl}/ws/agent/${User.data.company_id}/${User.data.id}`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("Đã thông tuyến với con AI!");
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };

    socketRef.current.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("WebSocket nhận dữ liệu không phải JSON:", event.data);
        return;
      }

      if (data.type === "system") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.type === "ai" && last?.text === data.msg) return prev;
          return [
            ...prev,
            {
              id: Date.now(),
              type: "ai",
              text: data.msg,
              contentType: "general_text",
            },
          ];
        });
        return;
      }

      if (data.type === "status") {
        setIsTyping(true);
        return;
      }

      if (data.type === "error") {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "ai",
            text: data.msg,
            contentType: "general_text",
          },
        ]);
        return;
      }

      if (data.type === "metadata") {
        setCurrentContentType(data.content_type);
      }

      if (data.type === "stream") {
        const elapsedTime = Date.now() - startTimeRef.current;
        const minDelay = 300;

        const handleResponse = () => {
          setIsTyping(false);
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  text: lastMsg.text + data.chunk,
                  contentType: currentContentType,
                },
              ];
            } else {
              return [
                ...prev,
                {
                  id: "streaming",
                  type: "ai",
                  text: data.chunk,
                  contentType: currentContentType,
                },
              ];
            }
          });
        };

        if (elapsedTime < minDelay) {
          setTimeout(handleResponse, minDelay - elapsedTime);
        } else {
          handleResponse();
        }
      }

      if (data.type === "tool_data") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "ai",
            text: data.text,
            contentType: data.content_type,
          },
        ]);
        return;
      }

      if (data.type === "done") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === "streaming" ? { ...m, id: Date.now() } : m,
          ),
        );
        setCurrentContentType("general_text");
      }
    };

    socketRef.current.onclose = (event) => {
      console.warn("WebSocket closed:", {
        code: event?.code,
        reason: event?.reason,
        wasClean: event?.wasClean,
      });
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 1000);
    };

    socketRef.current.onerror = (err) => {
      console.error("Lỗi WebSocket:", err, {
        readyState: socketRef.current?.readyState,
      });
      try {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      } catch (_) {}
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [User]);

  const sendMessage = (text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const getStoredLocation = () => {
        const lat = localStorage.getItem("last_lat");
        const lon = localStorage.getItem("last_lon");
        return { lat, lon };
      };

      const { lat, lon } = getStoredLocation();
      const user_token = User?.token || "";
      const user_session = User?.data?.Session_id || "";
      const device_finger = navigator.userAgent;

      const payload = JSON.stringify({
        text: text,
        lat: parseFloat(lat) || null,
        lon: parseFloat(lon) || null,
        token: user_token,
        session_id: user_session,
        device_finger: device_finger,
      });

      setMessages((prev) => [...prev, { id: Date.now(), type: "user", text }]);
      setIsTyping(true);
      startTimeRef.current = Date.now();

      socketRef.current.send(payload);
    } else {
      console.error("WebSocket mất kết nối...");
      connect();
    }
  };

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, isTyping, isOpen, setIsOpen }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
