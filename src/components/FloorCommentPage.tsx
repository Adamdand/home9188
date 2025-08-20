import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Page } from './AppRouter';
import { Box, Button, Container, Typography, Avatar, Chip, Fade } from '@mui/material';
import { Home, Add, Forum, AccessTime, People, ChatBubbleOutline, Person, ArrowDownward } from '@mui/icons-material';

interface Comment {
  id: string;
  text: string;
  timestamp: any;
  floor: number;
}

interface FloorCommentPageProps {
  floor: number;
  onNavigate: (page: Page, floor?: number) => void;
}

const FloorCommentPage: React.FC<FloorCommentPageProps> = ({ floor, onNavigate }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animateComments, setAnimateComments] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Function to check if user is at bottom
  const checkIfAtBottom = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const threshold = 20; // Increased threshold for better detection
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
      const shouldShow = !isAtBottom && scrollHeight > clientHeight;
      setShowJumpToBottom(shouldShow);
    }
  };

  // Handle scroll events with throttling
  const handleScroll = () => {
    requestAnimationFrame(checkIfAtBottom);
  };

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('floor', '==', floor),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Comment)
        );
        setComments(data.reverse());
        setIsLoading(false);
        setAnimateComments(true);
        
        // Scroll to bottom after comments are loaded
        setTimeout(() => {
          scrollToBottom();
          // Check scroll position after scrolling
          setTimeout(checkIfAtBottom, 100);
        }, 100);
      },
      () => {
        // fallback mock data
        setComments([
          {
            id: '1',
            text: 'Hi guys, anyone else hear any loud noises? Is there construction going on?',
            timestamp: new Date('2025-08-08'),
            floor: 3
          },
          {
            id: '2',
            text: 'What is going on with all of the fire alarm today?',
            timestamp: new Date('2025-01-01'),
            floor: 3
          },
          {
            id: '3',
            text: 'Yeah, I have been hearing the fire alarms all day as well. I dont know... Has anyone reached out to management yet?',
            timestamp: new Date('2025-01-01'),
            floor: 3
          },
          {
            id: '4',
            text: 'Hi everyone, I just moved in! Looking forward to meeting everyone.',
            timestamp: new Date('2025-07-30'),
            floor: 3
          }
        ].filter((c) => c.floor === floor));
        setIsLoading(false);
        setAnimateComments(true);
        
        // Scroll to bottom after mock data is loaded
        setTimeout(() => {
          scrollToBottom();
          // Check scroll position after scrolling
          setTimeout(checkIfAtBottom, 100);
        }, 100);
      }
    );
    return () => unsub();
  }, [floor]);

  // Scroll to bottom when component first mounts
  useEffect(() => {
    if (!isLoading && comments.length > 0) {
      setTimeout(() => {
        scrollToBottom();
        // Initial check after scrolling to bottom
        setTimeout(checkIfAtBottom, 100);
      }, 200);
    }
  }, [isLoading, comments.length]);

  const formatDate = (timestamp: any) => {
    let date: Date;
    if (timestamp?.toDate) date = timestamp.toDate();
    else if (timestamp instanceof Date) date = timestamp;
    else date = new Date(timestamp);
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTimeOnly = (timestamp: any) => {
    let date: Date;
    if (timestamp?.toDate) date = timestamp.toDate();
    else if (timestamp instanceof Date) date = timestamp;
    else date = new Date(timestamp);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const floorTitle = floor === 999 ? 'General Building Discussion' : `Floor ${floor} Community`;
  const floorIcon = floor === 999 ? <Forum /> : <People />;

  return (
    <Box
      sx={{
        // minHeight: '120dvh',
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
          background: 'radial-gradient(circle at 70% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
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
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
            minHeight: {xs: '130px', sm:'150px', md: '180px'},
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
              Back to Building
            </Button>

            <Chip
              icon={floorIcon}
              label={`${comments.length} messages`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: { xs: 11, sm: 12 },
                '& .MuiChip-icon': {
                  color: 'white',
                  fontSize: '16px !important',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                fontSize: { xs: 18, sm: 22 },
              }}
            >
              {floor === 999 ? '🏢' : floorIcon}
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
                {floorTitle}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 12, sm: 14 },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                }}
              >
                Connect with your neighbors
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Comments Area */}
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
          }}
        >
          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              p: { xs: 2, sm: 3 },
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.05)', borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)', borderRadius: '3px',
                '&:hover': { background: 'rgba(0,0,0,0.3)' },
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #4f46e5',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }}
                />
                <Typography sx={{ color: '#6b7280', fontSize: 16 }}>
                  Loading conversations...
                </Typography>
              </Box>
            ) : comments.length === 0 ? (
              <>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  flex: 1,
                }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <ChatBubbleOutline sx={{ fontSize: 32, color: '#6366f1' }} />
                  </Box>
                  <Typography sx={{ 
                    color: '#374151', 
                    fontSize: { xs: 16, sm: 18 },
                    fontWeight: 600,
                    mb: 1,
                  }}>
                    No conversations yet
                  </Typography>
                  <Typography sx={{ 
                    color: '#6b7280', 
                    fontSize: { xs: 14, sm: 16 },
                    maxWidth: 300,
                    lineHeight: 1.5,
                  }}>
                    Be the first to start a conversation with your neighbors on this floor!
                  </Typography>
                </Box>
                
                {/* Add Comment Button for empty state */}
                <Box sx={{ mt: 'auto', pb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => onNavigate('addComment', floor)}
                    startIcon={<Add sx={{ fontSize: '18px !important' }} />}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      py: { xs: 1.2, sm: 1.5 },
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
                        borderColor: '#4f46e5',
                        backgroundColor: '#f0f9ff',
                        color: '#4f46e5',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
                      },
                    }}
                  >
                    Start a new conversation...
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {comments.map((comment, index) => (
                    <Fade 
                      key={comment.id} 
                      in={animateComments} 
                      timeout={300 + index * 100}
                      style={{ transitionDelay: animateComments ? `${index * 50}ms` : '0ms' }}
                    >
                      <Box
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 3,
                          p: { xs: 2, sm: 2.5 },
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06)',
                          border: '1px solid #f1f5f9',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        {/* Comment Header */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
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
                                 Neighbor #Anonymous
                                {/* Neighbor #{comment.id.slice(-4).toUpperCase()} */}
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
                                  {getTimeOnly(comment.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <Chip
                            label={formatDate(comment.timestamp)}
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

                        {/* Comment Content */}
                        <Box
                          sx={{
                            backgroundColor: '#f8fafc',
                            borderRadius: 2,
                            p: { xs: 1.5, sm: 2 },
                            border: '1px solid #e2e8f0',
                            position: 'relative',
                            textAlign: 'left',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: 14, sm: 16 },
                              lineHeight: 1.6,
                              color: '#374151',
                              whiteSpace: 'pre-wrap',
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {comment.text}
                          </Typography>
                        </Box>
                         <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 3,
                              background: `linear-gradient(180deg, #06b6d4, #047e9dff)`,
                                // ${index % 3 === 0 ? '#8b5cf6, #a855f7' : 
                                //   index % 3 === 1 ? '#06b6d4, #0891b2' : 
                                //   '#10b981, #059669'})`,
                              borderRadius: '0 3px 3px 0',
                            }}
                          />
                      </Box>
                    </Fade>
                  ))}
                </Box>

                {/* Add Comment Button at bottom of comments */}
                <Box sx={{ mt: 3, pb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => onNavigate('addComment', floor)}
                    startIcon={<Add sx={{ fontSize: '18px !important' }} />}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      py: { xs: 1.2, sm: 1.5 },
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
                        borderColor: '#4f46e5',
                        backgroundColor: '#f0f9ff',
                        color: '#4f46e5',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
                      },
                    }}
                  >
                    Start a new conversation...
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Jump to Bottom Button */}
        {showJumpToBottom && (
          <Fade in={showJumpToBottom} timeout={200}>
            <Box
              sx={{
                position: 'fixed',
                bottom: { xs: 10, sm: 20 },
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999,
                pointerEvents: 'auto',
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  scrollToBottom();
                  setTimeout(checkIfAtBottom, 100);
                }}
                startIcon={<ArrowDownward sx={{ fontSize: '20px !important' }} />}
                sx={{
                  backgroundColor: 'rgba(79, 70, 229, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: 3,
                  py: { xs: 1, sm: 1.2 },
                  px: { xs: 2.5, sm: 3 },
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.2s ease',
                  minHeight: { xs: 40, sm: 44 },
                  '& .MuiButton-startIcon': {
                    marginRight: 1,
                    marginLeft: 0,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(67, 56, 202, 0.95)',
                    // transform: 'translate(-50%, -1px)',
                    boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4), 0 3px 8px rgba(0, 0, 0, 0.2)',
                  },
                  // '&:active': {
                  //   transform: 'translate(0%, -50px)',
                  // },
                }}
              >
                Jump to newest messages
              </Button>
            </Box>
          </Fade>
        )}

        {/* Floating Action Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 10, sm: 15 },
            right: { xs: 10, sm: 15 },
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            onClick={() => onNavigate('addComment', floor)}
            sx={{
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              borderRadius: '50%',
              minWidth: 'unset',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                boxShadow: '0 12px 35px rgba(79, 70, 229, 0.5), 0 6px 16px rgba(0, 0, 0, 0.2)',
                transform: 'translateY(-2px) scale(1.05)',
              },
              '&:active': {
                transform: 'translateY(0px) scale(0.98)',
              },
            }}
          >
            <Add sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FloorCommentPage;