import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Dropdown, Drawer, Badge } from "antd";
import { getCurrentUser, logoutUser } from "../api-service/user-service.js";
import { getUserCart } from "../api-service/cart-service";

function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Navigation Data Structure
  const navStructure = [
    {
      title: "Skincare",
      path: "/category/skincare",
      items: [
        { name: "Serums", path: "/category/skincare/serums" },
        { name: "Moisturizers", path: "/category/skincare/moisturizers" },
        { name: "Cleansers", path: "/category/skincare/cleansers" },
        { name: "Masks", path: "/category/skincare/masks" },
        { name: "Eye Care", path: "/category/skincare/eyecare" },
        { name: "Sun Protection", path: "/category/skincare/sun-protection" },
      ]
    },
    {
      title: "Makeup",
      path: "/category/makeup",
      items: [
        { name: "Face", path: "/category/makeup/face" },
        { name: "Eyes", path: "/category/makeup/eyes" },
        { name: "Lips", path: "/category/makeup/lips" },
        { name: "Sets", path: "/category/makeup/sets" },
      ]
    },
    {
      title: "Body",
      path: "/category/body",
      items: [
        { name: "Wash & Scrub", path: "/category/body/wash" },
        { name: "Lotions & Oils", path: "/category/body/lotions" },
        { name: "Suncare", path: "/category/body/suncare" },
      ]
    },
    {
      title: "Hair",
      path: "/category/hair",
      items: [
        { name: "Shampoo", path: "/category/hair/shampoo" },
        { name: "Conditioner", path: "/category/hair/conditioner" },
        { name: "Treatment", path: "/category/hair/treatment" },
      ]
    },
    {
      title: "About",
      path: "/about", // We'll just link to home for now or specific about route
      items: []
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Initial fetch
    const init = async () => {
      try {
        const u = await getCurrentUser();
        setUser(u.data);
        const c = await getUserCart(u.data._id);
        setCartCount(c.products?.length || 0);
      } catch (e) { }
    }
    init();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const userMenuItems = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div className="p-2 min-w-[150px]">
          <div className="font-semibold text-gray-900 truncate">{user?.name}</div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
        </div>
      ),
    },
    { type: "divider" },
    { key: "profile", label: "Profile", onClick: () => navigate("/my-account?tab=profile") },
    { key: "orders", label: "Orders", onClick: () => navigate("/my-account?tab=orders") },
    { key: "logout", label: <span className="text-red-500">Logout</span>, onClick: handleLogout },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-transparent ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2 border-gray-100" : "bg-transparent py-6"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-14">

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-gray-900" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="font-serif text-2xl lg:text-3xl tracking-tight text-[#5d7a5d] hover:opacity-80 transition-opacity">
            Cosmo-ticks
          </Link>

          {/* Desktop Navigation - The Magic dropdowns */}
          <div className="hidden lg:flex items-center gap-8">
            {navStructure.map((item) => (
              <div key={item.title} className="group relative">
                <Link
                  to={item.path}
                  className="text-[15px] font-medium text-gray-800 hover:text-[#c17f59] transition-colors flex items-center gap-1 py-4"
                >
                  {item.title}
                </Link>

                {/* Dropdown Menu - Pure CSS Hover */}
                {item.items.length > 0 && (
                  <div className="absolute top-full -left-6 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                    <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 min-w-[220px] overflow-hidden">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className="block px-5 py-3 text-[14px] text-gray-600 hover:text-[#c17f59] hover:bg-[#fdfbf7] rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            <button className="hidden sm:block text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
              <Search size={22} strokeWidth={1.5} />
            </button>
            <button className="hidden sm:block text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
              <Heart size={22} strokeWidth={1.5} />
            </button>

            {user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={["hover"]} placement="bottomRight" overlayClassName="pt-4">
                <button className="text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
                  <User size={22} strokeWidth={1.5} />
                </button>
              </Dropdown>
            ) : (
              <Link to="/login" className="text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
                <User size={22} strokeWidth={1.5} />
              </Link>
            )}

            <Link to="/cart" className="relative text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#c17f59] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={<span className="font-serif text-[#5d7a5d] text-xl">Cosmo-ticks</span>}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        closeIcon={<X size={24} />}
        width={320}
      >
        <div className="flex flex-col gap-2">
          {navStructure.map((item) => (
            <div key={item.title}>
              <Link
                to={item.path}
                className="flex justify-between items-center py-4 text-gray-900 font-medium text-lg border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
                {item.items.length > 0 && <ChevronDown size={16} className="text-gray-400" />}
              </Link>
              {/* Simple mobile collapse logic could go here, but for now just main links to keep it clean */}
            </div>
          ))}
          {!user && (
            <Link
              to="/login"
              className="mt-8 w-full py-4 bg-gray-900 text-white rounded-full text-center font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In / Register
            </Link>
          )}
        </div>
      </Drawer>
    </>
  );
}

export default Navbar;
