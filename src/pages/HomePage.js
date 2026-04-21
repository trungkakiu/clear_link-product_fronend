import React, { useState, useEffect, useContext } from "react";
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
import CreateBatchForm from "../components/Manufacture/CreateBatchForm";
import DepartmentVisualizer from "../components/Manufacture/DepartmentVisualizer";
import CompletedBatches from "../components/Manufacture/CompletedBatches";
import QCPage from "../components/Manufacture/QCPage";
import { UserContext } from "../Context/UserContext";
import InternalMarketplace from "../components/InternalMarketplace";
import PolicyManagement from "../components/Manufacture/PolicyManagement";
import CollaborationProposals from "../components/Manufacture/CollaborationProposals";
import ContractManagement from "../components/Manufacture/ContractManagement";
import ActorInformation from "../components/ActorInformation";
import OEMproductions from "../components/Manufacture/OEMproductions";
import CompanyProfile from "../components/CompanyProfile";
import Proposal_product from "../components/Distributor/Proposal_product";
import OrderProcess from "../components/Distributor/OrderProcess";
import AddVehiclePage from "../components/Transporter/AddVehiclePage";
import Allvehicles from "../components/Transporter/Allvehicles";
import AddFleetPage from "../components/Transporter/AddFleetPage";
import FleetsPage from "../components/Transporter/FleetsPage";
import NewShipingOrder from "../components/Manufacture/NewShipingOrder";
import ShipOrderProcess from "../components/Manufacture/ShipOrderProcess";
import ShippingOrder from "../components/Transporter/ShippingOrder";
import ShippingPriceSettings from "../components/Transporter/ShippingPriceSettings";
import QrScannerPage from "../components/Manufacture/QrScannerPage";
import DriverNavigation from "../components/Transporter/DriverNavigation";
import WarehouseManager from "../components/WarehouseManager";
import PackagingManager from "../components/Manufacture/PackagingManager";

export const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoaded(true);
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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

const RouteWithSidebar = ({ component: Component, minLevel, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const { User } = useContext(UserContext);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoaded(true);
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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

  const userLevelNum = parseInt(User?.level?.split("_")[1]) || 0;
  const requiredLevelNum =
    typeof minLevel === "string"
      ? parseInt(minLevel.split("_")[1])
      : minLevel || 0;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!User) {
          return <Redirect to={Routes.Signin.path} />;
        }

        if (requiredLevelNum > 0 && userLevelNum < requiredLevelNum) {
          return <Redirect to={Routes.NotFound.path} />;
        }

        return (
          <>
            <Preloader show={!loaded} />
            <Sidebar level={User.level} />
            <main
              className="content d-flex flex-column"
              style={{ minHeight: "100vh" }}
            >
              <Navbar />

              <div className="flex-grow-1">
                <Component {...props} />
              </div>

              <Footer
                toggleSettings={toggleSettings}
                showSettings={showSettings}
              />
            </main>
          </>
        );
      }}
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
      path={"/navigation/:lng_start,:lat_start/:lng_end,:lat_end/:order"}
      component={DriverNavigation}
    />
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
      path={Routes.User_profile.path}
      component={ActorInformation}
    />

    <RouteWithLoader
      exact
      path={Routes.ServerError.path}
      component={ServerError}
    />

    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_ORM.path}
      component={OEMproductions}
    />
    <RouteWithSidebar
      exact
      path={Routes.Product_box.path}
      component={PackagingManager}
    />
    <RouteWithSidebar
      exact
      path={Routes.Distributor_inventory.path}
      component={WarehouseManager}
    />

    <RouteWithSidebar
      exact
      path={Routes.Qr_scanner.path}
      component={QrScannerPage}
    />
    <RouteWithSidebar
      exact
      path={Routes.Transporter_vehicle_list.path}
      component={Allvehicles}
    />

    <RouteWithSidebar
      exact
      path={Routes.Tranporter_fleet_new.path}
      component={AddFleetPage}
    />

    <RouteWithSidebar
      exact
      path={Routes.Tranporter_fleet_list.path}
      component={FleetsPage}
    />

    <RouteWithSidebar
      exact
      path={Routes.order_trackking.path}
      component={ShipOrderProcess}
    />
    <RouteWithSidebar
      exact
      path={Routes.Transporter_request.path}
      component={ShippingOrder}
    />
    <RouteWithSidebar
      exact
      path={Routes.Transporter_price_config.path}
      component={ShippingPriceSettings}
    />
    <RouteWithSidebar
      exact
      path={Routes.new_order.path}
      component={NewShipingOrder}
    />

    <RouteWithSidebar
      exact
      path={Routes.Transporter_vehicle_add.path}
      component={AddVehiclePage}
    />
    <RouteWithSidebar
      exact
      path={Routes.Infomations.path}
      component={CompanyProfile}
    />
    <RouteWithSidebar
      exact
      path={Routes.Department.path}
      component={DepartmentCardList}
    />
    <RouteWithSidebar
      exact
      path={Routes.Internal_marketplace.path}
      component={InternalMarketplace}
    />

    <RouteWithSidebar
      exact
      path={Routes.Distributor_orders_new.path}
      component={Proposal_product}
    />

    <RouteWithSidebar
      exact
      path={Routes.Distributor_orders_in.path}
      component={OrderProcess}
    />
    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_policy.path}
      component={PolicyManagement}
    />
    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_contact_request.path}
      component={CollaborationProposals}
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
    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_contractfile.path}
      component={ContractManagement}
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
      path={Routes.Manufacturer_process.path}
      component={DepartmentVisualizer}
    />
    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_complate.path}
      component={CompletedBatches}
    />
    <RouteWithSidebar
      exact
      path={Routes.Manufacture_qc.path}
      component={QCPage}
    />
    <RouteWithSidebar
      exact
      path={Routes.Manufacturer_new.path}
      component={CreateBatchForm}
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
