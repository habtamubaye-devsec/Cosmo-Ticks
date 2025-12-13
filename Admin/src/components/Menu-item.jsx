import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Home, List, UserRound, LogOut, Settings, StoreIcon, ChartArea, Logs, Package, ClipboardCheck } from "lucide-react";
import { logoutUser } from "../api-service/auth-service";

function MenuItems({ user, setUser }) {
  const iconSize = 20;
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  if (!user || user.role !== "admin") return null; // ✅ Only render for admin

  const adminMenu = [
    { name: "Home", path: "/admin", icon: <Home size={iconSize} />, isActive: currentPath === "/admin" },
    { name: "Profile", path: "/admin/profile", icon: <List size={iconSize} />, isActive: currentPath.includes("/admin/profile") },
    { name: "Users", path: "/admin/users", icon: <UserRound size={iconSize} />, isActive: currentPath.includes("/admin/users") },
    { name: "Products", path: "/admin/products", icon: <Package size={iconSize} />, isActive: currentPath.includes("/admin/products") },
    { name: "Order", path: "/admin/order", icon: <ClipboardCheck size={iconSize} />, isActive: currentPath.includes("/admin/order") },
    { name: "Banners", path: "/admin/banners", icon: <UserRound size={iconSize} />, isActive: currentPath.includes("/admin/banners") },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={iconSize} />, isActive: currentPath.includes("/admin/settings") },
    { name: "Backups", path: "/admin/backups", icon: <StoreIcon size={iconSize} />, isActive: currentPath.includes("/admin/backups") },
    { name: "Charts", path: "/admin/charts", icon: <ChartArea size={iconSize} />, isActive: currentPath.includes("/admin/charts") },
    { name: "All Logs", path: "/admin/all-logs", icon: <Logs size={iconSize} />, isActive: currentPath.includes("/admin/all-logs") },
    { name: "Logout", path: "/login", icon: <LogOut size={iconSize} /> },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser(); // call backend to clear cookie
      setUser(null); // clear user state
      message.success("Logged out successfully");
      navigate("/login"); // redirect to login page
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="h-full p-5 w-full">
      <div className="flex flex-col gap-7 mt-10">
        {adminMenu.map((item) => (
          <div
            key={item.name}
            className={`cursor-pointer px-5 py-3 rounded flex gap-5 text-md items-center w-[90%] ${
              item.isActive ? "bg-blue-600 text-white" : ""
            }`}
            onClick={() => (item.name === "Logout" ? handleLogout() : navigate(item.path))}
          >
            <span className={item.isActive ? "" : "text-blue-600 font-semibold"}>{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;
