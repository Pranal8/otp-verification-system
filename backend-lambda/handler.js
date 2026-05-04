const { MongoClient } = require("mongodb");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const client = new MongoClient(process.env.MONGO_URI);

const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (event) => {
  const { phone } = JSON.parse(event.body);

  const otp = generateOTP();

  await client.connect();
  const db = client.db("otp-auth");

  await db.collection("users").updateOne(
    { phone },
    {
      $set: {
        phone,
        otp,
        otpExpiry: Date.now() + 2 * 60 * 1000
      }
    },
    { upsert: true }
  );

  await twilioClient.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "OTP sent",
      expiresIn: 120
    })
  };
};
exports.verifyOtp = async (event) => {
  const { phone, otp } = JSON.parse(event.body);

  await client.connect();
  const db = client.db("otp-auth");

  const user = await db.collection("users").findOne({ phone });

  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "User not found" })
    };
  }

  if (user.otp !== otp) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid OTP" })
    };
  }

  if (Date.now() > user.otpExpiry) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "OTP expired" })
    };
  }

  const token = jwt.sign(
    { phone },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Verified successfully",
      token
    })
  };
};