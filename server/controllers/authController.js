import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { encrypt, decrypt } from "../utils/crypto.js"
import { sendSMS } from "../utils/sms.js"

// In-memory store for OTPs: contactNumber -> { otp, expires }
const otpStore = new Map();

export async function generateOtp(req, res) {
  try {
    const { contactNumber, email, username } = req.body;
    if (!contactNumber) {
      return res.status(400).json({ message: "Contact number is required to generate OTP" });
    }

    // Basic format validation for username if provided
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_.]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and full-stops." });
      }

      // Check if username is already taken
      const usernameExists = await User.findOne({ username: encrypt(username) });
      if (usernameExists) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Check if email is already taken
    if (email) {
      const emailExists = await User.findOne({ email: encrypt(email) });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already registered" });
      }
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory (expires in 5 minutes)
    otpStore.set(contactNumber, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send SMS via Twilio REST API
    const smsResult = await sendSMS(
      contactNumber,
      `Your QuickChat verification code is: ${otp}. It is valid for 5 minutes.`
    );

    res.json({
      success: true,
      message: smsResult.success ? "OTP sent successfully via SMS API" : "OTP generated (simulated SMS)",
      otp,
      mode: smsResult.mode
    });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function register(req, res) {
  try {
    console.log("Registration attempt:", req.body);
    const { username, email, password, fullName, contactNumber, otp, dob } = req.body;

    if (!username || !email || !password || !fullName || !contactNumber || !otp || !dob) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, underscores, and full-stops." });
    }

    // Validate OTP
    const storedOtpData = otpStore.get(contactNumber);
    if (!storedOtpData) {
      return res.status(400).json({ message: "Please generate an OTP first" });
    }
    if (Date.now() > storedOtpData.expires) {
      otpStore.delete(contactNumber);
      return res.status(400).json({ message: "OTP has expired. Please generate a new one." });
    }
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: encrypt(email) });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username: encrypt(username) });
    if (usernameExists) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // OTP verified, remove from store
    otpStore.delete(contactNumber);

    // Create user. Fields will be automatically encrypted by mongoose getters/setters
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      contactNumber,
      dob
    });

    console.log("User created successfully:", user._id);
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json(err);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Email is encrypted in the DB, query using encrypted value
    const user = await User.findOne({ email: encrypt(email) });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare plain-text password with hashed password
    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json(err);
  }
}

export async function oauthSuccess(req, res) {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = JSON.stringify({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
    });

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth-success?token=${token}&user=${encodeURIComponent(userData)}`);
  } catch (err) {
    res.status(500).json(err);
  }
}