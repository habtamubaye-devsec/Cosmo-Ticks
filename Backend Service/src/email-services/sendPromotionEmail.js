import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { fileURLToPath } from "url";

const sendPromotionEmail = async () => {
  const users = await User.find();
  const products = await Product.aggregate([{ $sample: { size: 5 } }]);
  if (!users.length) return;

  const templatePath = fileURLToPath(new URL("../templates/promotion.ejs", import.meta.url));
  const storeUrl = process.env.STORE_URL || "";

  for (const user of users) {
    try {
      const html = await ejs.renderFile(templatePath, { products, storeUrl });
      const messageOption = {
        from: process.env.NODEMAILER_EMAIL,
        to: user.email,
        subject: "Cosmo-ticks: Weekly picks",
        html,
      };

      await sendMail(messageOption);
    } catch (error) {
      console.log(error);
    }
  }
};

export default sendPromotionEmail;
