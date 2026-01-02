import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import Order from "../models/order.model.js";
import { fileURLToPath } from "url";

const sendDeliveredOrderEmail = async () => {
  const orders = await Order.find({ status: 3, deliveredEmailSent: { $ne: true } });
  if (!orders.length) return;

  const templatePath = fileURLToPath(new URL("../templates/deliveveredorder.ejs", import.meta.url));
  const storeUrl = process.env.STORE_URL || "";

  for (const order of orders) {
    try {
      const html = await ejs.renderFile(templatePath, {
        name: order.name,
        products: order.products,
        storeUrl,
      });

      const messageOption = {
        from: process.env.NODEMAILER_EMAIL,
        to: order.email,
        subject: "Your order has been delivered",
        html,
      };

      await sendMail(messageOption);
      await Order.findByIdAndUpdate(order._id, {
        $set: { deliveredEmailSent: true, deliveredEmailSentAt: new Date() },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

export default sendDeliveredOrderEmail;
