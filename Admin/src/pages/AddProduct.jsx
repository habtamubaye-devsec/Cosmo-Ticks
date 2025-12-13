import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Checkbox, message, Upload, Select, Switch } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const AddProduct = () => {
    const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  const onFinish = async (values) => {
  if (!fileList.length) return message.error("Upload an image");

  const formData = new FormData();
  fileList.forEach(file => formData.append("media", file.originFileObj)); // 'media' matches backend field
  for (let key in values) {
    formData.append(key, values[key]);
  }

  setLoading(true);
  try {
    const res = await fetch("http://localhost:8000/api/v1/products/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // if using JWT
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Upload failed");

    message.success("Product added successfully!");
    setFileList([]);
  } catch (err) {
    console.error(err);
    message.error(err.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">Add Product</h1>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="What Inbox?" name="whatInbox" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Image" required>
          <Upload
            beforeUpload={() => false} // prevent auto upload
            fileList={fileList}
            onChange={handleUploadChange}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
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

        <Form.Item label="Wholesale Minimum Quantity" name="WholeSaleMinimumQuantity">
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
          <Switch defaultChecked />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Product
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddProduct;
