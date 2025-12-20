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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getProductById, updateProduct } from "../api-service/product-service";
import { getAllCategories } from "../api-service/category-service";

const { TextArea } = Input;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [form] = Form.useForm();

  // Fetch product data and prefill form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id); // returns { message, product }
        const product = res.product; // grab the actual product object

        const catRes = await getAllCategories();
        const list = Array.isArray(catRes?.categories) ? catRes.categories : [];
        setCategories(list);

        const categoryName = product?.category?.[0];
        const matchedCategory = list.find((c) => String(c?.name) === String(categoryName));
        const categoryId = matchedCategory?._id;
        setSelectedCategoryId(categoryId || null);

        const whatInbox = Array.isArray(product?.whatInbox)
          ? product.whatInbox
          : typeof product?.whatInbox === "string" && product.whatInbox
            ? [product.whatInbox]
            : [];

        // Prefill form fields
        form.setFieldsValue({
          title: product?.title,
          description: product?.description,
          whatInbox,
          oridinaryPrice: product?.oridinaryPrice,
          discountedPrice: product?.discountedPrice,
          quantity: typeof product?.quantity === "number" ? product.quantity : 0,
          categoryId: categoryId,
          subCategory: product?.subCategory,
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

    const selected = categories.find((c) => String(c?._id) === String(values.categoryId));
    const categoryName = selected?.name;
    if (!categoryName) return message.error("Select a category");

    // Add new or existing images
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("media", file.originFileObj); // new upload
      } else if (file.url) {
        formData.append("existingImages", file.url); // existing images
      }
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
      await updateProduct(id, formData);
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
          label="What's in the box"
          name="whatInbox"
          rules={[{ required: true }]}
        >
          <Select mode="tags" placeholder="Type an item and press enter" />
        </Form.Item>

        <Form.Item label="Images (first = thumbnail)" required>
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
            options={
              (categories.find((c) => String(c?._id) === String(selectedCategoryId))?.subCategory || []).map((s) => ({
                label: s?.name,
                value: s?.name,
              }))
            }
          />
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
