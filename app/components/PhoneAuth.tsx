"use client";

import { useState, useEffect } from "react";
import { auth } from "../../utils/firebase"; // Ensure Firebase is configured properly
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Button, TextField, Box, Typography } from "@mui/material";

export default function PhoneAuth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [message, setMessage] = useState("");

  // ✅ Initialize reCAPTCHA only once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // ✅ Make it invisible to prevent UI issues
          callback: (response: any) => {
            console.log("reCAPTCHA Verified!", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA Expired. Resetting...");
            window.recaptchaVerifier = null; // Reset recaptcha if it expires
          },
        }
      );
    }
  }, []);

  // ✅ Handle Phone Number Submission
  const sendOTP = async () => {
    setMessage("");
    if (phoneNumber.trim().length < 10) {
      setMessage("Enter a valid phone number");
      return;
    }

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setMessage("✅ OTP Sent! Check your phone.");
    } catch (error: any) {
      setMessage("❌ Failed to send OTP: " + error.message);
    }
  };

  // ✅ Verify OTP
  const verifyOTP = async () => {
    setMessage("");
    if (!confirmationResult) {
      setMessage("❌ Please request OTP first.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      setMessage("✅ Phone number verified successfully!");
    } catch (error: any) {
      setMessage("❌ Invalid OTP: " + error.message);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h4">Phone Authentication</Typography>

      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="+1234567890"
      />
      
      <Button variant="contained" sx={{ mt: 2 }} onClick={sendOTP}>
        Send OTP
      </Button>

      <TextField
        label="Enter OTP"
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      
      <Button variant="contained" sx={{ mt: 2 }} onClick={verifyOTP}>
        Verify OTP
      </Button>

      {/* Ensure recaptcha is rendered here */}
      <div id="recaptcha-container"></div>

      {message && (
        <Typography sx={{ mt: 2, color: "red" }}>{message}</Typography>
      )}
    </Box>
  );
}
