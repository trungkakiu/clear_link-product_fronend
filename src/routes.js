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
  Qr_scanner: { path: "/qr-scanner" },
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
  Product_box: { path: "/Products/list-productbox" },
  New_product: { path: "/Products/New_product" },
  Manufacturer_policy: { path: "/Products/policy" },
  Manufacturer_contact_request: { path: "/Products/policy/contact_request" },
  Manufacturer_contractfile: { path: "/Products/policy/contract_profile" },
  Manufacturer_new: { path: "/Products/Manufacturer/new-post" },
  Manufacturer_process: { path: "/Products/Manufacturer/process" },
  Manufacturer_complate: { path: "/Products/Manufacturer/complate" },
  Manufacturer_ORM: { path: "/Products/Manufacturer/ORM" },
  Manufacture_qc: { path: "/Products/Manufacturer/QC" },
  ProductCategory: { path: "/Products/categories" },
  Internal_marketplace: { path: "/internal-marketplace" },
  bill_request: { path: "/Products/bill/management/bill_request" },
  bill_process: { path: "/Products/bill/management/bill_process" },
  bill_history: { path: "/Products/bill/management/bill_history" },
  new_order: { path: "/Products/order/management/new_order" },
  order_trackking: {
    path: "/Products/order/warehouse/management/order_trackking",
  },
  order_history: { path: "/Products/order/management/order_history" },

  Transporter_request: {
    path: "/transpost/transport-order/management/Transporter_request",
  },
  Transporter_process: {
    path: "/transpost/transport-order/management/Transporter_process",
  },
  Transporter_history: {
    path: "/transpost/order/transport-order/management/Transporter_history",
  },
  Transporter_map: { path: "/transpost/tracking/management/Transporter_map" },
  Transporter_checkpoint: {
    path: "/transpost/tracking/Vehicle/management/Transporter_checkpoint",
  },
  Transporter_vehicle_list: {
    path: "/transpost/Vehicle/management/Transporter_vehicle_list",
  },
  Tranporter_fleet_list: { path: "/transporter/Vehicle/fleet/list" },
  Tranporter_fleet_new: { path: "/transporter/Vehicle/fleet/new" },
  Transporter_vehicle_add: {
    path: "/transpost/Vehicle/management/Transporter_vehicle_add",
  },
  Transporter_vehicle_service: {
    path: "/transpost/Vehicle/management/Transporter_vehicle_service",
  },
  Transporter_driver_list: {
    path: "/transpost/driver/management/Transporter_driver_list",
  },
  Transporter_driver_add: {
    path: "/transpost/driver/management/Transporter_driver_add",
  },
  Transporter_transaction: {
    path: "/transpost/management/Transporter_transaction",
  },
  Transporter_price_config: {
    path: "/transpost/management/price_config",
  },

  //=========Transposter Sidebar===============//

  //=========Distributor Sidebar==============//
  Distributor_inventory: { path: "/warehouse/management/transaction_control" },
  Distributor_import: { path: "/warehouse/management/Distributor_import" },
  Distributor_export: { path: "/warehouse/management/Distributor_export" },
  Distributor_orders_new: {
    path: "/order/management/Distributor_orders_new",
  },
  Distributor_orders_in: {
    path: "/order/management/Distributor_orders_in",
  },
  Distributor_orders_out: {
    path: "/order/management/Distributor_orders_out",
  },
  Distributor_order_history: {
    path: "/order/management/Distributor_order_history",
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
  User_profile: { path: "/user/my" },
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
