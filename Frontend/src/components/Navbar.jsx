import { FaSearch, FaUser } from "react-icons/fa";
import { Badge } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Spin, message, Dropdown, Space } from "antd";
import { getCurrentUser, logoutUser } from "../api-service/user-service.js";
import { ShoppingCart } from "lucide-react";

function Navbar() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      message.error(error.response?.data.message || error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const menuItems = [
    {
      key: "user-info",
      disabled: true, // ✅ makes it non-clickable
      label: (
        <div className="p-2">
          <div className="font-semibold">{user?.name}</div>
          <div className="text-sm text-gray-500">{user?.username}</div>
          <div className="text-sm text-gray-400">{user?.email}</div>
        </div>
      ),
    },
    {
      type: "divider", // ✅ visual separator
    },
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/my-account?tab=profile"),
    },
    {
      key: "orders",
      label: "Orders",
      onClick: () => navigate("/my-account?tab=orders"),
    },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return <Spin tip="Loading user..." fullscreen />;
  }

  return (
    <div className="flex items-center justify-between h-16 px-6 shadow-lg">
      {/* Logo */}
      <div className="cursor-pointer m-2">
        <img
          src="project_images/blisslogo1.png"
          alt="logo"
          width={130}
          onClick={() => navigate("/")}
        />
      </div>

      {/* Search */}
      <div className="flex items-center m-2 px-2 border-solid border-2 border-[#69acd9] rounded-lg">
        <input
          type="text"
          placeholder="search"
          className="p-2 w-[500px] outline-none mr-2"
        />
        <FaSearch className="text-[#69acd9] mr-2 cursor-pointer" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        {/* Basket */}
        <Link to="/cart">
          <Badge badgeContent={3} color="error">
            <ShoppingCart />
          </Badge>
        </Link>

        {/* Conditional Login/Logout */}
        {user ? (
          <div className="text-blue-500 border-2 border-[#69acd9] rounded-lg bg-[#ddf2ff] px-3 py-1">
            <Dropdown
              menu={{ items: menuItems }}
              trigger={["hover", "click"]}
              arrow={false} // ✅ hides arrow
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <FaUser size={20} />
                  <span>{user.name}</span>
                  {/* ❌ removed <DownOutlined /> */}
                </Space>
              </a>
            </Dropdown>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer text-blue-500 hover:shadow-lg border-2 border-[#69acd9] rounded-lg bg-[#ddf2ff] px-3 py-1"
            onClick={() => navigate("/login")}
          >
            <FaUser size={20} />
            <span>Login</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
