import React, { useContext, useEffect, useState } from "react";
import { UserContext, UserProvider } from "./Context/UserContext";
import HomePage from "./pages/HomePage";
import { ToastContainer } from "react-toastify";
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
import api_request from "./apicontroller/api_request";

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

const App = () => {
  const { refresh_me } = useContext(UserContext);
  const { User, setOtp } = useContext(UserContext);
  const { isOpen, setIsOpen } = useModalStore();
  const [isResult, setisResult] = useState(false);
  const [result_otp, setresult_otp] = useState("");
  const location = useLocation();

  useEffect(() => {
    refresh_me();
  }, []);

  const active_otp = async () => {
    if (User.Authen || !User.Otp) {
      setIsOpen(true);
    }
  };

  const forcedOtpRoutes = [];

  const isForced = forcedOtpRoutes.includes(location.pathname);

  const excludedRoutes = [
    Routes.Signin.path,
    Routes.Signup.path,
    "/user/active_role",
    "/user/pending-submit",
  ];

  const openResultOtp = async (data) => {
    setIsOpen(false);
    await setOtp(true);
    setresult_otp(data);
    setisResult(true);
  };

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

  return (
    <>
      <ToastContainer />
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
