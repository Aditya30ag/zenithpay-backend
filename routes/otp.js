require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const jwt = require('jsonwebtoken'); // Import JWT
const router = express.Router();

const SECRET_KEY = "your_secret_key";


// Load environment variables
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID, PORT } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SERVICE_SID) {
    console.error("Twilio credentials are missing. Check your .env file!");
    process.exit(1);
}

// Initialize Twilio Client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// 📌 API to send OTP via Twilio Verify
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  // Validate phone number format (should start with '+')
  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format. Use E.164 format (e.g., +1234567890)" });
  }

  try {
      const verification = await client.verify.v2.services(TWILIO_SERVICE_SID)
          .verifications
          .create({ to: phone, channel: 'sms' });

      return res.json({ success: true, message: "OTP sent successfully!", status: verification.status });
  } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
});

// 📌 API to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone number and OTP are required!" });
    }

    try {
        const verificationCheck = await client.verify.v2.services(TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: phone, code: otp });

        if (verificationCheck.status === "approved") {
            // Generate a new OTP Token (JWT)
            const otpToken = jwt.sign({ phone }, SECRET_KEY, { expiresIn: '15m' });

            return res.json({ 
                success: true, 
                message: "OTP verified successfully!", 
                otpToken // Sending the generated token
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired OTP"
            });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to verify OTP", 
            error: error.message
        });
    }
});

module.exports=router

