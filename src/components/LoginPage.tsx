import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Box, Container, Typography, TextField, Button, Stack, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Lock, Business } from '@mui/icons-material';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!password) { setError('Please enter a password'); return; }
    setIsLoading(true);
    setError('');
    try {
      const snap = await getDoc(doc(db, 'password', 'password'));
      if (!snap.exists()) { setError('Password not configured'); return; }
      const data = snap.data() as { password?: string; value?: string };
      const storedPassword = (data.password ?? data.value ?? '').toString();
      if (password === storedPassword) {
        // Important: release focus so Safari can reset zoom
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onLogin();
        // Optional: ensure layout resets
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        px: { xs: 2, sm: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container
        maxWidth="sm"
        disableGutters
        sx={{
          position: 'relative',
          zIndex: 1,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          p: { xs: 3, sm: 5 },
          overflow: 'hidden',
        }}
      >
        {/* Modern building visualization */}
        <Box
          sx={{
            position: 'relative',
            mx: 'auto',
            mb: { xs: 3, sm: 4 },
            width: { xs: '100%', sm: 420 },
            height: { xs: 120, sm: 140 },
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            gap: { xs: 0.5, sm: 1 },
            px: 2,
          }}
        >
          {/* Building silhouette with modern gradient bars */}
          {[65, 85, 100, 75, 90, 55, 80].map((height, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: 28, sm: 38 },
                height: `${height}%`,
                background: `linear-gradient(180deg, 
                  ${index % 2 === 0 ? '#4f46e5' : '#7c3aed'} 0%, 
                  ${index % 2 === 0 ? '#6366f1' : '#8b5cf6'} 100%)`,
                borderRadius: '4px 4px 0 0',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  right: '20%',
                  bottom: '30%',
                  background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 10px)',
                },
              }}
            />
          ))}
          
          {/* Floating accent elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: 20,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #f59e0b, #f97316)',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-8px)' },
              }
            }}
          />
        </Box>

        {/* Header with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Business sx={{ fontSize: 32, color: '#4f46e5', mr: 1 }} />
          <Typography
            component="h1"
            align="center"
            sx={{
              fontSize: 'clamp(24px, 5vw, 42px)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.025em',
            }}
          >
            Building 9188
          </Typography>
        </Box>

        <Typography
          align="center"
          sx={{
            fontSize: { xs: 14, sm: 16 },
            color: '#6b7280',
            mb: { xs: 3, sm: 4 },
            fontWeight: 500,
          }}
        >
          Enter your credentials to access the building
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: '#374151',
              fontSize: { xs: 14, sm: 16 },
              mb: 1.5,
            }}
          >
            Password
          </Typography>

          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#9ca3af', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? 
                      <VisibilityOff sx={{ fontSize: 20, color: '#9ca3af' }} /> : 
                      <Visibility sx={{ fontSize: 20, color: '#9ca3af' }} />
                    }
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                fontSize: { xs: 14, sm: 16 },
                '&:hover': {
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4f46e5',
                    borderWidth: '2px',
                  },
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        </Box>

        {error && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            <Typography
              sx={{
                color: '#dc2626',
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={isLoading}
          fullWidth
          sx={{
            py: { xs: 1.5, sm: 1.8 },
            borderRadius: 2,
            textTransform: 'none',
            fontSize: { xs: 15, sm: 16 },
            fontWeight: 600,
            background: isLoading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: isLoading 
              ? 'none'
              : '0 4px 12px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: isLoading 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
              boxShadow: isLoading 
                ? 'none'
                : '0 6px 16px rgba(79, 70, 229, 0.5)',
              transform: isLoading ? 'none' : 'translateY(-1px)',
            },
            '&:disabled': {
              color: '#ffffff',
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  }
                }}
              />
              Authenticating...
            </Box>
          ) : (
            'Access Building'
          )}
        </Button>

        {/* Subtle footer */}
        <Typography
          align="center"
          sx={{
            mt: 3,
            fontSize: 12,
            color: '#9ca3af',
            fontWeight: 400,
          }}
        >
          Building communication system
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;