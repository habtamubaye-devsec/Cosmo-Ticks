import { useState } from 'react';
import MenuItems from './Menu-item';
import { Menu } from 'lucide-react';
import { Drawer } from 'antd';

function Sidebar({ user, setUser }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 h-full flex-shrink-0">
        <MenuItems user={user} setUser={setUser} />
      </div>

      {/* Mobile Top Bar Hook */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowMobileMenu(true)}
          className="p-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-700 active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        open={showMobileMenu}
        placement="left"
        onClose={() => setShowMobileMenu(false)}
        styles={{ body: { padding: 0 }, content: { backgroundColor: '#111827' } }}
        width={280}
        closeIcon={null}
      >
        <MenuItems user={user} setUser={setUser} />
      </Drawer>
    </>
  );
}

export default Sidebar;
