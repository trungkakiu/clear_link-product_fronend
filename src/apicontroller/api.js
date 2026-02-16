import axios from "axios";
import { toast } from "react-toastify";
import { useModalStore } from "../Context/Otp_globalstate";

let authToken = null;

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
  },
});

let isRetry = false;

api.interceptors.request.use(
  (config) => {
    const modalStore = useModalStore.getState();

    if (modalStore.hasOtpBlock) {
      return Promise.reject({
        response: {
          status: 499,
          data: { RM: "Cần xác thực PIN!" },
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
    const config = error.config;

    if (!config) return Promise.reject(error);
    const networkError =
      !error.response ||
      error.message?.includes("Network Error") ||
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("timeout") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("ERR_CONNECTION") ||
      error.code === "ERR_NETWORK";

    if (!config._retry && networkError) {
      config._retry = true;
      console.warn("[FAILOVER] Server chính lỗi → dùng server phụ:", API_URL_2);

      try {
        const retryResponse = await axios({
          ...config,
          baseURL: API_URL_2,
        });

        return retryResponse;
      } catch (err2) {
        return Promise.reject(err2);
      }
    }

    const status = error?.response?.status;
    const msg =
      error?.response?.data?.RM || error.message || "Unexpected error";

    if (status === 403) {
      setTimeout(() => {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        window.location.replace("/");
      }, 2500);
    }
    toast.error(msg);
    return Promise.reject(error);
  },
);

export default api;
