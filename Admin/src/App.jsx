import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Product from "./pages/Product";
import Profile from "./pages/Profile";
import User from "./pages/User";
import Order from "./pages/Order";
import Category from "./pages/Category";
import Setting from "./pages/Setting";
import Backups from "./pages/Backups";
import Chart from "./pages/Chart";
import AllLogs from "./pages/AllLogs";
import AddProduct from "./pages/AddProduct";
import EditProducts from './pages/EditProducts'

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<Login/>}/>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Home />} /> {/* /admin */}
          <Route path="profile" element={<Profile />} />      {/* /admin/profile */}
          <Route path="users" element={<User />} />           {/* /admin/users */}
          <Route path="products" element={<Product />} />     {/* /admin/products */}
          <Route path="products/edit/:id" element={<EditProducts />} />     {/* /admin/products */}
          <Route path="products/add" element={<AddProduct />} />     {/* /admin/products */}
          <Route path="order" element={<Order />} />          {/* /admin/order */}
          <Route path="category" element={<Category />} />       {/* /admin/category */}
          <Route path="settings" element={<Setting />} />     {/* /admin/settings */}
          <Route path="backups" element={<Backups />} />      {/* /admin/backups */}
          <Route path="charts" element={<Chart />} />         {/* /admin/charts */}
          <Route path="all-logs" element={<AllLogs />} />     {/* /admin/all-logs */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;