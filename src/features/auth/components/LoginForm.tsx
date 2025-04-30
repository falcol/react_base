import { useAppDispatch, useAppSelector } from "@hooks/redux.hooks";
import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../stores/auth.slice";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập
  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      // 1. Gọi API login và lưu token
      await dispatch(login(values.username, values.password));
      // 2. Fetch thông tin user sau khi login thành công
      // await dispatch(fetchUserInfo());
    } finally {
      setLoading(false);
    }
  };

  // Redirect về trang chủ khi đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card title="Login" style={{ width: 350 }}>
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
