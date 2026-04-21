import axios from "axios";
import { toast } from "react-toastify";

let authToken = null;
let isRedirecting = false;

const API_URL = process.env.REACT_APP_API_URL;
const API_URL_2 = process.env.REACT_APP_API_URL_2;

let currentUser = null;
export const setAuthToken_v2 = (User) => {
  if (User && User.token) {
    authToken = User.token;
    currentUser = User;
  } else {
    currentUser = null;
    authToken = null;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const responseData = error?.response?.data;
    const status = error?.response?.status;

    const errorMsg = responseData?.RM || error.message || "Lỗi hệ thống";
    if (status === 401 || status === 403) {
      if (!isRedirecting) {
        isRedirecting = true;
        toast.error(errorMsg);

        localStorage.removeItem("user");
        authToken = null;

        setTimeout(() => {
          window.location.href = "/authen/sign-in";
        }, 1500);
      }
      return Promise.reject(error);
    }

    const isNetworkError = !error.response || error.code === "ERR_NETWORK";
    if (isNetworkError && !config._retry && API_URL_2 && !isRedirecting) {
      config._retry = true;
      console.warn("[FAILOVER] Đang thử lại với Server phụ...");

      try {
        return await api({
          ...config,
          baseURL: API_URL_2,
        });
      } catch (retryError) {
        const retryMsg =
          retryError?.response?.data?.RM || "Cả hai server đều không phản hồi";
        toast.error(retryMsg);
        return Promise.reject(retryError);
      }
    }

    if (!isRedirecting && !axios.isCancel(error)) {
      toast.error(errorMsg);
    }

    return Promise.reject(error);
  },
);

export default api;
