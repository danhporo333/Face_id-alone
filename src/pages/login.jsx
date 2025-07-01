import { Button, Form, Input, notification, Divider, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { login } from "../services/api.service";
import { useContext, useState } from "react";
import { AuthContext } from "../components/context/auth.context.jsx";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const onFinish = async (values) => {
    setLoading(true);
    const res = await login(values.username, values.password);
    if (res.data) {
      message.success("Đăng nhập thành công");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("mssv", res.data.user.sinhVien.mssv);
      setUser(res.data.user);
      navigate("/");
    } else {
      notification.error({
        message: "Đăng nhập thất bại",
        description: JSON.stringify(res.message),
      });
    }
    setLoading(false);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{
          padding: "2rem",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#1890ff",
          }}
        >
          Đăng Nhập
        </h2>

        <Form.Item
          label="Tên đăng nhập"
          name="username"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên đăng nhập!",
            },
            //   {
            //     type: "email",
            //     message: "Email không đúng định dạng!",
            //   },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Nhập tên đăng nhập"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu!",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu"
            size="large"
            onKeyDown={(event) => {
              if (event.key === "Enter") form.submit();
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%", height: "40px", fontSize: "16px" }}
          >
            Đăng nhập
          </Button>
        </Form.Item>

        {/* <Divider plain>Hoặc</Divider>

        <div style={{ textAlign: "center" }}>
          <Link to="/">Về trang chủ</Link>
          <Divider type="vertical" />
          <Link to="/register">Đăng ký ngay</Link>
        </div> */}
      </Form>
    </div>
  );
};

export default LoginPage;
