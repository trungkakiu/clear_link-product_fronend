export const Routes = {
  // pages
  Presentation: { path: "/" },
  Role_active: { path: "/user/active_role" },
  DashboardOverview: { path: "/dashboard/overview" },
  Waiting_active_page: { path: "/user/pending-submit" },
  Role_register: { path: "/user/role-register" },
  Transactions: { path: "/transactions" },
  Settings: { path: "/system/settings" },
  Infomations: { path: "/system/infomation" },
  Upgrade: { path: "/upgrade" },

  Billing: { path: "/examples/billing" },
  Invoice: { path: "/examples/invoice" },
  Signin: { path: "/authen/sign-in" },
  Signup: { path: "/authen/sign-up" },
  ForgotPassword: { path: "/system/forgot-password" },
  ResetPassword: { path: "/system/reset-password" },
  Lock: { path: "/examples/lock" },
  NotFound: { path: "/examples/404" },

  //=========Manufacturer sidebar==============//
  Technical_staff: { path: "/Users/Technical_list" },
  Department: { path: "/Users/department" },
  Production_staff: { path: "/Users/Production_list" },
  Staff_notification: { path: "/Users/notification" },
  Product_list: { path: "/Products/list-product" },
  New_product: { path: "/Products/New_product" },
  Manufacturer_new: { path: "/Products/Manufacturer/new-post" },
  Manufacturer_process: { path: "/Products/Manufacturer/process" },
  Manufacturer_complate: { path: "/Products/Manufacturer/complate" },
  ProductCategory: { path: "/Products/categories" },
  QCquantity: { path: "/Products/QCquantity/process" },
  bill_request: { path: "/Products/bill/management/bill_request" },
  bill_process: { path: "/Products/bill/management/bill_process" },
  bill_history: { path: "/Products/bill/management/bill_history" },
  new_order: { path: "/Products/order/management/new_order" },
  order_trackking: { path: "/Products/order/management/order_trackking" },
  order_history: { path: "/Products/order/management/order_history" },
  //=========Manufacturer sidebar==============//

  //=========Transposter Sidebar===============//
  Transporter_request: { path: "/transpost/management/Transporter_request" },
  Transporter_process: { path: "/transpost/management/Transporter_process" },
  Transporter_history: { path: "/transpost/management/Transporter_history" },
  Transporter_map: { path: "/transpost/management/Transporter_map" },
  Transporter_checkpoint: {
    path: "/transpost/management/Transporter_checkpoint",
  },
  Transporter_vehicle_list: {
    path: "/transpost/management/Transporter_vehicle_list",
  },
  Transporter_vehicle_add: {
    path: "/transpost/management/Transporter_vehicle_add",
  },
  Transporter_vehicle_service: {
    path: "/transpost/management/Transporter_vehicle_service",
  },
  Transporter_driver_list: {
    path: "/transpost/management/Transporter_driver_list",
  },
  Transporter_driver_add: {
    path: "/transpost/management/Transporter_driver_add",
  },
  Transporter_transaction: {
    path: "/transpost/management/Transporter_transaction",
  },
  //=========Transposter Sidebar===============//

  //=========Distributor Sidebar==============//
  Distributor_inventory: { path: "/warehouse/management/transaction_control" },
  Distributor_import: { path: "/warehouse/management/Distributor_import" },
  Distributor_export: { path: "/warehouse/management/Distributor_export" },
  Distributor_orders_in: {
    path: "/warehouse/management/Distributor_orders_in",
  },
  Distributor_orders_out: {
    path: "/warehouse/management/Distributor_orders_out",
  },
  Distributor_order_history: {
    path: "/warehouse/management/Distributor_order_history",
  },
  Distributor_wait_transport: {
    path: "/warehouse/management/Distributor_wait_transport",
  },
  Distributor_delivery_process: {
    path: "/warehouse/management/Distributor_delivery_process",
  },
  Distributor_transaction: {
    path: "/warehouse/management/Distributor_transaction",
  },
  //=========Distributor Sidebar==============//

  //==========retailer Sideber===============//
  Retailer_import_request: {
    path: "/retailer/management/Retailer_import_request",
  },
  Retailer_import_history: {
    path: "/retailer/management/Retailer_import_history",
  },
  Retailer_inventory: {
    path: "/retailer/management/Retailer_inventory",
  },
  Retailer_check_item: {
    path: "/retailer/management/Retailer_check_item",
  },
  Retailer_new_invoice: {
    path: "/retailer/management/Retailer_new_invoice",
  },
  Retailer_invoice_history: {
    path: "/retailer/management/Retailer_invoice_history",
  },
  Retailer_transaction: {
    path: "/retailer/management/Retailer_transaction",
  },
  //==========retailer Sideber===============//

  transaction: { path: "/transaction/management/transaction_control" },
  ServerError: { path: "/examples/500" },
  wait_otp: { path: "/authen/wait-otp" },

  // docs
  DocsOverview: { path: "/documentation/overview" },
  DocsDownload: { path: "/documentation/download" },
  DocsQuickStart: { path: "/documentation/quick-start" },
  DocsLicense: { path: "/documentation/license" },
  DocsFolderStructure: { path: "/documentation/folder-structure" },
  DocsBuild: { path: "/documentation/build-tools" },
  DocsChangelog: { path: "/documentation/changelog" },

  // components
  Accordions: { path: "/components/accordions" },
  Alerts: { path: "/components/alerts" },
  Badges: { path: "/components/badges" },
  Widgets: { path: "/widgets" },
  Breadcrumbs: { path: "/components/breadcrumbs" },
  Buttons: { path: "/components/buttons" },
  Forms: { path: "/components/forms" },
  Modals: { path: "/components/modals" },
  Navs: { path: "/components/navs" },
  Navbars: { path: "/components/navbars" },
  Pagination: { path: "/components/pagination" },
  Popovers: { path: "/components/popovers" },
  Progress: { path: "/components/progress" },
  Tables: { path: "/components/tables" },
  Tabs: { path: "/components/tabs" },
  Tooltips: { path: "/components/tooltips" },
  Toasts: { path: "/components/toasts" },
  WidgetsComponent: { path: "/components/widgets" },
};
