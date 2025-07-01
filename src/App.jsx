import { useState, useContext, useEffect } from "react";
import Navigation from "./components/layout/Navigattion.jsx";
import { AuthContext } from "./components/context/auth.context.jsx";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { getAccountAPI } from "./services/api.service.js";
import { Spin } from "antd";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUser, isAppLoading, setIsAppLoading } =
    useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAppLoading(false);
        return;
      }

      const res = await getAccountAPI();
      if (res.data) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Xóa token không hợp lệ
      localStorage.removeItem("token");
    } finally {
      setIsAppLoading(false);
    }
  };

  if (isAppLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải, chờ xíu..." />
      </div>
    );
  }

  // Nếu chưa đăng nhập và không có token, redirect về login
  if (!user?.id && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" tip="Đang tải, chờ xíu..." />
        </div>
      ) : (
        <>
          <Navigation collapsed={collapsed} setCollapsed={setCollapsed} />
          <div
            style={{
              marginLeft: collapsed ? 80 : 240,
              padding: 24,
              transition: "margin-left 0.2s",
              minHeight: "100vh",
            }}
          >
            <Outlet />
          </div>
        </>
      )}
    </>
  );
}

export default App;
