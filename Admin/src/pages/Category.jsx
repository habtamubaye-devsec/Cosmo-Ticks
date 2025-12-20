import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Tooltip, Modal, Input, Upload, Spin } from "antd";
import { Edit2, Trash2, Plus, ChevronDown, Upload as UploadIcon, Loader } from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../api-service/category-service";

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false); // <- modal spinner
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [subCategories, setSubCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      message.success("Category deleted successfully");
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const toggleExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryImage(null);
      setSubCategories(category.subCategory.map(sub => ({
        name: sub.name,
        image: sub.image,
        isNewImage: false
      })));
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryImage(null);
      setSubCategories([]);
    }
    setModalVisible(true);
  };

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, { name: "", image: null, isNewImage: true }]);
  };

  const handleRemoveSubCategory = (index) => {
    setSubCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubCategoryChange = (index, field, value) => {
    const updated = [...subCategories];
    updated[index][field] = value;
    setSubCategories(updated);
  };

  const handleSubmit = async () => {
    if (!categoryName) return message.error("Category name is required");
    if (!categoryImage && !editingCategory) return message.error("Category image is required");

    const cleanedSubCategories = (subCategories || [])
      .map((s) => ({
        name: (s.name || "").trim(),
        image: s.image,
        isNewImage: !!s.isNewImage,
      }))
      .filter((s) => s.name.length > 0);

    for (const sub of cleanedSubCategories) {
      // New subcategory must include an uploaded image
      if (!editingCategory) {
        if (!sub.image) return message.error(`Image required for subcategory: ${sub.name}`);
      } else {
        if (sub.isNewImage && !sub.image) return message.error(`Upload an image for subcategory: ${sub.name}`);
        if (!sub.isNewImage && !sub.image) return message.error(`Missing image for subcategory: ${sub.name}`);
      }
    }

    const formData = new FormData();
    formData.append("name", categoryName);
    if (categoryImage) formData.append("categoryImage", categoryImage);

    // Keep JSON payload serializable. For new images, send image: null and rely on appended files.
    const subCatData = cleanedSubCategories.map((sub) => {
      if (sub.isNewImage && sub.image) {
        formData.append("subImages", sub.image);
        return { name: sub.name, image: null, isNewImage: true };
      }
      return { name: sub.name, image: sub.image, isNewImage: false };
    });
    formData.append("subCategory", JSON.stringify(subCatData));

    try {
      setModalLoading(true); // show spinner
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
        message.success("Category updated successfully");
      } else {
        await createCategory(formData);
        message.success("Category created successfully");
      }
      fetchCategories(); // refresh list
    } catch (err) {
      message.error(err.response?.data?.message || "Operation failed");
    } finally {
      setModalLoading(false); // hide spinner
    }
  };

  const columns = [
    {
      title: "Category",
      key: "category",
      width: 300,
      render: (_, record) => {
        const subCats = record.subCategory || [];
        const isExpanded = expandedRows[record._id];
        const visibleSub = isExpanded ? subCats : subCats.slice(0, 1);
        const remaining = subCats.length - 1;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-medium text-gray-900 line-clamp-1">{record.name}</p>
            </div>
            {subCats.length > 0 && (
              <div className="ml-24 mt-2 flex flex-col gap-1">
                {visibleSub.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-gray-600">{sub.name}</span>
                  </div>
                ))}
                {subCats.length > 1 && (
                  <button
                    onClick={() => toggleExpand(record._id)}
                    className="flex items-center gap-1 text-indigo-600 text-sm font-medium mt-1"
                  >
                    {isExpanded ? "Show Less" : `+${remaining} more`}
                    <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Edit Category">
            <Button
              className="flex items-center justify-center border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-600 bg-white shadow-sm"
              shape="circle"
              icon={<Edit2 size={16} />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
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
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage categories and their subcategories</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-200 h-10 px-5 font-medium"
        >
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          className="custom-admin-table"
          rowKey="_id"
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Total ${total} items`,
            position: ["bottomRight"]
          }}
        />
      </div>

      {/* Modal with Spinner */}
      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Spin spinning={modalLoading} indicator={<Loader size={24} className="animate-spin text-indigo-600" />}>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Upload
              beforeUpload={(file) => {
                setCategoryImage(file);
                return false;
              }}
              showUploadList={categoryImage ? [{ name: categoryImage.name }] : []}
            >
              <Button icon={<UploadIcon />}>Upload Category Image</Button>
            </Upload>

            <div>
              <h3 className="font-medium mb-2">Subcategories</h3>
              {subCategories.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Subcategory Name"
                    value={sub.name}
                    onChange={(e) => handleSubCategoryChange(idx, "name", e.target.value)}
                  />

                  <Upload
                    beforeUpload={(file) => {
                      handleSubCategoryChange(idx, "image", file);
                      handleSubCategoryChange(idx, "isNewImage", true);
                      return false;
                    }}
                    showUploadList={
                      sub.isNewImage && sub.image && typeof sub.image !== "string"
                        ? [{ name: sub.image.name }]
                        : []
                    }
                  >
                    <Button icon={<UploadIcon />}>Upload Image</Button>
                  </Upload>

                  <Tooltip title="Remove subcategory">
                    <Button
                      danger
                      shape="circle"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRemoveSubCategory(idx)}
                    />
                  </Tooltip>
                </div>
              ))}
              <Button onClick={handleAddSubCategory} icon={<Plus />}>
                Add Subcategory
              </Button>
            </div>

            <Button
              type="primary"
              className="mt-4 w-full"
              onClick={handleSubmit}
              disabled={modalLoading}
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default CategoryManagerPage;
