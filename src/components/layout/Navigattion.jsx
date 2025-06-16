import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ApartmentOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import "./Navigattion.css";

const items = [
  {
    key: "home",
    icon: <HomeOutlined />,
    label: <Link to={"/"}>Trang Chủ</Link>,
  },
  {
    key: "khoavien",
    icon: <ApartmentOutlined />,
    label: <Link to={"/khoavien"}>Quản lý khoa viện</Link>,
  },
  {
    key: "class",
    icon: <TeamOutlined />,
    label: <Link to={"/class"}>Quản lý lớp học</Link>,
  },
  {
    key: "student",
    icon: <UserOutlined />,
    label: <Link to={"/student"}>Quản lý sinh viên</Link>,
  },
  {
    key: "subject",
    icon: <BookOutlined />,
    label: <Link to={"/subject"}>Quản lý môn học</Link>,
  },
  {
    key: "teacher",
    icon: <TeamOutlined />,
    label: <Link to={"/teacher"}>Quản lý giảng viên</Link>,
  },
  // {
  //   key: "schedule",
  //   icon: <CalendarOutlined />,
  //   label: "Quản lý thời khóa biểu",
  // },
  // {
  //   key: "attendance",
  //   icon: <CheckCircleOutlined />,
  //   label: "Quản lý điểm danh",
  // },
  // { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  // { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
];

const pathToKey = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/khoavien")) return "khoavien";
  if (pathname.startsWith("/class")) return "class";
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/subject")) return "subject";
  if (pathname.startsWith("/teacher")) return "teacher";
  return "";
};

const Navigation = ({ collapsed, setCollapsed }) => {
  const toggleCollapsed = () => setCollapsed(!collapsed);
  const location = useLocation();
  const selectedKey = pathToKey(location.pathname);

  return (
    <div className={`navigation-container${collapsed ? " collapsed" : ""}`}>
      <Button
        type="text"
        onClick={toggleCollapsed}
        className="navigation-toggle-btn"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      />
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        items={items}
        selectedKeys={[selectedKey]}
        className="navigation-menu"
      />
    </div>
  );
};

export default Navigation;
