import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { Home, List, UserRound, LogOut, Settings, BarChart2, FileText, Package, CheckSquare, ShoppingBag, Database } from "lucide-react";
import { logoutUser } from "../api-service/auth-service";

function MenuItems({ user, setUser }) {
  const iconSize = 20;
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  if (!user || user.role !== "admin") return null;

  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: <Home size={iconSize} />, exact: true },
    { name: "Products", path: "/admin/products", icon: <Package size={iconSize} /> },
    { name: "Orders", path: "/admin/order", icon: <ShoppingBag size={iconSize} /> },
    { name: "Users", path: "/admin/users", icon: <UserRound size={iconSize} /> },
    { name: "Category", path: "/admin/category", icon: <FileText size={iconSize} /> },
    { name: "Charts", path: "/admin/charts", icon: <BarChart2 size={iconSize} /> },
    { name: "Backups", path: "/admin/backups", icon: <Database size={iconSize} /> },
    { name: "Performance Logs", path: "/admin/all-logs", icon: <CheckSquare size={iconSize} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={iconSize} /> },
    // { name: "Profile", path: "/admin/profile", icon: <List size={iconSize} /> }, // Moved to header dropdown
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] text-gray-300">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-white tracking-wide">COSMO-ADMIN</span>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
        {adminMenu.map((item) => {
          const isActive = item.exact
            ? currentPath === item.path
            : currentPath.startsWith(item.path);

          return (
            <div
              key={item.name}
              className={`cursor-pointer px-4 py-3 rounded-lg flex gap-4 text-sm font-medium items-center transition-all duration-200 ${isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "hover:bg-gray-800 hover:text-white"
                }`}
              onClick={() => navigate(item.path)}
            >
              <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-white"}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut size={iconSize} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default MenuItems;
