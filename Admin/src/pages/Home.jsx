import { useEffect, useMemo, useState } from "react";
import { Table, message } from "antd";
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react";
import { getAllOrders } from "../api-service/order-service";
import { getAllUser } from "../api-service/user-service";
import { getAllProducts } from "../api-service/product-service";

function Home() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [orderRes, userRes, productRes] = await Promise.all([
          getAllOrders().catch((e) => ({ __error: e })),
          getAllUser().catch((e) => ({ __error: e })),
          getAllProducts().catch((e) => ({ __error: e })),
        ]);

        if (orderRes?.__error) {
          message.error("Failed to load orders");
        } else {
          const list = Array.isArray(orderRes?.data)
            ? orderRes.data
            : Array.isArray(orderRes?.orders)
              ? orderRes.orders
              : [];
          setOrders(list);
        }

        if (userRes?.__error) {
          message.error("Failed to load users");
        } else {
          setUsers(Array.isArray(userRes?.data) ? userRes.data : []);
        }

        if (productRes?.__error) {
          message.error("Failed to load products");
        } else {
          const list = Array.isArray(productRes?.product)
            ? productRes.product
            : Array.isArray(productRes)
              ? productRes
              : [];
          setProducts(list);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatMoney = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return `$${n.toFixed(2)}`;
  };

  const statusLabel = (status) => {
    // Backend uses Number: 0 = Pending, 1 = Delivered (based on admin update flow)
    return Number(status) === 1 ? "Delivered" : "Pending";
  };

  const statusClass = (status) =>
    Number(status) === 1
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const totalRevenue = useMemo(
    () => orders.reduce((acc, o) => acc + (Number(o?.total) || 0), 0),
    [orders]
  );

  const totalOrders = orders.length;
  const totalUsers = users.length;
  const totalProducts = products.length;

  const lowStockProducts = useMemo(
    () => products.filter((p) => (Number(p?.quantity) || 0) <= 5),
    [products]
  );

  const orderColumns = [
    {
      title: "Order ID",
      key: "orderId",
      render: (_, record) => (
        <span className="font-medium text-gray-700">
          {String(record?._id || "").slice(-8).toUpperCase()}
        </span>
      )
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {(record?.user?.name || record?.name || "U").charAt(0)}
          </div>
          {record?.user?.name || record?.name || "Unknown"}
        </div>
      )
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <span className="font-semibold text-gray-900">{formatMoney(record?.total)}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass(record?.status)}`}>
          {statusLabel(record?.status)}
        </span>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <span className="text-gray-500 text-xs">
          {record?.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}
        </span>
      ),
    }
  ];

  const userColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold">
            {(record?.name || "U").charAt(0)}
          </div>
          <span className="font-medium text-gray-800">{record?.name || "—"}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span className="text-gray-600">{email || "—"}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">
          {role || "user"}
        </span>
      ),
    },
  ];

  const productColumns = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
            <img src={record?.img?.[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 line-clamp-1">{record?.title || "—"}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              {record?.category?.[0] || "—"} {record?.subCategory ? `• ${record.subCategory}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Ordinary",
      key: "oridinaryPrice",
      render: (_, record) => <span className="text-gray-700">{formatMoney(record?.oridinaryPrice)}</span>,
    },
    {
      title: "Discount",
      key: "discountedPrice",
      render: (_, record) => <span className="text-gray-700">{formatMoney(record?.discountedPrice)}</span>,
    },
    {
      title: "Qty",
      key: "quantity",
      render: (_, record) => <span className="font-medium text-gray-800">{Number(record?.quantity) || 0}</span>,
    },
  ];

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-t-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group`} style={{ borderColor: color }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-4 text-xs font-medium">
          <span className={trend > 0 ? "text-green-600" : "text-red-500"}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatMoney(totalRevenue)}
          icon={<DollarSign size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Total Orders"
          value={String(totalOrders)}
          icon={<ShoppingCart size={24} />}
          color="#ec4899"
        />
        <StatCard
          title="Active Products"
          value={String(totalProducts)}
          icon={<Package size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Total Customers"
          value={String(totalUsers)}
          icon={<Users size={24} />}
          color="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden xl:col-span-2">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-lg">Recent Orders</h3>
            <div className="text-xs text-gray-500">{totalOrders} total</div>
          </div>
          <Table
            className="custom-admin-table"
            rowKey={(r) => r._id}
            loading={loading}
            dataSource={orders.slice(0, 8)}
            columns={orderColumns}
            pagination={false}
          />
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-lg">Recent Users</h3>
            <div className="text-xs text-gray-500">{totalUsers} total</div>
          </div>
          <Table
            className="custom-admin-table"
            rowKey={(r) => r._id}
            loading={loading}
            dataSource={users.slice(0, 8)}
            columns={userColumns}
            pagination={false}
          />
        </div>
      </div>

      {/* Products Report */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-lg">Products</h3>
          <div className="text-xs text-gray-500">Low stock: {lowStockProducts.length}</div>
        </div>
        <Table
          className="custom-admin-table"
          rowKey={(r) => r._id}
          loading={loading}
          dataSource={(lowStockProducts.length ? lowStockProducts : products).slice(0, 10)}
          columns={productColumns}
          pagination={false}
        />
      </div>
    </div>
  );
}

export default Home;
