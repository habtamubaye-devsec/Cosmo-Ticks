import dotenv from "dotenv";
import express from "express";
import cron from "node-cron";
import dbConnection from "./src/config/db-connection.js";
import sendWelcomeEmail from './src/email-services/sendWelcomeEmail.js'
import sendPendingOrderEmail from "./src/email-services/sendPendingOrderEmail.js";
import sendDeliveredOrderEmail from "./src/email-services/sendDeliveredOrderEmail.js";
import sendPromotionEmail from "./src/email-services/sendPromotionEmail.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

//SCHEDULE SERVICE
const services = () => {
  // Every 2 minutes (safe); each sender is idempotent via *EmailSent flags.
  cron.schedule('*/2 * * * *', () => {
    sendPendingOrderEmail();
    sendDeliveredOrderEmail();
  });
};

const promotionServices = () => {
  cron.schedule('30 5 * * 5', () => {
    sendPromotionEmail();
  });
};

const welcomeServices = () => {
  // Every 5 minutes (safe)
  cron.schedule('*/5 * * * *', () => {
    sendWelcomeEmail();
  });
};

services(); 
promotionServices();
welcomeServices();
// Connect to DB
dbConnection();

// Middleware
app.use(express.json()); // Parse JSON bodies


app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
});
