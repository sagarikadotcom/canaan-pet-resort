"use client";

import { useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import PhoneAuth from "../components/PhoneAuth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = (user) => {
    console.log("User:", user);
    alert("Login Successful!");
    router.push("/dashboard");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(to right, #0066ff, #33ccff)",
      }}
    >
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: "center", maxWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold">Welcome to Our App</Typography>
        <Divider sx={{ my: 2 }} />

        {showPhoneAuth ? (
          <PhoneAuth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              onClick={() => setShowPhoneAuth(true)}
            >
              Login with Phone
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
