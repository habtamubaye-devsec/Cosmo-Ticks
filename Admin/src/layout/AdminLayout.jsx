import { Outlet, useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../api-service/auth-service";
import { message, Spin, Avatar, Dropdown, Breadcrumb } from "antd";
import { User, Bell, Search, ChevronDown } from "lucide-react";

const titleCase = (s) =>
  String(s || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const breadcrumbFromPath = (pathname) => {
  // Admin routes are nested under /admin
  const path = String(pathname || "");

  // Known special cases first (so we can hide IDs, etc.)
  const editProductMatch = path.match(/^\/admin\/products\/edit\/([^/]+)\/?$/);
  if (editProductMatch) {
    return [
      { label: "Dashboard", to: "/admin" },
      { label: "Products", to: "/admin/products" },
      { label: "Edit Product" },
    ];
  }

  const addProductMatch = path.match(/^\/admin\/products\/add\/?$/);
  if (addProductMatch) {
    return [
      { label: "Dashboard", to: "/admin" },
      { label: "Products", to: "/admin/products" },
      { label: "Add Product" },
    ];
  }

  const baseMap = {
    admin: "Dashboard",
    profile: "Profile",
    users: "Users",
    products: "Products",
    order: "Orders",
    category: "Category",
    settings: "Settings",
    backups: "Backups",
    charts: "Charts",
    "all-logs": "Performance Logs",
  };

  const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", to: "/admin" }];

  // Always start with Dashboard for clarity
  const items = [{ label: "Dashboard", to: "/admin" }];
  if (parts[0] !== "admin") return items;

  let acc = "/admin";
  for (let i = 1; i < parts.length; i += 1) {
    const seg = parts[i];
    acc += `/${seg}`;
    const label = baseMap[seg] || titleCase(seg);

    // Make intermediate segments clickable, last one not.
    const isLast = i === parts.length - 1;
    items.push(isLast ? { label } : { label, to: acc });
  }

  return items;
};

function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch {
      // If not authenticated, just show the login page (no noisy toast).
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const userMenu = [
    {
      key: 'profile',
      label: 'My Profile',
      onClick: () => navigate('/admin/profile')
    },
    {
      key: 'logout',
      label: <span className="text-red-500">Sign Out</span>,
      onClick: async () => {
        try {
          await logoutUser();
        } catch (error) {
          message.error(error.response?.data?.message || error.message);
        } finally {
          navigate('/login');
        }
      }
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      {/* Sidebar Section */}
      <Sidebar user={user} setUser={setUser} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          {/* Left: Spacer for mobile toggle or Breadcrumbs */}
          <div className="lg:hidden w-8"></div>
          <div className="hidden lg:flex items-center text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 min-w-[300px]">
            <Search size={18} className="mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                <Avatar size="small" icon={<User />} className="bg-indigo-100 text-indigo-600" />
                <div className="hidden md:block text-sm text-right">
                  <p className="font-medium text-gray-700 leading-none mb-1">{user.name}</p>
                  <p className="text-xs text-gray-400 leading-none">Administrator</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden md:block" />
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page Content Scroller */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mb-4">
            <Breadcrumb
              separator="/"
              items={breadcrumbFromPath(location.pathname).map((b) => ({
                title: b.to ? (
                  <Link to={b.to} className="text-gray-500 hover:text-gray-700">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{b.label}</span>
                ),
              }))}
            />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
