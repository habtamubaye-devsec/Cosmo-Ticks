import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log("Database connected successfully")
  } catch (error) {
    console.log(error);
    setTimeout(dbConnection, 5000);
  }
};


export default dbConnection;