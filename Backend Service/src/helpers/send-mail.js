import nodemailer from "nodemailer";

let cachedTransporter = null;

const isProduction = () => String(process.env.NODE_ENV || "").toLowerCase() === "production";

const envBool = (value) => {
  if (value == null) return undefined;
  const s = String(value).toLowerCase().trim();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return undefined;
};

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = envBool(process.env.SMTP_SECURE);

  // Preferred: explicit SMTP config (works for any provider)

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: secure ?? port === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Gmail: App Password auth (real email service)
  // NOTE: Gmail requires either OAuth2 or an App Password (recommended for server apps).
  const gmailUser = process.env.NODEMAILER_EMAIL || process.env.GMAIL_USER;
  const gmailPass = process.env.NODEMAILER_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
    return cachedTransporter;
  }

  if (isProduction()) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS (preferred) or NODEMAILER_EMAIL/NODEMAILER_PASSWORD for Gmail."
    );
  }

  // Dev fallback: Ethereal (test inbox)
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
};

const sendMail = async (messageOption) => {
  try {
    if (!messageOption?.to) throw new Error("Missing email recipient (to)");
    if (!messageOption?.html) throw new Error("Missing email HTML content");

    const transporter = await getTransporter();

    const info = await transporter.sendMail(messageOption);

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log("Preview URL:", preview);
    return info;
  } catch (error) {
    console.error("❌ Error in sending email:", error.message);
    throw error;
  }
};

export default sendMail;
