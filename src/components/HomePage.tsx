import { Box, Button, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';
import { Logout, Business } from '@mui/icons-material';

type Page = 'home' | 'floor';

interface HomePageProps {
  onNavigate: (page: Page, floor?: number) => void;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onLogout }) => {
  const [showClouds, setShowClouds] = useState(true);
  const [showGround, setShowGround] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const floors = [19, 18, 17, 16, 15, 14, 12, 11, 10, 9, 8, 7, 6, 5, 3, 2, 1];

  const handleFloorClick = (floor: number) => onNavigate('floor', floor);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      setShowClouds(scrollPercentage < 0.05);
      setShowGround(scrollPercentage > 0.95);
    }
  };

  // Mount scroll listener once
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Mount global keyframes once (prevents animation restarts)
  useEffect(() => {
    const animationStyles = `
      @keyframes cloudFloat0 { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-8px) translateX(15px); } }
      @keyframes cloudFloat1 { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-12px) translateX(20px); } }
      @keyframes cloudFloat2 { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-6px) translateX(10px); } }

      @keyframes particle0 { 0%,100% { transform: translateY(0) scale(1); opacity: .6; } 50% { transform: translateY(-15px) scale(1.2); opacity: .3; } }
      @keyframes particle1 { 0%,100% { transform: translateY(0) scale(1); opacity: .4; } 50% { transform: translateY(-20px) scale(.8); opacity: .8; } }
      @keyframes particle2 { 0%,100% { transform: translateY(0) scale(1); opacity: .7; } 50% { transform: translateY(-10px) scale(1.1); opacity: .2; } }

      @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
      @keyframes glow { 0%,100% { box-shadow:0 0 5px rgba(250,204,21,.5); } 50% { box-shadow:0 0 20px rgba(250,204,21,.8), 0 0 30px rgba(250,204,21,.4); } }
      @keyframes sway { 0% { transform: rotate(-2deg); } 100% { transform: rotate(2deg); } }
      @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.2); } }

      /* Walking animations */
      @keyframes walkPerson1 { 0% { right: -50px; } 100% { right: 50%; } }
      @keyframes walkPerson2 { 0% { right: -50px; } 100% { right: 40%; } }
      @keyframes walkPersonWithDog { 0% { right: -50px; } 100% { right: 45%; } }
    `;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-homepage-animations', '1');
    styleEl.textContent = animationStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const ModernCloud = ({ left, size = 1, delay = 0 }: { left: string; size?: number; delay?: number }) => (
    <Box
      sx={{
        position: 'absolute',
        left,
        top: `${10 + Math.sin(delay) * 5}px`,
        width: `${60 * size}px`,
        height: `${30 * size}px`,
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '50px',
        opacity: 0.7,
        animation: `cloudFloat${delay} ${4 + delay}s ease-in-out infinite alternate`,
        zIndex: 1,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          backgroundColor: 'inherit',
          borderRadius: '50%',
        },
        '&::before': {
          width: `${40 * size}px`,
          height: `${40 * size}px`,
          top: `${-20 * size}px`,
          left: `${10 * size}px`,
        },
        '&::after': {
          width: `${50 * size}px`,
          height: `${50 * size}px`,
          top: `${-25 * size}px`,
          left: `${25 * size}px`,
        },
      }}
    />
  );

  const FloatingParticle = ({ left, top, delay }: { left: string; top: string; delay: number }) => (
    <Box
      sx={{
        position: 'absolute',
        left,
        top,
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
        opacity: 0.6,
        animation: `particle${delay} ${3 + delay}s ease-in-out infinite`,
      }}
    />
  );

  // Memoized walkers so parent re-renders don't remount them
  const WalkingPerson = React.memo(function WalkingPerson({
    delay,
    speed,
    emoji,
    animationName,
    small,
  }: {
    delay: number;
    speed: number;
    emoji: string;
    animationName: string;
    small: boolean;
  }) {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 10,
          right: '-50px',
          fontSize: small ? 24 : 28,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          animation: `${animationName} ${speed}s linear ${delay}s infinite`,
          zIndex: 2,
        }}
      >
        {emoji}
      </Box>
    );
  });

  const PersonWalkingDog = React.memo(function PersonWalkingDog({
    delay,
    speed,
    person,
    dog,
    animationName,
    small,
  }: {
    delay: number;
    speed: number;
    person: string;
    dog: string;
    animationName: string;
    small: boolean;
  }) {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 4,
          right: '-50px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0px',
          fontSize: small ? 20 : 24,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          animation: `${animationName} ${speed}s linear ${delay}s infinite`,
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: small ? 24 : 28 }}>{person}</span>
        <span style={{ fontSize: small ? 18 : 22 }}>{dog}</span>
      </Box>
    );
  });

  const WalkingLayer = React.memo(function WalkingLayer({
    small,
    medium,
  }: {
    small: boolean;
    medium: boolean;
  }) {
    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to top, #065f46 0%, #047857 50%, transparent 100%)',
          zIndex: 0,
        }}
      >
        {/* Walkers */}
        <WalkingPerson delay={0} speed={16} emoji="🚶‍♂️" animationName="walkPerson1" small={small} />
        <WalkingPerson delay={6} speed={20} emoji="🚶‍♀️" animationName="walkPerson2" small={small} />
        <PersonWalkingDog delay={2} speed={22} person="🚶‍♂️" dog="🐕" animationName="walkPersonWithDog" small={small} />

        {/* Trees */}
        {small ? (
          <>
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                left: -30,
                fontSize: 90,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'sway 2.5s ease-in-out infinite alternate-reverse',
              }}
            >
              🌳
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: -50,
                fontSize: 90,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'sway 3s ease-in-out infinite alternate',
              }}
            >
              🌲
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                left: medium ? 10 : 80,
                fontSize: 130,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'sway 2.5s ease-in-out infinite alternate-reverse',
              }}
            >
              🌳
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: medium ? -30 : 30,
                fontSize: 130,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'sway 3s ease-in-out infinite alternate',
              }}
            >
              🌲
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                right: medium ? -30 : 50,
                fontSize: 130,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                animation: 'sway 2.5s ease-in-out infinite alternate-reverse',
              }}
            >
              🌳
            </Box>
          </>
        )}
      </Box>
    );
  });

  return (
    <>
      <Box
        sx={{
          height: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
          px: { xs: 1, sm: 1, md: 2 },
          py: { xs: 1, sm: 1 },
          position: 'relative',
          overflow: 'hidden',
          overscrollBehavior: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Floating particles */}
        <FloatingParticle left="10%" top="20%" delay={0} />
        <FloatingParticle left="85%" top="15%" delay={1} />
        <FloatingParticle left="70%" top="80%" delay={2} />

        <Container
          maxWidth="lg"
          disableGutters
          sx={{
            position: 'relative',
            background: 'linear-gradient(180deg, #0be4fcff 0%, #172695ff 100%)',
            borderRadius: 4,
            boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            p: { xs: 3, sm: 4, md: 5 },
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Header with logout */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 16, sm: 20 },
              left: { xs: 16, sm: 20 },
              right: { xs: 16, sm: 20 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business sx={{ color: '#4f46e5', fontSize: { xs: 24, sm: 28 } }} />
              <Typography
                sx={{
                  fontSize: { xs: 18, sm: 22 },
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Building 9188
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={onLogout}
              startIcon={<Logout sx={{ fontSize: '16px !important' }} />}
              sx={{
                textTransform: 'none',
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2.5 },
                fontSize: { xs: 12, sm: 14 },
                borderRadius: 2,
                borderColor: '#e5e7eb',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#4f46e5',
                  backgroundColor: '#f0f9ff',
                  color: '#4f46e5',
                },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Clouds */}
          {showClouds && (
            <Box sx={{ position: 'absolute', top: 60, left: 0, right: 0, height: 100, zIndex: 1 }}>
              <ModernCloud left="15%" size={isSmallScreen ? 1 : 1.5} delay={0} />
              {!isSmallScreen && (
                <>
                  <ModernCloud left="45%" size={1} delay={1} />
                  <ModernCloud left="75%" size={1.5} delay={2} />
                </>
              )}
            </Box>
          )}

          <Typography
            component="h1"
            align="center"
            sx={{
              position: 'relative',
              zIndex: 5,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: { xs: 3, sm: 4 },
              mt: { xs: 6, sm: 8 },
              fontSize: 'clamp(24px, 5vw, 42px)',
              letterSpacing: '-0.025em',
            }}
          >
            Choose Your Floor
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Modern Building */}
            <Box
              sx={{
                width: { xs: 320, sm: 380, md: 450 },
                height: { xs: '70vh', sm: '70vh', md: '70vh' },
                position: 'relative',
                background: 'linear-gradient(180deg, #1e40af 0%, #1e3a8a 50%, #1e293b 100%)',
                borderRadius: '20px 20px 4px 4px',
                clipPath: 'polygon(0% 15%, 50% 0%, 100% 15%, 100% 100%, 0% 100%)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                mx: 'auto',
                overflow: 'hidden',
              }}
            >
              {/* Building accent lights */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 2,
                  height: '15%',
                  background: 'linear-gradient(to bottom, #f59e0b, transparent)',
                  borderRadius: '0 0 2px 2px',
                }}
              />

              <Box
                ref={scrollRef}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 0.5,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)', borderRadius: '3px' },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '3px',
                    '&:hover': { background: 'rgba(255,255,255,0.5)' },
                  },
                }}
              >
                {/* General Discussion - Rooftop */}
                <Box
                  onClick={() => onNavigate('floor', 999)}
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    width: '100%',
                    height: { xs: '10vh', sm: '10vh' },
                    background: 'linear-gradient(135deg, #e66438ff 0%, #522408ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: { xs: 14, sm: 16, md: 18 },
                    fontWeight: 600,
                    color: 'white',
                    transition: 'all 0.3s ease',
                    clipPath: 'polygon(15% 15%, 50% 0%, 85% 15%, 100% 100%, 0% 100%)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e12323ff 0%, #6d1212ff 100%)',
                      boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
                      transform: 'scale(1.02)',
                    },
                    '&:hover::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                      animation: 'shimmer 2s infinite',
                    },
                  }}
                >
                  <Box component="span" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', pt: { xs: 5, sm: 5 } }}>
                    🏢 General Discussion
                  </Box>
                </Box>

                {/* Floor levels */}
                {floors.map((floorNum, index) => (
                  <Box
                    key={floorNum}
                    onClick={() => handleFloorClick(floorNum)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: { xs: 2, sm: 3, md: 4 },
                      py: { xs: 1, sm: 1.5 },
                      height: { xs: 50, sm: 60, md: 65 },
                      mt: index === 0 ? 2 : 1,
                      mb: index === floors.length - 1 ? 3 : 0,
                      cursor: 'pointer',
                      borderRadius: 2,
                      mx: 2,
                      transition: 'transform 0.3s ease, background-color 0.3s ease',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        transform: 'translateX(4px)',
                      },
                      /* When the row is hovered, style child windows and dots */
                      '&:hover .window': {
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        borderColor: '#d97706',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)',
                        animation: 'glow 2s ease-in-out infinite',
                      },
                      '&:hover .window::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                        animation: 'shimmer 1.5s infinite',
                      },
                      '&:hover .floorLabel': {
                        color: '#8882ffff',
                        fontWeight: 700,
                      },
                      '&:hover .pulseDot': {
                        animation: 'pulse 1s infinite',
                        backgroundColor: 'rgba(195, 192, 255, 1)',
                      },
                    }}
                  >
                    {/* Windows */}
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 } }}>
                      {[1, 2, 3].map((windowIndex) => (
                        <Box
                          key={windowIndex}
                          className="window"
                          sx={{
                            position: 'relative',
                            width: { xs: 45, sm: 55, md: 65 },
                            height: { xs: 28, sm: 35, md: 40 },
                            background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                            borderRadius: 1,
                            border: '2px solid #9ca3af',
                            transition: 'all 0.3s ease',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Window cross bars */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: 0,
                              width: '100%',
                              height: 1.5,
                              bgcolor: '#6b7280',
                              transform: 'translateY(-50%)',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              top: 0,
                              width: 1.5,
                              height: '100%',
                              bgcolor: '#6b7280',
                              transform: 'translateX(-50%)',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                        </Box>
                      ))}
                    </Box>

                    {/* Floor label */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        className="floorLabel"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: { xs: 14, sm: 16, md: 18 },
                          fontWeight: 500,
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Floor {floorNum}
                      </Typography>
                      <Box
                        className="pulseDot"
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'transparent',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Ground level with walking people & trees */}
          {showGround && <WalkingLayer small={isSmallScreen} medium={isMediumScreen} />}
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
