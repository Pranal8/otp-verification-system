# 🚀 OTP Authentication System (Serverless Backend)

## 📌 Overview
This is a serverless OTP authentication system built using AWS Lambda, API Gateway, MongoDB, Twilio, and JWT. Users authenticate using OTP sent to their mobile number and receive a JWT token after verification. The Angular frontend consumes these APIs.

---

# 🏗️ Architecture

Angular Frontend → API Gateway (AWS) → AWS Lambda Functions → MongoDB Atlas → Twilio SMS Service → JWT Authentication

---

# ⚙️ Tech Stack
- AWS Lambda (Serverless backend)
- API Gateway (REST APIs)
- Node.js
- MongoDB Atlas
- Twilio (SMS OTP service)
- JWT (Authentication)
- Serverless Framework

---

# 📁 Project Structure

backend-lambda/
│
├── handler.js          # Lambda functions (sendOtp, verifyOtp)
├── serverless.yml      # AWS deployment config
├── package.json
└── README.md

---

# 🚀 Features

## 📩 Send OTP
- Generates 6-digit OTP
- Stores OTP in MongoDB
- Sets 2-minute expiry
- Sends OTP via Twilio SMS

## 🔐 Verify OTP
- Validates OTP
- Checks expiry (2 minutes)
- Marks user as verified
- Generates JWT token

## 🧠 Security
- OTP expiration system (2 minutes)
- JWT authentication
- Stateless backend
- Secure SMS verification

---

# 📡 API Endpoints

## 📩 Send OTP
POST /send-otp

Request:
{
  "phone": "+91XXXXXXXXXX"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 120
}

---

## 🔐 Verify OTP
POST /verify-otp

Request:
{
  "phone": "+91XXXXXXXXXX",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Verified successfully",
  "token": "JWT_TOKEN"
}

---

# 🔄 Authentication Flow

User enters phone number  
→ OTP generated  
→ OTP stored in MongoDB (2 min expiry)  
→ OTP sent via Twilio SMS  
→ User enters OTP  
→ OTP verified  
→ JWT generated  
→ User authenticated

---

# ⚙️ Deployment Steps

1. Install dependencies:
npm install

2. Configure AWS:
aws configure

3. Deploy:
serverless deploy

---

# 🌍 Environment Variables

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

TWILIO_SID=your_sid
TWILIO_AUTH=your_auth_token
TWILIO_PHONE=your_phone_number

---

# 🧠 Key Highlights
✔ Serverless architecture  
✔ OTP authentication system  
✔ JWT-based login  
✔ Twilio SMS integration  
✔ MongoDB cloud database  

---

# 🚀 Future Improvements
- Refresh token system  
- OTP rate limiting  
- Redis OTP storage  
- Login history tracking  
- Frontend hosting on AWS S3 + CloudFront  

---

# 👨‍💻 Author
Full Stack Project using Angular + AWS Lambda + MongoDB + Twilio + JWT

---

# ⭐ Summary
This project demonstrates a real-world serverless authentication system with OTP verification and JWT-based login designed for scalability and production use.