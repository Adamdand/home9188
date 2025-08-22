import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Page } from './AppRouter';
import { Box, Button, Container, Stack, TextField, Typography, Avatar, Chip, Alert } from '@mui/material';
import { Home, ArrowBack, Send, Person, Edit, AccessTime } from '@mui/icons-material';
import { getAuth } from 'firebase/auth';

interface AddCommentPageProps {
  floor: number;
  onNavigate: (page: Page, floor?: number) => void;
}

const AddCommentPage: React.FC<AddCommentPageProps> = ({ floor, onNavigate }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const floorTitle = floor === 999 ? 'General Building Discussion' : `Floor ${floor}`;

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('You must be logged in to post a comment');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'comments'), {
        text: comment.trim(),
        floor,
        timestamp: serverTimestamp(),
        userId: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split('@')[0] || 'Anonymous'
      });

      onNavigate('floor', floor);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to submit comment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setComment('');
    onNavigate('floor', floor);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { date, time } = getCurrentDateTime();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 40%, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container
        maxWidth="md"
        disableGutters
        sx={{
          position: 'relative',
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            p: { xs: 2.5, sm: 3 },
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={() => onNavigate('home')}
              startIcon={<Home sx={{ fontSize: '16px !important' }} />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: 12, sm: 14 },
                fontWeight: 500,
                zIndex: 100,
                position: 'relative',
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Building
            </Button>

            <Button
              variant="contained"
              onClick={handleCancel}
              startIcon={<ArrowBack sx={{ fontSize: '16px !important' }} />}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: 12, sm: 14 },
                fontWeight: 500,
                zIndex: 100,
                position: 'relative',
                pointerEvents: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Back to {floor === 999 ? 'General' : `Floor ${floor}`}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              }}
            >
              <Edit sx={{ fontSize: { xs: 22, sm: 26 }, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: 'clamp(18px, 4vw, 28px)',
                  fontWeight: 800,
                  color: 'white',
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                New Message
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 12, sm: 14 },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                }}
              >
                Share with {floorTitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, sm: 3 },
            backgroundColor: '#f8fafc',
          }}
        >
          {/* Message Preview Card */}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              mb: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* Preview Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                pb: 1.5,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                    color: 'white',
                  }}
                >
                  <Person sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      fontWeight: 600,
                      color: '#374151',
                      lineHeight: 1.2,
                    }}
                  >
                    You (Anonymous)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 12, color: '#9ca3af' }} />
                    <Typography
                      sx={{
                        fontSize: { xs: 11, sm: 12 },
                        color: '#9ca3af',
                        fontWeight: 500,
                      }}
                    >
                      {time}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Chip
                label={date}
                size="small"
                sx={{
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontSize: { xs: 10, sm: 11 },
                  fontWeight: 500,
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '2px solid #e2e8f0',
                position: 'relative',
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  borderColor: '#4f46e5',
                  boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
                },
              }}
            >
              <TextField
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What's on your mind? Share with your neighbors..."
                disabled={isSubmitting}
                multiline
                fullWidth
                minRows={8}
                maxRows={12}
                sx={{
                  '& .MuiInputBase-root': {
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: { xs: 14, sm: 16 },
                    lineHeight: 1.6,
                    p: { xs: 1.5, sm: 2 },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '& textarea::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                  },
                }}
              />
              
              {/* Character count */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  fontSize: 11,
                  color: comment.length > 500 ? '#dc2626' : '#9ca3af',
                  fontWeight: 500,
                }}
              >
                {comment.length}/1000
              </Box>
            </Box>

            {/* Message Guidelines */}
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12 },
                  color: '#6b7280',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                💡 Community Guidelines:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {['Be respectful', 'Stay on topic', 'Keep it neighborly'].map((guideline) => (
                  <Chip
                    key={guideline}
                    label={guideline}
                    size="small"
                    sx={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      fontSize: 10,
                      height: 20,
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: { xs: 13, sm: 14 },
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              fullWidth
              sx={{
                borderRadius: 2,
                py: { xs: 1.2, sm: 1.4 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: 14, sm: 16 },
                fontWeight: 600,
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                color: '#6b7280',
                textTransform: 'none',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || !comment.trim()}
              fullWidth
              startIcon={isSubmitting ? (
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
              ) : (
                <Send sx={{ fontSize: '18px !important' }} />
              )}
              sx={{
                borderRadius: 2,
                py: { xs: 1.2, sm: 1.4 },
                px: { xs: 2, sm: 3 },
                fontSize: { xs: 14, sm: 16 },
                fontWeight: 600,
                background: (!comment.trim() || isSubmitting) 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                textTransform: 'none',
                boxShadow: (!comment.trim() || isSubmitting)
                  ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 4px 12px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: (!comment.trim() || isSubmitting)
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                  boxShadow: (!comment.trim() || isSubmitting)
                    ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                    : '0 6px 16px rgba(79, 70, 229, 0.5)',
                  transform: (!comment.trim() || isSubmitting) ? 'none' : 'translateY(-1px)',
                },
                '&:disabled': {
                  color: '#ffffff',
                },
              }}
            >
              {isSubmitting ? 'Posting Message...' : 'Post to Community'}
            </Button>
          </Stack>
        </Box>

        {/* Footer with community info */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 11, sm: 12 },
              color: '#64748b',
              fontWeight: 500,
              mb: 1,
            }}
          >
            Your message will be visible to all residents in {floorTitle}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 10, sm: 11 },
                color: '#10b981',
                fontWeight: 600,
              }}
            >
              Anonymous & Secure
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AddCommentPage;