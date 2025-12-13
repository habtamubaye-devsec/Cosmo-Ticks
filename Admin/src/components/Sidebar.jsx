import { useState } from 'react';
import MenuItems from './Menu-item';
import { Menu } from 'lucide-react';
import { Drawer } from 'antd';

function Sidebar({ user, setUser }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className='flex'>
      {/* Desktop sidebar */}
      <div className="lg:flex hidden w-full h-full mt-5">
        <MenuItems user={user} setUser={setUser} /> {/* pass separately */}
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-gray-300 flex items-center p-2 px-4 shadow-md">
        <Menu
          size={24}
          onClick={() => setShowMobileMenu(true)}
          className="cursor-pointer hover:text-red-400"
        />
      </div>

      {/* Mobile drawer */}
      <Drawer
        open={showMobileMenu}
        placement="left"
        onClose={() => setShowMobileMenu(false)}
        bodyStyle={{ padding: 0 }}
      >
        <MenuItems user={user} setUser={setUser} /> {/* also pass separately */}
      </Drawer>
    </div>
  );
}

export default Sidebar;
