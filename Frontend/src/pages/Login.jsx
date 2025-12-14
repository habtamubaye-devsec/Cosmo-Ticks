import { Form, Input, Button, Checkbox, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from '../api-service/user-service.js'
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setloading(true);
      const response = await loginUser(values);
      message.success(response.message);
      Cookies.set("token", response.token);
      navigate("/");
    } catch (error) {
      message.error(error.response?.data.message || error.message);
    } finally {
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input placeholder="Email address" className="h-12" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password placeholder="Password" className="h-12" />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-600">Remember me</Checkbox>
              </Form.Item>
              <a className="text-sm text-[#c17f59] hover:underline" href="#">Forgot password?</a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-sm font-medium"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#c17f59] hover:underline font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
