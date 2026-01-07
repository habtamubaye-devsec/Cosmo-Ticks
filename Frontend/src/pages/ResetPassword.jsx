import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { resetPassword } from "../api-service/user-service.js";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get("token");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      message.error("Invalid or missing reset token");
    }
  }, [token]);

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error("New password and confirmation do not match");
    }
    try {
      setLoading(true);
      const res = await resetPassword({ token, newPassword: values.newPassword });
      message.success(res?.message || "Password reset successfully");
      navigate("/login");
    } catch (err) {
      message.error(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero / Brand header */}
      <section
        className="relative"
        style={{
          background: "linear-gradient(135deg, #DDB893, #7F5539)",
        }}
      >
      </section>

      <main className="flex-1 px-6 py-10 md:py-14">
        <div className="container mx-auto max-w-2xl">
          <div className="rounded-3xl border shadow-sm bg-white overflow-hidden" style={{ borderColor: "#DDB893" }}>
            {/* Top accent bar */}
            <div className="h-1" style={{ background: "linear-gradient(90deg, #DDB893, #9c6644, #b08968)" }} />

            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-[#291C0E]">Choose a new password</h2>
                <p className="text-sm text-[#6f5a47]">For your security, make it unique and hard to guess.</p>
              </div>

              {/* Helpful context panel */}
              <div className="rounded-2xl p-4 mb-6" style={{ background: "#fff7ef", border: "1px solid #f1e3d5" }}>
                <ul className="text-sm text-[#4b3b2b] list-disc list-inside space-y-1">
                  <li>Use at least 8 characters</li>
                  <li>Include letters, numbers, and a symbol</li>
                  <li>Avoid common words and reused passwords</li>
                </ul>
              </div>

              <Form layout="vertical" onFinish={onFinish} size="large">
                <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: "Please enter a new password" }]}> 
                  <Input.Password autoComplete="new-password" className="!rounded-xl !h-11" />
                </Form.Item>
                <Form.Item label="Confirm New Password" name="confirmPassword" rules={[{ required: true, message: "Please confirm the new password" }]}> 
                  <Input.Password autoComplete="new-password" className="!rounded-xl !h-11" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 text-sm font-medium"
                  loading={loading}
                  style={{ backgroundColor: "#7F5539" }}
                >
                  Update Password
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
