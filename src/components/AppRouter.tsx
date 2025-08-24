import React, { useState } from 'react';
import { Box } from '@mui/material';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import FloorCommentPage from './FloorCommentPage';
import AddCommentPage from './AddCommentPage';
import AccountPage from "./AccountPage";
import { User } from 'firebase/auth';

export type Page = 'login' | 'home' | 'floor' | 'addComment' | 'account';

const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);

  const navigateToPage = (page: Page, floor?: number) => {
    if (typeof floor === 'number') setSelectedFloor(floor);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    setCurrentPage(page);
  };

  const handleLogin = (firebaseUser: User) => {
    setUser(firebaseUser); 
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      {currentPage === 'home' && user && (
        <HomePage 
          onNavigate={navigateToPage}
          onLogout={handleLogout}
          user={user} 
        />
      )}
      {currentPage === 'floor' && user && (
        <FloorCommentPage 
          floor={selectedFloor}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === 'addComment' && user && (
        <AddCommentPage 
          floor={selectedFloor}
          onNavigate={navigateToPage}
        />
      )}
      {currentPage === "account" && user && (
        <AccountPage user={user} onNavigate={navigateToPage} />
      )}
    </Box>
  );
};

export default AppRouter;
