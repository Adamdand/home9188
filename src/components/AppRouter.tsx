import React, { useState } from 'react';
import { Box } from '@mui/material';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import FloorCommentPage from './FloorCommentPage';
import AddCommentPage from './AddCommentPage';

export type Page = 'login' | 'home' | 'floor' | 'addComment';

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  floor: number;
}

const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigateToPage = (page: Page, floor?: number) => {
    // If floor can be 0 or 999 etc., don’t rely on truthiness:
    if (typeof floor === 'number') setSelectedFloor(floor);

    // Release any focused input so iOS can reset zoom
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Optional: snap back to top to avoid residual scroll offsets
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      {currentPage === 'home' && isLoggedIn && (
        <HomePage 
          onNavigate={navigateToPage}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'floor' && isLoggedIn && (
        <FloorCommentPage 
          floor={selectedFloor}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === 'addComment' && isLoggedIn && (
        <AddCommentPage 
          floor={selectedFloor}
          onNavigate={navigateToPage}
        />
      )}
    </Box>
  );
};

export default AppRouter;