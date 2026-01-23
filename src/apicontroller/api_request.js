import axios from "axios";
import api, { setAuthToken } from "./api";
import api_v2, { setAuthToken_v2 } from "./api_v2";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL;
const API_URL_2 = process.env.REACT_APP_API_URL_2;
const login = async (loginData) => {
  try {
    const res = await api_v2.post(`/user_authen/authen/login`, {
      email: loginData.email,
      password: loginData.password,
    });
    return res.data;
  } catch (error) {
    console.log("ERR:", error.response?.data || error.message);
    toast.error(error.response?.data?.RM || "Đăng nhập thất bại");
    return null;
  }
};

const logout = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user_authen/authen/logout`, {
      token: User.token,
    });
    return res.data;
  } catch (error) {
    console.log("ERR:", error.response?.data || error.message);
    return null;
  }
};

const register = async (registerData) => {
  try {
    const res = await api_v2.post(`/user/authen/register`, {
      email: registerData.email,
      password: registerData.password,
      phonenumber: registerData.phonenumber,
      fullname: registerData.fullname,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const regis_role = async (role, data, User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post("/user/regis/role", {
      role: role,
      data: data,
    });
    return res.data;
  } catch (error) {
    return error;
  }
};

const sensupportmail = async (payload) => {
  try {
    const res = await api_v2.post(`/user_requset/support/mail`, {
      email: payload.email,
      title: payload.subject,
      payload: payload.content,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const refresh_me = async () => {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!raw) return null;

    const stored = JSON.parse(raw);
    if (!stored?.token) return null;

    setAuthToken_v2(stored);

    const res = await api_v2.get("/user/me");
    return res.data;
  } catch (error) {
    console.error("refresh_me error:", error);
    return null;
  }
};

const getdashboard = async (user) => {
  try {
    setAuthToken_v2(user);
    const res = await api_v2.get(`/user/get-dashboard/${user.data.id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const post_otp = async (User, otp) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/authen/create-otp`, {
      otp: otp,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCategories = async (User, data) => {
  try {
    setAuthToken(User);
    const res = await api.get(`/user/categories/get-categories`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createCategory = async (User, data) => {
  try {
    setAuthToken(User);
    const res = await api.post(`/user/categories/create-categories`, {
      name: data.name,
      status: data.status,
      description: data.description,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const addnewproduct = async (User, data) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/manufacturer-control/addnew/product",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProduct = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/manufacturer-control/product/list");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getRawProductData = async (data) => {
  try {
    const res = await api.post(`${API_URL}/user/product/raw-data`, {
      id: data.id,
      author: data.author,
      responsible_person: data.responsible_person,
      category_id: data.category_id,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const vetify_user_otp = async (User, otp) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/authen/verify-user-otp`, {
      otp: otp,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const dropProduct = async (User, sessionOTP, type, product_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/authen/drop-block/${type}/${product_id}`,
      {
        otpSessionID: sessionOTP,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export default {
  dropProduct,
  getRawProductData,
  login,
  vetify_user_otp,
  logout,
  getCategories,
  addnewproduct,
  register,
  regis_role,
  getProduct,
  createCategory,
  sensupportmail,
  refresh_me,
  getdashboard,
  post_otp,
};
