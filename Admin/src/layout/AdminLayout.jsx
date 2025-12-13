import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api-service/auth-service";
import { message, Spin } from "antd";

function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data); // store user object
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
      navigate("/login"); // redirect if unauthorized
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <Spin
        tip="Loading user..."
        size="large"
        className="full-screen-spinner"
      />
    );
  }

  if (!user || user.role !== "admin") {
    navigate("/login"); // redirect if not admin
    return null;
  }

  return (
    <div className="lg:flex h-screen">
      <div className="lg:w-74 bg-gray-100">
        <Sidebar user={user} setUser={setUser} />
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
