import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import User from "../models/user.model.js";
import { fileURLToPath } from "url";

const sendWelcomeEmail = async () => {
  const users = await User.find({ welcomeEmailSent: { $ne: true } });
  if (!users.length) return;

  const templatePath = fileURLToPath(new URL("../templates/welcome.ejs", import.meta.url));
  const storeUrl = process.env.STORE_URL || "";

  for (const user of users) {
    try {
      const html = await ejs.renderFile(templatePath, {
        name: user.name,
        storeUrl,
      });

      const messageOption = {
        from: process.env.NODEMAILER_EMAIL,
        to: user.email,
        subject: "Welcome to Cosmo-ticks",
        html,
      };

      await sendMail(messageOption);
      await User.findByIdAndUpdate(user._id, {
        $set: { welcomeEmailSent: true, welcomeEmailSentAt: new Date() },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

export default sendWelcomeEmail;