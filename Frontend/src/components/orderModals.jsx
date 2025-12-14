import { useState } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import { createSingleOrderService } from "../api-service/order-service";
import { removeCartItemService } from "../api-service/cart-service";

function OrderModal({ visible, onClose, product, quantity, total, refreshCart, productId }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await createSingleOrderService({
        cartProduct: [product._id],
        total,
        quantity,
        address: `${values.city}, ${values.street}, ${values.homeNo}`,
        phone: values.phone || "",
      });

      if (productId) {
        try { await removeCartItemService(productId); } catch (e) { }
        if (refreshCart) refreshCart();
      }

      message.success("Order placed successfully!");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="font-serif text-xl">Checkout</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <div className="py-4">
        {/* Product Preview */}
        <div className="flex gap-4 mb-6 bg-[#f7f5f0] p-4 rounded-xl">
          <img
            src={product.img?.[0] || product.img}
            alt=""
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{product.title}</h3>
            <p className="text-sm text-gray-500">Qty: {quantity}</p>
          </div>
          <p className="ml-auto font-medium">${total?.toFixed(2)}</p>
        </div>

        {/* Shipping Form */}
        <Form form={form} layout="vertical" size="large">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="city"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="City" />
            </Form.Item>
            <Form.Item
              name="street"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Street" />
            </Form.Item>
          </div>

          <Form.Item
            name="homeNo"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Apartment / Building No" />
          </Form.Item>

          <Form.Item name="phone">
            <Input placeholder="Phone (optional)" />
          </Form.Item>

          <div className="flex gap-4 pt-4">
            <Button onClick={onClose} className="flex-1 h-12 rounded-full">
              Cancel
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleCreateOrder}
              className="flex-1 h-12 rounded-full"
            >
              Place Order - ${total?.toFixed(2)}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default OrderModal;
