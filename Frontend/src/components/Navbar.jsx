import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Dropdown, Drawer, Badge } from "antd";
import { logoutUser } from "../api-service/user-service.js";
import { navStructure } from "../utils/nav-data";
import { useShop } from "../context/ShopContext";

function Navbar() {
  const { user, cartCount, wishlistCount, refreshShop } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [expandedMobile, setExpandedMobile] = useState(null);

  const toggleMobileCategory = (title) => {
    setExpandedMobile(expandedMobile === title ? null : title);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      await refreshShop(); // Updates context (clears user, cart, wishlist)
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchValue)}`);
    }
  };

  // ... (rest of the component)

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
              <div key={item.title} className="group relative flex items-center gap-1 py-4">
                <Link
                  to={item.path}
                  className="text-[15px] font-medium text-gray-800 hover:text-[#c17f59] transition-colors"
                >
                  {item.title}
                </Link>

                {/* Icon triggers dropdown on click, pure CSS handle hover on group */}
                {item.items.length > 0 && (
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    onClick={(e) => {
                      // Toggle logic handled by CSS group-hover 
                    }}
                  >
                    <ChevronDown size={14} className="text-gray-400 group-hover:text-[#c17f59] transition-colors" />
                  </button>
                )}

                {/* Dropdown Menu - Pure CSS Hover + Peer/Group logic */}
                {item.items.length > 0 && (
                  <div className="absolute top-full -left-6 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
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
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-800 hover:text-[#c17f59] transition-colors duration-300"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="text-gray-800 hover:text-[#c17f59] transition-colors duration-300">
              <Heart size={22} strokeWidth={1.5} />
            </Link>

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
            <div key={item.title} className="border-b border-gray-100 last:border-0">
              <div className="flex justify-between items-center py-4">
                <Link
                  to={item.path}
                  className="text-gray-900 font-medium text-lg flex-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>

                {/* Icon strictly for toggling sub-menu */}
                {item.items.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMobileCategory(item.title);
                    }}
                    className="p-2 text-gray-400 hover:text-[#5d7a5d] transition-colors"
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${expandedMobile === item.title ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              {/* Mobile Submenu */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMobile === item.title ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="pl-4 pb-4 flex flex-col gap-2 bg-gray-50 rounded-lg mb-2">
                  {item.items.map(sub => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      className="text-gray-600 py-2 text-sm hover:text-[#c17f59]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
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
      {/* Search Bar - Appears below navbar */}
      <div
        className={`fixed left-0 w-full bg-white z-40 transition-all duration-300 border-b border-gray-100 shadow-sm overflow-hidden ${searchOpen ? 'top-16 md:top-20 opacity-100 visible' : 'top-14 opacity-0 invisible h-0'
          }`}
      >
        <div className="container mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus={searchOpen}
              />
            </div>
            <button type="submit" className="bg-black !text-white px-8 py-3 rounded-full hover:bg-[#c17f59] transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap">
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="p-3 text-gray-500 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Navbar;
