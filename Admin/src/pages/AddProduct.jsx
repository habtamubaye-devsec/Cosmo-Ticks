import React, { useEffect, useMemo, useState } from "react";
import { Form, Input, InputNumber, Button, message, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createProducts } from "../api-service/product-service";
import { getAllCategories } from "../api-service/category-service";

const { TextArea } = Input;

const AddProduct = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form] = Form.useForm();

  const handleUploadChange = ({ fileList }) => setFileList(fileList);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        const list = Array.isArray(data?.categories) ? data.categories : [];
        setCategories(list);
      } catch {
        message.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c?._id) === String(selectedCategoryId)),
    [categories, selectedCategoryId]
  );

  const subCategories = useMemo(
    () => (Array.isArray(selectedCategory?.subCategory) ? selectedCategory.subCategory : []),
    [selectedCategory]
  );

  const onFinish = async (values) => {
    if (!fileList.length) return message.error("Upload at least 1 image");
    if (!values.categoryId) return message.error("Select a category");
    if (!values.subCategory) return message.error("Select a subcategory");

    const selected = categories.find((c) => String(c?._id) === String(values.categoryId));
    const categoryName = selected?.name;
    if (!categoryName) return message.error("Invalid category");

    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) formData.append("media", file.originFileObj);
    });

    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("whatInbox", JSON.stringify(values.whatInbox || []));
    formData.append("oridinaryPrice", String(values.oridinaryPrice ?? 0));
    formData.append("discountedPrice", String(values.discountedPrice ?? 0));
    formData.append("quantity", String(values.quantity ?? 0));
    formData.append("category", JSON.stringify([categoryName]));
    formData.append("subCategory", values.subCategory);

    setLoading(true);
    try {
      await createProducts(formData);
      message.success("Product added successfully!");
      form.resetFields();
      setFileList([]);
      setSelectedCategoryId(null);
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-6">Add Product</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="What's in the box"
          name="whatInbox"
          rules={[{ required: true, message: "Add at least one item" }]}
        >
          <Select mode="tags" placeholder="Type an item and press enter" />
        </Form.Item>

        <Form.Item label="Images (first = thumbnail)" required>
          <Upload
            beforeUpload={() => false} // prevent auto upload
            fileList={fileList}
            onChange={handleUploadChange}
            listType="picture"
            multiple
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Ordinary Price" name="oridinaryPrice">
          <InputNumber min={0} prefix="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Discounted Price" name="discountedPrice">
          <InputNumber min={0} prefix="$" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}>
          <Select
            placeholder="Select category"
            options={categories.map((c) => ({ label: c?.name, value: c?._id }))}
            onChange={(value) => {
              setSelectedCategoryId(value);
              form.setFieldValue("subCategory", undefined);
            }}
          />
        </Form.Item>

        <Form.Item label="Subcategory" name="subCategory" rules={[{ required: true }]}>
          <Select
            placeholder={selectedCategoryId ? "Select subcategory" : "Select category first"}
            disabled={!selectedCategoryId}
            options={subCategories.map((s) => ({ label: s?.name, value: s?.name }))}
          />
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
