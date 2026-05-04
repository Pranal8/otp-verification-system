const User = require("../models/User");
const generateToken = require("../utils/jwt");
const twilio = require("twilio");

// ⛔ in-memory store for resend cooldown
const otpCooldown = new Map();

// Twilio client
const client = twilio(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
  }
);

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;

  try {
    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+91${phone}`;

    // ⛔ resend cooldown (30 sec)
    const lastSent = otpCooldown.get(formattedPhone);
    if (lastSent && Date.now() - lastSent < 30 * 1000) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = generateOTP();

    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      user = new User({ phone: formattedPhone });
    }

    user.otp = otp;

    // ⏱ OTP expiry = 2 minutes
    user.otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

    user.isVerified = false;

    await user.save();

    // store cooldown timestamp
    otpCooldown.set(formattedPhone, Date.now());

    // send SMS via Twilio
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 120,
    });

  } catch (error) {
    console.error("Twilio Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+91${phone}`;

    const user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ⏱ check expiry (2 min rule)
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    // 🔐 JWT TOKEN (via utility)
    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Verified successfully",
      token,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};