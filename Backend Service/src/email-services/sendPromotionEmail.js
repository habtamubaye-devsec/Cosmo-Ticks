import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

const sendPromotionEmail = async () => {
  const users = await User.find();
  const products = await Product.aggregate([{ $sample: { size: 5 } }]);
  if (users.length > 0) {
    for (let user of users) {
      ejs.renderFile(
        "src/templates/promotion.ejs",
        { products },
        async (err, data) => {
          let messageOption = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.email,
            subject: "YOur Weekliy Products",
            html: data,
          };
          try {
            await sendMail(messageOption); 
          } catch (error) {
            console.log(error);
          }
        }
      );
    }
  }
};

export default sendPromotionEmail;
