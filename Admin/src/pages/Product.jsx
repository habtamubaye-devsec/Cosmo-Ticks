import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Tooltip, Alert } from "antd";
import { Edit2, Trash2, Plus, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, deleteProduct } from "../api-service/product-service";

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(
        Array.isArray(data.product) ? data.product : Array.isArray(data) ? data : []
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

  const outOfStockCount = products.filter((p) => (Number(p?.quantity) || 0) <= 0).length;

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
    {
      title: "Product",
      key: "product",
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
            <img src={record.img?.[0]} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">{record.title}</p>
            <p className="text-xs text-gray-500 font-mono text-ellipsis overflow-hidden w-20 line-clamp-1">ID: {record._id}</p>
          </div>
        </div>
      )
    },
    {
      title: "Ordinary",
      dataIndex: "oridinaryPrice",
      key: "oridinaryPrice",
      render: (price) => (
        <span className="font-medium text-gray-700">
          {typeof price === "number" ? `$${price.toFixed(2)}` : "—"}
        </span>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discountedPrice",
      key: "discountedPrice",
      render: (price) => (
        <span className="font-medium text-gray-700">
          {typeof price === "number" ? `$${price.toFixed(2)}` : "—"}
        </span>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => <span className="font-medium text-gray-700">{typeof qty === "number" ? qty : 0}</span>,
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => <span className="text-gray-700">{record.category?.[0] || "—"}</span>,
    },
    {
      title: "Subcategory",
      dataIndex: "subCategory",
      key: "subCategory",
      render: (v) => <span className="text-gray-700">{v || "—"}</span>,
    },
    {
      title: "Stock Status",
      key: "status",
      render: (_, record) => {
        const quantity = typeof record.quantity === "number" ? record.quantity : 0;
        const inStock = typeof record.inStock === "boolean" ? record.inStock : quantity > 0;
        if (inStock && quantity > 0) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
              <CheckCircle size={12} />
              <span>In Stock</span>
            </div>
          );
        } else {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              <XCircle size={12} />
              <span>Out of Stock</span>
            </div>
          );
        }
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit Product">
            <Button
              className="flex items-center justify-center border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-600 bg-white shadow-sm"
              shape="circle"
              icon={<Edit2 size={16} />}
              onClick={() => navigate(`/admin/products/edit/${record._id}`)}
            />
          </Tooltip>

          <Popconfirm
            title="Delete this product?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button shape="circle" danger icon={<Trash2 size={16} />} className="flex items-center justify-center shadow-sm" />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => navigate("/admin/products/add")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-200 h-10 px-5 font-medium"
        >
          Add Product
        </Button>
      </div>

      {outOfStockCount > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${outOfStockCount} product${outOfStockCount === 1 ? " is" : "s are"} out of stock`}
          description="Update the quantity to make them available to users again."
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          className="custom-admin-table"
          rowKey="_id"
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Total ${total} items`,
            position: ['bottomRight']
          }}
        />
      </div>
    </div>
  );
};

export default ProductPage;
