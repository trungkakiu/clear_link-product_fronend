import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import socket_client from "../socket_client";
import { toast } from "react-toastify";
import { UserContext } from "./UserContext";
import api_request from "../apicontroller/api_request";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { User } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const isConnected = useRef(false);

  const addNotification = useCallback((data) => {
    if (!data) return;

    const newNoti = {
      id: data.id || Date.now(),
      read: data.status === "seen" || data.status === "read" || false,
      time: data.createdAt
        ? new Date(data.createdAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),
      sender: "Hệ thống",
      ...data,
    };

    setNotifications((prev) => {
      const isExist = prev.find((n) => n.id === newNoti.id);
      if (isExist) return prev;
      return [newNoti, ...prev];
    });
  }, []);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "seen", read: true } : n)),
    );
    const res = await api_request.markNotificationAsRead(User, id);
    if (res && res.RC !== 200) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "not_seen", read: false } : n,
        ),
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) =>
      prev.map((n) =>
        unreadIds.includes(n.id) ? { ...n, status: "seen", read: true } : n,
      ),
    );
    const res = await api_request.markAllNotificationsAsRead(User);
    if (res && res.RC !== 200) {
      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id)
            ? { ...n, status: "not_seen", read: false }
            : n,
        ),
      );
    }
  };

  useEffect(() => {
    if (User?.Authen && User?.data?.id && !isConnected.current) {
      socket_client.connect(User.data);
      isConnected.current = true;

      socket_client.on("NOTI", (payload) => {
        console.log(">>> [6099] Socket Payload:", payload);

        let fullPayload =
          typeof payload === "string" ? JSON.parse(payload) : payload;

        const realData = fullPayload.data;
        if (!realData) return;

        addNotification(realData);

        const isUrgent = ["level_4", "level_5"].includes(realData.noitfi_level);

        toast(
          <div className="custom-toast-body">
            <div
              className={`toast-header ${isUrgent ? "text-danger" : "text-primary"}`}
            >
              <i
                className={`fas ${isUrgent ? "fa-exclamation-triangle" : "fa-bell"} me-2`}
              ></i>
              <span>{"THÔNG BÁO"}</span>
            </div>
            <div className="toast-content">{realData.message}</div>
          </div>,
          {
            position: "top-right",
            autoClose: isUrgent ? 8000 : 5000,
          },
        );

        if (isUrgent) {
          const audio = new Audio("/sound/Am_thanh_thong_bao_huawei.mp3");
          audio.play().catch(() => {});
        }
      });
    }

    return () => {
      if (isConnected.current) {
        socket_client.disconnect();
        isConnected.current = false;
      }
    };
  }, [User?.data?.id, User?.Authen, addNotification]);

  return (
    <SocketContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        socket_client,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
