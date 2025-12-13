import { useState, useEffect } from "react";
import { Table, Tag, Button, message } from "antd";
import { getAllOrders, updateOrder } from "../api-service/order-service";

const statusColors = {
  0: "orange", // Pending
  1: "blue", // Accepted / Shipping
  2: "purple", // Shipped
  3: "green", // Delivered
  4: "red", // Cancelled
};

const statusLabels = {
  0: "Pending",
  1: "Accepted",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const updateStatus = async (id, newStatus) => {
    try {
      const data = await updateOrder(id, newStatus); // call API
      // Update local state after successful API call
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );

      let msg = "";
      if (newStatus === 1) msg = "Order accepted";
      if (newStatus === 2) msg = "Order shipped";
      if (newStatus === 3) msg = "Order delivered";
      if (newStatus === 4) msg = "Order cancelled";

      message.success(msg);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    { title: "Order ID", dataIndex: "_id", key: "_id" },
    {
      title: "Customer",
      dataIndex: ["user", "name"],
      key: "customer",
      render: (_, record) => record.user?.name || "N/A",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      render: (_, record) => record.user?.email || record.email,
    },
    {
      title: "Products",
      key: "products",
      render: (_, record) =>
        record.products?.map((p) => p.title).join(", ") || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Pending", value: 0 },
        { text: "Accepted", value: 1 },
        { text: "Shipped", value: 2 },
        { text: "Delivered", value: 3 },
        { text: "Cancelled", value: 4 },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const buttons = [];

        switch (record.status) {
          case 0: // Pending
            buttons.push(
              <Button
                key="accept"
                type="primary"
                onClick={() => updateStatus(record._id, 1)}
                style={{ marginRight: 5, marginBottom: 5 }}
              >
                Accept
              </Button>
            );
            buttons.push(
              <Button
                key="cancel"
                danger
                onClick={() => updateStatus(record._id, 4)}
              >
                Cancel
              </Button>
            );
            break;
          case 1: // Accepted / Ready to ship
            buttons.push(
              <Button
                key="ship"
                type="primary"
                onClick={() => updateStatus(record._id, 2)}
                style={{ marginRight: 5, marginBottom: 5 }}
              >
                Start Shipping
              </Button>
            );
            buttons.push(
              <Button
                type="default"
                onClick={() => updateStatus(record._id, 0)}
                style={{ marginRight: 5, marginBottom: 5 }}
              >Undo</Button>
            );
            break;
          case 2: // Shipped
            buttons.push(
              <Button
                key="deliver"
                type="primary"
                onClick={() => updateStatus(record._id, 3)}
                style={{ marginRight: 5 , marginBottom: 5  }}
              >
                Deliver
              </Button>
            );
            buttons.push(
              <Button
                type="default"
                onClick={() => updateStatus(record._id, 1)}
                style={{ marginRight: 5 }}
              >Undo</Button>
            );
            break;
          case 3: // Shipped
            buttons.push(
              <Button
                type="default"
                onClick={() => updateStatus(record._id, 2)}
                style={{ marginRight: 5}}
              >Undo</Button>
            );
            break;
            case 4: 
            buttons.push(
              <Button
                type="default"
                onClick={() => updateStatus(record._id, 0)}
                style={{ marginRight: 5}}
              >Undo</Button>
            );
            break;
          default: // Delivered or Cancelled
            break;
        }

        return <div>{buttons}</div>;
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-600 py-4">Orders</h1>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{ pageSize: 7 }}
        scroll={{ y: 700 }}
      />
    </div>
  );
};

export default Order;
