import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../api-service/user-service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await registerUser(values);
      message.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      message.error(error.response?.data.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">Join the Cosmo-ticks community</p>
          </div>

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Full Name" className="h-12" />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter a username" }]}
            >
              <Input placeholder="Username" className="h-12" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Email address" className="h-12" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter a password" }]}
            >
              <Input.Password placeholder="Password" className="h-12" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-sm font-medium"
                loading={loading}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#c17f59] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Register;
