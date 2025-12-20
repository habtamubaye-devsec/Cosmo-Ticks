import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser } from "../api-service/auth-service.js";

function Login() {

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      try {
        const res = await getCurrentUser();
        if (res?.data?.role === "admin") navigate("/admin", { replace: true });
      } catch {
        // ignore
      }
    };
    checkAlreadyLoggedIn();
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await loginUser(values);
      message.success(response.message);
      navigate("/admin", { replace: true });
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
              CT
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500">Use your admin account to continue</p>
          </div>

          <Form name="login" onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="admin@email.com" size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" className="w-full h-11" loading={loading}>
                Sign in
              </Button>
            </Form.Item>
          </Form>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Only administrators can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
