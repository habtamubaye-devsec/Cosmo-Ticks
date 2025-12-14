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

function App() {
  return (
    <BrowserRouter>
      {/* Scroll to top on route change could be added here */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Category / Shop Routes */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:category" element={<Shop />} />
        <Route path="/category/:category/:subcategory" element={<Shop />} />

        {/* Static page fallback */}
        <Route path="/about" element={<Home />} />

        {/* Private Routes */}
        <Route element={<PrivateLayout />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-account" element={<MyAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;