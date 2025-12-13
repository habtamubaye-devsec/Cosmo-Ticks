import { useState, useEffect } from "react";
import { Table, Tag, Button, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../api-service/product-service";

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      console.log("Fetched data:", data); // <- see what you actually get
      setProducts(
        Array.isArray(data.product)
          ? data.product
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      message.success("Product deleted successfully");
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    {
      title: "Image",
      dataIndex: "img", // match the DB field
      key: "img",
      render: (img) => (
        <img
          src={img}
          alt="product"
          className="h-16 w-16 object-cover rounded-lg"
        />
      ),
    },
    { title: "Product Name", dataIndex: "title", key: "title" },
    {
      title: "Price",
      dataIndex: "oridinaryPrice",
      key: "oridinaryPrice",
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: "In Stock",
      dataIndex: "inStock",
      key: "inStock",
      render: (inStock) =>
        inStock ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/products/edit/${record._id}`)}
            type="primary"
          />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-600 py-4">Products</h1>
      <Table
        rowKey="_id"
        rowSelection={{}}
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
      <Button type="primary" onClick={() => navigate("/admin/products/add")}>
        Create Product
      </Button>
    </div>
  );
};

export default ProductPage;
