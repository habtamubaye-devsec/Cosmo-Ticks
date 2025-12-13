import { useState, useEffect } from "react";
import { Table, message, Popconfirm } from "antd";
import { Trash } from "lucide-react";
import { getAllUser } from "../api-service/user-service";

function User() {
  const [data, setData] = useState([]); // initialize as empty array
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await getAllUser();

      // Safe check for users array
      if (response?.data && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
        message.warning("No users found");
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item._id !== id));
    message.success("User deleted successfully");
  };

  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure delete this user?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Trash size={18} className="cursor-pointer text-red-600" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-600 py-4">Users</h1>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />
    </div>
  );
}

export default User;
