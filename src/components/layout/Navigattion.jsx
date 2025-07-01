import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  ApartmentOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  LoginOutlined,
  AliwangwangOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import "./Navigattion.css";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context.jsx";

const pathToKey = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/khoavien")) return "khoavien";
  if (pathname.startsWith("/class")) return "class";
  if (pathname.startsWith("/student")) return "student";
  if (pathname.startsWith("/subject")) return "subject";
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/timetable")) return "timetable";
  return "";
};

const Navigation = ({ collapsed, setCollapsed }) => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const toggleCollapsed = () => setCollapsed(!collapsed);
  const location = useLocation();
  const selectedKey = pathToKey(location.pathname);

  const handleLogout = () => {
    setUser({
      id: "",
      username: "",
      role: "",
    });
    localStorage.removeItem("token");
    localStorage.removeItem("mssv");
    navigate("/login");
  };

  // Kiểm tra quyền truy cập của người dùng
  const isAdmin = user?.role?.includes("ADMIN");
  const isTeacher = user?.role?.includes("TEACHER");
  const isStudent = user?.role?.includes("STUDENT");

  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to={"/"}>Trang Chủ</Link>,
    },
    ...(isAdmin
      ? [
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
          {
            key: "timetable",
            icon: <CalendarOutlined />,
            label: <Link to={"/timetable"}>thời khóa biểu</Link>,
          },
          {
            label: `welcome ${user.username}`,
            icon: <AliwangwangOutlined />,
            children: [
              {
                label: "Đăng xuất",
                key: "logout",
                icon: <LoginOutlined />,
                onClick: handleLogout,
              },
            ],
          },
        ]
      : []),
    ...(isStudent
      ? [
          {
            key: "timetable",
            icon: <ApartmentOutlined />,
            label: <Link to={"/timetable"}>Thời khóa biểu</Link>,
          },
          {
            label: `${user.holot} ${user.ten}`,
            icon: <AliwangwangOutlined />,
            children: [
              {
                label: "Đăng xuất",
                key: "logout",
                icon: <LoginOutlined />,
                onClick: handleLogout,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className={`navigation-container${collapsed ? " collapsed" : ""}`}>
      <Button
        type="text"
        onClick={toggleCollapsed}
        className="navigation-toggle-btn"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      />
      <Menu
        mode="vertical"
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
