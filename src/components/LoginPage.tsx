import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
  Link
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Business,
  Email,
  Google,
  PersonAdd,
  Login as LoginIcon,
  Person,
  AlternateEmail
} from '@mui/icons-material';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // UI feedback for username field
  const [usernameHelper, setUsernameHelper] = useState<string>('');
  const [usernameFieldError, setUsernameFieldError] = useState<boolean>(false);

  // Check for existing authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin(user);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  // Check if username is available
  const checkUsernameAvailable = async (usernameToCheck: string): Promise<boolean> => {
    if (!usernameToCheck.trim()) return false;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', usernameToCheck.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Validate username format
  const validateUsername = (usernameToValidate: string): string | null => {
    const trimmed = usernameToValidate.trim();
    if (!trimmed) return 'Username is required';
    if (trimmed.length < 3) return 'Username must be at least 3 characters';
    if (trimmed.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Username can only contain letters, numbers, and underscores';
    if (/^[0-9]/.test(trimmed)) return 'Username cannot start with a number';
    return null;
  };

  const handleUsernameBlur = async () => {
    if (mode !== 'signup') return;

    const normalized = username.toLowerCase().trim();

    // format validation first
    const formatErr = validateUsername(normalized);
    if (formatErr) {
      setUsernameHelper(formatErr);
      setUsernameFieldError(true);
      return;
    }

    setIsCheckingUsername(true);
    const available = await checkUsernameAvailable(normalized);
    setIsCheckingUsername(false);

    if (available) {
      setUsernameHelper('Username is available');
      setUsernameFieldError(false);
    } else {
      setUsernameHelper('This username is taken');
      setUsernameFieldError(true);
    }
  };

  const handleEmailPasswordAuth = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (mode === 'signup') {
      // if (!displayName.trim()) {
      //   setError('Please enter your name');
      //   return;
      // }

      const normalizedUsername = username.toLowerCase().trim();

      if (!normalizedUsername) {
        setError('Please enter a username');
        return;
      }

      const usernameErrorMsg = validateUsername(normalizedUsername);
      if (usernameErrorMsg) {
        setError(usernameErrorMsg);
        return;
      }

      const isAvailable = await checkUsernameAvailable(normalizedUsername);
      if (!isAvailable) {
        setError('Username is already taken. Please choose a different one.');
        return;
      }
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let userCredential;

      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (userCredential.user) {
          // Update the user's profile with their display name
          // await updateProfile(userCredential.user, {
          //   displayName: displayName.trim()
          // });

          // Store user data in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            // displayName: displayName.trim(),
            username: username.toLowerCase().trim(),
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Refresh the user object to include the updated profile
          await userCredential.user.reload();
        }
      }

      if (userCredential?.user) {
        // Important: release focus so Safari can reset zoom
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onLogin(userCredential.user);
        // Optional: ensure layout resets
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    } catch (err: any) {
      console.error('Auth error:', err);

      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please login instead.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setIsLoading(true);
  //   setError('');
  //   setSuccess('');

  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const userCredential = await signInWithPopup(auth, provider);

  //     if (userCredential.user) {
  //       if (document.activeElement instanceof HTMLElement) {
  //         document.activeElement.blur();
  //       }
  //       onLogin(userCredential.user);
  //       window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  //     }
  //   } catch (err: any) {
  //     console.error('Google auth error:', err);

  //     switch (err.code) {
  //       case 'auth/popup-closed-by-user':
  //         setError('Sign-in was cancelled. Please try again.');
  //         break;
  //       case 'auth/popup-blocked':
  //         setError('Popup was blocked. Please allow popups and try again.');
  //         break;
  //       default:
  //         setError('Google sign-in failed. Please try again.');
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(`Password reset email sent to ${email}! Check your inbox and spam folder. The email may take a few minutes to arrive.`);
      setMode('login');
    } catch (err: any) {
      console.error('Password reset error:', err);

      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address. Please check the email or create a new account.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many reset attempts. Please wait a few minutes before trying again.');
          break;
        case 'auth/missing-email':
          setError('Please enter your email address.');
          break;
        default:
          setError(`Failed to send reset email: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'reset') {
        handlePasswordReset();
      } else {
        handleEmailPasswordAuth();
      }
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getModeSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Create your account to access the building';
      case 'reset': return 'Enter your email to receive a password reset link';
      default: return 'Enter your credentials to access the building';
    }
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
          component="h2"
          align="center"
          sx={{
            fontSize: { xs: 18, sm: 20 },
            fontWeight: 600,
            color: '#374151',
            mb: 1,
          }}
        >
          {getModeTitle()}
        </Typography>

        <Typography
          align="center"
          sx={{
            fontSize: { xs: 14, sm: 16 },
            color: '#6b7280',
            mb: { xs: 3, sm: 4 },
            fontWeight: 500,
          }}
        >
          {getModeSubtitle()}
        </Typography>

        {/* Success/Error Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Google Sign In Button */}
        {/* <Button
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          fullWidth
          startIcon={<Google />}
          sx={{
            py: { xs: 1.5, sm: 1.8 },
            borderRadius: 2,
            textTransform: 'none',
            fontSize: { xs: 15, sm: 16 },
            fontWeight: 600,
            mb: 3,
            border: '1px solid #e5e7eb',
            color: '#374151',
            '&:hover': {
              border: '1px solid #d1d5db',
              backgroundColor: '#f9fafb',
            },
          }}
        >
          Continue with Google
        </Button> */}

        {/* <Divider sx={{ my: 3 }}>
          <Typography sx={{ color: '#9ca3af', fontSize: 14 }}>
            or continue with email
          </Typography>
        </Divider> */}

        {/* Name & Username (only for signup) */}
        {mode === 'signup' && (
          <>
            {/* Name (display name shown in UI) */}
            

            {/* Username (unique handle, stored in Firestore) */}
            <Box sx={{ mb: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: { xs: 14, sm: 16 },
                  mb: 1.5,
                }}
              >
                Username
              </Typography>

              <TextField
                type="text"
                placeholder="Choose a unique username"
                value={username}
                onChange={(e) => {
                  const v = e.target.value.replace(/\s+/g, '');
                  setUsername(v);
                  setUsernameHelper('');
                  setUsernameFieldError(false);
                }}
                onBlur={handleUsernameBlur}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                fullWidth
                error={usernameFieldError}
                helperText={
                  isCheckingUsername ? 'Checking availability...' : (usernameHelper || ' ')
                }
                // InputProps={{
                //   startAdornment: (
                //     <InputAdornment position="start">
                //       <AlternateEmail sx={{ color: '#9ca3af', fontSize: 20 }} />
                //     </InputAdornment>
                //   ),
                // }}
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
          </>
        )}

        {/* Email Input */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: '#374151',
              fontSize: { xs: 14, sm: 16 },
              mb: 1.5,
            }}
          >
            Email
          </Typography>

          <TextField
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#9ca3af', fontSize: 20 }} />
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

        {/* Password Input (hidden in reset mode) */}
        {mode !== 'reset' && (
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
        )}

        {/* Main Action Button */}
        <Button
          variant="contained"
          onClick={mode === 'reset' ? handlePasswordReset : handleEmailPasswordAuth}
          disabled={isLoading}
          fullWidth
          startIcon={
            mode === 'signup' ? <PersonAdd /> :
            mode === 'reset' ? <Email /> :
            <LoginIcon />
          }
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
              {mode === 'reset' ? 'Sending...' : 'Authenticating...'}
            </Box>
          ) : (
            mode === 'signup' ? 'Create Account' :
            mode === 'reset' ? 'Send Reset Email' :
            'Access Building'
          )}
        </Button>

        {/* Mode Toggle Links */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          {mode === 'login' && (
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                Don't have an account?{' '}
                <Link
                  component="button"
                  onClick={() => setMode('signup')}
                  sx={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
                >
                  Sign up
                </Link>
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                Forgot your password?{' '}
                <Link
                  component="button"
                  onClick={() => setMode('reset')}
                  sx={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
                >
                  Reset it
                </Link>
              </Typography>
            </Stack>
          )}

          {mode === 'signup' && (
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              Already have an account?{' '}
              <Link
                component="button"
                onClick={() => setMode('login')}
                sx={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign in
              </Link>
            </Typography>
          )}

          {mode === 'reset' && (
            <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
              Remember your password?{' '}
              <Link
                component="button"
                onClick={() => setMode('login')}
                sx={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
              >
                Back to login
              </Link>
            </Typography>
          )}
        </Box>

        <Typography
          align="center"
          sx={{
            mt: 4,
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
