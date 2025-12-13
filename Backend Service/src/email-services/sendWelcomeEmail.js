import ejs from "ejs";
import sendMail from "../helpers/send-mail.js";
import User from "../models/user.model.js";

const sendWelcomeEmail = async () => {
  const users = await User.find({ status: 0 });
  if (users.length > 0) {
    for (let user of users) {
      ejs.renderFile(
        "src/templates/welcome.ejs",
        { name: user.name },
        async (err, data) => {
          let messageOption = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.email,
            subject: "Welcome to Beauty Bliss",
            html: data,
          };
          try {
            await sendMail(messageOption);
            await User.findByIdAndUpdate(user._id, { $set: { status: 1 } });
          } catch (error) {
            console.log(error);
          }
        }
      );
    }
  }
};

export default sendWelcomeEmail;