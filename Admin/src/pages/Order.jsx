import { useState, useEffect } from "react";
import { Table, Tag, Button, message, Steps, Popover, Segmented, Drawer, Descriptions, Divider } from "antd";
import { getAllOrders, updateOrder } from "../api-service/order-service";
import { Truck, CheckCircle, Clock, XCircle, Package, MoreHorizontal, Eye } from "lucide-react";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      const msg = error?.response?.data?.message || error?.message || "Failed to update status";
      message.error(msg);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
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
      title: "Details",
      key: "details",
      width: 90,
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => openDetails(record)}
          icon={<Eye size={16} />}
        />
      ),
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

  const drawerOrder = selectedOrder;
  const drawerItems = Array.isArray(drawerOrder?.products) ? drawerOrder.products : [];
  const itemsData = drawerItems.map((p, idx) => {
    const qty = Number(p?.quantity) || 0;
    const unit = Number(p?.product?.discountedPrice ?? p?.product?.oridinaryPrice ?? 0) || 0;
    return {
      key: String(p?.product?._id || p?.product || idx),
      title: p?.product?.title || "Unknown product",
      qty,
      unit,
      subtotal: qty * unit,
      img: Array.isArray(p?.product?.img) ? p.product.img[0] : p?.product?.img,
    };
  });

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

      <Drawer
        title="Order Details"
        open={drawerOpen}
        width={560}
        onClose={() => setDrawerOpen(false)}
      >
        {!drawerOrder ? (
          <div className="text-gray-500">No order selected</div>
        ) : (
          <>
            <Descriptions
              size="small"
              column={1}
              items={[
                {
                  key: "id",
                  label: "Order ID",
                  children: <span className="font-mono text-xs">{drawerOrder._id}</span>,
                },
                {
                  key: "paymentId",
                  label: "Payment ID",
                  children: <span className="font-mono text-xs">{drawerOrder.paymentId || "—"}</span>,
                },
                {
                  key: "customer",
                  label: "Customer",
                  children: `${drawerOrder.user?.name || "Unknown"} (${drawerOrder.user?.email || drawerOrder.email || "—"})`,
                },
                {
                  key: "createdAt",
                  label: "Created",
                  children: formatDateTime(drawerOrder.createdAt),
                },
                {
                  key: "updatedAt",
                  label: "Updated",
                  children: formatDateTime(drawerOrder.updatedAt),
                },
                {
                  key: "total",
                  label: "Total",
                  children: <span className="font-medium">${Number(drawerOrder.total || 0).toFixed(2)}</span>,
                },
                {
                  key: "restocked",
                  label: "Stock Restored",
                  children: drawerOrder.status === 4 ? (drawerOrder.stockRestored ? "Yes" : "No") : "—",
                },
              ]}
            />

            <Divider className="my-4" />

            <div className="font-medium text-gray-900 mb-3">Items</div>
            <Table
              size="small"
              rowKey="key"
              pagination={false}
              dataSource={itemsData}
              columns={[
                {
                  title: "Product",
                  key: "product",
                  render: (_, r) => (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {r.img ? (
                          <img src={r.img} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="text-gray-900">{r.title}</div>
                    </div>
                  ),
                },
                { title: "Qty", dataIndex: "qty", key: "qty", width: 70 },
                {
                  title: "Unit",
                  dataIndex: "unit",
                  key: "unit",
                  width: 110,
                  render: (v) => `$${Number(v || 0).toFixed(2)}`,
                },
                {
                  title: "Subtotal",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  width: 120,
                  render: (v) => <span className="font-medium">${Number(v || 0).toFixed(2)}</span>,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default Order;
