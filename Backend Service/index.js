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
  cron.schedule('* * * * * *', () => { // every second
    // sendWelcomeEmail();
    sendPendingOrderEmail();
    sendDeliveredOrderEmail();
  });
};

const promotionServices = () => {
  cron.schedule('30 5 * * 5', () => {
    sendPromotionEmail();
  });
};

services(); 
promotionServices();
// Connect to DB
dbConnection();

// Middleware
app.use(express.json()); // Parse JSON bodies


app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
});
