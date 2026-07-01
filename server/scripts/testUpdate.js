import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

async function testUpdate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  try {
    // Find the first user in the database
    const user = await User.findOne({});
    if (!user) {
      console.log("No user found in the DB. Please register a user first.");
      process.exit(0);
    }

    console.log("Found user:", user._id, user.username, user.email);

    // Replicate the controller logic
    const username = user.username; // "chandan11op"
    const bio = "Test Bio";
    const fullName = "Chandan";
    const contactNumber = "8879753917";
    const dob = "2006-09-11";

    console.log("Attempting to update user document...");
    user.username = username;
    user.bio = bio;
    user.fullName = fullName;
    user.contactNumber = contactNumber;
    user.dob = dob;

    await user.save();
    console.log("✅ Update Succeeded! New user details:", user.toJSON());
  } catch (err) {
    console.error("❌ Update Failed with error:");
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testUpdate();
