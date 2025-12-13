import { useEffect, useState } from "react";
import { Card, Tabs, Table, Tag, Button, message, Spin } from "antd";
import {
  FaUser,
  FaLock,
  FaBox,
  FaCheckCircle,
  FaTimes,
  FaTruck,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { getCurrentUser } from "../api-service/user-service.js";
import { getUserOrder } from "../api-service/order-service.js";

const statusLabels = {
  0: "Pending",
  1: "Accepted",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

function MyAccount() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "profile";

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (err) {
        message.error("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getData = async (userId) => {
    try {
      setLoading(true);
      const orders = await getUserOrder(userId); // getUserOrder returns orders array
      setOrders(orders);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) getData(user._id);
  }, [user]);

  const renderStatusTag = (status) => {
    switch (status) {
      case "Pending":
        return <Tag color="orange">{status}</Tag>;
      case "Accepted":
        return <Tag color="blue">{status}</Tag>;
      case "Shipped":
        return (
          <Tag icon={<FaTruck />} color="purple">
            {status}
          </Tag>
        );
      case "Delivered":
        return (
          <Tag icon={<FaCheckCircle />} color="green">
            {status}
          </Tag>
        );
      case "Cancelled":
        return (
          <Tag icon={<FaTimes />} color="red">
            {status}
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const orderColumns = [
    {
      title: "Image",
      dataIndex: "productImg", // <- match the mapped field
      key: "productImg",
      render: (img) =>
        img ? (
          <img
            src={img.startsWith("http") ? img : `http://localhost:8000${img}`} // prepend backend URL if needed
            alt="Product"
            style={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: Object.values(statusLabels).map((label) => ({
        text: label,
        value: label,
      })),
      onFilter: (value, record) => record.status === value,
      render: renderStatusTag,
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p) => `$${p.toFixed(2)}`,
    },
  ];

  const mappedOrders = orders.map((order) => ({
    key: order._id,
    productName: order.products.map((p) => p.title).join(", ") || "No products",
    productImg: order.products[0]?.img?.[0] || null, // replace `image` with actual field from your API
    status: statusLabels[order.status],
    quantity: order.products.length,
    price: order.total,
  }));

  if (!user) return <Spin tip="Loading user..." className="mx-auto mt-20" />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <Tabs
        defaultActiveKey={defaultTab}
        items={[
          {
            key: "profile",
            label: (
              <span className="flex items-center gap-2">
                <FaUser /> Profile
              </span>
            ),
            children: (
              <Card>
                <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
                <p>
                  <strong>Name:</strong> {user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Password:</strong>{" "}
                  <span className="tracking-widest">••••••••</span>
                  <Button
                    size="small"
                    type="link"
                    icon={<FaLock />}
                    onClick={() => message.info("Change password coming soon!")}
                  >
                    Change
                  </Button>
                </p>
              </Card>
            ),
          },
          {
            key: "orders",
            label: (
              <span className="flex items-center gap-2">
                <FaBox /> Orders
              </span>
            ),
            children: (
              <Card>
                <h2 className="text-lg font-semibold mb-4">My Orders</h2>
                {loading ? (
                  <Spin tip="Loading orders..." />
                ) : (
                  <Table
                    rowKey="key"
                    dataSource={mappedOrders}
                    columns={orderColumns}
                    pagination={false}
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}

export default MyAccount;
