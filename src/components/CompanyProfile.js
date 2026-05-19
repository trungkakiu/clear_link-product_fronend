import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Image,
  InputGroup,
  Spinner,
  ProgressBar,
  Modal,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSave,
  faBuilding,
  faPhone,
  faUserTie,
  faIndustry,
  faFileInvoice,
  faWarehouse,
  faTruckLoading,
  faStore,
  faSitemap,
  faTruck,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faEdit,
  faTimes,
  faWallet,
  faShieldAlt,
  faLock,
  faUniversity,
  faCheckCircle,
  faSearch,
  faInfoCircle,
  faClock,
  faExclamationTriangle,
  faQrcode,
  faArrowLeft,
  faLifeRing,
  faFileUpload,
  faCloudUploadAlt,
  faEye,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop from "react-image-crop";
import { toast } from "react-toastify";
import { UserContext } from "../Context/UserContext";
import api_request from "../apicontroller/api_request";
import moment from "moment";
import "../scss/volt/components/CompanyProfile.scss";
import RocketLoad from "../Utils/RocketLoad";
import Otp_verify_dynamic from "./Modal/Otp_verify_dynamic";
import MapLocationPicker from "./MapLocationPicker";
import MapPreview from "./MapPreview";
import jsQR from "jsqr";

const Bankinfo = [
  {
    bin: "970436",
    shortName: "Vietcombank",
    fullName: "Ngân hàng TMCP Ngoại thương Việt Nam (VCB)",
  },
  {
    bin: "970415",
    shortName: "VietinBank",
    fullName: "Ngân hàng TMCP Công thương Việt Nam (ICB)",
  },
  {
    bin: "970418",
    shortName: "BIDV",
    fullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
  },
  {
    bin: "970405",
    shortName: "Agribank",
    fullName: "Ngân hàng NN&PT Nông thôn Việt Nam (VBA)",
  },
  { bin: "970422", shortName: "MB", fullName: "Ngân hàng TMCP Quân đội (MB)" },
  {
    bin: "970407",
    shortName: "Techcombank",
    fullName: "Ngân hàng TMCP Kỹ thương Việt Nam (TCB)",
  },
  { bin: "970416", shortName: "ACB", fullName: "Ngân hàng TMCP Á Châu (ACB)" },
  {
    bin: "970432",
    shortName: "VPBank",
    fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPB)",
  },
  {
    bin: "970423",
    shortName: "TPBank",
    fullName: "Ngân hàng TMCP Tiên Phong (TPB)",
  },
  {
    bin: "970403",
    shortName: "Sacombank",
    fullName: "Ngân hàng TMCP Sài Gòn Thương Tín (STB)",
  },
  {
    bin: "970437",
    shortName: "HDBank",
    fullName: "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh (HDB)",
  },
  {
    bin: "970441",
    shortName: "VIB",
    fullName: "Ngân hàng TMCP Quốc tế Việt Nam (VIB)",
  },
  {
    bin: "970443",
    shortName: "SHB",
    fullName: "Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)",
  },
  {
    bin: "970440",
    shortName: "SeABank",
    fullName: "Ngân hàng TMCP Đông Nam Á (SEAB)",
  },
  {
    bin: "970426",
    shortName: "MSB",
    fullName: "Ngân hàng TMCP Hàng Hải Việt Nam (MSB)",
  },
  {
    bin: "970449",
    shortName: "LPBank",
    fullName: "Ngân hàng TMCP Lộc Phát Việt Nam (LPB)",
  },
  {
    bin: "970431",
    shortName: "Eximbank",
    fullName: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam (EIB)",
  },
  {
    bin: "970448",
    shortName: "OCB",
    fullName: "Ngân hàng TMCP Phương Đông (OCB)",
  },
  {
    bin: "970428",
    shortName: "NamABank",
    fullName: "Ngân hàng TMCP Nam Á (NAB)",
  },
  {
    bin: "970419",
    shortName: "NCB",
    fullName: "Ngân hàng TMCP Quốc Dân (NCB)",
  },
  {
    bin: "970427",
    shortName: "VietABank",
    fullName: "Ngân hàng TMCP Việt Á (VAB)",
  },
  {
    bin: "970409",
    shortName: "BacABank",
    fullName: "Ngân hàng TMCP Bắc Á (BAB)",
  },
  { bin: "970429", shortName: "SCB", fullName: "Ngân hàng TMCP Sài Gòn (SCB)" },
  {
    bin: "970452",
    shortName: "KienLongBank",
    fullName: "Ngân hàng TMCP Kiên Long (KLB)",
  },
  {
    bin: "970430",
    shortName: "PGBank",
    fullName: "Ngân hàng TMCP Thịnh vượng và Phát triển (PGB)",
  },
  {
    bin: "970433",
    shortName: "VietBank",
    fullName: "Ngân hàng TMCP Việt Nam Thương Tín (VBB)",
  },
  {
    bin: "970400",
    shortName: "Saigonbank",
    fullName: "Ngân hàng TMCP Sài Gòn Công Thương (SGB)",
  },
  {
    bin: "970406",
    shortName: "DongABank",
    fullName: "Ngân hàng TMCP Đông Á (DOB)",
  },
  {
    bin: "970438",
    shortName: "BaoVietBank",
    fullName: "Ngân hàng TMCP Bảo Việt (BVB)",
  },
  {
    bin: "970414",
    shortName: "OceanBank",
    fullName: "Ngân hàng Thương mại TNHH MTV Đại Dương (OCEANBANK)",
  },
  {
    bin: "970444",
    shortName: "CBBank",
    fullName: "Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam (CBB)",
  },
  {
    bin: "970408",
    shortName: "GPBank",
    fullName: "Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu (GPB)",
  },
  {
    bin: "970424",
    shortName: "ShinhanBank",
    fullName: "Ngân hàng TNHH MTV Shinhan Việt Nam (SHBVN)",
  },
  {
    bin: "970410",
    shortName: "StandardChartered",
    fullName: "Ngân hàng TNHH MTV Standard Chartered Việt Nam (SCVN)",
  },
  {
    bin: "970439",
    shortName: "PublicBank",
    fullName: "Ngân hàng TNHH MTV Public Việt Nam (PBVN)",
  },
  {
    bin: "970458",
    shortName: "UOB",
    fullName: "Ngân hàng TNHH MTV United Overseas Bank (UOB)",
  },
  {
    bin: "970421",
    shortName: "VRB",
    fullName: "Ngân hàng Liên doanh Việt - Nga (VRB)",
  },
  { bin: "963388", shortName: "Timo", fullName: "Ngân hàng số Timo (TIMO)" },
  {
    bin: "546034",
    shortName: "Cake",
    fullName: "Ngân hàng số CAKE by VPBank (CAKE)",
  },
  {
    bin: "970490",
    shortName: "ViettelMoney",
    fullName: "Tổng Công ty Dịch vụ số Viettel (VTLMONEY)",
  },
  {
    bin: "970495",
    shortName: "VNPTMoney",
    fullName: "Ví điện tử VNPT Money (VNPTMONEY)",
  },
];

const CompanyProfile = () => {
  const API_IMG = process.env.REACT_APP_API_IMAGE_URL || "";
  const { User } = useContext(UserContext);

  // ================= STATES: MAIN PROFILE =================
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'wallet'
  const [modalState, setmodalState] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const currentRole = User?.data?.role?.toUpperCase();

  // ================= STATES: WALLET & QR WIZARD =================
  const [walletData, setWalletData] = useState(null);
  const [Qrverify, setQrverify] = useState("");
  const [loadQr, setQrload] = useState(false);

  // Dữ liệu dùng cho Form Nhập liệu (Bước 1)
  const [bankData, setBankData] = useState({
    bin: "970436",
    account_number: "",
  });
  const [detectedName, setDetectedName] = useState("");

  // Dữ liệu bóc tách từ QR hoặc dùng chung cho Modal Thay Đổi Tài Khoản
  const [parsedAccountData, setParsedAccountData] = useState({
    rawString: "",
    bankBin: "",
    accountNumber: "",
    accountName: "",
    isNameHidden: false,
  });

  // ================= STATES: MODALS & IMAGE CROP =================
  const [showKycModal, setShowKycModal] = useState(false);
  const [showViewKycModal, setShowViewKycModal] = useState(false);
  const [showChangeAccountModal, setShowChangeAccountModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  const [kycFile, setKycFile] = useState(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const [imageSrcToCrop, setImageSrcToCrop] = useState(null);
  const [cropConfig, setCropConfig] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImagePreview, setCroppedImagePreview] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const imgRef = useRef(null);

  // ================= HELPER FUNCTIONS =================
  const normalizeCompanyName = (str) => {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Xóa toàn bộ dấu alpha
      .replace(/Đ/g, "D")
      .replace(/đ/g, "d")
      .toUpperCase()
      .trim()
      .replace(/\s+/g, " ");
  };

  const convertBase64ToFile = (base64String, filename = "cropped-qr.png") => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const isNameWalletMatched =
    normalizeCompanyName(parsedAccountData?.accountName) ===
    normalizeCompanyName(walletData?.account_name);
  const isbankpinMatched =
    String(parsedAccountData?.bankBin || "").trim() ===
    String(walletData?.bank_code || "").trim();
  const isbanknumberMatched =
    String(parsedAccountData?.accountNumber || "").trim() ===
    String(walletData?.account_number || "").trim();
  const isQrValidToSave =
    isNameWalletMatched && isbankpinMatched && isbanknumberMatched;

  const roleSpecificFields = {
    MANUFACTURER: [
      {
        label: "Năng lực sản xuất",
        key: "production_capacity",
        type: "number",
        icon: faIndustry,
        unit: "SP/Tháng",
      },
      {
        label: "Mã số thuế",
        key: "tax_code",
        type: "text",
        icon: faFileInvoice,
      },
      {
        label: "Địa chỉ nhà máy",
        key: "location",
        type: "text",
        icon: faMapMarkerAlt,
      },
    ],
    DISTRIBUTOR: [
      {
        label: "Vị trí kho bãi",
        key: "warehouse_location",
        type: "text",
        icon: faWarehouse,
      },
      {
        label: "Khả năng cung ứng",
        key: "delivery_capacity",
        type: "text",
        icon: faTruckLoading,
      },
      {
        label: "Số lượng đại lý",
        key: "agency_count",
        type: "number",
        icon: faSitemap,
      },
    ],
    RETAILER: [
      {
        label: "Địa chỉ cửa hàng",
        key: "store_address",
        type: "text",
        icon: faStore,
      },
      {
        label: "Số lượng chi nhánh",
        key: "branch_count",
        type: "number",
        icon: faSitemap,
      },
      {
        label: "Dòng sản phẩm chính",
        key: "product_lines",
        type: "text",
        icon: faTruckLoading,
      },
    ],
    TRANSPORTER: [
      {
        label: "Số lượng đội xe",
        key: "fleet_count",
        type: "number",
        icon: faTruck,
      },
      {
        label: "Khu vực hoạt động",
        key: "operation_area",
        type: "text",
        icon: faMapMarkedAlt,
      },
      {
        label: "Tải trọng tối đa",
        key: "max_capacity",
        type: "text",
        icon: faTruckLoading,
      },
    ],
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (walletData) {
      setBankData({
        bin: walletData.bank_code || "970436",
        account_number: walletData.account_number || "",
      });
      setDetectedName(walletData.account_name || "");
    }
  }, [walletData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api_request.getCompanyProfile(User);
      if (res?.RC === 200) {
        setProfileData(res.RD.company_info);
        setWalletData(res.RD.walletData);
        setQrverify(res.RD.Qrwallet);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (challen_code) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== null) formData.append(key, profileData[key]);
      });
      if (selectedFile) formData.append("logo_file", selectedFile);

      const res = await api_request.updateProfile(User, challen_code, formData);
      if (res?.RC === 200) {
        toast.success("Cập nhật hồ sơ thành công!");
        setEditMode(false);
        return { RM: res.RM, RC: 200 };
      }
      return { RM: res.RM, RC: res.RC };
    } catch (error) {
      toast.error("Lỗi khi cập nhật!");
      return { RM: "Lỗi hệ thống!", RC: 500 };
    } finally {
      setLoading(false);
    }
  };

  const genQrcode = async () => {
    try {
      setQrload(true);
      const res = await api_request.genQrcode(User, profileData.id, {
        bank_bin: bankData.bin,
        account_number: bankData.account_number,
        account_name: detectedName,
      });
      if (res && res.RC === 200) {
        setQrverify(res.RD);
        toast.success("Đã ghi nhận thông tin, vui lòng quét QR để xác thực!");
        fetchData();
      } else {
        toast.error(res?.RM || "Không thể tạo mã xác thực. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setQrload(false);
    }
  };

  const handleUpdateWalletFromModal = async () => {
    const targetBin = parsedAccountData?.bankBin;
    const targetAccountNumber = parsedAccountData?.accountNumber;
    const targetAccountName = parsedAccountData?.accountName;

    if (!targetBin || !targetAccountNumber || !targetAccountName) {
      return toast.error(
        "Vui lòng điền đầy đủ thông tin tài khoản ngân hàng mới!",
      );
    }

    if (
      !window.confirm(
        "CẢNH BÁO: Việc thay đổi tài khoản ngân hàng sẽ HỦY trạng thái xác thực hiện tại. Ví sẽ tạm khóa và chuyển về trạng thái Chờ duyệt lại. Bạn chắc chắn muốn đổi?",
      )
    )
      return;

    try {
      setLoading(true);
      const res = await api_request.genQrcode(User, profileData.id, {
        bank_bin: targetBin,
        account_number: targetAccountNumber,
        account_name: targetAccountName,
      });

      const rc = res?.RC;
      const rm = res?.RM;

      if (rc === 201 || rc === 200) {
        toast.success(rm || "Đã cập nhật thông tin tài khoản ví mới!");
        setShowChangeAccountModal(false);
        fetchData();
      } else {
        toast.error(rm || "Lỗi xử lý cấu hình ví!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi đường truyền máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadQr = async () => {
    if (!croppedImagePreview) {
      return toast.warning(
        "Vui lòng khoanh vùng và quét mã QR thành công trước khi tải lên!",
      );
    }
    try {
      setLoading(true);
      const qrFilePhysical = convertBase64ToFile(
        croppedImagePreview,
        `QR-${Date.now()}.png`,
      );
      const formdata = new FormData();
      formdata.append("QR_file", qrFilePhysical);

      const res = await api_request.uploadCompanyQrCode(User, formdata);
      const rc = res?.RC;
      const rm = res?.RM;

      if (rc === 200) {
        toast.success(rm || "Tải lên ảnh mã VietQR doanh nghiệp thành công!");
        setShowConfirmModal(false);
        fetchData();
      } else {
        toast.error(rm || "Không thể tải lên ảnh mã QR. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error(">>> [handleUploadQr ERROR]:", error);
      toast.error("Lỗi hệ thống khi tải lên mã QR!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    document.getElementById("hidden-qr-input").click();
  };

  const handleQrFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrcToCrop(event.target.result);
        setCropConfig(null);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const parseVietQrString = (qrText) => {
    const result = {
      rawString: qrText,
      bankBin: "",
      accountNumber: "",
      accountName: "",
      isNameHidden: false,
    };
    try {
      let i = 0;
      const tags = {};
      while (i < qrText.length) {
        const tag = qrText.substring(i, i + 2);
        const length = parseInt(qrText.substring(i + 2, i + 4), 10);
        const value = qrText.substring(i + 4, i + 4 + length);
        tags[tag] = value;
        i += 4 + length;
      }
      if (tags["38"]) {
        let t38 = tags["38"];
        let j = 0;
        const sub38 = {};
        while (j < t38.length) {
          const subTag = t38.substring(j, j + 2);
          const subLen = parseInt(t38.substring(j + 2, j + 4), 10);
          const subVal = t38.substring(j + 4, j + 4 + subLen);
          sub38[subTag] = subVal;
          j += 4 + subLen;
        }
        if (sub38["01"]) {
          let t01 = sub38["01"];
          let k = 0;
          const sub01 = {};
          while (k < t01.length) {
            const ssTag = t01.substring(k, k + 2);
            const ssLen = parseInt(t01.substring(k + 2, k + 4), 10);
            const ssVal = t01.substring(k + 4, k + 4 + ssLen);
            sub01[ssTag] = ssVal;
            k += 4 + ssLen;
          }
          result.bankBin = sub01["00"] || "";
          result.accountNumber = sub01["01"] || "";
        }
      }
      if (tags["59"]) {
        result.accountName = tags["59"].replace(/_/g, " ");
      } else {
        result.accountName = "Bảo mật ngân hàng (Cần tra cứu)";
        result.isNameHidden = true;
      }
    } catch (err) {
      console.error("Lỗi kiến trúc TLV:", err);
    }
    return result;
  };

  const handleCropAndScan = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.warning("Vui lòng khoanh vùng mã QR trước khi quét!");
      return;
    }

    setIsDecoding(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      setCroppedImagePreview(canvas.toDataURL("image/png"));

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        const parsedData = parseVietQrString(code.data);
        setParsedAccountData(parsedData);
        setShowCropModal(false);
        setShowConfirmModal(true);
      } else {
        toast.error("Vùng bạn cắt không chứa mã QR hợp lệ, hoặc ảnh quá mờ!");
      }
    } catch (e) {
      toast.error("Lỗi khi xử lý ảnh cắt!");
    } finally {
      setIsDecoding(false);
    }
  };

  if (!profileData || (loading && !editMode)) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "75vh",
        }}
      >
        <RocketLoad />
      </div>
    );
  }

  return (
    <Container fluid className="aws-profile-wrapper py-4 px-4">
      <Otp_verify_dynamic
        close={() => setmodalState(false)}
        closeReload={() => {
          setmodalState(false);
          fetchData();
        }}
        message={"Để thay đổi thông tin doanh nghiệp hãy xác thực mã PIN!"}
        onSuccess={(challen_code) => handleUpdate(challen_code)}
        show={modalState}
        title={"PIN VERIFY"}
      />

      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <div className="aws-header-banner"></div>
        <Card.Body className="pt-0 px-4 pb-0">
          <Row className="align-items-end mb-3">
            <Col xs="auto" className="avatar-col">
              <div className="profile-avatar-container">
                <Image
                  src={
                    previewUrl
                      ? previewUrl
                      : profileData.logo
                        ? `${API_IMG}Company-logo/${profileData.logo}`
                        : "https://via.placeholder.com/150"
                  }
                  className="profile-logo shadow border-4 border-white"
                />
                {editMode && (
                  <label htmlFor="logo-upload" className="avatar-edit-badge">
                    <FontAwesomeIcon icon={faCamera} />
                    <input
                      type="file"
                      id="logo-upload"
                      hidden
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </Col>
            <Col className="pb-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h3 className="fw-bold mb-1 text-main">
                    {profileData.company_name}
                  </h3>
                  <div className="d-flex gap-2 align-items-center">
                    <Badge
                      bg="aws-orange-soft"
                      className="text-aws-orange text-uppercase"
                    >
                      {currentRole}
                    </Badge>
                    <Badge bg="gray-100" className="text-muted border">
                      ID: {profileData.id}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 mt-md-0">
                  {activeTab === "profile" && !editMode && (
                    <Button
                      variant="outline-primary"
                      className="btn-aws-edit shadow-sm"
                      onClick={() => setEditMode(true)}
                    >
                      <FontAwesomeIcon icon={faEdit} className="me-2" /> Sửa
                      thông tin
                    </Button>
                  )}
                  {activeTab === "profile" && editMode && (
                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        onClick={() => setEditMode(false)}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Hủy
                      </Button>
                      <Button
                        variant="success"
                        className="text-white shadow-sm"
                        onClick={() => setmodalState(true)}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" /> Lưu
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
          <div className="aws-tabs-nav mt-2">
            <div
              className={`aws-tab-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FontAwesomeIcon icon={faBuilding} className="me-2" /> Hồ Sơ &
              Năng Lực
            </div>
            <div
              className={`aws-tab-item ${activeTab === "wallet" ? "active" : ""}`}
              onClick={() => setActiveTab("wallet")}
            >
              <FontAwesomeIcon icon={faWallet} className="me-2" /> Ví Tài Chính
              & Ngân Hàng
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="tab-content-wrapper fade-in-tab">
        {activeTab === "profile" && (
          <Row className="g-4">
            <Col xl={7} lg={7} md={12}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                  <h5 className="fw-bold">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-aws-orange me-2"
                    />{" "}
                    Hồ sơ năng lực & Pháp lý
                  </h5>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Tên doanh nghiệp
                      </Form.Label>
                      <Form.Control
                        disabled={!editMode}
                        value={profileData.company_name}
                        className="aws-input"
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="aws-label">
                        Số giấy phép kinh doanh
                      </Form.Label>
                      <Form.Control
                        disabled={!editMode}
                        value={profileData.license_number}
                        className="aws-input"
                      />
                    </Col>
                    {roleSpecificFields[currentRole]?.map((field) => (
                      <Col md={6} key={field.key}>
                        <Form.Label className="aws-label">
                          {field.label}
                        </Form.Label>
                        <InputGroup className="aws-input-group">
                          <InputGroup.Text className="bg-light border-end-0">
                            <FontAwesomeIcon
                              icon={field.icon}
                              className="text-muted"
                            />
                          </InputGroup.Text>
                          <Form.Control
                            disabled={!editMode}
                            type={field.type}
                            value={profileData[field.key] || ""}
                            className="aws-input border-start-0"
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                [field.key]: e.target.value,
                              })
                            }
                          />
                          {field.unit && (
                            <InputGroup.Text className="bg-light small">
                              {field.unit}
                            </InputGroup.Text>
                          )}
                        </InputGroup>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={5} lg={5} md={12}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                  <h5 className="fw-bold">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-aws-orange me-2"
                    />{" "}
                    Liên hệ trực tiếp
                  </h5>
                </Card.Header>
                <Card.Body className="px-4 pb-4 d-flex flex-column justify-content-center">
                  <div className="contact-grid">
                    <div className="contact-box mb-3">
                      <FontAwesomeIcon icon={faUserTie} className="icon" />
                      <div className="content">
                        <small>Người phụ trách</small>
                        <Form.Control
                          disabled={!editMode}
                          size="sm"
                          value={profileData.contact_person}
                          className="aws-input-inline"
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              contact_person: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="contact-box">
                      <FontAwesomeIcon icon={faPhone} className="icon" />
                      <div className="content">
                        <small>Hotline</small>
                        <Form.Control
                          disabled={!editMode}
                          size="sm"
                          value={
                            profileData.contact_phone ||
                            profileData.contact_number ||
                            ""
                          }
                          className="aws-input-inline"
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              contact_phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-top">
                    <Form.Label className="aws-label small text-muted">
                      Trạng thái hệ thống
                    </Form.Label>
                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                      <Badge
                        bg={
                          profileData.status === "active"
                            ? "success"
                            : "warning"
                        }
                      >
                        {profileData.status === "active"
                          ? "ĐANG HOẠT ĐỘNG"
                          : "TẠM NGỪNG"}
                      </Badge>
                      <Badge bg="info" className="text-white">
                        CHAIN: {profileData.chain_status}
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={12} className="mt-2">
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold m-0">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-aws-orange me-2"
                    />{" "}
                    Vị trí xác thực trên TraceChain
                  </h5>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {editMode ? (
                    <div className="aws-map-setup p-0 rounded bg-white border-0">
                      <div className="instructions mb-3 p-3 bg-aws-navy-light rounded border-start border-3 border-aws-orange">
                        <h6 className="fw-bold small text-aws-navy mb-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="me-2 text-aws-orange"
                          />{" "}
                          Cập nhật vị trí GPS:
                        </h6>
                        <p className="x-small text-muted mb-0">
                          Sử dụng thanh tìm kiếm hoặc{" "}
                          <strong>click trực tiếp lên bản đồ</strong> để ghim vị
                          trí mới. Dữ liệu này sẽ được dùng để tính toán lộ
                          trình vận chuyển.
                        </p>
                      </div>
                      <MapLocationPicker
                        label="Tìm kiếm & Ghim vị trí"
                        height="400px"
                        initialCoords={
                          profileData.latitude && profileData.longitude
                            ? {
                                lat: profileData.latitude,
                                lng: profileData.longitude,
                              }
                            : null
                        }
                        onSelect={(data) => {
                          if (data)
                            setProfileData({
                              ...profileData,
                              location: data.address,
                              latitude: data.lat,
                              longitude: data.lng,
                            });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aws-map-view">
                      {profileData.latitude && profileData.longitude ? (
                        <MapPreview
                          lat={parseFloat(profileData.latitude)}
                          lng={parseFloat(profileData.longitude)}
                          address={profileData.location}
                          height="400px"
                        />
                      ) : (
                        <div className="text-center py-5 bg-light rounded border border-dashed text-muted">
                          <FontAwesomeIcon
                            icon={faMapMarkedAlt}
                            size="2x"
                            className="mb-2 opacity-25"
                          />
                          <p className="small mb-0">
                            Chưa có thông tin tọa độ GPS. Hãy nhấn chỉnh sửa để
                            cập nhật.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === "wallet" && (
          <div className="aws-wallet-wrapper animation-fade-in">
            {walletData && walletData.status === "active" ? (
              <Row className="g-4">
                <Col lg={4} md={6}>
                  <Card className="aws-wallet-card balance-card border-0 shadow-sm h-100 position-relative overflow-hidden hover-bounce">
                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="aws-label text-white-50 text-uppercase tracking-wider font-small fw-bold">
                              Số dư khả dụng hiện tại
                            </span>
                            <h2 className="balance-amount text-white fw-900 mt-2 mb-0 font-display">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(walletData.balance || 0)}
                            </h2>
                          </div>
                          <Badge
                            bg="success"
                            className="px-3 py-2 text-uppercase font-weight-bold shadow-sm animate-pulse-green"
                          >
                            {walletData.status}
                          </Badge>
                        </div>

                        <div className="frozen-box d-flex align-items-center p-3 rounded-3 mb-4 bg-white bg-opacity-10 backdrop-blur">
                          <div className="icon-box-glow me-3 bg-warning bg-opacity-20 p-2 rounded-circle">
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-warning text-lg"
                            />
                          </div>
                          <div>
                            <span className="text-white-50 small fw-bold text-uppercase block tracking-wide">
                              Tiền đang ký quỹ (Escrow)
                            </span>
                            <h4 className="text-white mb-0 fw-bold mt-1">
                              {new Intl.NumberFormat("vi-VN").format(
                                walletData.frozen_balance || 0,
                              )}{" "}
                              <span className="font-small">đ</span>
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="limit-section border-top border-white border-opacity-10 pt-3">
                        <div className="d-flex justify-content-between small text-white-50 mb-2 fw-bold">
                          <span>Hạn mức rút tiền trong ngày</span>
                          <span className="text-white">
                            {new Intl.NumberFormat("vi-VN").format(
                              walletData.daily_payout_limit || 100000000,
                            )}{" "}
                            đ
                          </span>
                        </div>
                        <ProgressBar
                          variant="warning"
                          now={20}
                          className="aws-progress mb-2 progress-animated-glow"
                          style={{ height: 6, borderRadius: 10 }}
                        />
                        <div className="small text-white-50 d-flex align-items-center">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="me-2 text-warning animate-spin-slow"
                          />
                          <span>
                            Rút lần cuối:{" "}
                            {walletData.last_payout_time
                              ? moment(walletData.last_payout_time).format(
                                  "DD/MM/YYYY HH:mm",
                                )
                              : "Chưa có giao dịch"}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4} md={6}>
                  <Card className="border-0 shadow-sm h-100 aws-bank-card position-relative overflow-hidden hover-bounce">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                      <h5 className="fw-black m-0 text-aws-navy d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faUniversity}
                          className="text-aws-orange me-2 text-lg"
                        />{" "}
                        Tài khoản thụ hưởng
                      </h5>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4 pt-2 d-flex flex-column justify-content-between">
                      <div className="bank-ticket p-4 rounded-3 mb-4 flex-grow-1 position-relative credit-card-glow">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <span className="text-uppercase fw-extrabold text-muted tracking-widest font-medium">
                            {walletData.bank_code}
                          </span>
                          <Badge
                            bg={walletData.is_verified ? "success" : "warning"}
                            className="p-2 px-3 rounded-pill shadow-sm"
                          >
                            <FontAwesomeIcon
                              icon={
                                walletData.is_verified
                                  ? faCheckCircle
                                  : faExclamationTriangle
                              }
                              className="me-1"
                            />
                            {walletData.is_verified
                              ? "Đã xác thực"
                              : "Chờ xử lý"}
                          </Badge>
                        </div>
                        <div className="card-number-wrapper my-3">
                          <span className="small text-muted block text-uppercase tracking-wider fw-bold">
                            Số tài khoản
                          </span>
                          <h3 className="fw-900 letter-spacing-3 text-aws-navy mb-1 mt-1 font-monospace text-glow-dark">
                            {walletData.account_number}
                          </h3>
                        </div>
                        <div className="card-holder-name mt-3">
                          <span className="small text-muted block text-uppercase tracking-wider fw-bold">
                            Chủ tài khoản
                          </span>
                          <div className="text-aws-navy text-uppercase fw-black tracking-wide font-medium mt-1">
                            {walletData.account_name}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          onClick={() => {
                            setParsedAccountData({
                              rawString: walletData?.qr_string || "",
                              bankBin: walletData?.bank_code || "970436",
                              accountNumber: walletData?.account_number || "",
                              accountName: walletData?.account_name || "",
                              isNameHidden: false,
                            });
                            setShowChangeAccountModal(true);
                          }}
                          variant="outline-dark"
                          className="w-100 fw-bold btn-hover-dark py-2"
                        >
                          Thay đổi tài khoản
                        </Button>
                        <Button
                          variant="primary"
                          className="w-100 fw-bold shadow-sm btn-aws-primary py-2"
                        >
                          Yêu cầu rút tiền
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4} md={12}>
                  <Card className="border-0 shadow-sm h-100 aws-qr-card hover-bounce">
                    <Card.Header className="bg-white border-bottom-0 pt-4 px-4">
                      <h5 className="fw-black m-0 text-aws-navy d-flex align-items-center">
                        <FontAwesomeIcon
                          icon={faCamera}
                          className="text-aws-orange me-2 text-lg"
                        />{" "}
                        Mã QR thanh toán nhanh
                      </h5>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4 pt-2 d-flex flex-column justify-content-between text-center">
                      <div
                        className={`qr-container-box border border-2 border-dashed rounded-3 p-3 mb-3 d-flex flex-column align-items-center justify-content-center bg-light position-relative ${!walletData?.QR_pay && !isDecoding ? "cursor-pointer hover-glow-orange" : ""}`}
                        style={{ minHeight: "220px" }}
                        onClick={
                          !isDecoding && !walletData?.QR_pay
                            ? triggerFileInput
                            : undefined
                        }
                      >
                        <input
                          type="file"
                          id="hidden-qr-input"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleQrFileChange}
                        />

                        {isDecoding ? (
                          <div className="text-center animate-pulse">
                            <Spinner
                              animation="border"
                              variant="primary"
                              className="mb-2"
                            />
                            <span className="small text-muted d-block fw-bold">
                              Đang quét ma trận...
                            </span>
                          </div>
                        ) : walletData?.QR_pay ? (
                          <div className="qr-view-active animate-zoom-in position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                            <Button
                              variant="warning"
                              size="sm"
                              className="position-absolute py-1 px-2 text-dark border-0 shadow-sm fw-bold"
                              style={{
                                top: "-5px",
                                right: "-5px",
                                zIndex: 10,
                                fontSize: "0.72rem",
                                borderRadius: "6px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerFileInput();
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} className="me-1" />{" "}
                              Đổi ảnh
                            </Button>
                            <Image
                              src={`${API_IMG}Company-qrcode/${walletData.QR_pay}`}
                              alt="Personal QR Code"
                              className="img-fluid rounded shadow-sm bg-white p-2 border"
                              style={{
                                maxHeight: "170px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        ) : (
                          <div className="qr-placeholder-skeleton text-center p-3 animate-fade-in w-100">
                            <div className="mb-2 text-muted opacity-25">
                              <FontAwesomeIcon
                                icon={faQrcode}
                                size="3x"
                                className="animate-pulse"
                              />
                            </div>
                            <span className="small text-muted fw-bold d-block">
                              Chưa có mã QR nhận tiền
                            </span>
                            <span className="font-small text-muted-40 block mt-1">
                              Bấm vào đây để Tải ảnh mã VietQR cá nhân của bạn
                              lên
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="qr-input-controller text-start bg-light p-2 rounded-3 border">
                        <Form.Group className="mb-0">
                          <Form.Label className="font-small fw-black text-muted text-uppercase tracking-wider mb-1 block">
                            Chuỗi VietQR String hiện tại
                          </Form.Label>
                          <InputGroup size="sm">
                            <Form.Control
                              type="text"
                              readOnly
                              className="font-monospace font-small bg-white text-muted"
                              placeholder="0002010102113857..."
                              value={
                                walletData?.qr_string ||
                                parsedAccountData?.rawString ||
                                ""
                              }
                            />
                            <Button
                              variant="secondary"
                              className="fw-bold font-small px-3"
                              onClick={triggerFileInput}
                            >
                              Đổi ảnh
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ) : (
              <Col xs={12}>
                <Card className="border-0 shadow-lg text-center py-5 aws-wallet-setup overflow-hidden position-relative animate-up-2">
                  <div className="setup-gradient-bg"></div>
                  <Card.Body
                    className="position-relative"
                    style={{ maxWidth: 700, margin: "0 auto" }}
                  >
                    <div className="mb-4 icon-glow-orange text-aws-orange opacity-75">
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="animate-bounce-slow"
                        style={{ fontSize: "4.5rem" }}
                      />
                    </div>
                    <h3 className="fw-black text-aws-navy mb-2">
                      Kích hoạt Ví Ký Quỹ CLEARLINK
                    </h3>
                    <p className="text-muted px-3 mb-4 font-medium">
                      Để đảm bảo an toàn giao dịch Blockchain, vui lòng khai báo
                      tài khoản ngân hàng chính chủ của doanh nghiệp và thực
                      hiện xác thực.
                    </p>

                    <div className="bg-white bg-opacity-85 backdrop-blur rounded-3 border shadow-sm overflow-hidden animate-slide-up text-start">
                      {!Qrverify ? (
                        <div className="p-4 animation-fade-in bg-light">
                          <div className="alert alert-info small py-2 mb-4 border-0 shadow-sm">
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className="me-2"
                            />
                            <strong>Bước 1:</strong> Khai báo thông tin tài
                            khoản ngân hàng nhận tiền của doanh nghiệp bạn.
                          </div>

                          <Form.Group className="mb-3">
                            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
                              Ngân hàng hưởng thụ
                            </Form.Label>
                            <Form.Select
                              className="aws-input form-select-custom py-2 shadow-sm"
                              value={bankData.bin}
                              onChange={(e) =>
                                setBankData({
                                  ...bankData,
                                  bin: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Chọn ngân hàng --</option>
                              {Bankinfo &&
                                Bankinfo.map((bank) => (
                                  <option key={bank.bin} value={bank.bin}>
                                    {bank.shortName} - {bank.fullName}
                                  </option>
                                ))}
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
                              Số tài khoản ngân hàng
                            </Form.Label>
                            <Form.Control
                              type="text"
                              className="aws-input py-2 font-monospace font-medium shadow-sm"
                              placeholder="Nhập chính xác STK nhận tiền..."
                              value={bankData.account_number}
                              onChange={(e) =>
                                setBankData({
                                  ...bankData,
                                  account_number: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
                              Tên chủ tài khoản (Viết hoa không dấu)
                            </Form.Label>
                            <Form.Control
                              type="text"
                              className="aws-input py-2 font-monospace fw-bold text-success border-success shadow-sm"
                              placeholder="VD: CONG TY TNHH CLEARLINK"
                              value={detectedName}
                              onChange={(e) =>
                                setDetectedName(e.target.value.toUpperCase())
                              }
                            />
                          </Form.Group>

                          <div className="d-flex justify-content-end border-top pt-4">
                            <Button
                              variant="primary"
                              onClick={genQrcode}
                              className="fw-black font-medium py-2 px-4 shadow-sm btn-aws-primary w-100"
                              disabled={
                                !detectedName ||
                                !bankData.account_number ||
                                !bankData.bin ||
                                loadQr
                              }
                            >
                              {loadQr ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <>
                                  <FontAwesomeIcon
                                    icon={faQrcode}
                                    className="me-2"
                                  />{" "}
                                  Lưu thông tin & Sinh mã xác thực
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center animation-fade-in">
                          <Badge
                            bg="warning"
                            text="dark"
                            className="px-3 py-2 rounded-pill mb-3 fw-bold shadow-sm"
                          >
                            <FontAwesomeIcon
                              icon={faClock}
                              className="me-2 animate-spin-slow"
                            />{" "}
                            Đang chờ thanh toán xác thực...
                          </Badge>

                          <p className="small text-muted mb-3">
                            <strong>Bước 2:</strong> Dùng tài khoản{" "}
                            <strong className="text-dark">
                              {bankData.account_number}
                            </strong>{" "}
                            bạn vừa khai báo quét QR dưới đây để chuyển chính
                            xác{" "}
                            <strong>
                              {new Intl.NumberFormat("vi-VN").format(
                                Qrverify.amount || 5000,
                              )}{" "}
                              VNĐ
                            </strong>
                            . Hệ thống sẽ tự động Active ví.
                          </p>

                          <div className="d-flex justify-content-center mb-3">
                            <div className="p-2 border rounded-3 bg-white shadow-sm position-relative qr-radar-scan">
                              <Image
                                src={Qrverify.qr_url}
                                width={220}
                                alt="Payment QR"
                                className="rounded"
                              />
                            </div>
                          </div>

                          <div
                            className="bg-light p-3 rounded text-start mx-auto border shadow-sm"
                            style={{ maxWidth: "380px" }}
                          >
                            <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                              <span className="small text-muted fw-bold">
                                Số tiền:
                              </span>
                              <strong className="text-aws-orange h5 mb-0">
                                {new Intl.NumberFormat("vi-VN").format(
                                  Qrverify.amount || 5000,
                                )}{" "}
                                VNĐ
                              </strong>
                            </div>
                            <div className="d-flex justify-content-between pt-1">
                              <span className="small text-muted fw-bold">
                                Nội dung (Bắt buộc):
                              </span>
                              <strong className="font-monospace text-primary h5 mb-0 tracking-wider">
                                {Qrverify.transfer_content}
                              </strong>
                            </div>
                          </div>

                          <div className="mt-4 border-top pt-3">
                            <Button
                              variant="link"
                              className="text-danger small fw-bold text-decoration-none w-100 mb-2 hover-bg-light rounded"
                              onClick={() => setQrverify("")}
                            >
                              <FontAwesomeIcon
                                icon={faArrowLeft}
                                className="me-2"
                              />{" "}
                              Quay lại sửa thông tin tài khoản
                            </Button>

                            <div
                              className={`bg-${walletData?.status === "reject" ? "danger" : "warning"} bg-opacity-10 p-3 rounded-3 mt-3 border border-${walletData?.status === "reject" ? "danger" : "warning"} border-opacity-50 text-start`}
                            >
                              <div className="d-flex align-items-start">
                                <FontAwesomeIcon
                                  icon={
                                    walletData?.status === "reject"
                                      ? faExclamationTriangle
                                      : faLifeRing
                                  }
                                  className={`text-${walletData?.status === "reject" ? "danger" : "warning"} mt-1 me-2 text-lg`}
                                />
                                <div className="w-100">
                                  <span className="small generals-title fw-bold text-dark d-block mb-1">
                                    {walletData?.status === "reject"
                                      ? "Yêu cầu xác thực tài khoản bị từ chối!"
                                      : "Tài khoản doanh nghiệp bị khóa chiều gửi (Chuyên thu)?"}
                                  </span>
                                  <span className="small text-muted d-block mb-2">
                                    {walletData?.status === "reject" ? (
                                      <div>
                                        <span className="text-danger fw-bold d-block mb-1">
                                          Lý do:{" "}
                                          {walletData?.reject_resson ||
                                            "Chứng từ chưa hợp lệ hoặc thông tin không trùng khớp."}
                                        </span>
                                        <span className="text-muted font-xs d-block">
                                          Bạn có thể tiến hành chọn lại ảnh
                                          chứng từ mộc đỏ chính xác phía dưới để
                                          gửi lại yêu cầu, hoặc nhấn nút{" "}
                                          <b>
                                            "Quay lại sửa thông tin tài khoản"
                                          </b>{" "}
                                          phía trên để chỉnh sửa thông tin ngân
                                          hàng thụ hưởng.
                                        </span>
                                      </div>
                                    ) : walletData?.wallet_kyc ? (
                                      <span className="text-success fw-bold">
                                        Hệ thống đã ghi nhận 1 tệp chứng từ xác
                                        thực từ bạn. Bạn có thể xem lại hoặc
                                        thay đổi chứng từ bất cứ lúc nào.
                                      </span>
                                    ) : (
                                      "Nếu không thể chuyển tiền xác thực, vui lòng tải lên hình chụp Giấy xác nhận mở tài khoản / Ủy nhiệm chi để Ban quản trị CLEARLINK duyệt thủ công."
                                    )}
                                  </span>

                                  {walletData?.status === "reject" ? (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="fw-bold text-white w-100 mt-1 shadow-sm"
                                      onClick={() => setShowKycModal(true)}
                                    >
                                      <FontAwesomeIcon
                                        icon={faFileUpload}
                                        className="me-2"
                                      />{" "}
                                      Tải lên tài liệu chứng từ mới
                                    </Button>
                                  ) : walletData?.wallet_kyc ? (
                                    <Button
                                      variant="warning"
                                      size="sm"
                                      className="fw-bold text-dark w-100 mt-1 shadow-sm"
                                      onClick={() => setShowViewKycModal(true)}
                                    >
                                      <FontAwesomeIcon
                                        icon={faEye}
                                        className="me-2"
                                      />{" "}
                                      Xem tài liệu chứng từ đã gửi
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline-warning"
                                      size="sm"
                                      className="fw-bold text-dark border-warning w-100 mt-1"
                                      onClick={() => setShowKycModal(true)}
                                    >
                                      <FontAwesomeIcon
                                        icon={faFileUpload}
                                        className="me-2"
                                      />{" "}
                                      Xác thực bằng tài liệu
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </div>
        )}
      </div>

      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
        backdrop="static"
        className="aws-fintech-modal"
      >
        <Modal.Header className="bg-aws-navy text-white p-4">
          <Modal.Title className="h5 fw-black m-0 text-white d-flex align-items-center">
            <FontAwesomeIcon
              icon={faShieldAlt}
              className="text-warning me-3 text-xl animate-pulse"
            />{" "}
            ĐỐI SOÁT TÀI KHOẢN VIETQR
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <div className="d-flex align-items-center mb-4 bg-white p-3 rounded-3 border shadow-sm">
            {croppedImagePreview ? (
              <div
                className="me-3 p-1 border rounded bg-light"
                style={{ width: "90px", height: "90px", flexShrink: 0 }}
              >
                <Image
                  src={croppedImagePreview}
                  className="rounded"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div
                className="me-3 p-1 border rounded bg-light d-flex justify-content-center align-items-center"
                style={{ width: "90px", height: "90px", flexShrink: 0 }}
              >
                <FontAwesomeIcon
                  icon={faQrcode}
                  className="text-muted opacity-50"
                  size="2x"
                />
              </div>
            )}
            <p className="text-muted small mb-0">
              Hệ thống đã bóc tách dữ liệu từ mã QR thành công. Vui lòng kiểm
              tra các trường đối soát thông tin của doanh nghiệp dưới đây.
            </p>
          </div>

          <div
            className={`p-4 rounded-3 mb-3 bg-white border shadow-sm position-relative overflow-hidden ${!isQrValidToSave ? "border-danger border-2" : "border-success"}`}
          >
            <div
              className={`d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 rounded p-2 ${!isbankpinMatched ? "bg-danger bg-opacity-10" : ""}`}
            >
              <div className="d-flex flex-column text-start">
                <span className="small text-muted text-uppercase tracking-wide fw-bold">
                  Mã định danh BIN Ngân hàng
                </span>
                {!isbankpinMatched && (
                  <small className="text-white fw-bold mt-1">
                    <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Mã
                    định danh không khớp form khai báo!
                  </small>
                )}
              </div>
              <Badge
                bg={isbankpinMatched ? "dark" : "danger"}
                className={`font-monospace font-medium px-3 py-2 ${isbankpinMatched ? "text-warning" : "text-white"}`}
              >
                {parsedAccountData?.bankBin || ""}
              </Badge>
            </div>

            <div
              className={`mb-3 border-bottom pb-3 rounded p-2 text-start ${!isbanknumberMatched ? "bg-danger bg-opacity-10" : ""}`}
            >
              <span className="small text-muted text-uppercase tracking-wide fw-bold block mb-1">
                Số tài khoản thụ hưởng
              </span>
              <h3
                className={`fw-900 font-monospace tracking-wide mb-0 text-glow-dark ${isbanknumberMatched ? "text-aws-navy" : "text-danger"}`}
              >
                {parsedAccountData?.accountNumber || ""}
              </h3>
              {!isbanknumberMatched && (
                <small className="text-white fw-bold mt-1 d-block">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Số
                  tài khoản quét từ QR không khớp với số vừa nhập!
                </small>
              )}
            </div>

            <div
              className={`mt-2 pt-2 rounded p-2 text-start ${!isNameWalletMatched ? "bg-danger bg-opacity-10" : ""}`}
            >
              <span className="small text-muted text-uppercase tracking-wide fw-bold block mb-2">
                Tên chủ tài khoản thực tế
              </span>
              {parsedAccountData?.isNameHidden ? (
                <Form.Group>
                  <Form.Control
                    type="text"
                    className={`font-monospace fw-bold text-uppercase ${!isNameWalletMatched ? "border-danger border-2 text-danger bg-white" : "border-warning border-2"}`}
                    placeholder="NHẬP TÊN CHỦ TÀI KHOẢN KHÔNG DẤU"
                    value={
                      parsedAccountData?.accountName ===
                      "Bảo mật ngân hàng (Cần tra cứu)"
                        ? ""
                        : parsedAccountData?.accountName || ""
                    }
                    onChange={(e) =>
                      setParsedAccountData({
                        ...parsedAccountData,
                        accountName: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  {parsedAccountData?.accountName &&
                    parsedAccountData?.accountName !==
                      "BẢO MẬT NGÂN HÀNG (CẦN TRA CỨU)" &&
                    !isNameWalletMatched && (
                      <Form.Text className="text-white small fw-bold mt-1 d-block animate-shake">
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="me-1"
                        />{" "}
                        Tên không khớp với pháp nhân hệ thống (
                        {walletData?.account_name})!
                      </Form.Text>
                    )}
                  {isNameWalletMatched && (
                    <Form.Text className="text-warning small fw-bold mt-1 d-block">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="me-1"
                      />{" "}
                      Mã QR này bảo mật tên. Bạn đã nhập tay trùng khớp thành
                      công.
                    </Form.Text>
                  )}
                </Form.Group>
              ) : (
                <div>
                  <h5
                    className={`fw-black text-uppercase tracking-wider mb-0 ${isNameWalletMatched ? "text-success" : "text-danger animate-pulse"}`}
                  >
                    {parsedAccountData?.accountName || ""}
                  </h5>
                  {!isNameWalletMatched && (
                    <small className="text-danger fw-bold mt-1 d-block">
                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />{" "}
                      Tên chủ tài khoản không khớp với tên doanh nghiệp (
                      {profileData?.company_name})!
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group text-start">
            <label className="font-small fw-bold text-muted text-uppercase block mb-1">
              Chuỗi mã hóa gốc (EMVCo Data)
            </label>
            <textarea
              readOnly
              className="form-control font-monospace font-small bg-light text-muted p-2"
              rows="2"
              style={{ resize: "none" }}
              value={parsedAccountData?.rawString || ""}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white p-3 gap-2">
          <Button
            variant="link"
            className="text-muted fw-bold text-decoration-none"
            onClick={() => setShowConfirmModal(false)}
          >
            Hủy bỏ
          </Button>

          <Button
            variant={isQrValidToSave ? "primary" : "secondary"}
            className="px-4 fw-black btn-aws-primary flex-grow-1 py-2 shadow"
            disabled={
              !isQrValidToSave ||
              (parsedAccountData?.isNameHidden &&
                (!parsedAccountData?.accountName ||
                  parsedAccountData?.accountName ===
                    "Bảo mật ngân hàng (Cần tra cứu)" ||
                  parsedAccountData?.accountName.trim() === ""))
            }
            onClick={handleUploadQr}
          >
            <FontAwesomeIcon
              icon={isQrValidToSave ? faCheckCircle : faExclamationTriangle}
              className="me-2"
            />
            {!isbankpinMatched
              ? "Mã Ngân hàng (BIN) không khớp"
              : !isbanknumberMatched
                ? "Số tài khoản không khớp"
                : !isNameWalletMatched
                  ? "Tên pháp nhân không khớp"
                  : "Xác nhận đối soát & Lưu dữ liệu"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6 fw-bold m-0 d-flex align-items-center text-white">
            <FontAwesomeIcon icon={faCamera} className="me-2 text-aws-orange" />{" "}
            Khoanh vùng mã QR
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light text-center">
          <p className="text-muted small mb-3">
            Vui lòng kéo thả ô vuông để bao trọn vùng chứa mã QR Code trong bức
            ảnh dưới đây. Việc này giúp hệ thống đọc cực nhanh và chính xác
            100%!
          </p>
          <div
            className="bg-white border rounded shadow-sm overflow-auto d-flex justify-content-center align-items-center"
            style={{ maxHeight: "60vh" }}
          >
            {imageSrcToCrop && (
              <ReactCrop
                crop={cropConfig}
                onChange={(c) => setCropConfig(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={imageSrcToCrop}
                  alt="Upload"
                  style={{
                    maxHeight: "55vh",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              </ReactCrop>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button
            variant="light"
            className="fw-bold"
            onClick={() => setShowCropModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            className="btn-aws-primary fw-bold px-4"
            onClick={handleCropAndScan}
            disabled={isDecoding || !completedCrop?.width}
          >
            {isDecoding ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <>
                <FontAwesomeIcon icon={faSearch} className="me-2" /> Quét mã
                vùng đã cắt
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showKycModal}
        onHide={() => setShowKycModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6 fw-bold m-0 d-flex align-items-center text-white">
            <FontAwesomeIcon
              icon={faFileUpload}
              className="me-2 text-aws-orange"
            />{" "}
            Tải lên Giấy tờ xác minh ví
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <p className="text-muted small mb-3">
            Vui lòng cung cấp 1 ảnh chụp rõ nét{" "}
            <strong>Giấy xác nhận mở tài khoản</strong> (có mộc đỏ của ngân
            hàng) hoặc <strong>Ảnh chụp màn hình Internet Banking</strong> thể
            hiện rõ tên doanh nghiệp và số tài khoản:{" "}
            <strong className="text-dark">{bankData?.account_number}</strong>.
          </p>
          <div className="border border-2 border-dashed border-primary rounded-3 p-4 text-center bg-white cursor-pointer hover-bg-light transition-all">
            <input
              type="file"
              accept="image/*"
              className="d-none"
              id="kyc-upload-input"
              onChange={(e) => setKycFile(e.target.files[0])}
            />
            <label
              htmlFor="kyc-upload-input"
              className="w-100 cursor-pointer m-0"
            >
              {kycFile ? (
                <div>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success text-4xl mb-2"
                  />
                  <p className="fw-bold text-success mb-0">{kycFile.name}</p>
                  <small className="text-muted">Nhấn để chọn ảnh khác</small>
                </div>
              ) : (
                <div>
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="text-primary text-4xl mb-2 opacity-50"
                  />
                  <p className="fw-bold text-aws-navy mb-0">
                    Bấm vào đây để chọn tệp hình ảnh
                  </p>
                  <small className="text-muted">
                    Định dạng hỗ trợ: JPG, PNG, JPEG
                  </small>
                </div>
              )}
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button
            variant="light"
            className="fw-bold"
            onClick={() => setShowKycModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            className="btn-aws-primary fw-bold px-4"
            disabled={!kycFile || isSubmittingKyc}
            onClick={async () => {
              setIsSubmittingKyc(true);
              try {
                const res = await api_request.uploadKycWallet(User, kycFile);
                if (res && res.RC === 200) {
                  setShowKycModal(false);
                  setWalletData({
                    ...walletData,
                    status: "pending",
                    is_verified: false,
                    reject_resson: null,
                  });
                  toast.success(
                    "Gửi yêu cầu thành công! Admin sẽ duyệt ví của bạn trong vòng 24h.",
                  );
                  fetchData();
                } else {
                  toast.error(res?.RM || "Gửi chứng từ thất bại.");
                }
              } catch (err) {
                toast.error("Lỗi đường truyền kết nối.");
              } finally {
                setIsSubmittingKyc(false);
              }
            }}
          >
            {isSubmittingKyc ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Gửi yêu cầu kiểm duyệt"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showViewKycModal}
        onHide={() => setShowViewKycModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6 fw-bold m-0 d-flex align-items-center text-white">
            <FontAwesomeIcon
              icon={faFileInvoice}
              className="me-2 text-aws-orange"
            />{" "}
            Chứng từ xác minh ví doanh nghiệp của bạn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light text-center">
          <p className="text-muted small mb-3 text-start">
            Dưới đây là tài liệu mộc đỏ / ủy nhiệm chi bạn đã gửi lên hệ thống.
            Đang nằm trong danh sách hàng đợi kiểm duyệt của Admin CLEARLINK.
          </p>
          <div
            className="p-2 border rounded-3 bg-white shadow-sm d-flex justify-content-center align-items-center bg-dark bg-opacity-5"
            style={{ minHeight: "350px" }}
          >
            {walletData?.wallet_kyc ? (
              <Image
                src={`${API_IMG}Company-kyc/${walletData.wallet_kyc}`}
                alt="Uploaded KYC Document"
                className="img-fluid rounded border"
                style={{ maxHeight: "450px", objectFit: "contain" }}
              />
            ) : (
              <span className="text-muted small fst-italic">
                Không tìm thấy dữ liệu tệp tin
              </span>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white d-flex justify-content-between">
          <Button
            variant="outline-danger"
            className="fw-bold"
            onClick={() => {
              setShowViewKycModal(false);
              setShowKycModal(true);
            }}
          >
            <FontAwesomeIcon icon={faEdit} className="me-1" /> Thay đổi tài liệu
            khác
          </Button>
          <Button
            variant="secondary"
            className="fw-bold px-4"
            onClick={() => setShowViewKycModal(false)}
          >
            Đóng lại
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showChangeAccountModal}
        onHide={() => setShowChangeAccountModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-aws-navy text-white">
          <Modal.Title className="h6 fw-bold m-0 d-flex align-items-center text-white">
            <FontAwesomeIcon
              icon={faUniversity}
              className="me-2 text-aws-orange"
            />{" "}
            Thay đổi tài khoản thụ hưởng mới
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light text-start">
          <div className="alert alert-danger small py-2 mb-4 border-0 shadow-sm">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="me-2 text-danger animate-pulse"
            />
            <b>Chú ý bảo mật:</b> Hệ thống sẽ tạm ngắt quyền rút tiền ký quỹ tự
            động ngay khi thông tin ví thay đổi cho đến khi ảnh chứng từ mộc đỏ
            của STK mới được Admin đối soát chấp thuận.
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
              Ngân hàng hưởng thụ mới
            </Form.Label>
            <Form.Select
              className="aws-input form-select-custom py-2 shadow-sm"
              value={parsedAccountData?.bankBin || ""}
              onChange={(e) =>
                setParsedAccountData({
                  ...parsedAccountData,
                  bankBin: e.target.value,
                })
              }
            >
              <option value="">-- Chọn ngân hàng --</option>
              {Bankinfo &&
                Bankinfo.map((bank) => (
                  <option key={bank.bin} value={bank.bin}>
                    {bank.shortName} - {bank.fullName}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
              Số tài khoản ngân hàng mới
            </Form.Label>
            <Form.Control
              type="text"
              className="aws-input py-2 font-monospace font-medium shadow-sm"
              placeholder="Nhập chính xác số tài khoản mới..."
              value={parsedAccountData?.accountNumber || ""}
              onChange={(e) =>
                setParsedAccountData({
                  ...parsedAccountData,
                  accountNumber: e.target.value,
                })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="aws-label text-aws-navy fw-bold font-small text-uppercase tracking-wide">
              Tên chủ tài khoản (Viết hoa không dấu)
            </Form.Label>
            <Form.Control
              type="text"
              className="aws-input py-2 font-monospace fw-bold text-success border-success shadow-sm"
              placeholder="VD: CONG TY TNHH CLEARLINK"
              value={parsedAccountData?.accountName || ""}
              onChange={(e) =>
                setParsedAccountData({
                  ...parsedAccountData,
                  accountName: e.target.value.toUpperCase(),
                })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button
            variant="light"
            className="fw-bold"
            onClick={() => setShowChangeAccountModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            className="fw-bold px-4 shadow-sm text-white"
            onClick={handleUpdateWalletFromModal}
            disabled={
              !parsedAccountData?.bankBin ||
              !parsedAccountData?.accountNumber ||
              !parsedAccountData?.accountName
            }
          >
            Xác nhận thay đổi ví
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyProfile;
