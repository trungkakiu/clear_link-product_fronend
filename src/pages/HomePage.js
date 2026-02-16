import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

// pages
import Presentation from "./Presentation";
import Upgrade from "./Upgrade";
import DashboardOverview from "./dashboard/DashboardOverview";
import Transactions from "./Transactions";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import ResetPassword from "./examples/ResetPassword";
import Lock from "./examples/Lock";
import NotFoundPage from "./examples/NotFound";
import ServerError from "./examples/ServerError";

// documentation pages
import DocsOverview from "./documentation/DocsOverview";
import DocsDownload from "./documentation/DocsDownload";
import DocsQuickStart from "./documentation/DocsQuickStart";
import DocsLicense from "./documentation/DocsLicense";
import DocsFolderStructure from "./documentation/DocsFolderStructure";
import DocsBuild from "./documentation/DocsBuild";
import DocsChangelog from "./documentation/DocsChangelog";

// components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";
import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Modals from "./components/Modals";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Pagination from "./components/Pagination";
import Popovers from "./components/Popovers";
import Progress from "./components/Progress";
import Tables from "./components/Tables";
import Tabs from "./components/Tabs";
import Tooltips from "./components/Tooltips";
import Toasts from "./components/Toasts";
import PendingActiveWithMail from "./examples/PendingActiveWithMail";
import NewProductForm from "../components/Manufacture/NewProductForm";
import CategoryPage from "../components/Manufacture/CategoryPage";
import Product_list from "../components/Manufacture/Product_list";
import Otp_wait from "../components/Otp_wait";
import DepartmentCardList from "../components/Manufacture/DepartmentCardList";
import productionstaff from "../components/Manufacture/ProductionStaff";
import TechnicalStaff from "../components/Manufacture/TechnicalStaff";
import CompanyMailConfigPage from "../components/Manufacture/CompanyMailConfigPage";

export const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          {" "}
          <Preloader show={loaded ? false : true} />{" "}
          <Component {...props} />{" "}
        </>
      )}
    />
  );
};

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible,
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={loaded ? false : true} />
          <Sidebar />

          <main className="content">
            <Navbar />
            <Component {...props} />
            <Footer
              toggleSettings={toggleSettings}
              showSettings={showSettings}
            />
          </main>
        </>
      )}
    />
  );
};

export default () => (
  <Switch>
    <RouteWithLoader
      exact
      path={Routes.Presentation.path}
      component={DashboardOverview}
    />

    <RouteWithLoader
      exact
      path={Routes.Waiting_active_page.path}
      component={PendingActiveWithMail}
    />

    <RouteWithLoader exact path={Routes.Signin.path} component={Signin} />
    <RouteWithLoader exact path={Routes.Signup.path} component={Signup} />
    <RouteWithLoader
      exact
      path={Routes.ForgotPassword.path}
      component={ForgotPassword}
    />

    <RouteWithLoader
      exact
      path={Routes.ResetPassword.path}
      component={ResetPassword}
    />
    <RouteWithLoader exact path={Routes.Lock.path} component={Lock} />
    <RouteWithLoader
      exact
      path={Routes.NotFound.path}
      component={NotFoundPage}
    />

    <RouteWithLoader
      exact
      path={Routes.ServerError.path}
      component={ServerError}
    />

    <RouteWithSidebar
      exact
      path={Routes.Department.path}
      component={DepartmentCardList}
    />
    <RouteWithSidebar
      exact
      path={Routes.Production_staff.path}
      component={productionstaff}
    />
    <RouteWithSidebar
      exact
      path={Routes.Technical_staff.path}
      component={TechnicalStaff}
    />
    {/* pages */}
    <RouteWithSidebar
      exact
      path={Routes.DashboardOverview.path}
      component={DashboardOverview}
    />

    <RouteWithLoader
      exact
      path={Routes.NotFound.path}
      component={NotFoundPage}
    />
    <RouteWithSidebar
      exact
      path={Routes.Product_list.path}
      component={Product_list}
    />
    <RouteWithSidebar
      exact
      path={Routes.ProductCategory.path}
      component={CategoryPage}
    />
    <RouteWithSidebar
      exact
      path={Routes.Staff_notification.path}
      component={CompanyMailConfigPage}
    />
    <RouteWithSidebar exact path={Routes.Upgrade.path} component={Upgrade} />
    <RouteWithSidebar
      exact
      path={Routes.Transactions.path}
      component={Transactions}
    />
    <RouteWithSidebar exact path={Routes.Settings.path} component={Settings} />

    {/* components */}
    <RouteWithSidebar
      exact
      path={Routes.New_product.path}
      component={NewProductForm}
    />
    <RouteWithSidebar
      exact
      path={Routes.Accordions.path}
      component={Accordion}
    />
    <RouteWithSidebar exact path={Routes.Alerts.path} component={Alerts} />
    <RouteWithSidebar exact path={Routes.Badges.path} component={Badges} />
    <RouteWithSidebar
      exact
      path={Routes.Breadcrumbs.path}
      component={Breadcrumbs}
    />
    <RouteWithSidebar exact path={Routes.Buttons.path} component={Buttons} />
    <RouteWithSidebar exact path={Routes.Forms.path} component={Forms} />
    <RouteWithSidebar exact path={Routes.Modals.path} component={Modals} />
    <RouteWithSidebar exact path={Routes.Navs.path} component={Navs} />
    <RouteWithSidebar exact path={Routes.Navbars.path} component={Navbars} />
    <RouteWithSidebar
      exact
      path={Routes.Pagination.path}
      component={Pagination}
    />
    <RouteWithSidebar exact path={Routes.Popovers.path} component={Popovers} />
    <RouteWithSidebar exact path={Routes.Progress.path} component={Progress} />
    <RouteWithSidebar exact path={Routes.Tables.path} component={Tables} />
    <RouteWithSidebar exact path={Routes.Tabs.path} component={Tabs} />
    <RouteWithSidebar exact path={Routes.Tooltips.path} component={Tooltips} />
    <RouteWithSidebar exact path={Routes.Toasts.path} component={Toasts} />

    {/* documentation */}
    <RouteWithSidebar
      exact
      path={Routes.DocsOverview.path}
      component={DocsOverview}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsDownload.path}
      component={DocsDownload}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsQuickStart.path}
      component={DocsQuickStart}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsLicense.path}
      component={DocsLicense}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsFolderStructure.path}
      component={DocsFolderStructure}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsBuild.path}
      component={DocsBuild}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsChangelog.path}
      component={DocsChangelog}
    />

    <Redirect to={Routes.NotFound.path} />
  </Switch>
);
