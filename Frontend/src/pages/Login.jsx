import { Form, Input, Button, Checkbox, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from '../api-service/user-service.js'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Facebook} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useShop } from "../context/ShopContext";

function Login() {
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const { refreshShop } = useShop();

  const onFinish = async (values) => {
    try {
      setloading(true);
      const response = await loginUser(values);
      message.success(response?.message || "Logged in successfully");
      // Backend sets the auth cookie (httpOnly). Refresh context so UI updates immediately.
      await refreshShop();
      navigate("/");
    } catch (error) {
      message.error(error?.message || "Login failed");
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

      <main className="flex-1 px-6 py-10 md:py-14">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Left panel */}
            <div className="hidden lg:block">
              <div className="h-full rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-[#f7f5f0] relative">
                <img
                  src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1400&auto=format&fit=crop"
                  alt="Cosmo-ticks"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-10 h-full flex flex-col justify-end">
                  <div className="text-white">
                    <div className="text-xs font-bold tracking-[0.2em] uppercase text-white/80">Welcome back</div>
                    <h2 className="font-serif text-4xl mt-3">Your essentials, saved.</h2>
                    <p className="text-white/85 mt-3 max-w-md leading-relaxed">
                      Sign in to see your wishlist, track orders, and continue your routine.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form card */}
            <div className="flex items-center">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-3xl border border-gray-100 shadow-sm bg-white p-8">
                  <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-gray-900 mb-2">Sign In</h1>
                    <p className="text-gray-500">Welcome back to Cosmo-ticks</p>
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
                      rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" },
                      ]}
                    >
                      <Input placeholder="Email address" className="h-12" autoComplete="email" />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: "Please enter your password" }]}
                    >
                      <Input.Password placeholder="Password" className="h-12" autoComplete="current-password" />
                    </Form.Item>

                    <div className="flex justify-between items-center mb-6">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-gray-600">Remember me</Checkbox>
                      </Form.Item>
                      <a
                        className="text-sm text-[#c17f59] supports-[hover:hover]:hover:underline"
                        href="mailto:support@cosmo-ticks.com?subject=Password%20Reset"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Form.Item className="mb-3">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full h-12 text-sm font-medium bg-gray-900 hover:!bg-black"
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
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl supports-[hover:hover]:hover:bg-gray-50 transition-colors"
                    >
                      <FaGoogle size={18} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFacebookLogin}
                      className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl supports-[hover:hover]:hover:bg-gray-50 transition-colors"
                    >
                      <Facebook size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Facebook</span>
                    </button>
                  </div>

                  <p className="text-center text-gray-500 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="text-[#c17f59] supports-[hover:hover]:hover:underline font-medium">
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
