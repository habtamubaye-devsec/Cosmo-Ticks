import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl text-[#5d7a5d] mb-4">Cosmo-ticks</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sustainable beauty for the modern woman. Clean, ethical, and effective.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/category/skincare" className="hover:text-gray-900 transition-colors">Skincare</Link></li>
              <li><Link to="/category/makeup" className="hover:text-gray-900 transition-colors">Makeup</Link></li>
              <li><Link to="/category/body" className="hover:text-gray-900 transition-colors">Body</Link></li>
              <li><Link to="/category/hair" className="hover:text-gray-900 transition-colors">Hair</Link></li>
              <li><Link to="/shop" className="hover:text-gray-900 transition-colors">Sets & Bundles</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Help</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="mailto:support@cosmo-ticks.com" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
              <li><Link to="/about" className="hover:text-gray-900 transition-colors">FAQs</Link></li>
              <li><Link to="/about" className="hover:text-gray-900 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/my-account?tab=orders" className="hover:text-gray-900 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe for exclusive offers and beauty tips.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 !text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Instagram"><FaInstagram size={20} /></a>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Facebook"><FaFacebook size={20} /></a>
              <a href="https://x.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="X"><FaTwitter size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; 2025 Cosmo-ticks. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/about" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-gray-600 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;