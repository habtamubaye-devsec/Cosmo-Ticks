import { Table, Tag } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function App() {
  const user = { isAdmin: true, name: "Admin" };

  // Sample table data
  const dataSource = [
    {
      key: "1",
      orderId: "ORD001",
      customer: "John Doe",
      amount: 120,
      status: "Pending",
    },
    {
      key: "2",
      orderId: "ORD002",
      customer: "Jane Smith",
      amount: 250,
      status: "Approved",
    },
  ];

  const data = [
  { name: "Jan", revenue: 400 },
  { name: "Feb", revenue: 300 },
  { name: "Mar", revenue: 500 },
  { name: "Apr", revenue: 450 },
  { name: "May", revenue: 600 },
  { name: "Jun", revenue: 550 },
  { name: "Jul", revenue: 700 },
];

  const columns = [
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Approved" ? "green" : "orange"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row p-6 gap-10 bg-gray-200 lg:h-screen">
      {/* Left side */}
      <div className="flex-2 flex mt-5 flex-col">
        {/* Top cards always in a row */}
        <div className="flex gap-5 mb-5 w-full">
          <div className="flex-1 bg-white rounded-2xl aspect-square flex flex-col items-center justify-center shadow-lg min-w-0">
            <div className="h-1/2 w-1/2 border-8 border-blue-400 rounded-full flex items-center justify-center">
              <h2 className="text-2xl font-bold text-center">945</h2>
            </div>
            <h2 className="mt-2 text-center">Products</h2>
          </div>

          <div className="flex-1 bg-white rounded-2xl aspect-square flex flex-col items-center justify-center shadow-lg min-w-0">
            <div className="h-1/2 w-1/2 border-8 border-green-400 rounded-full flex items-center justify-center">
              <h2 className="text-2xl font-bold text-center">350</h2>
            </div>
            <h2 className="mt-2 text-center">Users</h2>
          </div>

          <div className="flex-1 bg-white rounded-2xl aspect-square flex flex-col items-center justify-center shadow-lg min-w-0">
            <div className="h-1/2 w-1/2 border-8 border-red-400 rounded-full flex items-center justify-center">
              <h2 className="text-2xl font-bold text-center">120</h2>
            </div>
            <h2 className="mt-2 text-center">Orders</h2>
          </div>
        </div>

        {/* Table */}
        <div className="p-5 bg-white rounded-2xl shadow-lg mt-5">
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 rounded-xl bg-white mt-5 p-5 py-5 flex flex-col gap-10">
        <div className="bg-gray-50 rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold">Total Revenue</h3>
          <p className="text-green-500 text-xl">$5000</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold">Total Loss</h3>
          <p className="text-red-500 text-xl">$1200</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 shadow-xl flex-1">
          <LineChart width={400} height={300} data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

export default App;
