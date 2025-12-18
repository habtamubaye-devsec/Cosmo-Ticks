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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
      render: (p) => `$${Number(p || 0).toFixed(2)}`,
    },
  ];

  const mappedOrders = orders.map((order) => ({
    key: order._id,
    productName:
      order.products
        ?.map((item) => item?.product?.title)
        .filter(Boolean)
        .join(", ") || "No products",
    productImg: order.products?.[0]?.product?.img?.[0] || order.products?.[0]?.product?.img || null,
    status: statusLabels[order.status],
    quantity:
      order.products?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0,
    price: Number(order.total || 0),
  }));

  if (!user) return <Spin tip="Loading user..." className="mx-auto mt-20" />;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h1 className="font-serif text-4xl text-gray-900 mb-10">My Account</h1>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <Tabs
              defaultActiveKey={defaultTab}
              tabBarStyle={{ margin: 0, paddingLeft: 24, paddingRight: 24 }}
              items={[
                {
                  key: "profile",
                  label: (
                    <span className="flex items-center gap-2">
                      <FaUser /> Profile
                    </span>
                  ),
                  children: (
                    <div className="p-6">
                      <Card className="rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-serif text-xl text-gray-900 mb-4">Profile Details</h2>
                        <div className="space-y-2 text-gray-700">
                          <p>
                            <span className="text-gray-500">Name:</span> {user?.name}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span> {user?.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-gray-500">Password:</span>
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
                        </div>
                      </Card>
                    </div>
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
                    <div className="p-6">
                      <Card className="rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-serif text-xl text-gray-900 mb-4">My Orders</h2>
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
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyAccount;
