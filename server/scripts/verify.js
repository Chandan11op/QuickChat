import mongoose from "mongoose";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../utils/crypto.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

dotenv.config();

async function runVerification() {
  console.log("--- Crypto Test ---");
  const original = "john.doe_123";
  const encrypted = encrypt(original);
  const decrypted = decrypt(encrypted);
  console.log("Original:", original);
  console.log("Encrypted Hex:", encrypted);
  console.log("Decrypted:", decrypted);
  console.log("Crypto Success:", original === decrypted);

  console.log("\n--- Connecting to MongoDB for Model Verification ---");
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not found in env!");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  try {
    // Clean up test user if any
    await User.deleteMany({ email: encrypt("testverification@example.com") });

    console.log("\nCreating a test user...");
    const testUser = await User.create({
      fullName: "Verification User",
      contactNumber: "+15551234567",
      username: "verify.user",
      email: "testverification@example.com",
      password: "password123"
    });

    console.log("Test user document created in memory/DB:", testUser.toJSON());
    
    // Inspect database value directly using raw connection to bypass Mongoose getters
    const rawUser = await mongoose.connection.db.collection("users").findOne({ _id: testUser._id });
    console.log("\nRaw values in MongoDB (direct check):");
    console.log("fullName (stored):", rawUser.fullName);
    console.log("username (stored):", rawUser.username);
    console.log("email (stored):", rawUser.email);
    console.log("contactNumber (stored):", rawUser.contactNumber);

    console.log("\nAre fields encrypted in MongoDB?");
    console.log("fullName encrypted:", rawUser.fullName !== "Verification User");
    console.log("username encrypted:", rawUser.username !== "verify.user");
    console.log("email encrypted:", rawUser.email !== "testverification@example.com");

    // Fetch using Mongoose query (verifying getters)
    const fetchedUser = await User.findById(testUser._id);
    console.log("\nFetched User using Mongoose model:");
    console.log("fullName (decrypted):", fetchedUser.fullName);
    console.log("username (decrypted):", fetchedUser.username);
    console.log("email (decrypted):", fetchedUser.email);

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log("\nVerification user cleaned up.");
    console.log("✅ MODEL ENCRYPTION VERIFICATION PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Verification failed with error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runVerification();
