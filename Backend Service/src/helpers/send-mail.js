import nodemailer from "nodemailer";

const sendMail = async (messageOption) => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
    });

    const info = await transporter.sendMail(messageOption);

    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("❌ Error in sending email:", error.message);
    throw error;
  }
};

export default sendMail;
