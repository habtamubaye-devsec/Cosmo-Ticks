import { useState } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import { createSingleOrderService } from "../api-service/order-service"; // Your API service
import { removeCartItemService } from "../api-service/cart-service";

function OrderModal({ visible, onClose, product, quantity, total, refreshCart, productId }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();


  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createSingleOrderService({
        cartProduct: [product._id], // single product
        total,
        quantity,
        address: `${values.city}, ${values.street}, ${values.homeNo}`,
        phone: values.phone || "",
      });
      if(productId) {
      await removeCartItemService(productId);
      message.success("Order created successfully!");
      form.resetFields();
      onClose();
      refreshCart();
      }
      message.success("Order created successfully!");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Order: ${product.title}`}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="create" type="primary" loading={loading} onClick={handleCreateOrder}>
          Create Order
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="City"
          name="city"
          rules={[{ required: true, message: "Please enter your city" }]}
        >
          <Input placeholder="City" />
        </Form.Item>
        <Form.Item
          label="Street"
          name="street"
          rules={[{ required: true, message: "Please enter your street" }]}
        >
          <Input placeholder="Street" />
        </Form.Item>
        <Form.Item
          label="Home Number"
          name="homeNo"
          rules={[{ required: true, message: "Please enter your home number" }]}
        >
          <Input placeholder="Home No" />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input placeholder="Phone (optional)" />
        </Form.Item>
        <p>Total: ${total}</p>
      </Form>
    </Modal>
  );
}

export default OrderModal;
