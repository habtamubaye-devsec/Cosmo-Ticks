import { useState } from "react";
import { Button, Card, message } from "antd";
import { Download } from "lucide-react";
import { getAllOrders } from "../api-service/order-service";
import { getAllUser } from "../api-service/user-service";
import { getAllProducts } from "../api-service/product-service";

const csvEscape = (value) => {
  const s = value == null ? "" : String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const toCsv = (headers, rows) => {
  const headerLine = headers.map(csvEscape).join(",");
  const lines = rows.map((r) => headers.map((h) => csvEscape(r[h])).join(","));
  // Add UTF-8 BOM for Excel compatibility.
  return `\uFEFF${[headerLine, ...lines].join("\n")}`;
};

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const todayStamp = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const orderStatusLabel = (status) => {
  const s = Number(status);
  if (s === 0) return "Pending";
  if (s === 1) return "Accepted";
  if (s === 2) return "Shipped";
  if (s === 3) return "Delivered";
  if (s === 4) return "Cancelled";
  return "Unknown";
};

function Backups() {
  const [loadingKey, setLoadingKey] = useState(null);

  const exportOrders = async () => {
    try {
      setLoadingKey("orders");
      const res = await getAllOrders();
      const orders = Array.isArray(res?.data) ? res.data : [];

      const headers = [
        "orderId",
        "customerName",
        "customerEmail",
        "paymentId",
        "status",
        "itemsCount",
        "items",
        "total",
        "createdAt",
        "updatedAt",
      ];

      const rows = orders.map((o) => {
        const products = Array.isArray(o?.products) ? o.products : [];
        const items = products
          .map((p) => {
            const title = p?.product?.title || "Unknown";
            const qty = Number(p?.quantity) || 0;
            return `${title} x${qty}`;
          })
          .join("; ");

        return {
          orderId: o?._id || "",
          customerName: o?.user?.name || o?.name || "",
          customerEmail: o?.user?.email || o?.email || "",
          paymentId: o?.paymentId || "",
          status: orderStatusLabel(o?.status),
          itemsCount: products.length,
          items,
          total: Number(o?.total) || 0,
          createdAt: o?.createdAt || "",
          updatedAt: o?.updatedAt || "",
        };
      });

      const csv = toCsv(headers, rows);
      downloadTextFile(`orders-${todayStamp()}.csv`, csv);
      message.success("Orders CSV downloaded");
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to export orders");
    } finally {
      setLoadingKey(null);
    }
  };

  const exportUsers = async () => {
    try {
      setLoadingKey("users");
      const res = await getAllUser();
      const users = Array.isArray(res?.data) ? res.data : [];

      const headers = ["userId", "name", "email", "role", "status", "createdAt", "updatedAt"]; 
      const rows = users.map((u) => ({
        userId: u?._id || "",
        name: u?.name || "",
        email: u?.email || "",
        role: u?.role || "user",
        status: u?.status || "",
        createdAt: u?.createdAt || "",
        updatedAt: u?.updatedAt || "",
      }));

      const csv = toCsv(headers, rows);
      downloadTextFile(`users-${todayStamp()}.csv`, csv);
      message.success("Users CSV downloaded");
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to export users");
    } finally {
      setLoadingKey(null);
    }
  };

  const exportProducts = async () => {
    try {
      setLoadingKey("products");
      const res = await getAllProducts();
      const products = Array.isArray(res?.product) ? res.product : [];

      const headers = [
        "productId",
        "title",
        "category",
        "subCategory",
        "quantity",
        "inStock",
        "oridinaryPrice",
        "discountedPrice",
        "createdAt",
        "updatedAt",
      ];

      const rows = products.map((p) => ({
        productId: p?._id || "",
        title: p?.title || "",
        category: Array.isArray(p?.category) ? p.category.join(" | ") : p?.category || "",
        subCategory: p?.subCategory || "",
        quantity: Number(p?.quantity) || 0,
        inStock: typeof p?.inStock === "boolean" ? String(p.inStock) : "",
        oridinaryPrice: Number(p?.oridinaryPrice) || 0,
        discountedPrice: Number(p?.discountedPrice) || 0,
        createdAt: p?.createdAt || "",
        updatedAt: p?.updatedAt || "",
      }));

      const csv = toCsv(headers, rows);
      downloadTextFile(`products-${todayStamp()}.csv`, csv);
      message.success("Products CSV downloaded");
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to export products");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
        <p className="text-gray-500 text-sm mt-1">Download CSV exports for reporting and backups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border border-gray-100" title="Orders">
          <p className="text-gray-500 text-sm mb-4">Export all orders to CSV.</p>
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-indigo-600"
            loading={loadingKey === "orders"}
            onClick={exportOrders}
          >
            Download Orders CSV
          </Button>
        </Card>

        <Card className="shadow-sm border border-gray-100" title="Users">
          <p className="text-gray-500 text-sm mb-4">Export all users to CSV.</p>
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-indigo-600"
            loading={loadingKey === "users"}
            onClick={exportUsers}
          >
            Download Users CSV
          </Button>
        </Card>

        <Card className="shadow-sm border border-gray-100" title="Products">
          <p className="text-gray-500 text-sm mb-4">Export all products to CSV.</p>
          <Button
            type="primary"
            icon={<Download size={16} />}
            className="bg-indigo-600"
            loading={loadingKey === "products"}
            onClick={exportProducts}
          >
            Download Products CSV
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Backups;