import React, { useContext, useEffect, useState } from "react";
import { UserContext, UserProvider } from "./Context/UserContext";
import HomePage from "./pages/HomePage";
import { toast, ToastContainer } from "react-toastify";
import { Route, Redirect, Switch, useLocation } from "react-router-dom";
import { useModalStore } from "./Context/Otp_globalstate";
import ScrollToTop from "./components/ScrollToTop";
import Role_active from "./pages/examples/Role_active";
import Role_register from "./components/Role_register";
import PendingActiveWithMail from "./pages/examples/PendingActiveWithMail";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import { Routes } from "./routes";
import Otp_modal from "./components/Modal/Otp_modal";
import Otp_show from "./components/Modal/Otp_show";
import NewProductForm from "./components/Manufacture/NewProductForm";
import AOS from "aos";
import "aos/dist/aos.css";
import api_request from "./apicontroller/api_request";
import socket_client from "./socket_client";

import { Toaster } from "react-hot-toast";
import { SocketContext } from "./Context/SocketProvider";
import { messaging, requestForToken } from "./firebase";
import { onMessage } from "firebase/messaging";
import ProductionTraceLine from "./components/production_traceline";

const AuthRoleRoute = ({ component: Component, ...rest }) => {
  const { User } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={(props) => {
        const path = props.location.pathname;

        if (!User.Authen) return <Redirect to="/authen/sign-in" />;

        const role = User.data?.role_active;

        if (role === "not_active" || !role) {
          return path === "/user/active_role" ? (
            <Component {...props} />
          ) : (
            <Redirect to="/user/active_role" />
          );
        }

        if (role === "pending") {
          return path === "/user/pending-submit" ? (
            <Component {...props} />
          ) : (
            <Redirect to="/user/pending-submit" />
          );
        }

        if (role === "active") {
          if (path === "/") return <Redirect to="/dashboard/overview" />;
          return <Component {...props} />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

const OAuthHandler = () => {
  const { login } = useContext(UserContext);

  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token || token === "[object Promise]") {
        localStorage.removeItem("user");
        window.location.replace("/authen/sign-in");
        return;
      }

      localStorage.setItem("user", JSON.stringify({ token }));

      try {
        const res = await api_request.refresh_me();
        login(res.RD, token);
        window.location.replace("/");
      } catch {
        localStorage.removeItem("user");
        window.location.replace("/authen/sign-in");
      }
    };

    run();
  }, []);

  return <div>Signing in with Google...</div>;
};

const LoginProtected = ({ component: Component, ...rest }) => {
  const { User } = useContext(UserContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        User.Authen ? <Redirect to="/" /> : <Component {...props} />
      }
    />
  );
};

const useGeolocationTracker = (intervalMinutes = 5) => {
  useEffect(() => {
    const fetchLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            localStorage.setItem("last_lat", pos.coords.latitude);
            localStorage.setItem("last_lon", pos.coords.longitude);
          },
          (err) => console.warn("GPS Error:", err.message),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }
    };

    fetchLocation();

    const interval = setInterval(fetchLocation, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [intervalMinutes]);
};
const App = () => {
  const { refresh_me } = useContext(UserContext);
  const { User, setOtp } = useContext(UserContext);
  const { isOpen, setIsOpen } = useModalStore();
  const [isResult, setisResult] = useState(false);
  const { notifications, addNotification, markAsRead } =
    useContext(SocketContext);
  const [result_otp, setresult_otp] = useState("");
  const location = useLocation();

  const active_otp = async () => {
    if (
      (User?.Authen && User?.data?.role) ||
      (!User?.Otp && User?.data?.role)
    ) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    // 1. Trích xuất vai trò thực tế của User đăng nhập
    const currentRole = User?.data?.role || User?.role;

    let roleFolder = "classic"; // Folder ảnh gốc mặc định
    let titleText = "CLEARLINK - Đăng Nhập Hệ Thống";

    if (currentRole) {
      // Bản đồ ánh xạ: Khớp phân quyền sang đúng tên thư mục con anh vừa tạo ở bước 1
      const roleConfigMap = {
        manufacturer: {
          folder: "manufacturer",
          title: "CLEARLINK - Hệ Thống Nhà Sản Xuất",
        },
        distributor: {
          folder: "distributor",
          title: "CLEARLINK - Hệ Thống Nhà Phân Phối",
        },
        retailer: {
          folder: "retailer",
          title: "CLEARLINK - Hệ Thống Đại Lý Bán Lẻ",
        },
        transporter: {
          folder: "transporter",
          title: "CLEARLINK - Cổng Quản Lý Vận Tải",
        },
      };

      const normalizeRole = String(currentRole).toLowerCase();

      if (roleConfigMap[normalizeRole]) {
        roleFolder = roleConfigMap[normalizeRole].folder;
        titleText = roleConfigMap[normalizeRole].title;
      } else {
        titleText = "CLEARLINK - Bảng Điều Khiển";
        roleFolder = "classic";
      }
    }
    document.title = titleText;

    const fav16Element = document.getElementById("favicon-16");
    const fav32Element = document.getElementById("favicon-32");
    const appleTouchElement = document.getElementById("apple-touch");

    const basePath = `${process.env.PUBLIC_URL}/logo/${roleFolder}`;

    if (fav16Element) fav16Element.href = `${basePath}/favicon-32x32.png`;
    if (fav32Element) fav32Element.href = `${basePath}/favicon-32x32.png`;
    if (appleTouchElement)
      appleTouchElement.href = `${basePath}/apple-touch-icon.png`;
  }, [User, User?.data?.role]);

  const forcedOtpRoutes = [];

  const isForced = forcedOtpRoutes.includes(location.pathname);

  const excludedRoutes = [
    Routes.Signin.path,
    Routes.Signup.path,
    "/user/active_role",
    "/user/pending-submit",
    "/production/trace-line",
  ];

  const openResultOtp = async (data) => {
    setIsOpen(false);
    await setOtp(true);
    setresult_otp(data);
    setisResult(true);
  };

  const fetchNotifications = async () => {
    try {
      const res = await api_request.getnotificationData(User);
      if (res) {
        if (res.RC === 200) {
          const notifications = res.RD || [];
          [...notifications].reverse().forEach((n) => addNotification(n));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi hệ thống thông báo!");
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 50,
    });
    refresh_me();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = null;

    if (User.Authen && User?.data?.role_active === "active") {
      requestForToken().then(async (token) => {
        if (token && isMounted) {
          const localDeviceToken = localStorage.getItem("fcm_token");

          if (localDeviceToken !== token || User?.data?.fcm_token !== token) {
            try {
              await api_request.update_fcm_token(User, token);
              localStorage.setItem("fcm_token", token);
            } catch (err) {
              console.error("Lỗi cập nhật Token:", err);
            }
          }
        }
      });

      unsubscribe = messaging.onMessage((payload) => {
        addNotification({
          message: payload.notification.body,
          noitfi_level: "level_1",
          sender: payload.notification.title,
        });
        toast.info(payload.notification.body);
      });
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [User.Authen, User?.data?.fcm_token]);

  useEffect(() => {
    if (User.Authen && User?.data?.role_active === "active") {
      fetchNotifications();
    }
  }, [User.Authen]);

  useEffect(() => {
    let stopped = false;
    if (excludedRoutes.some((r) => location.pathname.startsWith(r))) {
      return;
    }

    const loop = () => {
      if (!User.Authen || User.Otp) {
        stopped = true;
        return;
      }
      active_otp();
      setTimeout(() => {
        if (!stopped) loop();
      }, 15000);
    };

    loop();

    return () => {
      stopped = true;
    };
  }, [User.Authen]);

  useGeolocationTracker(5);

  return (
    <>
      <ToastContainer limit={3} stacked />

      <Toaster position="top-right" reverseOrder={false} />
      <Otp_show
        show={isResult}
        close={() => setisResult(false)}
        otp={result_otp}
      />
      <Otp_modal
        show={isOpen}
        close={() => setIsOpen(false)}
        isForced={isForced}
        result={openResultOtp}
      />

      <ScrollToTop />
      <Switch>
        <Route
          exact
          path="/production/trace-line"
          component={ProductionTraceLine}
        />
        <Route exact path="/oauth" component={OAuthHandler} />

        <LoginProtected
          exact
          path={Routes.ForgotPassword.path}
          component={HomePage}
        />

        <LoginProtected path={Routes.Signin.path} component={HomePage} />
        <LoginProtected path={Routes.Signup.path} component={HomePage} />

        <AuthRoleRoute path="/dashboard/overview" component={HomePage} />
        <AuthRoleRoute path="/user/active_role" component={Role_active} />

        <AuthRoleRoute
          path="/user/pending-submit"
          component={PendingActiveWithMail}
        />

        <Route path="/user/role-register" component={Role_register} />

        <AuthRoleRoute path="/" component={HomePage} />
      </Switch>
    </>
  );
};

export default App;
