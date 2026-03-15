import mongoose from "mongoose"

const connectDB = async () => {

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error.message);
    console.log("\nTIP: Make sure your MongoDB Atlas IP Whitelist includes '0.0.0.0/0' for Render.");
    process.exit(1);
  }

}

export default connectDB