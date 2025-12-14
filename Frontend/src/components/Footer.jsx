import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

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
              <li><a href="#" className="hover:text-gray-900 transition-colors">Skincare</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Makeup</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Body</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Hair</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Sets & Bundles</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Help</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe for exclusive offers and beauty tips.</p>
            <div className="flex gap-4 mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400"
              />
              <button className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition-colors">
                Subscribe
              </button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><FaTwitter size={20} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; 2025 Cosmo-ticks. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;