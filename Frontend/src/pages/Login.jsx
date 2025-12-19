import { Form, Input, Button, Checkbox, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from '../api-service/user-service.js'
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Facebook, Chrome } from "lucide-react";

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

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/v1/auth/google';
  };

  const handleFacebookLogin = () => {
    // Redirect to backend Facebook OAuth endpoint
    window.location.href = '/api/v1/auth/facebook';
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
              <a className="text-sm text-[#c17f59] supports-[hover:hover]:hover:underline" href="#">Forgot password?</a>
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg supports-[hover:hover]:hover:bg-gray-50 transition-colors"
            >
              <Chrome size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg supports-[hover:hover]:hover:bg-gray-50 transition-colors"
            >
              <Facebook size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#c17f59] supports-[hover:hover]:hover:underline font-medium">
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
