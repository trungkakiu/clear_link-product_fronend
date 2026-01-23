import { createContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import React from "react";
import api_request from "../apicontroller/api_request";
import { toast } from "react-toastify";

export const UserContext = createContext();

const defaultUserStatus = {
  Otp: false,
  Authen: false,
  token: "",
  __persist: false,
  data: null,
};

export const UserProvider = ({ children }) => {
  const history = useHistory();

  const getInitialUser = () => {
    try {
      const local = localStorage.getItem("user");
      if (local) return JSON.parse(local);

      const session = sessionStorage.getItem("user");
      if (session) return JSON.parse(session);

      return defaultUserStatus;
    } catch {
      return defaultUserStatus;
    }
  };

  const [User, setUser] = useState(getInitialUser);

  useEffect(() => {
    if (User.Authen) {
      if (User.__persist) {
        localStorage.setItem("user", JSON.stringify(User));
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("user", JSON.stringify(User));
        localStorage.removeItem("user");
      }
    } else {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  }, [User]);

  const updateUserDataField = (key, value) => {
    setUser((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value,
      },
    }));
  };

  const setOtp = (value) => {
    console.log(value);
    setUser((prev) => ({
      ...prev,
      Otp: value,
      _v: (prev?._v || 0) + 1,
    }));
    console.log(User);
  };

  const login = (userData, token) => {
    setUser((prev) => ({
      ...prev,
      Otp: userData.Otp,
      Authen: true,
      token,
      data: userData.User,
      __persist: true,
      _v: (prev?._v || 0) + 1,
    }));
  };

  const loginWithoutStore = (userData, token) => {
    console.log(userData);
    setUser((prev) => ({
      ...prev,
      Otp: userData.Otp,
      Authen: true,
      token,
      data: userData.User,
      __persist: false,
      _v: (prev?._v || 0) + 1,
    }));
  };

  const logout = async () => {
    try {
      const res = await api_request.logout(User);
      setUser(defaultUserStatus);
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      if (res) {
        if (res.RC === 200) {
          toast.success("Đăng xuất thành công!");
        } else {
          toast.error(res.RM);
        }
      }
      history.replace("/authen/sign-in");
      return;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi đăng xuất!");
      return;
    }
  };

  const refresh_me = async () => {
    try {
      if (User.Authen) {
        const res = await api_request.refresh_me(User.token);
        if (res && res.RC === 200) {
          setUser((prev) => ({
            ...prev,
            data: res.RD.User,
            token: res.RD.Token,
            Otp: res.RD.Otp,
          }));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải thông tin!");
    }
  };

  return (
    <UserContext.Provider
      value={{
        User,
        refresh_me,
        login,
        logout,
        setOtp,
        loginWithoutStore,
        updateUserDataField,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
