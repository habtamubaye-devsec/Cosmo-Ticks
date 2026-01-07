import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { requestPasswordReset } from "../api-service/user-service.js";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await requestPasswordReset({ email: values.email });
      message.success(res?.message || "If the email exists, a reset link was sent");
    } catch (err) {
      message.error(err?.message || "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-10 md:py-14">
        <div className="container mx-auto max-w-md">
          <div className="rounded-3xl border border-gray-100 shadow-sm bg-white p-8">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl text-gray-900 mb-2">Forgot Password</h1>
              <p className="text-gray-500">Enter your email to receive a reset link.</p>
            </div>

            <Form layout="vertical" onFinish={onFinish} size="large">
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}
              >
                <Input placeholder="Email address" className="!rounded-xl !h-11" autoComplete="email" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-sm font-medium bg-gray-900 hover:!bg-black"
                loading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="text-[#c17f59] supports-[hover:hover]:hover:underline font-medium">Back to Sign In</Link>
              </div>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
