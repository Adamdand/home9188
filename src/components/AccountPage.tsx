import React, { useEffect, useState } from "react";
import { Box, Button, Container, Typography, Avatar, TextField, Alert } from "@mui/material";
import { Home, Person, Lock, Delete } from "@mui/icons-material";
import { updatePassword, deleteUser, type User } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import type { Page } from "./AppRouter";
import { db } from "../config/firebase";

interface AccountPageProps {
  user: User;
  onNavigate: (page: Page) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onNavigate }) => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
      const fetchUsername = async () => {
        if (user?.uid) {
          console.log("Fetching Firestore user for uid:", user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        }
      };
  
      fetchUsername();
    }, [user]);;;


  const handlePasswordChange = async () => {
    if (!newPassword) return;
    try {
      await updatePassword(user, newPassword);
      setMessage("Password updated successfully!");
      setError(null);
      setNewPassword("");
    } catch (err: any) {
      setError(err.message);
      setMessage(null);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)",
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 4,
      }}
    >
      <Container
        maxWidth="sm"
        disableGutters
        sx={{
          bgcolor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "white",
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 48,
              height: 48,
              fontSize: 24,
            }}
          >
            <Person />
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
              Account Settings
            </Typography>
            <Typography sx={{ fontSize: 14, opacity: 0.8 }}>
              Manage your profile and security
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Info */}
          <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Username</Typography>
            <Typography sx={{ color: "text.secondary" }}>
              {username || "No username"}
            </Typography>
          </Box>

          <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Email</Typography>
            <Typography sx={{ color: "text.secondary" }}>{user.email}</Typography>
          </Box>

          {/* Password change */}
          <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Change Password</Typography>
            <TextField
              fullWidth
              type="password"
              size="small"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<Lock />}
              fullWidth
              onClick={handlePasswordChange}
              sx={{ borderRadius: 2 }}
            >
              Update Password
            </Button>
          </Box>

          {/* Danger Zone */}
          <Box
            sx={{
              bgcolor: "#fef2f2",
              p: 2,
              borderRadius: 2,
              border: "1px solid #fecaca",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#b91c1c", fontWeight: 700, mb: 1 }}>
              Danger Zone
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteAccount}
              sx={{
                borderRadius: 2,
                borderColor: "#ef4444",
                "&:hover": { backgroundColor: "#fee2e2" },
              }}
            >
              Delete Account
            </Button>
          </Box>

          {/* Alerts */}
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Back button */}
          <Button
            variant="text"
            startIcon={<Home />}
            onClick={() => onNavigate("home")}
            sx={{ alignSelf: "center", textTransform: "none", fontWeight: 600 }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AccountPage;
