import React from "react";
import "../../style/admin/home.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="welcome-message">
        <h1>Chào mừng đến với Trường Đại học Công Nghệ TP.HCM</h1>
        <div className="welcome">
          <span className="welcome-text">WELCOME</span>
        </div>
      </div>
      <div className="university-logo">
        <img src="/src/assets/image/welcome-icon.png" alt="logo" width="100" />
        <img src="/src/assets/image/logo CMYK-01.png" alt="logo" />
        <h2>HUTECH Đại học Công nghệ TP.HCM</h2>
      </div>
    </div>
  );
};

export default HomePage;
