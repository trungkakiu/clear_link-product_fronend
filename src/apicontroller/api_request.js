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
    console.error("ERR:", error.response?.data || error.message);
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
    console.error("ERR:", error.response?.data || error.message);
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

const updateCategoryStatus = async (User, cate_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/authen/drop-block/${cate_id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getDepartments = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get("/user/get_department_list");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createdepartment = async (User, form) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post("/user/create-department", {
      role_level: form.role_level,
      partname: form.partname,
      isExcute: form.isExcute,
      isRead: form.isRead,
      part: form.part,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateDepartmentPermission = async (User, id, form) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/Edit-department/${id}`, {
      form,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProductionStaff = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/get-productionstaff`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getTechnicalStaff = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/get-technicalstaff`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createProductionStaff = async (User, form) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/create-productionstaff`, {
      form,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createTechnicalStaff = async (User, form) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/create-technicalstaff`, {
      form,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const changePartment = async (User, staffid, partmentid) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.put(`/user/change-staffdepartment/${staffid}`, {
      partmentid,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const pushstaffAvatar = async (User, staffid, file) => {
  try {
    setAuthToken_v2(User);

    const formData = new FormData();
    formData.append("staff_card", file);

    const res = await api_v2.post(`/user/post-main-card/${staffid}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const newLeaderDepartment = async (User, department_id, staff_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.put(`/user/leader-post-new/${department_id}`, {
      staff_id,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProductValid = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/manufacturer-control/valid/product/list");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getDepartment = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(
      "/user/manufacturer-control/valid/department/production/list",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createBatch = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post("/user/manufacturer-control/create/batch", {
      formData,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const get_departments = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/manufacturer-control/get-departments");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const set_batch_state = async (User, batch_id, new_state) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/manufacturer-control/update/batch/state",
      {
        batch_id,
        new_state,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCompletedBatches = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/manufacturer-control/completed/batches");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getQCreadyStatus = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/manufacturer-control/qc-ready/batches");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getInternalMarketplaceInfo = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(
      "/user/company-control/internal-marketplace/info",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const saveMarketInfo = async (User, formdata) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/company-control/internal-marketplace/newinfo",
      formdata,
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

const fecthPolicy = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(
      "/user/company-control/policay-management/policy",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const newPolicy = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/company-control/policay-management/new-policy",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const sendproposalRequest = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/company-control/contact-management/new-proposal",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const getnotificationData = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/company-control/notification/all");
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const getCollaborationProposals = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/company-control/contact/requests");
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const onCancelRequestApi = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.put(
      `/user/company-control/contact/cancal_proposal/${proposal_id}/request`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const onRejectRequest = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.put(
      `/user/company-control/contact/reject_proposal/${proposal_id}/request`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error("API Error at newPolicy:", error);
    return null;
  }
};

const fetchContract = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(
      "/user/company-control/Contract-management/Contract",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const newContract = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      "/user/company-control/Contract-management/new-Contract",
      formData,
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

const extractPdftoText = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post("/user/scanpdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const onAcceptRequestApi = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/company-control/contract/accept_proposal/${proposal_id}/request`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const sendContractFile = async (User, proposal_id, template) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/company-control/contract/contract-preview/${proposal_id}/send`,
      {
        template_id: template.id,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const onAcceptContractTemplateApi = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/company-control/contract/accept-contract-preview/${proposal_id}/send`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const onRejectContractTemplateApi = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/company-control/contract/reject-contract-preview/${proposal_id}/send`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const onSignContractApi = async (User, challen_code, proposal_id) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/company-control/contract/sign-contract/${proposal_id}/send`,
      {
        challenge_code: challen_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const user_upload_avatar = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post("/user/avatar-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const user_update_info = async (User, formData) => {
  try {
    setAuthToken(User);
    const res = await api.put(`/user/avatar_update/${User.data.id}`, {
      formData,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fecthORMs = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/pinner_production/get");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateProductSettings = async (User, product_id, formData) => {
  try {
    setAuthToken(User);
    const res = await api.post(
      `/user/production/${product_id}/edit`,
      formData,
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

const OEM_order = async (User, newOEM) => {
  try {
    setAuthToken(User);
    const res = await api.post(`/user/production/OEM/new`, {
      newOEM,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const departMentOEM = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(
      "/user/manufacturer-control/valid/OEM-department/production/list",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const acceptOEMProduction = async (User, challenge_code, data) => {
  try {
    setAuthToken(User);
    const res = await api.post("/user/product-batch/OEM-accepting", {
      data,
      challenge_code,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getCompanyProfile = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get("/user/company/profile");
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateProfile = async (User, challenge_code, formData) => {
  try {
    setAuthToken(User);
    if (challenge_code) {
      formData.append("challenge_code", challenge_code);
    }

    const res = await api.put("/user/company-profile/edit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-challenge-code": challenge_code,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Update Profile API Error:", error);
    return null;
  }
};

const updateBatchQuantityApi = async (User, batch_id, quantity) => {
  try {
    setAuthToken(User);
    const res = await api.put(
      `/user/company/product-batches/update/${batch_id}/${quantity}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProposalProduct = async (User) => {
  try {
    setAuthToken(User);
    const res = await api.get(`/user/company/ProposalProduct`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createOrderProduct = async (User, payload, challen_code) => {
  try {
    setAuthToken(User);
    const res = await api.post(`/user/production/order/new`, {
      payload,
      challenge_code: challen_code,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const get_batch_detail = async (User, batch_id) => {
  try {
    setAuthToken(User);
    const res = await api.get(`/user/distributor/order/batch/${batch_id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getStaffs = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/get-staff`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const createVehicle = async (User, formData) => {
  try {
    setAuthToken(User);

    const res = await api.post("/user/transporter/vehicle/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Update Profile API Error:", error);
    return null;
  }
};

const fetchAllvehicleAPI = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/transporter/vehicle/get`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getOrphanVehicles = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/transporter/vehicle/getOrphanVehicles`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const handleCreateFleetAPI = async (User, form) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/transporter/vehicle/fleet/new`, {
      form,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchFleets = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/transporter/vehicle/fleet`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const submitQCbatch = async (User, challenge_code, qcForm) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/product-batch/QC-checking/result`, {
      challenge_code,
      qcForm,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const complateBatchedAPI = async (User, challenge_code, batch_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/product-batch/complate/bacthed/${batch_id}`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getShipingInfo = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/shiping/info`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const sendShipingREquestAPI = async (
  User,
  challenge_code,
  cost_per_km,
  total_ship_price,
  type_capatry,
  type_delivery,
  distance,
  shipperId,
  partnerId,
  batchesMap,
) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/User/shiping-order/request`, {
      challenge_code,
      shipperId,
      partnerId,
      total_ship_price,
      cost_per_km,
      distance,
      type_capatry,
      type_delivery,
      batchesMap,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchShipOrderAPI = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/User/shiping/proccess`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getPricedataAPI = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/User/transporter/price-config/get`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const set_new_shipping = async (User, challen_code, data) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/transporter/set-price`, {
      challenge_code: challen_code,
      data,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getAllVehicleValid = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/transporter/vehicle/valid/get`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const reupdateBatchAPI = async (User, challenge_code, batchId) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.put(
      `/user/manufacturer/batch/reupdate/${batchId}`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchFleetValidApi = async (User, type_delivery) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(
      `/user/manufacturer/fleet/vehicle/list/${type_delivery}`,
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const AcceptShippingOrderApi = async (
  User,
  shipping_id,
  challenge_code,
  selectedVehicles,
  execution_type,
) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/transporter/shipping/${shipping_id}/accept`,
      {
        challenge_code,
        selectedVehicles,
        execution_type,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const pinDriver = async (User, driver_id, vehicle_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/transporter/vehicle/pin-driver`, {
      driver_id,
      vehicle_id,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const disAcceptShippingOrderApi = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/distributor/shipping/${shipping_id}/accept`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const checkpaymentstatus = async (User, payment_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/payment/code/${payment_code}/status`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const QR_batchverifyAPI = async (
  User,
  qr_code_id,
  secure_token,
  latitude,
  longitude,
) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/qr/batch/${User.id}/verify`, {
      QR_code: qr_code_id,
      secure_token: secure_token,
      latitude,
      longitude,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const create_qr_batch = async (User, targetId, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/qr/batch/${User.id}/create`, {
      target_id: targetId,
      challenge_code: challenge_code,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const confirm_qr_printed = async (User, Qrids) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/qr/batch/${User.id}/printed`, {
      Qrids,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const intruckBatch = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/sender/shipping/${shipping_id}/intruck`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const intruckConfirm = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/transporter/shipping/${shipping_id}/received-confirm`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const receivedBatch = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/reciver/shipping/${shipping_id}/reciver-confirm`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMyOrder = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/order/shipping/dashboard/get`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const orderReadytoPick = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/sender/shipping/${shipping_id}/ready-to-pick`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const shipingComplete = async (User, shipping_id, challenge_code) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/shipping/out/${shipping_id}/shiping-confirm`,
      {
        challenge_code,
      },
    );
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const updateGpsLocation = async (User, lat, lng, order, vehicle_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/shipper/update/postition/update`, {
      lat,
      lng,
      order,
      vehicle_id,
    });

    return res.data;
  } catch (error) {
    console.error(">>> [API GPS ERR]:", error.response?.data || error.message);
    return null;
  }
};

const fetchShipperLocationApi = async (User, order_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/shipper/location/${order_id}`);
    return res.data;
  } catch (error) {
    console.error(">>> [API GPS ERR]:", error.response?.data || error.message);
    return null;
  }
};

const update_fcm_token = async (User, fcm_token) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/auth/fcm_token`, { fcm_token });
    return res.data;
  } catch (error) {
    console.error(">>> [API GPS ERR]:", error.response?.data || error.message);
    return null;
  }
};

const AcceptAndSignOrder = async (
  User,
  order_id,
  challenge_code,
  uploadData,
) => {
  try {
    setAuthToken_v2(User);

    const res = await api_v2.post(
      `/user/order/${order_id}/accept-and-sign`,
      uploadData,
      {
        headers: {
          "x-challenge-code": challenge_code,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API AcceptAndSignOrder ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const markNotificationAsRead = async (User, notification_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/company-control/notification/${notification_id}/mark-as-read`,
    );
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API markNotificationAsRead ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const markAllNotificationsAsRead = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(
      `/user/company-control/notification/mark-all-as-read`,
    );
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API markAllNotificationsAsRead ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const getWareHouseApi = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/company/warehouse/get-infomation`);
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API getWareHouseApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const createWarehouseApi = async (User, challenge_code, formdata) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/company/warehouse/create-warehouse`, {
      challenge_code,
      formdata,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API createWarehouseApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const createWareZoneApi = async (User, zoneData) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/company/warehouse/create-warezone`, {
      zoneData,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API createWarehouseApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const createRackApi = async (User, rackData) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/company/warehouse/create-racks`, {
      rackData,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API createWarehouseApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const getBox = async (User) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.get(`/user/company/batch/getbox`);
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API getBox ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const createBox = async (User, challenge_code, data) => {
  try {
    setAuthToken_v2(User);

    const res = await api_v2.post(`/user/company/batch/create-box`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-challenge-code": challenge_code,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      ">>> [API createBox ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const confirmStartApi = async (User, order_id, vehicle_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/shipper/order/start`, {
      order_id,
      vehicle_id,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API confirmStartApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const VehicleArrived = async (User, lat, lng, order_id, vehicle_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/shipper/order/arrvied`, {
      order_id,
      vehicle_id,
      lat,
      lng,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API confirmStartApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

const VehicleArrivedArrviver = async (User, lat, lng, order_id, vehicle_id) => {
  try {
    setAuthToken_v2(User);
    const res = await api_v2.post(`/user/shipper/order/arrviedarriver`, {
      order_id,
      vehicle_id,
      lat,
      lng,
    });
    return res.data;
  } catch (error) {
    console.error(
      ">>> [API confirmStartApi ERR]:",
      error.response?.data || error.message,
    );
    return null;
  }
};

export default {
  VehicleArrived,
  VehicleArrivedArrviver,
  update_fcm_token,
  confirmStartApi,
  VehicleArrived,
  getBox,
  createBox,
  createRackApi,
  createWareZoneApi,
  createWarehouseApi,
  getWareHouseApi,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  AcceptAndSignOrder,
  getMyOrder,
  fetchShipperLocationApi,
  orderReadytoPick,
  updateGpsLocation,
  intruckBatch,
  intruckConfirm,
  shipingComplete,
  receivedBatch,
  create_qr_batch,
  confirm_qr_printed,
  QR_batchverifyAPI,
  checkpaymentstatus,
  AcceptShippingOrderApi,
  disAcceptShippingOrderApi,
  getAllVehicleValid,
  pinDriver,
  fetchFleetValidApi,
  set_new_shipping,
  sendShipingREquestAPI,
  getPricedataAPI,
  reupdateBatchAPI,
  getShipingInfo,
  fetchShipOrderAPI,
  submitQCbatch,
  fetchFleets,
  complateBatchedAPI,
  createVehicle,
  handleCreateFleetAPI,
  getOrphanVehicles,
  fetchAllvehicleAPI,
  getStaffs,
  createOrderProduct,
  get_batch_detail,
  user_update_info,
  getProposalProduct,
  updateBatchQuantityApi,
  getCompanyProfile,
  updateProfile,
  OEM_order,
  acceptOEMProduction,
  departMentOEM,
  updateProductSettings,
  fecthORMs,
  onCancelRequestApi,
  onSignContractApi,
  user_upload_avatar,
  onRejectContractTemplateApi,
  onAcceptContractTemplateApi,
  sendContractFile,
  onAcceptRequestApi,
  onRejectRequest,
  newContract,
  extractPdftoText,
  fetchContract,
  getCollaborationProposals,
  sendproposalRequest,
  getnotificationData,
  newPolicy,
  fecthPolicy,
  getQCreadyStatus,
  saveMarketInfo,
  getCompletedBatches,
  getInternalMarketplaceInfo,
  createBatch,
  set_batch_state,
  get_departments,
  getDepartment,
  getProductValid,
  newLeaderDepartment,
  changePartment,
  pushstaffAvatar,
  getTechnicalStaff,
  createTechnicalStaff,
  createProductionStaff,
  getProductionStaff,
  dropProduct,
  updateDepartmentPermission,
  getDepartments,
  createdepartment,
  updateCategoryStatus,
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
