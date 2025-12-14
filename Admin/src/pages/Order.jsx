import { useState, useEffect } from "react";
import { Table, Tag, Button, message, Steps, Popover, Segmented } from "antd";
import { getAllOrders, updateOrder } from "../api-service/order-service";
import { Truck, CheckCircle, Clock, XCircle, Package, MoreHorizontal } from "lucide-react";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateOrder(id, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      message.success("Order status updated");
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  const getStatusStep = (status) => {
    if (status === 4) return 1; // Cancelled (special case)
    if (status === 3) return 3; // Delivered
    if (status === 2) return 2; // Shipped
    if (status === 1) return 1; // Accepted
    return 0; // Pending
  };

  const StatusProgress = ({ status }) => {
    if (status === 4) return <Tag color="red" icon={<XCircle size={12} />}>Cancelled</Tag>;

    return (
      <Popover
        content={
          <div className="p-4 w-64">
            <Steps
              direction="vertical"
              size="small"
              current={getStatusStep(status)}
              items={[
                { title: 'Pending', icon: <Clock size={14} /> },
                { title: 'Accepted', icon: <CheckCircle size={14} /> },
                { title: 'Shipped', icon: <Truck size={14} /> },
                { title: 'Delivered', icon: <Package size={14} /> },
              ]}
            />
          </div>
        }
        title="Order Progress"
        trigger="hover"
      >
        <div className="cursor-pointer">
          {status === 0 && <Tag color="orange" icon={<Clock size={12} className="mr-1" />}>Pending</Tag>}
          {status === 1 && <Tag color="blue" icon={<CheckCircle size={12} className="mr-1" />}>Accepted</Tag>}
          {status === 2 && <Tag color="purple" icon={<Truck size={12} className="mr-1" />}>Shipped</Tag>}
          {status === 3 && <Tag color="green" icon={<Package size={12} className="mr-1" />}>Delivered</Tag>}
        </div>
      </Popover>
    );
  };

  const filteredOrders = statusFilter === "All"
    ? orders
    : orders.filter(o => {
      if (statusFilter === "Pending") return o.status === 0;
      if (statusFilter === "Completed") return o.status === 3;
      if (statusFilter === "Cancelled") return o.status === 4;
      return true;
    });

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-mono text-xs text-gray-500">{text}</span>
    },
    {
      title: "Customer",
      dataIndex: ["user", "name"],
      key: "customer",
      render: (_, record) => (
        <div>
          <p className="font-medium text-gray-900">{record.user?.name || "Unknown"}</p>
          <p className="text-xs text-gray-400">{record.user?.email || record.email}</p>
        </div>
      ),
    },
    {
      title: "Items",
      key: "products",
      render: (_, record) => (
        <span className="text-gray-600 text-sm">
          {record.products?.length || 0} items
        </span>
      )
    },
    {
      title: "Status Flow",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => <StatusProgress status={status} />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.status === 4) return <span className="text-gray-400 text-xs italic">Cancelled</span>;
        if (record.status === 3) return <span className="text-green-600 text-xs font-medium">Completed</span>;

        return (
          <div className="flex gap-2">
            {record.status === 0 && (
              <Button type="primary" size="small" onClick={() => updateStatus(record._id, 1)} className="bg-indigo-600">Accept</Button>
            )}
            {record.status === 1 && (
              <Button type="primary" size="small" onClick={() => updateStatus(record._id, 2)} className="bg-purple-600">Ship</Button>
            )}
            {record.status === 2 && (
              <Button type="primary" size="small" onClick={() => updateStatus(record._id, 3)} className="bg-green-600">Deliver</Button>
            )}

            <Popover
              content={
                <div className="flex flex-col gap-2">
                  <Button size="small" danger onClick={() => updateStatus(record._id, 4)}>Cancel Order</Button>
                  <Button size="small" onClick={() => updateStatus(record._id, Math.max(0, record.status - 1))}>Rewind Status</Button>
                </div>
              }
              trigger="click"
            >
              <Button type="text" shape="circle" icon={<MoreHorizontal size={16} />} />
            </Popover>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and update customer orders</p>
        </div>

        <Segmented
          options={['All', 'Pending', 'Completed', 'Cancelled']}
          value={statusFilter}
          onChange={setStatusFilter}
          className="bg-white shadow-sm p-1"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          className="custom-admin-table"
          rowKey="_id"
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </div>
    </div>
  );
};

export default Order;
