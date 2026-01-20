import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.error("\n❌ [DATABASE ERROR] Connection failed: IP address not whitelisted.");
      console.error("👉 ACTION REQUIRED: Add your current IP to MongoDB Atlas via Network Access settings.");
      console.error(`Error Details: ${error.message}\n`);
    } else {
      console.error(`❌ MongoDB Error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;
