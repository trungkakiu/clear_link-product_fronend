import axios from "axios";
import { toast } from "react-toastify";
import { useModalStore } from "../Context/Otp_globalstate";

let authToken = null;
let isRedirecting = false;
const API_URL = process.env.REACT_APP_API_URL;
const API_URL_2 = process.env.REACT_APP_API_URL_2;

export const setAuthToken = (User) => {
  const store = useModalStore.getState();
  if (!User.Otp && User.Authen) {
    store.setIsOpen(true);
    store.setOtpBlock(true);
  } else {
    store.setOtpBlock(false);
    authToken = User.token;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const modalStore = useModalStore.getState();

    if (modalStore.hasOtpBlock) {
      return Promise.reject({
        isOtpError: true,
        response: {
          status: 499,
          data: { RM: "Vui lòng xác thực mã PIN để tiếp tục!" },
        },
      });
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const errorMsg =
      response?.data?.RM || error.message || "Lỗi kết nối server";

    if (!config) return Promise.reject(error);

    const status = response?.status;

    if (status === 401 || status === 403) {
      if (!isRedirecting) {
        isRedirecting = true;

        toast.error(errorMsg);

        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        authToken = null;

        console.warn("[AUTH] Phiên làm việc hết hạn:", errorMsg);

        setTimeout(() => {
          window.location.href = "/authen/sign-in";
        }, 1500);
      }
      return Promise.reject(error);
    }

    const networkError =
      !response ||
      error.message?.includes("Network Error") ||
      error.code === "ERR_NETWORK" ||
      ["ECONNREFUSED", "timeout", "ERR_CONNECTION"].some((msg) =>
        error.message?.includes(msg),
      );

    if (!config._retry && networkError && !isRedirecting && API_URL_2) {
      config._retry = true;
      console.warn("[FAILOVER] Đang thử kết nối server dự phòng...");

      try {
        config.baseURL = API_URL_2;
        return await api(config);
      } catch (err2) {
        const failMsg =
          err2?.response?.data?.RM || "Cả hai server đều không phản hồi";
        toast.error(failMsg);
        return Promise.reject(err2);
      }
    }

    if (!isRedirecting && !axios.isCancel(error)) {
      toast.error(errorMsg);
    }

    return Promise.reject(error);
  },
);

export default api;
