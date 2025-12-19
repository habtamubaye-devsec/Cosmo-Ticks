import { BrowserRouter, Route, Routes } from "react-router-dom";
import "antd/dist/reset.css";
import "./App.css";

/* Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import MyAccount from "./pages/MyAccount";
import PrivateLayout from "./layout/PrivateLayout";
import Wishlist from "./pages/Wishlist";
import OAuthCallback from "./pages/OAuthCallback";
import OrderSuccess from "./pages/OrderSuccess"; 
import About from "./pages/About";
import { ShopProvider } from "./context/ShopContext";

function App() {
  return (
    <BrowserRouter>
      {/* ShopProvider must be inside Router if it uses router hooks (useNavigate), 
          BUT ShopContext uses simple fetch/state, so it's safer to wrap Router if possible, 
          or wrap Routes inside Router. 
          The issue: ShopContext uses nothing from Router? 
          Wait, I implemented ShopContext using `useShop`. 
          Actually ShopContext doesn't depend on Router unless I added redirects there. 
          Looking at my ShopContext implementation: it uses `message` from antd, but no router hooks.
          However, Navbar uses useShop and is inside Router.
          So ShopProvider needs to be parent of Navbar. Navbar is inside Home/Cart/etc.
          So wrapping Routes is fine.
      */}
      <ShopProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* OAuth callback */}
          <Route path="/auth/success" element={<OAuthCallback />} />

          {/* Order Success */}
          <Route path="/order/success" element={<OrderSuccess />} />

          {/* Category / Shop Routes */}
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:category" element={<Shop />} />
          <Route path="/category/:category/:subcategory" element={<Shop />} />

          <Route path="/about" element={<About />} />

          {/* Private Routes */}
          <Route element={<PrivateLayout />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-account" element={<MyAccount />} />
          </Route>
        </Routes>
      </ShopProvider>
    </BrowserRouter>
  );
}

export default App;