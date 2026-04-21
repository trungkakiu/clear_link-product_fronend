import React, { useContext, useEffect } from "react";

import manufacturerIcon from "../../assets/img/role/manufacturer.jpg";
import distributorIcon from "../../assets/img/role/distributor.jpg";
import retailerIcon from "../../assets/img/role/retailer.jpg";
import transporterIcon from "../../assets/img/role/logictic.jpg";
import customerIcon from "../../assets/img/role/customer.jpg";

import SwiperCore, { Navigation, Pagination } from "swiper/core";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/swiper-bundle.css";
import "../../scss/volt/components/_role_active.scss";

import { Card, Button } from "@themesberg/react-bootstrap";
import { UserContext } from "../../Context/UserContext";
import { useHistory } from "react-router-dom";

SwiperCore.use([Navigation, Pagination]);

const roles = [
  {
    key: "Manufacturer",
    title: "Manufacturer",
    icon: manufacturerIcon,
    desc: [
      "Tạo lô sản phẩm",
      "Chuẩn hoá theo chuỗi cung ứng",
      "Theo dõi trạng thái sản xuất",
    ],
  },
  {
    key: "Distributor",
    title: "Distributor",
    icon: distributorIcon,
    desc: [
      "Quản lý phân phối",
      "Luân chuyển hàng hoá",
      "Kết nối nhà sản xuất → bán lẻ",
    ],
  },
  {
    key: "Retailer",
    title: "Retailer",
    icon: retailerIcon,
    desc: [
      "Bán lẻ sản phẩm",
      "Xác thực nguồn gốc",
      "Cung cấp tới người tiêu dùng",
    ],
  },
  {
    key: "Transporter",
    title: "Transporter",
    icon: transporterIcon,
    desc: [
      "Vận chuyển logistics",
      "Bàn giao & đối soát",
      "Theo dõi hành trình",
    ],
  },
  {
    key: "Customer",
    title: "Customer",
    icon: customerIcon,
    desc: ["Kiểm tra sản phẩm", "Xác thực nguồn gốc", "Trải nghiệm minh bạch"],
  },
];

export default function Role_active() {
  const { User } = useContext(UserContext);
  const history = useHistory();

  useEffect(() => {
    if (User.data && User.data.role_active === "active") {
      history.replace("/dashboard/overview");
    }
  }, [User]);

  return (
    <div className="role-bg">
      <div className="role-container">
        <h2 className="role-title">Chọn Vai Trò Của Bạn</h2>

        <Swiper
          style={{ padding: "15px" }}
          spaceBetween={30}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            992: { slidesPerView: 3 },
          }}
        >
          {roles.map((role) => (
            <SwiperSlide key={role.key}>
              <Card className="role-card">
                <div className="role-center">
                  <img
                    style={{ height: "260px", width: "220px" }}
                    src={role.icon}
                    alt=""
                    className="role-img"
                  />

                  <h5 className="role-header">{role.title}</h5>
                  <ul className="role-list">
                    {role.desc.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="role-btn"
                  onClick={() => {
                    history.push("/user/role-register", { role: role.key });
                  }}
                >
                  Chọn vai trò
                </Button>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
