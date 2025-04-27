import { useAppDispatch, useAppSelector } from "@hooks/redux.hooks";
import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserInfo, login } from "../stores/auth.slice";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAppSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    await dispatch(login(values));
    await dispatch(fetchUserInfo());
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

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
