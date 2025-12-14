import { Table, Tag, Card } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Package, Users, ShoppingCart, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

function Home() {
  // Sample table data
  const dataSource = [
    { key: "1", orderId: "ORD-7231", customer: "John Doe", amount: 120, status: "Pending", date: "2 mins ago" },
    { key: "2", orderId: "ORD-7232", customer: "Jane Smith", amount: 250, status: "Approved", date: "15 mins ago" },
    { key: "3", orderId: "ORD-7233", customer: "Mike Ross", amount: 89, status: "Pending", date: "1 hour ago" },
    { key: "4", orderId: "ORD-7234", customer: "Rachel G.", amount: 420, status: "Approved", date: "3 hours ago" },
  ];

  const data = [
    { name: "Jan", revenue: 4000, loss: 2400 },
    { name: "Feb", revenue: 3000, loss: 1398 },
    { name: "Mar", revenue: 5000, loss: 9800 },
    { name: "Apr", revenue: 4500, loss: 3908 },
    { name: "May", revenue: 6000, loss: 4800 },
    { name: "Jun", revenue: 5500, loss: 3800 },
    { name: "Jul", revenue: 7000, loss: 4300 },
  ];

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => <span className="font-medium text-gray-700">{text}</span>
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {text.charAt(0)}
          </div>
          {text}
        </div>
      )
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <span className="font-semibold text-gray-900">${amount}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status === "Approved"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
          {status}
        </span>
      ),
    },
    { title: "Time", dataIndex: "date", key: "date", className: "text-gray-400 text-xs" }
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
          value="$54,230"
          icon={<DollarSign size={24} />}
          color="#6366f1"
          trend={12.5}
        />
        <StatCard
          title="Total Orders"
          value="1,245"
          icon={<ShoppingCart size={24} />}
          color="#ec4899"
          trend={-2.4}
        />
        <StatCard
          title="Active Products"
          value="945"
          icon={<Package size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Total Customers"
          value="350"
          icon={<Users size={24} />}
          color="#f59e0b"
          trend={8.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-lg">Revenue Overview</h3>
            <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 p-1">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Widgets */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex-1">
            <h3 className="font-semibold text-gray-800 mb-4">Performance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Sales Goal</span>
                  <span className="font-medium text-gray-700">85%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Customer Retention</span>
                  <span className="font-medium text-gray-700">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Pro Tip</p>
                <h4 className="font-bold text-lg mb-2">Check Inventory</h4>
                <p className="text-indigo-100 text-sm opacity-90">3 items are running low on stock. Reorder soon to avoid outages.</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-lg">Recent Orders</h3>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
        </div>
        <Table
          className="custom-admin-table"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </div>
    </div>
  );
}

export default Home;
