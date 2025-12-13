import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Upload,
  Select,
  Switch,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getProductById } from "../api-service/product-service"; // ensure this exists
import axios from "axios";

const { TextArea } = Input;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // Fetch product data and prefill form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id); // returns { message, product }
        const product = res.product; // grab the actual product object

        // Prefill form fields
        form.setFieldsValue({
          ...product,
          category: product.category || [],
          concern: product.concern || [],
          inStock: product.inStock || false,
        });

        // Prefill existing images
        if (product.img && product.img.length > 0) {
          setFileList(
            product.img.map((url, index) => ({
              uid: `-${index}`,
              name: `Image ${index + 1}`,
              status: "done",
              url,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, form]);

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  const onFinish = async (values) => {
    const formData = new FormData();

    // Add new or existing images
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("media", file.originFileObj); // new upload
      } else if (file.url) {
        formData.append("existingImages", file.url); // existing images
      }
    });

    // Append other form fields
    for (let key in values) {
      // If array (tags), append as JSON string
      if (Array.isArray(values[key])) {
        formData.append(key, JSON.stringify(values[key]));
      } else {
        formData.append(key, values[key]);
      }
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/v1/products/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      message.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">Edit Product</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="What Inbox?"
          name="whatInbox"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Image" required>
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleUploadChange}
            listType="picture"
            multiple
          >
            <Button icon={<UploadOutlined />}>Upload Images</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Video URL" name="video">
          <Input />
        </Form.Item>

        <Form.Item label="Ordinary Price" name="oridinaryPrice">
          <InputNumber min={0} prefix="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Discounted Price" name="discountedPrice">
          <InputNumber min={0} prefix="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Wholesale Price" name="wholeSalePrice">
          <InputNumber min={0} prefix="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Wholesale Minimum Quantity"
          name="WholeSaleMinimumQuantity"
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select mode="tags" placeholder="Enter categories"></Select>
        </Form.Item>

        <Form.Item label="Concern" name="concern">
          <Select mode="tags" placeholder="Enter concerns"></Select>
        </Form.Item>

        <Form.Item label="Brand" name="brand">
          <Input />
        </Form.Item>

        <Form.Item label="Skin Type" name="skinType">
          <Input />
        </Form.Item>

        <Form.Item label="In Stock" name="inStock" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditProduct;
