import { useEffect, useState } from "react";
import { Card, Tabs, Table, Tag, Button, message, Spin, Modal, Form, Input } from "antd";
import { FaUser, FaLock, FaBox } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { getCurrentUser } from "../api-service/user-service.js";
import { getUserOrder } from "../api-service/order-service.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { changePassword } from "../api-service/user-service.js";

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
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [form] = Form.useForm();
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
        return <Tag color="purple">{status}</Tag>;
      case "Delivered":
        return <Tag color="green">{status}</Tag>;
      case "Cancelled":
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Track screen size for responsive pagination behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const ImageWithFallback = ({ src, alt, style }) => {
    const [error, setError] = useState(false);
    const resolvedSrc = src && (src.startsWith("http") ? src : `http://localhost:8000${src}`);
    if (!resolvedSrc || error) {
      return <span className="text-gray-500 text-sm">No Image</span>;
    }
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        style={style}
        onError={() => setError(true)}
      />
    );
  };

  const orderColumns = [
    {
      title: "Image",
      dataIndex: "productImg", // <- match the mapped field
      key: "productImg",
      render: (img) => (
        <ImageWithFallback
          src={img}
          alt="Product"
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
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
    productImg:
      order.products?.[0]?.product?.img?.[0] ||
      order.products?.[0]?.product?.img ||
      null,
    status: statusLabels[order.status],
    quantity:
      order.products?.reduce((sum, item) => sum + (item?.quantity || 0), 0) ||
      0,
    price: Number(order.total || 0),
  }));

  if (!user)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pb-20">
          <section className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-2">
                <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-gray-900">
                  My Account
                </h1>
                <p className="text-sm sm:text-base text-gray-500">
                  Loading your profile…
                </p>
              </div>

              <div className="flex justify-center py-16">
                <Spin tip="Loading user..." />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    );

  return (
    <div className="bg-gray-50">
      <Navbar />
      {/* <hr /> */}
      <main className="pb-20">
        <section className="container mx-auto max-w-6xl px-4 sm:px-6">
          <header className="-mt-10 mb-8  sm:mb-10">
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-gray-900">
              My Account
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Manage your profile and track your orders.
            </p>
          </header>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Tabs
              defaultActiveKey={defaultTab}
              tabBarStyle={{ margin: 0, paddingLeft: 24, paddingRight: 24 }}
              className="[&_.ant-tabs-nav]:m-0 [&_.ant-tabs-nav]:px-0 [&_.ant-tabs-nav]:pt-3 [&_.ant-tabs-nav]:pb-0"
              items={[
                {
                  key: "profile",
                  label: (
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                      <FaUser /> Profile
                    </span>
                  ),
                  children: (
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col gap-8">
                        <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-1 ring-gray-200">
                                <span className="text-lg font-semibold text-gray-600">
                                  {(user?.name || "U")
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                  Profile
                                </p>
                                <h2 className="mt-1 truncate font-serif text-2xl text-gray-900">
                                  {user?.name}
                                </h2>
                                <p className="mt-1 truncate text-sm text-gray-500">
                                  {user?.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-1 sm:items-end">
                              <p className="text-xs uppercase tracking-wider text-gray-500">
                                Account
                              </p>
                              <p className="text-sm text-gray-700">
                                Personal settings & security
                              </p>
                            </div>
                          </div>
                        </Card>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                          <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                            <div className="mb-6">
                              <h3 className="font-serif text-xl text-gray-900">
                                Profile Overview
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Your basic account information.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                  Name
                                </p>
                                <p className="mt-1 text-base font-medium text-gray-900">
                                  {user?.name}
                                </p>
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                  Email
                                </p>
                                <p className="mt-1 break-all text-base font-medium text-gray-900">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </Card>

                          <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                            <div className="mb-6">
                              <h3 className="font-serif text-xl text-gray-900">
                                Account Security
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Manage your password and sign-in preferences.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
                              <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                  Password
                                </p>
                                <p className="mt-1 text-base font-medium tracking-widest text-gray-900">
                                  ••••••••
                                </p>
                              </div>

                              <div className="flex sm:justify-end">
                                <Button
                                  size="small"
                                  type="link"
                                  icon={<FaLock />}
                                  className="!h-9 !rounded-full !px-3 !text-gray-600 transition-colors duration-200 hover:!text-gray-900"
                                  onClick={() => setPwdModalOpen(true)}
                                >
                                  Change
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "orders",
                  label: (
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                      <FaBox /> Orders
                    </span>
                  ),
                  children: (
                    <Card className="rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h2 className="font-serif text-xl text-gray-900">
                            My Orders
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Track and manage your purchases.
                          </p>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex justify-center py-12">
                          <Spin tip="Loading orders..." />
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                
                            <Table
                              rowKey="key"
                              dataSource={mappedOrders}
                              columns={orderColumns}
                              pagination={{
                                pageSize: 5,
                                hideOnSinglePage: true,
                                responsive: true,
                                showLessItems: isMobile,
                                current: currentPage,
                                onChange: (page) => setCurrentPage(page),
                                itemRender: (page, type, originalElement) => {
                                  if (type === "jump-prev" || type === "jump-next") {
                                    return <span style={{ padding: "0 8px" }}>…</span>;
                                  }
                                  return originalElement;
                                },
                              }}
                              scroll={{ x: "max-content" }}
                            />
                        </div>
                      )}
                    </Card>
                  ),
                },
              ]}
            />
          </div>
        </section>
      </main>

      <Modal
        title="Change Password"
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={pwdLoading}
        okText="Update"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            if (values.newPassword !== values.confirmPassword) {
              return message.error("New password and confirmation do not match");
            }
            try {
              setPwdLoading(true);
              const res = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
              message.success(res?.message || "Password updated successfully");
              setPwdModalOpen(false);
              form.resetFields();
            } catch (err) {
              message.error(err?.message || "Failed to update password");
            } finally {
              setPwdLoading(false);
            }
          }}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: "Please enter your current password" }]}
          >
            <Input.Password autoComplete="current-password" className="!rounded-xl !h-11" />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Please enter a new password" }]}
          >
            <Input.Password autoComplete="new-password" className="!rounded-xl !h-11" />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm the new password" }]}
          >
            <Input.Password autoComplete="new-password" className="!rounded-xl !h-11" />
          </Form.Item>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}

export default MyAccount;
