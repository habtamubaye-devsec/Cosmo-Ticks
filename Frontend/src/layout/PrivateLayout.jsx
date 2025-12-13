import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../api-service/user-service.js";
import { message, Spin } from "antd";
import Navbar from "../components/Navbar";

function PrivateLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // user fetch loading
  const navigate = useNavigate();

  // Fetch user info from backend
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser(); // cookies sent automatically
      setUser(response.data.data); // adjust based on your API response structure
    } catch (error) {
      message.error(error.message || "You must be logged in");
      navigate("/login"); // redirect if unauthorized
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default PrivateLayout;
