import { useEffect, useMemo, useState } from "react";
import { Card, message } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAllOrders } from "../api-service/order-service";
import { getAllUser } from "../api-service/user-service";
import { getAllProducts } from "../api-service/product-service";

const statusLabel = (status) => {
  const s = Number(status);
  if (s === 0) return "Pending";
  if (s === 1) return "Accepted";
  if (s === 2) return "Shipped";
  if (s === 3) return "Delivered";
  if (s === 4) return "Cancelled";
  return "Unknown";
};

const isCancelled = (status) => Number(status) === 4;

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
};

const dayKey = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const dayLabel = (yyyyMmDd) => {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
};

const categoryLabel = (raw) => {
  if (!raw) return "Uncategorized";
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (typeof first === "string") return first || "Uncategorized";
    if (first && typeof first === "object") return first?.name || first?.title || "Uncategorized";
    return "Uncategorized";
  }
  if (typeof raw === "string") return raw || "Uncategorized";
  if (typeof raw === "object") return raw?.name || raw?.title || "Uncategorized";
  return "Uncategorized";
};

const pieSliceClasses = [
  "text-indigo-600",
  "text-sky-600",
  "text-emerald-600",
  "text-amber-600",
  "text-rose-600",
  "text-violet-600",
  "text-teal-600",
  "text-lime-600",
  "text-orange-600",
  "text-fuchsia-600",
];

function Chart() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          getAllOrders(),
          getAllUser(),
          getAllProducts(),
        ]);

        const ordersList = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : Array.isArray(ordersRes?.orders)
            ? ordersRes.orders
            : [];

        const usersList = Array.isArray(usersRes?.data)
          ? usersRes.data
          : Array.isArray(usersRes?.users)
            ? usersRes.users
            : [];

        const productsList = Array.isArray(productsRes?.product)
          ? productsRes.product
          : Array.isArray(productsRes?.products)
            ? productsRes.products
            : [];

        setOrders(ordersList);
        setUsers(usersList);
        setProducts(productsList);
      } catch (e) {
        message.error(e?.response?.data?.message || "Failed to load charts data");
        setOrders([]);
        setUsers([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenueTotal = useMemo(() => {
    return orders
      .filter((o) => !isCancelled(o?.status))
      .reduce((acc, o) => acc + (Number(o?.total) || 0), 0);
  }, [orders]);

  const totalOrders = orders.length;
  const cancelledCount = useMemo(
    () => orders.filter((o) => isCancelled(o?.status)).length,
    [orders]
  );

  const revenueByDay = useMemo(() => {
    const days = 14;
    const now = new Date();
    const keys = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      keys.push(dayKey(d));
    }

    const map = new Map(keys.map((k) => [k, { day: dayLabel(k), revenue: 0, orders: 0 }]));
    for (const o of orders) {
      if (isCancelled(o?.status)) continue;
      const k = dayKey(o?.createdAt);
      if (!map.has(k)) continue;
      const row = map.get(k);
      row.revenue += Number(o?.total) || 0;
      row.orders += 1;
    }

    return keys.map((k) => map.get(k));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const base = [
      { status: 0, label: "Pending", count: 0 },
      { status: 1, label: "Accepted", count: 0 },
      { status: 2, label: "Shipped", count: 0 },
      { status: 3, label: "Delivered", count: 0 },
      { status: 4, label: "Cancelled", count: 0 },
    ];
    const by = new Map(base.map((b) => [b.status, b]));
    for (const o of orders) {
      const s = Number(o?.status);
      if (by.has(s)) by.get(s).count += 1;
    }
    return base;
  }, [orders]);

  const newUsersByDay = useMemo(() => {
    const days = 14;
    const now = new Date();
    const keys = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      keys.push(dayKey(d));
    }

    const map = new Map(keys.map((k) => [k, { day: dayLabel(k), users: 0 }]));
    for (const u of users) {
      const k = dayKey(u?.createdAt);
      if (!map.has(k)) continue;
      map.get(k).users += 1;
    }

    return keys.map((k) => map.get(k));
  }, [users]);

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const label = categoryLabel(p?.category);
      map.set(label, (map.get(label) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Charts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Revenue and orders summary (last 14 days)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card loading={loading} className="shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Revenue (non-cancelled)</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(revenueTotal)}</div>
        </Card>
        <Card loading={loading} className="shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</div>
        </Card>
        <Card loading={loading} className="shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm">Cancelled</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{cancelledCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">Revenue by day</div>
            <div className="text-xs text-gray-500">Last 14 days</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(v, name) =>
                    name === "revenue" ? formatMoney(v) : v
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="currentColor"
                  className="text-indigo-600"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="currentColor"
                  className="text-gray-700"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">Orders by status</div>
            <div className="text-xs text-gray-500">All time</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatus} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(v, name, props) => {
                    if (name === "count") return [v, statusLabel(props?.payload?.status)];
                    return [v, name];
                  }}
                />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Orders"
                  fill="currentColor"
                  className="text-indigo-600"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">New users by day</div>
            <div className="text-xs text-gray-500">Last 14 days</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newUsersByDay} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="currentColor"
                  className="text-indigo-600"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-gray-900">Products by category</div>
            <div className="text-xs text-gray-500">All time</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(v, name, props) => [v, props?.payload?.name || name]}
                />
                <Legend />
                <Pie
                  data={productsByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {productsByCategory.map((entry, idx) => (
                    <Cell
                      key={`${entry.name}-${idx}`}
                      fill="currentColor"
                      className={pieSliceClasses[idx % pieSliceClasses.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chart;