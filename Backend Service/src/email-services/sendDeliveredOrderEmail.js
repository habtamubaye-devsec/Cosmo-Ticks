import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import Order from "../models/order.model.js";

const sendDeliveredOrderEmail = async () => {
  const orders = await Order.find({ status: 3 });
  if (orders.length > 0) {
    for (let order of orders) {
      ejs.renderFile(
        "src/templates/deliveveredorder.ejs",
        { name: order.name, products: order.products },
        async (err, data) => {
          let messageOption = {
            from: process.env.NODEMAILER_EMAIL,
            to: order.email,
            subject: "Your order has been delivered",
            html: data,
          };
          try {
            await sendMail(messageOption);
            await Order.findByIdAndUpdate(order._id, { $set: { status: 2 } });
          } catch (error) {
            console.log(error);
          }
        }
      );
    }
  }
};

export default sendDeliveredOrderEmail;
