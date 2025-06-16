import { useState } from "react";
import Navigation from "./components/layout/Navigattion.jsx";
import { Outlet } from "react-router-dom";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
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
  );
}

export default App;
